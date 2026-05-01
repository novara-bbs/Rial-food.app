/**
 * familiarity scorer — boosts recipes the user has already saved or cooked.
 *
 *   - In savedRecipes set → small bonus (+0.05 multiplier — "you saved this").
 *   - cookedAt[] count > 0 → larger bonus, capped to avoid mono-dominance:
 *       1 cook → ×1.05
 *       3 cooks → ×1.10
 *       5+ cooks → ×1.15
 *     Caveat: the "weekly-fatigue" scorer separately penalises recipes
 *     cooked in the last 7 days, so a heavy-recent cook gets net-neutral.
 */
import type { RecipeScorer } from '../types';

const COOKED_BONUS_TIERS = [
  { min: 1, weight: 1.05 },
  { min: 3, weight: 1.10 },
  { min: 5, weight: 1.15 },
] as const;

export const familiarityScorer: RecipeScorer = (recipe, ctx) => {
  const contributions = [];
  const isSaved = ctx.savedRecipes.some((r) => r.id === recipe.id);
  if (isSaved) {
    contributions.push({
      kind: 'additive' as const,
      weight: 0.05,
      signal: 'saved-bonus',
    });
  }

  const cookCount = recipe.cookedAt?.length ?? 0;
  if (cookCount > 0) {
    let weight = 1;
    for (const tier of COOKED_BONUS_TIERS) {
      if (cookCount >= tier.min) weight = tier.weight;
    }
    contributions.push({
      kind: 'multiplier' as const,
      weight,
      reason: 'cooked-before' as const,
      signal: 'cooked-before',
    });
  }
  return contributions;
};
