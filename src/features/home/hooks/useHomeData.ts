/**
 * useHomeData — central data preparer for the Home screen. Extracts the
 * useMemo blocks that previously lived inline in Home.tsx, keeping the
 * screen focused on layout and orchestration.
 *
 * Pure derivation: vitality, weekly macros, weight trend, streaks, daily
 * quality, shopping count, yesterday recall, guided-setup steps, smart
 * insights, next-meal suggestion, today's planned meals.
 */
import { useMemo } from 'react';
import type { Translations } from '../../../i18n';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { DailyMacros } from '../../../contexts/state/useVitalsState';
import type { BodySnapshot, StoredRealFeelEntry } from '../../../types/wellness';
import type { UserProfile } from '../../../types/user';
import type { Recipe } from '../../../types';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import type { ActivityProfile } from '../utils/activity-calories';
import type { GuidedStep } from '../components/GuidedSetupSection';
import type { ShoppingItem } from '../../../types/planner';
import { kcalFromSteps } from '../utils/activity-calories';
import { calcVitality } from '../utils/homeWidgets';
import { calcWeekMacros } from '../../wellness/utils/week-stats';
import { calcWeightTrend } from '../../wellness/utils/weight-trend';
import { calcStreaks } from '../../wellness/utils/streaks';
import { computeDailyQuality } from '../utils/daily-quality';
import { findNextPlanned } from '../utils/dedupe-planned';
import { safeSumMacros } from '../utils/safe-macros';
import { getInsights } from '../../wellness/utils/correlations';
import { STORAGE_KEYS } from '../../../lib/storage-keys';

interface MovementLite {
  steps: number;
}
interface WorkoutLogEntryLite {
  kcal: number;
}

export interface UseHomeDataInputs {
  effectiveDailyMacros: DailyMacros;
  effectiveDailyLog: DailyLogEntry[];
  movement: MovementLite;
  workoutLog: WorkoutLogEntryLite[];
  userProfile: UserProfile;
  realFeelLogs: StoredRealFeelEntry[];
  nutritionHistory: DailyArchive[];
  weightHistory: BodySnapshot[];
  shoppingList: ShoppingItem[];
  savedRecipes: Recipe[];
  mealPlan: Record<number, Recipe[]> | undefined;
  dailyLog: DailyLogEntry[];
  dailyMacros: DailyMacros;
  hydration: { consumed: number; target: number };
  onNavigateToPlan: () => void;
  t: Translations;
}

