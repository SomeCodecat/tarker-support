import { gql } from "graphql-request";
import { z } from "zod";
import type { Task } from "../types";

export const TASKS_QUERY = gql`
  {
    tasks {
      id name minPlayerLevel
      trader { name }
      taskRequirements { task { id } }
      objectives {
        __typename
        ... on TaskObjectiveItem { item { id } count foundInRaid }
      }
    }
  }
`;

const RawTask = z.object({
  id: z.string(),
  name: z.string(),
  minPlayerLevel: z.number(),
  trader: z.object({ name: z.string() }).nullable(),
  taskRequirements: z.array(z.object({ task: z.object({ id: z.string() }).nullable() })),
  objectives: z.array(
    z.object({
      __typename: z.string(),
      item: z.object({ id: z.string() }).optional(),
      count: z.number().optional(),
      foundInRaid: z.boolean().optional(),
    }),
  ),
});
const RawTasks = z.object({ tasks: z.array(RawTask) });

export function parseTasks(raw: unknown): Task[] {
  const { tasks } = RawTasks.parse(raw);
  return tasks.map((t) => ({
    id: t.id,
    name: t.name,
    minPlayerLevel: t.minPlayerLevel,
    traderName: t.trader?.name ?? null,
    prerequisiteTaskIds: t.taskRequirements.map((r) => r.task?.id).filter((x): x is string => !!x),
    itemObjectives: t.objectives
      .filter((o) => o.__typename === "TaskObjectiveItem" && o.item && typeof o.count === "number")
      .map((o) => ({ itemId: o.item!.id, count: o.count!, foundInRaid: o.foundInRaid ?? false })),
  }));
}

export async function fetchTasks(client: import("graphql-request").GraphQLClient): Promise<Task[]> {
  return parseTasks(await client.request(TASKS_QUERY));
}
