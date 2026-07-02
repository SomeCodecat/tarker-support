"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Lock, Map as MapIcon } from "lucide-react";
import { Badge, Button, EmptyState, FilterChip, Panel, ScreenHeader } from "@/components/ui";
import { rub } from "@/lib/format";
import type { Task, TaskDetailObjective, TaskExtra, TaskObjectiveItem } from "@/lib/types";
import { cn } from "@/lib/cn";

const ALL_TRADERS = "all";

const objTypeMeta: Record<string, { label: string; color: string }> = {
  giveItem: { label: "HAND OVER", color: "#c9964b" },
  findItem: { label: "FIND", color: "#7d9b6a" },
  shoot: { label: "ELIMINATE", color: "#c15b4e" },
  mark: { label: "MARK", color: "#9a86c4" },
  visit: { label: "LOCATE", color: "#7fa8c9" },
  buildWeapon: { label: "GUNSMITH", color: "#a88b6a" },
};

export function TasksScreen({ degraded = false, tasks, taskExtra }: { degraded?: boolean; tasks: Task[]; taskExtra: Record<string, TaskExtra> }) {
  const [traderFilter, setTraderFilter] = useState<string>(ALL_TRADERS);
  const [taskDetailId, setTaskDetailId] = useState<string | null>(null);

  const nameById = useMemo(() => {
    return new Map(tasks.map((task) => [task.id, task.name]));
  }, [tasks]);

  const traderChips = useMemo(() => {
    return [
      ALL_TRADERS,
      ...Array.from(
        new Set(tasks.map((task) => task.traderName).filter((name): name is string => Boolean(name))),
      ),
    ];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) => traderFilter === ALL_TRADERS || task.traderName === traderFilter,
    );
  }, [tasks, traderFilter]);

  const detailTask = taskDetailId
    ? tasks.find((task) => task.id === taskDetailId) ?? null
    : null;

  if (detailTask) {
    return (
      <TaskDetail task={detailTask} nameById={nameById} onBack={() => setTaskDetailId(null)} taskExtra={taskExtra} />
    );
  }

  return (
    <section className="mx-auto max-w-[1500px] space-y-[18px]">
      <ScreenHeader
        title="TASKS"
        subtitle="quests"
        right={
          <div className="flex items-center gap-[8px]">
            {degraded ? <Badge variant="sample" /> : null}
            <span className="font-mono text-mono uppercase tracking-[0.08em] text-dim">
              {filteredTasks.length} quests
            </span>
          </div>
        }
      />

      <div className="flex flex-wrap gap-[6px]">
        {traderChips.map((traderName) => (
          <FilterChip
            key={traderName}
            active={traderFilter === traderName}
            onClick={() => setTraderFilter(traderName)}
            type="button"
          >
            {traderName === ALL_TRADERS ? "ALL TRADERS" : traderName}
          </FilterChip>
        ))}
      </div>

      {filteredTasks.length > 0 ? (
        <TaskList tasks={filteredTasks} nameById={nameById} onOpen={setTaskDetailId} taskExtra={taskExtra} />
      ) : (
        <EmptyState
          label="NO QUESTS MATCH"
          hint="No quests for this trader in the current slice. Reset the filter to ALL TRADERS."
        />
      )}
    </section>
  );
}

interface TaskListProps {
  tasks: Task[];
  nameById: Map<string, string>;
  onOpen(taskId: string): void;
  taskExtra: Record<string, TaskExtra>;
}

