"use client"

import { useEffect } from 'react'

export default function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return
    const importer = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>
    importer('@sentry/react')
      .then(({ init }) => {
        try {
          init({ dsn, tracesSampleRate: 0.1 })
          // eslint-disable-next-line no-console
          console.info('[sentry] browser initialized')
        } catch (e) {
          // noop
        }
      })
      .catch(() => {
        // ignore import failures in dev if package missing
      })
  }, [])
  return null
}
