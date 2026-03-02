"use client"

import React, { useState } from 'react'

const FOCUS = [
  { title: 'Custom AI Copilots', desc: 'Secure RAG copilots from internal knowledge (documents, tickets, email).' },
  { title: 'Modern Data Engineering', desc: 'Pipelines, warehouses and data quality to feed reliable AI.' },
  { title: 'Cloud Migration', desc: 'Move legacy systems to microservices and AI-ready APIs.' },
  { title: 'Real-Time Analytics', desc: 'Executive dashboards and live insights.' },
  { title: 'Process Automation', desc: 'Automate decisions and workflows with models.' },
  { title: 'SaaS Analytics', desc: 'User funnels, cohorts, churn and usage intelligence.' },
  { title: 'MLOps', desc: 'Model registry, monitoring, retraining and safe rollouts.' },
]

export default function FocusModal() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => { setOpen(true); void fetch('/api/events', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ eventType: 'open_focus_modal' }) }) }} className="px-3 py-2 bg-gray-800 text-white rounded cursor-pointer">Focus areas</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-3xl bg-white rounded shadow-lg p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold">Focus areas</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 cursor-pointer">Close</button>
            </div>
            <div className="mt-4 grid gap-3">
              {FOCUS.map((f) => (
                <div key={f.title} className="p-3 border rounded">
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-gray-600">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
