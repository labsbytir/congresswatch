-- CongressWatch Schema Migration 0005: Developer API Platform (Future Release Architecture)

-- 1. API Keys & Authentication
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY, -- 'key_live_...'
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. 'Production Internal CRM Sync'
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the secret key
  key_prefix TEXT NOT NULL, -- First 8 characters e.g. 'cw_live_a1b2'
  tier TEXT DEFAULT 'standard', -- 'standard', 'pro', 'enterprise', 'unlimited'
  rate_limit_per_minute INTEGER DEFAULT 120,
  monthly_quota INTEGER DEFAULT 50000,
  is_active BOOLEAN DEFAULT TRUE,
  allowed_origins JSON, -- CORS domain restrictions
  allowed_ips JSON, -- IP whitelist CIDRs
  expires_at DATETIME,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Granular API Scopes & Permissions
CREATE TABLE IF NOT EXISTS api_key_scopes (
  api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  scope TEXT NOT NULL, -- e.g. 'bills:read', 'trades:read', 'predictions:read', 'webhooks:manage'
  PRIMARY KEY (api_key_id, scope)
);

-- 3. Developer Webhooks (Real-Time Push Subscriptions)
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  secret_signature TEXT NOT NULL, -- HMAC-SHA256 signing secret
  events JSON NOT NULL, -- ['bill.status_change', 'trade.disclosed', 'markup.amendment_offered', 'vote.recorded']
  is_active BOOLEAN DEFAULT TRUE,
  failure_count INTEGER DEFAULT 0,
  last_delivered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSON NOT NULL,
  response_status_code INTEGER,
  response_body TEXT,
  delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. API Usage Metering & Billing (Cloudflare Monetization Gateway Integration)
CREATE TABLE IF NOT EXISTS api_usage_daily (
  api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  total_requests INTEGER DEFAULT 0,
  smart_ai_queries INTEGER DEFAULT 0,
  egress_bytes INTEGER DEFAULT 0,
  PRIMARY KEY (api_key_id, date)
);

