const { Client } = require('pg')

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL not set')
    process.exit(2)
  }
  const client = new Client({ connectionString: url })
  await client.connect()
  console.log('Connected to DB, testing pgvector query performance...')

  // sample vector (random) - length must match your embedding dim
  const vector = Array.from({ length: 1536 }, () => Math.random())
  const topK = 5
  const start = Date.now()
  try {
    const res = await client.query({
      text: 'SELECT id, record_id, project_id, metadata FROM ai_embeddings_vector ORDER BY embedding <-> $1 LIMIT $2',
      values: [vector, topK],
    })
    const took = Date.now() - start
    console.log(`pgvector query returned ${res.rowCount} rows in ${took}ms`)
  } catch (err) {
    console.error('pgvector query failed:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()
