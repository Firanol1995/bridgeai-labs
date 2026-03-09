"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

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

      const signupJson = await res.json().catch(() => ({}))
      const signupSession = signupJson?.data?.session
      const signupUser = signupJson?.data?.user

      if (signupSession?.access_token && signupSession?.refresh_token) {
        await supabase.auth.setSession({
          access_token: signupSession.access_token,
          refresh_token: signupSession.refresh_token,
        })
        router.push('/dashboard')
        return
      }

      if (signupUser) {
        setMessage('Signup succeeded. Check your email to confirm your account, then log in.')
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
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-2xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-950">Sign up</h1>
        <p className="mb-6 text-sm text-slate-600">Create your account to explore projects, datasets, and enterprise workflows.</p>
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
          {message && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <a href="/login" className="font-medium text-blue-600 hover:text-blue-700">Log in</a>
        </p>
      </div>
    </section>
  )
}
