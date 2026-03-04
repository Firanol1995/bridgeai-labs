"use client"

import React from 'react'
import ContactModal from '../../components/ContactModal'

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold">Contact Sales</h1>
      <p className="mt-3 text-gray-700">Tell us about your needs — we’ll respond promptly. Use the form below to request a demo, pricing, or an enterprise evaluation.</p>

      <div className="mt-8">
        <ContactModal />
      </div>

      <div className="mt-8 text-sm text-gray-600">
        Or email <a href="mailto:sales@bridgeai.example" className="text-blue-600">sales@bridgeai.example</a>
      </div>
    </div>
  )
}
