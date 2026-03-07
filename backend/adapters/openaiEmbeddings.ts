import fetch from 'node-fetch'

const OPENAI_URL = 'https://api.openai.com/v1'

export async function openaiEmbedTexts(texts: string[], model = 'text-embedding-3-small') {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not set for OpenAI embeddings')

  const res = await fetch(`${OPENAI_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, input: texts }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error('OpenAI embeddings error: ' + txt)
  }

  const j = await res.json() as { data: Array<{ embedding: number[] }> }
  // returns array of vectors matching texts order
  return j.data.map((d: any) => d.embedding as number[])
}
