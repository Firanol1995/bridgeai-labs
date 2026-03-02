"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function HomeQuickActions() {
  const [email, setEmail] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then((r) => {
      if (!mounted) return
      setEmail(r.data.session?.user?.email ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      // upload to 'datasets' bucket with random prefix
      const name = `${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage.from('datasets').upload(name, file)
      if (error) throw error
      const { data: publicUrlData } = supabase.storage.from('datasets').getPublicUrl(name)
      // register dataset on server (server will associate with current user via auth header)
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) throw new Error('Not authenticated')
      await fetch('/api/datasets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: file.name, fileUrl: publicUrlData.publicUrl, clientUploaded: true }),
      })
      router.refresh()
      setFile(null)
    } catch (err: any) {
      console.error('upload failed', err)
      alert('Upload failed: ' + String(err.message ?? err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-500">Quick actions</div>
          <div className="text-lg font-medium">{email ? `Signed in as ${email}` : 'Not signed in'}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <a href="/projects" className="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">Projects</a>
        <a href="/dashboard" className="px-3 py-2 border rounded cursor-pointer">Dashboard</a>
      </div>

      <form onSubmit={handleUpload} className="space-y-2">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={!email || uploading} />
        <div>
          <button type="submit" disabled={!file || !email || uploading} className="px-3 py-2 bg-green-600 text-white rounded cursor-pointer">
            {uploading ? 'Uploading…' : 'Quick upload'}
          </button>
        </div>
        {!email && <div className="text-sm text-gray-500">Sign in to enable uploads.</div>}
      </form>
    </div>
  )
}
