-- CongressWatch Schema Migration 0009: Shared AI Chats, Snapshots, Password-protected KV Mapping, and Comprehensive Provenance Sources

-- 1. Immutable Shared Conversation Snapshots
CREATE TABLE IF NOT EXISTS shared_conversations (
  share_id TEXT PRIMARY KEY, -- Base62 / UUID token for /share/:shareId
  original_conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  snapshot_messages JSON NOT NULL, -- Frozen array of messages up to share moment
  has_password BOOLEAN DEFAULT FALSE,
  expires_at DATETIME, -- Nullable for persistent shares, or specific timestamp
  utm_source TEXT DEFAULT 'direct',
  utm_medium TEXT,
  utm_campaign TEXT,
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complete Data Provenance & Grounding Sources
CREATE TABLE IF NOT EXISTS data_provenance_sources (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'bill', 'member', 'trade', 'procurement', 'tweet', 'rulemaking'
  entity_id TEXT NOT NULL,
  source_name TEXT NOT NULL, -- 'Congress.gov', 'SAM.gov', 'Senate eFD', 'Federal Register', 'LegiScan'
  source_url TEXT NOT NULL,
  extracted_section TEXT, -- e.g. "Section 4(b), Page 12"
  retrieved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checksum TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shared_conv_expires ON shared_conversations(expires_at);
CREATE INDEX IF NOT EXISTS idx_provenance_entity ON data_provenance_sources(entity_type, entity_id);

