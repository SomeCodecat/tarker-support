# Tarkov Support — Design Spec

**Status:** Approved direction (brainstorming complete). Ready for planning.
**Date:** 2026-07-01
**Target repo:** `/home/max/dev/tarker-support` (NEW, empty — build from zero)
**Base repo (lift code from):** `/home/max/dev/tarkov-mcp` (the existing MCP server)

---

## 1. Product summary

A full-stack web app for Escape from Tarkov players. Three capabilities, in priority order:

1. **Companion / data browser** — browse items, ammo, tasks (quests), traders, hideout, barters, crafts, maps, bosses — sourced from the public [tarkov.dev](https://tarkov.dev) GraphQL API.
2. **Progression tracker (account-based)** — logged-in users record completed quests, hideout station levels, player level, and trader levels; synced across devices.
3. **Stash scanner + keep/sell engine (the killer feature)** — upload a screenshot of your stash/inventory; the app recognizes the items, cross-references them against your progression, and tells you, per item, what to **keep** (still needed for quests/hideout) vs. what's **safe to sell** — with reasons.

Plus an **embedded AI assistant** (chat) that reuses the current MCP repo's tools as function-calling tools and can answer data questions and, later, progression/scan-aware questions.

---

## 2. Decisions locked during brainstorming

| Area | Decision |
|------|----------|
| **Item recognition** | Hybrid: deterministic **template-matching** against tarkov.dev item grid-images (fixed sprites, only **2 rotation states**) as the primary pass, a **pluggable vision-LLM** for low-confidence cells, then a **confirm/correct UI** before anything is judged. |
| **LLM / vision provider** | **Pluggable adapter** behind one interface. Default **OpenAI or Gemini** (user does not want to pay for Claude). **Claude kept as a swappable option** — never required, no Anthropic billing to run the app. |
| **Progression source** | **Account-based sync** — auth + database + per-user state, cross-device. |
| **"Safe to sell" horizon** | Default **all future needs** (conservative, quantity-aware: keep exactly what outstanding quests/hideout require, mark only the **surplus** sellable). Plus a **per-scan toggle** to narrow to current/next-N-levels. |
| **Found-in-Raid (FIR)** | **Best-effort detect from the screenshot** (read the FIR overlay per item), with a **confidence indicator** and a graceful "verify this yourself" fallback when uncertain. Hideout items don't require FIR; quest hand-ins often do. |
| **MCP base** | Reuse the data layer + tool definitions to power an **embedded in-app AI assistant** (not a standalone server). Optionally expose the same tools over an external MCP server later (near-zero extra cost). |
| **Build order** | **Foundation-first**, three shippable slices (below). |

---

## 3. Architecture

**Monorepo** (pnpm workspaces + Turborepo). "Using tarkov-mcp as a base" = lift its GraphQL data-fetching layer, tool definitions, TypeScript types, and patterns into shared packages.

```
packages/
  data/     tarkov.dev GraphQL client + typed queries + the cached "requirements index".
            Grown from tarkov-mcp's src/tools/items/*/loader.ts queries.
  tools/    tool/function definitions (the current MCP tools) — consumed by BOTH the
            in-app assistant (function-calling) and an optional external MCP server.
            Derived from tarkov-mcp's src/tools/items/*/index.ts.
  engine/   PURE keep/sell decision logic. No I/O. Heavily unit-tested.
apps/
  web/      Next.js (App Router, TypeScript): UI, API routes, auth, assistant, scanner.
  mcp/      (optional, a later slice) thin MCP server wrapping packages/tools.
```

Two cross-cutting services (in `apps/web` or their own packages):

- **LLM provider adapter** — `generateText` / `generateWithTools` / `vision` behind one interface; implementations for OpenAI, Gemini, (optional) Anthropic; selected by env. Powers the assistant chat and the scanner's vision fallback.
- **Recognition service** — grid detection → cell segmentation → template match (2 rotations) → vision-LLM fallback for low-confidence → FIR-overlay detection → hand off to confirm/correct UI.

### Reuse map (tarkov-mcp → new repo)

| tarkov-mcp source | New home | Notes |
|---|---|---|
| `src/tools/items/*/loader.ts` (gql queries) | `packages/data` | Keep queries; **expand** tasks/hideout queries to include full item requirements, counts, FIR flags, min level, prerequisites. |
| `src/tools/items/*/index.ts` (tool defs) | `packages/tools` | Reframe as LLM function-calling tools (name/description/params/handler). |
| `src/config/*`, `src/tools/response/*`, `src/logger/*` | reference only | Reuse patterns; **fix** the known env-var swap bug (`envConfigGetter.ts`) — do not copy the bug. |
| `graphql-request`, `zod` deps | `packages/data` | Same libraries. |

---

## 4. The requirements index (core data model)

Built from tarkov.dev GraphQL and cached (data changes on wipes/patches, so revalidate):

- **tasks** — `id`, `name`, `minPlayerLevel`, `trader`, `taskRequirements` (prereq tasks), `objectives` (type, item, count, **foundInRaid**).
- **hideoutStations** — `levels[]` with `itemRequirements` (item, count).
- **items** — `id`, `name`, `shortName`, `iconLink`, `gridImageLink`, `width`, `height`, `types`, `basePrice`, `sellFor` (trader + flea prices), `usedInTasks`.

Derived index: `itemId → { neededByTasks: [{taskId, count, foundInRaid}], neededByHideout: [{station, level, count}], sellFor }`.

Caching: Next.js route handler / ISR with periodic revalidation (e.g. daily) plus a manual "refresh data" trigger. Typed with zod to catch schema drift.

---

## 5. Keep/sell engine (pure, TDD)

**Signature (conceptual):**
```
decide(
  progression: { completedTaskIds, hideoutLevels: {stationId: level}, playerLevel, traderLevels },
  ownedItems:  [{ itemId, qty, fir?: boolean|null }],
  index:       RequirementsIndex,
  horizon:     { mode: "all-future" | "current" | "next-n-levels", n?: number }
): [{ itemId, ownedQty, keepQty, surplusQty, verdict: "KEEP"|"PARTIAL"|"SELL",
      reasons: [...], firNote?, bestSellVenue }]
```

**Rules:**
- Outstanding requirements = requirements from tasks **not** in `completedTaskIds` **and** in-horizon, plus hideout levels **not** yet built and in-horizon.
- **FIR split:** a task requirement with `foundInRaid: true` is only satisfied by FIR-owned copies. Compute keep-for-FIR separately; if the owned copy's FIR status is unknown (low recognition confidence), fall back to "keep + verify FIR yourself."
- `requiredQty = Σ outstanding counts` (respecting FIR split); `keepQty = min(ownedQty, requiredQty)`; `surplusQty = ownedQty − keepQty`.
- `verdict`: KEEP (all needed), PARTIAL (some surplus), SELL (nothing needed).
- `reasons`: which quests/hideout levels drive the keep; `bestSellVenue`: trader vs. flea from `sellFor`.
- **Horizon:** `all-future` = ignore availability, count every incomplete requirement. `current` = only tasks available now (level + prereqs met). `next-n-levels` = tasks up to playerLevel+N.

Determinism is essential — this module is pure and gets table-driven unit tests as the first thing built in Slice 3.

---

## 6. Recognition service (Slice 3, preceded by a spike)

1. **Grid detection** — locate the stash grid; infer cell pixel size.
2. **Segmentation** — group cells into item regions (items span W×H cells; use borders/backgrounds).
3. **Template match** — compare each region to `gridImageLink` sprites at 0° and 90°; score confidence.
4. **Vision fallback** — for low-confidence regions, send the crop + candidate shortlist to the vision-LLM adapter.
5. **FIR detection** — detect the FIR overlay icon per region; emit confidence.
6. **Confirm/correct UI** — user reviews the recognized list, fixes misreads via a searchable picker, sets or confirms FIR where uncertain — **before** the engine runs.

**Spike (throwaway, before committing to Slice 3):** run steps 1–5 on a handful of real screenshots with hand-labeled ground truth; measure accuracy; decide the template/vision split and whether the approach clears a usability bar.

---

## 7. Embedded AI assistant (Slice 2)

- Chat UI in the web app, **gated behind auth** (so we can rate-limit and control LLM cost/abuse).
- Uses the **provider adapter** + **`packages/tools`** for function-calling over the data layer.
- **Progression-aware** in Slice 2; **scan-aware** in Slice 3 ("given this scan and my quests, what should I dump?").

---

## 8. Slice roadmap (each = its own spec → plan → build)

| Slice | Delivers | Key tasks |
|-------|----------|-----------|
| **1 — Foundation** | A usable app. | Monorepo scaffold; `packages/data` (queries + requirements-index groundwork, zod-typed, cached); `packages/tools`; **design system (regenerate the Claude design prompt here — see §9)**; companion UI pages (items/ammo/tasks/traders/hideout); provider-adapter skeleton; CI + test harness. |
| **2 — Accounts + progression + assistant** | Personalized app. | Auth; Postgres + ORM; progression tracker UI + sync; the embedded AI assistant (auth-gated, rate-limited, progression-aware). |
| **3 — Scanner + engine** | The killer feature. | **Recognition spike first**; `packages/engine` (TDD); scanner upload → recognition → FIR → confirm/correct UI → engine results screen with the horizon toggle; assistant becomes scan-aware. |

Only **Slice 1** is specced in detail now (see the Slice 1 plan). Slices 2–3 get their own brainstorm→spec cycles when reached; their designs will firm up with what Slice 1 teaches us.

---

## 9. When the Claude design prompt is generated (IMPORTANT)

The visual-design prompt for claude.ai is **not authored now**. It is **regenerated fresh during Slice 1's "Design System" task**, because by then the spec is final and the prompt must reflect *all* decisions — including that the app will later grow **progression** and **scanner/keep-sell** screens, so the design system must accommodate them from the start.

**Regeneration checklist (run at execution time):**
- Product one-liner from §1; the full data-domain list from §4.
- The tactical/EFT aesthetic brief (dark, gunmetal/olive/khaki, amber accents, monospace stats, rouble ₽ formatting, rarity coloring, high density).
- Screens to mock: dashboard, item database + detail, ammo comparison table, quest browser, **plus placeholders for** progression tracker and the **scan-result keep/sell view** (so the design language covers them).
- Deliverable: an interactive React artifact (Tailwind + lucide, mock data) + a written design-token summary (colors/type scale/spacing) to port into `tailwind.config` and base components.
- Flow: human runs it in claude.ai → brings the artifact back → the implementer extracts tokens/components into the real Next.js app.

---

## 10. Tech stack

- **Framework:** Next.js (App Router) + TypeScript.
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives) + lucide-react.
- **Data:** `graphql-request` (from the base) against tarkov.dev; zod validation; ISR/route-handler caching with revalidation.
- **Accounts (Slice 2):** Postgres (Neon or Supabase) + Drizzle ORM; Auth.js (NextAuth) or Clerk — decided in the Slice 2 spec.
- **LLM provider adapter:** OpenAI + Google Gemini SDKs; optional Anthropic. Env-selected.
- **Testing:** Vitest (unit — especially `packages/engine`); Playwright (e2e) from Slice 2+; recognition fixture tests in Slice 3.
- **Tooling:** pnpm, Turborepo, ESLint (v9 flat) + Prettier, TypeScript strict.

---

## 11. Risks & mitigations

- **Recognition accuracy** — the biggest unknown. → Throwaway spike before Slice 3; human confirm/correct step always in the loop.
- **tarkov.dev schema drift / wipes** — data changes. → Typed queries + zod + scheduled revalidation + a manual refresh.
- **LLM cost / abuse** — assistant and vision cost money. → Auth-gate the assistant, per-user rate limits, template-matching does the bulk so vision is only a fallback.
- **FIR read reliability** — a wrong "safe to sell" is the expensive error. → Confidence threshold + fallback to "keep & verify"; never assert SELL on a FIR-required item when FIR status is uncertain.
- **Scope** — large. → Foundation-first slicing; only Slice 1 specced now.
