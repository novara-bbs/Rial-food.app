/**
 * macro-density scorer — the base signal: per-portion grams of the deficit
 * macro. For `cal` deficits we sum P+C+F (kcal-equivalent proxy) with an
 * anti-mono-macro penalty so dessert-heavy recipes don't dominate.
 *
 * This scorer doesn't return a multiplier or additive — it's the *base*
 * input to the pipeline (the value `composeScorers` multiplies/adds to).
 * For uniformity we expose a helper that just computes the base.
 */
import type { Recipe } from '../../../../../types/recipe';
import type { MacroKey } from '../../meal-gaps';

function macroPerPortion(recipe: Recipe, key: MacroKey): number {
  const m = recipe.macros;
  switch (key) {
    case 'cal': return m.calories ?? 0;
    case 'pro': return m.protein ?? 0;
    case 'carbs': return m.carbs ?? 0;
    case 'fats': return m.fats ?? 0;
  }
}

export function macroDensityBase(recipe: Recipe, macroKey: MacroKey): number {
  if (macroKey === 'cal') {
    const p = recipe.macros.protein ?? 0;
    const c = recipe.macros.carbs ?? 0;
    const f = recipe.macros.fats ?? 0;
    const sum = p + c + f;
    const nonZeroCount = (p > 0 ? 1 : 0) + (c > 0 ? 1 : 0) + (f > 0 ? 1 : 0);
    const balance = nonZeroCount === 3 ? 1 : nonZeroCount === 2 ? 0.5 : 0.2;
    return sum * balance;
  }
  return macroPerPortion(recipe, macroKey);
}
