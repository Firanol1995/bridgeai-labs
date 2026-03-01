"use client"
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!url || !anonKey) {
  console.warn('[supabaseClient] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set')
}

export const supabase = createClient(url, anonKey)

export default supabase
export * from '../../frontend/lib/supabaseClient'
export { supabase } from '../../frontend/lib/supabaseClient'
