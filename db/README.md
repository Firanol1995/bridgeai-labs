Database / Prisma
=

Primary DB schema and migrations live under `prisma/` (Prisma expects `prisma/` at repo root).

Recommended practice:

- Keep migrations in `prisma/migrations/`.
- Use `npx prisma migrate dev` during local development.
- Use `npx prisma migrate deploy` in CI for production.
- Use `scripts/apply_rls.ps1` or Supabase SQL editor to apply RLS policies.
