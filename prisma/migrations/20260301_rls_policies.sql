-- RLS policies for BridgeAI Labs
-- Apply carefully using psql or Supabase SQL editor.

-- Enable row-level security on tables that store per-user data
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert/select/update/delete their own projects
CREATE POLICY projects_select_for_owner ON projects
  FOR SELECT USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY projects_insert_for_owner ON projects
  FOR INSERT WITH CHECK (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY projects_update_for_owner ON projects
  FOR UPDATE USING (user_id::text = auth.jwt() ->> 'sub') WITH CHECK (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY projects_delete_for_owner ON projects
  FOR DELETE USING (user_id::text = auth.jwt() ->> 'sub');

-- Datasets tied to projects: allow if the project belongs to the authenticated user
CREATE POLICY datasets_select_for_owner ON datasets
  FOR SELECT USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = datasets.project_id AND p.user_id::text = auth.jwt() ->> 'sub'));
CREATE POLICY datasets_insert_for_owner ON datasets
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = datasets.project_id AND p.user_id::text = auth.jwt() ->> 'sub'));
CREATE POLICY datasets_update_for_owner ON datasets
  FOR UPDATE USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = datasets.project_id AND p.user_id::text = auth.jwt() ->> 'sub')) WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = datasets.project_id AND p.user_id::text = auth.jwt() ->> 'sub'));
CREATE POLICY datasets_delete_for_owner ON datasets
  FOR DELETE USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = datasets.project_id AND p.user_id::text = auth.jwt() ->> 'sub'));

-- AI models similar to datasets
CREATE POLICY ai_models_select_for_owner ON ai_models
  FOR SELECT USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = ai_models.project_id AND p.user_id::text = auth.jwt() ->> 'sub'));
CREATE POLICY ai_models_insert_for_owner ON ai_models
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = ai_models.project_id AND p.user_id::text = auth.jwt() ->> 'sub'));
CREATE POLICY ai_models_update_for_owner ON ai_models
  FOR UPDATE USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = ai_models.project_id AND p.user_id::text = auth.jwt() ->> 'sub')) WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = ai_models.project_id AND p.user_id::text = auth.jwt() ->> 'sub'));
CREATE POLICY ai_models_delete_for_owner ON ai_models
  FOR DELETE USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = ai_models.project_id AND p.user_id::text = auth.jwt() ->> 'sub'));

-- Activity logs: owners can read their own logs
CREATE POLICY activity_logs_select_for_owner ON activity_logs
  FOR SELECT USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY activity_logs_insert_for_owner ON activity_logs
  FOR INSERT WITH CHECK (user_id::text = auth.jwt() ->> 'sub');

-- Note: service_role key bypasses RLS. Use service-role only on server side and never expose to clients.
