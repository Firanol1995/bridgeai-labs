import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import logger from '@/lib/logger'

async function getUserIdFromAuthHeader(req: Request) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  const token = auth.replace('Bearer ', '')
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error) return null
  return data.user ?? null
}

export async function GET(req: Request) {
  try {
    const user = await getUserIdFromAuthHeader(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ user })
    } catch (err) {
    logger.error('[GET /api/auth/me] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
