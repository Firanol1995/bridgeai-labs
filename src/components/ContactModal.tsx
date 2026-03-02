"use client"

import React, { useState } from 'react'

export default function ContactModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      // best-effort: send to /api/contact if implemented
      await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, company, message }) })
      // emit analytics event
      void fetch('/api/events', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ eventType: 'submit_contact', payload: { company } }) })
      setStatus('sent')
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <>
      <button onClick={() => { setOpen(true); void fetch('/api/events', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ eventType: 'open_contact_modal' }) }) }} className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Contact Sales</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl bg-white rounded shadow-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Contact Sales</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 cursor-pointer">Close</button>
            </div>
            <form onSubmit={submit} className="mt-4 grid gap-3">
              <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" />
              <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 border rounded" />
              <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="p-2 border rounded" />
              <textarea placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} className="p-2 border rounded" />
              <div className="flex items-center gap-3">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Send request</button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border rounded cursor-pointer">Cancel</button>
                {status === 'sending' && <div className="text-sm text-gray-500">Sending…</div>}
                {status === 'sent' && <div className="text-sm text-green-600">Request sent — we'll be in touch.</div>}
                {status === 'error' && <div className="text-sm text-red-600">Failed to send. Try again later.</div>}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
