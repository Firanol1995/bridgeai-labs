import * as Bull from 'bullmq'
import type { Job } from 'bullmq'
import IORedis from 'ioredis'

const redisUrl = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379'

let connection: any = null

function getConnection() {
  if (connection) return connection
  connection = new IORedis(redisUrl, { maxRetriesPerRequest: null })
  return connection
}

export function createQueue(name: string) {
  const q = new Bull.Queue(name, { connection: getConnection() })
  return { q }
}

export function createWorker(name: string, processor: (job: Job) => Promise<any>) {
  const worker = new Bull.Worker(name, async (job) => processor(job), { connection: getConnection() })
  return worker
}
