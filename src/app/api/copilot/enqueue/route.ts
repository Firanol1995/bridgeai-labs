import { NextResponse } from 'next/server'
import { requireAuth, requireRole as requireRoleCheck } from '@/lib/authMiddleware'
import { getUserFromRequest } from '@/lib/auth'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const redisUrl = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379'
const connection = new IORedis(redisUrl)
const q = new Queue('embeddings', { connection })

export async function POST(req: Request) {
  try {
    const authRes = await requireAuth(req as any)
    if ((authRes as any)?.status) return authRes
    const user = authRes as any
    if (!requireRoleCheck(user, ['admin', 'engineer'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { recordId, projectId, text, metadata } = body
    if (!recordId || !text) return NextResponse.json({ error: 'recordId and text required' }, { status: 400 })

    await q.add('embed', { recordId, projectId, text, metadata })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
