/**
 * Hard filters — exclude a recipe from the pool entirely. Run before any
 * scorer. Each filter returns `true` to drop the recipe.
 *
 * Filters live separately from scorers because they short-circuit the
 * pipeline (no scoring performed for excluded recipes), and because their
 * semantics differ — allergen + slot are *contracts*, not *signals*.
 */
import type { Recipe } from '../../../../../types/recipe';
import type { Allergen } from '../../../../../types/food';
import type { DailyLogEntry } from '../../../../food/handlers/meal-handlers';
import type { MealSlotGuess } from '../../meal-gaps';
import type { RecipeFilter } from '../types';

/**
 * Heuristic ES + EN keyword map for ingredient substring matching.
 * Conservative: false positives are preferable to false negatives at the
 * suggestion-card level.
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

export function recipeHasAllergen(
  recipe: Recipe,
  intolerances: readonly Allergen[],
): boolean {
  if (intolerances.length === 0) return false;
  const haystack = [...(recipe.ingredients ?? []), ...recipe.tags].join(' ').toLowerCase();
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

export function slotMatches(recipe: Recipe, slot: MealSlotGuess): boolean {
  if (!recipe.suitableFor || recipe.suitableFor.length === 0) return true;
  return (recipe.suitableFor as readonly string[]).includes(slot);
}

/** Hard filter: recipe already logged today. */
export function isAlreadyLoggedToday(
  recipe: Recipe,
  dailyLog: readonly DailyLogEntry[],
): boolean {
  const titles = new Set(dailyLog.map((e) => e.title.toLowerCase().trim()));
  return titles.has(recipe.title.toLowerCase().trim());
}

/** Composed filter: returns true if the recipe should be excluded. */
export const dropFilter: RecipeFilter = (recipe, ctx) => {
  if (recipeHasAllergen(recipe, ctx.intolerances)) return true;
  if (!slotMatches(recipe, ctx.slotGuess)) return true;
  if (isAlreadyLoggedToday(recipe, ctx.dailyLog)) return true;
  return false;
};
