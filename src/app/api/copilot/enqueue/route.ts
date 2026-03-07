import { NextResponse } from 'next/server'
import { requireAuth, requireRole as requireRoleCheck } from '@/lib/authMiddleware'
import { createQueue } from '@/../backend/workers/queue'

export async function POST(req: Request) {
  try {
    const authRes = await requireAuth(req as any)
    if (authRes instanceof Response) return authRes
    const user = authRes
    if (!requireRoleCheck(user, ['admin', 'engineer'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { recordId, projectId, text, metadata } = body
    if (!recordId || !text) return NextResponse.json({ error: 'recordId and text required' }, { status: 400 })

    const { q } = createQueue('embeddings')
    await q.add('embed', { recordId, projectId, text, metadata })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
