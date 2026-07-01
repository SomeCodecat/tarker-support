export function rub(n: number): string {
  return "\u20BD" + Math.round(n).toLocaleString("en-US");
}

export function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export function signedPct(v: number): string {
  const rounded = Math.round(v * 100);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}
