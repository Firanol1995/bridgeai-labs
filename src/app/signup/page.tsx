"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SignupPage() {
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json?.error ?? `Signup failed: ${res.status}`)
        setLoading(false)
        return
      }

      // attempt to log the user in automatically
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!loginRes.ok) {
        const j = await loginRes.json().catch(() => ({}))
        setError(j?.error ?? `Login after signup failed: ${loginRes.status}`)
        setLoading(false)
        return
      }

      const loginJson = await loginRes.json()
      const accessToken = loginJson?.data?.session?.access_token
      const refreshToken = loginJson?.data?.session?.refresh_token
      if (!accessToken || !refreshToken) {
        setError('Signup succeeded but login session tokens were missing')
        setLoading(false)
        return
      }

      // set session in client SDK
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      router.push('/dashboard')
    } catch (err: any) {
      console.error('signup error', err)
      setError(err?.message ?? 'Failed to sign up')
      setLoading(false)
    }
  }

  return (
    <section className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Sign up</h1>
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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm">
        Already have an account? <a href="/login" className="text-blue-600">Log in</a>
      </p>
    </section>
  )
}
