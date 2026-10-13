-- CongressWatch Schema Migration 0010: Congressional Committees & Membership

CREATE TABLE IF NOT EXISTS committees (
  id TEXT PRIMARY KEY,
  chamber TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT DEFAULT 'standing',
  chair_bioguide_id TEXT REFERENCES members(bioguide_id),
  ranking_member_bioguide_id TEXT REFERENCES members(bioguide_id),
  jurisdiction TEXT,
  website_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS committee_members (
  committee_id TEXT NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  rank_order INTEGER,
  PRIMARY KEY (committee_id, bioguide_id)
);

CREATE INDEX IF NOT EXISTS idx_committees_chamber ON committees(chamber);
CREATE INDEX IF NOT EXISTS idx_committee_members_member ON committee_members(bioguide_id);
