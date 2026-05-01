/**
 * Personalization layer for recipe suggestions — Sprint 53 [1.5.184].
 *
 * Composable scorer pipeline that ranks recipes for a macro deficit using:
 *   - macro density (per-portion grams of the target macro)
 *   - planned-today / not-eaten-today context
 *   - foodHistory affinity (frequent ingredients)
 *   - savedRecipes + cookedAt familiarity
 *   - weekly fatigue (anti-repetition over the last 7 days)
 *   - foodPreferences (likes/dislikes), dietary tags, cuisine
 *   - followedCreators social signal
 *   - tier (verified, RIAL-curated, fork penalty)
 *
 * Architecture is pure-functional: each scorer is a function `(Recipe, ctx)
 * → ScoreContribution[]`. New signals plug in without touching existing
 * scorers. The `embedding.ts` scorer is a placeholder for the future RAG
 * migration (Supabase pgvector); today it returns no contribution.
 */
import type { Recipe } from '../../../../types/recipe';
import type { Allergen } from '../../../../types/food';
import type { UserProfile } from '../../../../types/user';
import type { DailyLogEntry, FoodHistoryEntry } from '../../../food/handlers/meal-handlers';
import type { DailyArchive } from '../../../../hooks/useDailyReset';
import type { MacroKey, MealSlotGuess } from '../meal-gaps';

/** Why a recipe was surfaced — drives the UI badge under the card. */
export type RecipeReason =
  | 'planned-today'
  | 'not-eaten'
  | 'macro-density'
  | 'history'
  | 'cooked-before'
  | 'liked'
  | 'creator-follow'
  | 'embedding';

/**
 * Priority for resolving the displayed reason when multiple scorers
 * contribute. Higher index = stronger signal. The composer picks the
 * highest-priority reason that any scorer flagged with a positive
 * contribution (≠ neutral 1.0 multiplier, ≠ 0 additive).
 */
export const REASON_PRIORITY: readonly RecipeReason[] = [
  'macro-density',
  'not-eaten',
  'liked',
  'cooked-before',
  'history',
  'creator-follow',
  'embedding',
  'planned-today',
] as const;

export type ScoreContributionKind = 'multiplier' | 'additive';

export interface ScoreContribution {
  kind: ScoreContributionKind;
  /** Multiplier value (1 = neutral) or additive bonus (0 = neutral). */
  weight: number;
  /** Optional reason this contribution wants to surface in the UI. */
  reason?: RecipeReason;
  /** Stable signal name for telemetry/debug. */
  signal: string;
}

export interface PersonalizationContext {
  /** The macro the user is most short of today. */
  macroKey: MacroKey;
  /** Recipes the user planned for today's slot grid. */
  mealPlanToday: readonly Recipe[];
  /** Today's logged meals — used by plan-context scorer. */
  dailyLog: readonly DailyLogEntry[];
  /** Last 7 days of archived nutrition (from `nutritionHistory`). */
  weeklyArchive: readonly DailyArchive[];
  /** User's saved/forked recipes (used as familiarity & fallback pool). */
  savedRecipes: readonly Recipe[];
  /** Cross-day food history — useCount + lastUsed by foodId/title. */
  foodHistory: readonly FoodHistoryEntry[];
  /** Profile (goal, dietary prefs, intolerances, foodPreferences). May be null pre-onboarding. */
  userProfile: UserProfile | null;
  /** Creator IDs the user follows. */
  followedCreators: readonly string[];
  /** Allergen exclusion set (typed). Used by the hard filter. */
  intolerances: readonly Allergen[];
  /** Current meal slot guess (lunch/dinner/snack/breakfast). */
  slotGuess: MealSlotGuess;
  /**
   * Optional future RAG payload — populated by an Edge Function once Supabase
   * pgvector ships. Today this is always undefined; the embedding scorer
   * short-circuits.
   */
  embeddings?: ReadonlyArray<{ recipeId: string; vector: readonly number[] }>;
  userVector?: readonly number[];
}

/** Pure function: given a recipe + ctx, return zero or more contributions. */
export type RecipeScorer = (
  recipe: Recipe,
  ctx: PersonalizationContext,
) => readonly ScoreContribution[];

/** Hard filter: returns true to *exclude* the recipe from the pool entirely. */
export type RecipeFilter = (
  recipe: Recipe,
  ctx: PersonalizationContext,
) => boolean;

export interface RankedRecipeWithReason {
  recipe: Recipe;
  reason: RecipeReason;
  score: number;
}
