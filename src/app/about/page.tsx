import Link from 'next/link'
import { getServerBaseUrl } from '@/lib/serverBaseUrl'

export const metadata = {
  title: 'About — BridgeAI Labs',
  description: 'About BridgeAI Labs — mission, team, contact and project details',
}

export default async function AboutPage() {
  let healthStatus = 'unknown'
  try {
    const base = await getServerBaseUrl()
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      healthStatus = json.status ?? (json.ok ? 'ok' : 'degraded')
    } else {
      healthStatus = `error (${res.status})`
    }
  } catch (e) {
    healthStatus = 'unreachable'
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">About BridgeAI Labs</h1>

      <p className="mb-4 text-gray-700">
        BridgeAI Labs is an advanced AI analytics platform focused on providing secure,
        developer-friendly tools for building, testing and deploying ML workflows.
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Mission</h2>
        <p className="text-gray-700">Deliver reliable, auditable AI infrastructure and tooling for researchers and teams.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Status</h2>
        <p className="text-gray-700">API health: <strong>{healthStatus}</strong></p>
        <p className="text-sm text-gray-500">(This checks the internal `/api/health` endpoint.)</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Contact & Support</h2>
        <p className="text-gray-700">For help, open an issue in the repository or contact the engineering team.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">License & Links</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Source: <Link href="/">Repository root</Link></li>
          <li><Link href="/dashboard">Dashboard</Link> — Protected admin view</li>
          <li><Link href="/projects">Projects</Link> — Your projects and datasets</li>
        </ul>
      </section>

      <footer className="pt-6 border-t border-gray-100 text-sm text-gray-500">
        <div>© {new Date().getFullYear()} BridgeAI Labs</div>
      </footer>
    </main>
  )
}
