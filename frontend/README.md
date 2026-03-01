Frontend
========

Client-side helpers live under `frontend/lib` (browser-safe):

- `supabaseClient.ts` — initialize `@supabase/supabase-js` with `NEXT_PUBLIC` keys
- `fetcher.ts` — small `apiFetch` wrapper for browser
- `session.ts` — client session helpers

Import these via `src/lib/*` re-exports to avoid changing existing imports.
