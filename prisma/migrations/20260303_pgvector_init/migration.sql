-- Enable pgvector extension and create a pgvector-backed embeddings table
CREATE EXTENSION IF NOT EXISTS vector;

-- New table using pgvector for efficient nearest-neighbor search
CREATE TABLE IF NOT EXISTS ai_embeddings_vector (
  id bigserial PRIMARY KEY,
  record_id text UNIQUE NOT NULL,
  project_id text,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Index for approximate nearest neighbor (uses ivfflat -- requires REINDEX after populate)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ai_embeddings_vector_embedding_idx') THEN
    EXECUTE 'CREATE INDEX ai_embeddings_vector_embedding_idx ON ai_embeddings_vector USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)';
  END IF;
EXCEPTION WHEN undefined_function THEN
  -- ivfflat may not be available depending on pgvector build; skip gracefully
  RAISE NOTICE 'ivfflat index creation skipped (not supported)';
END$$;
