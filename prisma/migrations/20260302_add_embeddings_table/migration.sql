-- Add ai_embeddings table to store embeddings as JSON for safe demo indexing
CREATE TABLE IF NOT EXISTS ai_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  record_id text NOT NULL,
  embedding jsonb NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_embeddings_project ON ai_embeddings(project_id);
