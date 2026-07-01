# Claude.ai Design Prompt — Tarkov Support

> **How to use this (human step, Task 9 of the Slice 1 plan):**
> 1. Open [claude.ai](https://claude.ai) and paste **everything inside the `=== PROMPT ===` fence below** as a new message.
> 2. **The GitHub repo is now linked to this claude.ai project**, so Claude can browse the real codebase directly while it designs. The relevant code lives on branch **`slice1-foundation`** (the data model, requirements index, and routes referenced in the prompt are all on that branch). Once **PR #1** merges, the same files will also be on `main` — until then, point Claude at `slice1-foundation`.
> 3. Iterate on the generated React artifact until the look feels right (ask for tweaks to color, density, typography).
> 4. Bring back **two things**: (a) the final artifact code, (b) the written **design-token summary** (colors, type scale, spacing).
> 5. Hand both to the implementer — they port the tokens into the `@theme` block of `apps/web/app/globals.css` (Tailwind v4 CSS-first `@theme` tokens — this project has no `tailwind.config.ts`) and rebuild the shared components against **shadcn/ui**.
>
> This prompt was regenerated fresh from the final design spec (`docs/superpowers/specs/2026-07-01-tarkov-support-design.md`, §9) so it reflects *all* locked decisions — including that the app will grow **progression** and **scanner / keep-sell** screens later, so the design system must accommodate them from day one. It has since been updated to reference the **real, existing codebase** as the source of truth for field names and routes.

---

=== PROMPT ===

You are designing the visual design system and key screens for **Tarkov Support**, a companion web app for players of the game *Escape from Tarkov*.

**Product in one line:** a fast, dense, dark "tactical terminal" companion for Escape from Tarkov — browse the game's items, ammo, quests, traders, and hideout data, and (in later versions) track your progression and scan a screenshot of your stash to be told, per item, what to **keep** vs. **sell**.

## Reference the actual code

This is **not** a greenfield mockup — a real codebase already exists, and **the GitHub repository is linked to this claude.ai project, so you can browse the files directly** while you design. Ground every field name, price shape, and "needed-by" breakdown in the actual TypeScript types below; where the code already defines a field, use **that exact name** as the source of truth rather than inventing one. (This prompt is still self-contained: if the repo connector is unavailable, the interfaces you need are transcribed below — but when you *can* browse, the repo is authoritative.)

- **Repo:** `SomeCodecat/tarker-support`
- **Branch:** `slice1-foundation`
- **Browse the tree:** https://github.com/SomeCodecat/tarker-support/tree/slice1-foundation
- **Link any file:** `https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/<path>` (append the repo-relative path from the list below)

### Key files

- **[`packages/data/src/types.ts`](https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/packages/data/src/types.ts)** — the canonical data model. Grounds **every** screen. Exact interfaces and their exact fields:
  - `Item` → `id`, `name`, `shortName`, `width`, `height`, `iconLink` (nullable), `gridImageLink` (nullable), `basePrice`, `types` (string[]), `sellFor` (`SellVenue[]`). Grounds **Items** (list) + **Item Detail**. Note: grid size is `width` × `height`; there is **no** damage/penetration/caliber field on `Item`.
  - `SellVenue` → `source` (string, the vendor/market name), `priceRUB` (number). This is the only price-per-venue shape — grounds the trader-vs-flea sell columns everywhere.
  - `Task` → `id`, `name`, `minPlayerLevel`, `traderName` (string | null), `prerequisiteTaskIds` (string[]), `itemObjectives` (`TaskObjectiveItem[]`). Grounds the **Tasks (Quest) Browser**.
  - `TaskObjectiveItem` → `itemId`, `count`, `foundInRaid` (boolean). This `foundInRaid` boolean is the real backing for the "FIR required?" badge.
  - `HideoutStation` → `id`, `name`, `levels` (`HideoutLevel[]`); `HideoutLevel` → `level`, `itemRequirements` (`HideoutItemRequirement[]`); `HideoutItemRequirement` → `itemId`, `count`. Grounds the **Hideout** screen and Item Detail's hideout needs.
  - `RequirementsEntry` → `itemId`, `neededByTasks` (`TaskNeed[]`), `neededByHideout` (`HideoutNeed[]`), `sellFor` (`SellVenue[]`); `RequirementsIndex = Record<string, RequirementsEntry>`. This is the derived "needed-by" model that drives **Item Detail's** breakdown and the future keep/sell verdict.
  - `TaskNeed` → `taskId`, `taskName`, `count`, `foundInRaid`, `minPlayerLevel`. `HideoutNeed` → `stationId`, `stationName`, `level`, `count`. Use these exact field names for the per-quest / per-station "needed by" rows.
- **[`packages/data/src/queries/items.ts`](https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/packages/data/src/queries/items.ts)** — the GraphQL `items` fetch: `id name shortName width height iconLink gridImageLink basePrice types` and `sellFor { priceRUB vendor { name } }`, mapped so `SellVenue.source = vendor.name`. Grounds **Items** columns.
- **[`packages/data/src/queries/tasks.ts`](https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/packages/data/src/queries/tasks.ts)** — the `tasks` fetch: `minPlayerLevel`, `trader { name }` → `traderName`, `taskRequirements` → `prerequisiteTaskIds`, and item objectives via the `TaskObjectiveItem` GraphQL fragment. Grounds the **Tasks Browser** (trader grouping, level, prerequisite lock, objective counts + FIR).
- **[`packages/data/src/queries/hideout.ts`](https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/packages/data/src/queries/hideout.ts)** — the `hideoutStations` fetch: `levels { level itemRequirements { item { id } count } }`. Grounds the **Hideout** screen.
- **[`packages/data/src/requirementsIndex.ts`](https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/packages/data/src/requirementsIndex.ts)** — `buildRequirementsIndex(items, tasks, hideout)` fans item/task/hideout data into per-item `neededByTasks` / `neededByHideout` / `sellFor`. This is the real engine behind Item Detail's "needed by" panel and the eventual keep/sell logic.
- **[`apps/web/components/nav.tsx`](https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/apps/web/components/nav.tsx)** — the **real routes** the app is built around: `/` (Dashboard), `/items`, `/ammo`, `/tasks`, `/traders`, `/hideout`. Design your nav to these exact routes.
- **[`packages/tools/src/registry.ts`](https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/packages/tools/src/registry.ts)** — assistant function-calling tools (`getItems`, `getTasks`) over the same data (context only; no chat screen is being designed now).
- **[`packages/llm/src/types.ts`](https://github.com/SomeCodecat/tarker-support/blob/slice1-foundation/packages/llm/src/types.ts)** — the `LlmProvider` seam (`openai | gemini | anthropic`, `generateText`); its own comment notes vision + tool-calling are deferred to a later slice — relevant only as evidence the **Scan / Keep-Sell** screen is not yet wired.

**Use the field names above verbatim in labels, mock objects, and column keys.** Prices are `priceRUB` from a `SellVenue` whose `source` names the venue; grid size is `width`×`height`; FIR is the `foundInRaid` boolean. Do not invent alternate names for anything that already exists in `types.ts`.

Please produce **an interactive React artifact** (a single self-contained component tree using **Tailwind CSS** utility classes and **lucide-react** icons, with realistic **mock data** — no real API calls) that demonstrates the design language across the screens listed below, **plus a written design-token summary** (see "Deliverables" at the end). Build components in a way that maps cleanly onto **shadcn/ui** primitives (Button, Card, Input, Table, Badge, Tabs, Dialog) since the real app is built on shadcn/ui + Tailwind + Radix — favor those component shapes and class conventions.

## Aesthetic brief — "tactical / EFT terminal"

- **Mood:** military-industrial, utilitarian, high information density. It should feel like a field terminal or an inventory management console, not a consumer SaaS dashboard. Think gunmetal, olive drab, khaki, and worn steel.
- **Palette:** dark by default (near-black gunmetal backgrounds, ~`#0f1211`–`#1a1e1b` range), desaturated olive/khaki surfaces and borders, with a single **amber/gold accent** (`~#e8b923` / `#f0c040`) for primary actions, highlights, and active states. Use a muted red for "sell/danger" and a muted green for "keep/safe" as semantic colors (see below).
- **Typography:** a clean sans for body/UI, and a **monospace** face for all numeric stats, prices, calibers, and IDs (damage, penetration, ₽ prices, quantities, level numbers). Monospace numbers are a core part of the identity — stats should line up in columns.
- **Money:** format all prices as **roubles with the ₽ symbol** and thousands separators (e.g. `₽42,500`), monospace. These come from `priceRUB` on a `SellVenue`; show trader vs. flea-market prices distinctly (the venue name is `SellVenue.source`).
- **Rarity / type coloring:** items and ammo carry a subtle color coding (e.g. by item `types` or ammo penetration tier) — a thin left border or a small colored dot/badge, never loud fills. Keep it legible on the dark background.
- **Density:** prefer compact tables and tight rows over airy cards. This is a power-user tool; users scan long lists. Provide comfortable hit targets but keep vertical rhythm tight.
- **Chrome:** a persistent top (or left) nav with the domain sections; a thin status/utility bar is welcome. Sharp or minimally-rounded corners, hairline borders, subtle inner shadows over gradients.

## Data domains (what the app browses)

The companion browses public game data. The three domains that are **actually modeled and fetched today** are **items**, **tasks (quests)**, and **hideout stations** (see the Key Files above). The core derived model behind the app is the **requirements index** (`RequirementsIndex` / `RequirementsEntry`): for any item, *which quests need it* (`neededByTasks: TaskNeed[]`, with `count`, `foundInRaid`, `minPlayerLevel`), *which hideout stations/levels need it* (`neededByHideout: HideoutNeed[]`, with `level` + `count`), and *what it sells for* (`sellFor: SellVenue[]`, best trader vs. flea via `source` + `priceRUB`). The keep/sell feature (later) is driven by this index. **Ammo ballistics** and **traders** (beyond a trader's name) are additional domains you should design for, but they are **not modeled in the code yet** — see the per-screen notes.

## Screens to mock

Design these to map **1:1 onto the real nav routes** in `apps/web/components/nav.tsx` (`/`, `/items`, `/ammo`, `/tasks`, `/traders`, `/hideout`), plus two clearly-labeled forward-looking placeholders. Use a nav to switch between them, and make the nav actually switch screens.

1. **Dashboard** → `/` — an at-a-glance landing screen: a few stat tiles (e.g. items tracked, active quests, hideout progress, "items you can sell" teaser), a compact "recently needed items" or "next quests" list, and a global search affordance. Assembled from items/tasks/hideout counts + `sellFor`; no dedicated data model, and none is needed. Set the tone here.
2. **Items** → `/items`, **with Item Detail as a drill-in sub-view of the same route** (e.g. `/items/[id]` or a side panel — *not* a separate nav tab):
   - **Items list** — a dense, sortable/filterable table of items: icon (`iconLink`), `name` (+ `shortName`), `types`, grid size (`width`×`height`), `basePrice`, best sell price (trader vs flea from `sellFor` → `source` + `priceRUB`, ₽ monospace). Include a search box and a couple of filter chips (by type). Rows are clickable and open the detail sub-view.
   - **Item Detail (sub-view)** — the panel/page for a single item: large grid image (`gridImageLink`), key stats, a **"needed by" breakdown** driven by the requirements index (quests from `neededByTasks` with `count` + `foundInRaid` flag + `minPlayerLevel`; hideout stations/levels from `neededByHideout` with `stationName` + `level` + `count`), and sell venues (`sellFor`, trader vs flea) with the best highlighted.
3. **Ammo** → `/ammo` — the dense hero table of the tactical aesthetic: rows of ammo by caliber, columns for **damage, penetration power, armor damage, fragmentation** — sortable, with penetration-tier color coding. This screen should show off the monospace-stats-in-columns identity. **Data note:** these ballistic columns are **not in the data model yet** — `Item` has no caliber/damage/penetration fields and there is no ammo query. Design the table and its penetration-tier coloring faithfully to tarkov.dev's `ammo` shape (`caliber`, `damage`, `penetrationPower`, `armorDamage`, `fragmentationChance`), but treat them as a **future data addition** (mock the values), and flag it in the handoff notes.
4. **Tasks** → `/tasks` — quests grouped/filterable by trader (`traderName`), showing `name`, trader, `minPlayerLevel`, and number of item objectives (`itemObjectives`); a prerequisite/lock hint (`prerequisiteTaskIds`). Clicking a quest reveals its item objectives (item, `count`, `foundInRaid` → "FIR required?").
5. **Traders** → `/traders` — a first-class screen for browsing traders: a trader roster / selector, and per-trader detail with loyalty levels, reputation, reset timer, barters, and buy/sell rates. **Data note:** there is **no `Trader` type and no traders query today** — the only real trader data is `Task.traderName` (a string) and `SellVenue.source` (a vendor name string). Every field beyond a trader's name (levels/loyalty, reputation, barters, currency, reset timers, buy/sell rates) is **future data** from tarkov.dev — design it faithfully with mock values, and flag it in the handoff notes.
6. **Hideout** → `/hideout` — a first-class screen for the hideout, backed by real data (`HideoutStation` / `HideoutLevel` / `HideoutItemRequirement`): list the stations (`name`), each with its `levels`, and per level the `itemRequirements` (item + `count`). Show upgrade requirements as dense rows and make it clear how a station progresses level by level. This is real, modeled data — use the exact field names.
7. **Progression Tracker (PLACEHOLDER — no route yet)** — a *design placeholder* for a future screen where a logged-in user marks completed quests, hideout station levels, player level, and trader levels. Show the intended layout/states (checklists, progress bars, level steppers) so the design language clearly extends to it. (Accounts/progression will be backed by a **server-side account store** (backend decided in the Slice 2 spec) — no need to design auth screens, just show the progression UI shell and an "auth-gated" empty state.) No data model or persistence exists yet.
8. **Scan Result — Keep / Sell (PLACEHOLDER — no route yet)** — a *design placeholder* for the killer feature: after a user uploads a stash screenshot, the app lists recognized items each with a **verdict badge: KEEP / PARTIAL / SELL**, owned quantity vs. keep quantity vs. surplus, the **reason** (which quest/hideout drives the keep — this is what `RequirementsIndex` will compute), a **FIR indicator** (with an "unsure — verify" state), and the best sell venue. Include a **horizon toggle** ("all future needs" / "current" / "next N levels") and a per-item confirm/correct affordance. Use the semantic **green = keep, red = sell, amber = partial/attention** coloring here. **Data note:** no screenshot scanner, vision pipeline, or verdict/quantity/horizon logic exists yet (`packages/llm/src/types.ts` notes vision + tool-calling are deferred); the `RequirementsIndex` is the *intended* engine. Pure design placeholder.

## Semantic colors (define these as tokens)

- **KEEP / safe** → muted green.
- **SELL / surplus** → muted red.
- **PARTIAL / attention / primary action** → the amber accent.
- **FIR (Found-in-Raid) required** → a distinct small badge/icon (backed by the real `foundInRaid` boolean); an "unsure" variant for low confidence.

## Deliverables

1. **The interactive React artifact** covering the screens above — **real screens for 1–6** (Dashboard, Items + Item Detail drill-in, Ammo, Tasks, Traders, Hideout, mapping onto the real routes `/`, `/items`, `/ammo`, `/tasks`, `/traders`, `/hideout`), plus **clearly-labeled placeholders for 7–8** (Progression Tracker, Scan Result — Keep/Sell). Tailwind + lucide-react, mock data (using the real field names from `types.ts`), shadcn-compatible component shapes. Make the nav actually switch screens.
2. **A written design-token summary** I can port into base CSS (Tailwind v4 `@theme` tokens):
   - **Colors** — background layers, surfaces, borders, text (primary/muted), the amber accent, and the semantic keep/sell/partial/FIR colors, as hex values with names.
   - **Type scale** — font families (sans + mono), sizes, weights, and where mono is used.
   - **Spacing / radius / density** — base spacing unit, table row height, border treatment, corner radius.
   - **Handoff / gap flags** — call out that the **Ammo ballistic columns** and all **Traders fields beyond a trader's name** are *not yet in the data model* (`types.ts` has no ammo or `Trader` types), so they require **new tarkov.dev queries** before those screens can go live; note that Progression and Scan are placeholders with no backing data.

Optimize for **legibility at high density on a dark background** and a cohesive tactical identity that will still feel right once the progression and scanner screens are filled in. The design system must accommodate the progression and scanner screens from day one.

=== END PROMPT ===
