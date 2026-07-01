# Tarkov Support — Slice 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Tarkov Support monorepo from zero and ship a usable companion web app: a typed tarkov.dev data layer, a reusable requirements-index, reusable LLM tool definitions, a design system, and browsable data pages.

**Architecture:** pnpm + Turborepo monorepo. Pure/testable logic (`packages/data`, `packages/tools`) is separated from the Next.js app (`apps/web`). The tarkov.dev GraphQL queries and tool definitions are lifted and expanded from the base repo `/home/max/dev/tarkov-mcp`. Data is validated with zod and cached with revalidation.

**Tech Stack:** TypeScript (strict), pnpm, Turborepo, Vitest, graphql-request, zod, Next.js (App Router), Tailwind CSS, shadcn/ui + lucide-react.

**Executed in:** `/home/max/dev/tarker-support` (new, empty).
**Reference/base repo (read-only, lift code from):** `/home/max/dev/tarkov-mcp`.
**Companion spec:** `/home/max/dev/tarkov-mcp/docs/superpowers/specs/2026-07-01-tarkov-support-design.md` — read it first.

---

## Prerequisites

- Node.js ≥ 20 LTS, `pnpm` ≥ 9 installed (`corepack enable`).
- Read access to the base repo at `/home/max/dev/tarkov-mcp`.
- Commands run from the new repo root `/home/max/dev/tarker-support` unless stated.
- Use the **latest stable** versions of each library; let the lockfile pin them.

## File structure (created by this slice)

```
tarker-support/
  package.json                      # workspace root, scripts
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
  .eslintrc.cjs / eslint.config.mjs
  .prettierrc.json
  .gitignore
  vitest.workspace.ts
  docs/                             # copied spec + this plan
  packages/
    data/
      package.json
      tsconfig.json
      src/
        client.ts                   # graphql-request wrapper
        types.ts                    # shared domain + index types
        queries/items.ts            # items query + zod + parse
        queries/tasks.ts            # tasks query + zod + parse
        queries/hideout.ts          # hideout query + zod + parse
        requirementsIndex.ts        # PURE buildRequirementsIndex()
        cache.ts                    # getRequirementsIndex() with revalidation
        index.ts                    # package barrel
      test/
        requirementsIndex.test.ts
        queries.test.ts
        cache.test.ts
    tools/
      package.json
      tsconfig.json
      src/
        types.ts                    # Tool interface
        registry.ts                 # tool definitions (getItems, getTasks, ...)
        index.ts
      test/registry.test.ts
    llm/                            # provider-adapter skeleton (used in Slice 2/3)
      package.json
      tsconfig.json
      src/
        types.ts                    # LlmProvider interface
        index.ts                    # factory from env
  apps/
    web/
      package.json
      next.config.ts
      tailwind.config.ts
      postcss.config.mjs
      tsconfig.json
      app/
        layout.tsx
        globals.css
        page.tsx                    # dashboard
        (browse)/
          items/page.tsx
          items/[id]/page.tsx
          ammo/page.tsx
          tasks/page.tsx
          traders/page.tsx
          hideout/page.tsx
      components/
        nav.tsx
        DomainTable.tsx             # generic data table (DRY across domains)
        ui/                         # shadcn components
      lib/domains.ts                # per-domain config consumed by DomainTable
  .github/workflows/ci.yml
```

---

## Task 0: Monorepo scaffold

**Files:** Create `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.prettierrc.json`, `eslint.config.mjs`, `.gitignore`, `vitest.workspace.ts`.

- [ ] **Step 1: Init repo and workspace root**

Run:
```bash
cd /home/max/dev/tarker-support
git init
corepack enable
pnpm init
```

- [ ] **Step 2: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 3: Write root `package.json`** (replace generated file)

```json
{
  "name": "tarker-support",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "vitest run"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "latest",
    "vitest": "latest",
    "prettier": "latest",
    "eslint": "latest",
    "@types/node": "latest"
  }
}
```
Then `pnpm install`.

- [ ] **Step 4: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

- [ ] **Step 5: Write `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

- [ ] **Step 6: Write `vitest.workspace.ts`**

```ts
export default ["packages/*"];
```

- [ ] **Step 7: Write `.gitignore`, `.prettierrc.json`, `eslint.config.mjs`**

`.gitignore`:
```
node_modules
dist
.next
.turbo
.env*
coverage
```
`.prettierrc.json`:
```json
{ "singleQuote": false, "semi": true, "trailingComma": "all" }
```
`eslint.config.mjs`: minimal flat config exporting `[]` for now (tighten later):
```js
export default [];
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: scaffold pnpm+turbo monorepo"
```

---

## Task 1: `packages/data` — client + shared types

**Files:** Create `packages/data/package.json`, `packages/data/tsconfig.json`, `packages/data/src/client.ts`, `packages/data/src/types.ts`, `packages/data/src/index.ts`.

- [ ] **Step 1: Write `packages/data/package.json`**

```json
{
  "name": "@tarker/data",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "test": "vitest run"
  },
  "dependencies": { "graphql-request": "latest", "zod": "latest" },
  "devDependencies": { "vitest": "latest", "typescript": "latest" }
}
```
`packages/data/tsconfig.json`:
```json
{ "extends": "../../tsconfig.base.json", "include": ["src", "test"] }
```
Then from repo root: `pnpm install`.

- [ ] **Step 2: Write `packages/data/src/client.ts`**

```ts
import { GraphQLClient } from "graphql-request";

