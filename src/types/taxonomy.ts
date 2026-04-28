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

// ─── Food / recipe display tags (Sprint 37) ──────────────────────────────────

/**
 * Single-tag taxonomy used as a display badge on `RecipeCard` and a filter
 * key in Cocina. Replaces the legacy ad-hoc Spanish string literals
 * ('MI RECETA', 'GUARDADO', 'VEGANO', ...) that broke EN filters.
 *
 * Two semantic groups:
 * - **Status** (handler-assigned, mutually exclusive at the row level):
 *   `saved`, `planned`, `myRecipe`, `imported`. These are written by
 *   handlers when the user saves, plans, creates, or imports a recipe.
 * - **Content** (seed/editorial descriptors):
 *   `vegan`, `dessert`, `batch`, `breakfast`, `express`, `snack`.
 *
 * Display labels live in `t.recipeTags.<key>` (i18n ES + EN).
 */
export type FoodTag =
  // Status
  | 'saved'
  | 'planned'
  | 'myRecipe'
  | 'imported'
  | 'leftovers'
  // Content
  | 'vegan'
  | 'dessert'
  | 'batch'
  | 'breakfast'
  | 'express'
  | 'snack';

export const FOOD_TAGS: readonly FoodTag[] = [
  'saved',
  'planned',
  'myRecipe',
  'imported',
  'leftovers',
  'vegan',
  'dessert',
  'batch',
  'breakfast',
  'express',
  'snack',
] as const;
