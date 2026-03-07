"use client"

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  projectId: string
  onComplete?: () => void
  onUploaded?: (dataset: any) => void
}

export default function DatasetUpload({ projectId, onComplete, onUploaded }: Props) {
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

      const res = await fetch('/api/datasets', {
        method: 'POST',
        body: fd,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error ?? `Upload failed: ${res.status}`)

      setFile(null)
      onUploaded?.(json)
      onComplete?.()
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed')
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
