-- CongressWatch Initial D1 Schema Migration

-- 1. Users & Authentication (Mapped with WorkOS AuthKit)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- WorkOS user_id
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ChatGPT-Style Persistent Sessions & Searches
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mode TEXT DEFAULT 'smart_plus',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  citations JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_search_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  mode TEXT DEFAULT 'classic',
  filters JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Members of Congress
CREATE TABLE IF NOT EXISTS members (
  bioguide_id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  party TEXT NOT NULL, -- 'Democrat', 'Republican', 'Independent'
  state TEXT NOT NULL,
  district TEXT,
  chamber TEXT NOT NULL, -- 'house', 'senate'
  birth_date TEXT,
  term_start TEXT,
  term_end TEXT,
  total_terms_years INTEGER DEFAULT 0,
  office_address TEXT,
  phone TEXT,
  email TEXT,
  social_media JSON,
  net_worth_estimate NUMERIC,
  bills_proposed_count INTEGER DEFAULT 0,
  bills_sponsored_count INTEGER DEFAULT 0,
  image_r2_path TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Congressional Districts (Census & Voting Overlays)
CREATE TABLE IF NOT EXISTS district_demographics (
  district_code TEXT PRIMARY KEY, -- 'CA-12'
  state TEXT NOT NULL,
  district_number INTEGER,
  population INTEGER,
  median_household_income NUMERIC,
  average_household_size NUMERIC,
  voter_turnout_pct NUMERIC,
  democrat_registered_pct NUMERIC,
  republican_registered_pct NUMERIC,
  independent_registered_pct NUMERIC,
  geojson_r2_path TEXT
);

-- 5. Congressional Stock Trades
CREATE TABLE IF NOT EXISTS congressional_trades (
  id TEXT PRIMARY KEY,
  bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id),
  chamber TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  disclosure_date TEXT NOT NULL,
  ticker TEXT NOT NULL,
  asset_description TEXT,
  transaction_type TEXT NOT NULL,
  amount_bracket TEXT NOT NULL,
  source_doc_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Social Statements & Tweets (via RSSHub rsstown.com)
CREATE TABLE IF NOT EXISTS member_tweets (
  id TEXT PRIMARY KEY,
  bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id) ON DELETE CASCADE,
  twitter_handle TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at DATETIME NOT NULL,
  tweet_url TEXT NOT NULL,
  media_urls JSON,
  linked_bill_ids JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bills, Versions & Amendments
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY, -- '118-hr-1234'
  congress INTEGER NOT NULL,
  bill_type TEXT NOT NULL,
  bill_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  short_title TEXT,
  status TEXT NOT NULL,
  summary_noai TEXT,
  ai_summary TEXT,
  ai_tags JSON,
  r2_pdf_path TEXT,
  introduced_date TEXT,
  latest_action_date TEXT
);

CREATE TABLE IF NOT EXISTS bill_versions (
  id TEXT PRIMARY KEY, -- '118-hr-1234-ih'
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  version_code TEXT NOT NULL, -- 'ih', 'rh', 'eh', 'enr'
  version_name TEXT NOT NULL,
  published_date TEXT NOT NULL,
  r2_pdf_path TEXT,
  r2_markdown_path TEXT,
  word_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_amendments (
  id TEXT PRIMARY KEY, -- '118-s-amdt-567'
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  amendment_number TEXT NOT NULL,
  congress INTEGER NOT NULL,
  chamber TEXT NOT NULL,
  sponsor_bioguide_id TEXT REFERENCES members(bioguide_id),
  description TEXT,
  purpose TEXT,
  status TEXT,
  submitted_date TEXT,
  r2_markdown_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Predictive ML Models & Forecasting
CREATE TABLE IF NOT EXISTS bill_predictions (
  bill_id TEXT PRIMARY KEY REFERENCES bills(id) ON DELETE CASCADE,
  passage_probability_pct NUMERIC NOT NULL,
  committee_report_probability_pct NUMERIC,
  chamber_passage_probability_pct NUMERIC,
  model_version TEXT NOT NULL,
  feature_weights JSON,
  projected_enactment_date TEXT,
  projected_effective_date TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Workspaces & Alerts
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  bill_id TEXT REFERENCES bills(id),
  bioguide_id TEXT REFERENCES members(bioguide_id),
  trigger_type TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'smtp' or 'cloudflare_email'
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

