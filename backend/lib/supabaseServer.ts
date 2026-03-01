import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE (service role key)')
}

if (typeof supabaseServiceKey === 'string' && supabaseServiceKey.includes('publishable')) {
  console.warn('Supabase server key appears to be a publishable/anon key. Please set SUPABASE_SERVICE_ROLE to your service role key for server-side operations.')
}

if (process.env.NODE_ENV !== 'production') {
  try {
    const k = String(supabaseServiceKey || '')
    const prefix = k.slice(0, 8)
    console.debug(`[supabaseServer] service key prefix=${prefix} length=${k.length}`)
  } catch (e) {
    console.debug('[supabaseServer] failed to read service key for debug')
  }
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})
