import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { z } from 'zod'
import { requireAuth, requireRole as requireRoleCheck } from '@/lib/authMiddleware'
import { getUserFromRequest } from '@/lib/auth'
import logger from '@/lib/logger'

export async function GET(req: Request) {
  try {
    const authRes = await requireAuth(req as any)
    if (authRes instanceof Response) return authRes
    const user = authRes

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(5, Number(url.searchParams.get('pageSize') || '10')))

    if (id) {
      const item = await prisma.project.findFirst({ where: { id, ownerId: user.id } })
      if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(item)
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.project.count({ where: { ownerId: user.id } }),
    ])

    return NextResponse.json({ items, total, page, pageSize })
  } catch (err) {
    logger.error('[GET /api/projects] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

const CreateProjectSchema = z.object({ title: z.string().min(1), description: z.string().optional() })

export async function POST(req: Request) {
  try {
    const authRes = await requireAuth(req as any)
    if (authRes instanceof Response) return authRes
    const user = authRes
    // Basic RBAC: allow only users and above
    if (!requireRoleCheck(user, ['user', 'org_owner', 'admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const parsed = CreateProjectSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 })

    const project = await prisma.project.create({ data: { ownerId: user.id, title: parsed.data.title, description: parsed.data.description ?? null } })

    await logActivity(user.id, 'project.create', { projectId: project.id })
    return NextResponse.json(project, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/projects] error', err)
    if (err?.message?.includes('Insufficient role')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (err?.message?.toLowerCase().includes('foreign key') || err?.message?.toLowerCase().includes('constraint')) {
      return NextResponse.json({ error: 'Invalid reference or missing user record' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authRes = await requireAuth(req as any)
    if (authRes instanceof Response) return authRes
    const user = authRes

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const project = await prisma.project.findUnique({ where: { id } })
    if (!project || project.ownerId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.project.delete({ where: { id } })
    await logActivity(user.id, 'project.delete', { projectId: id })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/projects] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
