"use client";

import type { ReactNode } from "react";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-[12px]">
      <div className="flex min-w-0 items-center gap-[10px]">
        <div className="h-[28px] w-[3px] bg-accent" />
        <div className="min-w-0">
          <h1 className="font-display text-title font-semibold uppercase tracking-[0.14em] text-fg">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-[2px] font-mono text-meta uppercase tracking-[0.08em] text-dim">
              {`// ${subtitle}`}
            </p>
          ) : null}
        </div>
      </div>
      {right}
    </header>
  );
}
