/**
 * useRecipeCalculations — pulls out the heavy memos used by RecipeDetail:
 *   - calculatedTotals (merge recipe + extra ingredients into combined macros + micros)
 *   - swapSuggestions (allergen/dislike-aware ingredient swaps)
 *   - matchScore (recipe vs user profile)
 *   - goalSuggestions (goal-aware tweaks)
 *
 * Pure derivation; no side effects. Reduces RecipeDetail.tsx by ~80 LoC.
 */
import { useMemo } from 'react';
import type { Recipe, Ingredient, Micronutrients } from '../../../types';
import type { RecipeIngredient } from '../../../types/food';
import type { UserProfile } from '../../../types/user';
import { getRecipeSwaps } from '../utils/substitutions';
import { calculateMatchScore } from '../utils/matchScore';
import { getGoalSuggestions } from '../utils/goalOptimizer';

export interface RecipeCalculations {
  calculatedTotals: {
    cal: number;
    pro: number;
    carbs: number;
    fats: number;
    micros: Micronutrients;
  };
  swapSuggestions: ReturnType<typeof getRecipeSwaps>;
  matchScore: number;
  goalSuggestions: ReturnType<typeof getGoalSuggestions>;
}

export function useRecipeCalculations(
  recipe: Recipe | null,
  extraIngredients: RecipeIngredient[],
  dictionary: Ingredient[],
  userProfile: UserProfile | undefined,
): RecipeCalculations {
  const calculatedTotals = useMemo(() => {
    if (!recipe) return { cal: 0, pro: 0, carbs: 0, fats: 0, micros: { vitamins: {}, minerals: {}, others: {} } as Micronutrients };
    const cal = recipe.macros?.calories || 0;
    const pro = recipe.macros?.protein || 0;
    const carbs = recipe.macros?.carbs || 0;
    const fats = recipe.macros?.fats || 0;
    const micros = recipe.micros || { vitamins: {}, minerals: {}, others: {} };

    let extraCal = 0, extraPro = 0, extraCarbs = 0, extraFats = 0;
    const extraMicros: Micronutrients = { vitamins: {}, minerals: {}, others: {} };

    extraIngredients.forEach((ri) => {
      const ing = dictionary.find((d) => d.id === ri.ingredientId);
      if (!ing) return;
      const ratio = ri.amount / ing.baseAmount;
      extraCal += ing.macros.calories * ratio;
      extraPro += ing.macros.protein * ratio;
      extraCarbs += ing.macros.carbs * ratio;
      extraFats += ing.macros.fats * ratio;

      if (!ing.micros) return;
      Object.entries(ing.micros.vitamins).forEach(([key, value]) => {
        extraMicros.vitamins[key as keyof typeof extraMicros.vitamins] = ((extraMicros.vitamins[key as keyof typeof extraMicros.vitamins] || 0) + (value as number) * ratio);
      });
      Object.entries(ing.micros.minerals).forEach(([key, value]) => {
        extraMicros.minerals[key as keyof typeof extraMicros.minerals] = ((extraMicros.minerals[key as keyof typeof extraMicros.minerals] || 0) + (value as number) * ratio);
      });
      Object.entries(ing.micros.others).forEach(([key, value]) => {
        extraMicros.others[key as keyof typeof extraMicros.others] = ((extraMicros.others[key as keyof typeof extraMicros.others] || 0) + (value as number) * ratio);
      });
    });

    const combinedMicros: Micronutrients = {
      vitamins: { ...micros.vitamins },
      minerals: { ...micros.minerals },
      others: { ...micros.others },
    };
    Object.entries(extraMicros.vitamins).forEach(([key, value]) => {
      combinedMicros.vitamins[key as keyof typeof combinedMicros.vitamins] = ((combinedMicros.vitamins[key as keyof typeof combinedMicros.vitamins] || 0) + (value as number));
    });
    Object.entries(extraMicros.minerals).forEach(([key, value]) => {
      combinedMicros.minerals[key as keyof typeof combinedMicros.minerals] = ((combinedMicros.minerals[key as keyof typeof combinedMicros.minerals] || 0) + (value as number));
    });
    Object.entries(extraMicros.others).forEach(([key, value]) => {
      combinedMicros.others[key as keyof typeof combinedMicros.others] = ((combinedMicros.others[key as keyof typeof combinedMicros.others] || 0) + (value as number));
    });

    return {
      cal: Math.round(cal + extraCal),
      pro: Math.round(pro + extraPro),
      carbs: Math.round(carbs + extraCarbs),
      fats: Math.round(fats + extraFats),
      micros: combinedMicros,
    };
  }, [recipe, extraIngredients, dictionary]);

  const swapSuggestions = useMemo(() => {
    if (!recipe?.recipeIngredients?.length) return [];
    return getRecipeSwaps(recipe.recipeIngredients, userProfile || {}, dictionary);
  }, [recipe?.recipeIngredients, userProfile, dictionary]);

  const matchScore = useMemo(() => {
    if (!recipe) return 0;
    const foodDislikes = Object.entries(userProfile?.foodPreferences ?? {})
      .filter(([, v]) => v === 'dislike')
      .map(([id]) => id);
    return calculateMatchScore(recipe, {
      goal: userProfile?.goal,
      foodDislikes,
      intolerances: userProfile?.intolerances,
      dailyTarget: undefined,
    }, dictionary);
  }, [recipe, userProfile, dictionary]);

  const goalSuggestions = useMemo(() => {
    if (!recipe) return [];
    return getGoalSuggestions(recipe, userProfile || {}, dictionary);
  }, [recipe, userProfile, dictionary]);

  return { calculatedTotals, swapSuggestions, matchScore, goalSuggestions };
}
