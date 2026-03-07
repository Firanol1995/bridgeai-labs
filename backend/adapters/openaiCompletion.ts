import fetch from 'node-fetch'

const OPENAI_URL = 'https://api.openai.com/v1'

export async function openaiChatCompletion(systemPrompt: string, messages: Array<{ role: string; content: string }>, model = 'gpt-3.5-turbo') {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not set for completions')

  const body = {
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 512,
    temperature: 0.2,
  }

  const res = await fetch(`${OPENAI_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error('OpenAI completion error: ' + txt)
  }

  const j = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const answer = j.choices?.[0]?.message?.content || ''
  return answer
}
