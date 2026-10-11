import { create, insert, search, save, load } from '@orama/orama';
import { pluginDataPersistence } from '@orama/plugin-data-persistence';
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 8080;
const API_SECRET = process.env.ORAMA_API_SECRET || 'cw_orama_secret';
const DB_FILE = path.join(process.cwd(), 'data', 'orama_db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

let db: any;

async function initDb() {
  if (fs.existsSync(DB_FILE)) {
    console.log('Restoring existing Orama database from disk...');
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = await load('json', raw);
  } else {
    console.log('Initializing fresh Orama database...');
    db = await create({
      schema: {
        id: 'string',
        type: 'string', // 'bill', 'member', 'trade', 'procurement'
        title: 'string',
        content: 'string',
        tags: 'string[]',
        party: 'string',
        chamber: 'string',
        date: 'string',
        url: 'string',
        bill_number: 'string',
        bioguide_id: 'string',
        ticker: 'string'
      }
    });
  }
}

// Simple bearer token auth middleware
app.use((req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized access to Orama cluster' });
  }
  next();
});

// Search endpoint
app.post('/search', async (req, res) => {
  try {
    const { term, where, limit = 20, offset = 0 } = req.body;
    const results = await search(db, {
      term,
      where,
      limit,
      offset,
      tolerance: 1 // Typo tolerance for member names and bill numbers
    });
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Insert endpoint
app.post('/insert', async (req, res) => {
  try {
    const { documents } = req.body;
    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'documents must be an array' });
    }
    for (const doc of documents) {
      await insert(db, doc);
    }
    // Persist to disk
    const serialized = await save('json', db);
    fs.writeFileSync(DB_FILE, serialized, 'utf-8');
    res.json({ success: true, count: documents.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Orama Search Engine on VPS', port: PORT });
});

initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Orama Search Cluster running on port ${PORT}`);
  });
});

