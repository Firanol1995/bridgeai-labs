// Server-side vector store adapter abstraction
// Implementations (e.g., Pinecone, Weaviate, Supabase Vector) should implement this interface.
export type VectorRecord = {
  id: string
  vector: number[]
  metadata?: Record<string, any>
}

export interface VectorStore {
  upsert(records: VectorRecord[]): Promise<void>
  query(vector: number[], topK?: number): Promise<VectorRecord[]>
  delete(ids: string[]): Promise<void>
}

// TODO: add concrete adapter implementation under backend/adapters/
export const NotImplementedVectorStore: VectorStore = {
  async upsert() {
    throw new Error('VectorStore.upsert not implemented')
  },
  async query() {
    throw new Error('VectorStore.query not implemented')
  },
  async delete() {
    throw new Error('VectorStore.delete not implemented')
  },
}
