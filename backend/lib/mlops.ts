// MLOps scaffolding: model registry and monitoring hooks
import prisma from './prisma'

export async function registerModelArtifact(modelId: string, artifactUrl: string, version = 'v1') {
  // Create a new ModelVersion entry (non-destructive)
  return prisma.modelVersion.create({
    data: {
      modelId,
      version,
      artifactUrl,
    },
  })
}

export async function recordModelMetric(modelVersionId: string, metrics: Record<string, any>) {
  // Append metrics to the ModelVersion.metrics (merge semantics)
  const mv = await prisma.modelVersion.findUnique({ where: { id: modelVersionId } })
  if (!mv) throw new Error('model version not found')
  const updated = await prisma.modelVersion.update({
    where: { id: modelVersionId },
    data: { metrics: { ...(mv.metrics || {}), ...metrics } },
  })
  return updated
}
