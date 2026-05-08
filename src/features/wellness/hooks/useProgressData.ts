/**
 * useProgressData — single source of truth for the Progress screen's derived
 * data. Extracts the ~85 LoC of useMemo computations that previously lived in
 * Progress.tsx. Pure data preparation: streaks, weekStats, weeklyScore,
 * topMeals, weekInsight, day-detail lookup, bienestar derivation, calendar
 * sets.
 *
 * Returns a single object so the screen can destructure once instead of
 * threading individual memos through the JSX.
 */
import { useMemo } from 'react';
import type { Translations } from '../../../i18n';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { BodySnapshot } from '../../../types/wellness';
import { calcStreaks } from '../utils/streaks';
import { calcWeekMacros, type MacroTarget } from '../utils/week-stats';
import { calcWeightTrend } from '../utils/weight-trend';
import { calcTopMeals } from '../utils/top-meals';
import { buildWeekInsight } from '../utils/week-insights';
import { calcVitality } from '../../home/utils/homeWidgets';
import { getCorrelations, type CorrelationInsight } from '../utils/correlations';
import { safeSumMacros } from '../../home/utils/safe-macros';
import { bodyWeightFromKg, getBodyWeightUnit } from '../../food/utils/units';

export interface BienestarSlice {
  rawAvg: number;
  trend: 'up' | 'down' | 'flat';
  correlations: CorrelationInsight[];
  sparkData: number[];
}

