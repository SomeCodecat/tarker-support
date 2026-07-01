# syntax=docker/dockerfile:1

# Multi-stage build for the Next.js web app in this pnpm/Turborepo monorepo.
# The build context is the repo root so the workspace lockfile and packages
# are all reachable.

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# corepack ships with Node and pins pnpm to the version in package.json
# ("packageManager": "pnpm@9.0.0").
RUN corepack enable

# ---- Builder: install workspace deps, then build the standalone server ----
FROM base AS builder
WORKDIR /app

# Copy only manifests first so the install layer is cached until deps change.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/data/package.json ./packages/data/
COPY packages/tools/package.json ./packages/tools/
COPY packages/llm/package.json ./packages/llm/
RUN pnpm install --frozen-lockfile

# Copy the rest of the source (node_modules is excluded via .dockerignore, so
# the workspace symlinks created by the install above are preserved).
COPY . .

# `next build` runs with cwd = apps/web, which next.config.ts relies on for
# outputFileTracingRoot. Fonts (next/font/google) are fetched here, so this
# stage needs network access — GitHub-hosted runners provide it.
RUN pnpm --filter web build

# ---- Runner: minimal image containing only the standalone server ----
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# The standalone output bundles the server plus its traced node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Static assets and public files are NOT part of standalone; copy them in.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

# server.js lives at apps/web/server.js inside the standalone tree.
CMD ["node", "apps/web/server.js"]
