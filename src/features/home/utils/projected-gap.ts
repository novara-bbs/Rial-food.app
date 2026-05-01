/**
 * Sprint 54 [1.5.185] — projected-gap calculation.
 *
 * The naive `computeMealGaps(dailyMacros)` only sees what the user has
 * already *consumed*. That over-suggests when the user has planned
 * coverage for the rest of the day. Owner directive 2026-05-01: «que
 * tenga en cuenta lo que estamos comiendo ya hoy» — covers both:
 *
 *   (a) DEDUPE: don't suggest what's already in dailyLog (Sprint A
 *       hard-filter in suggest-recipes.ts).
 *   (b) PROJECTION: don't suggest more than needed when the meal plan
 *       still covers the deficit.
 *
 * This util implements (b): builds an *effective* `ConsumedTarget`
 * where `consumed = actualConsumed + sum(planned-but-not-yet-eaten
 * macros)`. Feed the result into `computeMealGaps` / `biggestDeficit`
 * and the threshold logic naturally suppresses suggestions when the
 * plan covers the gap.
 *
 * Pure function. No side-effects, no locale, no localStorage.
 */
import type { Recipe } from '../../../types/recipe';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import type { ConsumedTarget } from './meal-gaps';

const norm = (s: string): string => s.toLowerCase().trim();

interface RecipeMacroCarrier {
  title?: string;
  macros?: { calories?: number; protein?: number; carbs?: number; fats?: number };
  /** Legacy planner shape (seed-meal-plan): flat macros + img/cal/pro. */
  cal?: number;
  pro?: number;
  carbs?: number;
  fats?: number;
}

function readMacro(input: Recipe | RecipeMacroCarrier, key: 'cal' | 'pro' | 'carbs' | 'fats'): number {
  const item = input as RecipeMacroCarrier;
  const m = item.macros;
  if (key === 'cal') return Number(m?.calories ?? item.cal ?? 0) || 0;
  if (key === 'pro') return Number(m?.protein ?? item.pro ?? 0) || 0;
  if (key === 'carbs') return Number(m?.carbs ?? item.carbs ?? 0) || 0;
  return Number(m?.fats ?? item.fats ?? 0) || 0;
}

/**
 * Projects the consumed macros forward by adding planned-today recipes
 * that haven't been logged yet. Returns a new ConsumedTarget with the
 * same target but an inflated `consumed` reflecting expected coverage.
 *
 * Title-based dedupe (lowercase + trim) mirrors the dailyLog filter used
 * by the recipe ranker; same recipe planned + logged is counted once.
 */
export function projectedConsumed(
  dailyMacros: ConsumedTarget,
  mealPlanToday: readonly (Recipe | RecipeMacroCarrier)[],
  dailyLog: readonly DailyLogEntry[],
): ConsumedTarget {
  if (mealPlanToday.length === 0) return dailyMacros;

  const loggedTitles = new Set(dailyLog.map((e) => norm(e.title)));
  const remaining = mealPlanToday.filter((r) => {
    const t = r.title ? norm(r.title) : '';
    return t && !loggedTitles.has(t);
  });
  if (remaining.length === 0) return dailyMacros;

  const planMacros = remaining.reduce<{ cal: number; pro: number; carbs: number; fats: number }>(
    (acc, r) => ({
      cal: acc.cal + readMacro(r, 'cal'),
      pro: acc.pro + readMacro(r, 'pro'),
      carbs: acc.carbs + readMacro(r, 'carbs'),
      fats: acc.fats + readMacro(r, 'fats'),
    }),
    { cal: 0, pro: 0, carbs: 0, fats: 0 },
  );

  return {
    consumed: {
      cal: dailyMacros.consumed.cal + planMacros.cal,
      pro: dailyMacros.consumed.pro + planMacros.pro,
      carbs: dailyMacros.consumed.carbs + planMacros.carbs,
      fats: dailyMacros.consumed.fats + planMacros.fats,
    },
    target: dailyMacros.target,
  };
}
