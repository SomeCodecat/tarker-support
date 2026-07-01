import { ScreenHeader, Skeleton } from "@/components/ui";

export default function ItemsLoading() {
  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="Items" subtitle="database" />
      <Skeleton rows={10} />
    </section>
  );
}
