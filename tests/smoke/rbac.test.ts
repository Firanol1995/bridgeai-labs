import { describe, expect, it } from 'vitest'

import { hasRole } from '../../backend/lib/rbac'

describe('rbac smoke', () => {
  it('matches roles case-insensitively', () => {
    expect(hasRole('Admin', 'admin')).toBe(true)
    expect(hasRole('ENGINEER', ['admin', 'engineer'])).toBe(true)
    expect(hasRole('user', 'admin')).toBe(false)
  })
})
