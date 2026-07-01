"use client";

import { X } from "lucide-react";
import { Badge, Button, Drawer, Money, StatTile, TypeTile } from "@/components/ui";
import { typeColor } from "@/lib/colors";
import { useApp } from "@/lib/app-context";
import { rub } from "@/lib/format";
import { bestSellVenue, items, requirements } from "@/lib/mock";

export function ItemDetailDrawer() {
  const { selectedItemId, closeItem } = useApp();
  const item = items.find((candidate) => candidate.id === selectedItemId) ?? null;
  const req = item ? requirements[item.id] : null;
  const best = item ? bestSellVenue(item) : null;

  return (
    <Drawer
      header={
        item ? (
          <div className="flex items-start gap-[14px] p-[18px]">
            <TypeTile
              className="text-[12px]"
              color={typeColor(item.types)}
              short={item.shortName}
              size={64}
              tall={item.height > 1}
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-heading font-semibold uppercase tracking-[0.03em] text-fg">
                {item.name}
              </h2>
              <div className="mt-[3px] truncate font-mono text-meta text-dim">{item.id}</div>
              <div className="mt-[8px] flex flex-wrap gap-[5px]">
                {item.types.map((type) => (
                  <span
                    key={type}
                    className="border border-border-strong px-[6px] py-[2px] font-mono text-tag uppercase tracking-[0.05em]"
                    style={{ color: typeColor([type]) }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <Button aria-label="Close item detail" onClick={closeItem} size="icon" type="button">
              <X className="size-[15px]" />
            </Button>
          </div>
        ) : (
          <div />
        )
      }
      onClose={closeItem}
      open={Boolean(item)}
    >
      {item ? (
        <div className="space-y-[18px]">
          <div className="grid grid-cols-2 gap-[8px]">
            <StatTile label="Grid Size" value={`${item.width}×${item.height}`} />
            <StatTile label="Base Price" value={rub(item.basePrice)} />
          </div>

          <DetailSection title="Needed By · Quests">
            {req && req.neededByTasks.length > 0 ? (
              req.neededByTasks.map((task) => (
                <div
                  key={`${task.taskName}-${task.count}`}
                  className="mb-[6px] flex items-center gap-[10px] border border-border border-l-[3px] border-l-accent bg-surface-2 px-[10px] py-[8px]"
                >
                  <span className="min-w-[30px] font-mono text-mono font-semibold text-accent">
                    {task.count}×
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-name font-semibold text-fg">{task.taskName}</div>
                    <div className="font-mono text-meta text-dim">
                      min level {task.minPlayerLevel}
                    </div>
                  </div>
                  {task.foundInRaid ? <Badge variant="fir" /> : null}
                </div>
              ))
            ) : (
              <None />
            )}
          </DetailSection>

          <DetailSection title="Needed By · Hideout">
            {req && req.neededByHideout.length > 0 ? (
              req.neededByHideout.map((need) => (
                <div
                  key={`${need.stationName}-${need.level}`}
                  className="mb-[6px] flex items-center gap-[10px] border border-border border-l-[3px] border-l-hideout bg-surface-2 px-[10px] py-[8px]"
                >
                  <span className="min-w-[30px] font-mono text-mono font-semibold text-accent">
                    {need.count}×
                  </span>
                  <div className="min-w-0 flex-1 truncate text-name font-semibold text-fg">
                    {need.stationName}
                  </div>
                  <Badge variant="level">LVL {need.level}</Badge>
                </div>
              ))
            ) : (
              <None />
            )}
          </DetailSection>

          <DetailSection title="Sell For">
            {item.sellFor
              .toSorted((a, b) => b.priceRUB - a.priceRUB)
              .map((venue) => {
                const isBest = venue === best;
                return (
                  <div
                    key={venue.source}
                    className={isBest
                      ? "mb-[5px] flex items-center justify-between border border-good-border bg-good-bg px-[11px] py-[8px]"
                      : "mb-[5px] flex items-center justify-between border border-border bg-surface-2 px-[11px] py-[8px]"}
                  >
                    <div className="flex items-center gap-[8px]">
                      <span className="text-name font-semibold text-fg">{venue.source}</span>
                      {isBest ? <Badge variant="best" /> : null}
                    </div>
                    <Money value={venue.priceRUB} tone={isBest ? "good" : "default"} />
                  </div>
                );
              })}
          </DetailSection>
        </div>
      ) : null}
    </Drawer>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function None() {
  return <div className="font-mono text-mono text-dim">- none</div>;
}
