import type { Item, Task, HideoutStation, RequirementsIndex, RequirementsEntry } from "./types";

export function buildRequirementsIndex(items: Item[], tasks: Task[], hideout: HideoutStation[]): RequirementsIndex {
  const index: RequirementsIndex = {};
  const ensure = (itemId: string): RequirementsEntry =>
    (index[itemId] ??= { itemId, neededByTasks: [], neededByHideout: [], sellFor: [] });

  for (const item of items) ensure(item.id).sellFor = item.sellFor;

  for (const task of tasks) {
    for (const obj of task.itemObjectives) {
      ensure(obj.itemId).neededByTasks.push({
        taskId: task.id, taskName: task.name, count: obj.count,
        foundInRaid: obj.foundInRaid, minPlayerLevel: task.minPlayerLevel,
      });
    }
  }

  for (const station of hideout) {
    for (const lvl of station.levels) {
      for (const req of lvl.itemRequirements) {
        ensure(req.itemId).neededByHideout.push({
          stationId: station.id, stationName: station.name, level: lvl.level, count: req.count,
        });
      }
    }
  }

  return index;
}
