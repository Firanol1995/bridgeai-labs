type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function format(level: LogLevel, msg: string, meta?: any) {
  const time = new Date().toISOString()
  const payload: any = { time, level, msg }
  if (meta) payload.meta = meta
  return JSON.stringify(payload)
}

export * from '../../../backend/lib/logger'
export { default } from '../../../backend/lib/logger'
