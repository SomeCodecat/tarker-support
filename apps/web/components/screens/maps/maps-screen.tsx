"use client";

import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Panel, ScreenHeader, StatTile } from "@/components/ui";
import { cn } from "@/lib/cn";
import { maps } from "@/lib/mock";
import type { MapExtract } from "@/lib/types";

const DEFAULT_MAP_ID = "customs";

export function MapsScreen() {
  const [mapId, setMapId] = useState(DEFAULT_MAP_ID);
  const detail = useMemo(
    () => maps.find((map) => map.id === mapId) ?? maps[0],
    [mapId],
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-[16px]">
      <ScreenHeader title="MAPS" subtitle="locations" />

      <div className="grid grid-cols-1 items-start gap-[12px] min-[860px]:grid-cols-[230px_1fr]">
        <Panel padded={false}>
          <div className="divide-y divide-border-subtle">
            {maps.map((map) => {
              const active = map.id === detail.id;
              return (
                <button
                  key={map.id}
                  type="button"
                  onClick={() => setMapId(map.id)}
                  className={cn(
                    "flex w-full items-center gap-[10px] border-l-[3px] px-[12px] py-[10px] text-left transition-colors hover:bg-hover",
                    active
                      ? "border-l-accent bg-active text-fg"
                      : "border-l-transparent bg-transparent text-fg-2",
                  )}
                  aria-pressed={active}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-name font-semibold">
                      {map.name}
                    </span>
                    <span className="mt-[2px] block font-mono text-meta text-muted">
                      {map.duration}
                    </span>
                  </span>
                  <span className="font-mono text-meta text-dim">{map.quests} q</span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel padded={false}>
          <div className="border-b border-border px-[18px] py-[16px]">
            <h2 className="font-display text-heading font-semibold uppercase tracking-[0.08em] text-fg">
              {detail.name}
            </h2>
            <div className="mt-[12px] grid grid-cols-2 gap-[8px] lg:grid-cols-4">
              <StatTile label="Players" value={detail.players} />
              <StatTile label="Raid" value={detail.duration} />
              <StatTile label="Quests" value={detail.quests} accent />
              <StatTile
                label="Extracts"
                value={detail.extracts.map(() => "·").join("")}
              />
            </div>
          </div>

          <div className="space-y-[14px] p-[18px]">
            <section>
              <div className="mb-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
                Extracts
              </div>
              <div className="space-y-[6px]">
                {detail.extracts.map((extract) => (
                  <ExtractRow key={`${extract.side}-${extract.name}`} extract={extract} />
                ))}
              </div>
            </section>

            <div className="grid gap-[8px] lg:grid-cols-2">
              <section className="border border-border bg-surface-2 px-[12px] py-[11px]">
                <div className="mb-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
                  Bosses
                </div>
                <div className="space-y-[7px]">
                  {detail.bosses.map((boss) => (
                    <div
                      key={boss.name}
                      className="flex items-center justify-between gap-[12px]"
                    >
                      <span className="truncate text-name font-semibold text-fg">
                        {boss.name}
                      </span>
                      <span className="font-mono text-mono font-semibold text-danger">
                        {boss.chance}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-border bg-surface-2 px-[12px] py-[11px]">
                <div className="mb-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
                  Hot Zones
                </div>
                <p className="text-body text-fg-2">{detail.hot}</p>
              </section>
            </div>

            <div className="mt-[14px] flex items-center gap-[8px] border border-[#3a3115] bg-[#1a1710] px-[12px] py-[8px] font-mono text-[10px]">
              <Info className="shrink-0 text-accent" size={14} />
              <span className="text-[#c9a24b]">
                GAP FLAG — no Map type in slice1 types.ts. tarkov.dev exposes
                a maps query (name, players, extracts, bosses, spawns); extract
                requirements & boss chances shown are mocked to that shape.
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ExtractRow({ extract }: { extract: MapExtract }) {
  return (
    <div className="flex items-center gap-[10px] border border-border bg-surface-2 px-[10px] py-[8px]">
      <span
        className={cn(
          "size-[7px] shrink-0",
          extract.reliable ? "bg-good" : "bg-warn",
        )}
        aria-label={extract.reliable ? "reliable" : "conditional"}
      />
      <span className="min-w-0 flex-1 truncate text-name font-semibold text-fg">
        {extract.name}
      </span>
      <span className="hidden font-mono text-meta text-dim sm:inline">
        {extract.req}
      </span>
      <Badge
        variant="level"
        className={cn(
          "min-w-[46px] justify-center",
          extract.side === "PMC" && "text-info",
          extract.side === "Scav" && "text-gold-2",
          extract.side === "Shared" && "text-muted",
        )}
      >
        {extract.side}
      </Badge>
    </div>
  );
}
