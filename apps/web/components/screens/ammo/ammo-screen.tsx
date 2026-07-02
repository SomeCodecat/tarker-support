"use client";

import { Check, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Badge,
  Bar,
  EmptyState,
  FilterChip,
  PenBar,
  ScreenHeader,
  ViewToggle,
} from "@/components/ui";
import { penClass, penColor } from "@/lib/colors";
import type { AmmoRound } from "@/lib/types";
import { AmmoDetailDrawer } from "./ammo-detail-drawer";
import {
  DEFAULT_AMMO_SORT,
  ammoCalibers,
  armorClassCells,
  damageLabel,
  filterAmmo,
  indexedAmmo,
  nextAmmoSort,
  percent,
  rowTone,
  shortCaliber,
  sortAmmo,
  sortArrow,
  totalDamage,
  type AmmoSort,
  type AmmoSortKey,
  type AmmoView,
  type IndexedAmmoRound,
} from "./ammo-helpers";

const SORT_HEADERS: Array<{ key: AmmoSortKey; label: string; align?: "right" }> = [
  { key: "damage", label: "DMG", align: "right" },
  { key: "penetrationPower", label: "PEN", align: "right" },
  { key: "penetrationChance", label: "PEN%", align: "right" },
  { key: "armorDamage", label: "ARMOR", align: "right" },
  { key: "fragmentationChance", label: "FRAG", align: "right" },
  { key: "ricochetChance", label: "RICO", align: "right" },
  { key: "initialSpeed", label: "VELOCITY", align: "right" },
];

const PEN_TIERS = [
  { label: "<25", color: "#c15b4e" },
  { label: "25-34", color: "#e0913c" },
  { label: "35-44", color: "#e8c53f" },
  { label: "45-59", color: "#9ccb4f" },
  { label: "60+", color: "#6ea862" },
] as const;

export function AmmoScreen({ degraded = false, ammo }: { degraded?: boolean; ammo: AmmoRound[] }) {
  const [caliber, setCaliber] = useState("all");
  const [view, setView] = useState<AmmoView>("table");
  const [sort, setSort] = useState<AmmoSort>(DEFAULT_AMMO_SORT);
  const [selectedAmmo, setSelectedAmmo] = useState<number | null>(null);

  const indexedRounds = useMemo(() => indexedAmmo(ammo), [ammo]);
  const calibers = useMemo(() => ammoCalibers(ammo), [ammo]);
  const filteredRounds = useMemo(
    () => filterAmmo(indexedRounds, caliber),
    [caliber, indexedRounds],
  );
  const sortedRows = useMemo(
    () => sortAmmo(filteredRounds, sort),
    [filteredRounds, sort],
  );
  const compareRows = useMemo(
    () =>
      filteredRounds
        .slice()
        .sort((a, b) => b.penetrationPower - a.penetrationPower),
    [filteredRounds],
  );
  const maxDamage = useMemo(
    () => Math.max(...ammo.map((round) => totalDamage(round))),
    [ammo],
  );
  const selectedRound = selectedAmmo === null ? null : ammo[selectedAmmo] ?? null;

  const toggleRound = (index: number) => {
    setSelectedAmmo((current) => (current === index ? null : index));
  };

  return (
    <>
      <section className="min-[860px]:min-w-[867px] space-y-[12px]">
        <ScreenHeader
          title="AMMO"
          subtitle="ballistics"
          right={
            <div className="flex items-center gap-[8px]">
              {degraded ? <Badge variant="sample" /> : null}
              <div className="font-mono text-mono uppercase tracking-[0.08em] text-dim">
                {filteredRounds.length} rounds
              </div>
            </div>
          }
        />

        <div className="flex flex-wrap gap-[6px]">
          {calibers.map((cal) => (
            <FilterChip
              active={caliber === cal}
              key={cal}
              onClick={() => setCaliber(cal)}
              type="button"
            >
              {cal === "all" ? "ALL" : cal}
            </FilterChip>
          ))}
        </div>

        <ViewToggle<AmmoView>
          value={view}
          onChange={setView}
          options={[
            { value: "table", label: "TABLE" },
            { value: "compare", label: "COMPARE" },
          ]}
        />

        <PenTierLegend />

        {filteredRounds.length === 0 ? (
          <EmptyState
            label="NO ROUNDS IN CALIBER"
            hint="Reset the caliber filter to ALL to see every round."
          />
        ) : view === "table" ? (
          <AmmoTable
            rows={sortedRows}
            selectedAmmo={selectedAmmo}
            sort={sort}
            onSort={(key) => setSort((current) => nextAmmoSort(current, key))}
            onToggleRound={toggleRound}
          />
        ) : (
          <AmmoCompare
            maxDamage={maxDamage}
            rows={compareRows}
            selectedAmmo={selectedAmmo}
            onToggleRound={toggleRound}
          />
        )}

        <AmmoDataSourceBanner />
      </section>

      <AmmoDetailDrawer
        open={selectedRound !== null}
        round={selectedRound}
        onClose={() => setSelectedAmmo(null)}
      />
    </>
  );
}

function PenTierLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[6px] font-mono text-meta text-muted">
      <span className="uppercase">PEN TIER</span>
      {PEN_TIERS.map((tier) => (
        <span className="inline-flex items-center gap-[5px]" key={tier.label}>
          <span className="h-[9px] w-[9px]" style={{ backgroundColor: tier.color }} />
          {tier.label}
        </span>
      ))}
    </div>
  );
}

interface AmmoTableProps {
  rows: IndexedAmmoRound[];
  selectedAmmo: number | null;
  sort: AmmoSort;
  onSort(key: AmmoSortKey): void;
  onToggleRound(index: number): void;
}

function AmmoTable({ rows, selectedAmmo, sort, onSort, onToggleRound }: AmmoTableProps) {
  return (
    <>
      <div className="hidden border border-border bg-surface min-[860px]:block">
        <div className="grid grid-cols-[58px_minmax(180px,1fr)_72px_126px_82px_86px_78px_78px_92px_28px] items-center border-b border-border-strong bg-surface-2">
          <div className="px-[8px] py-[8px]" />
          <HeaderCell>ROUND</HeaderCell>
          {SORT_HEADERS.map((header) => (
            <SortHeader
              key={header.key}
              label={header.label}
              arrow={sortArrow(sort, header.key)}
              onClick={() => onSort(header.key)}
            />
          ))}
          <div className="px-[4px] py-[8px]" />
        </div>
        {rows.map((round, rowIndex) => (
          <AmmoTableRow
            active={selectedAmmo === round.index}
            key={`${round.caliber}-${round.name}`}
            round={round}
            rowIndex={rowIndex}
            onToggleRound={onToggleRound}
          />
        ))}
      </div>

      <div className="flex flex-col gap-[6px] min-[860px]:hidden">
        {rows.map((round) => (
          <AmmoCard
            active={selectedAmmo === round.index}
            key={`${round.caliber}-${round.name}`}
            round={round}
            onToggleRound={onToggleRound}
          />
        ))}
      </div>
    </>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-[8px] py-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
      {children}
    </div>
  );
}

function SortHeader({
  label,
  arrow,
  onClick,
}: {
  label: string;
  arrow: string;
  onClick(): void;
}) {
  return (
    <button
      className="px-[8px] py-[8px] text-right font-display text-label uppercase tracking-[0.18em] text-muted transition-colors hover:text-fg"
      onClick={onClick}
      type="button"
    >
      {label} <span className="text-accent">{arrow}</span>
    </button>
  );
}

