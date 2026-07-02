import { ScreenHeader, Skeleton } from "@/components/ui";

export default function HideoutLoading() {
  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="HIDEOUT" subtitle="stations" />
      <Skeleton rows={8} />
    </section>
  );
}
