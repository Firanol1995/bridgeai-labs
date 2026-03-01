# Deployment (Vercel)

Quick notes to deploy this Next.js app to Vercel and configure environment variables.

1) Build & runtime

- Framework: Next.js (App Router)
- Build command: `npm run build`
- Start command (Vercel handles this): not required

2) Required environment variables (add in Vercel Project > Settings > Environment Variables):

- `DATABASE_URL` — your Postgres connection string (used by Prisma).
- `SUPABASE_URL` — Supabase project URL (https://xyz.supabase.co).
- `SUPABASE_SERVICE_ROLE` — Supabase service role key (server-only). Mark this as "Encrypted" and do NOT expose to client.
- `NEXT_PUBLIC_SUPABASE_URL` — same as `SUPABASE_URL` for client use.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (client-safe).
- `NEXT_PUBLIC_SITE_URL` — e.g. `https://your-site.vercel.app`.
- `SENTRY_DSN` — optional Sentry DSN; set for production monitoring.

3) Security tips

- Never expose `SUPABASE_SERVICE_ROLE` to the browser. Only use it server-side.
- Rotate keys if they were committed or shared.

4) Post-deploy steps

- Apply the RLS policies (see `prisma/RLS_APPLY.md`) to enforce row-level access.
- Configure Sentry (set `SENTRY_DSN`) and confirm events are being captured.
