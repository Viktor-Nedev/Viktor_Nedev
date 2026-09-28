import { site } from '../data/site';

export interface DayCell {
  /** ISO yyyy-mm-dd, or null for the leading blanks in a month grid. */
  iso: string | null;
  day: number;
  selectable: boolean;
}

/** Local-midnight ISO date, avoiding the UTC shift `toISOString()` would add. */
export function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function earliestBookable(): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() + site.booking.leadTimeDays);
  return d;
}

export function latestBookable(): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() + site.booking.horizonDays);
  return d;
}

/** Weekdays only, inside the lead time and booking horizon. */
export function isSelectable(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  const t = startOfDay(date).getTime();
  return t >= earliestBookable().getTime() && t <= latestBookable().getTime();
}

/**
 * Builds a Monday-first month grid.
 *
 * Bulgaria starts the week on Monday, so `getDay()` (Sunday-first) is shifted
 * rather than used directly.
 */
export function buildMonth(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: DayCell[] = [];
  for (let i = 0; i < leading; i++) cells.push({ iso: null, day: 0, selectable: false });
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({ iso: toIso(date), day, selectable: isSelectable(date) });
  }
  return cells;
}

/** True when the given month contains no bookable day at all. */
export function monthHasNoSlots(year: number, month: number): boolean {
  return !buildMonth(year, month).some((c) => c.selectable);
}

/**
 * The month the calendar should open on.
 *
 * Not simply the month containing the first bookable day: late in a month
 * that leaves a grid with one or two open dates and everything else greyed
 * out, which reads as "fully booked". If the current month has fewer than
 * three, open on the next one instead - the visitor can always page back.
 */
export function initialMonth(): { year: number; month: number } {
  const d = earliestBookable();
  const year = d.getFullYear();
  const month = d.getMonth();

  const openDays = buildMonth(year, month).filter((c) => c.selectable).length;
  if (openDays >= 3) return { year, month };

  const next = new Date(year, month + 1, 1);
  return { year: next.getFullYear(), month: next.getMonth() };
}

export function canGoBack(year: number, month: number): boolean {
  const earliest = earliestBookable();
  return year > earliest.getFullYear() || month > earliest.getMonth();
}

export function canGoForward(year: number, month: number): boolean {
  const latest = latestBookable();
  return year < latest.getFullYear() || month < latest.getMonth();
}
