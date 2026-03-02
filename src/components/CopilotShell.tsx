"use client"
import React from 'react'
import CopilotChatClient from './CopilotChatClient'
import CopilotIndexClient from './CopilotIndexClient'
import CopilotUploadClient from './CopilotUploadClient'

export default function CopilotShell({ projectId }: { projectId?: string }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Copilot — Secure RAG Playground</h1>
        <p className="mb-4">This is a placeholder Copilot interface. RAG pipeline and vector store are scaffolded on the server.</p>
        <CopilotChatClient />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Index Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CopilotUploadClient projectId={projectId} />
          <CopilotIndexClient projectId={projectId} />
        </div>
      </div>
    </div>
  )
}
