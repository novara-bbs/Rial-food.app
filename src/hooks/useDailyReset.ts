import { useEffect, useRef } from 'react';
import { todayLocal, dateToLocal } from '../lib/dates';
import type { DailyLogEntry } from '../features/food/handlers/meal-handlers';
import type { DailyMacros } from '../contexts/state/useVitalsState';

type Setter<T> = (fn: T | ((prev: T) => T)) => void;
type HydrationState = { consumed: number; target: number };
type MovementState = { steps: number; target: number; activeMinutes: number; activeTarget: number };

/**
 * Archives the previous day's data to nutritionHistory, then resets
 * daily-scoped state (food log, consumed macros, hydration, movement)
 * when the calendar date changes. Runs on mount + every 60 s.
 */

const LS_KEY = 'rial_lastActiveDate';
const HISTORY_KEY = 'nutritionHistory';
const MAX_HISTORY_DAYS = 90;

export interface HydrationSnapshot { consumed: number; target: number }
export interface MovementSnapshot { activeMinutes: number; steps: number }

export interface DailyArchive {
  date: string;
  macros: { consumed: { cal: number; pro: number; carbs: number; fats: number }; target: { cal: number; pro: number; carbs: number; fats: number } };
  /** Pre-Q15: plain number (glasses consumed). Q15+: { consumed, target }. */
  hydration: number | HydrationSnapshot;
  /** Pre-Q15: plain number (activeMinutes). Q15+: { activeMinutes, steps }. */
  movement: number | MovementSnapshot;
  mealCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dailyLog: any[]; // legacy archive format — entries may predate DailyLogEntry interface
  /** True when the user actively tracked something that day. */
  tracked?: boolean;
}

/** Normalize a raw archive entry to the Q15+ shape. Handles old numeric formats. */
export function normalizeDailyArchive(raw: DailyArchive): DailyArchive {
  const hydration: HydrationSnapshot =
    typeof raw.hydration === 'number'
      ? { consumed: raw.hydration, target: 10 }
      : (raw.hydration ?? { consumed: 0, target: 10 });
  const movement: MovementSnapshot =
    typeof raw.movement === 'number'
      ? { activeMinutes: raw.movement, steps: 0 }
      : (raw.movement ?? { activeMinutes: 0, steps: 0 });
  return {
    ...raw,
    hydration,
    movement,
    tracked: raw.tracked ?? (raw.mealCount > 0),
  };
}

/** Read hydration consumed value from either archive format. */
export function archiveHydrationConsumed(h: DailyArchive): number {
  return typeof h.hydration === 'number' ? h.hydration : h.hydration.consumed;
}

/** Read activeMinutes from either archive format. */
export function archiveActiveMinutes(h: DailyArchive): number {
  return typeof h.movement === 'number' ? h.movement : h.movement.activeMinutes;
}

interface DailyResetDeps {
  setDailyLog: (items: DailyLogEntry[]) => void;
  setDailyMacros: Setter<DailyMacros>;
  setHydration: Setter<HydrationState>;
  setMovement: Setter<MovementState>;
}

function archivePreviousDay(previousDate: string) {
  try {
    const dailyLog = JSON.parse(localStorage.getItem('dailyLog') || '[]');
    const dailyMacros = JSON.parse(localStorage.getItem('dailyMacros') || '{}');
    const hydration = JSON.parse(localStorage.getItem('hydration') || '{}');
    const movement = JSON.parse(localStorage.getItem('movement') || '{}');

    const consumed = dailyMacros.consumed || { cal: 0, pro: 0, carbs: 0, fats: 0 };
    const tracked = dailyLog.length > 0 || (consumed.cal ?? 0) > 0;

    const archive: DailyArchive = {
      date: previousDate,
      macros: {
        consumed,
        target: dailyMacros.target || { cal: 2400, pro: 180, carbs: 250, fats: 65 },
      },
      hydration: {
        consumed: hydration.consumed ?? 0,
        target: hydration.target ?? 10,
      },
      movement: {
        activeMinutes: movement.activeMinutes ?? 0,
        steps: movement.steps ?? 0,
      },
      mealCount: dailyLog.length,
      dailyLog,
      tracked,
    };

    const history: DailyArchive[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    // Avoid duplicate entries for the same date
    const filtered = history.filter(h => h.date !== previousDate);
    filtered.push(archive);

    // Prune entries older than 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MAX_HISTORY_DAYS);
    const cutoffStr = dateToLocal(cutoff);
    const pruned = filtered.filter(h => h.date >= cutoffStr);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(pruned));
  } catch {
    // Silently fail — don't block reset
  }
}

export function useDailyReset({ setDailyLog, setDailyMacros, setHydration, setMovement }: DailyResetDeps) {
  const hasReset = useRef(false);

  useEffect(() => {
    function checkAndReset() {
      const today = todayLocal();
      const last = localStorage.getItem(LS_KEY);

      if (last === today) return;

      localStorage.setItem(LS_KEY, today);

      // Don't reset on very first launch (no previous date stored)
      if (last === null) return;

      // Archive yesterday's data before clearing
      archivePreviousDay(last);

      setDailyLog([]);
      setDailyMacros((prev) => ({
        ...prev,
        consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
      }));
      setHydration((prev) => ({ ...prev, consumed: 0 }));
      setMovement((prev) => ({ ...prev, steps: 0, activeMinutes: 0 }));

      hasReset.current = true;
    }

    checkAndReset();

    const interval = setInterval(checkAndReset, 60_000);
    return () => clearInterval(interval);
  }, [setDailyLog, setDailyMacros, setHydration, setMovement]);
}

/** Read archived nutrition history from localStorage (entries are normalized to Q15+ shape). */
export function getNutritionHistory(): DailyArchive[] {
  try {
    const raw: DailyArchive[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return raw.map(normalizeDailyArchive);
  } catch {
    return [];
  }
}

// getLoggingStreak removed [1.5.101] — deprecated since Q13.
// Use calcStreaks({ history, realFeelLogs }).mealLog from
// src/features/wellness/utils/streaks.ts instead.
