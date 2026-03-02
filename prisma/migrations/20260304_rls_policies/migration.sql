-- Row-Level Security policies for multi-tenant isolation and roles
-- Assumes `users` table has `id`, `role`, and `organization_id` columns

-- Enable RLS on core tables
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_embeddings_vector ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow service role (identified by function check) to bypass RLS
CREATE FUNCTION IF NOT EXISTS is_service_role() RETURNS boolean AS $$
  BEGIN
    -- This placeholder relies on server-side connections using the service role key
    RETURN current_setting('request.jwt.claims.role', true) = 'service_role';
  EXCEPTION WHEN others THEN
    RETURN false;
  END;
$$ LANGUAGE plpgsql STABLE;

-- Policy: owners (users from same organization) can SELECT/INSERT/UPDATE/DELETE their rows
CREATE POLICY projects_tenant_isolation ON projects USING (
  (project_owner_org() IS TRUE) OR is_service_role()
);

-- Helper function to check if current JWT organization matches the row
CREATE FUNCTION IF NOT EXISTS project_owner_org() RETURNS boolean AS $$
DECLARE
  org_id TEXT;
BEGIN
  BEGIN
    org_id := current_setting('request.jwt.claims.org_id', true);
  EXCEPTION WHEN others THEN
    org_id := NULL;
  END;
  IF org_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN org_id::text = (SELECT organization_id::text FROM projects WHERE projects.id::text = current_setting('request.jwt.claims.row_id', true));
EXCEPTION WHEN others THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Note: The above functions are conservative placeholders.
-- Applying RLS requires careful mapping of JWT claims to `request.jwt.claims.*` settings by the API gateway or Supabase.
