const fs = require('fs')
const path = require('path')

// Load .env if present
try {
  const envPath = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (!m) return
      let k = m[1].trim()
      let v = m[2].trim()
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
      process.env[k] = v
    })
  }
} catch (e) {
  // ignore
}

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

;(async () => {
  try {
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL ? '[redacted]' : 'not set')
    const res = await prisma.$queryRaw`SELECT 1 as result`
    console.log('DB query result:', res)
    const users = await prisma.user.findMany({ take: 1 })
    console.log('Sample users:', users)
  } catch (e) {
    console.error('DB ERROR:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
})()
