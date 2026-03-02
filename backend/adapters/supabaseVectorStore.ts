import { supabaseAdmin } from '../lib/supabaseServer.ts'

export type VectorRecord = {
  id?: string
  recordId: string
  projectId?: string
  vector: number[]
  metadata?: Record<string, any>
}

function cosine(a: number[], b: number[]) {
  const dot = a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0)
  const norma = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
  const normb = Math.sqrt(b.reduce((s, v) => s + v * v, 0))
  if (norma === 0 || normb === 0) return 0
  return dot / (norma * normb)
}

export const SupabaseVectorStore = {
  async upsert(records: VectorRecord[]) {
    const rows = records.map((r) => ({ record_id: r.recordId, project_id: r.projectId || null, embedding: r.vector, metadata: r.metadata || {} }))
    const { error } = await supabaseAdmin.from('ai_embeddings').upsert(rows, { onConflict: ['record_id'] })
    if (error) throw error
  },
  async query(vector: number[], topK = 10, projectId?: string) {
    // naive kNN: fetch embeddings for the project (or all) and compute cosine similarity in JS
    let qb = supabaseAdmin.from('ai_embeddings')
    if (projectId) qb = qb.select('*').eq('project_id', projectId)
    else qb = qb.select('*')

    const { data, error } = await qb
    if (error) throw error

    const items = (data || []).map((r: any) => ({
      id: r.id,
      recordId: r.record_id,
      projectId: r.project_id,
      vector: Array.isArray(r.embedding) ? r.embedding.map(Number) : [],
      metadata: r.metadata,
    }))

    const scored = items
      .map((it) => ({ item: it, score: cosine(vector, it.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    return scored.map((s) => ({ id: s.item.id, recordId: s.item.recordId, score: s.score, metadata: s.item.metadata }))
  },
  async delete(recordIds: string[]) {
    const { error } = await supabaseAdmin.from('ai_embeddings').delete().in('record_id', recordIds)
    if (error) throw error
  },
}
