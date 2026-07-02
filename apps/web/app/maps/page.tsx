import { MapsScreen } from "@/components/screens/maps/maps-screen";
import { loadMaps } from "@/lib/data/maps";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function MapsPage() {
  const { data, degraded } = await loadMaps();
  return <MapsScreen degraded={degraded} maps={data} />;
}

