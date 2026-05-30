"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { nextWeekKey, todayDayKey, todayWeekKey, tomorrowDayKey } from "@/lib/dates";
import { processRollovers } from "@/lib/rollover";
import { loadState, saveState } from "@/lib/storage";
import {
  createItem,
  dayItems,
  nextDoneOrder,
  nextOrder,
  nextWeekItems,
  weekItems,
} from "@/lib/todo-utils";
import type {
  AppState,
  BoardColumnId,
  ItemLocation,
  TodoItem,
} from "@/lib/types";
import { dayKeyFromColumnId, itemMatchesColumn } from "@/lib/types";

interface TodoContextValue {
  items: TodoItem[];
  dayKey: string;
  weekKey: string;
  nextWeekKeyValue: string;
  addItem: (
    title: string,
    location: ItemLocation,
    weekKey?: string | null,
    dayKey?: string | null,
  ) => void;
  toggleDone: (id: string) => void;
  deleteItem: (id: string) => void;
  moveToFuture: (id: string) => void;
  moveToNextWeek: (id: string) => void;
  moveToWeek: (id: string) => void;
  moveToToday: (id: string) => void;
  moveToDay: (id: string, targetDayKey: string) => void;
  moveToTomorrow: (id: string) => void;
  reorderInColumn: (
    column: BoardColumnId | "future" | "next-week",
    activeId: string,
    overId: string,
  ) => void;
  moveBetweenColumns: (
    itemId: string,
    to: BoardColumnId,
    overId?: string,
  ) => void;
  getWeekList: () => TodoItem[];
  getNextWeekList: () => TodoItem[];
}

const TodoContext = createContext<TodoContextValue | null>(null);

