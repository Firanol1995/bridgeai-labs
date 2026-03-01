<#
Apply the RLS SQL migration to the database.

Usage (PowerShell):
  # using psql (requires psql in PATH and DATABASE_URL env var set)
  $env:DATABASE_URL = "your_database_url_here"
  .\scripts\apply_rls.ps1

  # or set SUPABASE_SERVICE_ROLE and SUPABASE_URL and use supabase CLI / SQL editor
#>

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL not set. Set the DATABASE_URL environment variable to your Postgres connection string."
  exit 1
}

$sqlFile = Join-Path -Path $PSScriptRoot -ChildPath "..\prisma\migrations\20260301_rls_policies.sql"

if (-not (Test-Path $sqlFile)) {
  Write-Error "RLS SQL file not found: $sqlFile"
  exit 1
}

Write-Host "Applying RLS SQL from $sqlFile to database..."

#$env:DATABASE_URL should be a Postgres connection string suitable for psql
& psql $env:DATABASE_URL -f $sqlFile

if ($LASTEXITCODE -ne 0) {
  Write-Error "psql exited with code $LASTEXITCODE"
  exit $LASTEXITCODE
}

Write-Host "RLS SQL applied successfully."
