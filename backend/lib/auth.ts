import { supabaseAdmin } from './supabaseServer'
import prisma from './prisma'
import logger from './logger'

type SessionUser = { id: string; email?: string; role?: string }

export async function getUserFromRequest(req: Request): Promise<SessionUser | null> {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  const token = auth.replace('Bearer ', '')

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error) return null
  const supaUser = data.user
  if (!supaUser) return null

  try {
    const local = await prisma.user.upsert({
      where: { id: supaUser.id },
      update: { email: supaUser.email ?? undefined },
      create: { id: supaUser.id, email: supaUser.email ?? undefined },
    })

    return { id: local.id, email: local.email ?? undefined, role: local.role ?? 'user' }
  } catch (e) {
    logger.error('[auth] failed to upsert local user', e)
    return { id: supaUser.id, email: supaUser.email ?? undefined, role: 'user' }
  }
}

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const u = await getUserFromRequest(req)
  return u?.id ?? null
}

export default getUserFromRequest
