"use client"
import React, { useState } from 'react'

export default function CopilotIndexClient({ projectId }: { projectId?: string }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function submit() {
    if (!text) return setStatus('empty')
    setStatus('indexing')
    const recordId = `doc-${Date.now()}`
    try {
      const res = await fetch('/api/copilot/index', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, recordId, text, metadata: {} }) })
      const j = await res.json()
      if (j.ok) setStatus('done')
      else setStatus('error: ' + (j.error || JSON.stringify(j)))
    } catch (e) {
      setStatus('error: ' + String(e))
    }
  }

  return (
    <div className="border rounded p-3">
      <h3 className="font-semibold mb-2">Index Document</h3>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="w-full border rounded p-2 mb-2" />
      <div className="flex gap-2">
        <button onClick={submit} className="bg-green-600 text-white px-3 py-1 rounded">Index</button>
        <div className="text-sm text-gray-600">{status}</div>
      </div>
    </div>
  )
}
