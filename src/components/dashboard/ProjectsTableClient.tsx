"use client"
import React from 'react'
import { useState, useMemo } from 'react'
import { useTable, ColumnDef } from '@tanstack/react-table'

type ProjectRow = { id: string; name: string; ownerEmail?: string; createdAt: string }

export default function ProjectsTableClient() {
  const [data, setData] = useState<ProjectRow[]>([])

  useMemo(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) setData(await res.json())
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  const columns = useMemo<ColumnDef<ProjectRow, any>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'ownerEmail', header: 'Owner' },
      { accessorKey: 'createdAt', header: 'Created' },
    ],
    []
  )

  // a lightweight table render using TanStack's headless table
  // keep minimal to avoid heavy coupling
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
              <td className="px-3 py-2">{r.name}</td>
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
