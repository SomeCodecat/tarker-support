"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[7px] border font-display uppercase tracking-[0.08em] transition-colors disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "border-accent bg-accent text-accent-ink hover:bg-warn",
        ghost: "border-border-strong bg-transparent text-muted hover:border-faint hover:text-fg",
        danger: "border-danger bg-transparent text-danger hover:bg-sold-bg",
      },
      size: {
        sm: "h-[24px] px-[9px] text-badge",
        md: "h-[30px] px-[12px] text-nav",
        icon: "size-[30px] p-0 text-nav",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
