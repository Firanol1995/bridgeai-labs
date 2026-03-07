import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { getPublicUrl } from '@/lib/storage'
import { getUserFromRequest } from '@/lib/auth'
import { requireAuth } from '@/lib/authMiddleware'
import logger from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const authRes = await requireAuth(req as any)
    if (authRes instanceof Response) return authRes
    const user = authRes

    const form = await req.formData()
    const file = form.get('file') as File | null
    const projectId = form.get('projectId') as string | null
    const name = (form.get('name') as string) ?? (file?.name ?? 'upload')

    if (!file || !projectId) return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // verify project ownership
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.userId !== user.id) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })

    // Server-side upload if client didn't upload directly
    let publicUrl = ''
    if (form.get('clientUploaded') === '1') {
      // client already uploaded to Supabase and provided fileUrl
      publicUrl = (form.get('fileUrl') as string) || ''
    } else {
      const filename = `${projectId}/${Date.now()}_${file.name}`
      await supabaseAdmin.storage.from(process.env.SUPABASE_BUCKET_NAME ?? 'datasets').upload(filename, buffer, {
        contentType: file.type || 'application/octet-stream',
      })
      publicUrl = getPublicUrl(filename)
    }

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
    const authRes = await requireAuth(req as any)
    if (authRes instanceof Response) return authRes
    const user = authRes

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
