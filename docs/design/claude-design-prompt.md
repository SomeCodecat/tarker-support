# Claude.ai Design Prompt — Tarkov Support

> **How to use this (human step, Task 9 of the Slice 1 plan):**
> 1. Open [claude.ai](https://claude.ai) and paste **everything inside the `=== PROMPT ===` fence below** as a new message.
> 2. Iterate on the generated React artifact until the look feels right (ask for tweaks to color, density, typography).
> 3. Bring back **two things**: (a) the final artifact code, (b) the written **design-token summary** (colors, type scale, spacing).
> 4. Hand both to the implementer — they port the tokens into `apps/web/tailwind.config.ts` + `app/globals.css` and rebuild the shared components against **shadcn/ui**.
>
> This prompt was regenerated fresh from the final design spec (`docs/superpowers/specs/2026-07-01-tarkov-support-design.md`, §9) so it reflects *all* locked decisions — including that the app will grow **progression** and **scanner / keep-sell** screens later, so the design system must accommodate them from day one.

---

=== PROMPT ===

You are designing the visual design system and key screens for **Tarkov Support**, a companion web app for players of the game *Escape from Tarkov*.

**Product in one line:** a fast, dense, dark "tactical terminal" companion for Escape from Tarkov — browse the game's items, ammo, quests, traders, and hideout data, and (in later versions) track your progression and scan a screenshot of your stash to be told, per item, what to **keep** vs. **sell**.

Please produce **an interactive React artifact** (a single self-contained component tree using **Tailwind CSS** utility classes and **lucide-react** icons, with realistic **mock data** — no real API calls) that demonstrates the design language across the screens listed below, **plus a written design-token summary** (see "Deliverables" at the end). Build components in a way that maps cleanly onto **shadcn/ui** primitives (Button, Card, Input, Table, Badge, Tabs, Dialog) since the real app is built on shadcn/ui + Tailwind + Radix — favor those component shapes and class conventions.

## Aesthetic brief — "tactical / EFT terminal"

- **Mood:** military-industrial, utilitarian, high information density. It should feel like a field terminal or an inventory management console, not a consumer SaaS dashboard. Think gunmetal, olive drab, khaki, and worn steel.
- **Palette:** dark by default (near-black gunmetal backgrounds, ~`#0f1211`–`#1a1e1b` range), desaturated olive/khaki surfaces and borders, with a single **amber/gold accent** (`~#e8b923` / `#f0c040`) for primary actions, highlights, and active states. Use a muted red for "sell/danger" and a muted green for "keep/safe" as semantic colors (see below).
- **Typography:** a clean sans for body/UI, and a **monospace** face for all numeric stats, prices, calibers, and IDs (damage, penetration, ₽ prices, quantities, level numbers). Monospace numbers are a core part of the identity — stats should line up in columns.
- **Money:** format all prices as **roubles with the ₽ symbol** and thousands separators (e.g. `₽42,500`), monospace. Show trader vs. flea-market prices distinctly.
- **Rarity / type coloring:** items and ammo carry a subtle color coding (e.g. by item type or ammo penetration tier) — a thin left border or a small colored dot/badge, never loud fills. Keep it legible on the dark background.
- **Density:** prefer compact tables and tight rows over airy cards. This is a power-user tool; users scan long lists. Provide comfortable hit targets but keep vertical rhythm tight.
- **Chrome:** a persistent top (or left) nav with the domain sections; a thin status/utility bar is welcome. Sharp or minimally-rounded corners, hairline borders, subtle inner shadows over gradients.

## Data domains (what the app browses)

The companion browses public game data: **items, ammo, tasks (quests), traders, hideout stations, barters, crafts, maps, bosses**. The core derived model behind it is a **"requirements index"**: for any item, *which quests need it* (with counts and a Found-In-Raid flag), *which hideout stations/levels need it* (with counts), and *what it sells for* (best trader vs. flea). The keep/sell feature (later) is driven by this index.

## Screens to mock

Design these as tabs/routes within one artifact (use a nav to switch between them):

1. **Dashboard** — an at-a-glance landing screen: a few stat tiles (e.g. items tracked, active quests, hideout progress, "items you can sell" teaser), a compact "recently needed items" or "next quests" list, and a global search affordance. Set the tone here.
2. **Item Database** — a dense, sortable/filterable table of items: icon, name (+ short name), types, grid size (W×H), base price, best sell price (trader vs flea, ₽ monospace). Include a search box and a couple of filter chips (by type). Rows are clickable.
3. **Item Detail** — the panel/page for a single item: large grid image, key stats, a **"needed by" breakdown** (quests that need it with counts + FIR flag; hideout stations/levels with counts), and sell venues (trader vs flea) with the best highlighted.
4. **Ammo Comparison Table** — the dense hero table of the tactical aesthetic: rows of ammo by caliber, columns for **damage, penetration power, armor damage, fragmentation** — sortable, with penetration-tier color coding. This screen should show off the monospace-stats-in-columns identity.
5. **Quest (Task) Browser** — quests grouped/filterable by trader, showing name, trader, minimum player level, and number of item objectives; a prerequisite/lock hint. Clicking a quest reveals its item objectives (item, count, FIR required?).
6. **Progression Tracker (PLACEHOLDER)** — a *design placeholder* for a future screen where a logged-in user marks completed quests, hideout station levels, player level, and trader levels. Show the intended layout/states (checklists, progress bars, level steppers) so the design language clearly extends to it. (Accounts/progression will be backed by PocketBase in a later slice — no need to design auth screens, just show the progression UI shell and an "auth-gated" empty state.)
7. **Scan Result — Keep / Sell (PLACEHOLDER)** — a *design placeholder* for the killer feature: after a user uploads a stash screenshot, the app lists recognized items each with a **verdict badge: KEEP / PARTIAL / SELL**, owned quantity vs. keep quantity vs. surplus, the **reason** (which quest/hideout drives the keep), a **FIR indicator** (with an "unsure — verify" state), and the best sell venue. Include a **horizon toggle** ("all future needs" / "current" / "next N levels") and a per-item confirm/correct affordance. Use the semantic **green = keep, red = sell, amber = partial/attention** coloring here.

## Semantic colors (define these as tokens)

- **KEEP / safe** → muted green.
- **SELL / surplus** → muted red.
- **PARTIAL / attention / primary action** → the amber accent.
- **FIR (Found-in-Raid) required** → a distinct small badge/icon; an "unsure" variant for low confidence.

## Deliverables

1. **The interactive React artifact** covering the screens above (real screens for 1–5, clearly-labeled placeholders for 6–7), Tailwind + lucide-react, mock data, shadcn-compatible component shapes. Make the nav actually switch screens.
2. **A written design-token summary** I can port into a Tailwind config and base CSS:
   - **Colors** — background layers, surfaces, borders, text (primary/muted), the amber accent, and the semantic keep/sell/partial/FIR colors, as hex values with names.
   - **Type scale** — font families (sans + mono), sizes, weights, and where mono is used.
   - **Spacing / radius / density** — base spacing unit, table row height, border treatment, corner radius.

Optimize for **legibility at high density on a dark background** and a cohesive tactical identity that will still feel right once the progression and scanner screens are filled in.

=== END PROMPT ===
