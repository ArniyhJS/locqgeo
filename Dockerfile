# ==============================================================================
# Multi-Stage Dockerfile for LocqGeo Unified Monorepo
# Built with Node.js 24 (LTS), pnpm 11+, Turborepo, and Alpine Linux
# ==============================================================================

# --- Stage 1: Base Environment ---
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.17.0 --activate

# --- Stage 2: Turborepo Pruner (Filters Scope per Application/Service) ---
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@^2.10.6
COPY . .
ARG APP_NAME=engine
RUN turbo prune --scope=@locqgeo/${APP_NAME} --docker

# --- Stage 3: Dependencies & Build ---
FROM base AS builder
WORKDIR /app

# Copy pruned lockfile and workspace configurations for layer caching
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies across pruned workspace
RUN pnpm install --frozen-lockfile

# Copy full pruned source tree
COPY --from=pruner /app/out/full/ .

# Build target application/service
ARG APP_NAME=engine
ENV NODE_ENV=production
RUN pnpm run build --filter=@locqgeo/${APP_NAME}

# --- Stage 4: Production Runtime ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 locqgeo

COPY --from=builder --chown=locqgeo:nodejs /app .

USER locqgeo

ARG APP_NAME=engine
ENV TARGET_APP=${APP_NAME}

EXPOSE 8080 3000 3001 3002

CMD ["sh", "-c", "pnpm --filter=@locqgeo/${TARGET_APP} start || pnpm --filter=@locqgeo/${TARGET_APP} dev"]
