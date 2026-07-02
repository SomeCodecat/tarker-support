"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { AppProvider } from "@/lib/app-context";
import { ProgressProvider } from "@/lib/progress";
import { Header } from "./header";
import { ItemDetailDrawer } from "./item-detail-drawer";
import { MobileTabBar } from "./mobile-tab-bar";
import { OfflineBar } from "./offline-bar";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ProgressProvider>
        <ShellFrame>{children}</ShellFrame>
        <ItemDetailDrawer />
      </ProgressProvider>
    </AppProvider>
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const isNarrow = useMediaQuery("(max-width: 859px)");

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="grid min-h-screen grid-cols-1 min-[860px]:grid-cols-[208px_1fr]">
        {!isNarrow ? <Sidebar /> : null}
        <div className="flex min-h-screen min-w-0 flex-col">
          <Header isNarrow={isNarrow} />
          <OfflineBar />
          <main className="grid-backdrop flex-1 overflow-y-auto px-[12px] pb-[64px] pt-[14px] min-[860px]:px-[26px] min-[860px]:pb-[40px] min-[860px]:pt-[22px]">
            {children}
          </main>
        </div>
      </div>
      {isNarrow ? <MobileTabBar /> : null}
    </div>
  );
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