function TaskList({ tasks, nameById, onOpen, taskExtra }: TaskListProps) {
  return (
    <Panel padded={false} className="overflow-hidden">
      <div className="divide-y divide-border-subtle">
        {tasks.map((task, index) => {
          const extra = taskExtra[task.id];
          const prereqs = task.prerequisiteTaskIds
            .map((id) => nameById.get(id) ?? id)
            .join(", ");
          const locked = task.prerequisiteTaskIds.length > 0;

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onOpen(task.id)}
              className={cn(
                "grid w-full grid-cols-[32px_minmax(0,1fr)_90px] items-center border-l-[3px] text-left transition-colors hover:bg-hover min-[760px]:grid-cols-[32px_minmax(0,1fr)_110px_100px_72px_24px]",
                locked ? "border-l-danger" : "border-l-transparent",
                index % 2 === 0 ? "bg-surface" : "bg-elevated",
              )}
            >
              <div className="flex justify-center px-[8px] py-[10px] text-danger">
                {locked ? <Lock className="size-[14px]" strokeWidth={2} /> : null}
              </div>
              <div className="min-w-0 px-[10px] py-[10px]">
                <div className="truncate text-name font-semibold text-fg min-[860px]:text-[13.5px]">
                  {task.name}
                </div>
                {locked ? (
                  <div className="mt-[3px] truncate font-mono text-meta text-danger">
                    requires {prereqs}
                  </div>
                ) : null}
                <div className="mt-[6px] flex flex-wrap gap-[6px] min-[760px]:hidden">
                  <TaskMeta label={task.traderName ?? "—"} />
                  <TaskMeta label={extra?.map ?? "Any"} />
                </div>
              </div>
              <div className="hidden px-[10px] py-[10px] font-mono text-mono text-muted min-[760px]:block">
                {task.traderName ?? "—"}
              </div>
              <div className="hidden px-[10px] py-[10px] font-mono text-meta uppercase tracking-[0.04em] text-dim min-[760px]:block">
                {extra?.map ?? "Any"}
              </div>
              <div className="px-[10px] py-[10px]">
                <Badge variant="level" className="text-accent">
                  LVL {task.minPlayerLevel}
                </Badge>
              </div>
              <div className="hidden px-[8px] py-[10px] text-dim min-[760px]:block">
                <ChevronRight className="size-[14px]" strokeWidth={2} />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function TaskMeta({ label }: { label: string }) {
  return (
    <span className="border border-border-strong px-[5px] py-[2px] font-mono text-meta uppercase tracking-[0.04em] text-dim">
      {label}
    </span>
  );
}

interface TaskDetailProps {
  task: Task;
  nameById: Map<string, string>;
  onBack(): void;
  taskExtra: Record<string, TaskExtra>;
}

function TaskDetail({ task, nameById, onBack, taskExtra }: TaskDetailProps) {
  const extra = taskExtra[task.id];
  const prereqs = task.prerequisiteTaskIds.map((id) => nameById.get(id) ?? id);
  const unlocks = extra?.unlocks ?? [];
  const objectives = extra?.objectives ?? fallbackObjectives(task.itemObjectives);
  const rewards = buildRewards(task, extra);

  return (
    <section className="mx-auto max-w-[1500px] space-y-[18px]">
      <Button variant="ghost" size="sm" onClick={onBack} type="button" className="border-0 px-0">
        <ArrowLeft className="size-[12px]" strokeWidth={2} />
        tasks
      </Button>

      <div className="border border-border border-l-[3px] border-l-accent bg-surface px-[18px] py-[16px]">
        <h1 className="font-display text-heading font-semibold uppercase tracking-[0.03em] text-fg min-[860px]:text-[18px]">
          {task.name}
        </h1>
        <div className="mt-[9px] flex flex-wrap gap-[6px]">
          <span className="inline-flex items-center gap-[5px] border border-border-strong bg-bg px-[8px] py-[3px] font-mono text-mono text-fg">
            <span className="flex size-[15px] items-center justify-center bg-active font-display text-badge font-bold text-accent">
              {(task.traderName ?? "?")[0]}
            </span>
            {task.traderName ?? "—"}
          </span>
          <Badge variant="level" className="bg-bg text-accent">
            LVL {task.minPlayerLevel}
          </Badge>
          <span className="inline-flex items-center gap-[4px] border border-border-strong bg-bg px-[8px] py-[3px] font-mono text-mono text-muted">
            <MapIcon className="size-[10px]" strokeWidth={2} />
            {extra?.map ?? "Any"}
          </span>
          {extra?.kappa ? <Badge variant="kappa">KAPPA</Badge> : null}
        </div>
      </div>

      <PrerequisiteChain prereqs={prereqs} taskName={task.name} unlocks={unlocks} />

      <div className="grid gap-[12px] min-[860px]:grid-cols-2">
        <Panel title="OBJECTIVES" padded={false}>
          <div className="divide-y divide-border-subtle">
            {objectives.map((objective, index) => (
              <ObjectiveRow key={`${objective.desc}-${index}`} objective={objective} />
            ))}
          </div>
        </Panel>

        <Panel title="REWARDS" padded={false}>
          <div className="divide-y divide-border-subtle px-[12px] py-[6px]">
            {rewards.map((reward) => (
              <div key={reward.label} className="flex items-center gap-[8px] py-[8px]">
                <span
                  className="size-[6px] shrink-0"
                  style={{ backgroundColor: reward.color }}
                  aria-hidden="true"
                />
                <span className="text-name font-semibold text-fg min-[860px]:text-[13px]">
                  {reward.label}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function ObjectiveRow({ objective }: { objective: TaskDetailObjective }) {
  const meta = objTypeMeta[objective.type] ?? { label: objective.type, color: "#8b9184" };

  return (
    <div className="flex items-start gap-[10px] px-[12px] py-[10px]">
      <span className="min-w-[28px] font-mono text-stat font-bold text-accent">
        {objective.count}×
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-name text-fg min-[860px]:text-[13px]">{objective.desc}</div>
        <div className="mt-[5px] flex flex-wrap items-center gap-[6px]">
          <span
            className="border px-[5px] py-[1px] font-mono text-badge uppercase tracking-[0.08em]"
            style={{ borderColor: meta.color, color: meta.color }}
          >
            {meta.label}
          </span>
          {objective.fir ? <Badge variant="fir" /> : null}
        </div>
      </div>
    </div>
  );
}

function PrerequisiteChain({
  prereqs,
  taskName,
  unlocks,
}: {
  prereqs: string[];
  taskName: string;
  unlocks: string[];
}) {
  return (
    <div className="mb-[12px] border border-border bg-surface px-[16px] py-[14px]">
      <div className="mb-[10px] font-display text-[10px] uppercase tracking-[0.15em] text-muted">
        PREREQUISITE CHAIN
      </div>
      <div className="flex items-stretch gap-[8px] overflow-x-auto pb-[4px]">
        {prereqs.length > 0 ? (
          prereqs.map((name) => (
            <div key={name} className="flex flex-none items-center gap-[8px]">
              <div className="min-w-[110px] border border-border-strong bg-[#10130f] px-[11px] py-[9px]">
                <div className="mb-[3px] font-mono text-[8px] uppercase tracking-[0.12em] text-dim">
                  REQUIRES
                </div>
                <div className="text-[12px] font-semibold text-fg-2">{name}</div>
              </div>
              <ArrowRight className="size-[14px] shrink-0 text-dim" strokeWidth={2} />
            </div>
          ))
        ) : (
          <div className="flex flex-none items-center gap-[8px]">
            <div className="flex min-w-[100px] items-center border border-dashed border-border-strong bg-[#10130f] px-[11px] py-[9px]">
              <span className="font-mono text-[10px] text-dim">start of line</span>
            </div>
            <ArrowRight className="size-[14px] shrink-0 text-dim" strokeWidth={2} />
          </div>
        )}

        <div className="min-w-[120px] flex-none border border-accent bg-[#1a1e12] px-[11px] py-[9px]">
          <div className="mb-[3px] font-mono text-[8px] uppercase tracking-[0.12em] text-accent">
            THIS TASK
          </div>
          <div className="text-[12px] font-semibold text-fg">{taskName}</div>
        </div>

        {unlocks.map((name) => (
          <div key={name} className="flex flex-none items-center gap-[8px]">
            <ArrowRight className="size-[14px] shrink-0 text-dim" strokeWidth={2} />
            <div className="min-w-[110px] border border-[#2e4a2b] bg-[#10130f] px-[11px] py-[9px]">
              <div className="mb-[3px] font-mono text-[8px] uppercase tracking-[0.12em] text-[#6ea862]">
                UNLOCKS
              </div>
              <div className="text-[12px] font-semibold text-fg-2">{name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function fallbackObjectives(itemObjectives: TaskObjectiveItem[]): TaskDetailObjective[] {
  return itemObjectives.map((objective) => {
    const namedObjective = objective as TaskObjectiveItem & { name?: string };
    return {
      type: "giveItem",
      desc: `Hand over ${namedObjective.name ?? objective.itemId}`,
      count: objective.count,
      fir: objective.foundInRaid,
    };
  });
}

function buildRewards(task: Task, extra: TaskExtra | undefined) {
  const rewards: Array<{ label: string; color: string }> = [];

  if (!extra) {
    return rewards;
  }

  if (extra.xp) {
    rewards.push({ label: `+${extra.xp.toLocaleString("en-US")} EXP`, color: "#c9a24b" });
  }
  if (extra.repTrader) {
    rewards.push({ label: `${extra.repTrader} ${extra.repAmt}`, color: "#e8b923" });
  }
  if (extra.cash) {
    rewards.push({ label: rub(extra.cash), color: "#6ea862" });
  }
  extra.unlocks.forEach((unlock) => {
    rewards.push({ label: `Unlocks ${unlock}`, color: "#7fa8c9" });
  });

  if (rewards.length === 0) {
    rewards.push({ label: `${task.traderName ?? "Trader"} rewards pending`, color: "#8b9184" });
  }

  return rewards;
}
