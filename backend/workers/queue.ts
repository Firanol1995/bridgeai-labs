import * as Bull from 'bullmq'
import type { Job } from 'bullmq'
import IORedis from 'ioredis'

const redisUrl = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379'
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

export function createQueue(name: string) {
  const scheduler = new Bull.QueueScheduler(name, { connection })
  const q = new Bull.Queue(name, { connection })
  return { q, scheduler }
}

export function createWorker(name: string, processor: (job: Job) => Promise<any>) {
  const worker = new Bull.Worker(name, async (job) => processor(job), { connection })
  return worker
}
