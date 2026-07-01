import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Crosshair,
  LayoutDashboard,
  Map,
  Package,
  ScanLine,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "DATABASE",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
      { key: "items", label: "Items", href: "/items", icon: Package },
      { key: "ammo", label: "Ammo", href: "/ammo", icon: Crosshair },
      { key: "tasks", label: "Tasks", href: "/tasks", icon: ClipboardList },
      { key: "traders", label: "Traders", href: "/traders", icon: Users },
      { key: "hideout", label: "Hideout", href: "/hideout", icon: Warehouse },
      { key: "maps", label: "Maps", href: "/maps", icon: Map },
    ],
  },
  {
    title: "OPERATOR · SOON",
    items: [
      { key: "progression", label: "Progression", href: "/progression", icon: TrendingUp, soon: true },
      { key: "scan", label: "Scan", href: "/scan", icon: ScanLine, soon: true },
    ],
  },
];
