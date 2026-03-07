"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function getUser() {
      try {
        const res = await supabase.auth.getSession()
        const user = res?.data?.session?.user ?? null
        if (mounted) setUserEmail(user?.email ?? null)
      } catch (err) {
        // don't surface library internal session-missing errors to the UI
        console.debug('supabase.getSession error (ignored):', err)
      }
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      try {
        setUserEmail(session?.user?.email ?? null)
      } catch (err) {
        console.debug('onAuthStateChange error (ignored):', err)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
    router.push('/login')
  }

  return (
    <header className="bg-white shadow-md py-4 px-6 md:px-10 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-600">BridgeAI Labs</h1>
        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <Link href="/copilot" className="hover:text-blue-600">Copilot</Link>
          <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <Link href="/services" className="hover:text-blue-600">Services</Link>
          <Link href="/mlops" className="hover:text-blue-600">MLOps</Link>
        </nav>
      </div>

        <div className="flex items-center gap-4">
          <Link href="/about" className="hidden sm:inline text-sm text-gray-600 hover:text-blue-600">About</Link>
          <Link href="/enterprise" className="hidden sm:inline text-sm text-gray-600 hover:text-blue-600">Enterprise</Link>
          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">{userEmail}</span>
              <button onClick={handleSignOut} className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded border">Sign out</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signup" className="px-3 py-1 text-sm text-blue-600 border rounded">Sign up</Link>
              <Link href="/contact" className="px-3 py-1 bg-blue-600 text-white rounded">Contact Sales</Link>
            </div>
          )}
        </div>
    </header>
  )
}