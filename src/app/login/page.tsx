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
    <section className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm">
        Don't have an account? <a href="/signup" className="text-blue-600">Sign up</a>
      </p>
    </section>
  )
}
