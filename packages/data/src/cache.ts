import type { RequirementsIndex } from "./types";
import { createClient } from "./client";
import { fetchItems } from "./queries/items";
import { fetchTasks } from "./queries/tasks";
import { fetchHideout } from "./queries/hideout";
import { buildRequirementsIndex } from "./requirementsIndex";

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
