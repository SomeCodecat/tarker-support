"use client";

import { useMemo, useState } from "react";
import { EmptyState, FilterChip, Money, ScreenHeader, SortArrow, TypeTile } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { typeColor } from "@/lib/colors";
import { rub } from "@/lib/format";
import { bestFlea, bestTrader, items } from "@/lib/mock";
import { cn } from "@/lib/cn";
import type { Item } from "@tarker/data";

type ItemFilter = "all" | "barter" | "medical" | "keys" | "mods";
type SortKey = "name" | "base" | "trader" | "flea";
type SortDir = 1 | -1;

interface SortState {
  key: SortKey;
  dir: SortDir;
}

const filters: ItemFilter[] = ["all", "barter", "medical", "keys", "mods"];

function sortArrow(sort: SortState, key: SortKey): "asc" | "desc" | undefined {
  if (sort.key !== key) return undefined;
  return sort.dir > 0 ? "asc" : "desc";
}

function nextSort(current: SortState, key: SortKey): SortState {
  if (current.key === key) return { key, dir: current.dir === 1 ? -1 : 1 };
  return { key, dir: key === "name" ? 1 : -1 };
}

function sortValue(item: Item, key: SortKey): string | number {
  if (key === "name") return item.name.toLowerCase();
  if (key === "base") return item.basePrice;
  if (key === "trader") return bestTrader(item)?.priceRUB ?? 0;
  return bestFlea(item)?.priceRUB ?? 0;
}

function compareItems(a: Item, b: Item, sort: SortState): number {
  const av = sortValue(a, sort.key);
  const bv = sortValue(b, sort.key);

  if (typeof av === "string" && typeof bv === "string") {
    return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
  }

  return ((av as number) - (bv as number)) * sort.dir;
}

function itemMatchesFilter(item: Item, filter: ItemFilter, search: string): boolean {
  if (filter !== "all" && !item.types.includes(filter)) return false;
  if (!search) return true;

  const q = search.toLowerCase();
  return item.name.toLowerCase().includes(q) || item.shortName.toLowerCase().includes(q);
}

function fleaIsBest(item: Item): boolean {
  const trader = bestTrader(item);
  const flea = bestFlea(item);
  return Boolean(flea && (!trader || flea.priceRUB >= trader.priceRUB));
}

function SortButton({
  children,
  sort,
  sortKey,
  onSort,
  align = "left",
}: {
  children: React.ReactNode;
  sort: SortState;
  sortKey: SortKey;
  onSort(key: SortKey): void;
  align?: "left" | "right";
}) {
  return (
    <button
      className={cn(
        "font-display text-label uppercase tracking-[0.18em] text-muted hover:text-accent",
        align === "right" && "w-full text-right",
      )}
      onClick={() => onSort(sortKey)}
      type="button"
    >
      {children}
      <SortArrow dir={sortArrow(sort, sortKey)} />
    </button>
  );
}

