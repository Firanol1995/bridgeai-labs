import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { supabaseAdmin } from '@/../backend/lib/supabaseServer'

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req as any)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      requireRole(user.role, ['admin', 'engineer'])
    } catch (e) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const q = await supabaseAdmin.from('ai_embeddings').select('*').limit(100)
    if (q.error) throw q.error

    return NextResponse.json({ items: q.data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
