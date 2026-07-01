"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StatTileProps {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  accent?: boolean;
  className?: string;
}

export function StatTile({ label, value, note, accent = false, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "border border-border bg-bg px-[11px] py-[9px]",
        accent && "border-l-[3px] border-l-accent",
        className,
      )}
    >
      <div className="font-display text-kicker uppercase tracking-[0.12em] text-dim">
        {label}
      </div>
      <div className="mt-[4px] font-mono text-stat font-bold text-fg">{value}</div>
      {note ? <div className="mt-[3px] text-body text-muted">{note}</div> : null}
    </div>
  );
}
