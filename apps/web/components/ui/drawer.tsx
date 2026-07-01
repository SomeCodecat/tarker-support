"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DrawerProps {
  open: boolean;
  onClose(): void;
  header: ReactNode;
  children: ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, header, children, width = "420px" }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <>
      <button
        aria-label="Close drawer"
        className="fixed inset-0 z-40 cursor-default bg-[rgba(6,8,7,.6)]"
        onClick={onClose}
        type="button"
      />
      <aside
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 flex max-w-full flex-col border-l border-border-strong bg-surface shadow-[-15px_0_60px_rgba(0,0,0,.5)]",
          "w-full min-[860px]:w-[var(--drawer-width)]",
        )}
        style={{ "--drawer-width": width } as React.CSSProperties}
      >
        <div className="border-b border-border">{header}</div>
        <div className="flex-1 overflow-y-auto px-[18px] py-[16px]">{children}</div>
      </aside>
    </>
  );
}
