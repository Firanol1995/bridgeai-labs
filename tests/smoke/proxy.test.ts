import { describe, expect, it } from 'vitest'

import { proxy } from '../../proxy'

describe('proxy smoke', () => {
  it('redirects unauthenticated protected page requests', () => {
    const req = {
      url: 'http://localhost:3000/dashboard',
      nextUrl: { pathname: '/dashboard' },
      headers: new Headers(),
    } as any

    const res = proxy(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login?from=%2Fdashboard')
  })

  it('returns 401 for protected api requests without auth', () => {
    const req = {
      url: 'http://localhost:3000/api/projects',
      nextUrl: { pathname: '/api/projects' },
      headers: new Headers(),
    } as any

    const res = proxy(req)
    expect(res.status).toBe(401)
  })

  it('allows public health endpoint', () => {
    const req = {
      url: 'http://localhost:3000/api/health',
      nextUrl: { pathname: '/api/health' },
      headers: new Headers(),
    } as any

    const res = proxy(req)
    expect(res.status).toBe(200)
  })
})
