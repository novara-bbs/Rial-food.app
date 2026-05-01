/**
 * Sprint 50 `[1.5.164]` — rank Recipes that help close a macro gap.
 * Sprint 53 `[1.5.184]` — rewritten as a thin wrapper over the
 * personalization scorer pipeline (see ./personalization/).
 *
 * Hard filters (allergen, slot, already-logged-today) live in
 * `personalization/scorers/filters.ts`. Soft signals (planned-today,
 * affinity, familiarity, weekly-fatigue, preferences, social, tier,
 * embedding) live in `personalization/scorers/`. This file stays
 * back-compat with the public `rankRecipesForGap` signature and just
 * builds a `PersonalizationContext` from the options.
 */
import type { Recipe } from '../../../types/recipe';
import type { Allergen } from '../../../types/food';
import type { UserProfile } from '../../../types/user';
import type { DailyLogEntry, FoodHistoryEntry } from '../../food/handlers/meal-handlers';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { MacroKey } from './meal-gaps';
import { guessMealSlotForTime, type MealSlotGuess } from './meal-gaps';
import { composeScorers } from './personalization/combine';
import { dropFilter } from './personalization/scorers/filters';
import { macroDensityBase } from './personalization/scorers/macro-density';
import { planContextScorer } from './personalization/scorers/plan-context';
import { affinityScorer } from './personalization/scorers/affinity';
import { familiarityScorer } from './personalization/scorers/familiarity';
import { weeklyFatigueScorer } from './personalization/scorers/weekly-fatigue';
import { preferencesScorer } from './personalization/scorers/preferences';
import { socialScorer } from './personalization/scorers/social';
import { tierScorer } from './personalization/scorers/tier';
import { embeddingScorer } from './personalization/scorers/embedding';
import type {
  PersonalizationContext,
  RecipeReason,
  RecipeScorer,
} from './personalization/types';

export type { RecipeReason } from './personalization/types';

export interface RankedRecipe {
  recipe: Recipe;
  reason: RecipeReason;
  score: number;
}

export interface SuggestRecipeOptions {
  /** Recipes the user planned for today's slot grid. */
  mealPlanToday?: readonly Recipe[];
  /** Today's daily log — used by the dedupe hard-filter. */
  dailyLog?: readonly DailyLogEntry[];
  /** Last 7 days of nutritionHistory archives. */
  weeklyArchive?: readonly DailyArchive[];
  /** User's saved/forked recipes — feeds familiarity bonus. */
  savedRecipes?: readonly Recipe[];
  /** Cross-day food history for ingredient affinity. */
  foodHistory?: readonly FoodHistoryEntry[];
  /** Profile (foodPreferences, dietary, intolerances). */
  userProfile?: UserProfile | null;
  /** Creator IDs the user follows. */
  followedCreators?: readonly string[];
  /** User intolerances. Falls back to userProfile.intolerances if unset. */
  intolerances?: readonly Allergen[];
  /** Override the meal-slot guess (testable). Defaults to `guessMealSlotForTime()`. */
  slotGuess?: MealSlotGuess;
  /** Max results. Default 3. */
  limit?: number;
}

const SCORERS: readonly RecipeScorer[] = [
  planContextScorer,
  affinityScorer,
  familiarityScorer,
  weeklyFatigueScorer,
  preferencesScorer,
  socialScorer,
  tierScorer,
  embeddingScorer,
];

function buildContext(
  macroKey: MacroKey,
  options: SuggestRecipeOptions,
): PersonalizationContext {
  const profile = options.userProfile ?? null;
  return {
    macroKey,
    mealPlanToday: options.mealPlanToday ?? [],
    dailyLog: options.dailyLog ?? [],
    weeklyArchive: options.weeklyArchive ?? [],
    savedRecipes: options.savedRecipes ?? [],
    foodHistory: options.foodHistory ?? [],
    userProfile: profile,
    followedCreators: options.followedCreators ?? [],
    intolerances: options.intolerances ?? profile?.intolerances ?? [],
    slotGuess: options.slotGuess ?? guessMealSlotForTime(),
  };
}

/**
 * Main ranker. Returns top-N recipes that best help close the deficit.
 */
export function rankRecipesForGap(
  macroKey: MacroKey,
  pool: readonly Recipe[],
  options: SuggestRecipeOptions = {},
): RankedRecipe[] {
  const limit = options.limit ?? 3;
  const ctx = buildContext(macroKey, options);
  const scored: RankedRecipe[] = [];

  for (const recipe of pool) {
    if (dropFilter(recipe, ctx)) continue;

    const base = macroDensityBase(recipe, macroKey);
    if (base <= 0) continue;

    const { score, reason } = composeScorers(recipe, ctx, base, SCORERS);
    scored.push({ recipe, reason, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
