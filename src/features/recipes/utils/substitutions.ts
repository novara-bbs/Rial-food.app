import type { Ingredient, Allergen, RecipeIngredient } from '../../../types';

export interface SwapSuggestion {
  fromIngredient: Ingredient;
  toIngredient: Ingredient;
  reason: 'dislike' | 'intolerance';
  allergenHit?: Allergen;
  macroImpact: { cal: number; pro: number };
}

/**
 * Pure function: finds recipe ingredients that conflict with user preferences
 * and suggests the best replacement from the dictionary.
 */
export function getRecipeSwaps(
  recipeIngredients: RecipeIngredient[],
  userProfile: { foodDislikes?: string[]; intolerances?: Allergen[] },
  dictionary: Ingredient[],
): SwapSuggestion[] {
  const dislikes = userProfile.foodDislikes || [];
  const intolerances = userProfile.intolerances || [];
  if (dislikes.length === 0 && intolerances.length === 0) return [];

  const swaps: SwapSuggestion[] = [];

  for (const ri of recipeIngredients) {
    const ingredient = ri.ingredient || dictionary.find(d => d.id === ri.ingredientId);
    if (!ingredient) continue;

    // Check dislikes
    const isDisliked = dislikes.includes(ingredient.id);

    // Check intolerances
    const allergenHit = intolerances.find(a => ingredient.allergens.includes(a));

    if (!isDisliked && !allergenHit) continue;

    // Find best replacement: same category, no user conflicts, protein within ±20%
    const candidates = dictionary.filter(d => {
      if (d.id === ingredient.id) return false;
      if (dislikes.includes(d.id)) return false;
      if (intolerances.some(a => d.allergens.includes(a))) return false;
      if (d.category !== ingredient.category) return false;
      return true;
    });

    // Rank by: protein within ±20%, then tag overlap
    const ranked = candidates.map(d => {
      const proteinDiff = Math.abs(d.macros.protein - ingredient.macros.protein);
      const proteinOk = proteinDiff <= ingredient.macros.protein * 0.2 ? 1 : 0;
      const tagOverlap = d.tags.filter(t => ingredient.tags.includes(t)).length;
      return { ingredient: d, score: proteinOk * 10 + tagOverlap };
    }).sort((a, b) => b.score - a.score);

    const best = ranked[0];
    if (!best) continue;

    swaps.push({
      fromIngredient: ingredient,
      toIngredient: best.ingredient,
      reason: allergenHit ? 'intolerance' : 'dislike',
      allergenHit: allergenHit || undefined,
      macroImpact: {
        cal: best.ingredient.macros.calories - ingredient.macros.calories,
        pro: best.ingredient.macros.protein - ingredient.macros.protein,
      },
    });
  }

  return swaps;
}
