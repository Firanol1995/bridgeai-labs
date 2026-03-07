import { PrismaClient } from '@prisma/client'

// Normalize env strings so accidental whitespace in deployment config doesn't break connections.
if (typeof process.env.DATABASE_URL === 'string') {
  process.env.DATABASE_URL = process.env.DATABASE_URL.trim()
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default prisma
