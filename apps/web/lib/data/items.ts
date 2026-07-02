import { createClient, fetchItems, TARKOV_API_ENDPOINT, type Item } from "@tarker/data";
import type { DataResult } from "./result";
import { items } from "@/lib/mock";

export async function loadItems(): Promise<DataResult<Item[]>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const live = await fetchItems(client);
    console.info(`[items] fetched ${live.length} live items from ${endpoint}`);
    return { data: live, degraded: false };
  } catch (err) {
    console.warn("[items] live fetch failed, falling back to sample data:", err);
    return { data: items, degraded: true };
  }
}
