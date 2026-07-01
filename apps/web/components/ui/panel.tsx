"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  right?: ReactNode;
  padded?: boolean;
}

export function Panel({
  title,
  right,
  padded = true,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <section
      className={cn("border border-border bg-surface text-fg", className)}
      {...props}
    >
      {title || right ? (
        <div className="flex min-h-[34px] items-center justify-between border-b border-border px-[12px]">
          {title ? (
            <div className="font-display text-label uppercase tracking-[0.18em] text-muted">
              {title}
            </div>
          ) : (
            <div />
          )}
          {right}
        </div>
      ) : null}
      <div className={cn(padded && "p-[12px]")}>{children}</div>
    </section>
  );
}
