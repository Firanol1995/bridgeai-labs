import prisma from './prisma'
import logger from './logger'

export async function logActivity(userId: string, action: string, metadata?: unknown) {
  try {
    return await prisma.activityLog.create({
      data: { userId, action, metadata: metadata ?? {} },
    })
  } catch (err) {
    logger.error('logActivity error', err)
    return null
  }
}
