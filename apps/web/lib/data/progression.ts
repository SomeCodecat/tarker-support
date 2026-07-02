import { createClient, fetchHideout, fetchTasks, TARKOV_API_ENDPOINT, type Task } from "@tarker/data";
import { progStations as sampleStations, tasks as sampleTasks } from "@/lib/mock";
import type { ProgStation } from "@/lib/types";
import type { DataResult } from "./result";

export interface ProgressionData {
  tasks: Task[];
  stations: ProgStation[];
}

export async function loadProgression(): Promise<DataResult<ProgressionData>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const [tasks, hideout] = await Promise.all([fetchTasks(client), fetchHideout(client)]);
    const stations: ProgStation[] = hideout.map((station) => ({
      id: station.id,
      name: station.name,
      max: Math.max(1, station.levels.length),
    }));
    console.info(`[progression] fetched ${tasks.length} tasks + ${stations.length} stations from ${endpoint}`);
    return { data: { tasks, stations }, degraded: false };
  } catch (err) {
    console.warn("[progression] live fetch failed, falling back to sample data:", err);
    return { data: { tasks: sampleTasks, stations: sampleStations }, degraded: true };
  }
}
