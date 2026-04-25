/**
 * Recipe taxonomy types — canonical single source of truth.
 *
 * Extracted here (Q16) so that both the `Recipe` model (`src/types/recipe.ts`)
 * and the facets utility (`src/features/recipes/utils/facets.ts`) can import
 * the same types without creating a circular dependency.
 *
 * Callers that previously imported these from `facets.ts` can continue to do
 * so — `facets.ts` re-exports everything defined here for backwards compat.
 */

// ─── Cuisine ─────────────────────────────────────────────────────────────────

export type Cuisine =
  | 'italian'
  | 'mediterranean'
  | 'mexican'
  | 'asian'
  | 'american'
  | 'middleEastern'
  | 'latin'
  | 'other';

export const CUISINES: readonly Cuisine[] = [
  'italian',
  'mediterranean',
  'mexican',
  'asian',
  'american',
  'middleEastern',
  'latin',
  'other',
] as const;

// ─── Dietary tags ─────────────────────────────────────────────────────────────

export type DietaryTag =
  | 'vegan'
  | 'vegetarian'
  | 'keto'
  | 'lowCarb'
  | 'highProtein'
  | 'glutenFree'
  | 'dairyFree';

export const DIETARY_TAGS: readonly DietaryTag[] = [
  'vegan',
  'vegetarian',
  'keto',
  'lowCarb',
  'highProtein',
  'glutenFree',
  'dairyFree',
] as const;

// ─── Time buckets ─────────────────────────────────────────────────────────────

export type TimeBucket = 'under15' | 'under30' | 'under60' | 'over60';

export const TIME_BUCKETS: readonly TimeBucket[] = [
  'under15',
  'under30',
  'under60',
  'over60',
] as const;

// ─── Difficulty ───────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'] as const;
