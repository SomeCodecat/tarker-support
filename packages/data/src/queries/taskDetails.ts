import { gql } from "graphql-request";
import { z } from "zod";
import type { TaskDetail } from "../types";

export const TASK_DETAILS_QUERY = gql`
  {
    tasks {
      id
      name
      minPlayerLevel
      experience
      kappaRequired
      trader { name }
      map { name }
      taskRequirements { task { id } }
      objectives {
        type
        description
        optional
        ... on TaskObjectiveItem { count foundInRaid }
      }
      finishRewards {
        traderStanding { standing trader { name } }
        items { count item { name } }
      }
    }
  }
`;

const RawObjective = z.object({
  type: z.string().nullable(),
  description: z.string().nullable(),
  optional: z.boolean().nullable(),
  count: z.number().nullable().optional(),
  foundInRaid: z.boolean().nullable().optional(),
});
const RawStanding = z.object({
  standing: z.number(),
  trader: z.object({ name: z.string() }).nullable(),
});
const RawRewardItem = z.object({
  count: z.number(),
  item: z.object({ name: z.string() }).nullable(),
});
const RawTaskDetail = z.object({
  id: z.string(),
  name: z.string(),
  minPlayerLevel: z.number().nullable(),
  experience: z.number().nullable(),
  kappaRequired: z.boolean().nullable(),
  trader: z.object({ name: z.string() }).nullable(),
  map: z.object({ name: z.string() }).nullable(),
  taskRequirements: z.array(z.object({ task: z.object({ id: z.string() }).nullable() })),
  objectives: z.array(RawObjective),
  finishRewards: z
    .object({
      traderStanding: z.array(RawStanding).nullish(),
      items: z.array(RawRewardItem).nullish(),
    })
    .nullable(),
});
const RawTaskDetails = z.object({ tasks: z.array(RawTaskDetail) });

export function parseTaskDetails(raw: unknown): TaskDetail[] {
  const { tasks } = RawTaskDetails.parse(raw);
  return tasks.map((t) => {
    const standing = t.finishRewards?.traderStanding ?? [];
    const items = t.finishRewards?.items ?? [];
    const cashReward = items
      .filter((i) => i.item?.name === "Roubles")
      .reduce((sum, i) => sum + i.count, 0);
    return {
      id: t.id,
      name: t.name,
      minPlayerLevel: t.minPlayerLevel ?? 0,
      traderName: t.trader?.name ?? null,
      mapName: t.map?.name ?? null,
      experience: t.experience ?? 0,
      kappaRequired: t.kappaRequired ?? false,
      prerequisiteTaskIds: t.taskRequirements
        .map((r) => r.task?.id)
        .filter((x): x is string => !!x),
      objectives: t.objectives.map((o) => ({
        type: o.type ?? "",
        description: o.description ?? "",
        count: o.count ?? 1,
        foundInRaid: o.foundInRaid ?? false,
        optional: o.optional ?? false,
      })),
      cashReward,
      standingRewards: standing
        .filter((s) => s.trader)
        .map((s) => ({ traderName: s.trader!.name, standing: s.standing })),
    };
  });
}

export async function fetchTaskDetails(
  client: import("graphql-request").GraphQLClient,
): Promise<TaskDetail[]> {
  return parseTaskDetails(await client.request(TASK_DETAILS_QUERY));
}
