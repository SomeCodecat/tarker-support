import { AmmoScreen } from "@/components/screens/ammo/ammo-screen";
import { loadAmmo } from "@/lib/data/ammo";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function AmmoPage() {
  const { data, degraded } = await loadAmmo();
  return <AmmoScreen degraded={degraded} ammo={data} />;
}
