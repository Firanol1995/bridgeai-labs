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

function mapAuthError(error: { message?: string; code?: string; status?: number } | null | undefined) {
  const message = String(error?.message ?? '').toLowerCase()
  const code = String(error?.code ?? '').toLowerCase()

  if (message.includes('rate limit') || message.includes('too many requests') || code.includes('over_email_send_rate_limit')) {
    return 'Too many signup attempts right now. Please wait a few minutes and try again.'
  }

  if (code === 'email_address_invalid' || message.includes('email address') && message.includes('invalid')) {
    return 'Please enter a valid email address.'
  }

  if (message.includes('password')) {
    return error?.message ?? 'Please use a stronger password.'
  }

  if (message.includes('user already registered') || code === 'user_already_exists') {
    return 'An account with that email already exists. Try logging in instead.'
  }

  return error?.message ?? 'Signup failed.'
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

    // Create the user using the public Supabase auth flow so the account is compatible with normal sign-in.
    try {
      const { data, error } = await supabaseAuth.auth.signUp({ email, password })
      if (error) {
        logger.error('[POST /api/auth/signup] supabase error', error)
        return NextResponse.json({ error: mapAuthError(error), details: error }, { status: error.status || 400 })
      }

      return NextResponse.json({ data })
    } catch (err: any) {
      logger.error('[POST /api/auth/signup] supabase exception', err)
      return NextResponse.json({ error: String(err?.message ?? err), details: err }, { status: 500 })
    }
  } catch (err: any) {
    logger.error('[POST /api/auth/signup] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
