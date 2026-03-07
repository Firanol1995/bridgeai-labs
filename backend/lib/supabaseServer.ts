// Lazy-load the real `@supabase/supabase-js` at runtime when available.
// If it's not installed in the dev environment, provide a minimal fallback
// implementation so server routes can still run without the real client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase server environment variables; continuing with fallback admin client for local dev')
}

if (typeof supabaseServiceKey === 'string' && supabaseServiceKey.includes('publishable')) {
  console.warn('Supabase server key appears to be a publishable/anon key. Please set SUPABASE_SERVICE_ROLE to your service role key for server-side operations.')
}

function makeFallbackAdmin() {
  return {
    from: () => ({
      select: async () => { throw new Error('Supabase admin client not configured') },
      upsert: async () => ({ error: new Error('Supabase admin client not configured') }),
      delete: () => ({ in: async () => ({ error: new Error('Supabase admin client not configured') }) }),
      limit: async () => ({ data: [], error: null }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null } }),
      signInWithPassword: async () => ({ data: null, error: null }),
      admin: {
        createUser: async () => ({ data: null, error: null })
      }
    },
    storage: {
      from: () => ({ upload: async () => ({ error: new Error('Supabase admin client not configured') }), getPublicUrl: (p: string) => ({ data: { publicUrl: p } }) })
    }
  }
}

let _admin: any = null

function getAdminClient() {
  if (_admin) return _admin
  try {
    // Use require at runtime to avoid static bundler resolution
    // eslint-disable-next-line no-eval
    const req = eval('require')
    const mod = req('@supabase/supabase-js')
    const createClient = mod.createClient || mod.default?.createClient || mod
    _admin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  } catch (e) {
    console.warn('[supabaseServer] @supabase/supabase-js not installed; using fallback admin client')
    _admin = makeFallbackAdmin()
  }
  return _admin
}

export const supabaseAdmin: any = new Proxy({} as any, {
  get(_, prop: string) {
    const client = getAdminClient()
    return (client as any)[prop]
  }
})
