/**
 * Sprint 50 `[1.5.164]` — rank Recipes that help close a macro gap.
 *
 * Sibling of `suggest-foods.ts` for the Home «qué te falta hoy» card. While
 * `rankFoodsForGap` ranks raw FoodVariants (per 100 g), this util ranks
 * full Recipes (per portion). Recipes are more actionable than isolated
 * ingredients — you can cook them, log servings, see full nutrition — so
 * the Home card surfaces both: recipes first, ingredients as fallback.
 *
 * Ranking strategy:
 *   1. **Macro per portion** — grams of the deficit macro per serving.
 *      For `cal` deficits we sum protein+carbs+fats (kcal-equivalent
 *      proxy) instead of raw calories, so dessert-heavy mono-macro
 *      recipes don't dominate.
 *   2. **Planned-today bonus** — +25 % when the recipe is in today's
 *      meal plan; the user already committed, just needs the nudge.
 *   3. **Not-eaten bonus** — +15 % when the recipe title doesn't
 *      already appear in today's daily log; recommending repeats is
 *      low-signal.
 *   4. **Trust tier** — user-authored recipes edge out community forks
 *      ceteris paribus (the user trusts their own vault more).
 *   5. **Allergen filter** — heuristic substring match over the
 *      recipe's free-form `ingredients[]` strings and `tags[]`,
 *      keyed by user `intolerances`. Pragmatic, not exhaustive — the
 *      RecipeDetail level still owns full ingredient×allergen matching.
 *   6. **Slot filter** — if the recipe declares `suitableFor`, it
 *      must intersect with the current `guessMealSlotForTime` guess.
 *
 * Output: top-N RankedRecipe[] ordered best-first. Empty array when
 * no recipe contributes meaningful macros for the deficit.
 *
 * Pure function. No dates side-effects, no locale, no localStorage.
 */
import type { Recipe } from '../../../types/recipe';
import type { Allergen } from '../../../types/food';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import type { MacroKey } from './meal-gaps';
import { guessMealSlotForTime, type MealSlotGuess } from './meal-gaps';

export type RecipeReason = 'planned-today' | 'not-eaten' | 'macro-density';

export interface RankedRecipe {
  recipe: Recipe;
  reason: RecipeReason;
  score: number;
}

export interface SuggestRecipeOptions {
  /** Recipes the user planned for today's slot grid (Recipe[]). */
  mealPlanToday?: readonly Recipe[];
  /** Today's daily log — used to penalise repeats. */
  dailyLog?: readonly DailyLogEntry[];
  /** User intolerances. Substring-matched against ingredients/tags. */
  intolerances?: readonly Allergen[];
  /** Override the meal-slot guess (testable). Defaults to `guessMealSlotForTime()`. */
  slotGuess?: MealSlotGuess;
  /** Max results. Default 3. */
  limit?: number;
}

/**
 * Heuristic keyword map for ingredient substring matching, ES + EN.
 * Conservative: false positives are preferable to false negatives at
 * the home-suggestion level (the user can still open the recipe).
 */
const ALLERGEN_KEYWORDS: Record<Allergen, readonly string[]> = {
  gluten: ['gluten', 'trigo', 'wheat', 'pan ', 'bread', 'pasta', 'cuscús', 'couscous', 'cebada', 'barley', 'centeno', 'rye'],
  dairy: ['leche', 'milk', 'queso', 'cheese', 'yogur', 'yogurt', 'mantequilla', 'butter', 'nata', 'cream', 'lácteo', 'dairy'],
  eggs: ['huevo', 'egg'],
  nuts: ['almendra', 'almond', 'nuez', 'walnut', 'avellana', 'hazelnut', 'pistacho', 'pistachio', 'anacardo', 'cashew', 'pecan'],
  peanuts: ['cacahuete', 'maní', 'peanut'],
  soy: ['soja', 'soy', 'tofu', 'tempeh', 'edamame'],
  fish: ['atún', 'tuna', 'salmón', 'salmon', 'merluza', 'cod', 'pescado', 'fish', 'sardina', 'sardine', 'caballa', 'mackerel'],
  shellfish: ['gamba', 'langostino', 'shrimp', 'prawn', 'mejillón', 'mussel', 'almeja', 'clam', 'pulpo', 'octopus', 'calamar', 'squid', 'mariscos', 'shellfish'],
  sesame: ['sésamo', 'sesamo', 'sesame', 'tahini'],
  celery: ['apio', 'celery'],
  mustard: ['mostaza', 'mustard'],
  sulfites: ['sulfito', 'sulfite'],
};

