import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requirePageAuth(fromPath: string) {
  const cookieStore = await cookies()
  const requestHeaders = await headers()
  const authHeader = requestHeaders.get('authorization')
  const hasSupabaseCookie = cookieStore
    .getAll()
    .some((cookie) => cookie.name.includes('sb-') || cookie.name.includes('supabase'))

  if (!authHeader && !hasSupabaseCookie) {
    redirect(`/login?from=${encodeURIComponent(fromPath)}`)
  }
}
