"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AppState {
  search: string;
  setSearch(v: string): void;
  online: boolean;
  toggleOnline(): void;
  mobileSearchOpen: boolean;
  toggleMobileSearch(): void;
  selectedItemId: string | null;
  openItem(id: string): void;
  closeItem(): void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const toggleOnline = useCallback(() => setOnline((v) => !v), []);
  const toggleMobileSearch = useCallback(() => setMobileSearchOpen((v) => !v), []);
  const openItem = useCallback((id: string) => setSelectedItemId(id), []);
  const closeItem = useCallback(() => setSelectedItemId(null), []);

  const value = useMemo<AppState>(
    () => ({
      search,
      setSearch,
      online,
      toggleOnline,
      mobileSearchOpen,
      toggleMobileSearch,
      selectedItemId,
      openItem,
      closeItem,
    }),
    [closeItem, mobileSearchOpen, online, openItem, search, toggleMobileSearch, toggleOnline],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