function recipeHasAllergen(
  recipe: Recipe,
  intolerances: readonly Allergen[],
): boolean {
  if (intolerances.length === 0) return false;
  const haystack = [
    ...(recipe.ingredients ?? []),
    ...recipe.tags,
  ].join(' ').toLowerCase();
  if (!haystack) return false;
  for (const allergen of intolerances) {
    const keywords = ALLERGEN_KEYWORDS[allergen];
    if (!keywords) continue;
    for (const kw of keywords) {
      if (haystack.includes(kw)) return true;
    }
  }
  return false;
}

function macroPerPortion(recipe: Recipe, key: MacroKey): number {
  const m = recipe.macros;
  switch (key) {
    case 'cal':   return m.calories ?? 0;
    case 'pro':   return m.protein ?? 0;
    case 'carbs': return m.carbs ?? 0;
    case 'fats':  return m.fats ?? 0;
  }
}

function tierBonus(recipe: Recipe): number {
  // User-saved (no publishedBy or 'self') ranks higher than seeded forks.
  // RIAL-curated tier (publishedBy starting 'rial' or sourceType 'original'
  // with no creator) is neutral; community forks are slightly penalised.
  if (!recipe.publishedBy || recipe.publishedBy === 'self') return 0.10;
  if (recipe.publishedBy.startsWith('rial')) return 0.05;
  if (recipe.forkedFrom) return -0.05;
  return 0;
}

function slotMatches(recipe: Recipe, slot: MealSlotGuess): boolean {
  if (!recipe.suitableFor || recipe.suitableFor.length === 0) return true;
  return (recipe.suitableFor as readonly string[]).includes(slot);
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
  const intolerances = options.intolerances ?? [];
  const mealPlanToday = options.mealPlanToday ?? [];
  const dailyLog = options.dailyLog ?? [];
  const slot = options.slotGuess ?? guessMealSlotForTime();

  const plannedIds = new Set(mealPlanToday.map(r => r.id));
  const loggedTitles = new Set(dailyLog.map(e => e.title.toLowerCase()));

  const scored: RankedRecipe[] = [];

  for (const recipe of pool) {
    // Hard filters
    if (recipeHasAllergen(recipe, intolerances)) continue;
    if (!slotMatches(recipe, slot)) continue;

    // Base macro signal — per portion (not per 100 g).
    let density: number;
    if (macroKey === 'cal') {
      const p = recipe.macros.protein ?? 0;
      const c = recipe.macros.carbs ?? 0;
      const f = recipe.macros.fats ?? 0;
      const sum = p + c + f;
      const nonZeroCount = (p > 0 ? 1 : 0) + (c > 0 ? 1 : 0) + (f > 0 ? 1 : 0);
      // Same anti-mono-macro penalty as suggest-foods. Recipes are unlikely
      // to be 100 % one macro, but defensive against weird seed entries.
      const balance = nonZeroCount === 3 ? 1 : nonZeroCount === 2 ? 0.5 : 0.2;
      density = sum * balance;
    } else {
      density = macroPerPortion(recipe, macroKey);
    }
    if (density <= 0) continue;

    // Reason + multiplier resolution
    const isPlannedToday = plannedIds.has(recipe.id);
    const isAlreadyLogged = loggedTitles.has(recipe.title.toLowerCase());

    let multiplier = 1;
    let reason: RecipeReason = 'macro-density';
    if (isPlannedToday) {
      multiplier *= 1.25;
      reason = 'planned-today';
    }
    if (!isAlreadyLogged) {
      multiplier *= 1.15;
      // Only override the reason when planned-today didn't already win.
      if (reason === 'macro-density') reason = 'not-eaten';
    } else {
      // Recipe already eaten today — soft penalty so non-repeats win.
      multiplier *= 0.7;
    }

    const score = density * multiplier + tierBonus(recipe);
    scored.push({ recipe, reason, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
