/**
 * useSelectedDayMacros — Phase 3 Sprint B2 / 1.5.190
 *
 * Resolves the `dailyMacros` snapshot for the screen's currently-selected day.
 * Today → returns live `dailyMacros` from caller.
 * Past day with archive → returns archive snapshot (with fiber defaults patched in
 * for legacy entries that predate fiber tracking).
 * Past day without archive → returns zeroed consumed + caller's target (acts as
 * "no data" baseline for the hero so % renders 0% instead of NaN).
 *
 * Reused by Home.tsx (`<NutritionHero>`) and NutritionDetail.tsx so the data
 * resolution is consistent across both screens.
 */
import { useMemo } from 'react';
import type { DailyMacros } from '../../../contexts/state/useVitalsState';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import { todayLocal } from '../../../lib/dates';

export interface UseSelectedDayMacrosResult {
  effectiveDailyMacros: DailyMacros;
  isViewingToday: boolean;
}

export function useSelectedDayMacros(
  selectedDate: string,
  liveDailyMacros: DailyMacros,
  history: DailyArchive[],
): UseSelectedDayMacrosResult {
  const isViewingToday = selectedDate === todayLocal();
  const effectiveDailyMacros = useMemo<DailyMacros>(() => {
    if (isViewingToday) return liveDailyMacros;
    const archive = history.find((h) => h.date === selectedDate);
    if (!archive) {
      return {
        consumed: { cal: 0, pro: 0, carbs: 0, fats: 0, fiber: 0 },
        target: liveDailyMacros.target,
      };
    }
    return {
      consumed: { ...archive.macros.consumed, fiber: archive.macros.consumed.fiber ?? 0 },
      target: {
        ...archive.macros.target,
        fiber: archive.macros.target.fiber ?? liveDailyMacros.target.fiber ?? 30,
      },
    };
  }, [isViewingToday, liveDailyMacros, history, selectedDate]);

  return { effectiveDailyMacros, isViewingToday };
}
