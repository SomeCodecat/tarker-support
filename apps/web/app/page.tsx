import { DashboardScreen } from "@/components/screens/dashboard/dashboard-screen";
import { loadDashboard } from "@/lib/data/dashboard";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function Home() {
  const { data, degraded } = await loadDashboard();
  return <DashboardScreen degraded={degraded} view={data} />;
}
