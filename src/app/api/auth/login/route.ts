import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import logger from '@/lib/logger'

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })

    const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')
    const publicAuthKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
    if (!supabaseUrl || !publicAuthKey) {
      return NextResponse.json({ error: 'Missing Supabase auth environment configuration' }, { status: 500 })
    }

    const supabaseAuth = createClient(supabaseUrl, publicAuthKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Authenticate using a public Supabase auth client so the response includes a user session.
    try {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
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
