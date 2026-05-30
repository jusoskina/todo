import { getWeekKeyFromDayKey, todayDayKey, todayWeekKey } from "./dates";
import type { TodoItem } from "./types";

export function sortItemsForDisplay(items: TodoItem[]): TodoItem[] {
  const incomplete = items.filter((i) => !i.done).sort((a, b) => a.order - b.order);
  const done = items.filter((i) => i.done).sort((a, b) => a.order - b.order);
  return [...incomplete, ...done];
}

export function nextOrder(items: TodoItem[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((i) => i.order)) + 1;
}

export function nextDoneOrder(items: TodoItem[]): number {
  const done = items.filter((i) => i.done);
  if (done.length === 0) return 10000;
  return Math.max(...done.map((i) => i.order)) + 1;
}

export function weekItems(items: TodoItem[], weekKey: string): TodoItem[] {
  return sortItemsForDisplay(
    items.filter((i) => i.location === "week" && i.weekKey === weekKey),
  );
}

export function todayActiveItems(items: TodoItem[], dayKey: string): TodoItem[] {
  return sortItemsForDisplay(
    items.filter((i) => i.location === "day" && i.dayKey === dayKey),
  );
}

export function dayItems(items: TodoItem[], dayKey: string): TodoItem[] {
  return sortItemsForDisplay(
    items.filter((i) => i.location === "day" && i.dayKey === dayKey),
  );
}

export function todayCompletedEarlierItems(
  items: TodoItem[],
  dayKey: string,
  weekKey: string,
): TodoItem[] {
  return items
    .filter(
      (i) =>
        i.location === "day" &&
        i.done &&
        i.dayKey !== dayKey &&
        i.dayKey &&
        getWeekKeyFromDayKey(i.dayKey) === weekKey,
    )
    .sort((a, b) => (a.dayKey ?? "").localeCompare(b.dayKey ?? "") || a.order - b.order);
}

export function futureItems(items: TodoItem[]): TodoItem[] {
  return sortItemsForDisplay(items.filter((i) => i.location === "future"));
}

export function nextWeekItems(items: TodoItem[], weekKey: string): TodoItem[] {
  return sortItemsForDisplay(
    items.filter((i) => i.location === "next-week" && i.weekKey === weekKey),
  );
}

export function archivedWeeks(items: TodoItem[]): Map<string, TodoItem[]> {
  const map = new Map<string, TodoItem[]>();
  const archived = items.filter((i) => i.location === "archive" && i.done);

  for (const item of archived) {
    const key =
      item.weekKey ??
      (item.dayKey ? getWeekKeyFromDayKey(item.dayKey) : todayWeekKey());
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }

  for (const [key, list] of map) {
    map.set(
      key,
      list.sort(
        (a, b) =>
          (a.dayKey ?? "").localeCompare(b.dayKey ?? "") || a.order - b.order,
      ),
    );
  }

  return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

export function createItem(
  title: string,
  partial: Pick<TodoItem, "location" | "weekKey" | "dayKey"> & {
    order?: number;
  },
  existing: TodoItem[],
): TodoItem {
  const pool = existing.filter(
    (i) =>
      i.location === partial.location &&
      i.weekKey === partial.weekKey &&
      i.dayKey === partial.dayKey,
  );

  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    done: false,
    location: partial.location,
    weekKey: partial.weekKey,
    dayKey: partial.dayKey,
    order: partial.order ?? nextOrder(pool),
    rolledOver: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function currentDayKey(): string {
  return todayDayKey();
}

export function currentWeekKey(): string {
  return todayWeekKey();
}
