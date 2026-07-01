"use client";

import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-[4px] border px-[5px] py-[2px] font-display text-badge uppercase tracking-[0.05em]",
  {
    variants: {
      variant: {
        fir: "border-fir-border bg-fir-bg text-fir",
        firUnsure: "border-warn bg-sold-bg text-warn",
        soon: "border-border-strong bg-transparent text-dim",
        kappa: "border-accent bg-transparent text-accent",
        keep: "border-good bg-good-bg text-good",
        sell: "border-danger bg-sold-bg text-danger",
        partial: "border-accent bg-surface-2 text-accent",
        level: "border-border-strong bg-transparent text-muted",
        best: "border-good bg-good text-bg",
        sample: "border-warn bg-transparent text-warn",
      },
    },
    defaultVariants: {
      variant: "level",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children?: ReactNode;
}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "fir" ? <Check className="size-[10px]" strokeWidth={3} /> : null}
      {children ?? defaultBadgeText(variant)}
    </span>
  );
}

function defaultBadgeText(variant: BadgeProps["variant"]): string {
  switch (variant) {
    case "fir":
      return "FIR";
    case "firUnsure":
      return "? verify";
    case "soon":
      return "SOON";
    case "kappa":
      return "\u03BA KAPPA";
    case "keep":
      return "KEEP";
    case "sell":
      return "SELL";
    case "partial":
      return "PARTIAL";
    case "best":
      return "BEST";
    case "sample":
      return "SAMPLE DATA";
    case "level":
    default:
      return "";
  }
}
