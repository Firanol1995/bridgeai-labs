import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { z } from 'zod'
import { getUserFromRequest } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import logger from '@/lib/logger'

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const projects = await prisma.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(projects)
  } catch (err) {
    logger.error('[GET /api/projects] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

const CreateProjectSchema = z.object({ title: z.string().min(1), description: z.string().optional() })

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Basic RBAC: allow only users and above (admins may create on behalf later)
    requireRole(user.role, ['user', 'org_owner', 'admin'])

    const body = await req.json()
    const parsed = CreateProjectSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 })

    const project = await prisma.project.create({ data: { userId: user.id, title: parsed.data.title, description: parsed.data.description ?? null } })

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
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const project = await prisma.project.findUnique({ where: { id } })
    if (!project || project.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.project.delete({ where: { id } })
    await logActivity(user.id, 'project.delete', { projectId: id })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/projects] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
