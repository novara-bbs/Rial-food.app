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

/**
 * Return a structured relative-time descriptor. The caller is responsible for
 * picking the correct i18n string (`t.social.timeNow`, `timeMinutesAgo`, etc.)
 * and interpolating `{n}`. Keeping the formatter locale-agnostic lets the
 * handler layer run outside a React context.
 */
export type RelativeTime =
  | { kind: 'now' }
  | { kind: 'minutes'; n: number }
  | { kind: 'hours'; n: number }
  | { kind: 'days'; n: number };

export function formatRelative(from: Date | string, now: Date = new Date()): RelativeTime {
  const then = typeof from === 'string' ? new Date(from) : from;
  const diffMs = now.getTime() - then.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return { kind: 'now' };
  if (minutes < 60) return { kind: 'minutes', n: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { kind: 'hours', n: hours };
  const days = Math.floor(hours / 24);
  return { kind: 'days', n: days };
}
