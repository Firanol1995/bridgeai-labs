"use client"
import React, { useState } from 'react'

export default function CopilotUploadClient({ projectId }: { projectId?: string }) {
  const [status, setStatus] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setStatus('reading')
    const text = await f.text()
    setStatus('uploading')
    const recordId = `file-${Date.now()}-${f.name}`
    try {
      const res = await fetch('/api/copilot/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, recordId, text, metadata: { filename: f.name, size: f.size } }),
      })
      const j = await res.json()
      if (j.ok) setStatus('indexed')
      else setStatus('error: ' + (j.error || JSON.stringify(j)))
    } catch (err) {
      setStatus('error: ' + String(err))
    }
  }

  return (
    <div className="border rounded p-3">
      <h3 className="font-semibold mb-2">Upload & Index File</h3>
      <input type="file" accept=".txt,.md,.csv" onChange={handleFile} />
      <div className="mt-2 text-sm text-gray-600">{status}</div>
    </div>
  )
}
