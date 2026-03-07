import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'

export async function GET(req: Request) {
  try {
    // require admin header during dev to prevent public listing
    // require admin session
    const user = await getUserFromRequest(req as any)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      requireRole(user.role, 'admin')
    } catch (err) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const parsedUrl = new URL(req.url)
    const limit = Math.min(100, Number(parsedUrl.searchParams.get('limit') || '25'))

    let items: Awaited<ReturnType<typeof prisma.activityLog.findMany>> = []
    try {
      items = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
    } catch (dbErr) {
      const message = dbErr instanceof Error ? dbErr.message : String(dbErr)
      console.warn('[api/dashboard/activity] db unreachable, returning empty list:', message)
      items = []
    }
    return NextResponse.json(items)
  } catch (e) {
    console.error('[api/dashboard/activity] error:', e)
    return NextResponse.json({ error: 'failed to load activity' }, { status: 500 })
  }
}
