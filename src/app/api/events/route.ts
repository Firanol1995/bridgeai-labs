import { NextResponse } from 'next/server'
import prisma from '../../../../backend/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { eventType, userId, payload } = body || {}
    if (!eventType) return NextResponse.json({ error: 'missing eventType' }, { status: 400 })

    try {
      await prisma.analyticsEvent.create({ data: { eventType, userId: userId ?? null, payload: payload ?? null } })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[events] db save failed', e)
    }

    // TODO: forward to external analytics provider if configured

    return NextResponse.json({ status: 'ok' })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[events] error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
