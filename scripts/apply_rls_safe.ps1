Param(
  [switch]$WhatIfRun
)

Write-Host "This script will apply Row-Level Security policies to your database using psql."
Write-Host "It requires the environment variable DATABASE_URL to be set and psql available on PATH."

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL is not set. Aborting."
  exit 1
}

$confirm = $false
if (-not $WhatIfRun) {
  Write-Host "To proceed, re-run with -WhatIfRun to preview the SQL, or set -WhatIfRun to actually run in dry mode." -ForegroundColor Yellow
  $confirm = $true
}

$sql = @'
-- Example safe RLS policy: allow users to access rows where owner_id = current_user_id()
-- Replace functions/current_user claims mapping as appropriate for your JWT

-- Enable RLS on key tables (example)
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "project_owner_policy" ON projects
  FOR ALL USING (owner_id = current_setting('jwt.claims.user_id', true)::uuid);

'@

Write-Host "Preview of RLS SQL to apply:`n"; Write-Host $sql

if ($WhatIfRun) {
  Write-Host "Would execute the SQL against DATABASE_URL (dry-run)."
  exit 0
}

Write-Host "Applying RLS SQL now..."
psql $env:DATABASE_URL -c $sql
