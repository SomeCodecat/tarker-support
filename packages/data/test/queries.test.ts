import { describe, it, expect } from "vitest";
import { parseItems } from "../src/queries/items.js";

describe("parseItems", () => {
  it("maps raw tarkov.dev items into typed Items with sellFor", () => {
    const raw = {
      items: [
        {
          id: "5c0e", name: "LEDX", shortName: "LEDX",
          width: 1, height: 2, iconLink: "http://i/led.png", gridImageLink: "http://g/led.png",
          basePrice: 100000, types: ["barter"],
          sellFor: [{ priceRUB: 900000, vendor: { name: "Flea Market" } }],
        },
      ],
    };
    const items = parseItems(raw);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "5c0e", shortName: "LEDX", width: 1, height: 2 });
    expect(items[0].sellFor[0]).toEqual({ source: "Flea Market", priceRUB: 900000 });
  });
});
import { parseTasks } from "../src/queries/tasks.js";

describe("parseTasks", () => {
  it("flattens item objectives with FIR + count", () => {
    const raw = {
      tasks: [
        {
          id: "t1", name: "Shortage", minPlayerLevel: 5,
          trader: { name: "Therapist" },
          taskRequirements: [{ task: { id: "t0" } }],
          objectives: [
            { __typename: "TaskObjectiveItem", item: { id: "salewa" }, count: 3, foundInRaid: true },
            { __typename: "TaskObjectiveBasic" },
          ],
        },
      ],
    };
    const tasks = parseTasks(raw);
    expect(tasks[0]).toMatchObject({ id: "t1", minPlayerLevel: 5, traderName: "Therapist", prerequisiteTaskIds: ["t0"] });
    expect(tasks[0].itemObjectives).toEqual([{ itemId: "salewa", count: 3, foundInRaid: true }]);
  });
});
import { parseHideout } from "../src/queries/hideout.js";

describe("parseHideout", () => {
  it("flattens station levels + item requirements", () => {
    const raw = {
      hideoutStations: [
        { id: "med", name: "Medstation", levels: [
          { level: 1, itemRequirements: [{ item: { id: "bandage" }, count: 5 }] },
        ] },
      ],
    };
    const stations = parseHideout(raw);
    expect(stations[0]).toMatchObject({ id: "med", name: "Medstation" });
    expect(stations[0].levels[0]).toEqual({ level: 1, itemRequirements: [{ itemId: "bandage", count: 5 }] });
  });
});
