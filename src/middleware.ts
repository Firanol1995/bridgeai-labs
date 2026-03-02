import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = new Set(['/api/copilot/respond', '/api/health', '/api/analytics/ingest'])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Only protect API routes by default
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  // Allow explicitly public API endpoints
  for (const p of publicPaths) {
    if (pathname.startsWith(p)) return NextResponse.next()
  }

  // Require Authorization header for other API routes
  const auth = req.headers.get('authorization')
  if (!auth) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

  // Optionally, we could validate the token format here, but leave full validation to route handlers
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
