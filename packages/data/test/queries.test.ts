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
import { parseAmmo } from "../src/queries/ammo.js";

describe("parseAmmo", () => {
  it("flattens nested item name/shortName/sellFor and keeps ballistics", () => {
    const raw = {
      ammo: [
        {
          caliber: "Caliber556x45NATO", ammoType: "bullet",
          damage: 42, penetrationPower: 53, armorDamage: 65,
          fragmentationChance: 0.2, penetrationChance: 0.68, ricochetChance: 0.02,
          initialSpeed: 1013, projectileCount: 1, tracer: false, tracerColor: null,
          weight: 0.0113, stackMaxSize: 60, lightBleedModifier: 0.5, heavyBleedModifier: 0.5,
          staminaBurnPerDamage: 0.71, accuracyModifier: null, recoilModifier: null,
          item: { id: "m995", name: "5.56x45mm M995", shortName: "M995",
            sellFor: [{ priceRUB: 1360, vendor: { name: "Flea Market" } }] },
        },
      ],
    };
    const rounds = parseAmmo(raw);
    expect(rounds).toHaveLength(1);
    expect(rounds[0]).toMatchObject({
      itemId: "m995", name: "5.56x45mm M995", shortName: "M995",
      caliber: "Caliber556x45NATO", damage: 42, penetrationPower: 53, projectileCount: 1,
    });
    expect(rounds[0].sellFor[0]).toEqual({ source: "Flea Market", priceRUB: 1360 });
  });
});
import { parseTaskDetails } from "../src/queries/taskDetails.js";

describe("parseTaskDetails", () => {
  it("maps map/kappa/experience, objectives, and finish rewards (cash + standing)", () => {
    const raw = {
      tasks: [
        {
          id: "g1", name: "Debut", minPlayerLevel: 1, experience: 1100, kappaRequired: true,
          trader: { name: "Prapor" }, map: { name: "Factory" },
          taskRequirements: [{ task: { id: "g0" } }],
          objectives: [
            { type: "giveItem", description: "Hand over MP-133 shotguns", optional: false, count: 2, foundInRaid: false },
            { type: "shoot", description: "Eliminate Scavs", optional: false },
          ],
          finishRewards: {
            traderStanding: [{ standing: 0.02, trader: { name: "Prapor" } }],
            items: [{ count: 15000, item: { name: "Roubles" } }],
          },
        },
      ],
    };
    const details = parseTaskDetails(raw);
    expect(details[0]).toMatchObject({
      id: "g1", name: "Debut", minPlayerLevel: 1, traderName: "Prapor",
      mapName: "Factory", experience: 1100, kappaRequired: true, cashReward: 15000,
      prerequisiteTaskIds: ["g0"],
    });
    expect(details[0].objectives[0]).toEqual({ type: "giveItem", description: "Hand over MP-133 shotguns", count: 2, foundInRaid: false, optional: false });
    expect(details[0].objectives[1]).toEqual({ type: "shoot", description: "Eliminate Scavs", count: 1, foundInRaid: false, optional: false });
    expect(details[0].standingRewards[0]).toEqual({ traderName: "Prapor", standing: 0.02 });
  });
});

import { parseMaps } from "../src/queries/maps.js";

describe("parseMaps", () => {
  it("maps bosses (name + chance) and extracts (faction/switch/transfer), dropping null bosses/extracts", () => {
    const raw = {
      maps: [
        {
          id: "55f2", name: "Customs", normalizedName: "customs", players: "10-12", raidDuration: 35,
          bosses: [
            { spawnChance: 0.35, boss: { name: "Reshala" } },
            { spawnChance: 0.2, boss: null },
          ],
          extracts: [
            { name: "ZB-013", faction: "pmc", switches: [{ id: "s1" }], transferItem: null },
            { name: "Crossroads", faction: "shared", switches: [], transferItem: null },
            { name: null, faction: "scav", switches: [], transferItem: null },
          ],
        },
      ],
    };
    const maps = parseMaps(raw);
    expect(maps[0]).toMatchObject({ id: "55f2", name: "Customs", normalizedName: "customs", players: "10-12", raidDuration: 35 });
    expect(maps[0].bosses).toEqual([{ name: "Reshala", spawnChance: 0.35 }]);
    expect(maps[0].extracts).toEqual([
      { name: "ZB-013", faction: "pmc", hasSwitch: true, hasItemRequirement: false },
      { name: "Crossroads", faction: "shared", hasSwitch: false, hasItemRequirement: false },
    ]);
  });
});

import { parseTraders } from "../src/queries/traders.js";

describe("parseTraders", () => {
  it("maps normalizedName→id, currency shortName, and barter items (dropping null items)", () => {
    const raw = {
      traders: [
        {
          normalizedName: "prapor",
          name: "Prapor",
          currency: { shortName: "RUB" },
          barters: [
            {
              level: 2,
              requiredItems: [
                { count: 2, item: { name: "Propane tank (5L)" } },
                { count: 2, item: { name: "Fuel conditioner" } },
              ],
              rewardItems: [{ count: 1, item: { name: "Metal fuel tank" } }],
            },
            {
              level: 1,
              requiredItems: [{ count: 1, item: null }],
              rewardItems: [{ count: 1, item: { name: "Roubles" } }],
            },
          ],
        },
      ],
    };
    const traders = parseTraders(raw);
    expect(traders[0]).toMatchObject({ id: "prapor", name: "Prapor", currency: "RUB" });
    expect(traders[0].barters[0]).toEqual({
      level: 2,
      requiredItems: [
        { name: "Propane tank (5L)", count: 2 },
        { name: "Fuel conditioner", count: 2 },
      ],
      rewardItems: [{ name: "Metal fuel tank", count: 1 }],
    });
    // null item is dropped from requiredItems
    expect(traders[0].barters[1].requiredItems).toEqual([]);
    expect(traders[0].barters[1].rewardItems).toEqual([{ name: "Roubles", count: 1 }]);
  });
});

