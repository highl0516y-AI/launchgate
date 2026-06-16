# ============================================
# LaunchGate Web — Production Dockerfile
# Next.js 15 Standalone
# ============================================

FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install --prefer-offline --no-audit
COPY . .
ENV NODE_ENV=production
RUN npx next build && npx next standalone

FROM node:20-slim AS runtime
WORKDIR /app
RUN groupadd -r launchgate && useradd -r -g launchgate -s /sbin/nologin launchgate
RUN mkdir -p /app/.next/standalone /app/.next/static /app/public
COPY --from=builder /app/.next/standalone/ /app/.next/standalone/
COPY --from=builder /app/.next/static/ /app/.next/static/
COPY --from=builder /app/public/ /app/public/
RUN chown -R launchgate:launchgate /app && chmod -R 755 /app
USER launchgate
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:3000', (r) => { process.exit(r.statusCode < 400 ? 0 : 1) }).on('error', () => process.exit(1))"]
CMD ["node", "server.js"]