import { describe, expect, it } from 'vitest'

import { getStartupEnvValidationErrors } from '../../scripts/env-validation.mjs'

function createEnv(overrides: Record<string, string> = {}) {
  return {
    NODE_ENV: 'test' as const,
    ...overrides,
  }
}

describe('startup env validation', () => {
  it('requires core production env vars', () => {
    const errors = getStartupEnvValidationErrors(createEnv())

    expect(errors).toContain('DATABASE_URL is required for production startup')
    expect(errors).toContain('NEXT_PUBLIC_SUPABASE_URL is required for production startup')
    expect(errors).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY is required for production startup')
    expect(errors).toContain('SUPABASE_SERVICE_ROLE or SUPABASE_KEY is required for production startup')
  })

  it('requires Redis only when queue mode is enabled', () => {
    const okWithoutQueue = getStartupEnvValidationErrors(createEnv({
      DATABASE_URL: 'postgres://example',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
      SUPABASE_SERVICE_ROLE: 'service-role',
    }))

    const queueErrors = getStartupEnvValidationErrors(createEnv({
      DATABASE_URL: 'postgres://example',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
      SUPABASE_SERVICE_ROLE: 'service-role',
      USE_QUEUE: '1',
    }))

    expect(okWithoutQueue).toEqual([])
    expect(queueErrors).toContain('REDIS_URL or REDIS is required when USE_QUEUE=1 or HEALTHCHECK_REQUIRE_REDIS=1')
  })
})
