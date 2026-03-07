import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'

export async function GET(req: Request) {
  try {
    // enforce admin session role
    const user = await getUserFromRequest(req as any)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      requireRole(user.role, 'admin')
    } catch (e) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let projectsCount = 0
    let datasetsCount = 0
    let chartData: Array<{ date: string; uploads: number }> = []

    try {
      projectsCount = await prisma.project.count()
      datasetsCount = await prisma.dataset.count()

      const now = new Date()
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now)
        day.setDate(now.getDate() - i)
        const start = new Date(day.setHours(0, 0, 0, 0))
        const end = new Date(day.setHours(23, 59, 59, 999))

        const uploads = await prisma.dataset.count({ where: { createdAt: { gte: start, lte: end } } })
        chartData.push({ date: start.toISOString().slice(0, 10), uploads })
      }
    } catch (dbErr) {
      const message = dbErr instanceof Error ? dbErr.message : String(dbErr)
      console.warn('[api/dashboard/metrics] db unreachable, returning defaults:', message)
      projectsCount = 0
      datasetsCount = 0
      chartData = []
    }

    const storageUsed = 0
    return NextResponse.json({ projectsCount, datasetsCount, chartData, storageUsed })
  } catch (e) {
    console.error('[api/dashboard/metrics] error:', e)
    return NextResponse.json({ error: 'failed to load metrics' }, { status: 500 })
  }
}
