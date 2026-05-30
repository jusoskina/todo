import { todayDayKey } from "./dates";
import { processRollovers } from "./rollover";
import type { AppState } from "./types";

const STORAGE_KEY = "todo-app-state";

export function loadLocalState(): AppState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function clearLocalState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function previewLocalState(): AppState {
  const parsed = loadLocalState();
  if (!parsed) {
    return { items: [], lastProcessedDayKey: todayDayKey() };
  }
  return processRollovers(parsed, todayDayKey());
}
