import { TradersScreen } from "@/components/screens/traders/traders-screen";
import { loadTraders } from "@/lib/data/traders";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function TradersPage() {
  const { data, degraded } = await loadTraders();
  return <TradersScreen degraded={degraded} traders={data} />;
}