function AmmoTableRow({
  active,
  round,
  rowIndex,
  onToggleRound,
}: {
  active: boolean;
  round: IndexedAmmoRound;
  rowIndex: number;
  onToggleRound(index: number): void;
}) {
  const tierColor = penColor(round.penetrationPower);

  return (
    <button
      className={`grid w-full grid-cols-[58px_minmax(180px,1fr)_72px_126px_82px_86px_78px_78px_92px_28px] items-center border-b border-border-subtle border-l-[3px] text-left transition-colors hover:bg-hover ${
        active ? "bg-active-2" : rowTone(rowIndex)
      }`}
      onClick={() => onToggleRound(round.index)}
      style={{ borderLeftColor: tierColor }}
      type="button"
    >
      <div className="px-[8px] py-[5px]">
        <CaliberTile round={round} />
      </div>
      <div className="min-w-0 px-[10px] py-[6px]">
        <div className="flex min-w-0 items-center gap-[6px]">
          <span className="truncate text-name font-semibold text-fg">{round.name}</span>
          {round.tracer ? <TracerTag /> : null}
        </div>
        <div className="font-mono text-[9px] text-dim">{round.caliber}</div>
      </div>
      <Cell strong>{damageLabel(round)}</Cell>
      <div className="px-[8px] py-[6px]">
        <div className="flex items-center justify-end gap-[8px]">
          <span className="min-w-[18px] text-right font-mono text-mono font-bold" style={{ color: tierColor }}>
            {round.penetrationPower}
          </span>
          <div className="w-[44px]">
            <PenBar pen={round.penetrationPower} />
          </div>
        </div>
      </div>
      <Cell>{percent(round.penetrationChance)}</Cell>
      <Cell>{round.armorDamage}%</Cell>
      <Cell>{percent(round.fragmentationChance)}</Cell>
      <Cell muted>{percent(round.ricochetChance)}</Cell>
      <Cell muted>
        {round.initialSpeed}
        <span className="text-dim"> m/s</span>
      </Cell>
      <div className="flex justify-center text-dim">
        <ChevronRight className={`size-[13px] transition-transform ${active ? "rotate-90" : ""}`} />
      </div>
    </button>
  );
}

function AmmoDataSourceBanner() {
  return (
    <div className="mt-[12px] flex items-center gap-[8px] border border-[#24401f] bg-[#111a11] px-[12px] py-[8px] font-mono text-[10px]">
      <Check className="size-[14px] shrink-0 text-[#6ea862]" strokeWidth={2} />
      <span className="text-[#8fb87f]">
        API-BACKED — tarkov.dev exposes a dedicated{" "}
        <span className="text-[#9ccb4f]">ammo</span> query (damage,
        penetrationPower, armorDamage, fragmentation/penetration/ricochetChance,
        initialSpeed, projectileCount, tracer, bleed &amp; recoil modifiers +
        nested item price). Armor-class read in the drawer is derived from
        penetrationPower (no shots-to-pen field).
      </span>
    </div>
  );
}

function Cell({
  children,
  muted = false,
  strong = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={`px-[8px] py-[6px] text-right font-mono ${
        strong ? "text-mono font-semibold text-fg" : muted ? "text-meta text-muted" : "text-meta text-fg-2"
      }`}
    >
      {children}
    </div>
  );
}

function AmmoCard({
  active,
  round,
  onToggleRound,
}: {
  active: boolean;
  round: IndexedAmmoRound;
  onToggleRound(index: number): void;
}) {
  const tierColor = penColor(round.penetrationPower);

  return (
    <button
      className={`border border-border border-l-[3px] px-[10px] py-[9px] text-left transition-colors hover:bg-hover ${
        active ? "bg-active-2" : "bg-surface"
      }`}
      onClick={() => onToggleRound(round.index)}
      style={{ borderLeftColor: tierColor }}
      type="button"
    >
      <div className="mb-[9px] flex items-center gap-[8px]">
        <CaliberTile round={round} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-[6px]">
            <span className="truncate text-name font-semibold text-fg">{round.name}</span>
            {round.tracer ? <TracerTag /> : null}
          </div>
          <div className="font-mono text-meta text-dim">{round.caliber}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-stat font-bold" style={{ color: tierColor }}>
            {round.penetrationPower}
          </div>
          <div className="font-display text-kicker uppercase tracking-[0.12em] text-dim">
            PEN
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-[6px]">
        <MiniStat label="DMG" value={damageLabel(round)} />
        <MiniStat label="ARMOR" value={`${round.armorDamage}%`} />
        <MiniStat label="FRAG" value={percent(round.fragmentationChance)} />
        <MiniStat label="VEL" value={String(round.initialSpeed)} muted />
      </div>
    </button>
  );
}

