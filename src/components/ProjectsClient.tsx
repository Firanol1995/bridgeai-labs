"use client"
import React, { useEffect, useState } from 'react'

export default function ProjectsClient({ initialProjects = [] }: any) {
  const [projects, setProjects] = useState(initialProjects)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      if (res.ok) setProjects(await res.json())
    } catch (e) {}
    setLoading(false)
  }

  const createProject = async () => {
    const title = prompt('Project title')
    if (!title) return
    const description = prompt('Description (optional)') || ''
    setLoading(true)
    try {
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description }) })
      if (res.ok) {
        await refresh()
      } else {
        alert('Failed to create project')
      }
    } catch (e) {
      alert('Failed to create project')
    }
    setLoading(false)
  }

  const filtered = projects.filter((p: any) => p.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects" className="border px-2 py-1 rounded" />
          <button onClick={refresh} className="px-3 py-1 bg-gray-200 rounded">Refresh</button>
        </div>
        <div>
          <button onClick={createProject} className="px-3 py-1 bg-blue-600 text-white rounded">New Project</button>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Created</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2"><a className="text-blue-600" href={`/projects/${p.id}`}>{p.title}</a></td>
                <td className="px-3 py-2">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2"> <a className="text-sm text-gray-600" href={`/projects/${p.id}`}>Open</a> </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-sm text-gray-500">No projects</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Project = {
  id: string
  title: string
  description?: string | null
}

export default function ProjectsClient({ initialProjects }: { initialProjects?: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects ?? [])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const json = await res.json()
          if (mounted) setProjects(json)
        }
      } catch (e) {
        // ignore
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setError('You must be logged in to create a project')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc }),
    })

    setSubmitting(false)
    if (res.ok) {
      const json = await res.json()
      setProjects((p) => [json, ...p])
      setTitle('')
      setDesc('')
    } else {
      const json = await res.json()
      setError(json.error || 'Failed to create project')
    }
  }

  return (
    <section className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>

      <form onSubmit={createProject} className="mt-4 space-y-3 max-w-md">
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Project title" 
          className="w-full rounded border p-2" 
          required 
          disabled={submitting}
        />
        <textarea 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)} 
          placeholder="Description (optional)" 
          className="w-full rounded border p-2"
          disabled={submitting}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button 
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer transition-colors"
        >
          {submitting ? 'Creating...' : 'Create project'}
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <div>Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500">No projects yet.</div>
        ) : (
          projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="block p-4 bg-white rounded shadow">
              <h2 className="font-semibold">{p.title}</h2>
              <p className="text-gray-500">{p.description}</p>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}