function updateState(
  prev: AppState,
  updater: (items: TodoItem[]) => TodoItem[],
): AppState {
  const today = todayDayKey();
  const next = {
    items: updater(prev.items),
    lastProcessedDayKey: prev.lastProcessedDayKey,
  };
  return processRollovers(next, today);
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => ({
    items: [],
    lastProcessedDayKey: todayDayKey(),
  }));
  const [hydrated, setHydrated] = useState(false);

  const dayKey = todayDayKey();
  const weekKey = todayWeekKey();
  const nextWeekKeyValue = nextWeekKey();

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => processRollovers(prev, todayDayKey()));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const addItem = useCallback(
    (
      title: string,
      location: ItemLocation,
      itemWeekKey: string | null = null,
      itemDayKey: string | null = null,
    ) => {
      if (!title.trim()) return;
      setState((prev) =>
        updateState(prev, (items) => {
          const wk =
            location === "week"
              ? weekKey
              : location === "next-week"
                ? nextWeekKeyValue
                : itemWeekKey;
          const dk = location === "day" ? (itemDayKey ?? dayKey) : itemDayKey;
          return [...items, createItem(title, { location, weekKey: wk, dayKey: dk }, items)];
        }),
      );
    },
    [dayKey, weekKey, nextWeekKeyValue],
  );

  const toggleDone = useCallback((id: string) => {
    setState((prev) =>
      updateState(prev, (items) =>
        items.map((item) => {
          if (item.id !== id) return item;
          if (item.done) {
            return {
              ...item,
              done: false,
              completedAt: null,
              order: nextOrder(items.filter((i) => !i.done && sameBucket(i, item))),
            };
          }
          return {
            ...item,
            done: true,
            completedAt: new Date().toISOString(),
            order: nextDoneOrder(items.filter((i) => sameBucket(i, item))),
          };
        }),
      ),
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setState((prev) => updateState(prev, (items) => items.filter((i) => i.id !== id)));
  }, []);

  const moveToFuture = useCallback((id: string) => {
    setState((prev) =>
      updateState(prev, (items) =>
        items.map((item) => {
          if (item.id !== id) return item;
          const pool = items.filter((i) => i.location === "future");
          return {
            ...item,
            location: "future",
            weekKey: null,
            dayKey: null,
            rolledOver: false,
            order: nextOrder(pool),
          };
        }),
      ),
    );
  }, []);

  const moveToNextWeek = useCallback(
    (id: string) => {
      setState((prev) =>
        updateState(prev, (items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const pool = nextWeekItems(items, nextWeekKeyValue);
            return {
              ...item,
              location: "next-week",
              weekKey: nextWeekKeyValue,
              dayKey: null,
              rolledOver: false,
              order: nextOrder(pool),
            };
          }),
        ),
      );
    },
    [nextWeekKeyValue],
  );

  const moveToWeek = useCallback(
    (id: string) => {
      setState((prev) =>
        updateState(prev, (items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const pool = weekItems(items, weekKey);
            return {
              ...item,
              location: "week",
              weekKey,
              dayKey: null,
              rolledOver: false,
              order: nextOrder(pool),
            };
          }),
        ),
      );
    },
    [weekKey],
  );

  const moveToToday = useCallback(
    (id: string) => {
      setState((prev) =>
        updateState(prev, (items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const pool = items.filter(
              (i) => i.location === "day" && i.dayKey === dayKey,
            );
            return {
              ...item,
              location: "day",
              weekKey: null,
              dayKey,
              order: nextOrder(pool),
            };
          }),
        ),
      );
    },
    [dayKey],
  );

  const moveToDay = useCallback(
    (id: string, targetDayKey: string) => {
      setState((prev) =>
        updateState(prev, (items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const pool = dayItems(items, targetDayKey);
            return {
              ...item,
              location: "day",
              weekKey: null,
              dayKey: targetDayKey,
              rolledOver: false,
              order: nextOrder(pool),
            };
          }),
        ),
      );
    },
    [],
  );

  const moveToTomorrow = useCallback(
    (id: string) => {
      moveToDay(id, tomorrowDayKey(dayKey));
    },
    [dayKey, moveToDay],
  );

  const reorderInColumn = useCallback(
    (
      column: BoardColumnId | "future" | "next-week",
      activeId: string,
      overId: string,
    ) => {
      if (activeId === overId) return;
      setState((prev) =>
        updateState(prev, (items) => {
          const active = items.find((i) => i.id === activeId);
          const over = items.find((i) => i.id === overId);
          if (!active || !over) return items;

          const columnItems = items.filter((i) =>
            itemMatchesColumn(i, column, dayKey, weekKey, nextWeekKeyValue),
          );
          const activeIdx = columnItems.findIndex((i) => i.id === activeId);
          const overIdx = columnItems.findIndex((i) => i.id === overId);
          if (activeIdx === -1 || overIdx === -1) return items;

          const reordered = [...columnItems];
          const [removed] = reordered.splice(activeIdx, 1);
          reordered.splice(overIdx, 0, removed);

          const orderMap = new Map(reordered.map((item, idx) => [item.id, idx]));
          return items.map((item) =>
            orderMap.has(item.id) ? { ...item, order: orderMap.get(item.id)! } : item,
          );
        }),
      );
    },
    [dayKey, weekKey, nextWeekKeyValue],
  );

  const moveBetweenColumns = useCallback(
    (itemId: string, to: BoardColumnId, overId?: string) => {
      setState((prev) =>
        updateState(prev, (items) => {
          const item = items.find((i) => i.id === itemId);
          if (!item) return items;

          const updated = applyColumnMove(item, to, items, dayKey, weekKey, overId);
          const nextItems = items.map((i) => (i.id === itemId ? updated : i));

          if (overId && overId !== itemId) {
            const columnItems = nextItems.filter((i) =>
              itemMatchesColumn(i, to, dayKey, weekKey, nextWeekKeyValue),
            );
            const activeIdx = columnItems.findIndex((i) => i.id === itemId);
            const overIdx = columnItems.findIndex((i) => i.id === overId);
            if (activeIdx !== -1 && overIdx !== -1) {
              const reordered = [...columnItems];
              const [removed] = reordered.splice(activeIdx, 1);
              reordered.splice(overIdx, 0, removed);
              const orderMap = new Map(reordered.map((it, idx) => [it.id, idx]));
              return nextItems.map((it) =>
                orderMap.has(it.id) ? { ...it, order: orderMap.get(it.id)! } : it,
              );
            }
          }
          return nextItems;
        }),
      );
    },
    [dayKey, weekKey, nextWeekKeyValue],
  );

  const value = useMemo<TodoContextValue>(
    () => ({
      items: state.items,
      dayKey,
      weekKey,
      nextWeekKeyValue,
      addItem,
      toggleDone,
      deleteItem,
      moveToFuture,
      moveToNextWeek,
      moveToWeek,
      moveToToday,
      moveToDay,
      moveToTomorrow,
      reorderInColumn,
      moveBetweenColumns,
      getWeekList: () => weekItems(state.items, weekKey),
      getNextWeekList: () => nextWeekItems(state.items, nextWeekKeyValue),
    }),
    [
      state.items,
      dayKey,
      weekKey,
      nextWeekKeyValue,
      addItem,
      toggleDone,
      deleteItem,
      moveToFuture,
      moveToNextWeek,
      moveToWeek,
      moveToToday,
      moveToDay,
      moveToTomorrow,
      reorderInColumn,
      moveBetweenColumns,
    ],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodos must be used within TodoProvider");
  return ctx;
}

function sameBucket(a: TodoItem, b: TodoItem): boolean {
  if (a.location !== b.location) return false;
  if (a.location === "day") return a.dayKey === b.dayKey;
  if (a.location === "week" || a.location === "next-week") return a.weekKey === b.weekKey;
  if (a.location === "future") return true;
  return a.weekKey === b.weekKey;
}

function applyColumnMove(
  item: TodoItem,
  to: BoardColumnId,
  items: TodoItem[],
  todayKey: string,
  weekKey: string,
  overId?: string,
): TodoItem {
  if (to === "week") {
    const pool = weekItems(items, weekKey);
    return {
      ...item,
      location: "week",
      weekKey,
      dayKey: null,
      rolledOver: false,
      order: overId
        ? (pool.find((i) => i.id === overId)?.order ?? nextOrder(pool))
        : nextOrder(pool),
    };
  }

  const targetDayKey = dayKeyFromColumnId(to, todayKey);
  if (!targetDayKey) return item;

  const pool = dayItems(items, targetDayKey);
  return {
    ...item,
    location: "day",
    weekKey: null,
    dayKey: targetDayKey,
    rolledOver: false,
    order: overId
      ? (pool.find((i) => i.id === overId)?.order ?? nextOrder(pool))
      : nextOrder(pool),
  };
}
