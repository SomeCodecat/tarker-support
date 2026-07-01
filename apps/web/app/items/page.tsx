import { ItemsScreen } from "@/components/screens/items/items-screen";
import { loadItems } from "@/lib/data/items";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function ItemsPage() {
  const { data, degraded } = await loadItems();
  return <ItemsScreen degraded={degraded} items={data} />;
}
