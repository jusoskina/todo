"use server";

import { getCurrentUserId } from "@/auth";
import { todayDayKey } from "@/lib/dates";
import { processRollovers } from "@/lib/rollover";
import { loadUserAppState, saveUserAppState } from "@/lib/todo-db";
import type { AppState } from "@/lib/types";

export async function fetchAppState(): Promise<AppState | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const state = await loadUserAppState(userId);
  const today = todayDayKey();
  const initialLastProcessed = state.lastProcessedDayKey || today;
  const processed = processRollovers(
    { ...state, lastProcessedDayKey: initialLastProcessed },
    today,
  );

  const changed =
    processed.lastProcessedDayKey !== state.lastProcessedDayKey ||
    JSON.stringify(processed.items) !== JSON.stringify(state.items);

  if (changed) {
    await saveUserAppState(userId, processed);
  }

  return processed;
}

export async function persistAppState(state: AppState): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await saveUserAppState(userId, state);
}

export async function importAppState(state: AppState): Promise<AppState | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const today = todayDayKey();
  const processed = processRollovers(
    {
      ...state,
      lastProcessedDayKey: state.lastProcessedDayKey || today,
    },
    today,
  );
  await saveUserAppState(userId, processed);
  return processed;
}
