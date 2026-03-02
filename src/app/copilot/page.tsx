import React from 'react'
import CopilotShell from '@/components/CopilotShell'
import Link from 'next/link'

export default async function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <section className="mb-6">
        <h1 className="text-2xl font-semibold">Copilot — Retrieval-Augmented Generation</h1>
        <p className="text-gray-600 mt-2">Upload documents, index them as embeddings, and query your content with an LLM-powered copilot. Designed for secure, auditable, multi-tenant usage.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/copilot/docs" className="px-4 py-2 bg-blue-600 text-white rounded">Docs & Quickstart</Link>
          <Link href="/copilot" className="px-4 py-2 border rounded">Open Copilot</Link>
        </div>
      </section>

      <section className="mb-8">
        <CopilotShell projectId={undefined} />
      </section>

      <section className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold">How it works</h2>
        <ol className="list-decimal list-inside mt-3 text-gray-700 space-y-2">
          <li>Upload documents or connect a dataset.</li>
          <li>Index text with embeddings (OpenAI or custom model).</li>
          <li>Store vectors in pgvector or Supabase JSON table.</li>
          <li>Query with a chat interface that uses nearest neighbors + LLM.</li>
        </ol>
      </section>
    </main>
  )
}
