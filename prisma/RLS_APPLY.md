# Applying RLS policies

This repository includes a drafted RLS SQL migration at `prisma/migrations/20260301_rls_policies.sql`.

You can apply it using one of the two approaches below.

1) Using psql (recommended when you have a direct DB connection):

  - Ensure `DATABASE_URL` is set to your Postgres connection string (for Supabase this is the DB connection provided in project settings).
  - From repo root run (PowerShell):

```powershell
$env:DATABASE_URL = "postgres://..."
.\scripts\apply_rls.ps1
```

2) Using the Supabase SQL editor:

  - Open your Supabase project, go to SQL Editor, paste the contents of `prisma/migrations/20260301_rls_policies.sql`, and run it.

Important notes:

- RLS will restrict access to rows by default once enabled. Ensure you test with a server-side `service_role` key and a client `anon` key.
- The `service_role` key bypasses RLS; never expose it to clients.
- Test thoroughly in a staging DB before applying to production.
