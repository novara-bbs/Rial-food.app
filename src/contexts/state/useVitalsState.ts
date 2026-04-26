/**
 * Vitals state slice — owns the daily nutrition + activity counters.
 *
 * Part of the Phase 2.5 AppStateContext decomposition (ADR-015).
 * This hook owns:
 *   - 5 persisted state vars (dailyMacros, hydration, movement, dailyGoal, checkInStatus)
 *   - 4 Supabase sync effects (dailyMacros, hydration, movement, dailyGoal)
 *
 * Notes:
 *   - `useDailyReset` (midnight rollover) stays in AppStateContext because
 *     it cross-cuts vitals + food (resets dailyLog too).
 *   - `checkInStatus` doesn't sync to Supabase yet (pending V2 wiring).
 *
 * No external deps — this hook can be called second in the composer.
 */
import { useEffect } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { pushToCloud } from '../../lib/sync';
import type { DailyCheckIn as DailyCheckInType } from '../../types';

/** Today's macros — split into what the user has consumed vs. their target for the day. */
export interface DailyMacros {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
}

const DEFAULT_DAILY_MACROS: DailyMacros = {
  // Fresh-install starts at zero — the previous hardcoded 840 cal / 45 g pro
  // default used to show as if the user had already eaten before logging.
  // "Lo que ves es lo que has hecho" → zeros for consumed, defaults for target.
  consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
  target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
};

const DEFAULT_HYDRATION = { consumed: 0, target: 10 };
const DEFAULT_MOVEMENT = { steps: 0, target: 10000, activeMinutes: 0, activeTarget: 45 };

export function useVitalsState() {
  const [dailyMacros, setDailyMacros] = useLocalStorageState<DailyMacros>('dailyMacros', DEFAULT_DAILY_MACROS);
  const [hydration, setHydration] = useLocalStorageState('hydration', DEFAULT_HYDRATION);
  const [movement, setMovement] = useLocalStorageState('movement', DEFAULT_MOVEMENT);
  const [dailyGoal, setDailyGoal] = useLocalStorageState('dailyGoal', '');
  const [checkInStatus, setCheckInStatus] = useLocalStorageState<DailyCheckInType | null>('checkInStatus', null);

  // Supabase sync — no-op when offline / not signed in.
  useEffect(() => { pushToCloud('dailyMacros', dailyMacros); }, [dailyMacros]);
  useEffect(() => { pushToCloud('hydration', hydration); }, [hydration]);
  useEffect(() => { pushToCloud('movement', movement); }, [movement]);
  useEffect(() => { pushToCloud('dailyGoal', dailyGoal); }, [dailyGoal]);

  return {
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    dailyGoal, setDailyGoal,
    checkInStatus, setCheckInStatus,
  };
}

export type VitalsState = ReturnType<typeof useVitalsState>;
