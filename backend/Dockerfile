FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
# Build TypeScript worker
RUN npm run build:worker

FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /usr/src/app/dist ./dist
COPY backend/worker-entry.sh /usr/local/bin/worker-entry.sh
RUN chmod +x /usr/local/bin/worker-entry.sh

ENTRYPOINT ["/usr/local/bin/worker-entry.sh"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD ["/bin/sh","-c","test -f /tmp/worker.started || exit 1"]
