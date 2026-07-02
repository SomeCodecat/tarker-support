import { gql } from "graphql-request";
import { z } from "zod";
import type { MapLocation } from "../types";

export const MAPS_QUERY = gql`
  {
    maps {
      id
      name
      normalizedName
      players
      raidDuration
      bosses {
        spawnChance
        boss { name }
      }
      extracts {
        name
        faction
        switches { id }
        transferItem { count }
      }
    }
  }
`;

const RawBossSpawn = z.object({
  spawnChance: z.number().nullable(),
  boss: z.object({ name: z.string() }).nullable(),
});
const RawExtract = z.object({
  name: z.string().nullable(),
  faction: z.string().nullable(),
  switches: z.array(z.object({ id: z.string() })).nullish(),
  transferItem: z.object({ count: z.number() }).nullable(),
});
const RawMap = z.object({
  id: z.string(),
  name: z.string(),
  normalizedName: z.string(),
  players: z.string().nullable(),
  raidDuration: z.number().nullable(),
  bosses: z.array(RawBossSpawn),
  extracts: z.array(RawExtract),
});
const RawMaps = z.object({ maps: z.array(RawMap) });

export function parseMaps(raw: unknown): MapLocation[] {
  const { maps } = RawMaps.parse(raw);
  return maps.map((m) => ({
    id: m.id,
    name: m.name,
    normalizedName: m.normalizedName,
    players: m.players,
    raidDuration: m.raidDuration,
    bosses: m.bosses
      .filter((b) => b.boss && typeof b.spawnChance === "number")
      .map((b) => ({ name: b.boss!.name, spawnChance: b.spawnChance! })),
    extracts: m.extracts
      .filter((e) => e.name)
      .map((e) => ({
        name: e.name!,
        faction: e.faction,
        hasSwitch: (e.switches ?? []).length > 0,
        hasItemRequirement: e.transferItem != null,
      })),
  }));
}

export async function fetchMaps(
  client: import("graphql-request").GraphQLClient,
): Promise<MapLocation[]> {
  return parseMaps(await client.request(MAPS_QUERY));
}
