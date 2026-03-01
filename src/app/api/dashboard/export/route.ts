import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'projects'

    if (type === 'projects') {
      const rows = await prisma.project.findMany({ include: { user: true } })
      const csv = ['id,title,description,ownerEmail,createdAt']
      for (const r of rows) csv.push(`${r.id},"${(r.title||'').replace(/"/g,'""')}","${(r.description||'').replace(/"/g,'""')}",${r.user?.email ?? ''},${r.createdAt.toISOString()}`)
      return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="projects.csv"' } })
    }

    if (type === 'datasets') {
      const rows = await prisma.dataset.findMany({ include: { project: true } })
      const csv = ['id,name,projectId,fileUrl,createdAt']
      for (const r of rows) csv.push(`${r.id},"${(r.name||'').replace(/"/g,'""')}",${r.projectId},${r.fileUrl},${r.createdAt.toISOString()}`)
      return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="datasets.csv"' } })
    }

    return NextResponse.json({ error: 'invalid type' }, { status: 400 })
  } catch (e) {
    console.error('[api/dashboard/export] error:', e)
    return NextResponse.json({ error: 'failed to export' }, { status: 500 })
  }
}
