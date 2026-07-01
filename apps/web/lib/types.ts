export type {
  HideoutLevel,
  HideoutNeed,
  HideoutStation,
  Item,
  RequirementsEntry,
  RequirementsIndex,
  SellVenue,
  Task,
  TaskNeed,
  TaskObjectiveItem,
} from "@tarker/data";

// MOCK — future tarkov.dev `ammo` query (fields mirror tarkov.dev Ammo: chances are 0–1 floats)
export interface AmmoRound {
  caliber: string;
  name: string;
  ammoType: string;
  damage: number;
  penetrationPower: number;
  armorDamage: number;
  fragmentationChance: number;
  penetrationChance: number;
  ricochetChance: number;
  initialSpeed: number;
  projectileCount: number;
  tracer: boolean;
  tracerColor?: string;
  weight: number;
  stackMaxSize: number;
  lightBleedModifier: number;
  heavyBleedModifier: number;
  staminaBurnPerDamage: number;
  accuracyModifier: number;
  recoilModifier: number;
  priceRUB: number;
}

// MOCK — future tarkov.dev `traders` query
export interface TraderBarter {
  give: string;
  get: string;
}

export interface Trader {
  id: string;
  name: string;
  role: string;
  initial: string;
  currency: string;
  rep: string;
  reset: string;
  barters: TraderBarter[];
}

export interface LoyaltyLevel {
  ll: string;
  rep: string;
  sales: string;
  comm: string;
}

// MOCK — future tarkov.dev `maps` query
export interface MapBoss {
  name: string;
  chance: string;
}

export interface MapExtract {
  name: string;
  side: "PMC" | "Scav" | "Shared";
  req: string;
  reliable: boolean;
}

export interface MapInfo {
  id: string;
  name: string;
  players: string;
  duration: string;
  quests: number;
  hot: string;
  bosses: MapBoss[];
  extracts: MapExtract[];
}

// MOCK — scan/keep-sell placeholder (slice 3 feature)
export interface ScanRow {
  short: string;
  name: string;
  tier: string;
  own: number;
  keepAll: number;
  keepCur: number;
  keepNext: number;
  reason: string;
  sell: number;
  sellSrc: string;
  fir: "yes" | "no" | "unsure";
}

export type TaskObjectiveType =
  | "giveItem"
  | "findItem"
  | "shoot"
  | "mark"
  | "visit"
  | "buildWeapon";

export interface TaskDetailObjective {
  type: TaskObjectiveType;
  desc: string;
  count: number;
  fir: boolean;
}

// MOCK — task detail extras (objectives use full TaskObjective union type from tarkov.dev)
export interface TaskExtra {
  map: string;
  kappa: boolean;
  xp: number;
  cash: number;
  repTrader: string;
  repAmt: string;
  unlocks: string[];
  objectives: TaskDetailObjective[];
}

export interface ReqTaskNeed {
  taskName: string;
  count: number;
  foundInRaid: boolean;
  minPlayerLevel: number;
}

export interface ReqHideoutNeed {
  stationName: string;
  level: number;
  count: number;
}

export interface ReqEntry {
  neededByTasks: ReqTaskNeed[];
  neededByHideout: ReqHideoutNeed[];
}

export type RequirementsView = Record<string, ReqEntry>;

export interface HideoutReqRow {
  short: string;
  name: string;
  count: number;
  tier: string;
}

export interface ProgStation {
  id: string;
  name: string;
  max: number;
}
