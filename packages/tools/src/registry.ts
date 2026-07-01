import { z } from "zod";
import type { Item, Task } from "@tarker/data";
import type { Tool } from "./types.js";

export interface ToolDeps {
  fetchItems: () => Promise<Item[]>;
  fetchTasks: () => Promise<Task[]>;
}

export function makeTools(deps: ToolDeps): Tool[] {
  return [
    {
      name: "getItems",
      description: "Return all Escape from Tarkov items with prices and grid sizes.",
      parameters: z.object({}),
      handler: async () => deps.fetchItems(),
    },
    {
      name: "getTasks",
      description: "Return all Escape from Tarkov quests/tasks with item objectives.",
      parameters: z.object({}),
      handler: async () => deps.fetchTasks(),
    },
  ];
}
