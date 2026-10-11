import { Env } from '../index';

export interface CreateSharePayload {
  conversationId: string;
  password?: string;
  expiresInHours?: number; // e.g. 24, 72, or null/undefined for persistent
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export async function handleCreateShare(request: Request, env: any, user: { id: string }): Promise<Response> {
  const payload = await request.json() as CreateSharePayload;
  const shareId = crypto.randomUUID();

  // 1. Fetch current conversation messages up to this exact moment
  const messagesResult = await env.DB.prepare(`
    SELECT id, role, content, citations, created_at
    FROM conversation_messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `).bind(payload.conversationId).all();

  const convMeta = await env.DB.prepare(`
    SELECT title FROM conversations WHERE id = ? AND user_id = ?
  `).bind(payload.conversationId, user.id).first() as { title: string } | null;

  if (!convMeta) {
    return new Response(JSON.stringify({ error: "Conversation not found or unauthorized" }), { status: 404 });
  }

  // 2. Calculate Expiration
  let expiresAt: string | null = null;
  let kvTtlSeconds: number | undefined = undefined;
  if (payload.expiresInHours && payload.expiresInHours > 0) {
    const expDate = new Date(Date.now() + payload.expiresInHours * 3600 * 1000);
    expiresAt = expDate.toISOString();
    kvTtlSeconds = payload.expiresInHours * 3600;
  }

  // 3. Handle optional password protection in Cloudflare KV
  const hasPassword = Boolean(payload.password && payload.password.trim().length > 0);
  if (hasPassword) {
    // Hash password with SHA-256 before storing in KV
    const msgBuffer = new TextEncoder().encode(payload.password!);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    // Store in KV with expiration to prevent scraping
    await env.API_CACHE_KV.put(`share_pwd:${shareId}`, hashHex, {
      expirationTtl: kvTtlSeconds || 2592000 // 30 days default or custom
    });
  }

  // 4. Save frozen snapshot in D1
  await env.DB.prepare(`
    INSERT INTO shared_conversations (
      share_id, original_conversation_id, owner_user_id, title,
      snapshot_messages, has_password, expires_at,
      utm_source, utm_medium, utm_campaign
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    shareId,
    payload.conversationId,
    user.id,
    convMeta.title,
    JSON.stringify(messagesResult.results),
    hasPassword ? 1 : 0,
    expiresAt,
    payload.utmSource || 'share_link',
    payload.utmMedium || 'social',
    payload.utmCampaign || 'civic_chat'
  ).run();

  // 5. Generate share URL with UTM parameters
  const shareUrl = new URL(`https://congresswatch.org/share/${shareId}`);
  shareUrl.searchParams.set("utm_source", payload.utmSource || "share_link");
  shareUrl.searchParams.set("utm_medium", payload.utmMedium || "social");
  shareUrl.searchParams.set("utm_campaign", payload.utmCampaign || "civic_chat");

  return new Response(JSON.stringify({
    shareId,
    shareUrl: shareUrl.toString(),
    hasPassword,
    expiresAt
  }), { headers: { "Content-Type": "application/json" } });
}

export async function handleViewShare(request: Request, env: any, shareId: string): Promise<Response> {
  const shareRecord = await env.DB.prepare(`
    SELECT * FROM shared_conversations WHERE share_id = ?
  `).bind(shareId).first() as any;

  if (!shareRecord) {
    return new Response(JSON.stringify({ error: "Shared chat not found or expired" }), { status: 404 });
  }

  // Check Expiration
  if (shareRecord.expires_at && new Date(shareRecord.expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: "This shared conversation has expired." }), { status: 410 });
  }

  // Check Password Authentication
  if (shareRecord.has_password) {
    const providedPwd = request.headers.get("X-Share-Password");
    if (!providedPwd) {
      return new Response(JSON.stringify({
        requiresPassword: true,
        title: shareRecord.title
      }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const storedHash = await env.API_CACHE_KV.get(`share_pwd:${shareId}`);
    const inputBuffer = new TextEncoder().encode(providedPwd);
    const inputHashBuffer = await crypto.subtle.digest("SHA-256", inputBuffer);
    const inputHashHex = Array.from(new Uint8Array(inputHashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    if (inputHashHex !== storedHash) {
      return new Response(JSON.stringify({ error: "Incorrect password" }), { status: 403 });
    }
  }

  // Increment view count
  await env.DB.prepare("UPDATE shared_conversations SET view_count = view_count + 1 WHERE share_id = ?").bind(shareId).run();

  return new Response(JSON.stringify({
    shareId: shareRecord.share_id,
    title: shareRecord.title,
    messages: JSON.parse(shareRecord.snapshot_messages),
    createdAt: shareRecord.created_at,
    expiresAt: shareRecord.expires_at
  }), { headers: { "Content-Type": "application/json" } });
}

