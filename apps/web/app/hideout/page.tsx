import { HideoutScreen } from "@/components/screens/hideout/hideout-screen";
import { loadHideout } from "@/lib/data/hideout";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function HideoutPage() {
  const { data, degraded } = await loadHideout();
  return <HideoutScreen degraded={degraded} stations={data} />;
}
