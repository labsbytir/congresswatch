import { RateLimiterDO } from './durable-objects/RateLimiterDO';
import { handleCreateShare, handleViewShare } from './routes/share-chat';

export interface Env {
  DB: D1Database;
  WATCHERS_BUCKET: R2Bucket;
  VECTORIZE_INDEX: VectorizeIndex;
  AI: Ai;
  API_CACHE_KV: KVNamespace;
  RATE_LIMITER: DurableObjectNamespace;
  ASSETS: Fetcher;

  // Environment variables
  TOGETHER_API_KEY?: string;
  CONGRESS_API_KEY?: string;
  ENVIRONMENT?: string;
  ORAMA_SEARCH_ENDPOINT?: string;
}

// Export the Durable Object class for Cloudflare Workers runtime
export { RateLimiterDO };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. CORS Headers for API requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Share-Password, X-API-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Health & Status
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        platform: 'Cloudflare Workers (V8 Edge)',
        version: '0.1.0',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Members of Congress API (/api/members)
    if (url.pathname === '/api/members' && request.method === 'GET') {
      const chamber = url.searchParams.get('chamber'); // house | senate
      const party = url.searchParams.get('party'); // Democrat | Republican
      const search = url.searchParams.get('q');

      let query = 'SELECT * FROM members WHERE 1=1';
      const params: any[] = [];

      if (chamber) {
        query += ' AND chamber = ?';
        params.push(chamber);
      }
      if (party) {
        query += ' AND party = ?';
        params.push(party);
      }
      if (search) {
        query += ' AND (first_name LIKE ? OR last_name LIKE ? OR state LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      query += ' ORDER BY last_name ASC LIMIT 50';

      const results = await env.DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results.results), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
        }
      });
    }

    // 4. Bills & Legislation API (/api/bills)
    if (url.pathname === '/api/bills' && request.method === 'GET') {
      const status = url.searchParams.get('status');
      const search = url.searchParams.get('q');

      let query = 'SELECT * FROM bills WHERE 1=1';
      const params: any[] = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      if (search) {
        query += ' AND (title LIKE ? OR id LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term);
      }
      query += ' ORDER BY introduced_date DESC LIMIT 50';

      const results = await env.DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results.results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
      });
    }

    // 5. Congressional Stock Trades API (/api/trades)
    if (url.pathname === '/api/trades' && request.method === 'GET') {
      const ticker = url.searchParams.get('ticker');
      const bioguideId = url.searchParams.get('member');

      let query = `
        SELECT t.*, m.first_name, m.last_name, m.party, m.state
        FROM congressional_trades t
        JOIN members m ON t.bioguide_id = m.bioguide_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (ticker) {
        query += ' AND t.ticker = ?';
        params.push(ticker.toUpperCase());
      }
      if (bioguideId) {
        query += ' AND t.bioguide_id = ?';
        params.push(bioguideId);
      }
      query += ' ORDER BY t.transaction_date DESC LIMIT 50';

      const results = await env.DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results.results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' }
      });
    }

    // 6. SAM.gov Procurement Solicitations API (/api/procurement)
    if (url.pathname === '/api/procurement' && request.method === 'GET') {
      const billId = url.searchParams.get('billId');
      const dept = url.searchParams.get('department');

      let query = 'SELECT * FROM sam_procurement_opportunities WHERE 1=1';
      const params: any[] = [];

      if (billId) {
        query += ' AND linked_bill_id = ?';
        params.push(billId);
      }
      if (dept) {
        query += ' AND department_name LIKE ?';
        params.push(`%${dept}%`);
      }
      query += ' ORDER BY posted_date DESC LIMIT 50';

      const results = await env.DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results.results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' }
      });
    }

    // 7. Smart+ Conversational AI Search (Together AI Llama 3.3 70B + Vectorize)
    if (url.pathname === '/api/search/smart' && request.method === 'POST') {
      try {
        const body = await request.json() as { query: string; history?: any[] };
        const userQuery = body.query;

        // A. Embed query with Workers AI
        let queryVector: number[] = [];
        try {
          const emb = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [userQuery] }) as any;
          queryVector = emb?.data?.[0] || [];
        } catch (e) {
          console.warn('Embedding generation skipped or unavailable:', e);
        }

        // B. Query Vectorize Index for relevant bill and hearing chunks
        let contextChunks = '';
        if (queryVector.length > 0) {
          try {
            const matches = await env.VECTORIZE_INDEX.query(queryVector, { topK: 4, returnMetadata: true });
            contextChunks = matches.matches
              .map((m: any, i: number) => `[Source ${i + 1} - ${m.metadata?.bill_id || 'CongressRecord'}]: ${m.metadata?.text || ''}`)
              .join('\n\n');
          } catch (e) {
            console.warn('Vectorize search error:', e);
          }
        }

        // C. Stream response from Together AI (Llama 3.3 70B Turbo) or fallback to Workers AI
        const systemPrompt = `You are CongressWatch AI, a non-partisan legislative analyst.
Answer the user's inquiry objectively using verified congressional records, bills, committee hearings, and financial disclosures.
Always cite your sources with inline numbers [1], [2] corresponding to official records.`;

        const messages = [
          { role: 'system', content: `${systemPrompt}\n\nContext:\n${contextChunks || 'Recent 118th Congress legislative records.'}` },
          ...(body.history || []),
          { role: 'user', content: userQuery }
        ];

        if (env.TOGETHER_API_KEY) {
          const togetherRes = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.TOGETHER_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
              messages,
              temperature: 0.2,
              max_tokens: 1200,
              stream: true
            })
          });

          if (togetherRes.ok && togetherRes.body) {
            return new Response(togetherRes.body, {
              headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
              }
            });
          }
        }

        // Fallback to Workers AI Llama
        const fallbackStream = await env.AI.run('@cf/meta/llama-3.3-70b-instruct' as any, {
          messages,
          stream: true
        });

        return new Response(fallbackStream as ReadableStream, {
          headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 8. Shared Chats API (/api/share/create and /api/share/:id)
    if (url.pathname === '/api/share/create' && request.method === 'POST') {
      const mockUser = { id: 'usr_guest_demo' };
      return handleCreateShare(request, env, mockUser);
    }

    if (url.pathname.startsWith('/api/share/') && request.method === 'GET') {
      const shareId = url.pathname.replace('/api/share/', '');
      return handleViewShare(request, env, shareId);
    }

    // 9. Static Assets Fallback (Serves React 19 SPA)
    return env.ASSETS.fetch(request);
  }
};

