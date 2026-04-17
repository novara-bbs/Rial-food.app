import type { MealSlot, Recipe } from '../../../types';
import { MEAL_SLOTS } from '../../../types';

/**
 * Normalise a recipe's meal slot assignment into the canonical MealSlot[] shape.
 *
 * Priority:
 *   1. `recipe.suitableFor` (post-Q19 multi-valued) — used as-is when present and non-empty.
 *   2. `recipe.mealType` (legacy single-valued) — normalised from ES/EN strings.
 *   3. `undefined` — recipe is versatile (appears in all slot filters).
 *
 * Returning `undefined` (not `[]`) is semantically important: it means the
 * user/seed hasn't made a choice, so filters treat the recipe as "fits
 * anywhere" rather than "fits nothing".
 */
export function getRecipeSlots(recipe: Pick<Recipe, 'suitableFor' | 'mealType'>): MealSlot[] | undefined {
  if (recipe.suitableFor && recipe.suitableFor.length > 0) {
    return recipe.suitableFor;
  }
  if (recipe.mealType) {
    const normalised = normaliseLegacySlot(recipe.mealType);
    if (normalised) return [normalised];
  }
  return undefined;
}

/**
 * Check whether a recipe is a good fit for a given slot.
 * Versatile recipes (no slot assignment) match every slot.
 */
export function recipeFitsSlot(recipe: Pick<Recipe, 'suitableFor' | 'mealType'>, slot: MealSlot): boolean {
  const slots = getRecipeSlots(recipe);
  if (!slots) return true;
  return slots.includes(slot);
}

/**
 * Map a legacy free-form mealType string onto the canonical MealSlot union.
 * Accepts the English keys plus the Spanish labels that seed data used to
 * write (e.g. "desayuno", "cena"). Returns null when the input doesn't map.
 */
function normaliseLegacySlot(raw: string): MealSlot | null {
  const lower = raw.toLowerCase().trim();
  if (lower === 'breakfast' || lower === 'desayuno') return 'breakfast';
  if (lower === 'lunch' || lower === 'comida' || lower === 'almuerzo') return 'lunch';
  if (lower === 'dinner' || lower === 'cena') return 'dinner';
  if (lower === 'snack' || lower === 'merienda') return 'snack';
  return null;
}

/**
 * Pick a default slot when a recipe is added to a day without the user
 * specifying one explicitly (Planner quick-add, AddMeal on Home, etc.).
 * Picks the first `suitableFor` entry, falling back to `lunch` when the
 * recipe is versatile or slot-less.
 */
export function defaultSlotFor(recipe: Pick<Recipe, 'suitableFor' | 'mealType'>): MealSlot {
  const slots = getRecipeSlots(recipe);
  return slots?.[0] ?? 'lunch';
}

export { MEAL_SLOTS };
