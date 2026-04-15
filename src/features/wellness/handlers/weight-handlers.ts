import type { BodySnapshot, BodyMeasurements } from '../../../types/wellness';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  weight?: number;
  [key: string]: any;
}

interface WeightHandlerDeps {
  setWeightHistory: (fn: (prev: BodySnapshot[]) => BodySnapshot[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUserProfile: (fn: (prev: any) => any) => void;
}

export interface LogWeightArgs {
  kg: number;
  date?: string;           // ISO YYYY-MM-DD; defaults to today
  note?: string;
  photoUrl?: string;       // base64 JPEG
  measurements?: BodyMeasurements;
}

// ─── Handler factory ─────────────────────────────────────────────────────────

/**
 * Single write path for all weight logging.
 * Keeps `weightHistory` (persistent record) and `userProfile.weight` (quick-read)
 * in sync. Replaces any existing entry for the same date.
 *
 * Supports BodySnapshot fields: photoUrl, measurements (Q10+).
 * Usage pattern mirrors meal-handlers.ts — wire via AppStateContext useMemo.
 */
export function createHandleLogWeight({ setWeightHistory, setUserProfile }: WeightHandlerDeps) {
  return ({ kg, date, note, photoUrl, measurements }: LogWeightArgs) => {
    const today = date ?? new Date().toISOString().slice(0, 10);
    setWeightHistory((prev: BodySnapshot[]) => {
      const existing = prev.find(e => e.date === today);
      const filtered = prev.filter(e => e.date !== today);
      const entry: BodySnapshot = {
        // Merge with existing snapshot so photo/measurements aren't lost on re-weigh
        ...(existing ?? {}),
        date: today,
        kg,
      };
      if (note && note.trim()) entry.note = note.trim();
      if (photoUrl !== undefined) entry.photoUrl = photoUrl || undefined;
      if (measurements) entry.measurements = { ...(existing?.measurements ?? {}), ...measurements };
      return [...filtered, entry];
    });
    // Keep profile.weight as a fast-read cache of latest weight
    setUserProfile((prev: UserProfile) => ({ ...prev, weight: kg }));
  };
}

/**
 * Delete a snapshot by date. If the deleted entry was the most recent,
 * updates `userProfile.weight` to the new latest kg (or leaves it if no entries remain).
 */
export function createHandleDeleteSnapshot({ setWeightHistory, setUserProfile }: WeightHandlerDeps) {
  return (date: string) => {
    setWeightHistory((prev: BodySnapshot[]) => {
      const filtered = prev.filter(e => e.date !== date);
      return filtered;
    });
    // Refresh profile.weight to the new latest after deletion.
    // We read the state via the setter callback one more time to stay consistent.
    setWeightHistory((prev: BodySnapshot[]) => {
      const sorted = [...prev].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      if (latest && latest.kg > 0) {
        setUserProfile((u: UserProfile) => ({ ...u, weight: latest.kg }));
      }
      return prev; // no change to history this pass
    });
  };
}

/**
 * Update photo or measurements on an existing snapshot without changing the kg value.
 * If no snapshot exists for the date, creates a stub entry with kg = 0 (to be filled later).
 */
export function createHandleUpdateSnapshot({ setWeightHistory }: Pick<WeightHandlerDeps, 'setWeightHistory'>) {
  return ({ date, photoUrl, measurements }: { date: string; photoUrl?: string; measurements?: BodyMeasurements }) => {
    setWeightHistory((prev: BodySnapshot[]) => {
      const existing = prev.find(e => e.date === date);
      const filtered = prev.filter(e => e.date !== date);
      const entry: BodySnapshot = existing
        ? { ...existing }
        : { date, kg: 0 }; // stub — kg filled when user logs weight
      if (photoUrl !== undefined) entry.photoUrl = photoUrl || undefined;
      if (measurements) entry.measurements = { ...(existing?.measurements ?? {}), ...measurements };
      return [...filtered, entry];
    });
  };
}
