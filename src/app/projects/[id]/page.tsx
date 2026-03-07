import ProjectDetailClient from '@/components/projects/ProjectDetailClient'
import { getServerBaseUrl } from '@/lib/serverBaseUrl'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const base = await getServerBaseUrl()

  let project: any = null
  let datasets: any[] = []

  try {
    const [projectRes, datasetsRes] = await Promise.all([
      fetch(`${base}/api/projects?id=${id}`, { cache: 'no-store' }),
      fetch(`${base}/api/datasets?projectId=${id}`, { cache: 'no-store' }),
    ])

    if (projectRes.ok) {
      const projectJson = await projectRes.json()
      project = Array.isArray(projectJson) ? projectJson[0] ?? null : (projectJson?.items?.[0] ?? projectJson)
    }

    if (datasetsRes.ok) {
      datasets = await datasetsRes.json()
    }
  } catch {
    // keep fallback UI below
  }

  if (!project) {
    return <main className="p-6 max-w-4xl mx-auto">Project not found.</main>
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      <p className="text-sm text-gray-600 mb-4">{project.description}</p>
      <ProjectDetailClient project={project} initialDatasets={datasets} />
    </main>
  )
}
