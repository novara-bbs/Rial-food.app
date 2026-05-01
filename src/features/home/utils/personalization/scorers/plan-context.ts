/**
 * plan-context scorer — promotes recipes that are on today's meal plan, and
 * surfaces the "not-eaten today" hint as a weak fallback reason.
 *
 * Note: the "already logged today" exclusion is enforced as a *hard filter*
 * (see filters.ts), not here. By the time this scorer runs, the recipe is
 * guaranteed not-eaten-today.
 */
import type { RecipeScorer } from '../types';

export const planContextScorer: RecipeScorer = (recipe, ctx) => {
  // Every surviving recipe is not-eaten today (filtered upstream). Apply
  // the soft +15% baseline first; planned-today stacks on top.
  const contributions: Array<ReturnType<RecipeScorer>[number]> = [
    { kind: 'multiplier', weight: 1.15, reason: 'not-eaten', signal: 'not-eaten' },
  ];
  const isPlannedToday = ctx.mealPlanToday.some((r) => r.id === recipe.id);
  if (isPlannedToday) {
    contributions.push({
      kind: 'multiplier',
      weight: 1.25,
      reason: 'planned-today',
      signal: 'planned-today',
    });
  }
  return contributions;
};
