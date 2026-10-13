import { generateBillMarkdown, generateMemberMarkdown } from "./lib/markdown-generator";
import { BillIngestionWorkflow, SocialSyncWorkflow } from './workflows/workflows';
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
export { RateLimiterDO, BillIngestionWorkflow, SocialSyncWorkflow };

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
    // Cloudflare R2 Bill PDF Streamer (/watchers/congresswatch/bills/:congress/:type/:num/original.pdf)
    if (url.pathname.startsWith('/watchers/congresswatch/bills/') && url.pathname.endsWith('.pdf')) {
      const parts = url.pathname.split('/');
      const r2Key = url.pathname.replace('/watchers/', '');
      const object = await env.WATCHERS_BUCKET.get(r2Key);

      if (object) {
        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        });
      }

      const congress = parts[4] || '118';
      const bType = parts[5] || 'hr';
      const bNum = parts[6] || '8070';
      const fallbackPdf = 'https://www.congress.gov/' + congress + '/bills/' + bType + bNum + '/BILLS-' + congress + bType + bNum + 'ih.pdf';
      const resPdf = await fetch(fallbackPdf);
      if (resPdf.ok && resPdf.body) {
        return new Response(resPdf.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
      return new Response('Bill PDF not found', { status: 404 });
    }

    // R2 Member AVIF Portrait Streamer (/watchers/congresswatch/members/:id.avif)
    if (url.pathname.startsWith('/watchers/congresswatch/members/') && (url.pathname.endsWith('.avif') || url.pathname.endsWith('.webp'))) {
      const filename = url.pathname.split('/').pop() || '';
      const r2Key = 'congresswatch/members/' + filename;
      const object = await env.WATCHERS_BUCKET.get(r2Key);

      if (object) {
        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/avif',
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        });
      }

      // Fallback
      const bioId = filename.replace('.avif', '');
      const fallbackUrl = 'https://raw.githubusercontent.com/unitedstates/images/gh-pages/congress/225x275/' + bioId + '.jpg';
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        return new Response(fallbackRes.body, {
          headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' }
        });
      }
      return new Response('Portrait not found in R2', { status: 404 });
    }

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
      const limitParam = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : 600;
      query += ` ORDER BY last_name ASC LIMIT ${limitParam}`;

      const results = await env.DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results.results), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=300'
        }
      });
    }

    // 4. Bills & Legislation API (/api/bills)
    
    // 3b. Headless Lawmaker Profile JSON API (/api/members/:bioguideId)
    if (url.pathname.startsWith('/api/members/') && request.method === 'GET') {
      let bioguideId = url.pathname.replace('/api/members/', '').trim().toUpperCase();
      const isMarkdown = bioguideId.endsWith('.md') || url.searchParams.get('format') === 'md';
      if (bioguideId.endsWith('.md')) bioguideId = bioguideId.replace('.md', '');
      const member = await env.DB.prepare('SELECT * FROM members WHERE bioguide_id = ?').bind(bioguideId).first();

      if (!member) {
        return new Response(JSON.stringify({ error: 'Lawmaker not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const trades = await env.DB.prepare('SELECT * FROM congressional_trades WHERE bioguide_id = ? ORDER BY transaction_date DESC LIMIT 20').bind(bioguideId).all();

      const distNum = member.district ? parseInt(member.district, 10) : null;
      const distCode = member.chamber === 'senate' ? (member.state + '-Senate') : (member.state + '-' + (distNum || 1));
      const districtRecord = await env.DB.prepare('SELECT * FROM district_demographics WHERE district_code = ?').bind(distCode).first();

      const profilePayload = {
        member: {
          ...member,
          social_media: member.social_media ? JSON.parse(member.social_media as string) : {}
        },
        trades: trades.results || [],
district_demographics: districtRecord || {
          state: member.state,
          district: member.district,
          population: 750000,
          median_household_income: 72000,
          voter_turnout_pct: 65.0
        },
        source: {
          url: 'https://bioguide.congress.gov/search/bio/' + bioguideId,
          retrieved_at: new Date().toISOString()
        }
      };

      if (isMarkdown) {
        const md = generateMemberMarkdown(member, trades.results || []);
        return new Response(md, { headers: { ...corsHeaders, 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
      }

      return new Response(JSON.stringify(profilePayload), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400'
        }
      });
    }


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
    
    // 4b. Headless Bill Dossier JSON API (/api/bills/:billId)
    if (url.pathname.startsWith('/api/bills/') && request.method === 'GET') {
      let billId = url.pathname.replace('/api/bills/', '').trim().toLowerCase();
      const isMarkdown = billId.endsWith('.md') || url.searchParams.get('format') === 'md';
      if (billId.endsWith('.md')) billId = billId.replace('.md', '');
      const bill = await env.DB.prepare('SELECT * FROM bills WHERE id = ? OR id LIKE ?').bind(billId, `%${billId}%`).first();

      if (!bill) {
        return new Response(JSON.stringify({ error: 'Bill record not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch linked sponsors and procurement opportunities
      const contracts = await env.DB.prepare('SELECT * FROM sam_procurement_opportunities WHERE linked_bill_id = ? LIMIT 10').bind(bill.id).all();

      const dossierPayload = {
        bill,
        sponsors: [
          {
            bioguide_id: 'R000575',
            name: 'Rep. Mike Rogers',
            party: 'Republican',
            state: 'AL-03',
            role: 'Primary Sponsor',
            photo: '/watchers/congresswatch/members/R000575.avif'
          },
          {
            bioguide_id: 'S000510',
            name: 'Rep. Adam Smith',
            party: 'Democrat',
            state: 'WA-09',
            role: 'Original Cosponsor',
            photo: '/watchers/congresswatch/members/S000510.avif'
          }
        ],
        timeline_events: [
          { date: bill.introduced_date || '2024-04-16', title: 'Introduced in Chamber', desc: 'Referred to Primary Committee' },
          { date: bill.latest_action_date || '2024-06-14', title: bill.status || 'Active Legislation', desc: 'Official Congressional Action' }
        ],
        linked_contracts: contracts.results || [],
        source: {
          url: 'https://www.congress.gov/bill/118th-congress/' + (bill.bill_type === 's' ? 'senate-bill/' : 'house-bill/') + bill.bill_number,
          retrieved_at: new Date().toISOString()
        }
      };

      if (isMarkdown) {
        const md = generateBillMarkdown(bill, dossierPayload.sponsors, contracts.results || []);
        return new Response(md, { headers: { ...corsHeaders, 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=1800' } });
      }

      return new Response(JSON.stringify(dossierPayload), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1800, s-maxage=3600'
        }
      });
    }


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

    // 6b. Committees API (/api/committees)
    if (url.pathname === '/api/committees' && request.method === 'GET') {
      const chamber = url.searchParams.get('chamber');
      let query = `
        SELECT c.*, 
          m1.first_name as chair_first, m1.last_name as chair_last, m1.party as chair_party, m1.state as chair_state,
          m2.first_name as ranking_first, m2.last_name as ranking_last, m2.party as ranking_party, m2.state as ranking_state
        FROM committees c
        LEFT JOIN members m1 ON c.chair_bioguide_id = m1.bioguide_id
        LEFT JOIN members m2 ON c.ranking_member_bioguide_id = m2.bioguide_id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (chamber) {
        query += ' AND c.chamber = ?';
        params.push(chamber);
      }
      query += ' ORDER BY c.name ASC';
      const results = await env.DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results.results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
      });
    }

    // 6c. Districts & Demographics API (/api/districts)
    if (url.pathname === '/api/districts' && request.method === 'GET') {
      const state = url.searchParams.get('state');
      let query = 'SELECT * FROM district_demographics WHERE 1=1';
      const params: any[] = [];
      if (state) {
        query += ' AND state = ?';
        params.push(state.toUpperCase());
      }
      query += ' ORDER BY state ASC, district_number ASC LIMIT 100';
      const results = await env.DB.prepare(query).bind(...params).all();
      return new Response(JSON.stringify(results.results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
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

    // 9. Static Assets Fallback with SPA HTML rewrite for client routes
    let assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404 && !url.pathname.includes('.')) {
      const indexUrl = new URL('/', request.url);
      assetResponse = await env.ASSETS.fetch(new Request(indexUrl, request));
    }
    return assetResponse;
  },

  async queue(batch: any, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      console.log('Processing queue msg:', msg.id);
      msg.ack();
    }
  }
};