function ItemTableRow({ item, index, onOpen }: { item: Item; index: number; onOpen(id: string): void }) {
  const color = typeColor(item.types);
  const trader = bestTrader(item);
  const flea = bestFlea(item);
  const fleaBest = fleaIsBest(item);

  return (
    <tr
      className={cn(
        "cursor-pointer border-l-[3px] hover:bg-active-2",
        index % 2 === 0 ? "bg-surface" : "bg-elevated",
      )}
      onClick={() => onOpen(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          if (event.key === " ") event.preventDefault();
          onOpen(item.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={item.name}
      style={{ borderLeftColor: color }}
    >
      <td className="w-[52px]">
        <TypeTile
          color={color}
          short={item.shortName}
          size={28}
          tall={item.height > item.width}
        />
      </td>
      <td className="min-w-[220px]">
        <div className="truncate text-name font-semibold text-fg">{item.name}</div>
        <div className="font-mono text-meta text-dim">{item.shortName}</div>
      </td>
      <td>
        <span
          className="font-mono text-meta uppercase tracking-[0.05em]"
          style={{ color }}
        >
          {item.types[0]}
        </span>
      </td>
      <td className="font-mono text-mono text-muted">
        {item.width}×{item.height}
      </td>
      <td className="text-right">
        <Money value={item.basePrice} tone="muted" />
      </td>
      <td className="text-right">
        {trader ? (
          <Money value={trader.priceRUB} tone={fleaBest ? "muted" : "default"} />
        ) : (
          <span className="font-mono text-price text-muted">—</span>
        )}
      </td>
      <td className="text-right">
        {flea ? (
          <Money value={flea.priceRUB} tone={fleaBest ? "good" : "muted"} />
        ) : (
          <span className="font-mono text-price text-muted">—</span>
        )}
      </td>
    </tr>
  );
}

function ItemCard({ item, onOpen }: { item: Item; onOpen(id: string): void }) {
  const color = typeColor(item.types);
  const flea = bestFlea(item);
  const fleaBest = fleaIsBest(item);

  return (
    <button
      className="flex w-full items-center gap-[9px] border border-border border-l-[3px] bg-surface p-[10px] text-left hover:bg-hover"
      onClick={() => onOpen(item.id)}
      style={{ borderLeftColor: color }}
      type="button"
    >
      <TypeTile
        color={color}
        short={item.shortName}
        size={32}
        tall={item.height > item.width}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-name font-semibold text-fg">{item.name}</span>
        <span className="mt-[2px] flex flex-wrap items-center gap-[8px]">
          <span
            className="font-mono text-meta uppercase tracking-[0.05em]"
            style={{ color }}
          >
            {item.types[0]}
          </span>
          <span className="font-mono text-meta text-dim">
            {item.width}×{item.height}
          </span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className={cn("block font-mono text-price font-semibold", fleaBest ? "text-good" : "text-muted")}>
          {flea ? rub(flea.priceRUB) : "—"}
        </span>
        <span className="block font-mono text-meta uppercase tracking-[0.08em] text-dim">flea</span>
      </span>
    </button>
  );
}

export function ItemsScreen() {
  const { openItem, search } = useApp();
  const [filter, setFilter] = useState<ItemFilter>("all");
  const [sort, setSort] = useState<SortState>({ key: "name", dir: 1 });

  const rows = useMemo(
    () =>
      items
        .filter((item) => itemMatchesFilter(item, filter, search.trim()))
        .toSorted((a, b) => compareItems(a, b, sort)),
    [filter, search, sort],
  );

  const onSort = (key: SortKey) => setSort((current) => nextSort(current, key));

  return (
    <section className="space-y-[16px]">
      <ScreenHeader
        right={
          <div className="font-mono text-meta uppercase tracking-[0.08em] text-dim">
            {rows.length} results
          </div>
        }
        subtitle="database"
        title="Items"
      />

      <div className="flex flex-wrap gap-[6px]">
        {filters.map((entry) => (
          <FilterChip
            active={filter === entry}
            key={entry}
            onClick={() => setFilter(entry)}
          >
            {entry === "all" ? "ALL" : entry}
          </FilterChip>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          hint="Nothing matches your search and filter. Clear the search box or switch the type filter to ALL."
          label="No items found"
        />
      ) : (
        <>
          <div className="hidden border border-border bg-surface min-[860px]:block">
            <table className="w-full border-collapse text-body text-fg">
              <thead className="bg-surface-2">
                <tr className="[&_th]:border-b [&_th]:border-border-strong [&_th]:px-[10px] [&_th]:py-[8px]">
                  <th aria-label="item glyph" className="w-[52px]" />
                  <th className="text-left">
                    <SortButton onSort={onSort} sort={sort} sortKey="name">
                      Item
                    </SortButton>
                  </th>
                  <th className="text-left">
                    <span className="font-display text-label uppercase tracking-[0.18em] text-muted">
                      Type
                    </span>
                  </th>
                  <th className="text-left">
                    <span className="font-display text-label uppercase tracking-[0.18em] text-muted">
                      Size
                    </span>
                  </th>
                  <th className="text-right">
                    <SortButton align="right" onSort={onSort} sort={sort} sortKey="base">
                      Base
                    </SortButton>
                  </th>
                  <th className="text-right">
                    <SortButton align="right" onSort={onSort} sort={sort} sortKey="trader">
                      Trader
                    </SortButton>
                  </th>
                  <th className="text-right">
                    <SortButton align="right" onSort={onSort} sort={sort} sortKey="flea">
                      Flea
                    </SortButton>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_td]:border-b [&_td]:border-border-subtle [&_td]:px-[10px] [&_td]:py-[8px]">
                {rows.map((item, index) => (
                  <ItemTableRow
                    index={index}
                    item={item}
                    key={item.id}
                    onOpen={openItem}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-[6px] min-[860px]:hidden">
            {rows.map((item) => (
              <ItemCard item={item} key={item.id} onOpen={openItem} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
