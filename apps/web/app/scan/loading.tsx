import { ScreenHeader, Skeleton } from "@/components/ui";

export default function ScanLoading() {
  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="SCAN" subtitle={"keep · sell"} />
      <Skeleton rows={8} />
    </section>
  );
}
