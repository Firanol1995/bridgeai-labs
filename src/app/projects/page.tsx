import React from 'react'
import ProjectsClient from '@/components/ProjectsClient'

export default async function ProjectsPage() {
  let projects: any[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/projects`, { cache: 'no-store' })
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
