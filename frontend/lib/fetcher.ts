export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${path}`
  const res = await fetch(url, { credentials: 'include', ...opts })
  const text = await res.text()
  try { const json = JSON.parse(text); if (!res.ok) throw { status: res.status, body: json }; return json } catch { if (!res.ok) throw { status: res.status, body: text }; return text }
}

export default apiFetch
