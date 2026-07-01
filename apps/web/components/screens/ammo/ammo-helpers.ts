import { caliberShort, penClass, penColor } from "@/lib/colors";
import { pct, signedPct } from "@/lib/format";
import type { AmmoRound } from "@/lib/types";

export type AmmoView = "table" | "compare";

export type AmmoSortKey =
  | "damage"
  | "penetrationPower"
  | "penetrationChance"
  | "armorDamage"
  | "fragmentationChance"
  | "ricochetChance"
  | "initialSpeed";

export type SortDir = 1 | -1;

export interface AmmoSort {
  key: AmmoSortKey;
  dir: SortDir;
}

export interface IndexedAmmoRound extends AmmoRound {
  index: number;
}

export interface EffectModifier {
  label: string;
  value: string;
  tone: "good" | "danger" | "muted";
}

export const DEFAULT_AMMO_SORT: AmmoSort = {
  key: "penetrationPower",
  dir: -1,
};

export const ARMOR_LABELS = ["I", "II", "III", "IV", "V", "VI"] as const;

export function ammoCalibers(rounds: AmmoRound[]): string[] {
  return ["all", ...Array.from(new Set(rounds.map((round) => round.caliber)))];
}

export function indexedAmmo(rounds: AmmoRound[]): IndexedAmmoRound[] {
  return rounds.map((round, index) => ({ ...round, index }));
}

export function filterAmmo(rounds: IndexedAmmoRound[], caliber: string): IndexedAmmoRound[] {
  if (caliber === "all") return rounds;
  return rounds.filter((round) => round.caliber === caliber);
}

export function sortAmmo(rounds: IndexedAmmoRound[], sort: AmmoSort): IndexedAmmoRound[] {
  return rounds
    .slice()
    .sort((a, b) => (a[sort.key] - b[sort.key]) * sort.dir);
}

export function nextAmmoSort(current: AmmoSort, key: AmmoSortKey): AmmoSort {
  return {
    key,
    dir: current.key === key ? ((-current.dir) as SortDir) : -1,
  };
}

export function sortArrow(sort: AmmoSort, key: AmmoSortKey): string {
  if (sort.key !== key) return "";
  return sort.dir > 0 ? "↑" : "↓";
}

export function rowTone(index: number): string {
  return index % 2 ? "bg-elevated" : "bg-surface";
}

export function totalDamage(round: AmmoRound): number {
  return round.damage * round.projectileCount;
}

export function damageLabel(round: AmmoRound): string {
  return round.projectileCount > 1
    ? `${round.damage}\u00d7${round.projectileCount}`
    : String(round.damage);
}

export function penWidth(round: AmmoRound): number {
  return Math.min(100, Math.round((round.penetrationPower / 80) * 100));
}

export function percent(v: number): string {
  return pct(v);
}

export function armorClassCells(round: AmmoRound, roman = false) {
  const cls = penClass(round.penetrationPower);
  const color = penColor(round.penetrationPower);
  return [1, 2, 3, 4, 5, 6].map((level) => {
    const filled = level <= cls;
    return {
      label: roman ? ARMOR_LABELS[level - 1] : String(level),
      filled,
      color: filled ? color : "#20261e",
      foreground: filled ? "#0d100e" : "#454c44",
    };
  });
}

export function classNote(round: AmmoRound): string {
  return `penetration power ${round.penetrationPower} \u2248 defeats up to class ${penClass(
    round.penetrationPower,
  )}`;
}

export function effectModifiers(round: AmmoRound): EffectModifier[] {
  return [
    makeModifier("Light bleed", round.lightBleedModifier, true),
    makeModifier("Heavy bleed", round.heavyBleedModifier, true),
    makeModifier("Stamina burn", round.staminaBurnPerDamage, true),
    makeModifier("Accuracy", round.accuracyModifier, false),
    makeModifier("Recoil", round.recoilModifier, true),
  ];
}

export function makeModifier(
  label: string,
  value: number,
  invert: boolean,
): EffectModifier {
  const good = invert ? value <= 0 : value >= 0;
  return {
    label,
    value: signedPct(value),
    tone: value === 0 ? "muted" : good ? "good" : "danger",
  };
}

export function shortCaliber(round: AmmoRound): string {
  return caliberShort(round.caliber);
}
