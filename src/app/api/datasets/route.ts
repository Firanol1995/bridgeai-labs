import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { getPublicUrl } from '@/lib/storage'
import { getUserFromRequest } from '@/lib/auth'
import logger from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    const projectId = form.get('projectId') as string | null
    const name = (form.get('name') as string) ?? (file?.name ?? 'upload')

    if (!file || !projectId) return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const filename = `${projectId}/${Date.now()}_${file.name}`

    // upload to Supabase Storage (server-side using service role key)
    await supabaseAdmin.storage.from(process.env.SUPABASE_BUCKET_NAME ?? 'datasets').upload(filename, buffer, {
      contentType: file.type || 'application/octet-stream',
    })

    const publicUrl = getPublicUrl(filename)

    // verify project ownership
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.userId !== user.id) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })

    const dataset = await prisma.dataset.create({ data: { projectId, name, fileUrl: publicUrl } })
    await logActivity(user.id, 'dataset.upload', { projectId, datasetId: dataset.id })

    return NextResponse.json(dataset, { status: 201 })
    } catch (err) {
    logger.error('[POST /api/datasets] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const projectId = url.searchParams.get('projectId')

    if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

    // ensure the project belongs to the user
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const datasets = await prisma.dataset.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(datasets)
  } catch (err) {
    logger.error('[GET /api/datasets] error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
