import OverviewClient from '../../components/dashboard/OverviewClient'
import ProjectsTableClient from '../../components/dashboard/ProjectsTableClient'
import ActivityFeedClient from '../../components/dashboard/ActivityFeedClient'

export const metadata = {
  title: 'Dashboard — BridgeAI Labs',
  description: 'Administrative dashboard for BridgeAI Labs',
}

export default async function DashboardPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const [metricsRes, activityRes] = await Promise.all([
    fetch(`${base}/api/dashboard/metrics`, { cache: 'no-store' }),
    fetch(`${base}/api/dashboard/activity?limit=25`, { cache: 'no-store' }),
  ])

  const metrics = metricsRes.ok ? await metricsRes.json() : { projectsCount: 0, datasetsCount: 0, chartData: [] }
  const activity = activityRes.ok ? await activityRes.json() : []

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <OverviewClient initialMetrics={metrics} />

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-2">Projects</h2>
          <ProjectsTableClient />
        </div>
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-2">Activity</h2>
          <ActivityFeedClient initialActivities={activity} />
        </div>
      </section>
    </main>
  )
}
