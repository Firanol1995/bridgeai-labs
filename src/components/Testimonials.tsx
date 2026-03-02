"use client"

import React, { useEffect, useState } from 'react'

const TESTIMONIALS = [
  { by: 'VP Engineering, Acme', quote: 'BridgeAI delivered a copilot that reduced our support load by 37% in 3 months.' },
  { by: 'Head of Data, NovaSaaS', quote: 'Their data pipelines and MLOps practices made our models reliable in production.' },
  { by: 'CTO, FinCorp', quote: 'Migration to microservices unlocked new product opportunities and analytics.' },
]

export default function Testimonials() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 4000)
    return () => clearInterval(id)
  }, [])

  const t = TESTIMONIALS[idx]
  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="text-sm text-gray-500">Client story</div>
      <div className="mt-3 text-lg italic text-gray-800">“{t.quote}”</div>
      <div className="mt-3 text-sm text-gray-600">— {t.by}</div>
      <div className="mt-4 flex gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-blue-600' : 'bg-gray-300'}`} />
        ))}
      </div>
    </div>
  )
}
