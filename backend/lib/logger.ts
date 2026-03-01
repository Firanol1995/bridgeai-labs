type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function format(level: LogLevel, msg: string, meta?: any) {
  const time = new Date().toISOString()
  const payload: any = { time, level, msg }
  if (meta) payload.meta = meta
  return JSON.stringify(payload)
}

export const logger = {
  debug: (msg: string, meta?: any) => console.debug(format('debug', msg, meta)),
  info: (msg: string, meta?: any) => console.info(format('info', msg, meta)),
  warn: (msg: string, meta?: any) => console.warn(format('warn', msg, meta)),
  error: (msg: string, meta?: any) => console.error(format('error', msg, meta)),
}

export default logger
