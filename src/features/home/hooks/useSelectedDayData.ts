/**
 * useSelectedDayData — Phase 3 / Sprint B4 / 1.5.190.
 *
 * Resolves the COMPLETE day-snapshot (macros + dailyLog + hydration + movement)
 * for the currently-selected day. Today → live state from caller. Past day
 * with archive → archived snapshot. Past day without archive → safe defaults
 * (zeros) so the UI doesn't crash with NaN.
 *
 * Used by Home and NutritionDetail to swap ALL surfaces (hero, TodaysMeals,
 * hydration card, insights) when the user picks a past day. Mutation handlers
 * should respect `isViewingToday` to avoid writing to today while the user is
 * browsing yesterday.
 */
import { useMemo } from 'react';
import type { DailyMacros } from '../../../contexts/state/useVitalsState';
import type { DailyArchive, HydrationSnapshot, MovementSnapshot } from '../../../hooks/useDailyReset';
import { archiveHydrationConsumed, archiveActiveMinutes } from '../../../hooks/useDailyReset';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import type { WorkoutLogEntry } from '../types/workout-log';
import { todayLocal } from '../../../lib/dates';

interface HydrationState { consumed: number; target: number }
interface MovementState { steps: number; target: number; activeMinutes: number; activeTarget: number; workoutMinutes: number }

export interface UseSelectedDayDataResult {
  effectiveDailyMacros: DailyMacros;
  effectiveDailyLog: DailyLogEntry[];
  effectiveHydration: HydrationState;
  effectiveMovement: MovementState;
  /** Sprint K-fix7 [1.5.211] — past-day workout log from archive, or live array today. */
  effectiveWorkoutLog: WorkoutLogEntry[];
  isViewingToday: boolean;
}

interface Inputs {
  selectedDate: string;
  liveDailyMacros: DailyMacros;
  liveDailyLog: DailyLogEntry[];
  liveHydration: HydrationState;
  liveMovement: MovementState;
  /** Sprint K-fix7 [1.5.211] — today's persisted workout log; archive lookup for past days. */
  liveWorkoutLog: WorkoutLogEntry[];
  history: DailyArchive[];
}

export function useSelectedDayData({
  selectedDate,
  liveDailyMacros,
  liveDailyLog,
  liveHydration,
  liveMovement,
  liveWorkoutLog,
  history,
}: Inputs): UseSelectedDayDataResult {
  const isViewingToday = selectedDate === todayLocal();

  return useMemo<UseSelectedDayDataResult>(() => {
    if (isViewingToday) {
      return {
        effectiveDailyMacros: liveDailyMacros,
        effectiveDailyLog: liveDailyLog,
        effectiveHydration: liveHydration,
        effectiveMovement: liveMovement,
        effectiveWorkoutLog: liveWorkoutLog,
        isViewingToday: true,
      };
    }

    const archive = history.find((h) => h.date === selectedDate);
    if (!archive) {
      // No archive for this day — render zero-state with caller's targets.
      return {
        effectiveDailyMacros: {
          consumed: { cal: 0, pro: 0, carbs: 0, fats: 0, fiber: 0 },
          target: liveDailyMacros.target,
        },
        effectiveDailyLog: [],
        effectiveHydration: { consumed: 0, target: liveHydration.target },
        effectiveMovement: {
          steps: 0,
          target: liveMovement.target,
          activeMinutes: 0,
          activeTarget: liveMovement.activeTarget,
          workoutMinutes: 0,
        },
        effectiveWorkoutLog: [],
        isViewingToday: false,
      };
    }

    // Normalize hydration/movement (archive may be in legacy numeric format).
    const hydrationConsumed = archiveHydrationConsumed(archive);
    const hydrationTarget =
      typeof archive.hydration === 'number' ? liveHydration.target : (archive.hydration as HydrationSnapshot).target;
    const activeMinutes = archiveActiveMinutes(archive);
    const movementSteps =
      typeof archive.movement === 'number' ? 0 : (archive.movement as MovementSnapshot).steps;

    return {
      effectiveDailyMacros: {
        consumed: { ...archive.macros.consumed, fiber: archive.macros.consumed.fiber ?? 0 },
        target: {
          ...archive.macros.target,
          fiber: archive.macros.target.fiber ?? liveDailyMacros.target.fiber ?? 30,
        },
      },
      effectiveDailyLog: (archive.dailyLog ?? []) as DailyLogEntry[],
      effectiveHydration: { consumed: hydrationConsumed, target: hydrationTarget },
      effectiveMovement: {
        steps: movementSteps,
        target: liveMovement.target,
        activeMinutes,
        activeTarget: liveMovement.activeTarget,
        workoutMinutes: 0,
      },
      effectiveWorkoutLog: archive.workoutLog ?? [],
      isViewingToday: false,
    };
  }, [isViewingToday, selectedDate, liveDailyMacros, liveDailyLog, liveHydration, liveMovement, liveWorkoutLog, history]);
}
