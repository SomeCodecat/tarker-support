"use client";

import { cn } from "@/lib/cn";
import { rub } from "@/lib/format";

interface MoneyProps {
  value: number;
  tone?: "default" | "good" | "muted";
  className?: string;
}

export function Money({ value, tone = "default", className }: MoneyProps) {
  return (
    <span
      className={cn(
        "font-mono text-price font-semibold",
        tone === "good" && "text-good",
        tone === "muted" && "text-muted",
        tone === "default" && "text-fg",
        className,
      )}
    >
      {rub(value)}
    </span>
  );
}
