import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const projectsCount = await prisma.project.count()
    const datasetsCount = await prisma.dataset.count()

    // simple timeseries: last 7 days uploads
    const now = new Date()
    const chartData = [] as Array<{ date: string; uploads: number }>
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(now.getDate() - i)
      const start = new Date(day.setHours(0, 0, 0, 0))
      const end = new Date(day.setHours(23, 59, 59, 999))

      const uploads = await prisma.dataset.count({ where: { createdAt: { gte: start, lte: end } } })
      chartData.push({ date: start.toISOString().slice(0, 10), uploads })
    }

    const storageUsed = await prisma.dataset.aggregate({ _sum: { sizeBytes: true } }).then(r => r._sum.sizeBytes || 0)

    return NextResponse.json({ projectsCount, datasetsCount, chartData, storageUsed })
  } catch (e) {
    console.error('[api/dashboard/metrics] error:', e)
    return NextResponse.json({ error: 'failed to load metrics' }, { status: 500 })
  }
}
