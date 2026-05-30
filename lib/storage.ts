import { todayDayKey } from "./dates";
import { processRollovers } from "./rollover";
import type { AppState } from "./types";

const STORAGE_KEY = "todo-app-state";

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return { items: [], lastProcessedDayKey: todayDayKey() };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { items: [], lastProcessedDayKey: todayDayKey() };
    }

    const parsed = JSON.parse(raw) as AppState;
    const today = todayDayKey();
    const processed = processRollovers(parsed, today);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(processed));
    return processed;
  } catch {
    return { items: [], lastProcessedDayKey: todayDayKey() };
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