function CaliberTile({ round }: { round: AmmoRound }) {
  const tierColor = penColor(round.penetrationPower);
  return (
    <div
      className="flex h-[28px] w-[28px] items-center justify-center border border-border-strong bg-bg font-mono text-[7.5px] font-semibold"
      style={{ color: tierColor }}
    >
      {shortCaliber(round)}
    </div>
  );
}

function TracerTag() {
  return (
    <span className="border border-[#3a4a2a] px-[4px] py-[1px] font-mono text-[7.5px] uppercase tracking-[0.05em] text-lime">
      TRACER
    </span>
  );
}

function MiniStat({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="border border-border bg-bg px-[6px] py-[5px]">
      <div className="font-display text-kicker uppercase tracking-[0.12em] text-dim">
        {label}
      </div>
      <div className={`font-mono text-meta font-semibold ${muted ? "text-muted" : "text-fg-2"}`}>
        {value}
      </div>
    </div>
  );
}

interface AmmoCompareProps {
  rows: IndexedAmmoRound[];
  maxDamage: number;
  selectedAmmo: number | null;
  onToggleRound(index: number): void;
}

function AmmoCompare({ rows, maxDamage, selectedAmmo, onToggleRound }: AmmoCompareProps) {
  return (
    <div className="border border-border bg-surface px-[14px] pb-[14px] pt-[10px]">
      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[6px] pb-[8px] font-mono text-meta text-dim">
        <LegendSwatch color="#6ea862" label="PEN (heat scale)" />
        <LegendSwatch color="#6c7566" label="DMG" />
        <span>armor matrix I-VI = class defeated</span>
        <span className="text-muted">derived · not from API</span>
      </div>
      <div className="space-y-0">
        {rows.map((round) => (
          <CompareRow
            active={selectedAmmo === round.index}
            key={`${round.caliber}-${round.name}`}
            maxDamage={maxDamage}
            round={round}
            onToggleRound={onToggleRound}
          />
        ))}
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-[5px]">
      <span className="h-[6px] w-[10px]" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function CompareRow({
  active,
  maxDamage,
  round,
  onToggleRound,
}: {
  active: boolean;
  maxDamage: number;
  round: IndexedAmmoRound;
  onToggleRound(index: number): void;
}) {
  const tierColor = penColor(round.penetrationPower);
  const damage = totalDamage(round);
  const cells = armorClassCells(round);

  return (
    <button
      className={`grid w-full grid-cols-1 items-center gap-[14px] border-t border-border-subtle px-[4px] py-[9px] text-left transition-colors hover:bg-hover min-[860px]:grid-cols-[110px_1fr_124px] ${
        active ? "bg-active-2" : ""
      }`}
      onClick={() => onToggleRound(round.index)}
      type="button"
    >
      <div className="flex min-w-0 items-center gap-[8px]">
        <div
          className="flex h-[24px] w-[24px] flex-none items-center justify-center border border-border-strong border-l-[3px] bg-bg font-mono text-[7px] font-semibold"
          style={{ borderLeftColor: tierColor, color: tierColor }}
        >
          {shortCaliber(round)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-name font-semibold text-fg">{round.name}</div>
          <div className="font-mono text-meta text-dim">{round.caliber}</div>
        </div>
      </div>
      <div className="space-y-[5px]">
        <Bar
          color={tierColor}
          label="PEN"
          pct={Math.round((round.penetrationPower / 80) * 100)}
          value={round.penetrationPower}
        />
        <Bar
          color="#6c7566"
          label="DMG"
          pct={Math.round((damage / maxDamage) * 100)}
          value={damage}
        />
      </div>
      <div className="grid grid-cols-6 gap-[3px]">
        {cells.map((cell) => (
          <div
            className="flex h-[20px] items-center justify-center border border-border font-display text-badge font-bold"
            key={cell.label}
            style={{ backgroundColor: cell.color, color: cell.foreground }}
            title={`Class ${cell.label}${cell.filled ? ` defeated by PEN ${round.penetrationPower}` : ""}`}
          >
            {cell.label}
          </div>
        ))}
      </div>
      <span className="sr-only">Derived class {penClass(round.penetrationPower)} profile.</span>
    </button>
  );
}
