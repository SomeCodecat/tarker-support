import { gql } from "graphql-request";
import { z } from "zod";
import type { TraderProfile } from "../types";

export const TRADERS_QUERY = gql`
  {
    traders {
      normalizedName
      name
      currency {
        shortName
      }
      barters {
        level
        requiredItems {
          count
          item {
            name
          }
        }
        rewardItems {
          count
          item {
            name
          }
        }
      }
    }
  }
`;

const RawBarterItem = z.object({
  count: z.number().nullable(),
  item: z.object({ name: z.string() }).nullable(),
});
const RawBarter = z.object({
  level: z.number().nullable(),
  requiredItems: z.array(RawBarterItem),
  rewardItems: z.array(RawBarterItem),
});
const RawTrader = z.object({
  normalizedName: z.string(),
  name: z.string(),
  currency: z.object({ shortName: z.string() }).nullable(),
  barters: z.array(RawBarter),
});
const RawTraders = z.object({ traders: z.array(RawTrader) });

export function parseTraders(raw: unknown): TraderProfile[] {
  const { traders } = RawTraders.parse(raw);
  return traders.map((t) => ({
    id: t.normalizedName,
    name: t.name,
    currency: t.currency?.shortName ?? "RUB",
    barters: t.barters.map((b) => ({
      level: b.level ?? 1,
      requiredItems: b.requiredItems
        .filter((ri) => ri.item)
        .map((ri) => ({ name: ri.item!.name, count: ri.count ?? 1 })),
      rewardItems: b.rewardItems
        .filter((ri) => ri.item)
        .map((ri) => ({ name: ri.item!.name, count: ri.count ?? 1 })),
    })),
  }));
}

export async function fetchTraders(
  client: import("graphql-request").GraphQLClient,
): Promise<TraderProfile[]> {
  return parseTraders(await client.request(TRADERS_QUERY));
}
