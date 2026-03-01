import React from 'react'

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] px-4 text-center">
      <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Welcome to BridgeAI Labs</h2>
      <p className="text-lg text-gray-700 mb-6">
        Your advanced AI platform for analytics, simulations, and smart dashboards.
      </p>
      <div className="space-x-4">
        <a
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </section>
  )
}