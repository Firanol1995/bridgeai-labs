"use client"

import React, { useState } from 'react'

export default function DatasetUpload({ projectId, onComplete }: { projectId: string; onComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setError('Select a file')
    setLoading(true)
    setError(null)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('projectId', projectId)
    fd.append('name', file.name)

    try {
      const res = await fetch('/api/datasets', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j?.error ?? `Upload failed: ${res.status}`)
      } else {
        setFile(null)
        onComplete?.()
      }
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      {error && <div className="text-red-600">{error}</div>}
      <button type="submit" disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">
        {loading ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  )
}
"use client"

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  projectId: string
  onUploaded?: (dataset: any) => void
}

export default function DatasetUpload({ projectId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setError('Select a file')

    setLoading(true)
    setError(null)

    try {
      const sessionRes = await supabase.auth.getSession()
      const token = sessionRes?.data?.session?.access_token
      if (!token) {
        setError('Not authenticated. Please log in.')
        setLoading(false)
        return
      }

      const fd = new FormData()
      fd.append('file', file)
      fd.append('projectId', projectId)
      fd.append('name', file.name)

      try {
        const res = await fetch('/api/datasets', {
          method: 'POST',
          body: fd,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
        const json = await res.json()
        onUploaded?.(json)
      } catch (err: any) {
        setError(err?.message ?? 'Upload error')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to get session')
    } finally {
      setLoading(false)
    }
    
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block"
      />
      {error && <div className="text-red-600">{error}</div>}
      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  )
}
