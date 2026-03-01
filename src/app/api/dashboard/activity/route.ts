import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Math.min(100, Number(url.searchParams.get('limit') || '25'))

    const items = await prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
    return NextResponse.json(items)
  } catch (e) {
    console.error('[api/dashboard/activity] error:', e)
    return NextResponse.json({ error: 'failed to load activity' }, { status: 500 })
  }
}
