"use client";

import Link from "next/link";
import { Badge, Panel, ScreenHeader, StatTile, TypeTile } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { typeColor } from "@/lib/colors";
import type { DashboardView } from "@/lib/data/dashboard";
import { rub } from "@/lib/format";

export function DashboardScreen({
  degraded = false,
  view,
}: {
  degraded?: boolean;
  view: DashboardView;
}) {
  const { openItem } = useApp();

  return (
    <section className="space-y-[20px]">
      <ScreenHeader
        title="Dashboard"
        subtitle="operator overview"
        right={degraded ? <Badge variant="sample" /> : undefined}
      />

      <div className="grid grid-cols-1 gap-[12px] min-[860px]:grid-cols-4">
        <StatTile
          label="Items Tracked"
          value={view.itemsCount}
          note={<span className="font-mono text-meta">in local database</span>}
        />
        <StatTile
          label="Active Quests"
          value={view.activeQuestCount}
          note={
            <span className="font-mono text-meta text-danger">
              {view.lockedQuestCount} locked · prereq
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
            {view.nextQuests.map((quest) => (
              <div
                className="flex items-center gap-[11px] border-b border-border-subtle px-[12px] py-[9px] last:border-b-0"
                key={quest.id}
              >
                <span className="shrink-0 border border-border-strong bg-bg px-[6px] py-[2px] font-mono text-mono font-semibold text-accent">
                  L{quest.minPlayerLevel}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-name font-semibold text-fg">{quest.name}</div>
                  <div className="font-mono text-meta text-muted">{quest.traderName ?? "Unknown"}</div>
                </div>
                <span className="shrink-0 font-mono text-meta text-dim">
                  {quest.objectiveCount} obj
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
            {view.neededItems.map((item) => (
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
                  tall={item.tall}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-name font-semibold text-fg">
                    {item.name}
                  </span>
                  <span className="block font-mono text-meta text-muted">{item.label}</span>
                </span>
                <span className="shrink-0 font-mono text-price font-semibold text-good">
                  {item.fleaPriceRUB !== null ? rub(item.fleaPriceRUB) : "—"}
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}
