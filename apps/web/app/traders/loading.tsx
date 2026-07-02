import { ScreenHeader, Skeleton } from "@/components/ui";

export default function TradersLoading() {
  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="TRADERS" subtitle="dealers" />
      <Skeleton rows={8} />
    </section>
  );
}
