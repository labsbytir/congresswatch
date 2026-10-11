-- CongressWatch Schema Migration 0006: User & Company Multi-Key API Management

-- Update api_keys to support individual user ownership OR company organization ownership
-- (Allows multiple keys per user, naming, IP restriction CIDRs, rolling, and deletion)
CREATE TABLE IF NOT EXISTS user_api_keys (
  id TEXT PRIMARY KEY, -- 'key_live_...'
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for personal, set for company pool
  name TEXT NOT NULL, -- e.g. 'My Personal Bot', 'Production Ingest'
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of secret key
  key_prefix TEXT NOT NULL, -- First 8 chars e.g. 'cw_live_a1b2'
  daily_limit INTEGER DEFAULT 100, -- 100 requests per day default
  monthly_limit INTEGER DEFAULT 1500, -- 1500 requests per month default
  allowed_ips JSON, -- Array of CIDRs / IPs e.g. ["192.168.1.1", "10.0.0.0/24"]
  allowed_origins JSON, -- CORS domains
  scopes JSON DEFAULT '["bills:read", "members:read"]',
  status TEXT DEFAULT 'active', -- 'active', 'revoked'
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Company Pooled Quotas and Granular Key Limits
CREATE TABLE IF NOT EXISTS company_api_pools (
  org_id TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  pooled_monthly_quota INTEGER DEFAULT 50000,
  pooled_daily_quota INTEGER DEFAULT 3000,
  max_keys_allowed INTEGER DEFAULT 25,
  enforce_ip_restrictions BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_api_keys_user ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_org ON user_api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_hash ON user_api_keys(key_hash);

