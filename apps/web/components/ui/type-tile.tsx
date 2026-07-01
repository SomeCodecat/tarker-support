"use client";

import { cn } from "@/lib/cn";

interface TypeTileProps {
  short: string;
  color: string;
  size?: number;
  tall?: boolean;
  className?: string;
}

export function TypeTile({
  short,
  color,
  size = 40,
  tall = false,
  className,
}: TypeTileProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-border-strong border-l-[3px] bg-bg px-[4px] text-center font-mono text-mono font-semibold leading-tight",
        className,
      )}
      style={{
        borderLeftColor: color,
        color,
        width: size,
        height: tall ? Math.round(size * 1.5) : size,
      }}
    >
      {short}
    </div>
  );
}
