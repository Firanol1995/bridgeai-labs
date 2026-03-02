const { Queue, QueueEvents } = require('bullmq')

async function run() {
  const redis = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  const q = new Queue('embeddings', { connection: redis })
  const qe = new QueueEvents('embeddings', { connection: redis })

  const job = await q.add('smoke', { recordId: `smoke-${Date.now()}`, text: 'smoke test', projectId: 'smoke' }, { removeOnComplete: true, removeOnFail: true })
  console.log('Enqueued job', job.id)

  return new Promise((resolve, reject) => {
    const onComplete = (args) => {
      if (String(args.jobId) === String(job.id)) {
        console.log('Job completed:', args.jobId)
        qe.removeListener('completed', onComplete)
        qe.removeListener('failed', onFailed)
        resolve(true)
      }
    }
    const onFailed = (args) => {
      if (String(args.jobId) === String(job.id)) {
        console.error('Job failed:', args.failedReason)
        qe.removeListener('completed', onComplete)
        qe.removeListener('failed', onFailed)
        reject(new Error(args.failedReason))
      }
    }
    qe.on('completed', onComplete)
    qe.on('failed', onFailed)
  })
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(2) })
