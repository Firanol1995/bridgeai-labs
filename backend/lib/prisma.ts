// Load @prisma/client at runtime to avoid Turbopack marking it as external
let PrismaClientImpl: any
try {
  // Use eval('require') so bundlers won't statically analyze the require.
  // eslint-disable-next-line no-eval
  const req = eval('require')
  const mod = req('@prisma/client')
  PrismaClientImpl = mod.PrismaClient || mod.default || mod
} catch (e) {
  // Fallback minimal stub for local dev when @prisma/client isn't installed.
  // This keeps server routes from crashing; real DB operations will still fail
  // until the package and a DATABASE_URL are provided.
  // eslint-disable-next-line no-console
  console.warn('[prisma] @prisma/client not available; using fallback stub')
  PrismaClientImpl = class {
    constructor() {}
    async $connect() { return }
    async $disconnect() { return }
  }
}

declare global {
  // keep type loose to avoid compile-time dependency on @prisma/client
  // eslint-disable-next-line no-var
  var prisma: any | undefined
}

export const prisma = global.prisma ?? new PrismaClientImpl()

if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default prisma
