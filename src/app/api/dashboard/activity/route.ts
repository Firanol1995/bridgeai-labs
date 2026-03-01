import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    // require admin header during dev to prevent public listing
    const parsedUrl = new URL(req.url)
    const adminKey = parsedUrl.searchParams.get('admin_key') || ''
    if (process.env.ADMIN_API_KEY && process.env.ADMIN_API_KEY !== adminKey) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
    const limit = Math.min(100, Number(parsedUrl.searchParams.get('limit') || '25'))

    const items = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
    return NextResponse.json(items)
  } catch (e) {
    console.error('[api/dashboard/activity] error:', e)
    return NextResponse.json({ error: 'failed to load activity' }, { status: 500 })
  }
}
