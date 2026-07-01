import type { Item, SellVenue } from "@tarker/data";

export function bestTrader(item: Item): SellVenue | null {
  return item.sellFor
    .filter((venue) => venue.source !== "Flea Market")
    .toSorted((a, b) => b.priceRUB - a.priceRUB)[0] ?? null;
}

export function bestFlea(item: Item): SellVenue | null {
  return item.sellFor.find((venue) => venue.source === "Flea Market") ?? null;
}

export function bestSellVenue(item: Item): SellVenue | null {
  return item.sellFor.toSorted((a, b) => b.priceRUB - a.priceRUB)[0] ?? null;
}