export function useHomeData({
  effectiveDailyMacros,
  effectiveDailyLog,
  movement,
  workoutLog,
  userProfile,
  realFeelLogs,
  nutritionHistory,
  weightHistory,
  shoppingList,
  savedRecipes,
  mealPlan,
  dailyLog,
  dailyMacros,
  hydration,
  onNavigateToPlan,
  t,
}: UseHomeDataInputs) {
  const profile: ActivityProfile = useMemo(() => ({
    weight: userProfile?.weight,
    sex: userProfile?.sex,
  }), [userProfile?.weight, userProfile?.sex]);

  const exerciseCalories = useMemo(() => {
    const stepKcal = kcalFromSteps(movement.steps, profile);
    const workoutKcal = workoutLog.reduce((sum, w) => sum + w.kcal, 0);
    return stepKcal + workoutKcal;
  }, [movement.steps, workoutLog, profile]);

  const { avgVitality, trend: vitalityTrend } = useMemo(
    () => calcVitality(realFeelLogs || []),
    [realFeelLogs],
  );

  const weekMacros = useMemo(
    () => calcWeekMacros(nutritionHistory ?? [], dailyMacros.target, 0),
    [nutritionHistory, dailyMacros.target],
  );

  const weightTrend = useMemo(
    () => calcWeightTrend(weightHistory ?? [], userProfile?.targetWeight),
    [weightHistory, userProfile?.targetWeight],
  );

  const { streakDays, bestStreakDays } = useMemo(() => {
    const streaks = calcStreaks({
      history: nutritionHistory ?? [],
      realFeelLogs: realFeelLogs ?? [],
      todayHasMeals: dailyLog.length > 0,
    });
    return { streakDays: streaks.mealLog.current, bestStreakDays: streaks.mealLog.best };
  }, [nutritionHistory, realFeelLogs, dailyLog.length]);

  const dailyQuality = useMemo(
    () =>
      computeDailyQuality({
        log: effectiveDailyLog,
        consumedFiber: effectiveDailyMacros.consumed.fiber ?? 0,
        targetFiber: effectiveDailyMacros.target.fiber,
      }),
    [effectiveDailyLog, effectiveDailyMacros.consumed.fiber, effectiveDailyMacros.target.fiber],
  );

  const shoppingPendingCount = useMemo(
    () => shoppingList.filter((item) => !item.checked).length || 0,
    [shoppingList],
  );

  const yesterdayData = useMemo(() => {
    const sorted = [...nutritionHistory].sort((a, b) => b.date.localeCompare(a.date));
    const yesterday = sorted[0];
    if (!yesterday?.dailyLog?.length) return null;
    const kcal = safeSumMacros(yesterday.dailyLog).cal;
    return { kcal, count: yesterday.dailyLog.length };
  }, [nutritionHistory]);

  const guidedSteps = useMemo<GuidedStep[]>(() => {
    const hasLoggedMeal = dailyLog.length > 0 || (nutritionHistory ?? []).some((h) => h.mealCount > 0);
    const hasPlannedDay = Object.values(mealPlan || {}).some((d) => d.length > 0);
    const hasViewedRecipe =
      typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.RECIPE_VIEWED);
    return [
      { id: 'profile', label: t.guidedSetup.configProfile, done: true },
      { id: 'meal', label: t.guidedSetup.logFirstMeal, done: hasLoggedMeal },
      { id: 'recipe', label: t.guidedSetup.exploreRecipe, done: hasViewedRecipe },
      { id: 'plan', label: t.guidedSetup.planFirstDay, done: hasPlannedDay, action: onNavigateToPlan },
    ];
  }, [dailyLog.length, nutritionHistory, mealPlan, onNavigateToPlan, t]);

  const insights = useMemo(
    () =>
      getInsights({
        realFeelLogs: realFeelLogs || [],
        savedRecipes: [],
        mealPlan: mealPlan || {},
        dailyMacros,
        hydration,
        streakDays,
      }),
    [realFeelLogs, mealPlan, dailyMacros, hydration, streakDays],
  );

  const today = new Date().getDay();
  const adjustedDayIndex = today === 0 ? 6 : today - 1;
  const todaysMeals = mealPlan?.[adjustedDayIndex] || [];

  const nextMealSuggestion = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 20) return null;

    const planned = (mealPlan?.[adjustedDayIndex] ?? []) as (Recipe & { time?: string })[];
    const unloggedPlanned = findNextPlanned(planned, dailyLog);
    if (unloggedPlanned) {
      return {
        title: unloggedPlanned.title,
        cal: unloggedPlanned.macros?.calories ?? 0,
        pro: unloggedPlanned.macros?.protein ?? 0,
        time: unloggedPlanned.time,
        source: 'plan' as const,
        recipe: unloggedPlanned,
      };
    }

    const remainingPro = dailyMacros.target.pro - dailyMacros.consumed.pro;
    if (remainingPro > 10 && savedRecipes.length > 0) {
      const sorted = [...savedRecipes].sort((a, b) => {
        const aPro = a.macros?.protein ?? 0;
        const bPro = b.macros?.protein ?? 0;
        return Math.abs(remainingPro - aPro) - Math.abs(remainingPro - bPro);
      });
      const best = sorted[0];
      if (best) {
        return {
          title: best.title,
          cal: best.macros?.calories ?? 0,
          pro: best.macros?.protein ?? 0,
          source: 'recipe' as const,
          recipe: best,
        };
      }
    }
    return null;
  }, [adjustedDayIndex, dailyLog, mealPlan, savedRecipes, dailyMacros]);

  const weightDeltaForChip = useMemo(() => {
    if (weightTrend.weekDelta == null) return undefined;
    return {
      value: weightTrend.weekDelta,
      unit: (userProfile?.unitSystem === 'imperial' ? 'lb' : 'kg') as 'kg' | 'lb',
      since: 'week' as const,
    };
  }, [weightTrend.weekDelta, userProfile?.unitSystem]);

  return {
    profile,
    exerciseCalories,
    avgVitality,
    vitalityTrend,
    weekMacros,
    weightTrend,
    streakDays,
    bestStreakDays,
    dailyQuality,
    shoppingPendingCount,
    yesterdayData,
    guidedSteps,
    insights,
    todaysMeals,
    nextMealSuggestion,
    weightDeltaForChip,
  };
}
