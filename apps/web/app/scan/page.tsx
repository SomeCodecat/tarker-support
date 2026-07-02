import { ScanScreen } from "@/components/screens/scan/scan-screen";
import { loadScan } from "@/lib/data/scan";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function ScanPage() {
  const { data, degraded } = await loadScan();
  return <ScanScreen degraded={degraded} scanRows={data} />;
}
