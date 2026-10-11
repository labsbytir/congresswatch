-- CongressWatch Schema Migration 0003: Geopolitical, Sub-Legislative & Supply Chain

-- 1. International Counterpart Mapping (EU Parliament, UK Parliament, etc.)
CREATE TABLE IF NOT EXISTS international_legislatures (
  id TEXT PRIMARY KEY, -- e.g. 'eu_parliament', 'uk_parliament', 'japan_diet'
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  api_endpoint TEXT,
  website_url TEXT
);

CREATE TABLE IF NOT EXISTS international_bills (
  id TEXT PRIMARY KEY, -- e.g. 'EU-AI-ACT-2024'
  legislature_id TEXT NOT NULL REFERENCES international_legislatures(id),
  title TEXT NOT NULL,
  reference_code TEXT NOT NULL,
  status TEXT NOT NULL,
  policy_area TEXT NOT NULL, -- e.g. 'AI Regulation', 'Semiconductors', 'Carbon Border'
  published_date TEXT NOT NULL,
  document_url TEXT,
  similarity_score NUMERIC,
  linked_us_bill_id TEXT REFERENCES bills(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sanctions, Export Controls & Entity Lists (OFAC, BIS, ITAR)
CREATE TABLE IF NOT EXISTS sanctions_entities (
  id TEXT PRIMARY KEY, -- SDN ID or Entity List ID
  program TEXT NOT NULL, -- 'OFAC_SDN', 'BIS_ENTITY_LIST', 'ITAR'
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'individual', 'company', 'vessel', 'aircraft'
  country TEXT,
  listed_date TEXT NOT NULL,
  regulatory_source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_sanctions_correlations (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES sanctions_entities(id) ON DELETE CASCADE,
  correlation_type TEXT NOT NULL, -- 'explicit_mandate', 'targeted_industry', 'export_restriction'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sub-Legislative Tracking: Committee Markup Amendments & Chairman's Marks
CREATE TABLE IF NOT EXISTS committee_markups (
  id TEXT PRIMARY KEY,
  committee_id TEXT NOT NULL REFERENCES committees(id),
  bill_id TEXT REFERENCES bills(id),
  markup_title TEXT NOT NULL,
  markup_date TEXT NOT NULL,
  status TEXT NOT NULL, -- 'scheduled', 'in_progress', 'completed'
  notice_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS markup_amendments (
  id TEXT PRIMARY KEY,
  markup_id TEXT NOT NULL REFERENCES committee_markups(id) ON DELETE CASCADE,
  offered_by_bioguide_id TEXT REFERENCES members(bioguide_id),
  amendment_designation TEXT NOT NULL, -- e.g. 'Manager Amendment #1', 'Smith Amendment 04'
  title TEXT,
  status TEXT NOT NULL, -- 'offered', 'agreed_to', 'withdrawn', 'failed'
  r2_pdf_path TEXT,
  r2_diff_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chairmans_marks (
  id TEXT PRIMARY KEY,
  committee_id TEXT NOT NULL REFERENCES committees(id),
  title TEXT NOT NULL,
  chair_bioguide_id TEXT REFERENCES members(bioguide_id),
  released_date TEXT NOT NULL,
  r2_pdf_path TEXT NOT NULL,
  r2_markdown_path TEXT,
  ai_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Staffer Directory & Drafting Track Records
CREATE TABLE IF NOT EXISTS legislative_staffers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL, -- 'Staff Director', 'Chief Counsel', 'Legislative Director', 'Senior Policy Advisor'
  office_type TEXT NOT NULL, -- 'committee', 'personal_office', 'leadership'
  committee_id TEXT REFERENCES committees(id),
  member_bioguide_id TEXT REFERENCES members(bioguide_id),
  policy_focus_areas JSON, -- ['Defense Procurement', 'Financial Technology', 'Antitrust']
  drafting_track_record JSON, -- list of bills / frameworks originated
  email TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Financial Sector Volatility & Stock Correlation
CREATE TABLE IF NOT EXISTS sector_market_indices (
  ticker_symbol TEXT PRIMARY KEY, -- e.g. 'XAR' (Defense), 'XLV' (Health), 'SOXX' (Semis), 'XLE' (Energy)
  sector_name TEXT NOT NULL,
  exchange TEXT DEFAULT 'NYSE_ARCA'
);

CREATE TABLE IF NOT EXISTS legislative_market_correlations (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  sector_ticker TEXT NOT NULL REFERENCES sector_market_indices(ticker_symbol),
  legislative_event_date TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'surprise_passage', 'markup_rejection', 'filibuster_threat'
  pre_event_price NUMERIC,
  post_event_price NUMERIC,
  percentage_change NUMERIC,
  volatility_score NUMERIC,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Critical Infrastructure & Commodity Dependency Mapping
CREATE TABLE IF NOT EXISTS critical_infrastructure_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'semiconductor_fab', 'major_port', 'power_grid_substation', 'refinery', 'defense_plant'
  state TEXT NOT NULL,
  district_code TEXT REFERENCES district_demographics(district_code),
  latitude NUMERIC,
  longitude NUMERIC,
  primary_commodities JSON, -- ['enriched_uranium', 'neon_gas', 'cobalt', 'gallium', 'lithium']
  operator_entity TEXT
);

CREATE TABLE IF NOT EXISTS bill_infrastructure_impacts (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  infrastructure_node_id TEXT NOT NULL REFERENCES critical_infrastructure_nodes(id) ON DELETE CASCADE,
  impact_nature TEXT NOT NULL, -- 'funding_recipient', 'permitting_barrier', 'mineral_restriction', 'security_mandate'
  impact_severity TEXT DEFAULT 'moderate', -- 'critical', 'high', 'moderate', 'low'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

