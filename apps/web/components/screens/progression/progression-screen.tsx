"use client";

import { Check, Lock, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Bar, Button, Panel, ScreenHeader, StatTile } from "@/components/ui";
import { cn } from "@/lib/cn";
import { pct } from "@/lib/format";
import { progStations, tasks } from "@/lib/mock";
import type { ProgStation, Task } from "@/lib/types";

interface ProgressionState {
  pmcLevel: number;
  completed: Record<string, boolean>;
  hideout: Record<string, number>;
}

const INITIAL_PROGRESSION: ProgressionState = {
  pmcLevel: 15,
  completed: { t1: true, t4: true, t7: true },
  hideout: {
    stash: 2,
    generator: 1,
    water: 0,
    medstation: 1,
    workbench: 0,
    intel: 0,
    lavatory: 0,
    bitcoin: 0,
  },
};

export function ProgressionScreen() {
  const [progression, setProgression] = useState<ProgressionState>(INITIAL_PROGRESSION);
  const nameById = useMemo(
    () => Object.fromEntries(tasks.map((task) => [task.id, task.name])),
    [],
  );
  const taskGroups = useMemo(() => groupTasksByTrader(tasks), []);

  const doneCount = Object.values(progression.completed).filter(Boolean).length;
  const questPct = tasks.length ? doneCount / tasks.length : 0;
  const hideoutLevel = progStations.reduce(
    (total, station) => total + (progression.hideout[station.id] ?? 0),
    0,
  );
  const hideoutMax = progStations.reduce((total, station) => total + station.max, 0);
  const hideoutPct = hideoutMax ? hideoutLevel / hideoutMax : 0;

  function setPmc(delta: number) {
    setProgression((current) => ({
      ...current,
      pmcLevel: Math.max(1, Math.min(79, current.pmcLevel + delta)),
    }));
  }

  function toggleTask(task: Task) {
    setProgression((current) => {
      const done = Boolean(current.completed[task.id]);
      const locked = task.prerequisiteTaskIds.some((id) => !current.completed[id]);
      if (locked && !done) return current;

      return {
        ...current,
        completed: {
          ...current.completed,
          [task.id]: !done,
        },
      };
    });
  }

  function setStationLevel(station: ProgStation, level: number) {
    setProgression((current) => {
      const currentLevel = current.hideout[station.id] ?? 0;
      return {
        ...current,
        hideout: {
          ...current.hideout,
          [station.id]: level === currentLevel ? level - 1 : level,
        },
      };
    });
  }

  return (
    <div className="mx-auto max-w-[1650px] space-y-[16px]">
      <ScreenHeader
        title="PROGRESSION"
        subtitle="operator"
        right={<Badge variant="soon">LOCAL PREVIEW</Badge>}
      />

      <p className="font-name text-[13px] text-muted max-w-[640px] mb-[16px]">
        Track PMC level, completed quests and hideout station levels. Edits below
        are live and held in-memory for this session — a signed-in account store
        (Slice 2) will persist and sync them across devices. Quests whose
        prerequisites aren&rsquo;t complete stay locked.
      </p>

      <div className="grid gap-[12px] min-[860px]:grid-cols-3">
        <Panel title="PMC Level">
          <div className="flex items-center gap-[10px]">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setPmc(-1)}
              aria-label="Decrease PMC level"
            >
              <Minus className="size-[14px]" />
            </Button>
            <div className="flex-1 text-center font-mono text-[26px] font-bold leading-none text-accent">
              {progression.pmcLevel}
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setPmc(1)}
              aria-label="Increase PMC level"
            >
              <Plus className="size-[14px]" />
            </Button>
          </div>
        </Panel>

        <StatTile
          label="Quests Complete"
          value={
            <>
              {doneCount}
              <span className="text-dim"> / {tasks.length}</span>
            </>
          }
          note={<Bar pct={pct(questPct)} color="#6ea862" />}
        />

        <StatTile
          label="Hideout Modules"
          value={
            <>
              {hideoutLevel}
              <span className="text-dim"> / {hideoutMax}</span>
            </>
          }
          accent
          note={<Bar pct={pct(hideoutPct)} color="var(--accent)" />}
        />
      </div>

      <div className="grid items-start gap-[12px] min-[860px]:grid-cols-2">
        <Panel title="Quest Checklist" padded={false}>
          <div>
            {taskGroups.map((group) => (
              <section key={group.trader}>
                <div className="border-b border-border-subtle bg-surface-2 px-[15px] py-[7px] font-display text-label uppercase tracking-[0.18em] text-dim">
                  {group.trader}
                </div>
                {group.tasks.map((task) => {
                  const done = Boolean(progression.completed[task.id]);
                  const locked = task.prerequisiteTaskIds.some(
                    (id) => !progression.completed[id],
                  );
                  const prereq = task.prerequisiteTaskIds
                    .map((id) => nameById[id] ?? id)
                    .join(", ");

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggleTask(task)}
                      disabled={locked && !done}
                      className={cn(
                        "flex w-full items-center gap-[10px] border-b border-border-subtle px-[15px] py-[9px] text-left transition-colors",
                        locked ? "cursor-default opacity-55" : "hover:bg-hover",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-[16px] shrink-0 items-center justify-center border",
                          done && "border-good bg-good text-bg",
                          !done && locked && "border-border-strong bg-transparent text-dim",
                          !done && !locked && "border-dim bg-transparent text-dim",
                        )}
                      >
                        {done ? (
                          <Check className="size-[11px]" strokeWidth={3} />
                        ) : locked ? (
                          <Lock className="size-[9px]" strokeWidth={2.2} />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-name font-semibold",
                            done || locked ? "text-dim line-through" : "text-fg",
                            locked && !done && "no-underline",
                          )}
                        >
                          {task.name}
                        </span>
                        {locked ? (
                          <span className="mt-[2px] block truncate font-mono text-meta text-dim">
                            requires {prereq}
                          </span>
                        ) : null}
                      </span>
                      <span className="font-mono text-[9px] text-dim shrink-0">
                        L{task.minPlayerLevel}
                      </span>
                    </button>
                  );
                })}
              </section>
            ))}
          </div>
        </Panel>

        <Panel title="Hideout Stations" padded={false}>
          <div className="divide-y divide-border-subtle">
            {progStations.map((station) => {
              const currentLevel = progression.hideout[station.id] ?? 0;
              return (
                <div
                  key={station.id}
                  className="flex items-center gap-[10px] px-[15px] py-[9px]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-name font-semibold text-fg">
                      {station.name}
                    </div>
                    <div className="mt-[2px] font-mono text-meta text-dim">
                      level {currentLevel} / {station.max}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-[4px]">
                    {Array.from({ length: station.max }, (_, index) => {
                      const level = index + 1;
                      const on = level <= currentLevel;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setStationLevel(station, level)}
                          className={cn(
                            "h-[18px] w-[20px] border border-border-strong transition-colors",
                            on ? "bg-accent" : "bg-active-2 hover:border-accent",
                          )}
                          aria-label={`Set ${station.name} level ${level}`}
                          aria-pressed={on}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function groupTasksByTrader(taskList: Task[]) {
  const traderNames = Array.from(
    new Set(taskList.map((task) => task.traderName ?? "Unknown")),
  );
  return traderNames.map((trader) => ({
    trader,
    tasks: taskList.filter((task) => (task.traderName ?? "Unknown") === trader),
  }));
}
