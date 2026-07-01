"use client";

import { X } from "lucide-react";
import { Bar, Badge, Drawer, Money } from "@/components/ui";
import { penClass, penColor } from "@/lib/colors";
import type { AmmoRound } from "@/lib/types";
import {
  armorClassCells,
  classNote,
  damageLabel,
  effectModifiers,
  percent,
  shortCaliber,
  totalDamage,
} from "./ammo-helpers";

interface AmmoDetailDrawerProps {
  round: AmmoRound | null;
  open: boolean;
  onClose(): void;
}

const MOD_TONE_CLASS = {
  good: "text-good",
  danger: "text-danger",
  muted: "text-muted",
} as const;

export function AmmoDetailDrawer({ round, open, onClose }: AmmoDetailDrawerProps) {
  const tierColor = round ? penColor(round.penetrationPower) : "#6ea862";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="420px"
      header={
        round ? (
          <div className="flex items-start gap-[14px] p-[18px]">
            <div
              className="flex h-[52px] w-[52px] flex-none items-center justify-center border border-border-strong border-l-[3px] bg-bg font-mono text-meta font-semibold"
              style={{ borderLeftColor: tierColor, color: tierColor }}
            >
              {shortCaliber(round)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-heading font-semibold uppercase leading-tight tracking-[0.03em] text-fg">
                {round.name}
              </h2>
              <div className="mt-[3px] font-mono text-meta text-muted">{round.caliber}</div>
              <div className="mt-[8px] flex flex-wrap gap-[5px]">
                <Badge
                  variant="level"
                  className="font-mono"
                  style={{ color: tierColor }}
                >
                  {round.ammoType.toUpperCase()}
                </Badge>
                {round.tracer ? (
                  <Badge
                    variant="level"
                    className="border-lime text-lime"
                  >
                    TRACER{round.tracerColor ? ` · ${round.tracerColor.toUpperCase()}` : ""}
                  </Badge>
                ) : null}
              </div>
            </div>
            <button
              aria-label="Close ammo detail"
              className="flex h-[26px] w-[26px] flex-none items-center justify-center border border-border-strong text-muted transition-colors hover:border-dim hover:text-fg"
              onClick={onClose}
              type="button"
            >
              <X className="size-[14px]" />
            </button>
          </div>
        ) : null
      }
    >
      {round ? <AmmoDetailBody round={round} /> : null}
    </Drawer>
  );
}

function AmmoDetailBody({ round }: { round: AmmoRound }) {
  const tierColor = penColor(round.penetrationPower);
  const damageTotal = totalDamage(round);
  const classes = armorClassCells(round, true);
  const modifiers = effectModifiers(round);

  return (
    <div className="space-y-[18px]">
      <div className="grid grid-cols-3 gap-[8px]">
        <StatBox
          label="DAMAGE"
          value={damageLabel(round)}
          note={round.projectileCount > 1 ? `= ${damageTotal} total` : undefined}
        />
        <StatBox
          label="PENETRATION"
          value={String(round.penetrationPower)}
          valueStyle={{ color: tierColor }}
        />
        <StatBox label="ARMOR-DMG" value={`${round.armorDamage}%`} />
      </div>

      <section>
        <div className="mb-[8px] flex items-baseline justify-between gap-[10px]">
          <h3 className="font-display text-label uppercase tracking-[0.18em] text-muted">
            VS ARMOR CLASS
          </h3>
          <span className="font-mono text-meta text-dim">derived · not from API</span>
        </div>
        <div className="grid grid-cols-6 gap-[4px]">
          {classes.map((cell) => (
            <div
              key={cell.label}
              className="flex h-[30px] items-center justify-center border border-border font-display text-nav font-bold"
              style={{ backgroundColor: cell.color, color: cell.foreground }}
            >
              {cell.label}
            </div>
          ))}
        </div>
        <div className="mt-[6px] font-mono text-meta text-muted">{classNote(round)}</div>
      </section>

      <section className="space-y-[9px]">
        <h3 className="font-display text-label uppercase tracking-[0.18em] text-muted">
          CHANCES
        </h3>
        <Bar
          color={tierColor}
          label="Penetration"
          pct={Math.round(round.penetrationChance * 100)}
          value={percent(round.penetrationChance)}
        />
        <Bar
          color="#c9964b"
          label="Fragmentation"
          pct={Math.round(round.fragmentationChance * 100)}
          value={percent(round.fragmentationChance)}
        />
        <Bar
          color="#7fa8c9"
          label="Ricochet"
          pct={Math.round(round.ricochetChance * 100)}
          value={percent(round.ricochetChance)}
        />
      </section>

      <section>
        <h3 className="mb-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
          BALLISTICS
        </h3>
        <div className="grid grid-cols-2 gap-[6px]">
          <MetricRow label="INITIAL SPEED" value={`${round.initialSpeed} m/s`} />
          <MetricRow label="PROJECTILES" value={String(round.projectileCount)} />
          <MetricRow label="WEIGHT" value={`${(round.weight * 1000).toFixed(1)} g`} />
          <MetricRow label="STACK MAX" value={String(round.stackMaxSize)} />
        </div>
      </section>

      <section>
        <h3 className="mb-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
          EFFECT MODIFIERS
        </h3>
        <div>
          {modifiers.map((modifier) => (
            <div
              className="flex items-center justify-between border-b border-border-subtle py-[6px]"
              key={modifier.label}
            >
              <span className="text-body text-fg-2">{modifier.label}</span>
              <span className={`font-mono text-mono font-semibold ${MOD_TONE_CLASS[modifier.tone]}`}>
                {modifier.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
          MARKET
        </h3>
        <div className="flex items-center justify-between border border-good-border bg-good-bg px-[11px] py-[8px]">
          <span className="text-name font-semibold text-fg">Flea (per round)</span>
          <Money value={round.priceRUB} tone="good" />
        </div>
      </section>

      <div className="sr-only">Penetration defeats class {penClass(round.penetrationPower)}.</div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  note?: string;
  valueStyle?: React.CSSProperties;
}

function StatBox({ label, value, note, valueStyle }: StatBoxProps) {
  return (
    <div className="border border-border bg-bg px-[11px] py-[9px]">
      <div className="font-display text-kicker uppercase tracking-[0.12em] text-dim">
        {label}
      </div>
      <div className="mt-[3px] font-mono text-stat font-bold text-fg" style={valueStyle}>
        {value}
      </div>
      {note ? <div className="font-mono text-meta text-dim">{note}</div> : null}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-[8px] border border-border bg-bg px-[10px] py-[7px]">
      <span className="font-display text-kicker uppercase tracking-[0.12em] text-dim">
        {label}
      </span>
      <span className="font-mono text-mono font-semibold text-fg">{value}</span>
    </div>
  );
}
