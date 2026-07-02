import { ProgressionScreen } from "@/components/screens/progression/progression-screen";
import { loadProgression } from "@/lib/data/progression";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function ProgressionPage() {
  const { data, degraded } = await loadProgression();
  return <ProgressionScreen degraded={degraded} stations={data.stations} tasks={data.tasks} />;
}
