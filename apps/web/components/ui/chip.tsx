"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function FilterChip({
  active = false,
  className,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      className={cn(
        "border px-[9px] py-[5px] font-display text-badge uppercase tracking-[0.08em] transition-colors",
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-border-strong bg-transparent text-muted hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface ViewToggleOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface ViewToggleProps<T extends string> {
  value: T;
  options: ViewToggleOption<T>[];
  onChange(value: T): void;
  className?: string;
}

export function ViewToggle<T extends string>({
  value,
  options,
  onChange,
  className,
}: ViewToggleProps<T>) {
  return (
    <div className={cn("inline-flex border border-border-strong", className)}>
      {options.map((option) => (
        <FilterChip
          key={option.value}
          active={option.value === value}
          onClick={() => onChange(option.value)}
          className="border-0 border-r border-border-strong last:border-r-0"
          type="button"
        >
          {option.label}
        </FilterChip>
      ))}
    </div>
  );
}
