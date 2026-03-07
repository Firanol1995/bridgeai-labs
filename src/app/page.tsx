import React from 'react'
import Link from 'next/link'
import HomeQuickActions from '@/components/HomeQuickActions'
import Hero from '@/components/Hero'
import FocusModal from '@/components/FocusModal'
import Testimonials from '@/components/TestimonialsClient'
import ContactModal from '@/components/ContactModal'
import AccessibleAccordion from '@/components/AccessibleAccordion'
import { getServerBaseUrl } from '@/lib/serverBaseUrl'

type Metrics = { projectsCount?: number; datasetsCount?: number; storageUsed?: number }

export default async function Home() {
  let metrics: Metrics = {}
  let recent: any[] = []
  try {
    const base = await getServerBaseUrl()
    const [mRes, pRes] = await Promise.all([
      fetch(`${base}/api/dashboard/metrics`, { cache: 'no-store' }),
      fetch(`${base}/api/projects?page=1&pageSize=5`, { cache: 'no-store' }),
    ])
    if (mRes.ok) metrics = await mRes.json()
    if (pRes.ok) {
      const pJson = await pRes.json()
      recent = Array.isArray(pJson) ? pJson : (pJson?.items ?? [])
    }
  } catch (e) {
    // ignore — show static fallback
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <section>
        <Hero metrics={metrics} />
      </section>
      <nav className="mt-6 flex gap-4 text-sm items-center">
        <a href="#features" className="text-blue-600 hover:underline">Features</a>
        <FocusModal />
        <a href="#recent" className="text-blue-600 hover:underline">Recent projects</a>
        <a href="/services" className="text-gray-600 hover:underline">Full services</a>
        <div className="ml-auto"><ContactModal /></div>
      </nav>

      <section id="features" className="mt-6">
        <AccessibleAccordion title={<span className="text-lg">What we do — quick overview</span>} defaultOpen>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="/copilot" className="p-4 border rounded hover:shadow bg-white">
              <div className="font-semibold">Copilot (RAG)</div>
              <div className="text-sm text-gray-500">Upload documents, index embeddings, and query with LLMs.</div>
            </a>
            <a href="/mlops" className="p-4 border rounded hover:shadow bg-white">
              <div className="font-semibold">MLOps</div>
              <div className="text-sm text-gray-500">Model registry, versions, and deployment hooks (scaffold).</div>
            </a>
            <a href="/projects" className="p-4 border rounded hover:shadow bg-white">
              <div className="font-semibold">Projects</div>
              <div className="text-sm text-gray-500">Manage multi-tenant projects and datasets.</div>
            </a>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex-1 text-sm text-gray-600">Trusted by:</div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Logo</div>
              <div className="w-24 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Logo</div>
              <div className="w-24 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Logo</div>
            </div>
          </div>
        </AccessibleAccordion>
      </section>

      <section className="mt-10">
        <div className="p-6 bg-white rounded shadow flex flex-col md:flex-row items-center justify-between">
          <div>
            <div className="font-semibold">Focus areas</div>
            <div className="text-sm text-gray-600">Explore our seven core offerings for enterprise AI, data engineering, and MLOps.</div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/services" className="px-4 py-2 bg-blue-600 text-white rounded">View focus areas</Link>
          </div>
        </div>
      </section>

      <section id="recent" className="mt-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded shadow p-6">
          <h3 className="text-xl font-semibold mb-3">Recent projects</h3>
          {recent.length === 0 ? (
            <div className="text-sm text-gray-500">No recent projects. Create one on the Projects page.</div>
          ) : (
            <ul className="space-y-3">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <div>
                    <Link href={`/projects/${r.id}`} className="font-medium text-blue-600">{r.title}</Link>
                    <div className="text-sm text-gray-500">{r.description}</div>
                  </div>
                  <div className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded shadow p-6">
          <AccessibleAccordion title={<span className="font-semibold">Offerings & quick actions</span>} defaultOpen>
            <div className="mt-3">
              <HomeQuickActions />
            </div>
          </AccessibleAccordion>
        </div>
      </section>
      <section className="mt-8 grid md:grid-cols-2 gap-6">
        <div>
          <Testimonials />
        </div>
        <div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="font-semibold">About our approach</h3>
            <p className="text-sm text-gray-600 mt-2">We focus on measurable outcomes, secure data handling, and production readiness — ensuring projects deliver ROI and scale safely.</p>
            <div className="mt-4"><ContactModal /></div>
          </div>
        </div>
      </section>

    </main>
  )
}