/**
 * Top-meals aggregation — shared between Progress "Tus comidas estrella"
 * card and the weekly-insights banner.
 *
 * Extracted from `Progress.tsx` inline useMemo (Q13 coherence — one
 * aggregator, multiple consumers). Window defaults to the current
 * Sunday-start week, matching `calcWeekMacros` semantics.
 */
import type { DailyArchive } from '../../../hooks/useDailyReset';

export interface TopMeal {
  name: string;
  count: number;
  totalCal: number;
}

const DAY_MS = 86_400_000;

/** Sunday-start week boundary in YYYY-MM-DD. Matches `week-stats.ts`. */
function weekStartISO(now: Date): string {
  const ws = new Date(now);
  ws.setDate(now.getDate() - now.getDay());
  ws.setHours(0, 0, 0, 0);
  return ws.toISOString().slice(0, 10);
}

/**
 * @param history    Archived days (pre-today).
 * @param dailyLog   Today's in-progress log (unarchived entries).
 * @param now        Injectable clock for tests.
 * @param windowDays Rolling window size. Default `0` = use current week
 *                   (Sunday-start). Positive N uses last-N-days rolling.
 * @param limit      Max items returned. Default 3.
 */
export function calcTopMeals(
  history: DailyArchive[],
  dailyLog: any[],
  now: Date = new Date(),
  windowDays: number = 0,
  limit: number = 3,
): TopMeal[] {
  const cutoff = windowDays > 0
    ? new Date(now.getTime() - windowDays * DAY_MS).toISOString().slice(0, 10)
    : weekStartISO(now);

  const counts: Record<string, TopMeal> = {};

  const bump = (name: string, cal: number) => {
    if (!name) return;
    if (!counts[name]) counts[name] = { name, count: 0, totalCal: 0 };
    counts[name].count += 1;
    counts[name].totalCal += cal || 0;
  };

  for (const archive of history) {
    if (archive.date < cutoff) continue;
    for (const entry of (archive.dailyLog || [])) {
      const name = entry.title || entry.name;
      bump(name, entry.macros?.cal || 0);
    }
  }
  for (const entry of (dailyLog || [])) {
    const name = (entry as any).title || (entry as any).name;
    bump(name, (entry as any).macros?.cal || 0);
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count || b.totalCal - a.totalCal)
    .slice(0, limit);
}
