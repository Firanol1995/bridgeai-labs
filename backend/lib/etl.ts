// ETL pipeline scaffolding (server-side)
export type ETLJob = {
  id: string
  projectId: string
  type: 'BATCH' | 'STREAM'
  status: 'PENDING' | 'RUNNING' | 'FAILED' | 'COMPLETED'
  config?: Record<string, any>
}

export async function runETLJob(job: ETLJob): Promise<void> {
  // Minimal stub: in real system wire to job queue (BullMQ, Temporal, Airflow)
  console.log('[ETL] running job', job.id, 'type', job.type)
  // TODO: implement extract -> transform -> load steps and error handling
}
