import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import IORedis from 'ioredis'
import logger from '@/lib/logger'

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function isEnabled(value: string | undefined) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase())
}

export async function GET() {
  try {
    const requireDb = isEnabled(readEnv('HEALTHCHECK_REQUIRE_DB'))
    const requireSupabase = isEnabled(readEnv('HEALTHCHECK_REQUIRE_SUPABASE'))
    const requireRedis = isEnabled(readEnv('HEALTHCHECK_REQUIRE_REDIS'))

    const dbUrl = readEnv('DATABASE_URL')
    const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')
    const supabasePublicKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
    const redisUrl = readEnv('REDIS_URL', 'REDIS')

    const dbConfigured = Boolean(dbUrl)
    const supabaseConfigured = Boolean(supabaseUrl)
    const redisConfigured = Boolean(redisUrl)

    const checks = {
      db: { required: requireDb, configured: dbConfigured, ok: !requireDb && !dbConfigured, status: 'skipped' as 'ok' | 'degraded' | 'skipped' },
      supabase: { required: requireSupabase, configured: supabaseConfigured, ok: !requireSupabase && !supabaseConfigured, status: 'skipped' as 'ok' | 'degraded' | 'skipped', httpStatus: null as number | null },
      redis: { required: requireRedis, configured: redisConfigured, ok: !requireRedis && !redisConfigured, status: 'skipped' as 'ok' | 'degraded' | 'skipped' },
    }

    if (dbConfigured || requireDb) {
      try {
        await prisma.$queryRaw`SELECT 1`
        checks.db.ok = true
        checks.db.status = 'ok'
      } catch (err) {
        checks.db.ok = false
        checks.db.status = 'degraded'
      }
    }

    if (supabaseUrl && (supabaseConfigured || requireSupabase)) {
      const healthUrl = new URL('/auth/v1/health', supabaseUrl).toString()
      const res = await fetch(healthUrl, {
        method: 'GET',
        headers: supabasePublicKey ? { apikey: supabasePublicKey } : undefined,
      }).catch(() => null)
      checks.supabase.ok = !!res?.ok
      checks.supabase.status = res?.ok ? 'ok' : 'degraded'
      checks.supabase.httpStatus = res?.status ?? null
    }

    if (redisConfigured || requireRedis) {
      const redis = new IORedis(redisUrl || 'redis://127.0.0.1:6379', { maxRetriesPerRequest: 1, lazyConnect: true })
      try {
        await redis.connect()
        const pong = await redis.ping()
        checks.redis.ok = pong === 'PONG'
        checks.redis.status = checks.redis.ok ? 'ok' : 'degraded'
      } catch {
        checks.redis.ok = false
        checks.redis.status = 'degraded'
      } finally {
        redis.disconnect()
      }
    }

    const ok = Object.values(checks).every((check) => !check.required || check.ok)

    return NextResponse.json({
      ok,
      status: ok ? 'ok' : 'degraded',
      checks,
    })
  } catch (err) {
    logger.error('[GET /api/health] error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
