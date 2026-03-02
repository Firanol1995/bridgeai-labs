import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function requireAuth(req: NextRequest) {
  const user = await getUserFromRequest(req as any)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return user
}

export function requireRole(user: any, roles: string[]) {
  if (!user) return false
  const r = (user.role || '').toLowerCase()
  if (roles.map((x) => x.toLowerCase()).includes(r)) return true
  return false
}
