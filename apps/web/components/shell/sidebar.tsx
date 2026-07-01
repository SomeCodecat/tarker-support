"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useApp } from "@/lib/app-context";
import { navSections, type NavItem } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  const { online, toggleOnline } = useApp();

  return (
    <aside className="sticky top-0 flex h-screen flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-[16px] py-[18px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex size-[34px] items-center justify-center border border-accent bg-bg text-accent">
            <Shield className="size-[20px]" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display text-heading font-bold uppercase tracking-[0.12em] text-fg">
              Tarker
            </div>
            <div className="font-mono text-meta uppercase tracking-[0.08em] text-dim">
              support // eft companion
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-[18px] overflow-y-auto px-[10px] py-[16px]">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-[7px]">
            <div className="px-[8px] font-display text-label uppercase tracking-[0.18em] text-muted">
              {section.title}
            </div>
            <div className="space-y-[3px]">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.key}
                  item={item}
                  active={isActive(pathname, item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button
        className="m-[10px] flex items-center gap-[7px] border border-border-strong bg-bg px-[10px] py-[8px] text-left font-mono text-meta uppercase tracking-[0.06em] text-muted hover:text-fg"
        onClick={toggleOnline}
        type="button"
      >
        <span
          className={cn(
            "size-[7px]",
            online ? "bg-good" : "bg-danger",
          )}
          style={!online ? { animation: "ts-blink 1s step-end infinite" } : undefined}
        />
        tarkov.dev · {online ? "online" : "offline"}
      </button>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      className={cn(
        "group flex min-h-[32px] items-center gap-[9px] border-l-[3px] px-[8px] font-display text-nav font-semibold uppercase tracking-[0.06em] transition-colors",
        active
          ? "border-l-accent bg-active text-accent"
          : "border-l-transparent text-muted hover:bg-hover hover:text-fg",
        item.soon && "opacity-65",
      )}
      href={item.href}
    >
      <Icon className="size-[16px]" strokeWidth={2} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.soon ? <Badge variant="soon" /> : null}
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
