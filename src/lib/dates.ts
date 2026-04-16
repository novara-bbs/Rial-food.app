/**
 * Canonical local-date helpers — Q15.
 *
 * All production code that needs "today" as YYYY-MM-DD should use these
 * instead of `new Date().toISOString().slice(0, 10)` (which returns UTC).
 *
 * The offset trick converts a Date to the user's local calendar date
 * before extracting the ISO string, so midnight boundaries are correct.
 */

/** Return YYYY-MM-DD in the user's local timezone. */
export function dateToLocal(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

/** Shorthand for `dateToLocal(new Date())`. Injectable clock for tests. */
export function todayLocal(now: Date = new Date()): string {
  return dateToLocal(now);
}
