import { useEffect, useRef } from 'react';

/**
 * Archives the previous day's data to nutritionHistory, then resets
 * daily-scoped state (food log, consumed macros, hydration, movement)
 * when the calendar date changes. Runs on mount + every 60 s.
 */

const LS_KEY = 'rial_lastActiveDate';
const HISTORY_KEY = 'nutritionHistory';
const MAX_HISTORY_DAYS = 90;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface DailyArchive {
  date: string;
  macros: { consumed: { cal: number; pro: number; carbs: number; fats: number }; target: { cal: number; pro: number; carbs: number; fats: number } };
  hydration: number;
  movement: number;
  mealCount: number;
  dailyLog: any[];
}

interface DailyResetDeps {
  setDailyLog: (fn: any) => void;
  setDailyMacros: (fn: any) => void;
  setHydration: (fn: any) => void;
  setMovement: (fn: any) => void;
}

function archivePreviousDay(previousDate: string) {
  try {
    const dailyLog = JSON.parse(localStorage.getItem('dailyLog') || '[]');
    const dailyMacros = JSON.parse(localStorage.getItem('dailyMacros') || '{}');
    const hydration = JSON.parse(localStorage.getItem('hydration') || '{}');
    const movement = JSON.parse(localStorage.getItem('movement') || '{}');

    // Only archive if there was actual activity
    if (dailyLog.length === 0 && (dailyMacros.consumed?.cal || 0) === 0) return;

    const archive: DailyArchive = {
      date: previousDate,
      macros: {
        consumed: dailyMacros.consumed || { cal: 0, pro: 0, carbs: 0, fats: 0 },
        target: dailyMacros.target || { cal: 2400, pro: 180, carbs: 250, fats: 65 },
      },
      hydration: hydration.consumed || 0,
      movement: movement.activeMinutes || 0,
      mealCount: dailyLog.length,
      dailyLog,
    };

    const history: DailyArchive[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    // Avoid duplicate entries for the same date
    const filtered = history.filter(h => h.date !== previousDate);
    filtered.push(archive);

    // Prune entries older than 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MAX_HISTORY_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
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
      const today = todayStr();
      const last = localStorage.getItem(LS_KEY);

      if (last === today) return;

      localStorage.setItem(LS_KEY, today);

      // Don't reset on very first launch (no previous date stored)
      if (last === null) return;

      // Archive yesterday's data before clearing
      archivePreviousDay(last);

      setDailyLog([]);
      setDailyMacros((prev: any) => ({
        ...prev,
        consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
      }));
      setHydration((prev: any) => ({ ...prev, consumed: 0 }));
      setMovement((prev: any) => ({ ...prev, steps: 0, activeMinutes: 0 }));

      hasReset.current = true;
    }

    checkAndReset();

    const interval = setInterval(checkAndReset, 60_000);
    return () => clearInterval(interval);
  }, [setDailyLog, setDailyMacros, setHydration, setMovement]);
}

/** Read archived nutrition history from localStorage */
export function getNutritionHistory(): DailyArchive[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Compute current logging streak (consecutive days with meals logged) */
export function getLoggingStreak(history: DailyArchive[]): { current: number; best: number } {
  if (history.length === 0) return { current: 0, best: 0 };

  const dates = history
    .filter(h => h.mealCount > 0)
    .map(h => h.date)
    .sort()
    .reverse();

  if (dates.length === 0) return { current: 0, best: 0 };

  let current = 0;
  let best = 0;
  let streak = 1;
  const today = todayStr();

  // Check if today or yesterday is in the streak
  const dayMs = 86_400_000;
  const todayMs = new Date(today).getTime();
  const lastLogMs = new Date(dates[0]).getTime();
  const gapFromToday = (todayMs - lastLogMs) / dayMs;

  if (gapFromToday > 1) {
    // Last log was more than 1 day ago — no current streak
    current = 0;
  } else {
    current = 1;
  }

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]).getTime();
    const curr = new Date(dates[i]).getTime();
    if (prev - curr === dayMs) {
      streak++;
      if (gapFromToday <= 1 && i < streak) current = streak;
    } else {
      best = Math.max(best, streak);
      streak = 1;
    }
  }
  best = Math.max(best, streak);
  if (current === 0) current = gapFromToday <= 1 ? 1 : 0;
  else current = Math.min(current, streak);

  // Recompute current streak from the end
  current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]).getTime();
    const curr = new Date(dates[i]).getTime();
    if (prev - curr === dayMs) {
      current++;
    } else {
      break;
    }
  }
  if (gapFromToday > 1) current = 0;

  return { current, best };
}
