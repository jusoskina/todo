import {
  addDays,
  formatDayKey,
  formatWeekKey,
  getWeekKeyFromDayKey,
  isMonday,
  parseDayKey,
} from "./dates";
import type { AppState, TodoItem } from "./types";

function minOrder(items: TodoItem[], predicate: (item: TodoItem) => boolean): number {
  const filtered = items.filter(predicate);
  if (filtered.length === 0) return 0;
  return Math.min(...filtered.map((i) => i.order)) - 1;
}

function archiveCompletedFromWeek(items: TodoItem[], weekKey: string): TodoItem[] {
  return items.map((item) => {
    if (item.done && item.location === "archive") return item;

    const inWeek =
      (item.location === "week" && item.weekKey === weekKey) ||
      (item.location === "day" &&
        item.dayKey &&
        getWeekKeyFromDayKey(item.dayKey) === weekKey);

    if (item.done && inWeek) {
      return { ...item, location: "archive" as const };
    }
    return item;
  });
}

function applyWeekRollover(
  items: TodoItem[],
  newWeekKey: string,
  oldWeekKey: string,
): TodoItem[] {
  let next = archiveCompletedFromWeek(items, oldWeekKey);

  const startOrder = minOrder(
    next,
    (i) => i.location === "week" && i.weekKey === newWeekKey && !i.done,
  );

  let insertOrder = startOrder;

  next = next.map((item) => {
    if (item.location === "next-week" && item.weekKey === newWeekKey) {
      const updated = { ...item, location: "week" as const, order: insertOrder };
      insertOrder += 1;
      return updated;
    }
    return item;
  });

  next = next.map((item) => {
    if (item.location === "week" && item.weekKey === oldWeekKey && !item.done) {
      const updated = {
        ...item,
        weekKey: newWeekKey,
        order: insertOrder,
      };
      insertOrder += 1;
      return updated;
    }
    return item;
  });

  return next;
}

function applyDayRollover(
  items: TodoItem[],
  nightOfDayKey: string,
  nextDayKey: string,
): TodoItem[] {
  return items.map((item) => {
    if (
      item.location === "day" &&
      item.dayKey === nightOfDayKey &&
      !item.done
    ) {
      return {
        ...item,
        dayKey: nextDayKey,
        rolledOver: true,
      };
    }
    return item;
  });
}

export function processRollovers(state: AppState, todayDayKey: string): AppState {
  let { items, lastProcessedDayKey } = state;

  if (lastProcessedDayKey >= todayDayKey) {
    return state;
  }

  let cursor = lastProcessedDayKey;

  while (cursor < todayDayKey) {
    const nightOf = cursor;
    const nextDay = formatDayKey(addDays(parseDayKey(nightOf), 1));

    items = applyDayRollover(items, nightOf, nextDay);

    if (isMonday(parseDayKey(nextDay))) {
      const newWeekKey = formatWeekKey(parseDayKey(nextDay));
      const oldWeekKey = formatWeekKey(addDays(parseDayKey(nextDay), -1));
      items = applyWeekRollover(items, newWeekKey, oldWeekKey);
    }

    cursor = nextDay;
  }

  return { items, lastProcessedDayKey: todayDayKey };
}
