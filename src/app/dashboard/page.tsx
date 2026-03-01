import React from 'react'
import type { User } from '@prisma/client'

async function fetchUsers(): Promise<User[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${base}/api/users`, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`)
  }

  const data = await res.json()
  return data as User[]
}

export default async function Dashboard() {
  let users: User[] = []

  try {
    users = await fetchUsers()
  } catch (err) {
    console.error('[dashboard] fetchUsers error:', err)
  }

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {users.length === 0 ? (
        <div className="text-center text-gray-500">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold text-lg">{user.name}</h2>
              <p className="text-gray-500">{user.email ?? '—'}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}