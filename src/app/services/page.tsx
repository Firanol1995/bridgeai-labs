import React from 'react'
import Link from 'next/link'

export default function ServicesPage() {
  const offerings = [
    {
      title: 'Custom AI Copilots',
      desc: 'Build secure RAG copilots from internal knowledge (documents, emails, tickets) to boost productivity and unlock measurable ROI.',
    },
    {
      title: 'Modern Data Engineering',
      desc: 'Design pipelines, warehouses, and data-quality checks so AI consumes trusted data and drives recurring revenue.',
    },
    {
      title: 'Legacy → Cloud Microservices',
      desc: 'Migrate monoliths to cloud-native microservices to expose AI-ready APIs and enable modern CI/CD.',
    },
    {
      title: 'Real-Time Analytics & Dashboards',
      desc: 'Deliver executive dashboards and live analytics that create fast wins and executive buy-in.',
    },
    {
      title: 'AI-Powered Process Automation',
      desc: 'Replace manual decision-making with model-driven workflows and measurable cost reductions.',
    },
    {
      title: 'SaaS Analytics & Usage Intelligence',
      desc: 'Build event ingestion, cohorts, funnels and churn analysis to monetize insights or productize as SaaS.',
    },
    {
      title: 'MLOps Platform & Production ML',
      desc: 'Model registry, monitoring, retraining pipelines, rollbacks and alerts — the operational moat for reliable AI.',
    },
  ]

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Services & Enterprise Engagements</h1>
      <p className="text-gray-700 mb-6">BridgeAI Labs partners with engineering and product leaders to deliver production-grade AI programs. Our engagements emphasize data readiness, operational resilience, and measurable business outcomes.</p>

      <div className="grid gap-6">
        {offerings.map((o) => (
          <div key={o.title} className="p-6 bg-white rounded shadow">
            <div className="font-semibold text-lg">{o.title}</div>
            <div className="text-sm text-gray-600 mt-2">{o.desc}</div>
            <div className="mt-4 text-sm">
              <strong>Typical outcomes:</strong>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                <li>Working RAG copilots integrated into internal tools</li>
                <li>Automated data pipelines and quality checks</li>
                <li>Production deployment with monitoring and rollback</li>
              </ul>
            </div>
            <div className="mt-4">
              <Link href="/contact" className="text-blue-600 hover:underline">Contact sales about {o.title.toLowerCase()}</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold">Engagement models</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
            <li>Discovery sprint (2–4 weeks) — prioritize high-impact use cases</li>
            <li>Implementation (1–6 months) — pipelines, copilots, and integration</li>
            <li>Managed services — ongoing MLOps, monitoring, and support</li>
          </ul>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold">Case studies (high level)</h3>
          <ul className="text-sm text-gray-700 mt-2 list-disc list-inside">
            <li>Financial services: document ingestion → copilot reduced support time by 40%</li>
            <li>SaaS company: analytics and cohort analysis improved retention by 8%</li>
            <li>Manufacturing: legacy API modernization enabled predictive maintenance</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
