import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";

export const DATE_KEY_FORMAT = "yyyy-MM-dd";

export function dateKey(date: Date = new Date()): string {
  return format(date, DATE_KEY_FORMAT);
}

export function parseDateKey(key: string): Date {
  return parseISO(key);
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function formatFriendlyDate(key: string): string {
  return format(parseDateKey(key), "EEE, MMM d");
}

export function weekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function daysOfWeek(date: Date = new Date()): Date[] {
  const { start, end } = weekRange(date);
  return eachDayOfInterval({ start, end });
}

export function isToday(key: string): boolean {
  return isSameDay(parseDateKey(key), new Date());
}

export function addDaysToKey(key: string, amount: number): string {
  return dateKey(addDays(parseDateKey(key), amount));
}
