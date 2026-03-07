import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import IORedis from 'ioredis'
import logger from '@/lib/logger'

function isEnabled(value: string | undefined) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase())
}

export async function GET() {
  try {
    const requireDb = isEnabled(process.env.HEALTHCHECK_REQUIRE_DB)
    const requireSupabase = isEnabled(process.env.HEALTHCHECK_REQUIRE_SUPABASE)
    const requireRedis = isEnabled(process.env.HEALTHCHECK_REQUIRE_REDIS)

    const dbConfigured = Boolean(process.env.DATABASE_URL)
    const supabaseConfigured = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
    const redisConfigured = Boolean(process.env.REDIS_URL || process.env.REDIS)

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
      } catch {
        checks.db.ok = false
        checks.db.status = 'degraded'
      }
    }

    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    if (supaUrl && (supabaseConfigured || requireSupabase)) {
      const res = await fetch(supaUrl, { method: 'GET' }).catch(() => null)
      checks.supabase.ok = !!res?.ok
      checks.supabase.status = res?.ok ? 'ok' : 'degraded'
      checks.supabase.httpStatus = res?.status ?? null
    }

    if (redisConfigured || requireRedis) {
      const redisUrl = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379'
      const redis = new IORedis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true })
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
