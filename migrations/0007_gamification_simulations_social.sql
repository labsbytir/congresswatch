-- CongressWatch Schema Migration 0007: Gamification, Simulations & Social Community

-- 1. Fantasy Congress Leagues & Roster Drafts
CREATE TABLE IF NOT EXISTS fantasy_leagues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  creator_user_id TEXT NOT NULL REFERENCES users(id),
  season_year INTEGER NOT NULL, -- e.g. 2026
  scoring_cycle TEXT DEFAULT 'weekly', -- 'weekly', 'monthly', 'congressional_session'
  is_public BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fantasy_teams (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  total_points NUMERIC DEFAULT 0,
  rank_position INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(league_id, user_id)
);

CREATE TABLE IF NOT EXISTS fantasy_rosters (
  team_id TEXT NOT NULL REFERENCES fantasy_teams(id) ON DELETE CASCADE,
  bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id) ON DELETE CASCADE,
  slot_role TEXT DEFAULT 'active', -- 'active_senator', 'active_representative', 'bench'
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, bioguide_id)
);

CREATE TABLE IF NOT EXISTS fantasy_point_events (
  id TEXT PRIMARY KEY,
  bioguide_id TEXT NOT NULL REFERENCES members(bioguide_id),
  event_type TEXT NOT NULL, -- 'bill_passed', 'bipartisan_cosponsor', 'hearing_attendance', 'press_mention'
  points NUMERIC NOT NULL,
  event_date TEXT NOT NULL,
  description TEXT,
  bill_id TEXT REFERENCES bills(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Play-Money Prediction Markets & User Tokens
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  play_tokens_balance INTEGER DEFAULT 1000, -- Free 1,000 starting tokens
  all_time_earnings INTEGER DEFAULT 0,
  badges JSON DEFAULT '[]', -- ['Policy Wonk', 'Super Voter', 'Filibuster Buster']
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prediction_markets (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  question TEXT NOT NULL, -- e.g. "Will H.R. 1234 pass the Senate before Dec 31?"
  outcome_type TEXT DEFAULT 'binary', -- 'binary' (YES/NO) or 'multi'
  status TEXT DEFAULT 'open', -- 'open', 'resolved_yes', 'resolved_no', 'cancelled'
  total_pool_tokens INTEGER DEFAULT 0,
  yes_pool_tokens INTEGER DEFAULT 0,
  no_pool_tokens INTEGER DEFAULT 0,
  closes_at DATETIME NOT NULL,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prediction_bets (
  id TEXT PRIMARY KEY,
  market_id TEXT NOT NULL REFERENCES prediction_markets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  choice TEXT NOT NULL, -- 'YES' or 'NO'
  tokens_staked INTEGER NOT NULL,
  payout_claimed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. The Whip Count Simulator Sessions
CREATE TABLE IF NOT EXISTS whip_count_scenarios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  chamber TEXT NOT NULL, -- 'house' or 'senate'
  title TEXT NOT NULL,
  target_threshold INTEGER NOT NULL, -- 218 for House, 60 for Senate filibuster
  whip_votes JSON NOT NULL, -- { "bioguide_id_1": "YES", "bioguide_id_2": "NO", ... }
  is_public BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bipartisan Debate Arena & Dynamic Argument Maps
CREATE TABLE IF NOT EXISTS debate_arguments (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  side TEXT NOT NULL, -- 'PRO' or 'CON'
  core_thesis TEXT NOT NULL,
  body_argument TEXT NOT NULL,
  cited_bill_section TEXT,
  upvotes_count INTEGER DEFAULT 0,
  downvotes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS debate_argument_votes (
  argument_id TEXT NOT NULL REFERENCES debate_arguments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL, -- +1 for upvote, -1 for downvote
  PRIMARY KEY (argument_id, user_id)
);

