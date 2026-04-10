/**
 * Batch cooking analysis — detects ingredients shared across the week's meal plan
 * and suggests efficient batch-prep sessions to save time.
 */

export interface BatchSession {
  baseIngredient: string;
  recipeNames: string[];
  dayIndices: number[];
  timeSavedMins: number;
}

export interface BatchCookingAnalysis {
  sessions: BatchSession[];
  totalTimeSavedMins: number;
  hasOpportunities: boolean;
}

interface BaseIngredientDef {
  label: string;
  keywords: string[];
  /** Time saved per extra use (minutes) */
  timeMins: number;
}

const BASE_INGREDIENTS: BaseIngredientDef[] = [
  { label: 'Pollo',           keywords: ['pollo', 'chicken', 'pechuga', 'muslo'],            timeMins: 20 },
  { label: 'Pavo',            keywords: ['pavo', 'turkey'],                                   timeMins: 20 },
  { label: 'Arroz',           keywords: ['arroz', 'rice'],                                    timeMins: 15 },
  { label: 'Quinoa',          keywords: ['quinoa'],                                            timeMins: 12 },
  { label: 'Pasta',           keywords: ['pasta', 'espagueti', 'macarrones', 'fideos'],       timeMins: 10 },
  { label: 'Avena',           keywords: ['avena', 'oats', 'porridge'],                        timeMins: 5  },
  { label: 'Huevos cocidos',  keywords: ['huevo', 'egg'],                                     timeMins: 6  },
  { label: 'Legumbres',       keywords: ['lenteja', 'garbanzo', 'alubia', 'bean', 'chili'],   timeMins: 30 },
  { label: 'Boniato / Papa',  keywords: ['boniato', 'sweet potato', 'papa', 'patata'],        timeMins: 25 },
  { label: 'Verduras asadas', keywords: ['brócoli', 'broccoli', 'calabacín', 'pimiento'],     timeMins: 20 },
  { label: 'Bisonte / Carne', keywords: ['bisonte', 'bison', 'ternera', 'carne picada'],      timeMins: 15 },
];

function mealMatchesBase(meal: any, def: BaseIngredientDef): boolean {
  const title = (meal.title || '').toLowerCase();
  if (def.keywords.some(k => title.includes(k))) return true;

  // Deep check: recipeIngredients list
  if (Array.isArray(meal.recipeIngredients)) {
    return meal.recipeIngredients.some((ri: any) => {
      const name = (ri.ingredient?.name || ri.name || '').toLowerCase();
      return def.keywords.some(k => name.includes(k));
    });
  }
  return false;
}

/**
 * Analyse the week's meal plan and return batch-cooking opportunities.
 *
 * @param mealPlan - Record<dayIndex 0-6, meal[]>
 */
export function analyzeBatchCooking(
  mealPlan: Record<number, any[]>,
): BatchCookingAnalysis {
  const sessions: BatchSession[] = [];

  for (const def of BASE_INGREDIENTS) {
    const matches: { name: string; day: number }[] = [];

    for (const [dayStr, meals] of Object.entries(mealPlan)) {
      const dayIndex = Number(dayStr);
      for (const meal of meals) {
        if (mealMatchesBase(meal, def)) {
          matches.push({ name: meal.title ?? 'Sin título', day: dayIndex });
        }
      }
    }

    if (matches.length >= 2) {
      const uniqueRecipes = [...new Set(matches.map(m => m.name))];
      const uniqueDays   = [...new Set(matches.map(m => m.day))];
      sessions.push({
        baseIngredient: def.label,
        recipeNames:    uniqueRecipes,
        dayIndices:     uniqueDays,
        timeSavedMins:  (uniqueRecipes.length - 1) * def.timeMins,
      });
    }
  }

  const totalTimeSavedMins = sessions.reduce((s, b) => s + b.timeSavedMins, 0);

  return { sessions, totalTimeSavedMins, hasOpportunities: sessions.length > 0 };
}
