import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import logger from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })

    // Create the user using the Supabase Admin API (service role key)
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({ 
        email, 
        password,
        email_confirm: true  // Auto-confirm email for development
      })
      if (error) {
        logger.error('[POST /api/auth/signup] supabase error', error)
        // fall through to fallback below when key is invalid
        if (String(error.message).toLowerCase().includes('invalid api key') || error.status === 401) {
          throw new Error('InvalidApiKey')
        }
        return NextResponse.json({ error: error.message, details: error }, { status: 400 })
      }

      return NextResponse.json({ data })
    } catch (err: any) {
      // If the service key call failed due to an API key mismatch, try a direct REST fallback
      if (String(err.message).includes('InvalidApiKey') || String(err.message).toLowerCase().includes('invalid api key')) {
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY
          if (!supabaseUrl || !serviceKey) {
            return NextResponse.json({ error: 'Missing Supabase server env for fallback' }, { status: 500 })
          }

          const r = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${serviceKey}`,
              apikey: serviceKey,
            },
            body: JSON.stringify({ email, password }),
          })

          const json = await r.json().catch(() => ({}))
          if (!r.ok) {
            logger.error('[POST /api/auth/signup] fallback rest error', { status: r.status, body: json })
            return NextResponse.json({ error: json?.message ?? 'Fallback signup failed', details: json }, { status: r.status })
          }
          return NextResponse.json({ data: json })
        } catch (restErr: any) {
          logger.error('[POST /api/auth/signup] fallback exception', restErr)
          return NextResponse.json({ error: String(restErr?.message ?? restErr), details: restErr }, { status: 500 })
        }
      }

      logger.error('[POST /api/auth/signup] supabase exception', err)
      return NextResponse.json({ error: String(err?.message ?? err), details: err }, { status: 500 })
    }
  } catch (err: any) {
    logger.error('[POST /api/auth/signup] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
