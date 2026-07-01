"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";
import { cn } from "@/lib/cn";

const mobileKeys = new Set(["dashboard", "items", "ammo", "tasks", "hideout"]);

export function MobileTabBar() {
  const pathname = usePathname();
  const items = navSections.flatMap((section) => section.items).filter((item) => mobileKeys.has(item.key));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-surface">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.key}
            className={cn(
              "flex flex-1 flex-col items-center gap-[3px] px-[2px] py-[6px] font-display text-badge uppercase tracking-[0.06em]",
              active ? "text-accent" : "text-muted",
            )}
            href={item.href}
          >
            <Icon className="size-[20px]" strokeWidth={2} />
            {item.key === "hideout" ? "base" : item.label}
          </Link>
        );
      })}
    </nav>
  );
}
