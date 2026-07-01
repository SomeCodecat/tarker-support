"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DataTableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function DataTable({ children, className, ...props }: DataTableProps) {
  return (
    <table
      className={cn(
        "w-full border-collapse font-sans text-body text-fg [&_tbody_tr:nth-child(odd)]:bg-elevated [&_tbody_tr:nth-child(even)]:bg-surface [&_td]:border-b [&_td]:border-border-subtle [&_td]:px-[10px] [&_td]:py-[8px] [&_th]:border-b [&_th]:border-border [&_th]:px-[10px] [&_th]:py-[8px] [&_th]:text-left [&_th]:font-display [&_th]:text-label [&_th]:uppercase [&_th]:tracking-[0.18em] [&_th]:text-muted",
        className,
      )}
      {...props}
    >
      {children}
    </table>
  );
}

interface SortArrowProps {
  dir?: "asc" | "desc";
}

export function SortArrow({ dir }: SortArrowProps) {
  return <span className="ml-[4px] text-accent">{dir === "asc" ? "↑" : dir === "desc" ? "↓" : ""}</span>;
}
