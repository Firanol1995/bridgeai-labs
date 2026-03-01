import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner py-4 px-8 text-center text-gray-500">
      &copy; {new Date().getFullYear()} BridgeAI Labs. All rights reserved.
    </footer>
  )
}