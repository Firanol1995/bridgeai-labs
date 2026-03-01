import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // RBAC: allow only admins
    // minimal check: read role from headers/cookie/session via NEXT_PUBLIC skip
    // Implement server-side auth in next step; for now require a special header
    // to avoid exposing metrics publicly in dev.
    // If header X-ADMIN-KEY matches process.env.ADMIN_API_KEY, allow; else 403.
    const adminKey = process.env.ADMIN_API_KEY
    if (adminKey) {
      // in edge runtime, headers must be read differently; we check env for now
      // TODO: replace with proper auth
    }
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

    // storage size not tracked in Prisma schema yet — return 0 as placeholder
    const storageUsed = 0

    return NextResponse.json({ projectsCount, datasetsCount, chartData, storageUsed })
  } catch (e) {
    // RBAC placeholder - in future replace with full server-side auth
    const adminKey = process.env.ADMIN_API_KEY
    if (adminKey) {
      // noop for now
    }

    // attempt DB reads, but degrade gracefully when DB unreachable
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
      console.warn('[api/dashboard/metrics] db unreachable, returning defaults:', dbErr?.message || dbErr)
      projectsCount = 0
      datasetsCount = 0
      chartData = []
    }

    const storageUsed = 0
    return NextResponse.json({ projectsCount, datasetsCount, chartData, storageUsed })
