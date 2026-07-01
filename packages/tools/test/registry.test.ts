import { describe, it, expect } from "vitest";
import { makeTools } from "../src/registry.js";

describe("makeTools", () => {
  it("exposes a getItems tool that returns injected data", async () => {
    const tools = makeTools({
      fetchItems: async () => [{ id: "led", name: "LEDX", shortName: "LEDX", width: 1, height: 2, iconLink: null, gridImageLink: null, basePrice: 1, types: [], sellFor: [] }],
      fetchTasks: async () => [],
    });
    const getItems = tools.find((t) => t.name === "getItems")!;
    const result = await getItems.handler({});
    expect(result).toEqual([{ id: "led", name: "LEDX", shortName: "LEDX", width: 1, height: 2, iconLink: null, gridImageLink: null, basePrice: 1, types: [], sellFor: [] }]);
  });
});
