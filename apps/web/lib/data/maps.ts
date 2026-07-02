import { createClient, fetchMaps, fetchTaskDetails, TARKOV_API_ENDPOINT } from "@tarker/data";
import { maps as sampleMaps } from "@/lib/mock";
import type { MapExtract, MapInfo } from "@/lib/types";
import type { DataResult } from "./result";

function toSide(faction: string | null): MapExtract["side"] {
  const normalized = (faction ?? "").toLowerCase();
  if (normalized === "pmc") return "PMC";
  if (normalized === "scav") return "Scav";
  return "Shared";
}

export async function loadMaps(): Promise<DataResult<MapInfo[]>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const [maps, taskDetails] = await Promise.all([fetchMaps(client), fetchTaskDetails(client)]);

    // Per-map quest count: join the tasks feed on map name.
    const questCounts = new Map<string, number>();
    for (const task of taskDetails) {
      if (task.mapName) {
        questCounts.set(task.mapName, (questCounts.get(task.mapName) ?? 0) + 1);
      }
    }

    const data: MapInfo[] = maps.map((map) => {
      // Dedupe bosses by name (keep highest spawn chance), sort desc, cap at 6.
      const byName = new Map<string, number>();
      for (const boss of map.bosses) {
        byName.set(boss.name, Math.max(byName.get(boss.name) ?? 0, boss.spawnChance));
      }
      const bosses = Array.from(byName, ([name, chance]) => ({ name, chance }))
        .sort((a, b) => b.chance - a.chance)
        .slice(0, 6)
        .map((boss) => ({ name: boss.name, chance: `${Math.round(boss.chance * 100)}%` }));

      const extracts: MapExtract[] = map.extracts.map((extract) => ({
        name: extract.name,
        side: toSide(extract.faction),
        req: extract.hasSwitch ? "switch" : extract.hasItemRequirement ? "item" : "none",
        reliable: !extract.hasSwitch && !extract.hasItemRequirement,
      }));

      return {
        id: map.normalizedName,
        name: map.name,
        players: map.players ?? "—",
        duration: map.raidDuration ? `${map.raidDuration} min` : "—",
        quests: questCounts.get(map.name) ?? 0,
        hot: "—",
        bosses,
        extracts,
      };
    });

    console.info(`[maps] fetched ${data.length} live maps from ${endpoint}`);
    return { data, degraded: false };
  } catch (err) {
    console.warn("[maps] live fetch failed, falling back to sample data:", err);
    return { data: sampleMaps, degraded: true };
  }
}
