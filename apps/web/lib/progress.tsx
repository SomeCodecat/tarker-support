"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface ProgressState {
  pmcLevel: number;
  completed: Record<string, boolean>;
  hideout: Record<string, number>;
}

const STORAGE_KEY = "tarker.progress.v1";

const DEFAULT_PROGRESS: ProgressState = {
  pmcLevel: 15,
  completed: {},
  hideout: {},
};

interface ProgressApi {
  progress: ProgressState;
  setPmc(delta: number): void;
  toggleTask(taskId: string): void;
  setStationLevel(stationId: string, level: number): void;
  resetProgress(): void;
}

const ProgressContext = createContext<ProgressApi | null>(null);

function parseStored(rawValue: string | null): ProgressState | null {
  if (!rawValue) return null;
  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (typeof parsed !== "object" || parsed === null) return null;
    const candidate = parsed as Partial<ProgressState>;
    if (typeof candidate.pmcLevel !== "number") return null;
    return {
      pmcLevel: Math.max(1, Math.min(79, Math.round(candidate.pmcLevel))),
      completed:
        typeof candidate.completed === "object" && candidate.completed !== null
          ? candidate.completed
          : {},
      hideout:
        typeof candidate.hideout === "object" && candidate.hideout !== null
          ? candidate.hideout
          : {},
    };
  } catch {
    return null;
  }
}

// Module-level external store: the snapshot renders through useSyncExternalStore,
// so the server/hydration pass sees DEFAULT_PROGRESS and the client re-renders
// once with the stored state — no setState-in-effect.
let snapshot: ProgressState = DEFAULT_PROGRESS;
let hydrated = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ProgressState {
  if (!hydrated) {
    hydrated = true;
    const stored = parseStored(window.localStorage.getItem(STORAGE_KEY));
    if (stored) snapshot = stored;
  }
  return snapshot;
}

function getServerSnapshot(): ProgressState {
  return DEFAULT_PROGRESS;
}

function update(updater: (current: ProgressState) => ProgressState): void {
  snapshot = updater(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage unavailable (private mode / quota) — state stays in-memory
  }
  for (const listener of listeners) listener();
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setPmc = useCallback((delta: number) => {
    update((current) => ({
      ...current,
      pmcLevel: Math.max(1, Math.min(79, current.pmcLevel + delta)),
    }));
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    update((current) => ({
      ...current,
      completed: { ...current.completed, [taskId]: !current.completed[taskId] },
    }));
  }, []);

  const setStationLevel = useCallback((stationId: string, level: number) => {
    update((current) => {
      const currentLevel = current.hideout[stationId] ?? 0;
      return {
        ...current,
        hideout: {
          ...current.hideout,
          [stationId]: level === currentLevel ? level - 1 : level,
        },
      };
    });
  }, []);

  const resetProgress = useCallback(() => update(() => DEFAULT_PROGRESS), []);

  const value = useMemo<ProgressApi>(
    () => ({ progress, setPmc, toggleTask, setStationLevel, resetProgress }),
    [progress, resetProgress, setPmc, setStationLevel, toggleTask],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
