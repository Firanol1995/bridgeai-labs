"use client"
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function makeFallback() {
  return {
    from: () => ({ select: async () => { throw new Error('Supabase client not configured') } }),
    auth: {
      signUp: async () => { throw new Error('Supabase client not configured') },
      signInWithPassword: async () => { throw new Error('Supabase client not configured') },
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    storage: {
      from: () => ({ upload: async () => { throw new Error('Supabase client not configured') }, getPublicUrl: (p: string) => ({ data: { publicUrl: p } }) })
    }
  }
}

export const supabase: any = url && anonKey ? createClient(url, anonKey) : makeFallback()

export async function getSupabaseClient() {
  return supabase
}

export default getSupabaseClient

// Backwards-compatible named export for code that imports `supabase` synchronously.
// The exported `supabase` object above now matches the real client shape when
// configured, and falls back to a no-op implementation otherwise.
