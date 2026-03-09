"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      setLoading(false)

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json?.error ?? `Login failed: ${res.status}`)
        return
      }

      const json = await res.json()
      const accessToken = json?.data?.session?.access_token
      const refreshToken = json?.data?.session?.refresh_token
      if (!accessToken || !refreshToken) {
        setError('Login succeeded but session tokens were missing')
        return
      }

      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      router.push('/dashboard')
    } catch (err: any) {
      console.error('signin error', err)
      setError(err?.message ?? 'Failed to sign in')
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-950">Log in</h1>
        <p className="mb-6 text-sm text-slate-600">Access your dashboard, projects, and datasets.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none"
            required
          />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none"
            required
          />
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Don't have an account? <a href="/signup" className="font-medium text-blue-600 hover:text-blue-700">Sign up</a>
        </p>
      </div>
    </section>
  )
}
