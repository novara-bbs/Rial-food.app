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
import type { WorkoutLogEntry } from '../../features/home/types/workout-log';

/**
 * Today's macros — split into what the user has consumed vs. their target for the day.
 *
 * `fiber` is optional so legacy persisted state (and the 30+ call sites that
 * construct partial DailyMacros) keeps type-checking. Display code must read
 * with `?? 0`. Default target = 30 g (mid-range of NIH 25-38 g/day adult guideline).
 */
export interface DailyMacros {
  consumed: { cal: number; pro: number; carbs: number; fats: number; fiber?: number };
  target: { cal: number; pro: number; carbs: number; fats: number; fiber?: number };
}

const DEFAULT_DAILY_MACROS: DailyMacros = {
  consumed: { cal: 0, pro: 0, carbs: 0, fats: 0, fiber: 0 },
  target: { cal: 2400, pro: 180, carbs: 250, fats: 65, fiber: 30 },
};

const DEFAULT_HYDRATION = { consumed: 0, target: 10 };
/**
 * MovementState — daily activity counters.
 *
 * - `steps`: pasos del día (Apple Health ingest o input manual via StepsLogSheet).
 * - `target`: objetivo de pasos diario (default 10k).
 * - `activeMinutes` / `activeTarget`: legacy — Apple Health passive minutes counter.
 *   Sprint K-fix5 [1.5.209] ya no lo muestra en UI, pero se preserva para no
 *   romper persistencia ni la futura integración Capacitor health bridge.
 * - `workoutMinutes`: minutos del workout activo seleccionado en `ExerciseLogSheet`.
 *   Cuando `intensity === 'none'`, se ignora. Default 0.
 */
export interface MovementState {
  steps: number;
  target: number;
  activeMinutes: number;
  activeTarget: number;
  workoutMinutes: number;
}

const DEFAULT_MOVEMENT: MovementState = {
  steps: 0,
  target: 10000,
  activeMinutes: 0,
  activeTarget: 45,
  workoutMinutes: 0,
};

export function useVitalsState() {
  const [dailyMacros, setDailyMacros] = useLocalStorageState<DailyMacros>('dailyMacros', DEFAULT_DAILY_MACROS);
  const [hydration, setHydration] = useLocalStorageState('hydration', DEFAULT_HYDRATION);
  const [movement, setMovement] = useLocalStorageState<MovementState>('movement', DEFAULT_MOVEMENT);
  const [dailyGoal, setDailyGoal] = useLocalStorageState('dailyGoal', '');
  const [checkInStatus, setCheckInStatus] = useLocalStorageState<DailyCheckInType | null>('checkInStatus', null);
  // Sprint K-fix7 [1.5.211] — array of intentional workout sessions logged today.
  // Cleared by `useDailyReset` at midnight. Persists in localStorage `workoutLog`.
  const [workoutLog, setWorkoutLog] = useLocalStorageState<WorkoutLogEntry[]>('workoutLog', []);

  // Migration: backfill any missing fields on first mount (e.g. `workoutMinutes`
  // for users persisting MovementState pre-[1.5.209]). Idempotent — preserves
  // existing values; only fills gaps.
  useEffect(() => {
    if (typeof movement.workoutMinutes !== 'number') {
      setMovement((prev) => ({
        ...DEFAULT_MOVEMENT,
        ...prev,
        workoutMinutes: prev.workoutMinutes ?? 0,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Supabase sync — no-op when offline / not signed in.
  useEffect(() => { pushToCloud('dailyMacros', dailyMacros); }, [dailyMacros]);
  useEffect(() => { pushToCloud('hydration', hydration); }, [hydration]);
  useEffect(() => { pushToCloud('movement', movement); }, [movement]);
  useEffect(() => { pushToCloud('dailyGoal', dailyGoal); }, [dailyGoal]);
  useEffect(() => { pushToCloud('workoutLog', workoutLog); }, [workoutLog]);

  return {
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    dailyGoal, setDailyGoal,
    checkInStatus, setCheckInStatus,
    workoutLog, setWorkoutLog,
  };
}

export type VitalsState = ReturnType<typeof useVitalsState>;
