import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner py-6 px-6 md:px-10 text-sm text-gray-600">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        <div>&copy; {new Date().getFullYear()} BridgeAI Labs. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <a href="/services" className="hover:text-blue-600">Services</a>
          <a href="/docs" className="hover:text-blue-600">Docs</a>
          <a href="/privacy" className="hover:text-blue-600">Privacy</a>
          <a href="/terms" className="hover:text-blue-600">Terms</a>
          <a href="mailto:sales@bridgeai.example" className="hover:text-blue-600">Contact Sales</a>
        </div>
      </div>
    </footer>
  )
}