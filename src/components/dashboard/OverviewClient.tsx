"use client"
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function OverviewClient({ initialMetrics }: any) {
  const [metrics, setMetrics] = useState(initialMetrics)

  useEffect(() => {
    // simple periodic refresh
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/dashboard/metrics')
        if (res.ok) setMetrics(await res.json())
      } catch (e) {
        // silent
      }
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-white rounded shadow">
        <div className="text-sm text-gray-500">Projects</div>
        <div className="text-2xl font-bold">{metrics?.projectsCount ?? '-'}</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <div className="text-sm text-gray-500">Datasets</div>
        <div className="text-2xl font-bold">{metrics?.datasetsCount ?? '-'}</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <div className="text-sm text-gray-500">Storage (bytes)</div>
        <div className="text-2xl font-bold">{metrics?.storageUsed ?? 0}</div>
      </div>

      <div className="col-span-1 md:col-span-3 mt-4 p-4 bg-white rounded shadow">
        <h3 className="text-sm font-medium">Uploads (last 7 days)</h3>
        <div style={{ width: '100%', height: 200 }} className="mt-2">
          <ResponsiveContainer>
            <LineChart data={metrics?.chartData || []}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uploads" stroke="#3182ce" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
