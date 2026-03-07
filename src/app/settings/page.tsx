import React from 'react'
import { requirePageAuth } from '@/lib/requirePageAuth'

export default async function SettingsPage() {
  await requirePageAuth('/settings')

  return (
    <section className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white p-6 rounded shadow max-w-xl">
        <h2 className="font-semibold mb-2">Account</h2>
        <p className="text-sm text-gray-600">Manage your account settings and preferences here.</p>
      </div>
    </section>
  )
}
