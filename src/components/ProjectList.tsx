"use client"

import React from 'react'
import apiFetch from '@/lib/fetcher'

export default function ProjectList({ projects }: { projects: any[] }) {
  return (
    <div className="space-y-3">
      {projects.length === 0 && <div className="text-sm text-gray-500">No projects yet.</div>}
      {projects.map((p) => (
        <div key={p.id} className="p-3 border rounded-md">
          <div className="font-medium">{p.title}</div>
          <div className="text-sm text-gray-600">{p.description}</div>
        </div>
      ))}
    </div>
  )
}
