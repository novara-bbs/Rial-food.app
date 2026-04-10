import type { Ingredient, Allergen } from '../../../types';

interface RecipeData {
  macros?: { calories?: number; protein?: number; carbs?: number; fats?: number };
  recipeIngredients?: { ingredientId: string; ingredient?: Ingredient }[];
}

interface UserProfileSlice {
  goal?: string;
  foodDislikes?: string[];
  intolerances?: Allergen[];
  dailyTarget?: { cal: number; pro: number };
}

/**
 * Calculates a 0–100 match score for a recipe against the user's profile.
 *
 * Scoring breakdown:
 * - Protein adequacy vs daily target (0–40 pts)
 * - Calorie fit for goal (0–30 pts)
 * - Allergen-free (0–20 pts)
 * - No disliked ingredients (0–10 pts)
 */
export function calculateMatchScore(
  recipe: RecipeData,
  userProfile: UserProfileSlice,
  dictionary: Ingredient[],
): number {
  let score = 0;

  const recipePro = recipe.macros?.protein || 0;
  const recipeCal = recipe.macros?.calories || 0;
  const targetPro = userProfile.dailyTarget?.pro || 180;
  const targetCal = userProfile.dailyTarget?.cal || 2400;

  // 1. Protein adequacy (0–40): how well does this recipe contribute to daily protein?
  // A single meal should be ~25-40% of daily target
  const proRatio = recipePro / (targetPro * 0.33); // ideal = 1.0
  score += Math.round(Math.min(40, proRatio * 40));

  // 2. Calorie fit for goal (0–30)
  const calPerMeal = targetCal / 3; // rough per-meal target
  const calRatio = recipeCal / calPerMeal;
  const goal = userProfile.goal || 'maintain';

  if (goal === 'gain' || goal === 'muscle') {
    // Bulking: higher cals = better, up to 1.3x
    score += Math.round(Math.min(30, Math.min(calRatio, 1.3) / 1.3 * 30));
  } else if (goal === 'lose' || goal === 'cut') {
    // Cutting: lower cals = better, sweet spot 0.6-0.9x
    const cutScore = calRatio <= 0.9 ? 30 : calRatio <= 1.1 ? 20 : 10;
    score += cutScore;
  } else {
    // Maintain: close to 1.0 is best
    const diff = Math.abs(1 - calRatio);
    score += Math.round(Math.max(0, 30 - diff * 30));
  }

  // 3. Allergen-free (0–20)
  const intolerances = userProfile.intolerances || [];
  if (intolerances.length === 0) {
    score += 20; // no restrictions = full score
  } else {
    const ingredients = (recipe.recipeIngredients || [])
      .map(ri => ri.ingredient || dictionary.find(d => d.id === ri.ingredientId))
      .filter(Boolean) as Ingredient[];
    const hasAllergen = ingredients.some(ing => intolerances.some(a => ing.allergens.includes(a)));
    score += hasAllergen ? 0 : 20;
  }

  // 4. No disliked ingredients (0–10)
  const dislikes = userProfile.foodDislikes || [];
  if (dislikes.length === 0) {
    score += 10;
  } else {
    const ingredientIds = (recipe.recipeIngredients || []).map(ri => ri.ingredientId || ri.ingredient?.id);
    const hasDisliked = ingredientIds.some(id => dislikes.includes(id || ''));
    score += hasDisliked ? 0 : 10;
  }

  return Math.min(100, Math.max(0, score));
}
