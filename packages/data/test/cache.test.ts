import { describe, it, expect, vi } from "vitest";
import { makeRequirementsIndexLoader } from "../src/cache.js";

describe("makeRequirementsIndexLoader", () => {
  it("fetches once and caches within TTL", async () => {
    const fetcher = vi.fn().mockResolvedValue({ salewa: { itemId: "salewa", neededByTasks: [], neededByHideout: [], sellFor: [] } });
    let now = 0;
    const load = makeRequirementsIndexLoader({ fetcher, ttlMs: 1000, clock: () => now });
    await load();
    now = 500;
    await load();
    expect(fetcher).toHaveBeenCalledTimes(1);
    now = 2000;
    await load();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
