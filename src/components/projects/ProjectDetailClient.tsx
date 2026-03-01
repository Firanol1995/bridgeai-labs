"use client"
import React, { useState } from 'react'

export default function ProjectDetailClient({ project, initialDatasets = [] }: any) {
  const [datasets, setDatasets] = useState(initialDatasets)
  const [uploading, setUploading] = useState(false)

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('projectId', project.id)
      fd.append('name', file.name)

      const res = await fetch('/api/datasets', { method: 'POST', body: fd })
      if (res.ok) {
        const d = await res.json()
        setDatasets(prev => [d, ...prev])
      } else {
        alert('Upload failed')
      }
    } catch (err) {
      alert('Upload error')
    }
    setUploading(false)
  }

  const exportCsv = async () => {
    const url = `/api/dashboard/export?type=datasets&projectId=${project.id}`
    window.open(url, '_blank')
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <label className="px-3 py-2 bg-green-600 text-white rounded cursor-pointer">
          {uploading ? 'Uploading...' : 'Upload dataset'}
          <input onChange={upload} type="file" className="hidden" />
        </label>
        <button onClick={exportCsv} className="px-3 py-2 bg-gray-200 rounded">Export CSV</button>
      </div>

      <div className="bg-white rounded shadow p-2">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Uploaded</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((d: any) => (
              <tr key={d.id} className="border-t">
                <td className="px-3 py-2"><a className="text-blue-600" href={d.fileUrl} target="_blank" rel="noreferrer">{d.name}</a></td>
                <td className="px-3 py-2">{new Date(d.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2"><a className="text-sm text-red-600" href={`/api/datasets?projectId=${project.id}`}>View</a></td>
              </tr>
            ))}
            {datasets.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-sm text-gray-500">No datasets</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
