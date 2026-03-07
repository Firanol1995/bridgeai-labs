"use client"
import React, { useEffect, useState } from 'react'

type ProjectRow = { id: string; title?: string; name?: string; ownerEmail?: string; createdAt: string }

export default function ProjectsTableClient() {
  const [data, setData] = useState<ProjectRow[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/projects')
        if (!mounted || !res.ok) return
        const json = await res.json()
        setData(Array.isArray(json) ? json : (json?.items ?? []))
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="bg-white rounded shadow p-2 overflow-auto">
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Owner</th>
            <th className="px-3 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2">{r.title ?? r.name ?? '-'}</td>
              <td className="px-3 py-2">{r.ownerEmail ?? '-'}</td>
              <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-sm text-gray-500" colSpan={3}>
                No projects
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
