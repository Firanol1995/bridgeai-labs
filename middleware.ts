import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_FILE = /\.(.*)$/

function hasAuth(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth && auth.startsWith('Bearer ')) return true

  const cookie = req.headers.get('cookie') ?? ''
  // Check for common Supabase client session cookie names
  if (cookie.includes('sb-') || cookie.includes('supabase')) return true

  return false
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Ignore public files
  if (PUBLIC_FILE.test(pathname)) return NextResponse.next()

  // Protect these routes
  const protectedPaths = ['/dashboard', '/projects', '/settings', '/app']
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!hasAuth(req)) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/settings/:path*', '/app/:path*'],
}
