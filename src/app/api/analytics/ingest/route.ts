import { NextResponse } from 'next/server'
import prisma from '@/server/lib/prisma'

export async function POST(req: Request) {
  try {
    const { eventType, payload } = await req.json()

    // lightweight validation
    if (!eventType) return NextResponse.json({ error: 'missing eventType' }, { status: 400 })

    // persist for analytics processing
    await prisma.usageEvent.create({ data: { projectId: payload.projectId || '', userId: payload.userId || null, eventType, payload } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
