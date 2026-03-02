import { processRecord } from './embeddingProcessor.ts'

async function main() {
  const recordId = process.env.TEST_RECORD_ID || `local-test-${Date.now()}`
  const projectId = process.env.TEST_PROJECT_ID || 'local'
  const text = process.env.TEST_TEXT || 'This is a local embedding test.'
  const metadata = { source: 'runProcessor' }

  try {
    console.log('Running processRecord with', { recordId, projectId })
    const res = await processRecord({ recordId, projectId, text, metadata }, { allowMock: true })
    console.log('processRecord result:', res)
  } catch (err) {
    console.error('processRecord failed:', err)
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('runProcessor.ts')) {
  main()
}

export default main
