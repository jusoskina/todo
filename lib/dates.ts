const DAY_MS = 24 * 60 * 60 * 1000;

export function formatDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekKey(date: Date): string {
  return formatDayKey(getMonday(date));
}

export function getWeekKeyFromDayKey(dayKey: string): string {
  return formatWeekKey(parseDayKey(dayKey));
}

export function getNextWeekKey(weekKey: string): string {
  return formatWeekKey(addDays(parseDayKey(weekKey), 7));
}

export function getPreviousWeekKey(weekKey: string): string {
  return formatWeekKey(addDays(parseDayKey(weekKey), -7));
}

export function isMonday(date: Date): boolean {
  return date.getDay() === 1;
}

export function dayKeysInWeek(weekKey: string): string[] {
  const monday = parseDayKey(weekKey);
  return Array.from({ length: 7 }, (_, i) => formatDayKey(addDays(monday, i)));
}

export function isDayInWeek(dayKey: string, weekKey: string): boolean {
  return dayKeysInWeek(weekKey).includes(dayKey);
}

export function formatDisplayDate(dayKey: string): {
  weekday: string;
  date: string;
} {
  const date = parseDayKey(dayKey);
  return {
    weekday: date.toLocaleDateString(undefined, { weekday: "long" }),
    date: date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export function formatWeekRange(weekKey: string): string {
  const monday = parseDayKey(weekKey);
  const sunday = addDays(monday, 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

export function todayDayKey(): string {
  return formatDayKey(new Date());
}

export function todayWeekKey(): string {
  return formatWeekKey(new Date());
}

export function nextWeekKey(): string {
  return getNextWeekKey(todayWeekKey());
}

export function compareDayKeys(a: string, b: string): number {
  return parseDayKey(a).getTime() - parseDayKey(b).getTime();
}

export function daysBetween(fromDayKey: string, toDayKey: string): number {
  const from = parseDayKey(fromDayKey).getTime();
  const to = parseDayKey(toDayKey).getTime();
  return Math.round((to - from) / DAY_MS);
}

/** Days after `fromDayKey` through end of the Mon–Sun week (exclusive of fromDayKey). */
export function upcomingDayKeysInWeek(weekKey: string, fromDayKey: string): string[] {
  const all = dayKeysInWeek(weekKey);
  return all.filter((dk) => compareDayKeys(dk, fromDayKey) > 0);
}

export function tomorrowDayKey(fromDayKey: string): string {
  return formatDayKey(addDays(parseDayKey(fromDayKey), 1));
}

export function columnHeading(dayKey: string, todayKey: string): {
  title: string;
  subtitle: string;
} {
  const tomorrow = tomorrowDayKey(todayKey);
  const { weekday, date } = formatDisplayDate(dayKey);
  if (dayKey === tomorrow) {
    return { title: "Tomorrow", subtitle: date };
  }
  return { title: weekday, subtitle: date };
}

