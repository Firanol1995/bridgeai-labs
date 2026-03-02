#!/bin/sh
set -e

echo "Worker entry starting..."

if [ -z "$REDIS_URL" ]; then
  echo "ERROR: REDIS_URL is not set. Worker requires Redis for queue mode. Exiting."
  exit 1
fi

if [ -z "$NODE_ENV" ]; then
  NODE_ENV=production
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "WARNING: OPENAI_API_KEY not set — worker will run with deterministic mock embeddings unless provided."
fi

touch /tmp/worker.started

exec node dist/backend/workers/embeddingProcessor.js
