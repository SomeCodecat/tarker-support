"use client";

import { useEffect, useRef } from "react";
import { Search, Signal, User, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useApp } from "@/lib/app-context";

interface HeaderProps {
  isNarrow: boolean;
}

export function Header({ isNarrow }: HeaderProps) {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    search,
    setSearch,
    online,
    mobileSearchOpen,
    toggleMobileSearch,
    closeItem,
  } = useApp();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (event.key === "Escape") {
        if (typing && target instanceof HTMLElement) {
          target.blur();
        }
        closeItem();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeItem]);

  const showSearch = !isNarrow || mobileSearchOpen;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex min-h-[48px] items-center gap-[10px] px-[12px] min-[860px]:px-[18px]">
        <div className="min-w-[70px] font-mono text-meta uppercase tracking-[0.08em] text-dim">
          {pathname === "/" ? "/dashboard" : pathname}
        </div>

        <div
          className={cn(
            "relative flex-1",
            showSearch ? "block" : "hidden min-[860px]:block",
          )}
        >
          <Search className="pointer-events-none absolute left-[10px] top-1/2 size-[14px] -translate-y-1/2 text-dim" />
          <input
            id="ts-search"
            ref={inputRef}
            className="h-[30px] w-full border border-border-strong bg-bg px-[30px] font-mono text-meta text-fg outline-none placeholder:text-dim focus:border-accent"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="search items, ammo, tasks... ( / )"
            value={search}
          />
          {search ? (
            <button
              aria-label="Clear search"
              className="absolute right-[8px] top-1/2 -translate-y-1/2 text-dim hover:text-fg"
              onClick={() => setSearch("")}
              type="button"
            >
              <X className="size-[13px]" />
            </button>
          ) : null}
        </div>

        {isNarrow ? (
          <Button
            aria-label="Toggle search"
            onClick={toggleMobileSearch}
            size="icon"
            type="button"
          >
            <Search className="size-[14px]" />
          </Button>
        ) : null}

        <div className="hidden items-center gap-[7px] border border-border-strong bg-bg px-[9px] py-[6px] min-[520px]:flex">
          <User className="size-[13px] text-accent" />
          <span className="font-display text-badge uppercase tracking-[0.08em] text-muted">
            operator
          </span>
          <span className="font-mono text-meta text-dim">guest</span>
        </div>

        <div className="flex items-center gap-[6px] font-mono text-meta uppercase tracking-[0.06em] text-muted min-[860px]:hidden">
          <Signal className={cn("size-[13px]", online ? "text-good" : "text-danger")} />
          <span>{online ? "online" : "offline"}</span>
        </div>
      </div>
    </header>
  );
}
