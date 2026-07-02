import { ScreenHeader, Skeleton } from "@/components/ui";

export default function ProgressionLoading() {
  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="PROGRESSION" subtitle="operator" />
      <Skeleton rows={8} />
    </section>
  );
}
