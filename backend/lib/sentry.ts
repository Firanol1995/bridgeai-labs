// Sentry helper: dynamic-imports Sentry only when available. Falls back to no-ops
// so the dev environment can run without installing Sentry.

const dsn = process.env.SENTRY_DSN

let serverInitialized = false
let browserInitialized = false
let sentryModule: any = null

export async function initSentryServer() {
  if (!dsn || serverInitialized) return
  try {
    // Use runtime require so Next.js does not eagerly bundle Sentry's full
    // server integration graph during builds.
    // eslint-disable-next-line no-eval
    const req = eval('require')
    const mod = req('@sentry/node')
    sentryModule = mod
    mod.init({ dsn, tracesSampleRate: 0.1 })
    serverInitialized = true
    console.info('[sentry] server initialized')
  } catch (e) {
    console.warn('[sentry] server init skipped (module missing or init failed)')
  }
}

export async function initSentryBrowser() {
  if (!dsn || browserInitialized) return
  try {
    const importer = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>
    const mod = await importer('@sentry/react')
    sentryModule = mod
    mod.init({ dsn, tracesSampleRate: 0.1 })
    browserInitialized = true
    console.info('[sentry] browser initialized')
  } catch (e) {
    console.warn('[sentry] browser init skipped (module missing or init failed)')
  }
}

// Minimal Sentry facade to avoid runtime errors when library is not installed
export const Sentry = {
  captureException: (err: any) => {
    try {
      if (sentryModule && sentryModule.captureException) return sentryModule.captureException(err)
    } catch {}
    // fallback: log to console in dev
    // eslint-disable-next-line no-console
    console.error('[sentry fallback] ', err)
  }
}
