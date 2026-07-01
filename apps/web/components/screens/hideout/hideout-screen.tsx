"use client";

import { ChevronRight, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Panel, ScreenHeader, TypeTile } from "@/components/ui";
import { hideout } from "@/lib/mock";
import type { HideoutReqRow } from "@/lib/types";

const defaultOpenId = "generator";

interface HideoutDisplayLevel {
  level: number;
  itemRequirements: HideoutReqRow[];
}

interface HideoutDisplayStation {
  id: string;
  name: string;
  levels: HideoutDisplayLevel[];
}

const stations = hideout as unknown as HideoutDisplayStation[];

export function HideoutScreen() {
  const [hideoutOpenId, setHideoutOpenId] = useState<string | null>(
    defaultOpenId,
  );
  const stationCount = useMemo(() => String(stations.length), []);

  return (
    <section className="max-w-[920px] space-y-[16px]">
      <ScreenHeader
        title="HIDEOUT"
        subtitle="stations"
        right={
          <span className="font-mono text-meta uppercase tracking-[0.08em] text-dim">
            {stationCount} stations
          </span>
        }
      />

      <div className="space-y-[8px]">
        {stations.map((station) => {
          const open = hideoutOpenId === station.id;

          return (
            <Panel key={station.id} padded={false} className="overflow-hidden">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setHideoutOpenId(open ? null : station.id)}
                className={[
                  "flex w-full items-center gap-[12px] px-[15px] py-[11px] text-left transition-colors hover:bg-hover",
                  open ? "bg-hover" : "bg-transparent",
                ].join(" ")}
              >
                <Warehouse
                  className="size-[17px] shrink-0 text-accent"
                  strokeWidth={1.9}
                />
                <span className="min-w-0 flex-1 truncate font-display text-heading font-semibold uppercase tracking-[0.06em] text-fg">
                  {station.name}
                </span>
                <span className="shrink-0 font-mono text-body text-muted">
                  {station.levels.length} levels
                </span>
                <ChevronRight
                  className={[
                    "size-[15px] shrink-0 text-dim transition-transform",
                    open ? "rotate-90" : "rotate-0",
                  ].join(" ")}
                  strokeWidth={2}
                />
              </button>

              {open ? (
                <div className="space-y-[8px] px-[15px] pb-[12px] pt-[2px]">
                  {station.levels.map((level) => (
                    <LevelGroup
                      key={`${station.id}-${level.level}`}
                      level={level}
                    />
                  ))}
                </div>
              ) : null}
            </Panel>
          );
        })}
      </div>
    </section>
  );
}

function LevelGroup({ level }: { level: HideoutDisplayLevel }) {
  return (
    <div className="border border-border bg-surface-2">
      <div className="flex items-center gap-[8px] border-b border-border-subtle px-[12px] py-[7px]">
        <span className="bg-accent px-[8px] py-[2px] font-mono text-badge font-bold uppercase text-accent-ink">
          LEVEL {level.level}
        </span>
        <span className="font-mono text-meta text-dim">
          {level.itemRequirements.length} item requirements
        </span>
      </div>

      {level.itemRequirements.length > 0 ? (
        <div className="divide-y divide-border-subtle">
          {level.itemRequirements.map((requirement) => (
            <RequirementRow
              key={`${level.level}-${requirement.short}-${requirement.name}`}
              level={level.level}
              requirement={requirement}
            />
          ))}
        </div>
      ) : (
        <div className="px-[12px] py-[8px] font-mono text-meta text-dim">
          — none
        </div>
      )}
    </div>
  );
}

function RequirementRow({
  level,
  requirement,
}: {
  level: number;
  requirement: HideoutReqRow;
}) {
  return (
    <div className="flex items-center gap-[10px] px-[12px] py-[7px]">
      <span className="w-[44px] shrink-0 font-mono text-mono font-semibold text-accent">
        {requirement.count}×
      </span>
      <TypeTile
        short={requirement.short}
        color={requirement.tier}
        size={32}
        className="text-[9px]"
      />
      <span className="min-w-0 flex-1 truncate font-sans text-name text-fg">
        {requirement.name}
      </span>
      <Badge variant="level">LVL {level}</Badge>
    </div>
  );
}
