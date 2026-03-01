"use client"

import React, { useEffect, useState } from 'react'

export default function DiagnosticsPage() {
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    async function run() {
      try {
        const res = await fetch('/api/diag')
        const json = await res.json()
        if (mounted) setResult(json)
      } catch (err) {
        if (mounted) setResult({ error: String(err) })
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold mb-4">Diagnostics</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(result, null, 2)}</pre>
    </section>
  )
}
