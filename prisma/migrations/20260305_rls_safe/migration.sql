-- Safe RLS migration: enable RLS on key tables and create helper functions
-- WARNING: review and adapt these policies to your JWT claim names and schema

-- Example: create function to read user_id from JWT claims (Supabase uses 'sub' or custom claims)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT (current_setting('jwt.claims.user_id', true))::uuid
$$;

-- Enable RLS and policy on projects table
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS project_owner_policy ON public.projects
  USING (owner_id = public.current_user_id());

-- Enable RLS and policy on datasets table
ALTER TABLE IF NOT EXISTS public.datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS dataset_owner_policy ON public.datasets
  USING (owner_id = public.current_user_id());

-- Note: adapt `jwt.claims.user_id` to your JWT claim mapping (e.g., 'sub' or 'user_id')
