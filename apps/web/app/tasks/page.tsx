import { TasksScreen } from "@/components/screens/tasks/tasks-screen";
import { loadTasks } from "@/lib/data/tasks";

export const revalidate = 86400; // 24h ISR, matches @tarker/data cache TTL

export default async function TasksPage() {
  const { data, degraded } = await loadTasks();
  return <TasksScreen degraded={degraded} tasks={data.tasks} taskExtra={data.extra} />;
}
