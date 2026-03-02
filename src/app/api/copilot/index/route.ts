import { NextResponse } from 'next/server'
import { requireAuth, requireRole as requireRoleCheck } from '@/lib/authMiddleware'
import { getUserFromRequest } from '@/lib/auth'
import { openaiEmbedTexts } from '@/../backend/adapters/openaiEmbeddings'
import { SupabaseVectorStore } from '@/../backend/adapters/supabaseVectorStore'
import IORedis from 'ioredis'
import { Queue } from 'bullmq'

export async function POST(req: Request) {
  try {
    const authRes = await requireAuth(req as any)
    if ((authRes as any)?.status) return authRes
    const user = authRes as any
    if (!requireRoleCheck(user, ['admin', 'engineer'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { projectId, recordId, text, metadata } = body

    if (!recordId || !text) return NextResponse.json({ error: 'recordId and text required' }, { status: 400 })

    // chunk text into smaller passages for better retrieval
    function chunkText(input: string, size = 1000, overlap = 200) {
      const chunks: string[] = []
      let start = 0
      while (start < input.length) {
        const end = Math.min(start + size, input.length)
        chunks.push(input.slice(start, end))
        if (end === input.length) break
        start = Math.max(0, end - overlap)
      }
      return chunks.map((c) => c.trim()).filter(Boolean)
    }

    const chunks = chunkText(text, 1000, 200)
    const records = chunks.map((c, i) => ({ chunkText: c, chunkIndex: i, recordId: `${recordId}::${i}` }))

    // If queueing is enabled, add jobs to the 'embeddings' queue for background processing
    const useQueue = process.env.USE_QUEUE === '1'
    if (!process.env.OPENAI_API_KEY && !useQueue) {
      // store placeholder entries (empty vector) for each chunk to be processed later
      await SupabaseVectorStore.upsert(
        records.map((r) => ({ recordId: r.recordId, projectId, vector: [], metadata: { ...(metadata || {}), originalRecordId: recordId, chunkIndex: r.chunkIndex, text: r.chunkText } }))
      )
      return NextResponse.json({ ok: true, note: 'queued chunks (no embedding key)', chunks: records.length })
    }

    if (useQueue) {
      const redisUrl = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379'
      const connection = new IORedis(redisUrl)
      const q = new Queue('embeddings', { connection })
      for (const r of records) {
        await q.add('embed', { recordId: r.recordId, projectId, text: r.chunkText, metadata: { ...(metadata || {}), originalRecordId: recordId, chunkIndex: r.chunkIndex } })
      }
      return NextResponse.json({ ok: true, queued: records.length })
    }

    // embed chunks in batch and upsert
    const texts = records.map((r) => r.chunkText)
    const vectors = await openaiEmbedTexts(texts)
    const upserts = records.map((r, i) => ({ recordId: r.recordId, projectId, vector: vectors[i], metadata: { ...(metadata || {}), originalRecordId: recordId, chunkIndex: r.chunkIndex, text: r.chunkText } }))
    // choose storage backend: pgvector if enabled, else supabase json store
    if (process.env.USE_PGVECTOR === '1') {
      const { PGVectorStore } = await import('@/../backend/adapters/pgvectorStore')
      await PGVectorStore.upsert(upserts)
    } else {
      await SupabaseVectorStore.upsert(upserts)
    }

    return NextResponse.json({ ok: true, chunks: records.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
