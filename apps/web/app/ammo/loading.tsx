import { ScreenHeader, Skeleton } from "@/components/ui";

export default function AmmoLoading() {
  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="AMMO" subtitle="ballistics" />
      <Skeleton rows={10} />
    </section>
  );
}
