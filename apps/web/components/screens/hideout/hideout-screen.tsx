"use client";

import { ChevronRight, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Panel, ScreenHeader } from "@/components/ui";

const defaultOpenId = "generator";

interface HideoutDisplayRequirement {
  itemId?: string;
  short?: string;
  name?: string;
  count: number;
  tier?: string;
}

interface HideoutDisplayLevel {
  level: number;
  itemRequirements: HideoutDisplayRequirement[];
}

interface HideoutDisplayStation {
  id: string;
  name: string;
  levels: HideoutDisplayLevel[];
}

export function HideoutScreen({
  degraded = false,
  stations,
}: {
  degraded?: boolean;
  stations: HideoutDisplayStation[];
}) {
  const [hideoutOpenId, setHideoutOpenId] = useState<string | null>(
    defaultOpenId,
  );
  const stationCount = useMemo(() => String(stations.length), [stations.length]);

  return (
    <section className="max-w-[920px] space-y-[16px]">
      <ScreenHeader
        title="HIDEOUT"
        subtitle="stations"
        right={
          <div className="flex items-center gap-[8px]">
            {degraded ? <Badge variant="sample" /> : null}
            <span className="font-mono text-meta uppercase tracking-[0.08em] text-dim">
              {stationCount} stations
            </span>
          </div>
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
        <span className="bg-accent px-[8px] py-[2px] font-mono text-[11px] font-bold text-bg">
          LVL {level.level}
        </span>
        <span className="font-mono text-[10px] text-dim">
          {level.itemRequirements.length} item requirements
        </span>
      </div>

      {level.itemRequirements.length > 0 ? (
        <div>
          {level.itemRequirements.map((requirement) => (
            <RequirementRow
              key={`${level.level}-${requirement.short}-${requirement.name}`}
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
  requirement,
}: {
  requirement: HideoutDisplayRequirement;
}) {
  const itemCode = requirement.short ?? requirement.itemId ?? "";
  const itemName = requirement.name ?? requirement.itemId ?? "";
  const tierColor = requirement.tier ?? "#b98a3c";

  return (
    <div className="flex items-center gap-[10px] border-b border-[#191e18] px-[12px] py-[6px]">
      <span
        className="flex size-[24px] shrink-0 items-center justify-center border border-l-[2px] border-border-strong bg-bg px-[3px] text-center font-mono text-[7px] font-semibold leading-tight"
        style={{
          borderLeftColor: tierColor,
          color: tierColor,
        }}
      >
        {itemCode}
      </span>
      <span className="min-w-0 flex-1 truncate font-sans text-[12px] text-fg">
        {itemName}
      </span>
      <span className="shrink-0 text-right font-mono text-[12px] font-semibold text-accent">
        ×{requirement.count}
      </span>
    </div>
  );
}
