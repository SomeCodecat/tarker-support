"use client";

import { Button } from "@/components/ui";
import { useApp } from "@/lib/app-context";

export function OfflineBar() {
  const { online, toggleOnline } = useApp();

  if (online) return null;

  return (
    <div className="flex min-h-[30px] items-center justify-between gap-[12px] border-b border-danger bg-sold-bg px-[12px] font-mono text-meta uppercase tracking-[0.08em] text-danger min-[860px]:px-[18px]">
      <span>tarkov.dev unreachable - showing cached data</span>
      <Button onClick={toggleOnline} size="sm" type="button" variant="ghost">
        retry
      </Button>
    </div>
  );
}
