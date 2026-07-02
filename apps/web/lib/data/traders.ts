import { createClient, fetchTraders, TARKOV_API_ENDPOINT } from "@tarker/data";
import { traders as sampleTraders } from "@/lib/mock";
import type { Trader } from "@/lib/types";
import type { DataResult } from "./result";

// The 8 core Escape-from-Tarkov traders, in the design's roster order.
// Roles are grounded in the approved design mock (not invented).
const TRADER_ORDER = [
  "prapor",
  "therapist",
  "skier",
  "peacekeeper",
  "mechanic",
  "ragman",
  "jaeger",
  "fence",
];
const ROLE_BY_ID: Record<string, string> = {
  prapor: "Warrant Officer",
  therapist: "Doctor",
  skier: "Businessman",
  peacekeeper: "UN Officer",
  mechanic: "Gunsmith",
  ragman: "Clothing Trader",
  jaeger: "Huntsman",
  fence: "Middleman",
};
const MAX_BARTERS = 8;

export async function loadTraders(): Promise<DataResult<Trader[]>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const profiles = await fetchTraders(client);
    const rank = new Map(TRADER_ORDER.map((id, index) => [id, index]));

    const data: Trader[] = profiles
      .filter((profile) => rank.has(profile.id))
      .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!)
      .map((profile) => ({
        id: profile.id,
        name: profile.name,
        role: ROLE_BY_ID[profile.id] ?? "Dealer",
        initial: profile.name.charAt(0).toUpperCase(),
        currency: profile.currency,
        rep: "—",
        reset: "—",
        barters: [...profile.barters]
          .sort((a, b) => a.level - b.level)
          .slice(0, MAX_BARTERS)
          .map((barter) => ({
            give:
              barter.requiredItems
                .map((item) => `${item.count}× ${item.name}`)
                .join(" + ") || "—",
            get:
              barter.rewardItems
                .map((item) =>
                  item.count > 1 ? `${item.count}× ${item.name}` : item.name,
                )
                .join(" + ") || "—",
          })),
      }));

    console.info(
      `[traders] fetched ${profiles.length} live traders from ${endpoint}; showing ${data.length} core traders (rep/restock/loyalty are player/progress state — placeholders)`,
    );
    return { data, degraded: false };
  } catch (err) {
    console.warn("[traders] live fetch failed, falling back to sample data:", err);
    return { data: sampleTraders, degraded: true };
  }
}
