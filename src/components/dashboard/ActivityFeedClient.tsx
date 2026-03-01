"use client"
import { useEffect, useState } from 'react'

export default function ActivityFeedClient({ initialActivities = [] }: any) {
  const [activities, setActivities] = useState(initialActivities)

  useEffect(() => {
    let mounted = true
    let subscription: any = null

    const init = async () => {
      try {
        // try realtime via Supabase (client)
        const { supabase } = await import('@/lib/supabaseClient')
        subscription = supabase
          .channel('public:activity_logs')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, payload => {
            setActivities(prev => [payload.new, ...prev].slice(0, 100))
          })
          .subscribe()
      } catch (e) {
        // fallback to polling
        const poll = async () => {
          try {
            const res = await fetch('/api/dashboard/activity?limit=25')
            if (!res.ok) return
            const json = await res.json()
            if (mounted) setActivities(json)
          } catch (err) {}
        }
        poll()
        const id = setInterval(poll, 10_000)
        return () => clearInterval(id)
      }
    }

    init()

    return () => {
      mounted = false
      if (subscription && subscription.unsubscribe) subscription.unsubscribe()
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