export const TARKOV_API_ENDPOINT = "https://api.tarkov.dev/graphql";

export function createClient(endpoint: string = TARKOV_API_ENDPOINT): GraphQLClient {
  return new GraphQLClient(endpoint);
}
```

- [ ] **Step 3: Write `packages/data/src/types.ts`**

```ts
export interface SellVenue { source: string; priceRUB: number; }

export interface Item {
  id: string;
  name: string;
  shortName: string;
  width: number;
  height: number;
  iconLink: string | null;
  gridImageLink: string | null;
  basePrice: number;
  types: string[];
  sellFor: SellVenue[];
}

export interface TaskObjectiveItem { itemId: string; count: number; foundInRaid: boolean; }
export interface Task {
  id: string;
  name: string;
  minPlayerLevel: number;
  traderName: string | null;
  prerequisiteTaskIds: string[];
  itemObjectives: TaskObjectiveItem[];
}

export interface HideoutItemRequirement { itemId: string; count: number; }
export interface HideoutLevel { level: number; itemRequirements: HideoutItemRequirement[]; }
export interface HideoutStation { id: string; name: string; levels: HideoutLevel[]; }

export interface TaskNeed { taskId: string; taskName: string; count: number; foundInRaid: boolean; minPlayerLevel: number; }
export interface HideoutNeed { stationId: string; stationName: string; level: number; count: number; }
export interface RequirementsEntry {
  itemId: string;
  neededByTasks: TaskNeed[];
  neededByHideout: HideoutNeed[];
  sellFor: SellVenue[];
}
export type RequirementsIndex = Record<string, RequirementsEntry>;
```

- [ ] **Step 4: Write `packages/data/src/index.ts`** (barrel, expand as tasks add exports)

```ts
export * from "./types.js";
export * from "./client.js";
export * from "./requirementsIndex.js";
export * from "./cache.js";
export * from "./queries/items.js";
export * from "./queries/tasks.js";
export * from "./queries/hideout.js";
```
(These files are created in later tasks; typecheck will fail until then — that is expected and resolved by Task 6.)

- [ ] **Step 5: Commit**

```bash
git add packages/data && git commit -m "feat(data): client + domain types"
```

---

## Task 2: `packages/data` — items query

**Files:** Create `packages/data/src/queries/items.ts`, `packages/data/test/queries.test.ts`.

- [ ] **Step 1: Write the failing test** (`packages/data/test/queries.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { parseItems } from "../src/queries/items.js";

