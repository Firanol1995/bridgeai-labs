import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'

export async function GET(req: Request) {
    try {
      // require admin session
      const user = await getUserFromRequest(req as any)
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      try {
        requireRole(user.role, 'admin')
      } catch (err) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'projects'

    if (type === 'projects') {
      const rows = await prisma.project.findMany({ include: { owner: true } })
      const csv = ['id,title,description,ownerEmail,createdAt']
      for (const r of rows) csv.push(`${r.id},"${(r.title||'').replace(/"/g,'""')}","${(r.description||'').replace(/"/g,'""')}",${r.owner?.email ?? ''},${r.createdAt.toISOString()}`)
      return new NextResponse(csv.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="projects.csv"' } })
    }

    if (type === 'datasets') {
      const url = new URL(req.url)
      const projectId = url.searchParams.get('projectId')
      const where = projectId ? { where: { projectId } } : {}
      // @ts-ignore
      const rows = await prisma.dataset.findMany({ include: { project: true }, ...(projectId ? { where: { projectId } } : {}) })
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
