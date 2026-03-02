import * as Sentry from '@sentry/node'

const dsn = process.env.SENTRY_DSN

let serverInitialized = false
let browserInitialized = false

export async function initSentryServer() {
  if (!dsn || serverInitialized) return
  try {
    const { init: initNode } = await import('@sentry/node')
    initNode({ dsn, tracesSampleRate: 0.1 })
    serverInitialized = true
    console.info('[sentry] server initialized')
  } catch (e) {
    console.warn('[sentry] server init failed', e)
  }
}

export async function initSentryBrowser() {
  if (!dsn || browserInitialized) return
  try {
    const { init: initBrowser } = await import('@sentry/react')
    initBrowser({ dsn, tracesSampleRate: 0.1 })
    browserInitialized = true
    console.info('[sentry] browser initialized')
  } catch (e) {
    // noop
  }
}

export { Sentry }
