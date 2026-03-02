-- Enterprise-ready, non-destructive migration for BridgeAI Labs
-- This migration uses IF NOT EXISTS so it is safe to add to an existing DB.
-- It does NOT DROP or ALTER existing tables.

-- Enable pgcrypto for UUID generation (harmless if already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    CREATE TYPE role AS ENUM ('ADMIN', 'ENGINEER', 'CLIENT', 'USER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'projectstatus') THEN
    CREATE TYPE projectstatus AS ENUM ('ACTIVE','ARCHIVED','PAUSED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'modelstatus') THEN
    CREATE TYPE modelstatus AS ENUM ('DRAFT','TRAINING','DEPLOYED','RETIRED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pipelinestatus') THEN
    CREATE TYPE pipelinestatus AS ENUM ('IDLE','RUNNING','FAILED','SUCCEEDED');
  END IF;
END $$;

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  name text,
  email text UNIQUE NOT NULL,
  role role DEFAULT 'USER',
  created_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status projectstatus DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now()
);

-- AI Models
CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  status modelstatus DEFAULT 'DRAFT',
  created_at timestamptz DEFAULT now()
);

-- Model Versions
CREATE TABLE IF NOT EXISTS model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES ai_models(id) ON DELETE CASCADE,
  version text NOT NULL,
  artifact_url text,
  metrics jsonb,
  created_at timestamptz DEFAULT now()
);

-- Datasets
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  storage_path text,
  size integer,
  metadata jsonb,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Pipelines
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  status pipelinestatus DEFAULT 'IDLE',
  last_run_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Usage Events
CREATE TABLE IF NOT EXISTS usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  metadata jsonb,
  ip text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  diff jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes to help analytics queries (non-blocking)
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_project ON usage_events(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
