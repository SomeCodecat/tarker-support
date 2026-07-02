import type { ScanRow } from "@/lib/types";

export const scanRows: ScanRow[] = [
  {
    short: "LEDX", name: "LEDX Skin Transilluminator", tier: "#7fa8c9", own: 2,
    taskNeeds: [
      { taskId: "sample-private-clinic", taskName: "Private Clinic", count: 1, foundInRaid: true, minPlayerLevel: 16 },
    ],
    hideoutNeeds: [
      { stationId: "sample-medstation", stationName: "Medstation", level: 3, count: 2 },
    ],
    sell: 55000, sellSrc: "Therapist",
  },
  {
    short: "GPU", name: "Graphics card", tier: "#b98a3c", own: 3,
    taskNeeds: [
      { taskId: "sample-chemical-p4", taskName: "Chemical - Part 4", count: 1, foundInRaid: false, minPlayerLevel: 12 },
    ],
    hideoutNeeds: [
      { stationId: "sample-bitcoin-farm", stationName: "Bitcoin Farm", level: 1, count: 1 },
    ],
    sell: 168435, sellSrc: "Mechanic",
  },
  {
    short: "Bolts", name: "Bolts", tier: "#b98a3c", own: 12,
    taskNeeds: [],
    hideoutNeeds: [
      { stationId: "sample-workbench", stationName: "Workbench", level: 1, count: 4 },
      { stationId: "sample-water-collector", stationName: "Water Collector", level: 2, count: 3 },
    ],
    sell: 630, sellSrc: "Jaeger",
  },
  {
    short: "0.2BTC", name: "Physical Bitcoin", tier: "#b98a3c", own: 4,
    taskNeeds: [],
    hideoutNeeds: [],
    sell: 512000, sellSrc: "Flea Market",
  },
  {
    short: "Salewa", name: "Salewa first aid kit", tier: "#7fa8c9", own: 5,
    taskNeeds: [
      { taskId: "sample-shortage", taskName: "Shortage", count: 3, foundInRaid: true, minPlayerLevel: 10 },
      { taskId: "sample-background-check", taskName: "Background Check", count: 2, foundInRaid: false, minPlayerLevel: 18 },
    ],
    hideoutNeeds: [],
    sell: 13355, sellSrc: "Therapist",
  },
  {
    short: "Kite", name: 'Gunpowder "Kite"', tier: "#b98a3c", own: 3,
    taskNeeds: [
      { taskId: "sample-gunsmith-barter", taskName: "Farming - Part 2", count: 2, foundInRaid: false, minPlayerLevel: 17 },
    ],
    hideoutNeeds: [],
    sell: 2360, sellSrc: "Mechanic",
  },
];
