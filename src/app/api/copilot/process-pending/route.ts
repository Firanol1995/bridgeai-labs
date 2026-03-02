import { NextResponse } from 'next/server'
import { requireAuth, requireRole as requireRoleCheck } from '@/lib/authMiddleware'
import { getUserFromRequest } from '@/lib/auth'
import { openaiEmbedTexts } from '@/../backend/adapters/openaiEmbeddings'
import { SupabaseVectorStore } from '@/../backend/adapters/supabaseVectorStore'
import { supabaseAdmin } from '@/../backend/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const authRes = await requireAuth(req as any)
    if ((authRes as any)?.status) return authRes
    const user = authRes as any
    if (!requireRoleCheck(user, ['admin', 'engineer'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Missing OPENAI_API_KEY on server' }, { status: 400 })

    const body = await req.json().catch(() => ({}))
    const limit = Math.min(Number(body.limit || 100), 500)

    const { data, error } = await supabaseAdmin.from('ai_embeddings').select('*').limit(limit)
    if (error) throw error

    const pending = (data || []).filter((r: any) => !Array.isArray(r.embedding) || r.embedding.length === 0)
    if (!pending.length) return NextResponse.json({ ok: true, processed: 0 })

    // Batch process to avoid too-large requests
    const batchSize = 50
    let processed = 0
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize)
      const texts = batch.map((b: any) => (b.metadata && (b.metadata.text || b.metadata.content)) || '')
      const vectors = await openaiEmbedTexts(texts)
      const upserts = batch.map((b: any, idx: number) => ({ recordId: b.record_id, projectId: b.project_id, vector: vectors[idx], metadata: b.metadata || {} }))
      await SupabaseVectorStore.upsert(upserts)
      processed += upserts.length
    }

    return NextResponse.json({ ok: true, processed })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
