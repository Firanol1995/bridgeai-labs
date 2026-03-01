import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabaseServer'
import logger from '@/lib/logger'

export async function GET() {
  try {
    // DB check
    await prisma.$queryRaw`SELECT 1`

    // Supabase check
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const res = await fetch(supaUrl!, { method: 'GET' })
    if (!res.ok) return NextResponse.json({ ok: false, reason: 'supabase unreachable', status: res.status }, { status: 502 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('[GET /api/health] error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
