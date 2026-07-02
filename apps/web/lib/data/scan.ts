import {
  buildRequirementsIndex,
  createClient,
  fetchHideout,
  fetchItems,
  fetchTasks,
  TARKOV_API_ENDPOINT,
} from "@tarker/data";
import { typeColor } from "@/lib/colors";
import { scanRows as sampleRows } from "@/lib/mock";
import type { ScanRow } from "@/lib/types";
import type { DataResult } from "./result";

// Demo player state — the app has no persisted progress yet (documented in the
// screen banner): PMC level 15, nothing completed.
const DEMO_PMC_LEVEL = 15;
const NEXT_HORIZON_LEVELS = 5;

// Fixed demo stash (no vision pipeline yet). Real tarkov.dev item names,
// matched case-insensitively against the live items feed.
const DEMO_DETECTIONS: { name: string; own: number }[] = [
  { name: "LEDX Skin Transilluminator", own: 2 },
  { name: "Graphics card", own: 3 },
  { name: "Bolts", own: 12 },
  { name: "Physical Bitcoin", own: 4 },
  { name: "Salewa first aid kit", own: 5 },
  { name: 'Gunpowder "Kite"', own: 3 },
];

export async function loadScan(): Promise<DataResult<ScanRow[]>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const [items, tasks, hideout] = await Promise.all([
      fetchItems(client),
      fetchTasks(client),
      fetchHideout(client),
    ]);
    const index = buildRequirementsIndex(items, tasks, hideout);
    const byName = new Map(items.map((item) => [item.name.toLowerCase(), item]));

    const data: ScanRow[] = [];
    for (const detection of DEMO_DETECTIONS) {
      const item = byName.get(detection.name.toLowerCase());
      if (!item) {
        console.warn(`[scan] demo detection not found in live items: ${detection.name}`);
        continue;
      }
      const entry = index[item.id];
      const taskNeeds = entry?.neededByTasks ?? [];
      const hideoutNeeds = entry?.neededByHideout ?? [];

      const sumTasks = (maxLevel: number | null) =>
        taskNeeds.reduce(
          (total, need) =>
            maxLevel === null || need.minPlayerLevel <= maxLevel ? total + need.count : total,
          0,
        );
      const hideoutTotal = hideoutNeeds.reduce((total, need) => total + need.count, 0);

      const keepAll = sumTasks(null) + hideoutTotal;
      const keepCur = sumTasks(DEMO_PMC_LEVEL);
      const keepNext = sumTasks(DEMO_PMC_LEVEL + NEXT_HORIZON_LEVELS) + hideoutTotal;

      const reasons: string[] = [];
      if (hideoutNeeds[0]) reasons.push(`${hideoutNeeds[0].stationName} L${hideoutNeeds[0].level}`);
      if (taskNeeds[0]) reasons.push(taskNeeds[0].taskName);
      const reason = reasons.length > 0 ? reasons.join(" · ") : "No active requirements";

      const bestSell = (entry?.sellFor ?? item.sellFor).reduce<
        { source: string; priceRUB: number } | null
      >((best, venue) => (best === null || venue.priceRUB > best.priceRUB ? venue : best), null);

      data.push({
        short: item.shortName,
        name: item.name,
        tier: typeColor(item.types),
        own: detection.own,
        keepAll,
        keepCur,
        keepNext,
        reason,
        sell: bestSell?.priceRUB ?? 0,
        sellSrc: bestSell?.source ?? "—",
        fir: taskNeeds.some((need) => need.foundInRaid) ? "yes" : "no",
      });
    }

    if (data.length === 0) {
      throw new Error("no demo detections matched the live items feed");
    }

    console.info(
      `[scan] built ${data.length} demo-stash rows against ${items.length} live items (demo player state: PMC ${DEMO_PMC_LEVEL}, nothing completed)`,
    );
    return { data, degraded: false };
  } catch (err) {
    console.warn("[scan] live fetch failed, falling back to sample data:", err);
    return { data: sampleRows, degraded: true };
  }
}
