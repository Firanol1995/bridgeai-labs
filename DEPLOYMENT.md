# Deployment

This runbook is the release contract for this repository. The codebase is currently go-ready for development and staging. Production deployment is also code-ready, but it still requires real environment secrets to pass startup validation.

## Platform assumptions

- Framework: Next.js App Router
- Build command: `npm run build`
- Verification command: `npm run verify`
- Production start command outside Vercel-style managed hosting: `npm run start`
- Hosting note: Vercel handles the runtime start command automatically, but the same env requirements still apply

## Environment matrix

Set these in your deploy target before promoting a release.

| Variable | Required in dev/staging | Required in production | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes for real DB-backed staging, optional for local fallback dev | Yes | Required by Prisma and production startup validation |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes when using Supabase auth | Yes | Public client URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes when using Supabase auth | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE` | Recommended | Yes, unless `SUPABASE_KEY` is set | Server-only secret |
| `SUPABASE_KEY` | Optional compatibility alias | Yes, if `SUPABASE_SERVICE_ROLE` is not set | Server-only secret |
| `SUPABASE_URL` | Optional compatibility alias | Optional | Server-side alias for the same Supabase project URL |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Recommended | Canonical application URL |
| `REDIS_URL` | Only when queue mode is enabled | Required when `USE_QUEUE=1` or `HEALTHCHECK_REQUIRE_REDIS=1` | Queue and Redis health checks |
| `USE_QUEUE` | Optional | Optional | Enables queued background processing |
| `OPENAI_API_KEY` | Only if AI flows are enabled | Required if AI routes or embeddings are part of the release scope | Not currently startup-enforced |
| `SENTRY_DSN` | Optional | Recommended | Production monitoring |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Optional | Client-side Sentry if used |
| `HEALTHCHECK_REQUIRE_DB` | Usually `0` | Set to `1` if DB is a readiness requirement | Controls `/api/health` semantics |
| `HEALTHCHECK_REQUIRE_SUPABASE` | Usually `0` | Set to `1` if Supabase is a readiness requirement | Controls `/api/health` semantics |
| `HEALTHCHECK_REQUIRE_REDIS` | Usually `0` | Set to `1` if Redis is a readiness requirement | Controls `/api/health` semantics |
| `ADMIN_API_KEY` | Optional | Optional | Extra protection for dashboard admin endpoints during early rollout |

## Production startup contract

`npm run start` validates environment variables before Next.js starts.

Current hard requirements enforced by the startup validator:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- one of `SUPABASE_SERVICE_ROLE` or `SUPABASE_KEY`
- `REDIS_URL` or `REDIS` when `USE_QUEUE=1` or `HEALTHCHECK_REQUIRE_REDIS=1`

The validator loads env files in this order before checking values:

- `.env.production.local`
- `.env.local`
- `.env.production`
- `.env`

## Strict go-live sequence

Run these in order. A failure at any step is a no-go.

1. `npm run validate:startup-env`
2. `npm run verify`
3. `npm run start`
4. Probe `/api/health`
5. Probe `/dashboard`, `/projects`, `/settings`, and `/api/projects` as an unauthenticated user
6. Log in with a real user and smoke-test one authenticated workflow
7. If queue mode is enabled, enqueue one job and verify worker completion
8. If Sentry is enabled, send one controlled error and confirm ingestion

## Vercel deployment

Use this path if the app is deployed as a standard Next.js application on Vercel.

1. Create or open the Vercel project for this repository
2. Set the framework preset to Next.js if Vercel does not auto-detect it
3. Set the build command to `npm run build`
4. Leave the install command as your package-manager default unless your org requires an override
5. Add the required production env vars from the matrix above in Project Settings > Environment Variables
6. Add the same env vars to Preview if staging or preview deployments must behave like production
7. Trigger a deployment
8. After deploy, validate `/api/health`, unauthenticated redirects, and one authenticated workflow

Vercel notes:

- Vercel does not require you to run `npm run start` manually, but the same env contract still applies
- If background workers are required, do not assume Vercel serverless functions replace a persistent BullMQ worker
- If queue mode is enabled, deploy the worker separately on infrastructure that can keep a long-lived process alive

## Self-hosted Node deployment

Use this path for a VM, container host, or platform that runs a long-lived Node process.

1. Provision Node compatible with Next.js 16 and this dependency tree
2. Pull the release artifact or repository revision
3. Install dependencies with your production package manager flow
4. Set the required production env vars
5. Run `npm run validate:startup-env`
6. Run `npm run verify`
7. Run `npm run start`
8. Put the service behind your reverse proxy or load balancer
9. Probe `/api/health` and the protected routes after the process is live

Self-hosted notes:

- `npm run start` is the correct runtime entrypoint because it performs startup validation before booting Next.js
- If you enable queue mode, run the web app and worker as separate processes
- If you use Windows for packaging, the build wrapper already handles the locked Prisma engine edge case described below

## Worker deployment

If `USE_QUEUE=1`, deployment is not complete until the worker is running.

1. Ensure Redis is reachable from both the web app and the worker
2. Build the worker with `npm run build:worker`
3. Run the worker with `npm run worker:run`
4. Enqueue one job and verify completion before calling the release complete

If queue mode is off, the worker is not required for go-live.

## Expected results

- `npm run validate:startup-env` exits 0
- `npm run verify` exits 0
- `npm run start` boots without runtime env failures
- `/api/health` returns `200` and reports required services as `ok`
- Protected pages redirect unauthenticated users
- Protected APIs return `401` when unauthenticated

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE` or `SUPABASE_KEY` to the browser
- Treat all non-`NEXT_PUBLIC_*` secrets as server-only
- Rotate any secret that has ever been committed, copied into client code, or shared insecurely

## Post-deploy checks

- Apply RLS policies if your target environment requires them
- Confirm Sentry receives production server errors if enabled
- Review logs for repeated fallback warnings, especially Supabase or DB-related warnings
- Confirm dashboard endpoints behave as intended if `ADMIN_API_KEY` is enabled

## Known Windows note

On this Windows workstation, Prisma can hit a locked `query_engine-windows.dll.node` during `prisma generate`. The repository build wrapper now reuses an existing generated Prisma client in that specific locked-file case so `npm run build` stays repeatable. This is a local Windows packaging workaround, not a production runtime dependency.
