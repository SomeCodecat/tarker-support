import { createClient, fetchItems, TARKOV_API_ENDPOINT, type Item } from "@tarker/data";
import { items } from "@/lib/mock";

export async function loadItems(): Promise<Item[]> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const live = await fetchItems(client);
    console.info(`[items] fetched ${live.length} live items from ${endpoint}`);
    return live;
  } catch (err) {
    console.warn("[items] live fetch failed, falling back to mock fixture:", err);
    return items;
  }
}
