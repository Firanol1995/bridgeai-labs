import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_FILE = /\.(.*)$/
const publicApiPaths = new Set(['/api/copilot/respond', '/api/health', '/api/analytics/ingest'])
const protectedPagePaths = ['/dashboard', '/projects', '/settings', '/app']

function hasAuth(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth && auth.startsWith('Bearer ')) return true

  const cookie = req.headers.get('cookie') ?? ''
  if (cookie.includes('sb-') || cookie.includes('supabase')) return true

  return false
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_FILE.test(pathname)) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    for (const publicPath of publicApiPaths) {
      if (pathname.startsWith(publicPath)) return NextResponse.next()
    }

    const auth = req.headers.get('authorization')
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return NextResponse.next()
  }

  if (protectedPagePaths.some((pagePath) => pathname.startsWith(pagePath))) {
    if (!hasAuth(req)) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/projects/:path*', '/settings/:path*', '/app/:path*'],
}