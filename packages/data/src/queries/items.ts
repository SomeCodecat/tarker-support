import { gql } from "graphql-request";
import { z } from "zod";
import type { Item } from "../types";

export const ITEMS_QUERY = gql`
  {
    items {
      id name shortName width height iconLink gridImageLink basePrice types
      sellFor { priceRUB vendor { name } }
    }
  }
`;

const RawItem = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  width: z.number(),
  height: z.number(),
  iconLink: z.string().nullable(),
  gridImageLink: z.string().nullable(),
  basePrice: z.number(),
  types: z.array(z.string()),
  sellFor: z.array(z.object({ priceRUB: z.number(), vendor: z.object({ name: z.string() }) })),
});
const RawItems = z.object({ items: z.array(RawItem) });

export function parseItems(raw: unknown): Item[] {
  const { items } = RawItems.parse(raw);
  return items.map((i) => ({
    id: i.id, name: i.name, shortName: i.shortName,
    width: i.width, height: i.height, iconLink: i.iconLink, gridImageLink: i.gridImageLink,
    basePrice: i.basePrice, types: i.types,
    sellFor: i.sellFor.map((s) => ({ source: s.vendor.name, priceRUB: s.priceRUB })),
  }));
}

export async function fetchItems(client: import("graphql-request").GraphQLClient): Promise<Item[]> {
  return parseItems(await client.request(ITEMS_QUERY));
}
