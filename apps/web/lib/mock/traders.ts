import type { LoyaltyLevel, Trader } from "@/lib/types";

export const traders: Trader[] = [
  { id: "prapor", name: "Prapor", role: "Warrant Officer", initial: "P", currency: "RUB", rep: "0.42", reset: "3h 00m", barters: [{ give: "2× AA battery", get: "Bolts" }, { give: "5× Duct tape", get: "Weapon parts" }, { give: "1× Salewa", get: "Grenade" }] },
  { id: "therapist", name: "Therapist", role: "Doctor", initial: "T", currency: "RUB", rep: "0.61", reset: "3h 00m", barters: [{ give: "4× Med kit", get: "IFAK" }, { give: "2× Bandage", get: "Splint" }, { give: "1× Ophthalmoscope", get: "Sanitary kit" }] },
  { id: "skier", name: "Skier", role: "Businessman", initial: "S", currency: "EUR", rep: "0.38", reset: "3h 00m", barters: [{ give: "3× Roler watch", get: "MP5" }, { give: "2× Chainlet", get: "5.56 M855" }, { give: "1× GPU", get: "Cash reward" }] },
  { id: "peacekeeper", name: "Peacekeeper", role: "UN Officer", initial: "PK", currency: "USD", rep: "0.29", reset: "3h 00m", barters: [{ give: "5× Wires", get: "M4A1 upper" }, { give: "2× Tools", get: "PVS-14" }, { give: "3× WD-40", get: ".338 AP" }] },
  { id: "mechanic", name: "Mechanic", role: "Gunsmith", initial: "M", currency: "RUB", rep: "0.55", reset: "3h 00m", barters: [{ give: "2× GPU", get: "Thermal scope" }, { give: "4× Capacitors", get: "Muzzle brake" }, { give: "1× VPX", get: "RSASS receiver" }] },
  { id: "ragman", name: "Ragman", role: "Clothing Trader", initial: "R", currency: "RUB", rep: "0.47", reset: "3h 00m", barters: [{ give: "5× Fleece", get: "Rig" }, { give: "2× Leather", get: "Backpack" }, { give: "3× Zibbo", get: "Armor plate" }] },
  { id: "jaeger", name: "Jaeger", role: "Huntsman", initial: "J", currency: "RUB", rep: "0.33", reset: "3h 00m", barters: [{ give: "3× Bolts", get: "SKS" }, { give: "2× Pine air freshener", get: "7.62x39 BP" }, { give: "1× Kite", get: "Hunting knife" }] },
  { id: "fence", name: "Fence", role: "Middleman", initial: "F", currency: "RUB", rep: "0.00", reset: "3h 00m", barters: [{ give: "Assorted", get: "Random FIR gear" }] },
];

export const loyaltyTemplate: LoyaltyLevel[] = [
  { ll: "LL1", rep: "0.00", sales: "\u20BD0", comm: "6%" },
  { ll: "LL2", rep: "0.20", sales: "\u20BD1,500,000", comm: "4%" },
  { ll: "LL3", rep: "0.42", sales: "\u20BD5,300,000", comm: "3%" },
  { ll: "LL4", rep: "0.70", sales: "\u20BD16,000,000", comm: "2%" },
];
