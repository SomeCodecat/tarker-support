# Tarkov Support

A full-stack web companion app for Escape from Tarkov players. Data is sourced
from the public [tarkov.dev](https://tarkov.dev) GraphQL API.

The product is built in three shippable slices:

1. **Companion / data browser** — browse items, ammo, tasks (quests), traders,
   and hideout requirements, plus an embedded AI assistant that answers data
   questions using the same tools as function calls.
2. **Progression tracker** (account-based) — record completed quests, hideout
   levels, and player/trader levels; synced across devices.
3. **Stash scanner + keep/sell engine** — upload a stash screenshot; the app
   recognizes items, cross-references your progression, and tells you what to
   **keep** vs. what's **safe to sell**, with reasons.

> **Status:** Slice 1 (Foundation) is in progress. The data layer, tool
> registry, LLM provider seam, app shell, CI, and Docker packaging are in
> place. The UI is gated on the design system (see
> [`docs/design/claude-design-prompt.md`](docs/design/claude-design-prompt.md))
> and is built once a mockup + design tokens are available. Slices 2 and 3 are
> future work.

## Monorepo layout

pnpm workspaces + [Turborepo](https://turbo.build).

```
apps/
  web/        Next.js 16 (App Router, TypeScript) — UI, API routes, assistant.
packages/
  data/       tarkov.dev GraphQL client, typed queries, and the cached
              "requirements index" (itemId → tasks/hideout that need it + sell prices).
  tools/      LLM function-calling tool definitions over the data layer.
  llm/        Provider-adapter seam (OpenAI / Gemini / Anthropic), selected by env.
docs/
  design/     Design-system prompt + (later) mockup and tokens.
  superpowers/ Design spec and the Slice 1 implementation plan.
```

## Prerequisites

- Node.js 20+
- pnpm 9 (pinned via `packageManager`; `corepack enable` will provide it)

## Getting started

```bash
pnpm install
pnpm dev            # runs the Next.js dev server (apps/web)
```

Open http://localhost:3000.

## Scripts

Run from the repo root (Turborepo fans out across the workspace):

| Command | What it does |
|---|---|
| `pnpm dev` | Start the web app in dev mode |
| `pnpm build` | Production build of all packages/apps |
| `pnpm test` | Run the unit test suite (Vitest) |
| `pnpm typecheck` | Type-check every workspace |
| `pnpm lint` | Lint every workspace |

## Environment

The LLM provider is selected by `LLM_PROVIDER` (`openai` | `gemini` |
`anthropic`; defaults to `gemini`). Provider API keys are read from the
environment. No key is required to run the data browser or the app shell.

## Docker

The web app builds into a self-contained image (Next.js standalone output):

```bash
docker build -t tarker-support .
docker run --rm -p 3000:3000 tarker-support
```

CI publishes the image to the GitHub Container Registry
(`ghcr.io/<owner>/tarker-support`) on every push to `main`; pull requests build
the image without pushing.

## Continuous integration

`.github/workflows/ci.yml` runs `typecheck`, `test`, and `build` on every push
and pull request. `.github/workflows/docker.yml` builds (and, on `main`,
publishes) the Docker image.

## Documentation

- [Design spec](docs/superpowers/specs/2026-07-01-tarkov-support-design.md)
- [Slice 1 (Foundation) plan](docs/superpowers/plans/2026-07-01-tarkov-support-slice1-foundation.md)
- [Design-system prompt](docs/design/claude-design-prompt.md)
