import { createClient, fetchAmmo, TARKOV_API_ENDPOINT, type Ammo } from "@tarker/data";
import { ammo as sampleAmmo } from "@/lib/mock";
import type { AmmoRound } from "@/lib/types";
import type { DataResult } from "./result";

// tarkov.dev returns internal caliber codes (e.g. "Caliber556x45NATO"); map the common
// ones to the display strings the screen groups/labels by. Unknown codes fall back to a
// readable form by stripping the "Caliber" prefix.
const CALIBER_DISPLAY: Record<string, string> = {
  Caliber545x39: "5.45x39",
  Caliber556x45NATO: "5.56x45",
  Caliber762x39: "7.62x39",
  Caliber762x51: "7.62x51",
  Caliber762x54R: "7.62x54R",
  Caliber762x35: ".300 BLK",
  Caliber762x25TT: "7.62x25",
  Caliber86x70: ".338 LM",
  Caliber9x18PM: "9x18",
  Caliber9x19PARA: "9x19",
  Caliber9x21: "9x21",
  Caliber9x39: "9x39",
  Caliber57x28: "5.7x28",
  Caliber46x30: "4.6x30",
  Caliber1143x23ACP: ".45 ACP",
  Caliber9x33R: ".357",
  Caliber366TKM: ".366 TKM",
  Caliber127x55: "12.7x55",
  Caliber1270: "12/70",
  Caliber20x70: "20/70",
  Caliber23x75: "23x75",
  Caliber40x46: "40x46",
  Caliber40mmRU: "40mm",
  Caliber68x51: "6.8x51",
};

function normalizeCaliber(code: string | null): string {
  if (!code) return "Other";
  return CALIBER_DISPLAY[code] ?? code.replace(/^Caliber/, "");
}

function toAmmoRound(a: Ammo): AmmoRound {
  const flea = a.sellFor.find((venue) => venue.source === "Flea Market");
  return {
    caliber: normalizeCaliber(a.caliber),
    name: a.name,
    ammoType: a.ammoType,
    damage: a.damage,
    penetrationPower: a.penetrationPower,
    armorDamage: a.armorDamage,
    fragmentationChance: a.fragmentationChance,
    penetrationChance: a.penetrationChance,
    ricochetChance: a.ricochetChance,
    initialSpeed: a.initialSpeed ?? 0,
    projectileCount: a.projectileCount ?? 1,
    tracer: a.tracer,
    tracerColor: a.tracerColor ?? undefined,
    weight: a.weight,
    stackMaxSize: a.stackMaxSize,
    lightBleedModifier: a.lightBleedModifier,
    heavyBleedModifier: a.heavyBleedModifier,
    staminaBurnPerDamage: a.staminaBurnPerDamage ?? 0,
    accuracyModifier: a.accuracyModifier ?? 0,
    recoilModifier: a.recoilModifier ?? 0,
    priceRUB: flea?.priceRUB ?? 0,
  };
}

export async function loadAmmo(): Promise<DataResult<AmmoRound[]>> {
  const endpoint = process.env.TARKOV_API_ENDPOINT ?? TARKOV_API_ENDPOINT;

  try {
    const client = createClient(endpoint);
    const rounds = (await fetchAmmo(client)).map(toAmmoRound);
    console.info(`[ammo] fetched ${rounds.length} live rounds from ${endpoint}`);
    return { data: rounds, degraded: false };
  } catch (err) {
    console.warn("[ammo] live fetch failed, falling back to sample data:", err);
    return { data: sampleAmmo, degraded: true };
  }
}
