import { ScreenHeader, Skeleton } from "@/components/ui";

export default function MapsLoading() {
  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="MAPS" subtitle="locations" />
      <Skeleton rows={8} />
    </section>
  );
}
