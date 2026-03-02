import { NextResponse } from 'next/server'
import { openaiEmbedTexts } from '@/../backend/adapters/openaiEmbeddings'
import { SupabaseVectorStore } from '@/../backend/adapters/supabaseVectorStore'
import { openaiChatCompletion } from '@/../backend/adapters/openaiCompletion'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input: string = body.input || ''
    const projectId: string | undefined = body.projectId

    if (!process.env.OPENAI_API_KEY) {
      // fallback placeholder when no key
      return NextResponse.json({ answer: 'Copilot placeholder: set OPENAI_API_KEY to enable RAG.' })
    }

    // 1) get embedding for input
    const [vec] = await openaiEmbedTexts([input])

    // 2) query vector store for nearest contexts
    const hits = await SupabaseVectorStore.query(vec, 5, projectId)

    // 3) Build a simple prompt with retrieved contexts and call the completion API
    const contexts = hits.map((h: any, i: number) => `Context ${i + 1}: ${JSON.stringify(h.metadata || {})}`).join('\n\n')
    const systemPrompt = 'You are a helpful assistant. Use the provided contexts to answer the user concisely.'
    const userMessage = `${input}\n\nRelevant contexts:\n${contexts}`

    try {
      const answer = await openaiChatCompletion(systemPrompt, [{ role: 'user', content: userMessage }])
      return NextResponse.json({ answer, hits })
    } catch (err) {
      // fallback to a readable placeholder if completions fail
      const fallback = `Could not generate final answer (completion error). Retrieved ${hits.length} contexts.`
      return NextResponse.json({ answer: fallback, hits, warn: String(err) })
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
