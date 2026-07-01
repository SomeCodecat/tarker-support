import { describe, it, expect } from "vitest";
import { buildRequirementsIndex } from "../src/requirementsIndex.js";
import type { Item, Task, HideoutStation } from "../src/types.js";

const items: Item[] = [
  { id: "salewa", name: "Salewa", shortName: "Salewa", width: 1, height: 1, iconLink: null, gridImageLink: null, basePrice: 12000, types: ["meds"], sellFor: [{ source: "Therapist", priceRUB: 12000 }] },
  { id: "bandage", name: "Bandage", shortName: "Bandage", width: 1, height: 1, iconLink: null, gridImageLink: null, basePrice: 100, types: ["meds"], sellFor: [] },
];
const tasks: Task[] = [
  { id: "t1", name: "Shortage", minPlayerLevel: 5, traderName: "Therapist", prerequisiteTaskIds: [], itemObjectives: [{ itemId: "salewa", count: 3, foundInRaid: true }] },
];
const hideout: HideoutStation[] = [
  { id: "med", name: "Medstation", levels: [{ level: 1, itemRequirements: [{ itemId: "bandage", count: 5 }] }] },
];

describe("buildRequirementsIndex", () => {
  it("indexes task needs with FIR + level", () => {
    const idx = buildRequirementsIndex(items, tasks, hideout);
    expect(idx["salewa"].neededByTasks).toEqual([
      { taskId: "t1", taskName: "Shortage", count: 3, foundInRaid: true, minPlayerLevel: 5 },
    ]);
    expect(idx["salewa"].sellFor[0]).toEqual({ source: "Therapist", priceRUB: 12000 });
  });

  it("indexes hideout needs", () => {
    const idx = buildRequirementsIndex(items, tasks, hideout);
    expect(idx["bandage"].neededByHideout).toEqual([
      { stationId: "med", stationName: "Medstation", level: 1, count: 5 },
    ]);
  });

  it("creates entries even for items with no needs", () => {
    const idx = buildRequirementsIndex(items, [], []);
    expect(idx["salewa"]).toEqual({ itemId: "salewa", neededByTasks: [], neededByHideout: [], sellFor: [{ source: "Therapist", priceRUB: 12000 }] });
  });
});