export interface UseProgressDataInputs {
  history: DailyArchive[];
  snapshots: BodySnapshot[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  realFeelLogs: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dailyLog: any[];
  dailyMacros: { target?: MacroTarget };
  userProfile: { name?: string; targetWeight?: number | null; goal?: string; unitSystem?: 'metric' | 'imperial' } | null | undefined;
  selectedDay: string | null;
  now: Date;
  todayDate: string;
  unitSystem: 'metric' | 'imperial';
  t: Translations;
}

const DEFAULT_TARGET: MacroTarget = { cal: 2400, pro: 180, carbs: 250, fats: 65 };

export function useProgressData({
  history,
  snapshots,
  realFeelLogs,
  dailyLog,
  dailyMacros,
  userProfile,
  selectedDay,
  now,
  todayDate,
  unitSystem,
  t,
}: UseProgressDataInputs) {
  const todayHasRealFeel = (realFeelLogs || []).some(
    (l) => l.date && l.date.slice(0, 10) === todayDate,
  );

  const streaks = useMemo(
    () => calcStreaks({
      history,
      realFeelLogs: realFeelLogs || [],
      todayHasMeals: dailyLog.length > 0,
      todayHasRealFeel,
      now,
    }),
    [history, realFeelLogs, dailyLog.length, todayHasRealFeel, now],
  );

  const weekStats = useMemo(() => {
    const target: MacroTarget = dailyMacros.target ?? DEFAULT_TARGET;
    const curr = calcWeekMacros(history, target, 0, now);
    const prev = calcWeekMacros(history, target, 1, now);

    const thisAvg = curr.avg;
    const lastAvg = prev.avg;

    const proteinHitDays = history
      .filter((h) => h.date >= curr.weekStart && h.date <= curr.weekEnd)
      .filter((h) => (h.macros?.consumed?.pro || 0) >= (target.pro || 180) * 0.9)
      .length;

    const calDelta = curr.deltaVsPrev.cal ?? 0;

    const bars = (['cal', 'pro', 'carbs', 'fats'] as const).map((key) => {
      const targetVal = target[key] || 1;
      const pct = Math.min(150, Math.round((thisAvg[key] / targetVal) * 100));
      return { key, pct, avg: thisAvg[key], target: targetVal };
    });

    return { thisAvg, lastAvg, calDelta, proteinHitDays, daysLogged: curr.daysLogged, bars };
  }, [history, dailyMacros, now]);

  const weeklyScore = useMemo(() => {
    if (weekStats.daysLogged === 0) return 0;
    const adherence = weekStats.bars.reduce((s, b) => s + Math.min(100, b.pct), 0) / 4;
    const consistency = (weekStats.daysLogged / 7) * 100;
    const proteinPct = (weekStats.proteinHitDays / weekStats.daysLogged) * 100;
    return Math.round(adherence * 0.4 + consistency * 0.3 + proteinPct * 0.3);
  }, [weekStats]);

  const topMeals = useMemo(
    () => calcTopMeals(history, dailyLog, now, 0, 3),
    [history, dailyLog, now],
  );

  const weightTrend = useMemo(
    () => calcWeightTrend(snapshots, userProfile?.targetWeight ?? null, now),
    [snapshots, userProfile?.targetWeight, now],
  );

  const weekInsight = useMemo(() => {
    const target: MacroTarget = dailyMacros.target ?? DEFAULT_TARGET;
    const canonicalWeekStats = calcWeekMacros(history, target, 0, now);
    const unit = getBodyWeightUnit(unitSystem);
    const p = t.progress;
    return buildWeekInsight({
      weekStats: canonicalWeekStats,
      trend: weightTrend,
      mealStreak: streaks.mealLog,
      topMeal: topMeals[0] ?? null,
      userName: userProfile?.name,
      goalType: userProfile?.goal as 'loss' | 'gain' | 'maintain' | undefined,
      copy: {
        positive: p?.weekInsightPositive,
        neutral: p?.weekInsightNeutral,
        lowData: p?.weekInsightLowData,
        lowDataWithName: p?.weekInsightLowDataWithName,
        trendLabel: p?.trendChip,
        streakLabel: p?.streakChip,
        topMealLabel: p?.topMealChip,
      },
      formatWeightDelta: (kg: number) => `${bodyWeightFromKg(kg, unitSystem).toFixed(1)} ${unit}`,
    });
  }, [history, dailyMacros, weightTrend, streaks.mealLog, topMeals, userProfile, unitSystem, t.progress, now]);

  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    if (selectedDay === todayDate) {
      const { cal: todayCal, pro: todayPro } = safeSumMacros(dailyLog);
      const rf = (realFeelLogs || []).find((l) => l.date && l.date.slice(0, 10) === todayDate);
      return { date: todayDate, cal: todayCal, pro: todayPro, mealCount: dailyLog.length, rfLevel: rf?.level };
    }
    const archive = history.find((h) => h.date === selectedDay);
    if (!archive) return null;
    const rf = (realFeelLogs || []).find((l) => l.date && l.date.slice(0, 10) === selectedDay);
    return { date: archive.date, cal: archive.macros.consumed.cal, pro: archive.macros.consumed.pro, mealCount: archive.mealCount, rfLevel: rf?.level };
  }, [selectedDay, history, dailyLog, realFeelLogs, todayDate]);

  const bienestar = useMemo<BienestarSlice | null>(() => {
    const logs = realFeelLogs || [];
    if (logs.length < 3) return null;
    const { trend } = calcVitality(logs);
    const recent14 = logs.slice(0, 14);
    const rawAvg = recent14.reduce((s, l) => s + (l.level || 3), 0) / recent14.length;
    const correlations = getCorrelations(logs).slice(0, 2);
    const sparkData = [...recent14].reverse().map((l) => l.level || 3);
    return { rawAvg, trend, correlations, sparkData };
  }, [realFeelLogs]);

  const loggedDates = useMemo(() => {
    const set = new Set(history.filter((h) => h.mealCount > 0).map((h) => h.date));
    if (dailyLog.length > 0) set.add(todayDate);
    return set;
  }, [history, dailyLog, todayDate]);

  const rfDates = useMemo(
    () => new Set((realFeelLogs || []).map((l) => l.date ? l.date.slice(0, 10) : null).filter((d): d is string => d !== null)),
    [realFeelLogs],
  );

  return {
    streaks,
    weekStats,
    weeklyScore,
    topMeals,
    weightTrend,
    weekInsight,
    selectedDayData,
    bienestar,
    loggedDates,
    rfDates,
  };
}
