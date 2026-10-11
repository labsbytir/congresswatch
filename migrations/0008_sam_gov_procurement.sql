-- CongressWatch Schema Migration 0008: SAM.gov Procurement & Federal Contract Links

-- 1. NAICS Codes & Congressional Committee Mapping
CREATE TABLE IF NOT EXISTS naics_codes (
  code TEXT PRIMARY KEY, -- e.g. '541715'
  title TEXT NOT NULL, -- 'Research and Development in Biotechnology'
  sector_code TEXT NOT NULL, -- '54' (Professional, Scientific, and Technical Services)
  description TEXT,
  primary_house_committee_id TEXT REFERENCES committees(id),
  primary_senate_committee_id TEXT REFERENCES committees(id)
);

-- 2. SAM.gov Federal Procurement Solicitations & Awards
CREATE TABLE IF NOT EXISTS sam_procurement_opportunities (
  id TEXT PRIMARY KEY, -- noticeId / solicitationNumber
  solicitation_number TEXT NOT NULL,
  title TEXT NOT NULL,
  notice_type TEXT NOT NULL, -- 'o' = Solicitation, 'a' = Award Notice, 'k' = Combined Synopsis
  department_name TEXT NOT NULL,
  sub_tier_agency TEXT,
  office_name TEXT,
  posted_date TEXT NOT NULL,
  response_deadline TEXT,
  naics_code TEXT REFERENCES naics_codes(code),
  set_aside_type TEXT, -- e.g. 'SBA' (Small Business), 'SDVOSBC'
  description TEXT,
  ui_link TEXT,
  -- Relations back to Congressional Data
  linked_public_law TEXT, -- e.g. 'P.L. 117-169'
  linked_bill_id TEXT REFERENCES bills(id),
  linked_committee_id TEXT REFERENCES committees(id),
  estimated_award_amount NUMERIC,
  awardee_name TEXT,
  awardee_duns_or_uei TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bill-to-Procurement Cross Reference
CREATE TABLE IF NOT EXISTS bill_procurement_links (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL REFERENCES sam_procurement_opportunities(id) ON DELETE CASCADE,
  match_method TEXT NOT NULL, -- 'statutory_authority_regex', 'agency_appropriation', 'naics_committee_inferred'
  confidence_score NUMERIC DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_sam_naics ON sam_procurement_opportunities(naics_code);
CREATE INDEX IF NOT EXISTS idx_sam_bill ON sam_procurement_opportunities(linked_bill_id);
CREATE INDEX IF NOT EXISTS idx_sam_dept ON sam_procurement_opportunities(department_name);

