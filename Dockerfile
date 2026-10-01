FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests first for better Docker layer caching
COPY server/package.json server/package-lock.json ./server/

# Install production dependencies
RUN cd server && npm ci --omit=dev

# Copy application source
COPY server ./server

# Copy application data
COPY data ./data

# Copy database seed script
COPY scripts ./scripts

# TrustDesk API port
EXPOSE 5000

# Container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server/src/server.js"]