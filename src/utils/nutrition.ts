/**
 * Mifflin-St Jeor TDEE calculation + macro split
 */

type Sex = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'active' | 'veryActive';
type Goal = 'muscle' | 'cut' | 'maintain' | 'health' | 'family';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  active: 1.55,
  veryActive: 1.725,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  muscle: 300,   // surplus
  cut: -400,     // deficit
  maintain: 0,
  health: -100,  // slight deficit for healthier eating
  family: 0,
};

export function calculateBMR(weight: number, height: number, age: number, sex: Sex): number {
  // Mifflin-St Jeor
  if (sex === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

export function calculateDailyTargets(
  weight: number,
  height: number,
  age: number,
  sex: Sex,
  activity: ActivityLevel,
  goal: Goal
): { cal: number; pro: number; carbs: number; fats: number } {
  const bmr = calculateBMR(weight, height, age, sex);
  const tdee = calculateTDEE(bmr, activity);
  const cal = Math.round(tdee + GOAL_ADJUSTMENTS[goal]);

  // Macro split based on goal
  let proteinPerKg: number;
  let fatPercent: number;

  switch (goal) {
    case 'muscle':
      proteinPerKg = 2.0;
      fatPercent = 0.25;
      break;
    case 'cut':
      proteinPerKg = 2.2;
      fatPercent = 0.25;
      break;
    case 'maintain':
    case 'health':
    case 'family':
    default:
      proteinPerKg = 1.6;
      fatPercent = 0.30;
      break;
  }

  const pro = Math.round(weight * proteinPerKg);
  const fats = Math.round((cal * fatPercent) / 9);
  const carbsCal = cal - (pro * 4) - (fats * 9);
  const carbs = Math.round(Math.max(carbsCal, 0) / 4);

  return { cal, pro, carbs, fats };
}

/**
 * Food quality rating based on nutritional density
 * Returns: 'good' (😊) | 'neutral' (😐) | 'poor' (😕)
 */
export function getFoodQuality(macros: {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  saturatedFat?: number;
  sugar?: number;
}, fiber?: number): 'good' | 'neutral' | 'poor' {
  if (!macros.calories || macros.calories === 0) return 'neutral';

  let score = 0;

  // Protein density: protein calories / total calories
  const proteinRatio = (macros.protein * 4) / macros.calories;
  if (proteinRatio > 0.25) score += 2;
  else if (proteinRatio > 0.15) score += 1;

  // Fiber bonus
  if (fiber && fiber > 5) score += 2;
  else if (fiber && fiber > 2) score += 1;

  // Low sugar penalty
  if (macros.sugar && macros.sugar > 15) score -= 2;
  else if (macros.sugar && macros.sugar > 8) score -= 1;

  // High saturated fat penalty
  if (macros.saturatedFat && macros.saturatedFat > 10) score -= 2;
  else if (macros.saturatedFat && macros.saturatedFat > 5) score -= 1;

  // Caloric density (lower is generally better for whole foods)
  // >300 kcal per 100g typical serving is dense
  if (macros.calories < 200) score += 1;
  else if (macros.calories > 500) score -= 1;

  if (score >= 3) return 'good';
  if (score >= 0) return 'neutral';
  return 'poor';
}

export const FOOD_QUALITY_EMOJI: Record<string, string> = {
  good: '😊',
  neutral: '😐',
  poor: '😕',
};
