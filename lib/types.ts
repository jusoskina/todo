export type ItemLocation = "week" | "day" | "future" | "next-week" | "archive";

export interface TodoItem {
  id: string;
  title: string;
  done: boolean;
  location: ItemLocation;
  weekKey: string | null;
  dayKey: string | null;
  order: number;
  rolledOver: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface AppState {
  items: TodoItem[];
  lastProcessedDayKey: string;
}

/** Column id: `week`, `today`, or `day-YYYY-MM-DD` */
export type BoardColumnId = "week" | "today" | `day-${string}`;

export function dayColumnId(dayKey: string): BoardColumnId {
  return `day-${dayKey}`;
}

export function isDayColumnId(id: string): id is `day-${string}` {
  return id.startsWith("day-");
}

export function dayKeyFromColumnId(id: string, todayKey: string): string | null {
  if (id === "today") return todayKey;
  if (isDayColumnId(id)) return id.slice(4);
  return null;
}

export function columnIdForItem(
  item: TodoItem,
  todayKey: string,
  weekKey: string,
): BoardColumnId | null {
  if (item.location === "week" && item.weekKey === weekKey) return "week";
  if (item.location === "day" && item.dayKey === todayKey) return "today";
  if (item.location === "day" && item.dayKey) return dayColumnId(item.dayKey);
  return null;
}

export function columnIdFromDropTarget(
  id: string,
  items: TodoItem[],
  todayKey: string,
  weekKey: string,
): BoardColumnId | null {
  if (id === "week" || id === "today" || isDayColumnId(id)) return id as BoardColumnId;
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  return columnIdForItem(item, todayKey, weekKey);
}

export function itemMatchesColumn(
  item: TodoItem,
  columnId: BoardColumnId | "future" | "next-week",
  todayKey: string,
  weekKey: string,
  nextWeekKeyValue: string,
): boolean {
  if (columnId === "week") return item.location === "week" && item.weekKey === weekKey;
  if (columnId === "today") return item.location === "day" && item.dayKey === todayKey;
  if (columnId === "future") return item.location === "future";
  if (columnId === "next-week") {
    return item.location === "next-week" && item.weekKey === nextWeekKeyValue;
  }
  if (isDayColumnId(columnId)) {
    const dk = columnId.slice(4);
    return item.location === "day" && item.dayKey === dk;
  }
  return false;
}
