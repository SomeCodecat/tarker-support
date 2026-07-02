import {
  buildRequirementsIndex,
  createClient,
  fetchHideout,
  fetchItems,
  fetchTasks,
  TARKOV_API_ENDPOINT,
  type Item,
  type RequirementsEntry,
  type Task,
} from "@tarker/data";
import {
  bestFlea,
  items as sampleItems,
  requirements as sampleRequirements,
  tasks as sampleTasks,
} from "@/lib/mock";
import type { DataResult } from "./result";

export interface NextQuestView {
  id: string;
  name: string;
  traderName: string | null;
  minPlayerLevel: number;
  objectiveCount: number;
}

export interface NeededItemView {
  id: string;
  name: string;
  shortName: string;
  types: string[];
  tall: boolean;
  fleaPriceRUB: number | null;
  label: string;
}

export interface DashboardView {
  itemsCount: number;
  activeQuestCount: number;
  lockedQuestCount: number;
  nextQuests: NextQuestView[];
  neededItems: NeededItemView[];
}

function toNextQuest(task: Task): NextQuestView {
  return {
    id: task.id,
    name: task.name,
    traderName: task.traderName,
    minPlayerLevel: task.minPlayerLevel,
    objectiveCount: task.itemObjectives.length,
  };
}

function nextQuestsFrom(tasks: Task[]): NextQuestView[] {
  return tasks.filter((task) => task.prerequisiteTaskIds.length === 0).slice(0, 4).map(toNextQuest);
}

function liveNeedLabel(entry: RequirementsEntry): string {
  const taskNeed = entry.neededByTasks[0];
  if (taskNeed) return `needed · ${taskNeed.taskName}`;
  const hideoutNeed = entry.neededByHideout[0];
  if (hideoutNeed) return `needed · ${hideoutNeed.stationName} L${hideoutNeed.level}`;
  return "needed · surplus";
}

function buildLiveView(
  items: Item[],
  tasks: Task[],
  hideout: Awaited<ReturnType<typeof fetchHideout>>,
): DashboardView {
  const index = buildRequirementsIndex(items, tasks, hideout);
  const byId = new Map(items.map((item) => [item.id, item]));

  const neededItems: NeededItemView[] = Object.values(index)
    .filter((entry) => entry.neededByTasks.length > 0 || entry.neededByHideout.length > 0)
    .filter((entry) => byId.has(entry.itemId))
    .sort(
      (a, b) =>
        b.neededByTasks.length + b.neededByHideout.length -
        (a.neededByTasks.length + a.neededByHideout.length),
    )
    .slice(0, 4)
    .map((entry) => {
      const item = byId.get(entry.itemId)!;
      return {
        id: item.id,
        name: item.name,
        shortName: item.shortName,
        types: item.types,
        tall: item.height > item.width,
        fleaPriceRUB: bestFlea(item)?.priceRUB ?? null,
        label: liveNeedLabel(entry),
      };
    });

  return {
    itemsCount: items.length,
    activeQuestCount: tasks.length,
    lockedQuestCount: tasks.filter((task) => task.prerequisiteTaskIds.length > 0).length,
    nextQuests: nextQuestsFrom(tasks),
    neededItems,
  };
}

function sampleNeedLabel(itemId: string): string {
  const req = sampleRequirements[itemId];
  if (!req) return "needed · surplus";
  const taskNeed = req.neededByTasks[0];
  if (taskNeed) return `needed · ${taskNeed.taskName}`;
  const hideoutNeed = req.neededByHideout[0];
  if (hideoutNeed) return `needed · ${hideoutNeed.stationName} L${hideoutNeed.level}`;
  return "needed · surplus";
}

function buildSampleView(): DashboardView {
  const neededItemIndexes = [0, 1, 7, 3];
  const neededItems: NeededItemView[] = neededItemIndexes
    .map((i) => sampleItems[i])
    .filter((item): item is (typeof sampleItems)[number] => Boolean(item))
    .map((item) => ({
      id: item.id,
      name: item.name,
      shortName: item.shortName,
      types: item.types,
      tall: item.height > item.width,
      fleaPriceRUB: bestFlea(item)?.priceRUB ?? null,
      label: sampleNeedLabel(item.id),
    }));

  return {
    itemsCount: sampleItems.length,
    activeQuestCount: sampleTasks.length,
    lockedQuestCount: sampleTasks.filter((task) => task.prerequisiteTaskIds.length > 0).length,
    nextQuests: nextQuestsFrom(sampleTasks),
    neededItems,
  };
}

export async function loadDashboard(): Promise<DataResult<DashboardView>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const [items, tasks, hideout] = await Promise.all([
      fetchItems(client),
      fetchTasks(client),
      fetchHideout(client),
    ]);
    console.info(`[dashboard] fetched ${items.length} items + ${tasks.length} tasks from ${endpoint}`);
    return { data: buildLiveView(items, tasks, hideout), degraded: false };
  } catch (err) {
    console.warn("[dashboard] live fetch failed, falling back to sample data:", err);
    return { data: buildSampleView(), degraded: true };
  }
}
