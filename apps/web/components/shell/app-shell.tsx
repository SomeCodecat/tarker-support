"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppProvider } from "@/lib/app-context";
import { Header } from "./header";
import { ItemDetailDrawer } from "./item-detail-drawer";
import { MobileTabBar } from "./mobile-tab-bar";
import { OfflineBar } from "./offline-bar";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ShellFrame>{children}</ShellFrame>
      <ItemDetailDrawer />
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
  const [mounted, setMounted] = useState(false);
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return mounted ? matches : false;
}
