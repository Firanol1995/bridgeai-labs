Backend
=======

Server-side code and utilities live under `backend/lib`.

Purpose:
- Centralize server-only helpers (Prisma client, Supabase admin client, storage, activity logger).
- Keep browser-safe code in `frontend/lib` and re-export stable paths from `src/lib` for compatibility.

Notes:
- Do not import `backend/lib` files directly into client bundles. Use `src/lib` re-exports where possible.
