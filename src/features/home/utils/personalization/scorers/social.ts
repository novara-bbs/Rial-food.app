/**
 * social scorer — boosts recipes published by creators the user follows.
 *
 *   - recipe.publishedBy ∈ followedCreators → +0.15 additive bonus.
 *
 * Additive (not multiplier) because a follow signal is intentful but not
 * "this is what you eat" — it's a discovery cue, applied once.
 */
import type { RecipeScorer } from '../types';

const FOLLOW_BONUS = 0.15;

export const socialScorer: RecipeScorer = (recipe, ctx) => {
  if (!recipe.publishedBy || ctx.followedCreators.length === 0) return [];
  if (!ctx.followedCreators.includes(recipe.publishedBy)) return [];
  return [{
    kind: 'additive',
    weight: FOLLOW_BONUS,
    reason: 'creator-follow',
    signal: 'creator-follow',
  }];
};
