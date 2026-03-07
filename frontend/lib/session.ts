import { supabase } from './supabaseClient'

export async function setClientSession(session: { access_token?: string | null; refresh_token?: string | null }) {
  if (!session?.access_token || !session?.refresh_token) return
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
}

export async function signOutClient() { await supabase.auth.signOut() }

export default { setClientSession, signOutClient }
