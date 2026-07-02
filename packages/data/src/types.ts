export interface SellVenue { source: string; priceRUB: number; }

export interface Item {
  id: string;
  name: string;
  shortName: string;
  width: number;
  height: number;
  iconLink: string | null;
  gridImageLink: string | null;
  basePrice: number;
  types: string[];
  sellFor: SellVenue[];
}

export interface TaskObjectiveItem { itemId: string; count: number; foundInRaid: boolean; }
export interface Task {
  id: string;
  name: string;
  minPlayerLevel: number;
  traderName: string | null;
  prerequisiteTaskIds: string[];
  itemObjectives: TaskObjectiveItem[];
}

export interface HideoutItemRequirement { itemId: string; count: number; }
export interface HideoutLevel { level: number; itemRequirements: HideoutItemRequirement[]; }
export interface HideoutStation { id: string; name: string; levels: HideoutLevel[]; }

export interface TaskNeed { taskId: string; taskName: string; count: number; foundInRaid: boolean; minPlayerLevel: number; }
export interface HideoutNeed { stationId: string; stationName: string; level: number; count: number; }
export interface RequirementsEntry {
  itemId: string;
  neededByTasks: TaskNeed[];
  neededByHideout: HideoutNeed[];
  sellFor: SellVenue[];
}
export type RequirementsIndex = Record<string, RequirementsEntry>;

export interface Ammo {
  itemId: string;
  name: string;
  shortName: string;
  caliber: string | null;
  ammoType: string;
  damage: number;
  penetrationPower: number;
  armorDamage: number;
  fragmentationChance: number;
  penetrationChance: number;
  ricochetChance: number;
  initialSpeed: number | null;
  projectileCount: number | null;
  tracer: boolean;
  tracerColor: string | null;
  weight: number;
  stackMaxSize: number;
  lightBleedModifier: number;
  heavyBleedModifier: number;
  staminaBurnPerDamage: number | null;
  accuracyModifier: number | null;
  recoilModifier: number | null;
  sellFor: SellVenue[];
}
