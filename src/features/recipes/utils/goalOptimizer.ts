import type { Ingredient, Allergen } from '../../../types';

interface RecipeData {
  macros?: { calories?: number; protein?: number; carbs?: number; fats?: number };
  recipeIngredients?: { ingredientId: string; ingredient?: Ingredient; amount: number; unit: string }[];
}

interface UserProfileSlice {
  goal?: string;
  foodDislikes?: string[];
  intolerances?: Allergen[];
}

export interface GoalSuggestion {
  type: 'add' | 'swap' | 'reduce';
  ingredient?: Ingredient;
  fromIngredient?: Ingredient;
  toIngredient?: Ingredient;
  rationale: string;
  macroImpact: { cal: number; pro: number; fats: number };
}

/**
 * Returns goal-aware optimization suggestions for a recipe.
 * - "muscle"/"gain": suggest adding calorie-dense items (oils, nuts, dairy) → +200-400 kcal
 * - "lose"/"cut": flag high-fat ingredients → swap for leaner same-category alternatives
 * - "maintain"/"health"/"family": return []
 */
export function getGoalSuggestions(
  recipe: RecipeData,
  userProfile: UserProfileSlice,
  dictionary: Ingredient[],
): GoalSuggestion[] {
  const goal = userProfile.goal || 'maintain';
  if (goal === 'maintain' || goal === 'health' || goal === 'family' || goal === 'performance') return [];

  const dislikes = userProfile.foodDislikes || [];
  const intolerances = userProfile.intolerances || [];
  const suggestions: GoalSuggestion[] = [];

  const isUserSafe = (ing: Ingredient) =>
    !dislikes.includes(ing.id) && !intolerances.some(a => ing.allergens.includes(a));

  if (goal === 'gain' || goal === 'muscle') {
    // Find calorie-dense add-ons from oils, nuts, dairy categories
    const boostCategories = ['oils', 'nuts_seeds', 'dairy'] as const;
    const candidates = dictionary
      .filter(d => (boostCategories as readonly string[]).includes(d.category) && isUserSafe(d))
      .sort((a, b) => b.macros.calories - a.macros.calories);

    let addedCal = 0;
    for (const ing of candidates) {
      if (addedCal >= 400) break;
      // Skip if already in recipe
      const alreadyUsed = recipe.recipeIngredients?.some(ri => ri.ingredientId === ing.id || ri.ingredient?.id === ing.id);
      if (alreadyUsed) continue;

      const portion = ing.servingSizes?.[0]?.grams || 30;
      const ratio = portion / ing.baseAmount;
      const cal = Math.round(ing.macros.calories * ratio);
      const pro = Math.round(ing.macros.protein * ratio);
      const fats = Math.round(ing.macros.fats * ratio);

      suggestions.push({
        type: 'add',
        ingredient: ing,
        rationale: `+${cal} kcal · ${ing.servingSizes?.[0]?.name || `${portion}g`}`,
        macroImpact: { cal, pro, fats },
      });
      addedCal += cal;
      if (suggestions.length >= 3) break;
    }
  }

  if (goal === 'lose' || goal === 'cut') {
    // Find high-fat recipe ingredients and suggest leaner alternatives
    const recipeIngs = (recipe.recipeIngredients || [])
      .map(ri => ({
        ri,
        ingredient: ri.ingredient || dictionary.find(d => d.id === ri.ingredientId),
      }))
      .filter(x => x.ingredient) as { ri: any; ingredient: Ingredient }[];

    // Sort by fat content descending
    const highFat = recipeIngs
      .filter(x => x.ingredient.macros.fats > 10)
      .sort((a, b) => b.ingredient.macros.fats - a.ingredient.macros.fats);

    for (const { ingredient: from } of highFat.slice(0, 3)) {
      // Find leaner same-category alternative
      const leaner = dictionary
        .filter(d =>
          d.id !== from.id &&
          d.category === from.category &&
          d.macros.fats < from.macros.fats * 0.7 &&
          isUserSafe(d)
        )
        .sort((a, b) => a.macros.fats - b.macros.fats)[0];

      if (!leaner) continue;

      suggestions.push({
        type: 'swap',
        fromIngredient: from,
        toIngredient: leaner,
        rationale: `${Math.round(from.macros.fats - leaner.macros.fats)}g menos grasa`,
        macroImpact: {
          cal: leaner.macros.calories - from.macros.calories,
          pro: leaner.macros.protein - from.macros.protein,
          fats: leaner.macros.fats - from.macros.fats,
        },
      });
    }
  }

  return suggestions;
}
