import { prisma } from '../lib/prisma'

export type PGVectorRecord = {
  recordId: string
  projectId?: string
  vector: number[]
  metadata?: Record<string, any>
}

export const PGVectorStore = {
  // Insert or update embeddings into the pgvector table
  async upsert(records: PGVectorRecord[]) {
    for (const r of records) {
      await prisma.$executeRaw`
        INSERT INTO ai_embeddings_vector (record_id, project_id, embedding, metadata)
        VALUES (${r.recordId}, ${r.projectId ?? null}, ${r.vector}, ${r.metadata ?? {}})
        ON CONFLICT (record_id) DO UPDATE SET embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata
      `
    }
  },

  // Query nearest neighbors using pgvector <-> operator
  async query(vector: number[], topK = 10, projectId?: string) {
    const projFilter = projectId ? prisma.$queryRawUnsafe(`AND project_id = ${projectId}`) : ''
    // Using parameterized raw SQL for the vector query
    const rows: any[] = await prisma.$queryRaw`
      SELECT id, record_id, project_id, metadata, embedding
      FROM ai_embeddings_vector
      WHERE (${projectId ? prisma.raw('project_id = ' + projectId) : prisma.raw('true')})
      ORDER BY embedding <-> ${vector}
      LIMIT ${topK}
    `

    return rows.map((r: any) => ({ id: r.id, recordId: r.record_id, projectId: r.project_id, score: 0, metadata: r.metadata }))
  },

  async delete(recordIds: string[]) {
    await prisma.$executeRaw`
      DELETE FROM ai_embeddings_vector WHERE record_id IN (${prisma.join(recordIds)})
    `
  },
}
