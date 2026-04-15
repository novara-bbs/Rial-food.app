import type { WeightEntry } from '../../../contexts/AppStateContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  weight?: number;
  [key: string]: any;
}

interface WeightHandlerDeps {
  setWeightHistory: (fn: (prev: WeightEntry[]) => WeightEntry[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUserProfile: (fn: (prev: any) => any) => void;
}

export interface LogWeightArgs {
  kg: number;
  date?: string;  // ISO YYYY-MM-DD; defaults to today
  note?: string;
}

// ─── Handler factory ─────────────────────────────────────────────────────────

/**
 * Single write path for all weight logging.
 * Keeps `weightHistory` (persistent record) and `userProfile.weight` (quick-read)
 * in sync. Replaces any existing entry for the same date.
 *
 * Usage pattern mirrors meal-handlers.ts — wire via AppStateContext useMemo.
 */
export function createHandleLogWeight({ setWeightHistory, setUserProfile }: WeightHandlerDeps) {
  return ({ kg, date, note }: LogWeightArgs) => {
    const today = date ?? new Date().toISOString().slice(0, 10);
    setWeightHistory((prev: WeightEntry[]) => {
      const filtered = prev.filter(e => e.date !== today);
      const entry: WeightEntry = { date: today, kg };
      if (note && note.trim()) entry.note = note.trim();
      return [...filtered, entry];
    });
    // Keep profile.weight as a fast-read cache of latest weight
    setUserProfile((prev: UserProfile) => ({ ...prev, weight: kg }));
  };
}
