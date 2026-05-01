/**
 * affinity scorer — boosts recipes whose ingredients overlap with the
 * user's frequent foodHistory entries. The reasoning: "I cook with X
 * often → recipes containing X are more likely to be cooked".
 *
 * Strategy:
 *   1. Build a Set of normalized titles from foodHistory, weighted by useCount.
 *   2. For each recipe ingredient string, check substring overlap.
 *   3. Boost = 1 + min(0.25, totalAffinity / 100).
 *
 * The cap ensures a single power-user history entry doesn't fully dominate.
 */
import type { RecipeScorer } from '../types';

const AFFINITY_MAX_BOOST = 0.25;

const norm = (s: string): string => s.toLowerCase().trim();

export const affinityScorer: RecipeScorer = (recipe, ctx) => {
  if (ctx.foodHistory.length === 0) return [];
  const ingredients = (recipe.ingredients ?? []).map(norm);
  if (ingredients.length === 0) return [];

  let affinityScore = 0;
  for (const entry of ctx.foodHistory) {
    const t = norm(entry.title);
    if (!t) continue;
    // Match if any recipe ingredient string contains the food title (or vice versa).
    const overlap = ingredients.some((ing) => ing.includes(t) || t.includes(ing));
    if (overlap) {
      // useCount is unbounded; scale modestly. 10 uses → +1, 50 → +5, etc.
      affinityScore += entry.useCount / 10;
    }
  }

  if (affinityScore <= 0) return [];
  const boost = Math.min(AFFINITY_MAX_BOOST, affinityScore / 100);
  return [{ kind: 'multiplier', weight: 1 + boost, reason: 'history', signal: 'history-affinity' }];
};
