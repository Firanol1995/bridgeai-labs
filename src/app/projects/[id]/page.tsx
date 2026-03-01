import ProjectDetailClient from '@/components/projects/ProjectDetailClient'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const [projectRes, datasetsRes] = await Promise.all([
    fetch(`${base}/api/projects?id=${id}`, { cache: 'no-store' }),
    fetch(`${base}/api/datasets?projectId=${id}`, { cache: 'no-store' }),
  ])

  const project = projectRes.ok ? await projectRes.json() : null
  const datasets = datasetsRes.ok ? await datasetsRes.json() : []

  if (!project) return <div className="p-6">Project not found.</div>

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      <p className="text-sm text-gray-600 mb-4">{project.description}</p>

      <ProjectDetailClient project={project} initialDatasets={datasets} />
    </main>
  )
}
import React from 'react'
import DatasetUpload from '@/components/DatasetUpload'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  let project: any = null
  let datasets: any[] = []

  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const [pRes, dRes] = await Promise.all([
      fetch(`${base}/api/projects?id=${id}`, { cache: 'no-store' }),
      fetch(`${base}/api/datasets?projectId=${id}`, { cache: 'no-store' }),
    ])
    if (pRes.ok) project = await pRes.json()
    if (dRes.ok) datasets = await dRes.json()
  } catch (e) {
    // ignore
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">{project?.title ?? 'Project'}</h1>
      <p className="mb-4 text-gray-600">{project?.description}</p>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Upload Dataset</h2>
        <DatasetUpload projectId={id} onComplete={() => location.reload()} />
      </section>

      <section>
        <h2 className="font-semibold mb-2">Datasets</h2>
        {datasets.length === 0 ? (
          <div className="text-sm text-gray-500">No datasets</div>
        ) : (
          <ul className="space-y-2">
            {datasets.map((d) => (
              <li key={d.id} className="p-3 border rounded-md">
                <a href={d.fileUrl} className="text-blue-600" target="_blank" rel="noreferrer">
                  {d.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import DatasetUpload from '@/components/DatasetUpload'

type Dataset = {
  id: string
  name: string
  fileUrl: string
}

export default function ProjectDetail() {
  const params = useParams()
  const projectId = (params as { id: string })?.id
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return

      const res = await fetch(`/api/datasets?projectId=${projectId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const json = await res.json()
        if (mounted) setDatasets(json)
      }
      setLoading(false)
    }
    if (projectId) load()
    return () => { mounted = false }
  }, [projectId])

  function handleUploaded(dataset: Dataset) {
    setDatasets((d) => [dataset, ...d])
  }

  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold mb-4">Project</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Datasets</h2>
          {loading ? <div>Loading…</div> : datasets.length === 0 ? <div className="text-gray-500">No datasets</div> : (
            <ul className="space-y-2">
              {datasets.map((ds) => (
                <li key={ds.id} className="bg-white p-4 rounded shadow">
                  <div className="font-medium">{ds.name}</div>
                  <a href={ds.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open</a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Upload Dataset</h2>
          {projectId ? <DatasetUpload projectId={projectId} onUploaded={handleUploaded} /> : <div>Select a project</div>}
        </div>
      </div>
    </section>
  )
}
