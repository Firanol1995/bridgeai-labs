# BridgeAI Labs

Production-ready starter for an AI analytics platform using Next.js App Router, TypeScript, Prisma, and Supabase.

Features added so far
- Next.js App Router structure
- Prisma ORM + singleton client
- Supabase client (client + server-side service key)
- Auth (login/signup) pages using Supabase
- Protected API routes: `/api/projects`, `/api/datasets`
- Server-side helpers: `supabaseServer`, `storage`, `activity` logging
- Basic dashboard and Projects UI

Getting started (local)
1. Install dependencies:
```bash
npm install
```

2. Create `.env` or `.env.local` with required vars (example):
```
DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/<db>?schema=public"
SUPABASE_URL="https://<your>.supabase.co"
SUPABASE_KEY="<service-role-key>"
NEXT_PUBLIC_SUPABASE_URL="https://<your>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
SUPABASE_BUCKET_NAME="datasets"
```

3. Generate Prisma client (already done if you ran `npx prisma generate`):
```bash
npx prisma generate
```

4. Push Prisma schema to the DB (safe option: `db push`):
```bash
npx prisma db push
npx prisma generate
```

5. Start dev server:
```bash
npm run dev
```

Important notes
- The code contains server-side operations that require a Supabase *service role* key in `SUPABASE_KEY`. Keep this secret out of client bundles.
- Middleware redirects unauthenticated users to `/login`; API routes verify tokens server-side.
- The Prisma schema added a UNIQUE constraint on `users.email`. If your DB has duplicate emails, `db push` may fail — inspect and deduplicate before applying to production.

Deployment
- Vercel: Add env vars in the Vercel dashboard, build with `npm run build`, and deploy. Ensure `SUPABASE_KEY` is set as a server-only secret.

Next steps
- Improve UI components and accessibility
- Add analytics pages and AI model management
- Harden RLS policies in Supabase to enforce per-user access

License: MIT
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
