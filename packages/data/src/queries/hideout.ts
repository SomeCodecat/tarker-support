import { gql } from "graphql-request";
import { z } from "zod";
import type { HideoutStation } from "../types";

export const HIDEOUT_QUERY = gql`
  {
    hideoutStations {
      id name
      levels { level itemRequirements { item { id } count } }
    }
  }
`;

const RawHideout = z.object({
  hideoutStations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      levels: z.array(
        z.object({
          level: z.number(),
          itemRequirements: z.array(z.object({ item: z.object({ id: z.string() }).nullable(), count: z.number() })),
        }),
      ),
    }),
  ),
});

export function parseHideout(raw: unknown): HideoutStation[] {
  const { hideoutStations } = RawHideout.parse(raw);
  return hideoutStations.map((s) => ({
    id: s.id, name: s.name,
    levels: s.levels.map((l) => ({
      level: l.level,
      itemRequirements: l.itemRequirements
        .filter((r) => r.item)
        .map((r) => ({ itemId: r.item!.id, count: r.count })),
    })),
  }));
}

export async function fetchHideout(client: import("graphql-request").GraphQLClient): Promise<HideoutStation[]> {
  return parseHideout(await client.request(HIDEOUT_QUERY));
}
