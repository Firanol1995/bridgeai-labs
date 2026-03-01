import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import logger from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })

    // Authenticate using server-side Supabase (service role key)
    try {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
      if (error) {
        logger.error('[POST /api/auth/login] supabase error', error)
        return NextResponse.json({ error: error.message, details: error }, { status: 400 })
      }

      // return session to client (client will call supabase.auth.setSession)
      return NextResponse.json({ data })
    } catch (err: any) {
      logger.error('[POST /api/auth/login] supabase exception', err)
      return NextResponse.json({ error: String(err?.message ?? err), details: err }, { status: 500 })
    }
  } catch (err: any) {
    logger.error('[POST /api/auth/login] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
