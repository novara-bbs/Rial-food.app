/**
 * weekly-fatigue scorer — penalises recipes already eaten in the past 7 days
 * to encourage variety. Reads `nutritionHistory` (DailyArchive[]) and counts
 * how many days the recipe title appears.
 *
 * Penalty curve (multiplier):
 *   - 1 day repeat → ×0.90
 *   - 2-3 days     → ×0.75
 *   - 4+ days      → ×0.55  (heavy fatigue, almost suppresses)
 *
 * Same-day match is handled by the dailyLog hard filter (filters.ts).
 */
import type { RecipeScorer } from '../types';
import type { DailyArchive } from '../../../../../hooks/useDailyReset';

const norm = (s: string): string => s.toLowerCase().trim();

function countWeeklyOccurrences(title: string, archive: readonly DailyArchive[]): number {
  const target = norm(title);
  if (!target) return 0;
  let count = 0;
  for (const day of archive) {
    const dayLog = Array.isArray(day.dailyLog) ? day.dailyLog : [];
    const found = dayLog.some((entry) => {
      const t = entry?.title;
      return typeof t === 'string' && norm(t) === target;
    });
    if (found) count += 1;
  }
  return count;
}

export const weeklyFatigueScorer: RecipeScorer = (recipe, ctx) => {
  if (ctx.weeklyArchive.length === 0) return [];
  const days = countWeeklyOccurrences(recipe.title, ctx.weeklyArchive);
  if (days === 0) return [];
  let weight = 0.90;
  if (days >= 2) weight = 0.75;
  if (days >= 4) weight = 0.55;
  return [{ kind: 'multiplier', weight, signal: 'weekly-fatigue' }];
};
