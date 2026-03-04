import React from 'react'
import Link from 'next/link'

export default function EnterprisePage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold">Enterprise</h1>
      <p className="mt-4 text-lg text-gray-700">BridgeAI Labs partners with enterprises to build production-grade AI copilots, secure RAG pipelines, and observable MLOps. We focus on data quality, governance, and measurable ROI.</p>

      <section className="mt-8 grid gap-6">
        <div>
          <h2 className="text-2xl font-semibold">What we deliver</h2>
          <ul className="list-disc ml-6 mt-3 text-gray-700">
            <li>Secure knowledge ingestion (RAG) with provenance and access controls</li>
            <li>Custom copilots integrated into Slack, web, and internal tools</li>
            <li>Embeddings, vector search (pgvector/Supabase), and model ops</li>
            <li>Enterprise-grade observability, audits, and SLOs</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Engagement models</h2>
          <p className="mt-2 text-gray-700">From short discovery to full platform delivery and ongoing MLOps, we tailor the engagement to your needs. Typical phases include assessment, pilot, rollout, and production support.</p>
        </div>

        <div className="mt-4">
          <Link href="/contact" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">Contact Sales</Link>
          <Link href="/services" className="ml-3 inline-block px-4 py-2 border rounded">See Services</Link>
        </div>
      </section>
    </div>
  )
}
