# syntax=docker/dockerfile:1

# ---- Builder: install deps (incl. native better-sqlite3) and build ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Build tools required to compile better-sqlite3.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runner: LibreOffice for PDF + the standalone Next server ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/app/data/reports.db

# LibreOffice (headless PPTX->PDF) + base fonts. --no-install-recommends keeps it lean.
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     libreoffice-impress libreoffice-core fonts-liberation fonts-dejavu \
  && rm -rf /var/lib/apt/lists/*

# Standalone server + assets + the .pptx template asset.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/templates ./templates
# Native module (kept external from the bundle).
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# Persistent data directory (mount a volume here).
RUN mkdir -p /app/data && chown -R node:node /app
USER node
VOLUME /app/data
EXPOSE 3000

CMD ["node", "server.js"]
