import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set — aborting seed to avoid accidental writes')
    process.exit(1)
  }

  console.log('Seeding minimal enterprise data for BridgeAI Labs...')

  const org = await prisma.organization.upsert({
    where: { slug: 'bridgeai-labs' },
    update: {},
    create: { name: 'BridgeAI Labs', slug: 'bridgeai-labs' },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bridgeai.local' },
    update: {},
    create: {
      email: 'admin@bridgeai.local',
      name: 'BridgeAI Admin',
      role: 'ADMIN',
      organizationId: org.id,
    },
  })

  const project = await prisma.project.create({
    data: {
      organizationId: org.id,
      ownerId: admin.id,
      title: 'Platform Demo Project',
      description: 'Demonstration project for BridgeAI platform features',
    },
  })

  await prisma.dataset.createMany({
    data: [
      {
        projectId: project.id,
        name: 'sample-dataset.csv',
        fileUrl: 'https://example.com/sample-dataset.csv',
        storagePath: 'datasets/sample-dataset.csv',
        size: 12345,
        uploadedBy: admin.id,
      },
    ],
    skipDuplicates: true,
  })

  const model = await prisma.aiModel.create({
    data: {
      projectId: project.id,
      name: 'demo-copilot',
      type: 'transformer',
      config: {
        description: 'Placeholder model configuration',
      },
    },
  })

  await prisma.modelVersion.create({
    data: {
      modelId: model.id,
      version: 'v0.1.0',
      artifactUrl: null,
      metrics: { accuracy: 0.0 },
    },
  })

  await prisma.pipeline.create({
    data: {
      projectId: project.id,
      name: 'demo-ingest',
      type: 'batch',
      config: { schedule: 'manual' },
    },
  })

  await prisma.usageEvent.create({
    data: {
      projectId: project.id,
      userId: admin.id,
      eventType: 'project.created',
      payload: { note: 'Initial seed event' },
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'seed:initialize',
      targetType: 'project',
      targetId: project.id,
      diff: { created: true },
    },
  })

  console.log('Seed complete — created organization, admin user, demo project, dataset, model, pipeline, usage event, and audit entry')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
