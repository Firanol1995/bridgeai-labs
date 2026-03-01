"use client"
import { useEffect, useState } from 'react'

export default function ActivityFeedClient({ initialActivities = [] }: any) {
  const [activities, setActivities] = useState(initialActivities)

  useEffect(() => {
    // subscribe to server-sent updates via Supabase Realtime if available
    // fall back to polling
    let mounted = true
    const poll = async () => {
      try {
        const res = await fetch('/api/dashboard/activity?limit=25')
        if (!res.ok) return
        const json = await res.json()
        if (mounted) setActivities(json)
      } catch (e) {}
    }
    poll()
    const id = setInterval(poll, 10_000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  return (
    <div className="bg-white rounded shadow p-2 max-h-[420px] overflow-auto">
      <ul className="space-y-2">
        {activities.map((a: any) => (
          <li key={a.id} className="border-b pb-2">
            <div className="text-sm text-gray-700">{a.message}</div>
            <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</div>
          </li>
        ))}
        {activities.length === 0 && <li className="text-sm text-gray-500">No recent activity</li>}
      </ul>
    </div>
  )
}