describe("parseItems", () => {
  it("maps raw tarkov.dev items into typed Items with sellFor", () => {
    const raw = {
      items: [
        {
          id: "5c0e", name: "LEDX", shortName: "LEDX",
          width: 1, height: 2, iconLink: "http://i/led.png", gridImageLink: "http://g/led.png",
          basePrice: 100000, types: ["barter"],
          sellFor: [{ priceRUB: 900000, vendor: { name: "Flea Market" } }],
        },
      ],
    };
    const items = parseItems(raw);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "5c0e", shortName: "LEDX", width: 1, height: 2 });
    expect(items[0].sellFor[0]).toEqual({ source: "Flea Market", priceRUB: 900000 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @tarker/data test`
Expected: FAIL — `parseItems` not found.

- [ ] **Step 3: Write `packages/data/src/queries/items.ts`**

```ts
import { gql } from "graphql-request";
import { z } from "zod";
import type { Item } from "../types.js";

export const ITEMS_QUERY = gql`
  {
    items {
      id name shortName width height iconLink gridImageLink basePrice types
      sellFor { priceRUB vendor { name } }
    }
  }
`;

const RawItem = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  width: z.number(),
  height: z.number(),
  iconLink: z.string().nullable(),
  gridImageLink: z.string().nullable(),
  basePrice: z.number(),
  types: z.array(z.string()),
  sellFor: z.array(z.object({ priceRUB: z.number(), vendor: z.object({ name: z.string() }) })),
});
const RawItems = z.object({ items: z.array(RawItem) });

export function parseItems(raw: unknown): Item[] {
  const { items } = RawItems.parse(raw);
  return items.map((i) => ({
    id: i.id, name: i.name, shortName: i.shortName,
    width: i.width, height: i.height, iconLink: i.iconLink, gridImageLink: i.gridImageLink,
    basePrice: i.basePrice, types: i.types,
    sellFor: i.sellFor.map((s) => ({ source: s.vendor.name, priceRUB: s.priceRUB })),
  }));
}

export async function fetchItems(client: import("graphql-request").GraphQLClient): Promise<Item[]> {
  return parseItems(await client.request(ITEMS_QUERY));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @tarker/data test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/data && git commit -m "feat(data): items query + parser"
```

---

## Task 3: `packages/data` — tasks query

**Files:** Create `packages/data/src/queries/tasks.ts`; extend `packages/data/test/queries.test.ts`.

- [ ] **Step 1: Add failing test** (append to `queries.test.ts`)

```ts
import { parseTasks } from "../src/queries/tasks.js";

describe("parseTasks", () => {
  it("flattens item objectives with FIR + count", () => {
    const raw = {
      tasks: [
        {
          id: "t1", name: "Shortage", minPlayerLevel: 5,
          trader: { name: "Therapist" },
          taskRequirements: [{ task: { id: "t0" } }],
          objectives: [
            { __typename: "TaskObjectiveItem", item: { id: "salewa" }, count: 3, foundInRaid: true },
            { __typename: "TaskObjectiveBasic" },
          ],
        },
      ],
    };
    const tasks = parseTasks(raw);
    expect(tasks[0]).toMatchObject({ id: "t1", minPlayerLevel: 5, traderName: "Therapist", prerequisiteTaskIds: ["t0"] });
    expect(tasks[0].itemObjectives).toEqual([{ itemId: "salewa", count: 3, foundInRaid: true }]);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL** (`parseTasks` not found). Run: `pnpm --filter @tarker/data test`.

- [ ] **Step 3: Write `packages/data/src/queries/tasks.ts`**

```ts
import { gql } from "graphql-request";
import { z } from "zod";
import type { Task } from "../types.js";

export const TASKS_QUERY = gql`
  {
    tasks {
      id name minPlayerLevel
      trader { name }
      taskRequirements { task { id } }
      objectives {
        __typename
        ... on TaskObjectiveItem { item { id } count foundInRaid }
      }
    }
  }
`;

const RawTask = z.object({
  id: z.string(),
  name: z.string(),
  minPlayerLevel: z.number(),
  trader: z.object({ name: z.string() }).nullable(),
  taskRequirements: z.array(z.object({ task: z.object({ id: z.string() }).nullable() })),
  objectives: z.array(
    z.object({
      __typename: z.string(),
      item: z.object({ id: z.string() }).optional(),
      count: z.number().optional(),
      foundInRaid: z.boolean().optional(),
    }),
  ),
});
const RawTasks = z.object({ tasks: z.array(RawTask) });

export function parseTasks(raw: unknown): Task[] {
  const { tasks } = RawTasks.parse(raw);
  return tasks.map((t) => ({
    id: t.id,
    name: t.name,
    minPlayerLevel: t.minPlayerLevel,
    traderName: t.trader?.name ?? null,
    prerequisiteTaskIds: t.taskRequirements.map((r) => r.task?.id).filter((x): x is string => !!x),
    itemObjectives: t.objectives
      .filter((o) => o.__typename === "TaskObjectiveItem" && o.item && typeof o.count === "number")
      .map((o) => ({ itemId: o.item!.id, count: o.count!, foundInRaid: o.foundInRaid ?? false })),
  }));
}

export async function fetchTasks(client: import("graphql-request").GraphQLClient): Promise<Task[]> {
  return parseTasks(await client.request(TASKS_QUERY));
}
```

- [ ] **Step 4: Run test — expect PASS.** Run: `pnpm --filter @tarker/data test`.

- [ ] **Step 5: Commit** `git add packages/data && git commit -m "feat(data): tasks query + parser"`

---

## Task 4: `packages/data` — hideout query

**Files:** Create `packages/data/src/queries/hideout.ts`; extend `queries.test.ts`.

- [ ] **Step 1: Add failing test**

```ts
import { parseHideout } from "../src/queries/hideout.js";

describe("parseHideout", () => {
  it("flattens station levels + item requirements", () => {
    const raw = {
      hideoutStations: [
        { id: "med", name: "Medstation", levels: [
          { level: 1, itemRequirements: [{ item: { id: "bandage" }, count: 5 }] },
        ] },
      ],
    };
    const stations = parseHideout(raw);
    expect(stations[0]).toMatchObject({ id: "med", name: "Medstation" });
    expect(stations[0].levels[0]).toEqual({ level: 1, itemRequirements: [{ itemId: "bandage", count: 5 }] });
  });
});
```

- [ ] **Step 2: Run test — expect FAIL.**

- [ ] **Step 3: Write `packages/data/src/queries/hideout.ts`**

```ts
import { gql } from "graphql-request";
import { z } from "zod";
import type { HideoutStation } from "../types.js";

export const HIDEOUT_QUERY = gql`
  {
    hideoutStations {
      id name
      levels { level itemRequirements { item { id } count } }
    }
  }
`;

const RawHideout = z.object({
  hideoutStations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      levels: z.array(
        z.object({
          level: z.number(),
          itemRequirements: z.array(z.object({ item: z.object({ id: z.string() }).nullable(), count: z.number() })),
        }),
      ),
    }),
  ),
});

export function parseHideout(raw: unknown): HideoutStation[] {
  const { hideoutStations } = RawHideout.parse(raw);
  return hideoutStations.map((s) => ({
    id: s.id, name: s.name,
    levels: s.levels.map((l) => ({
      level: l.level,
      itemRequirements: l.itemRequirements
        .filter((r) => r.item)
        .map((r) => ({ itemId: r.item!.id, count: r.count })),
    })),
  }));
}

export async function fetchHideout(client: import("graphql-request").GraphQLClient): Promise<HideoutStation[]> {
  return parseHideout(await client.request(HIDEOUT_QUERY));
}
```

- [ ] **Step 4: Run test — expect PASS.**

- [ ] **Step 5: Commit** `git add packages/data && git commit -m "feat(data): hideout query + parser"`

---

## Task 5: `packages/data` — `buildRequirementsIndex` (the core, TDD)

**Files:** Create `packages/data/src/requirementsIndex.ts`, `packages/data/test/requirementsIndex.test.ts`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { buildRequirementsIndex } from "../src/requirementsIndex.js";
import type { Item, Task, HideoutStation } from "../src/types.js";

const items: Item[] = [
  { id: "salewa", name: "Salewa", shortName: "Salewa", width: 1, height: 1, iconLink: null, gridImageLink: null, basePrice: 12000, types: ["meds"], sellFor: [{ source: "Therapist", priceRUB: 12000 }] },
  { id: "bandage", name: "Bandage", shortName: "Bandage", width: 1, height: 1, iconLink: null, gridImageLink: null, basePrice: 100, types: ["meds"], sellFor: [] },
];
const tasks: Task[] = [
  { id: "t1", name: "Shortage", minPlayerLevel: 5, traderName: "Therapist", prerequisiteTaskIds: [], itemObjectives: [{ itemId: "salewa", count: 3, foundInRaid: true }] },
];
const hideout: HideoutStation[] = [
  { id: "med", name: "Medstation", levels: [{ level: 1, itemRequirements: [{ itemId: "bandage", count: 5 }] }] },
];

describe("buildRequirementsIndex", () => {
  it("indexes task needs with FIR + level", () => {
    const idx = buildRequirementsIndex(items, tasks, hideout);
    expect(idx["salewa"].neededByTasks).toEqual([
      { taskId: "t1", taskName: "Shortage", count: 3, foundInRaid: true, minPlayerLevel: 5 },
    ]);
    expect(idx["salewa"].sellFor[0]).toEqual({ source: "Therapist", priceRUB: 12000 });
  });

  it("indexes hideout needs", () => {
    const idx = buildRequirementsIndex(items, tasks, hideout);
    expect(idx["bandage"].neededByHideout).toEqual([
      { stationId: "med", stationName: "Medstation", level: 1, count: 5 },
    ]);
  });

  it("creates entries even for items with no needs", () => {
    const idx = buildRequirementsIndex(items, [], []);
    expect(idx["salewa"]).toEqual({ itemId: "salewa", neededByTasks: [], neededByHideout: [], sellFor: [{ source: "Therapist", priceRUB: 12000 }] });
  });
});
```

- [ ] **Step 2: Run test — expect FAIL** (`buildRequirementsIndex` not found). Run: `pnpm --filter @tarker/data test`.

- [ ] **Step 3: Write `packages/data/src/requirementsIndex.ts`**

```ts
import type { Item, Task, HideoutStation, RequirementsIndex, RequirementsEntry } from "./types.js";

export function buildRequirementsIndex(items: Item[], tasks: Task[], hideout: HideoutStation[]): RequirementsIndex {
  const index: RequirementsIndex = {};
  const ensure = (itemId: string): RequirementsEntry =>
    (index[itemId] ??= { itemId, neededByTasks: [], neededByHideout: [], sellFor: [] });

  for (const item of items) ensure(item.id).sellFor = item.sellFor;

  for (const task of tasks) {
    for (const obj of task.itemObjectives) {
      ensure(obj.itemId).neededByTasks.push({
        taskId: task.id, taskName: task.name, count: obj.count,
        foundInRaid: obj.foundInRaid, minPlayerLevel: task.minPlayerLevel,
      });
    }
  }

  for (const station of hideout) {
    for (const lvl of station.levels) {
      for (const req of lvl.itemRequirements) {
        ensure(req.itemId).neededByHideout.push({
          stationId: station.id, stationName: station.name, level: lvl.level, count: req.count,
        });
      }
    }
  }

  return index;
}
```

- [ ] **Step 4: Run test — expect PASS.** Run: `pnpm --filter @tarker/data test`.

- [ ] **Step 5: Commit** `git add packages/data && git commit -m "feat(data): buildRequirementsIndex (pure, tested)"`

---

## Task 6: `packages/data` — cached `getRequirementsIndex`

**Files:** Create `packages/data/src/cache.ts`, `packages/data/test/cache.test.ts`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { makeRequirementsIndexLoader } from "../src/cache.js";

describe("makeRequirementsIndexLoader", () => {
  it("fetches once and caches within TTL", async () => {
    const fetcher = vi.fn().mockResolvedValue({ salewa: { itemId: "salewa", neededByTasks: [], neededByHideout: [], sellFor: [] } });
    let now = 0;
    const load = makeRequirementsIndexLoader({ fetcher, ttlMs: 1000, clock: () => now });
    await load();
    now = 500;
    await load();
    expect(fetcher).toHaveBeenCalledTimes(1);
    now = 2000;
    await load();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL.**

- [ ] **Step 3: Write `packages/data/src/cache.ts`**

```ts
import type { RequirementsIndex } from "./types.js";
import { createClient } from "./client.js";
import { fetchItems } from "./queries/items.js";
import { fetchTasks } from "./queries/tasks.js";
import { fetchHideout } from "./queries/hideout.js";
import { buildRequirementsIndex } from "./requirementsIndex.js";

export interface LoaderOptions {
  fetcher: () => Promise<RequirementsIndex>;
  ttlMs?: number;
  clock?: () => number;
}

export function makeRequirementsIndexLoader(opts: LoaderOptions): () => Promise<RequirementsIndex> {
  const ttlMs = opts.ttlMs ?? 24 * 60 * 60 * 1000;
  const clock = opts.clock ?? Date.now;
  let cached: RequirementsIndex | null = null;
  let fetchedAt = -Infinity;
  return async () => {
    if (cached && clock() - fetchedAt < ttlMs) return cached;
    cached = await opts.fetcher();
    fetchedAt = clock();
    return cached;
  };
}

export async function fetchRequirementsIndexFromApi(endpoint?: string): Promise<RequirementsIndex> {
  const client = createClient(endpoint);
  const [items, tasks, hideout] = await Promise.all([fetchItems(client), fetchTasks(client), fetchHideout(client)]);
  return buildRequirementsIndex(items, tasks, hideout);
}

export const getRequirementsIndex = makeRequirementsIndexLoader({ fetcher: () => fetchRequirementsIndexFromApi() });
```

- [ ] **Step 4: Run tests — expect PASS**, and typecheck the package.

Run: `pnpm --filter @tarker/data test && pnpm --filter @tarker/data typecheck`
Expected: PASS (barrel from Task 1 now resolves).

- [ ] **Step 5: Commit** `git add packages/data && git commit -m "feat(data): cached requirements-index loader"`

---

## Task 7: `packages/tools` — LLM function-calling tools

**Files:** Create `packages/tools/package.json`, `tsconfig.json`, `src/types.ts`, `src/registry.ts`, `src/index.ts`, `test/registry.test.ts`. Lift naming/intent from base repo `src/tools/items/*/index.ts`.

- [ ] **Step 1: Write `packages/tools/package.json`**

```json
{
  "name": "@tarker/tools",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": { "typecheck": "tsc --noEmit", "lint": "eslint src", "test": "vitest run" },
  "dependencies": { "@tarker/data": "workspace:*", "zod": "latest" },
  "devDependencies": { "vitest": "latest", "typescript": "latest" }
}
```
`packages/tools/tsconfig.json`: `{ "extends": "../../tsconfig.base.json", "include": ["src", "test"] }`. Then `pnpm install` at root.

- [ ] **Step 2: Write the failing test** (`packages/tools/test/registry.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { makeTools } from "../src/registry.js";

describe("makeTools", () => {
  it("exposes a getItems tool that returns injected data", async () => {
    const tools = makeTools({
      fetchItems: async () => [{ id: "led", name: "LEDX", shortName: "LEDX", width: 1, height: 2, iconLink: null, gridImageLink: null, basePrice: 1, types: [], sellFor: [] }],
      fetchTasks: async () => [],
    });
    const getItems = tools.find((t) => t.name === "getItems")!;
    const result = await getItems.handler({});
    expect(result).toEqual([{ id: "led", name: "LEDX", shortName: "LEDX", width: 1, height: 2, iconLink: null, gridImageLink: null, basePrice: 1, types: [], sellFor: [] }]);
  });
});
```

- [ ] **Step 3: Run test — expect FAIL.** Run: `pnpm --filter @tarker/tools test`.

- [ ] **Step 4: Write `packages/tools/src/types.ts`**

```ts
import type { z } from "zod";

export interface Tool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  parameters: z.ZodType<TInput>;
  handler: (input: TInput) => Promise<TOutput>;
}
```

- [ ] **Step 5: Write `packages/tools/src/registry.ts`**

```ts
import { z } from "zod";
import type { Item, Task } from "@tarker/data";
import type { Tool } from "./types.js";

export interface ToolDeps {
  fetchItems: () => Promise<Item[]>;
  fetchTasks: () => Promise<Task[]>;
}

export function makeTools(deps: ToolDeps): Tool[] {
  return [
    {
      name: "getItems",
      description: "Return all Escape from Tarkov items with prices and grid sizes.",
      parameters: z.object({}),
      handler: async () => deps.fetchItems(),
    },
    {
      name: "getTasks",
      description: "Return all Escape from Tarkov quests/tasks with item objectives.",
      parameters: z.object({}),
      handler: async () => deps.fetchTasks(),
    },
  ];
}
```

- [ ] **Step 6: Write `packages/tools/src/index.ts`**

```ts
export * from "./types.js";
export * from "./registry.js";
```

- [ ] **Step 7: Run test + typecheck — expect PASS.** Run: `pnpm --filter @tarker/tools test && pnpm --filter @tarker/tools typecheck`.

- [ ] **Step 8: Commit** `git add packages/tools && git commit -m "feat(tools): function-calling tool registry"`

---

## Task 8: `apps/web` — Next.js scaffold + layout + nav

**Files:** create the Next.js app and base chrome.

- [ ] **Step 1: Scaffold Next.js in the workspace**

Run:
```bash
cd /home/max/dev/tarker-support
pnpm create next-app@latest apps/web --ts --app --tailwind --eslint --no-src-dir --import-alias "@/*" --use-pnpm
```
Accept defaults for anything not covered.

- [ ] **Step 1b: Configure `apps/web/next.config.ts` to transpile the workspace TS packages** (they ship raw `.ts`, so Next must transpile them):

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { transpilePackages: ["@tarker/data", "@tarker/tools"] };
export default nextConfig;
```

- [ ] **Step 2: Add workspace deps to `apps/web/package.json`**

Add under `dependencies`:
```json
"@tarker/data": "workspace:*",
"@tarker/tools": "workspace:*",
"lucide-react": "latest"
```
Then `pnpm install` at root.

- [ ] **Step 3: Add `typecheck` and `lint` scripts** to `apps/web/package.json` so Turbo picks them up:
```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 4: Write `apps/web/components/nav.tsx`**

```tsx
import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/items", label: "Items" },
  { href: "/ammo", label: "Ammo" },
  { href: "/tasks", label: "Tasks" },
  { href: "/traders", label: "Traders" },
  { href: "/hideout", label: "Hideout" },
];

export function Nav() {
  return (
    <nav className="flex gap-4 border-b border-neutral-800 bg-neutral-950 px-4 py-3 text-sm">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-neutral-300 hover:text-amber-400">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: Edit `apps/web/app/layout.tsx`** to render `<Nav/>` and a dark shell (wrap `{children}` with the nav and a `<main className="p-4">`).

- [ ] **Step 6: Verify dev server boots**

Run: `pnpm --filter web dev` then open http://localhost:3000
Expected: page renders with the nav bar. Stop the server.

- [ ] **Step 7: Commit** `git add apps/web && git commit -m "feat(web): next.js scaffold + nav shell"`

---

## Task 9: DESIGN SYSTEM checkpoint — regenerate the Claude design prompt (human-in-loop)

> This is the point the spec (§9) reserves for the visual design. **Do not skip and do not invent a design ad hoc.**

- [ ] **Step 1: Regenerate the design prompt from the final spec.** Produce a fresh claude.ai prompt that includes: the product one-liner (spec §1), the full data-domain list (spec §4), the tactical/EFT aesthetic brief (dark gunmetal/olive/khaki, amber accents, monospace stats, ₽ formatting, rarity coloring, high density), and screens to mock: **dashboard, item database + detail, ammo comparison table, quest browser, plus placeholders for the progression tracker and the scan-result keep/sell view** so the design language covers Slices 2–3. Ask for an interactive React artifact + a written design-token summary (colors, type scale, spacing).

- [ ] **Step 2: HUMAN STEP — run the prompt in claude.ai**, iterate on the mockup, and bring back: (a) the artifact code, (b) the design-token summary.

- [ ] **Step 3: Port tokens into `apps/web/tailwind.config.ts`** (colors, fonts, spacing) and `app/globals.css` (base background/foreground, monospace utility for stats).

- [ ] **Step 4: Install shadcn/ui and add base components used by the mockup**

Run: `pnpm --filter web dlx shadcn@latest init` then add the primitives the mockup uses (e.g. `button card input table badge`).

- [ ] **Step 5: Build the shared `DomainTable` + dashboard** to match the mockup's look (implemented concretely in Task 10). Verify visually against the artifact.

- [ ] **Step 6: Commit** `git add apps/web && git commit -m "feat(web): design system + tokens from mockup"`

---

## Task 10: `apps/web` — items list + detail (the reusable pattern)

**Files:** Create `apps/web/lib/domains.ts`, `apps/web/components/DomainTable.tsx`, `apps/web/app/(browse)/items/page.tsx`, `apps/web/app/(browse)/items/[id]/page.tsx`.

- [ ] **Step 1: Write `apps/web/lib/domains.ts`** — a data-loading helper using the data package.

```ts
import { createClient, fetchItems } from "@tarker/data";

export async function loadItems() {
  return fetchItems(createClient());
}
```

- [ ] **Step 2: Write `apps/web/components/DomainTable.tsx`** — generic, reusable across domains.

```tsx
export interface Column<T> { header: string; cell: (row: T) => React.ReactNode; }

export function DomainTable<T>({ rows, columns }: { rows: T[]; columns: Column<T>[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-neutral-800 text-left text-neutral-400">
          {columns.map((c) => <th key={c.header} className="px-2 py-2 font-mono uppercase tracking-wide">{c.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-neutral-900 hover:bg-neutral-900/50">
            {columns.map((c) => <td key={c.header} className="px-2 py-2">{c.cell(row)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Write `apps/web/app/(browse)/items/page.tsx`** (server component)

```tsx
import Link from "next/link";
import { loadItems } from "@/lib/domains";
import { DomainTable, type Column } from "@/components/DomainTable";
import type { Item } from "@tarker/data";

export const revalidate = 86400;

export default async function ItemsPage() {
  const items = await loadItems();
  const columns: Column<Item>[] = [
    { header: "Name", cell: (i) => <Link href={`/items/${i.id}`} className="text-amber-400 hover:underline">{i.name}</Link> },
    { header: "Short", cell: (i) => <span className="font-mono">{i.shortName}</span> },
    { header: "Size", cell: (i) => <span className="font-mono">{i.width}×{i.height}</span> },
    { header: "Base ₽", cell: (i) => <span className="font-mono">{i.basePrice.toLocaleString()}</span> },
  ];
  return <div><h1 className="mb-4 text-xl">Items</h1><DomainTable rows={items} columns={columns} /></div>;
}
```

- [ ] **Step 4: Write `apps/web/app/(browse)/items/[id]/page.tsx`**

```tsx
import { loadItems } from "@/lib/domains";

export default async function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = (await loadItems()).find((i) => i.id === id);
  if (!item) return <div>Item not found.</div>;
  return (
    <div>
      <h1 className="mb-2 text-xl text-amber-400">{item.name}</h1>
      <p className="font-mono text-sm text-neutral-400">{item.shortName} · {item.width}×{item.height} · base ₽{item.basePrice.toLocaleString()}</p>
      <h2 className="mt-4 mb-1 font-mono uppercase text-neutral-400">Sell for</h2>
      <ul>{item.sellFor.map((s) => <li key={s.source} className="font-mono">{s.source}: ₽{s.priceRUB.toLocaleString()}</li>)}</ul>
    </div>
  );
}
```

- [ ] **Step 5: Verify** `pnpm --filter web dev`, open `/items` and click into an item. Expected: list renders from live tarkov.dev data; detail loads. Then `pnpm --filter web typecheck`.

- [ ] **Step 6: Commit** `git add apps/web && git commit -m "feat(web): items browse + detail via DomainTable"`

---

## Task 11: `apps/web` — remaining companion pages (ammo, tasks, traders, hideout)

Each page reuses `DomainTable` and a loader in `lib/domains.ts`. Build them one at a time; each is: add a loader, add a page, verify, commit.

- [ ] **Step 1: Extend `lib/domains.ts`** with loaders. For `tasks` and `hideout`, use `fetchTasks`/`fetchHideout` from `@tarker/data`. For `ammo` and `traders`, add the corresponding queries to `packages/data` first (mirror Task 2's structure: query + zod + parse + `fetch*` + test + export in barrel), lifting field lists from base repo `src/tools/items/ammo/loader.ts` and `src/tools/items/traders/loader.ts`. Commit the data-package additions separately.

- [ ] **Step 2: `app/(browse)/tasks/page.tsx`** — columns: Name (link to wiki or detail later), Trader (`traderName`), Min level (`minPlayerLevel`), #Item objectives (`itemObjectives.length`). Mirror Task 10 Step 3 with `Column<Task>[]`.

- [ ] **Step 3: `app/(browse)/hideout/page.tsx`** — render each station with its levels and item requirement counts (a nested list; `DomainTable` per station or a simple list).

- [ ] **Step 4: `app/(browse)/ammo/page.tsx`** — a dense sortable table: caliber, damage, penetration power, armor damage. (Client component for sorting, or server-rendered sorted by penetration.)

- [ ] **Step 5: `app/(browse)/traders/page.tsx`** — list traders (name, reset time, currency) from the new traders query.

- [ ] **Step 6: Verify each page** with `pnpm --filter web dev`, then `pnpm --filter web typecheck`.

- [ ] **Step 7: Commit** after each page: `git commit -m "feat(web): <domain> browse page"`.

---

## Task 12: `packages/llm` — provider-adapter skeleton (interface only; used in Slice 2/3)

**Files:** Create `packages/llm/package.json`, `tsconfig.json`, `src/types.ts`, `src/index.ts`. No provider SDK calls yet — just the seam so the assistant/scanner slot in later.

- [ ] **Step 1: Write `packages/llm/package.json`** (mirror Task 7 Step 1 with name `@tarker/llm`, deps: `zod`).

- [ ] **Step 2: Write `packages/llm/src/types.ts`**

```ts
export interface LlmMessage { role: "system" | "user" | "assistant"; content: string; }

export interface LlmProvider {
  readonly name: "openai" | "gemini" | "anthropic";
  generateText(messages: LlmMessage[]): Promise<string>;
  // vision + tool-calling methods are added in Slice 2/3 when first needed (YAGNI).
}
```

- [ ] **Step 3: Write `packages/llm/src/index.ts`**

```ts
export * from "./types.js";

export function selectProviderName(): "openai" | "gemini" | "anthropic" {
  const p = process.env.LLM_PROVIDER;
  if (p === "openai" || p === "gemini" || p === "anthropic") return p;
  return "gemini"; // default per spec: no Claude billing required
}
```

- [ ] **Step 4: Typecheck** `pnpm --filter @tarker/llm typecheck`. Expected: PASS.

- [ ] **Step 5: Commit** `git add packages/llm && git commit -m "feat(llm): provider adapter seam"`

---

## Task 13: CI

**Files:** Create `.github/workflows/ci.yml`.

- [ ] **Step 1: Write the workflow**

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

- [ ] **Step 2: Verify locally** `pnpm typecheck && pnpm test && pnpm build`. Expected: all PASS.

- [ ] **Step 3: Commit** `git add .github && git commit -m "ci: typecheck, test, build"`

---

## Task 14: Docs + handoff

- [ ] **Step 1: Copy the spec + this plan into the new repo** so it's self-contained:

```bash
mkdir -p /home/max/dev/tarker-support/docs/superpowers/{specs,plans}
cp /home/max/dev/tarkov-mcp/docs/superpowers/specs/2026-07-01-tarkov-support-design.md /home/max/dev/tarker-support/docs/superpowers/specs/
cp /home/max/dev/tarkov-mcp/docs/superpowers/plans/2026-07-01-tarkov-support-slice1-foundation.md /home/max/dev/tarker-support/docs/superpowers/plans/
```

- [ ] **Step 2: Write `README.md`** describing the monorepo, how to run (`pnpm dev`), and the slice roadmap (link the spec).

- [ ] **Step 3: Commit** `git add -A && git commit -m "docs: spec, plan, readme"`

---

## Definition of done (Slice 1)

- `pnpm typecheck && pnpm test && pnpm build` all pass.
- `pnpm dev` serves a dark, tactical companion app; every browse page renders live tarkov.dev data.
- `packages/data` exposes a tested `buildRequirementsIndex` + cached loader (the substrate Slice 3's engine consumes).
- `packages/tools` exposes tested tool definitions (the substrate Slice 2's assistant consumes).
- `packages/llm` provides the provider seam (no billing).
- Design system derived from a freshly-regenerated mockup, not invented ad hoc.

## Not in this slice (deferred)

- Auth, database, progression tracker, the AI assistant UI → **Slice 2**.
- Screenshot scanner, recognition, FIR detection, the keep/sell engine, results UI → **Slice 3** (preceded by the recognition spike).
