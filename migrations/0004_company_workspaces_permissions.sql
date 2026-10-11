-- CongressWatch Schema Migration 0004: Enterprise Company Accounts, Workspaces & Granular RBAC

-- 1. Company / Organization Accounts
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY, -- e.g. 'org_defense_corp_123'
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  billing_email TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'enterprise', -- 'starter', 'team', 'enterprise', 'sovereign'
  seat_limit INTEGER DEFAULT 10,
  sso_enforced BOOLEAN DEFAULT FALSE,
  workos_organization_id TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Granular Roles & Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS organization_roles (
  id TEXT PRIMARY KEY, -- 'org_owner', 'compliance_officer', 'policy_analyst', 'restricted_viewer'
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  description TEXT,
  -- Granular Boolean / JSON permission scopes
  can_manage_members BOOLEAN DEFAULT FALSE,
  can_manage_billing BOOLEAN DEFAULT FALSE,
  can_create_workspaces BOOLEAN DEFAULT TRUE,
  can_export_reports BOOLEAN DEFAULT TRUE,
  can_view_compliance_audit_logs BOOLEAN DEFAULT FALSE,
  can_manage_crm_outreach BOOLEAN DEFAULT TRUE,
  can_set_org_stances BOOLEAN DEFAULT FALSE,
  can_use_anonymized_research_mode BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Organization Membership
CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES organization_roles(id),
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active', -- 'active', 'suspended', 'invited'
  UNIQUE (org_id, user_id)
);

-- 4. Granular Team Workspaces (Scoped within Organizations)
CREATE TABLE IF NOT EXISTS team_workspaces (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private', -- 'public_to_org', 'private_to_members'
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_workspace_members (
  workspace_id TEXT NOT NULL REFERENCES team_workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_role TEXT DEFAULT 'contributor', -- 'workspace_admin', 'contributor', 'viewer_only'
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (workspace_id, user_id)
);

-- 5. Tracked Legislation in Workspaces with Stances, Tags & Tasks
CREATE TABLE IF NOT EXISTS workspace_tracked_bills (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES team_workspaces(id) ON DELETE CASCADE,
  bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  stage TEXT DEFAULT 'monitoring', -- 'monitoring', 'analyzing', 'advocating', 'closed'
  organizational_stance TEXT DEFAULT 'neutral', -- 'support', 'oppose', 'monitor', 'amend'
  assigned_to_user_id TEXT REFERENCES users(id),
  custom_tags JSON, -- ['Defense Authorization', 'Tax Reform', 'High Priority Q3']
  internal_notes TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (workspace_id, bill_id)
);

-- 6. Team Tasks & Legislative Deadlines
CREATE TABLE IF NOT EXISTS workspace_tasks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES team_workspaces(id) ON DELETE CASCADE,
  bill_id TEXT REFERENCES bills(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  assigned_to TEXT REFERENCES users(id),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Documented Future Scope: Audit Log Stubs & Anonymized Session Flags
CREATE TABLE IF NOT EXISTS compliance_audit_log_stubs (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT, -- Null if anonymized research mode is toggled on
  action_type TEXT NOT NULL, -- 'view_bill', 'search_query', 'export_dossier', 'set_stance'
  resource_id TEXT NOT NULL,
  anonymized_mode BOOLEAN DEFAULT FALSE,
  client_ip_hash TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

