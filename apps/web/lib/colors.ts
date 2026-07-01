const TYPE_COLORS: Record<string, string> = {
  barter: "#b98a3c",
  keys: "#c9a24b",
  medical: "#7fa8c9",
  mods: "#7d9b6a",
  weapon: "#a88b6a",
  provisions: "#c9964b",
  armor: "#6f7f8c",
  container: "#8a7a5c",
  info: "#9a86c4",
  ammo: "#c68a5a",
};

export function typeColor(types: string[]): string {
  for (const t of types) if (TYPE_COLORS[t]) return TYPE_COLORS[t];
  return "#7d8478";
}

export function penColor(p: number): string {
  if (p >= 60) return "#6ea862";
  if (p >= 45) return "#9ccb4f";
  if (p >= 35) return "#e8c53f";
  if (p >= 25) return "#e0913c";
  return "#c15b4e";
}

export function penClass(p: number): number {
  if (p >= 60) return 6;
  if (p >= 50) return 5;
  if (p >= 40) return 4;
  if (p >= 30) return 3;
  if (p >= 20) return 2;
  return 1;
}

export function caliberShort(c: string): string {
  return c.split(/[x/ ]/)[0];
}
