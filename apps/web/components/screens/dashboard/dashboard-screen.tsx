"use client";

import Link from "next/link";
import { Panel, ScreenHeader, StatTile, TypeTile } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { typeColor } from "@/lib/colors";
import { rub } from "@/lib/format";
import { bestFlea, items, requirements, tasks } from "@/lib/mock";

const neededItemIndexes = [0, 1, 7, 3] as const;

function itemNeedLabel(itemId: string): string {
  const req = requirements[itemId];
  if (!req) return "needed · surplus";

  const taskNeed = req.neededByTasks[0];
  if (taskNeed) return `needed · ${taskNeed.taskName}`;

  const hideoutNeed = req.neededByHideout[0];
  if (hideoutNeed) {
    return `needed · ${hideoutNeed.stationName} L${hideoutNeed.level}`;
  }

  return "needed · surplus";
}

export function DashboardScreen() {
  const { openItem } = useApp();
  const unlockedTasks = tasks
    .filter((task) => task.prerequisiteTaskIds.length === 0)
    .slice(0, 4);
  const neededItems = neededItemIndexes
    .map((index) => items[index])
    .filter((item): item is (typeof items)[number] => Boolean(item));

  return (
    <section className="space-y-[20px]">
      <ScreenHeader title="Dashboard" subtitle="operator overview" />

      <div className="grid grid-cols-1 gap-[12px] min-[860px]:grid-cols-4">
        <StatTile
          label="Items Tracked"
          value={items.length}
          note={<span className="font-mono text-meta">in local database</span>}
        />
        <StatTile
          label="Active Quests"
          value={tasks.length}
          note={
            <span className="font-mono text-meta text-danger">
              {tasks.filter((task) => task.prerequisiteTaskIds.length > 0).length} locked · prereq
            </span>
          }
        />
        <StatTile
          label="Hideout Progress"
          value="32%"
          note={
            <span className="block h-[4px] border border-border bg-bg">
              <span className="block h-full w-[32%] bg-accent" />
            </span>
          }
        />
        <StatTile
          label="Sellable Surplus"
          value={<span className="text-good">{rub(1_897_500)}</span>}
          note={<span className="font-mono text-meta">est. flea value · scan soon</span>}
        />
      </div>

      <div className="grid grid-cols-1 gap-[12px] min-[860px]:grid-cols-2">
        <Panel
          title="Next Quests"
          padded={false}
          right={
            <Link
              className="font-mono text-meta uppercase tracking-[0.08em] text-muted hover:text-accent"
              href="/tasks"
            >
              view all →
            </Link>
          }
        >
          <div>
            {unlockedTasks.map((task) => (
              <div
                className="flex items-center gap-[11px] border-b border-border-subtle px-[12px] py-[9px] last:border-b-0"
                key={task.id}
              >
                <span className="shrink-0 border border-border-strong bg-bg px-[6px] py-[2px] font-mono text-mono font-semibold text-accent">
                  L{task.minPlayerLevel}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-name font-semibold text-fg">{task.name}</div>
                  <div className="font-mono text-meta text-muted">{task.traderName ?? "Unknown"}</div>
                </div>
                <span className="shrink-0 font-mono text-meta text-dim">
                  {task.itemObjectives.length} obj
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Needed Items"
          padded={false}
          right={
            <Link
              className="font-mono text-meta uppercase tracking-[0.08em] text-muted hover:text-accent"
              href="/items"
            >
              view all →
            </Link>
          }
        >
          <div>
            {neededItems.map((item) => {
              const flea = bestFlea(item);
              return (
                <button
                  className="flex w-full items-center gap-[11px] border-b border-border-subtle px-[12px] py-[9px] text-left hover:bg-hover last:border-b-0"
                  key={item.id}
                  onClick={() => openItem(item.id)}
                  type="button"
                >
                  <TypeTile
                    color={typeColor(item.types)}
                    short={item.shortName}
                    size={30}
                    tall={item.height > item.width}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-name font-semibold text-fg">
                      {item.name}
                    </span>
                    <span className="block font-mono text-meta text-muted">
                      {itemNeedLabel(item.id)}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-price font-semibold text-good">
                    {flea ? rub(flea.priceRUB) : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>
    </section>
  );
}
