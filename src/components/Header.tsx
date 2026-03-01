"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
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
    <header className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">BridgeAI Labs</h1>
      <nav className="space-x-6">
        <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
        <Link href="/projects" className="text-gray-700 hover:text-blue-600">Projects</Link>
        <Link href="/about" className="text-gray-700 hover:text-blue-600">About</Link>
        {userEmail ? (
          <button onClick={handleSignOut} className="text-gray-700 hover:text-blue-600">Sign out</button>
        ) : (
          <Link href="/login" className="text-gray-700 hover:text-blue-600">Log in</Link>
        )}
      </nav>
    </header>
  )
}