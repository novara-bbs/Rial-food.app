/**
 * Canonical weekly macro aggregation — Q13.
 *
 * Replaced three independent implementations (now removed):
 *   - features/home/utils/homeWidgets.ts → calcWeeklyProgress (removed Q15)
 *   - features/wellness/screens/Progress.tsx (inline)
 *   - features/wellness/screens/WeeklyReview.tsx (inline)
 *
 * Week bounds: Sunday-start (dayOfWeek === 0), matches WeeklyReview + Home.
 * Anchored to local calendar date via `dateToLocal()`.
 * `weekOffset` selects which week: 0 = current, 1 = previous.
 */
import type { DailyArchive } from '../../../hooks/useDailyReset';
import { dateToLocal } from '../../../lib/dates';

export interface MacroTarget {
  cal: number;
  pro: number;
  carbs: number;
  fats: number;
}

export interface WeekMacroStats {
  /** Average of consumed macros across daysLogged. Zero for empty weeks. */
  avg: MacroTarget;
  /** % of target reached on average (0–200+). 0 when target is 0. */
  adherence: MacroTarget;
  /** Count of days that reached each macro target. */
  hitDays: MacroTarget;
  /** Number of archive entries that fell in the week window. */
  daysLogged: number;
  /** Window bounds for debugging / captions (YYYY-MM-DD). */
  weekStart: string;
  weekEnd: string;
  /** % delta vs. the week before (`null` if previous week has no data). */
  deltaVsPrev: { cal: number | null; pro: number | null };
}

const DAY_MS = 86_400_000;
const ZERO: MacroTarget = { cal: 0, pro: 0, carbs: 0, fats: 0 };

const iso = dateToLocal;

function weekBoundsForOffset(offset: number, now: Date): { start: string; end: string } {
  // Sunday = 0
  const dayOfWeek = now.getDay();
  const thisWeekStart = new Date(now.getTime() - dayOfWeek * DAY_MS);
  const startDate = new Date(thisWeekStart.getTime() - offset * 7 * DAY_MS);
  const endDate = new Date(startDate.getTime() + 6 * DAY_MS);
  return { start: iso(startDate), end: iso(endDate) };
}

function sumMacros(days: DailyArchive[]): MacroTarget {
  return days.reduce<MacroTarget>((acc, h) => {
    const c = h.macros?.consumed ?? ZERO;
    return {
      cal: acc.cal + (c.cal || 0),
      pro: acc.pro + (c.pro || 0),
      carbs: acc.carbs + (c.carbs || 0),
      fats: acc.fats + (c.fats || 0),
    };
  }, { ...ZERO });
}

function avgMacros(days: DailyArchive[]): MacroTarget {
  if (days.length === 0) return { ...ZERO };
  const sum = sumMacros(days);
  return {
    cal: Math.round(sum.cal / days.length),
    pro: Math.round(sum.pro / days.length),
    carbs: Math.round(sum.carbs / days.length),
    fats: Math.round(sum.fats / days.length),
  };
}

function pctOf(value: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.round((value / target) * 100);
}

/**
 * @param history  Daily archive (order-independent, filtered by date).
 * @param target   Canonical macro target for the period.
 * @param weekOffset 0 = current week, 1 = previous week, etc.
 * @param now      Injectable clock for tests. Defaults to `new Date()`.
 */
export function calcWeekMacros(
  history: DailyArchive[],
  target: MacroTarget,
  weekOffset: number = 0,
  now: Date = new Date(),
): WeekMacroStats {
  const { start, end } = weekBoundsForOffset(weekOffset, now);

  const daysInWindow = (history || []).filter(h => h.date >= start && h.date <= end);
  const avg = avgMacros(daysInWindow);

  const adherence: MacroTarget = {
    cal: pctOf(avg.cal, target.cal),
    pro: pctOf(avg.pro, target.pro),
    carbs: pctOf(avg.carbs, target.carbs),
    fats: pctOf(avg.fats, target.fats),
  };

  const hitDays: MacroTarget = {
    cal: daysInWindow.filter(d => (d.macros?.consumed?.cal || 0) >= (target.cal || Infinity)).length,
    pro: daysInWindow.filter(d => (d.macros?.consumed?.pro || 0) >= (target.pro || Infinity)).length,
    carbs: daysInWindow.filter(d => (d.macros?.consumed?.carbs || 0) >= (target.carbs || Infinity)).length,
    fats: daysInWindow.filter(d => (d.macros?.consumed?.fats || 0) >= (target.fats || Infinity)).length,
  };

  // Delta vs. previous week (only for weekOffset === 0 — the usual case)
  let deltaVsPrev: WeekMacroStats['deltaVsPrev'] = { cal: null, pro: null };
  if (weekOffset === 0) {
    const prev = weekBoundsForOffset(1, now);
    const prevDays = (history || []).filter(h => h.date >= prev.start && h.date <= prev.end);
    if (prevDays.length > 0) {
      const prevAvg = avgMacros(prevDays);
      const deltaPct = (curr: number, p: number) => (p > 0 ? Math.round(((curr - p) / p) * 100) : null);
      deltaVsPrev = {
        cal: deltaPct(avg.cal, prevAvg.cal),
        pro: deltaPct(avg.pro, prevAvg.pro),
      };
    }
  }

  return {
    avg,
    adherence,
    hitDays,
    daysLogged: daysInWindow.length,
    weekStart: start,
    weekEnd: end,
    deltaVsPrev,
  };
}
