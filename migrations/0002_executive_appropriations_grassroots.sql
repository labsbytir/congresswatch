-- CongressWatch Schema Migration 0002: Regulatory, Appropriations, Sentiment & Grassroots

-- 1. Unified Agency Tracker (Federal Agencies & Rulemakings)
CREATE TABLE IF NOT EXISTS federal_agencies (
  id TEXT PRIMARY KEY, -- e.g. 'epa', 'sec', 'fda', 'ftc'
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  parent_department TEXT
);

CREATE TABLE IF NOT EXISTS agency_rulemakings (
  id TEXT PRIMARY KEY, -- Federal Register document number or RIN (Regulation Identifier Number)
  agency_id TEXT NOT NULL REFERENCES federal_agencies(id),
  bill_id TEXT REFERENCES bills(id),
  title TEXT NOT NULL,
  docket_id TEXT,
  stage TEXT NOT NULL, -- 'Prerule', 'Proposed Rule', 'Final Rule', 'Notice'
  public_comment_deadline TEXT,
  effective_date TEXT,
  document_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Executive Orders & International Treaties Mapping
CREATE TABLE IF NOT EXISTS executive_orders (
  id TEXT PRIMARY KEY, -- e.g. 'EO-14067'
  eo_number INTEGER NOT NULL,
  president_name TEXT NOT NULL,
  title TEXT NOT NULL,
  signing_date TEXT NOT NULL,
  impacted_statutes JSON, -- array of USC titles / public law numbers
  linked_bill_ids JSON, -- cross-referenced bills in Congress
  linked_committee_ids JSON, -- relevant House/Senate oversight committees
  full_text_r2_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treaties (
  id TEXT PRIMARY KEY, -- Treaty Doc number, e.g., 'Treaty Doc. 118-1'
  title TEXT NOT NULL,
  country_or_entity TEXT NOT NULL,
  transmitted_date TEXT NOT NULL,
  senate_status TEXT NOT NULL, -- 'referred_to_foreign_relations', 'reported', 'ratified'
  linked_bill_ids JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appropriations & Budget Line-Item Tracker (Earmarks & Agency Riders)
CREATE TABLE IF NOT EXISTS appropriations_bills (
  id TEXT PRIMARY KEY, -- '118-hr-appropriations-defense'
  fiscal_year INTEGER NOT NULL,
  subcommittee_name TEXT NOT NULL, -- e.g. 'Defense', 'Labor-HHS-Education', 'Energy and Water'
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  enacted_amount NUMERIC
);

CREATE TABLE IF NOT EXISTS budget_line_items (
  id TEXT PRIMARY KEY,
  appropriations_bill_id TEXT NOT NULL REFERENCES appropriations_bills(id) ON DELETE CASCADE,
  agency_id TEXT REFERENCES federal_agencies(id),
  account_name TEXT NOT NULL, -- e.g. 'Operation and Maintenance, Army'
  program_name TEXT NOT NULL,
  budget_year INTEGER NOT NULL,
  requested_amount NUMERIC,
  house_passed_amount NUMERIC,
  senate_passed_amount NUMERIC,
  enacted_amount NUMERIC,
  item_type TEXT DEFAULT 'line_item', -- 'line_item', 'earmark', 'policy_rider'
  requesting_member_bioguide_id TEXT REFERENCES members(bioguide_id),
  earmark_recipient TEXT,
  earmark_location TEXT,
  notes TEXT
);

-- 4. Media, Press Releases & Sentiment Intelligence
CREATE TABLE IF NOT EXISTS member_press_releases (
  id TEXT PRIMARY KEY,
  bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  published_date TEXT NOT NULL,
  source_url TEXT,
  content TEXT NOT NULL,
  sentiment_score NUMERIC, -- -1.0 (strongly negative) to +1.0 (strongly positive)
  linked_bill_ids JSON,
  extracted_entities JSON, -- local municipalities, projects, dollar amounts
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS member_sentiment_trends (
  id TEXT PRIMARY KEY,
  bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id) ON DELETE CASCADE,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  phase TEXT NOT NULL, -- 'introduced', 'hearing', 'floor_vote', 'enacted'
  sentiment_score NUMERIC NOT NULL,
  sentiment_label TEXT NOT NULL, -- 'supportive', 'critical', 'neutral'
  analyzed_items_count INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Grassroots Campaign Portal (ZIP-to-District Routing & Advocacy)
CREATE TABLE IF NOT EXISTS grassroots_campaigns (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  target_bill_id TEXT REFERENCES bills(id),
  call_script TEXT,
  email_template_subject TEXT,
  email_template_body TEXT,
  target_chamber TEXT, -- 'both', 'house', 'senate'
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grassroots_actions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES grassroots_campaigns(id) ON DELETE CASCADE,
  citizen_name TEXT NOT NULL,
  citizen_email TEXT NOT NULL,
  citizen_zip TEXT NOT NULL,
  matched_district TEXT, -- e.g. 'CA-12'
  matched_rep_bioguide_id TEXT REFERENCES members(bioguide_id),
  matched_senator_1_bioguide_id TEXT REFERENCES members(bioguide_id),
  matched_senator_2_bioguide_id TEXT REFERENCES members(bioguide_id),
  action_type TEXT NOT NULL, -- 'email_sent', 'call_placed'
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

