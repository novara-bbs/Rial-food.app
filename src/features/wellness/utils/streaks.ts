/**
 * Canonical streak calculators — Q13.
 *
 * Two semantically different streaks previously lived in separate files:
 *   - features/profile/utils/gamification.ts → calculateStreak()
 *     (Real-Feel reflection streak)
 *   - hooks/useDailyReset.ts → getLoggingStreak()
 *     (meal-log streak, gated by `mealCount > 0`)
 *
 * `calcStreaks` returns both so UI can pick the right one without
 * importing from two modules.
 */
import type { DailyArchive } from '../../../hooks/useDailyReset';
import { todayLocal } from '../../../lib/dates';

export interface StreakPair {
  current: number;
  best: number;
}

export interface Streaks {
  /** Consecutive days with meals logged (ends if yesterday has no entries and today is empty). */
  mealLog: StreakPair;
  /** Consecutive days with a Real-Feel reflection logged. */
  realFeel: StreakPair;
}

const DAY_MS = 86_400_000;

/**
 * Generic day-streak computer over a set of YYYY-MM-DD strings.
 * Tolerates duplicates and unsorted inputs.
 *
 * The streak ends if the latest logged day is strictly more than
 * one day before "today" (i.e., yesterday is the latest acceptable
 * last-logged day for the streak to stay alive).
 */
function streakFromDates(dates: string[], referenceToday: string): StreakPair {
  if (!dates || dates.length === 0) return { current: 0, best: 0 };

  // Normalise → unique → sorted descending
  const unique = [...new Set(dates.filter(Boolean))].sort().reverse();
  if (unique.length === 0) return { current: 0, best: 0 };

  // Best across history
  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = Date.parse(unique[i - 1]);
    const curr = Date.parse(unique[i]);
    if (Number.isNaN(prev) || Number.isNaN(curr)) continue;
    const gap = Math.round((prev - curr) / DAY_MS);
    if (gap === 1) {
      run++;
    } else {
      if (run > best) best = run;
      run = 1;
    }
  }
  if (run > best) best = run;

  // Current streak from the end, only if last logged day is today or yesterday
  const todayMs = Date.parse(referenceToday);
  const latestMs = Date.parse(unique[0]);
  const gapFromToday = Math.round((todayMs - latestMs) / DAY_MS);
  if (gapFromToday > 1) return { current: 0, best };

  let current = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = Date.parse(unique[i - 1]);
    const curr = Date.parse(unique[i]);
    if (Number.isNaN(prev) || Number.isNaN(curr)) break;
    const gap = Math.round((prev - curr) / DAY_MS);
    if (gap === 1) current++;
    else break;
  }
  return { current, best };
}

interface CalcStreaksInput {
  /** Archived day entries; meal streak counts days with `mealCount > 0`. */
  history: DailyArchive[];
  /** Real-Feel log objects — anything with `.date` (ISO or `YYYY-MM-DD`). */
  realFeelLogs: Array<{ date?: string }>;
  /** Whether today has at least one meal logged; lets the streak include today. */
  todayHasMeals?: boolean;
  /** Whether today has a Real-Feel entry already (else yesterday is the newest). */
  todayHasRealFeel?: boolean;
  /** Injectable clock for tests. */
  now?: Date;
}

export function calcStreaks(input: CalcStreaksInput): Streaks {
  const now = input.now ?? new Date();
  const today = todayLocal(now);

  // Meal-log dates from archive; add today if flagged.
  const mealDates = (input.history || [])
    .filter(h => (h.mealCount ?? 0) > 0)
    .map(h => h.date);
  if (input.todayHasMeals) mealDates.push(today);

  // Real-Feel dates: strip to YYYY-MM-DD; accept full ISO as well.
  const realFeelDates = (input.realFeelLogs || [])
    .map(l => (typeof l.date === 'string' ? l.date.slice(0, 10) : ''))
    .filter(Boolean);
  if (input.todayHasRealFeel) realFeelDates.push(today);

  return {
    mealLog: streakFromDates(mealDates, today),
    realFeel: streakFromDates(realFeelDates, today),
  };
}
