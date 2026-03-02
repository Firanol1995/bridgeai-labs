// `createWorker` is imported dynamically to avoid creating a Redis connection
// when this module is imported for local testing (runProcessor).
import { openaiEmbedTexts } from '../adapters/openaiEmbeddings.ts'
import { PGVectorStore } from '../adapters/pgvectorStore.ts'
import { SupabaseVectorStore } from '../adapters/supabaseVectorStore.ts'

export type ProcessRecordInput = {
  recordId: string
  projectId?: string
  text: string
  metadata?: Record<string, any>
}

export async function processRecord(input: ProcessRecordInput, opts?: { allowMock?: boolean }) {
  const { recordId, projectId, text, metadata } = input
  if (!text || !recordId) throw new Error('invalid input for processRecord')

  const allowMock = opts?.allowMock === true

  if (!process.env.OPENAI_API_KEY && !allowMock) throw new Error('OPENAI_API_KEY not set')

  let vec: number[]
  if (process.env.OPENAI_API_KEY) {
    const vectors = await openaiEmbedTexts([text])
    vec = vectors[0]
  } else {
    // deterministic fallback vector for local testing
    const dim = 1536
    const out: number[] = new Array(dim)
    let seed = 0
    for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0
    for (let i = 0; i < dim; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      out[i] = ((seed % 1000) - 500) / 500 // values in [-1,1]
    }
    vec = out
  }

  const payload = { recordId, projectId, vector: vec, metadata: metadata || {} }

  try {
    if (process.env.USE_PGVECTOR === '1') {
      await PGVectorStore.upsert([payload])
    } else {
      await SupabaseVectorStore.upsert([payload])
    }
    console.log(JSON.stringify({ level: 'info', msg: 'upsert_success', recordId, projectId }))
    return { ok: true }
  } catch (err: any) {
    console.error(JSON.stringify({ level: 'error', msg: 'upsert_failed', recordId, projectId, error: String(err) }))
    throw err
  }
}

async function processor(job: any) {
  return processRecord(job.data)
}

// Create and export worker when this module is executed directly
import { fileURLToPath } from 'node:url'

const isMain = fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  // start worker for 'embeddings' queue
  ;(async () => {
    const { createWorker } = await import('./queue.ts')
    createWorker('embeddings', processor)
  })()
}

export { processor }
