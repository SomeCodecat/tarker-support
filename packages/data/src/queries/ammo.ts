import { gql } from "graphql-request";
import { z } from "zod";
import type { Ammo } from "../types";

export const AMMO_QUERY = gql`
  {
    ammo {
      caliber ammoType damage penetrationPower armorDamage
      fragmentationChance penetrationChance ricochetChance
      initialSpeed projectileCount tracer tracerColor
      weight stackMaxSize lightBleedModifier heavyBleedModifier
      staminaBurnPerDamage accuracyModifier recoilModifier
      item { id name shortName sellFor { priceRUB vendor { name } } }
    }
  }
`;

const RawAmmo = z.object({
  caliber: z.string().nullable(),
  ammoType: z.string(),
  damage: z.number(),
  penetrationPower: z.number(),
  armorDamage: z.number(),
  fragmentationChance: z.number(),
  penetrationChance: z.number(),
  ricochetChance: z.number(),
  initialSpeed: z.number().nullable(),
  projectileCount: z.number().nullable(),
  tracer: z.boolean(),
  tracerColor: z.string().nullable(),
  weight: z.number(),
  stackMaxSize: z.number(),
  lightBleedModifier: z.number(),
  heavyBleedModifier: z.number(),
  staminaBurnPerDamage: z.number().nullable(),
  accuracyModifier: z.number().nullable(),
  recoilModifier: z.number().nullable(),
  item: z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string(),
    sellFor: z.array(z.object({ priceRUB: z.number(), vendor: z.object({ name: z.string() }) })),
  }),
});
const RawAmmoList = z.object({ ammo: z.array(RawAmmo) });

export function parseAmmo(raw: unknown): Ammo[] {
  const { ammo } = RawAmmoList.parse(raw);
  return ammo.map((a) => ({
    itemId: a.item.id,
    name: a.item.name,
    shortName: a.item.shortName,
    caliber: a.caliber,
    ammoType: a.ammoType,
    damage: a.damage,
    penetrationPower: a.penetrationPower,
    armorDamage: a.armorDamage,
    fragmentationChance: a.fragmentationChance,
    penetrationChance: a.penetrationChance,
    ricochetChance: a.ricochetChance,
    initialSpeed: a.initialSpeed,
    projectileCount: a.projectileCount,
    tracer: a.tracer,
    tracerColor: a.tracerColor,
    weight: a.weight,
    stackMaxSize: a.stackMaxSize,
    lightBleedModifier: a.lightBleedModifier,
    heavyBleedModifier: a.heavyBleedModifier,
    staminaBurnPerDamage: a.staminaBurnPerDamage,
    accuracyModifier: a.accuracyModifier,
    recoilModifier: a.recoilModifier,
    sellFor: a.item.sellFor.map((s) => ({ source: s.vendor.name, priceRUB: s.priceRUB })),
  }));
}

export async function fetchAmmo(client: import("graphql-request").GraphQLClient): Promise<Ammo[]> {
  return parseAmmo(await client.request(AMMO_QUERY));
}
