import { createClient, fetchTaskDetails, TARKOV_API_ENDPOINT, type Task } from "@tarker/data";
import { taskExtra as sampleExtra, tasks as sampleTasks } from "@/lib/mock";
import type { TaskExtra } from "@/lib/types";
import type { DataResult } from "./result";

export interface TasksData {
  tasks: Task[];
  extra: Record<string, TaskExtra>;
}

// tarkov.dev trader standing rewards are small floats (e.g. 0.02); render them the way the
// mock did — a signed, 2-decimal string like "+0.02".
function formatStanding(standing: number): string {
  const rounded = Math.round(standing * 100) / 100;
  return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(2)}`;
}

export async function loadTasks(): Promise<DataResult<TasksData>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const details = await fetchTaskDetails(client);

    // Reverse the prerequisite graph: which downstream tasks does each task unlock?
    const downstream = new Map<string, string[]>();
    for (const detail of details) {
      for (const prereqId of detail.prerequisiteTaskIds) {
        const list = downstream.get(prereqId) ?? [];
        list.push(detail.name);
        downstream.set(prereqId, list);
      }
    }

    const tasks: Task[] = details.map((detail) => ({
      id: detail.id,
      name: detail.name,
      minPlayerLevel: detail.minPlayerLevel,
      traderName: detail.traderName,
      prerequisiteTaskIds: detail.prerequisiteTaskIds,
      itemObjectives: [],
    }));

    const extra: Record<string, TaskExtra> = {};
    for (const detail of details) {
      const standing = detail.standingRewards[0];
      extra[detail.id] = {
        map: detail.mapName ?? "Any",
        kappa: detail.kappaRequired,
        xp: detail.experience,
        cash: detail.cashReward,
        repTrader: standing?.traderName ?? "",
        repAmt: standing ? formatStanding(standing.standing) : "",
        unlocks: downstream.get(detail.id) ?? [],
        objectives: detail.objectives.map((objective) => ({
          type: objective.type,
          desc: objective.description,
          count: objective.count,
          fir: objective.foundInRaid,
        })),
      };
    }

    console.info(`[tasks] fetched ${tasks.length} live tasks from ${endpoint}`);
    return { data: { tasks, extra }, degraded: false };
  } catch (err) {
    console.warn("[tasks] live fetch failed, falling back to sample data:", err);
    return { data: { tasks: sampleTasks, extra: sampleExtra }, degraded: true };
  }
}
