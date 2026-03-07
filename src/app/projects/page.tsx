import React from 'react'
import ProjectsClient from '@/components/ProjectsClient'
import { getServerBaseUrl } from '@/lib/serverBaseUrl'
import { requirePageAuth } from '@/lib/requirePageAuth'

export default async function ProjectsPage() {
  await requirePageAuth('/projects')

  let projects: any[] = []
  try {
    const base = await getServerBaseUrl()
    const res = await fetch(`${base}/api/projects`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      // API may return a paginated object { items, total, page, pageSize }
      projects = Array.isArray(json) ? json : (json?.items ?? [])
    }
  } catch (e) {
    // ignore — show empty state
  }

  return (
    <main className="p-6">
      <ProjectsClient initialProjects={projects} />
    </main>
  )
}
