"use client";

import type { ReactNode } from "react";

interface BarProps {
  label?: ReactNode;
  pct: string | number;
  color: string;
  value?: ReactNode;
}

export function Bar({ label, pct, color, value }: BarProps) {
  const width = typeof pct === "number" ? `${pct}%` : pct;
  return (
    <div className="space-y-[4px]">
      {label || value ? (
        <div className="flex justify-between gap-[8px] font-mono text-meta text-muted">
          <span>{label}</span>
          <span>{value}</span>
        </div>
      ) : null}
      <div className="h-[7px] border border-border bg-bg">
        <div className="h-full" style={{ width, backgroundColor: color }} />
      </div>
    </div>
  );
}
