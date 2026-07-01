import type { Task } from "@tarker/data";

export const tasks = [
  { id: "t1", name: "Debut", minPlayerLevel: 1, traderName: "Prapor", prerequisiteTaskIds: [], itemObjectives: [{ name: "MP-133 shotgun", count: 2, foundInRaid: false }, { name: "Leather jacket", count: 3, foundInRaid: false }] },
  { id: "t2", name: "Shootout Picnic", minPlayerLevel: 1, traderName: "Prapor", prerequisiteTaskIds: ["t1"], itemObjectives: [] },
  { id: "t3", name: "The Survivalist Path", minPlayerLevel: 8, traderName: "Jaeger", prerequisiteTaskIds: ["t2"], itemObjectives: [{ name: "Bolts", count: 3, foundInRaid: false }, { name: "Aramid fiber", count: 2, foundInRaid: true }] },
  { id: "t4", name: "Background Check", minPlayerLevel: 8, traderName: "Therapist", prerequisiteTaskIds: [], itemObjectives: [{ name: "Salewa first aid kit", count: 2, foundInRaid: true }] },
  { id: "t5", name: "Shortage", minPlayerLevel: 5, traderName: "Therapist", prerequisiteTaskIds: [], itemObjectives: [{ name: "Salewa first aid kit", count: 3, foundInRaid: true }] },
  { id: "t6", name: "Sanitary Standards - Part 1", minPlayerLevel: 14, traderName: "Therapist", prerequisiteTaskIds: ["t4"], itemObjectives: [{ name: "Ophthalmoscope", count: 2, foundInRaid: false }, { name: "医 Medical bloodset", count: 3, foundInRaid: false }] },
  { id: "t7", name: "Gunsmith - Part 1", minPlayerLevel: 2, traderName: "Mechanic", prerequisiteTaskIds: [], itemObjectives: [{ name: "MP-133 w/ mods", count: 1, foundInRaid: true }] },
  { id: "t8", name: "Supplier", minPlayerLevel: 6, traderName: "Peacekeeper", prerequisiteTaskIds: [], itemObjectives: [{ name: "Screw nuts", count: 5, foundInRaid: false }, { name: "Wires", count: 5, foundInRaid: false }] },
  { id: "t9", name: "Introduction", minPlayerLevel: 12, traderName: "Ragman", prerequisiteTaskIds: [], itemObjectives: [{ name: "Cash register", count: 2, foundInRaid: true }] },
  { id: "t10", name: "The Extortionist", minPlayerLevel: 10, traderName: "Skier", prerequisiteTaskIds: ["t2"], itemObjectives: [{ name: "Wires", count: 2, foundInRaid: false }, { name: "Bank case", count: 1, foundInRaid: true }] },
  { id: "t11", name: "Chemical - Part 4", minPlayerLevel: 16, traderName: "Skier", prerequisiteTaskIds: ["t10"], itemObjectives: [{ name: "Graphics card", count: 2, foundInRaid: false }] },
  { id: "t12", name: "Private Clinic", minPlayerLevel: 24, traderName: "Therapist", prerequisiteTaskIds: ["t6"], itemObjectives: [{ name: "LEDX Skin Transilluminator", count: 1, foundInRaid: true }, { name: "Ophthalmoscope", count: 4, foundInRaid: true }] },
] as unknown as Task[];
