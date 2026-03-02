Worker quickstart
=================

This document shows how to run the background worker locally or in Docker.

Local (build & run compiled worker)
----------------------------------

1. Build the worker (TypeScript -> dist):

```bash
npm run build:worker
```

2. Ensure `REDIS_URL` points to a reachable Redis instance (example: `redis://127.0.0.1:6379`).

3. Run the worker:

```bash
npm run worker:run
```

Docker (recommended for integration testing)
-------------------------------------------

Bring up Redis and the worker in a containerized environment:

```bash
docker-compose -f docker-compose.worker.yml up --build -d
# View logs
docker-compose -f docker-compose.worker.yml logs -f worker
```

Notes
-----
- The worker requires the `REDIS_URL` environment variable in queue mode. The Docker Compose provides `redis` and sets `REDIS_URL=redis://redis:6379` for the worker service.
- If `OPENAI_API_KEY` is not set, the standalone runner or worker will use a deterministic mock embedding implementation for local testing.
- The Docker image exposes a simple healthcheck file at `/tmp/worker.started` which the entry script creates when the worker starts.
