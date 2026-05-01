/**
 * preferences scorer — applies the user's explicit foodPreferences (trinario
 * R8.3 model: 'like' | 'dislike') and dietary tags to the score.
 *
 *   - Each liked food name appearing in recipe.ingredients → ×1.10 stacked
 *     (capped at ×1.30 total to avoid runaway).
 *   - Each disliked food name appearing in recipe.ingredients → ×0.50.
 *     (Recipes with disliked ingredients drop heavily but don't get
 *     hard-excluded — the user might still cook them with substitutions.)
 *   - dietaryTags ∩ userProfile.dietaryPreferences (string match) → ×1.05.
 *
 * Reason flag: only `liked` is surfaced to the UI. Dislikes don't surface
 * a reason (the card just doesn't appear because score drops).
 */
import type { RecipeScorer } from '../types';

const LIKE_STACK_CAP = 1.30;
const DISLIKE_FACTOR = 0.50;
const DIETARY_MATCH_BONUS = 1.05;

const norm = (s: string): string => s.toLowerCase().trim();

export const preferencesScorer: RecipeScorer = (recipe, ctx) => {
  const profile = ctx.userProfile;
  if (!profile) return [];
  const contributions = [];

  const ingredients = (recipe.ingredients ?? []).map(norm);
  const prefs = profile.foodPreferences ?? {};
  let likeMultiplier = 1;
  let dislikeMultiplier = 1;
  for (const [foodName, mood] of Object.entries(prefs)) {
    const f = norm(foodName);
    if (!f) continue;
    const overlap = ingredients.some((ing) => ing.includes(f) || f.includes(ing));
    if (!overlap) continue;
    if (mood === 'like') likeMultiplier = Math.min(LIKE_STACK_CAP, likeMultiplier * 1.10);
    else if (mood === 'dislike') dislikeMultiplier *= DISLIKE_FACTOR;
  }
  if (likeMultiplier !== 1) {
    contributions.push({
      kind: 'multiplier' as const,
      weight: likeMultiplier,
      reason: 'liked' as const,
      signal: 'liked-foods',
    });
  }
  if (dislikeMultiplier !== 1) {
    contributions.push({
      kind: 'multiplier' as const,
      weight: dislikeMultiplier,
      signal: 'disliked-foods',
    });
  }

  // Dietary tag intersection — both fields are free-form string[]; fuzzy match.
  const userDiet = (profile.dietaryPreferences ?? []).map(norm);
  const recipeDiet = (recipe.dietaryTags ?? []).map(norm);
  if (userDiet.length > 0 && recipeDiet.length > 0) {
    const intersects = recipeDiet.some((tag) => userDiet.includes(tag));
    if (intersects) {
      contributions.push({
        kind: 'multiplier' as const,
        weight: DIETARY_MATCH_BONUS,
        signal: 'dietary-match',
      });
    }
  }

  return contributions;
};
