"use client"
import React, { useState } from 'react'

export default function CopilotChatClient() {
  const [messages, setMessages] = useState<{id:string, text:string, from:'user'|'bot'}[]>([])
  const [input, setInput] = useState('')

  async function send() {
    if (!input) return
    const id = String(Date.now())
    setMessages((m) => [...m, { id, text: input, from: 'user' }])
    setInput('')
    // Placeholder: call server RAG endpoint
    try {
      const res = await fetch('/api/copilot/respond', { method: 'POST', body: JSON.stringify({ input }) })
      const data = await res.json()
      setMessages((m) => [...m, { id: id + '-bot', text: data.answer || 'No response', from: 'bot' }])
    } catch (e) {
      setMessages((m) => [...m, { id: id + '-bot', text: 'Error: ' + String(e), from: 'bot' }])
    }
  }

  return (
    <div className="border rounded p-4">
      <div className="h-64 overflow-auto space-y-2 mb-3">
        {messages.map((m) => (
          <div key={m.id} className={m.from === 'user' ? 'text-right text-blue-600' : 'text-left'}>{m.text}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border rounded px-2" />
        <button onClick={send} className="bg-sky-600 text-white px-3 rounded">Send</button>
      </div>
    </div>
  )
}
