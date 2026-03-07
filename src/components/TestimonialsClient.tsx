"use client"

import dynamic from 'next/dynamic'
import React from 'react'

// Dynamically load the client-only Testimonials component at runtime.
const Testimonials = dynamic(() => import('./Testimonials'), {
  ssr: false,
  loading: () => <div className="p-6 bg-white rounded shadow">Loading testimonials…</div>
})

export default function TestimonialsClient() {
  return <Testimonials />
}
