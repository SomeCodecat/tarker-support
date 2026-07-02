import { createClient, fetchHideout, fetchItems, TARKOV_API_ENDPOINT } from "@tarker/data";
import { typeColor } from "@/lib/colors";
import { hideout } from "@/lib/mock";
import type { DataResult } from "./result";

export interface HideoutRequirementView {
  itemId: string;
  short?: string;
  name?: string;
  count: number;
  tier?: string;
}

export interface HideoutLevelView {
  level: number;
  itemRequirements: HideoutRequirementView[];
}

export interface HideoutStationView {
  id: string;
  name: string;
  levels: HideoutLevelView[];
}

export async function loadHideout(): Promise<DataResult<HideoutStationView[]>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const [stations, items] = await Promise.all([fetchHideout(client), fetchItems(client)]);
    const byId = new Map(items.map((item) => [item.id, item]));

    const enriched: HideoutStationView[] = stations.map((station) => ({
      id: station.id,
      name: station.name,
      levels: station.levels.map((level) => ({
        level: level.level,
        itemRequirements: level.itemRequirements.map((req) => {
          const item = byId.get(req.itemId);

          return {
            itemId: req.itemId,
            short: item?.shortName,
            name: item?.name,
            count: req.count,
            tier: item ? typeColor(item.types) : undefined,
          };
        }),
      })),
    }));

    console.info(`[hideout] fetched ${enriched.length} live stations from ${endpoint}`);
    return { data: enriched, degraded: false };
  } catch (err) {
    console.warn("[hideout] live fetch failed, falling back to sample data:", err);
    return { data: hideout as unknown as HideoutStationView[], degraded: true };
  }
}
