"use client";

import { penColor } from "@/lib/colors";

interface PenBarProps {
  pen: number;
  label?: string;
}

export function PenBar({ pen, label }: PenBarProps) {
  const width = Math.min(100, (pen / 80) * 100);
  return (
    <div className="space-y-[4px]">
      {label ? (
        <div className="flex justify-between font-mono text-meta text-muted">
          <span>{label}</span>
          <span>{pen}</span>
        </div>
      ) : null}
      <div className="h-[6px] border border-border bg-bg">
        <div
          className="h-full"
          style={{ width: `${width}%`, backgroundColor: penColor(pen) }}
        />
      </div>
    </div>
  );
}
