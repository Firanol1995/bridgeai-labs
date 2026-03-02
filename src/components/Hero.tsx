"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero({ metrics }: { metrics?: any }) {
  const [projects, setProjects] = useState<number>(metrics?.projectsCount ?? 0)
  const [datasets, setDatasets] = useState<number>(metrics?.datasetsCount ?? 0)
  const [storage, setStorage] = useState<number>(metrics?.storageUsed ?? 0)

  useEffect(() => {
    // subtle count-up animation
    let raf = 0
    const start = Date.now()
    const dur = 700
    const from = { p: 0, d: 0, s: 0 }
    const to = { p: metrics?.projectsCount ?? 0, d: metrics?.datasetsCount ?? 0, s: metrics?.storageUsed ?? 0 }
    function step() {
      const t = Math.min(1, (Date.now() - start) / dur)
      setProjects(Math.round(from.p + (to.p - from.p) * t))
      setDatasets(Math.round(from.d + (to.d - from.d) * t))
      setStorage(Math.round(from.s + (to.s - from.s) * t))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [metrics])

  return (
    <section className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-8 shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold">BridgeAI Labs — Production AI Copilots & Data Platform</h1>
          <p className="mt-3 text-gray-700 max-w-2xl">Platform + services to convert enterprise knowledge and systems into operational AI: custom copilots powered by secure RAG pipelines, resilient data engineering that guarantees trusted inputs, and MLOps for observable, safe model delivery. We help teams automate decisions, unlock insights, and measure ROI.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ViewAndTrack href="/services" eventType="click_view_focus_areas" className="px-4 py-2 bg-blue-600 text-white rounded">View focus areas</ViewAndTrack>
            <ViewAndTrack href="/copilot" eventType="click_try_copilot" className="px-4 py-2 bg-blue-600 text-white rounded">Try Copilot</ViewAndTrack>
            <ViewAndTrack href="/contact" eventType="click_request_demo" className="px-4 py-2 bg-blue-600 text-white rounded">Request a demo</ViewAndTrack>
          </div>
        </div>

        <div className="w-full md:w-64 grid grid-cols-1 gap-3">
          <div className="p-3 bg-white rounded border text-center">
            <div className="text-sm text-gray-500">Projects</div>
            <div className="text-2xl font-semibold">{projects}</div>
          </div>
          <div className="p-3 bg-white rounded border text-center">
            <div className="text-sm text-gray-500">Datasets</div>
            <div className="text-2xl font-semibold">{datasets}</div>
          </div>
          <div className="p-3 bg-white rounded border text-center">
            <div className="text-sm text-gray-500">Storage</div>
            <div className="text-2xl font-semibold">{storage ? `${storage} MB` : '—'}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ViewAndTrack({ href, eventType, children, className }: { href: string; eventType: string; children: React.ReactNode; className?: string }) {
  const router = useRouter()
  async function handle(e: React.MouseEvent) {
    e.preventDefault()
    try {
      void fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType }) })
    } catch (e) {
      // ignore
    }
    router.push(href)
  }
  return (
    <button onClick={handle} className={`${className ?? ''} cursor-pointer`}>{children}</button>
  )
}
