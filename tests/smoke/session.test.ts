import { beforeEach, describe, expect, it, vi } from 'vitest'

const setSession = vi.fn()
const signOut = vi.fn()

vi.mock('../../frontend/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      setSession,
      signOut,
    },
  },
}))

describe('session smoke', () => {
  beforeEach(() => {
    setSession.mockReset()
    signOut.mockReset()
  })

  it('does not set a client session without both tokens', async () => {
    const { setClientSession } = await import('../../frontend/lib/session')

    await setClientSession({ access_token: 'token', refresh_token: null })
    await setClientSession({ access_token: null, refresh_token: 'refresh' })

    expect(setSession).not.toHaveBeenCalled()
  })

  it('sets a client session when both tokens are present', async () => {
    const { setClientSession } = await import('../../frontend/lib/session')

    await setClientSession({ access_token: 'token', refresh_token: 'refresh' })

    expect(setSession).toHaveBeenCalledWith({
      access_token: 'token',
      refresh_token: 'refresh',
    })
  })
})
