const truthyValues = new Set(['1', 'true', 'yes', 'on'])

function isTruthy(value) {
  return truthyValues.has(String(value || '').toLowerCase())
}

function hasValue(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
}

export function getStartupEnvValidationErrors(env = process.env) {
  const errors = []

  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  for (const key of required) {
    if (!hasValue(env[key])) {
      errors.push(`${key} is required for production startup`)
    }
  }

  if (!hasValue(env.SUPABASE_SERVICE_ROLE) && !hasValue(env.SUPABASE_KEY)) {
    errors.push('SUPABASE_SERVICE_ROLE or SUPABASE_KEY is required for production startup')
  }

  const requiresRedis = isTruthy(env.USE_QUEUE) || isTruthy(env.HEALTHCHECK_REQUIRE_REDIS)
  if (requiresRedis && !hasValue(env.REDIS_URL) && !hasValue(env.REDIS)) {
    errors.push('REDIS_URL or REDIS is required when USE_QUEUE=1 or HEALTHCHECK_REQUIRE_REDIS=1')
  }

  return errors
}
