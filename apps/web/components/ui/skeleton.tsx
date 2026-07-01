"use client";

import { cn } from "@/lib/cn";

interface SkeletonProps {
  rows?: number;
  className?: string;
}

export function Skeleton({ rows = 3, className }: SkeletonProps) {
  return (
    <div className={cn("space-y-[8px]", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-[30px] border border-border bg-active-2"
          style={{ animation: "ts-pulse 1.4s ease-in-out infinite" }}
        />
      ))}
    </div>
  );
}
