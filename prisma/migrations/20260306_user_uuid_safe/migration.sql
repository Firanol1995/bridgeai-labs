-- Safe, non-destructive migration to introduce UUID `user_uuid` identifiers
-- and nullable UUID reference columns for related tables.
-- This migration does NOT remove or alter existing `id` columns.
-- It is intended to be applied to databases where `users.id` may be bigint
-- (legacy) to gradually migrate the application to use UUIDs.

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Add `user_uuid` to users and populate it where missing
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS user_uuid uuid;

UPDATE users
SET user_uuid = gen_random_uuid()
WHERE user_uuid IS NULL;

-- Make the column non-nullable once populated
ALTER TABLE users
  ALTER COLUMN user_uuid SET NOT NULL;

-- Add a unique index for quick lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_uuid ON users(user_uuid);

-- 2) Add nullable UUID reference columns to referencing tables
-- Projects.owner -> projects.owner_user_uuid
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_user_uuid uuid;
-- Datasets.uploaded_by -> datasets.uploaded_by_user_uuid
ALTER TABLE datasets ADD COLUMN IF NOT EXISTS uploaded_by_user_uuid uuid;
-- Usage events.user_id -> usage_events.user_uuid
ALTER TABLE usage_events ADD COLUMN IF NOT EXISTS user_uuid uuid;
-- Activity logs.user_id -> activity_logs.user_uuid
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_uuid uuid;
-- Audit logs.actor_id -> audit_logs.actor_user_uuid
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_user_uuid uuid;

-- 3) Backfill reference UUID columns where we can map via the legacy numeric id
-- This uses equality against the existing `id` column; works when legacy ids are numeric
-- and referencing columns match that numeric value.
-- projects.owner_id may be bigint or text; this update attempts a safe join.
DO $$
BEGIN
  -- Projects
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='owner_id') THEN
    EXECUTE $$
      UPDATE projects p
      SET owner_user_uuid = u.user_uuid
      FROM users u
      WHERE p.owner_id IS NOT NULL AND p.owner_id::text = u.id::text;
    $$;
  END IF;

  -- Datasets
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='datasets' AND column_name='uploaded_by') THEN
    EXECUTE $$
      UPDATE datasets d
      SET uploaded_by_user_uuid = u.user_uuid
      FROM users u
      WHERE d.uploaded_by IS NOT NULL AND d.uploaded_by::text = u.id::text;
    $$;
  END IF;

  -- Usage events
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usage_events' AND column_name='user_id') THEN
    EXECUTE $$
      UPDATE usage_events ue
      SET user_uuid = u.user_uuid
      FROM users u
      WHERE ue.user_id IS NOT NULL AND ue.user_id::text = u.id::text;
    $$;
  END IF;

  -- Activity logs
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_logs' AND column_name='user_id') THEN
    EXECUTE $$
      UPDATE activity_logs al
      SET user_uuid = u.user_uuid
      FROM users u
      WHERE al.user_id IS NOT NULL AND al.user_id::text = u.id::text;
    $$;
  END IF;

  -- Audit logs
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='actor_id') THEN
    EXECUTE $$
      UPDATE audit_logs a
      SET actor_user_uuid = u.user_uuid
      FROM users u
      WHERE a.actor_id IS NOT NULL AND a.actor_id::text = u.id::text;
    $$;
  END IF;
END $$;

-- 4) Add indexes on new UUID reference columns to support queries
CREATE INDEX IF NOT EXISTS idx_projects_owner_user_uuid ON projects(owner_user_uuid);
CREATE INDEX IF NOT EXISTS idx_datasets_uploaded_by_user_uuid ON datasets(uploaded_by_user_uuid);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_uuid ON usage_events(user_uuid);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_uuid ON activity_logs(user_uuid);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_uuid ON audit_logs(actor_user_uuid);

-- 5) Guidance: The application should be updated to write `user_uuid` into new records
-- moving forward. After rollout and verification, consider:
--  - switching the application to read `user_uuid` primarily
--  - optionally adding NOT NULL constraints on reference UUIDs and removing legacy numeric FK columns
-- Those steps are intentionally NOT included here to keep this migration non-destructive.
