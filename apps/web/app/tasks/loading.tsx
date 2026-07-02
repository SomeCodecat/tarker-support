import { ScreenHeader, Skeleton } from "@/components/ui";

export default function TasksLoading() {
  return (
    <section className="space-y-[16px]">
      <ScreenHeader title="TASKS" subtitle="quests" />
      <Skeleton rows={10} />
    </section>
  );
}
