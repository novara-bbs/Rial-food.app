/**
 * Meal reuse (leftover) detection — identifies meals that can be carried over
 * to subsequent days within their freshness window.
 */

export interface LeftoverSuggestion {
  mealTitle: string;
  sourceDayIndex: number;
  suggestedDayIndex: number;
  /** How many days the meal stays fresh after cooking */
  freshnessWindowDays: number;
}

interface FreshnessRule {
  keywords: string[];
  /** 0 = do not reuse */
  days: number;
}

const FRESHNESS_RULES: FreshnessRule[] = [
  // Avoid reuse
  { keywords: ['sushi', 'crudo', 'raw', 'ceviche', 'tartar'],           days: 0 },
  // 1 day
  { keywords: ['ensalada', 'salad', 'lechuga', 'rúcula'],                days: 1 },
  // 2 days
  { keywords: ['pollo', 'chicken', 'pavo', 'turkey', 'pescado', 'fish', 'salmón', 'salmon'], days: 2 },
  // 3 days
  { keywords: ['arroz', 'rice', 'quinoa', 'pasta', 'guiso', 'stew', 'sopa', 'soup', 'pavo', 'bisonte'], days: 3 },
  // 4 days
  { keywords: ['legumbre', 'lenteja', 'garbanzo', 'alubia', 'chili', 'curry', 'dal'], days: 4 },
  // 5 days
  { keywords: ['avena', 'oats', 'granola', 'overnight'],                 days: 5 },
];

function getFreshnessWindow(mealTitle: string): number {
  const lower = mealTitle.toLowerCase();
  for (const rule of FRESHNESS_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.days;
  }
  return 3; // safe default
}

/**
 * Scan the week's meal plan and return leftover reuse suggestions.
 *
 * A suggestion is raised when:
 *  - A meal can be safely reused (freshness > 0)
 *  - The target day doesn't already have the same meal or a "SOBRAS" item
 *  - The target day has room for another meal (< 4 items)
 *
 * @param mealPlan - Record<dayIndex 0-6, meal[]>
 */
export function detectLeftovers(
  mealPlan: Record<number, any[]>,
): LeftoverSuggestion[] {
  const suggestions: LeftoverSuggestion[] = [];
  const seenPairs = new Set<string>();

  for (const [dayStr, meals] of Object.entries(mealPlan)) {
    const dayIndex = Number(dayStr);

    for (const meal of meals) {
      const title = meal.title ?? '';
      const window = getFreshnessWindow(title);
      if (window === 0) continue;

      for (let offset = 1; offset <= Math.min(window, 4); offset++) {
        const targetDay = (dayIndex + offset) % 7;
        const targetMeals: any[] = mealPlan[targetDay] ?? [];
        const pairKey = `${title}:${dayIndex}->${targetDay}`;

        if (seenPairs.has(pairKey)) continue;

        const alreadyPresent = targetMeals.some(
          m =>
            (m.title ?? '').toLowerCase() === title.toLowerCase() ||
            m.tag === 'SOBRAS',
        );

        if (!alreadyPresent && targetMeals.length < 4) {
          seenPairs.add(pairKey);
          suggestions.push({
            mealTitle: title,
            sourceDayIndex: dayIndex,
            suggestedDayIndex: targetDay,
            freshnessWindowDays: window,
          });
          break; // one suggestion per meal
        }
      }
    }
  }

  return suggestions;
}

/**
 * Given a suggestion, build the "sobras" meal entry to add to the plan.
 */
export function buildLeftoverMeal(sourceMeal: any, suggestion: LeftoverSuggestion): any {
  return {
    ...sourceMeal,
    id: Date.now() + Math.random(),
    tag: 'SOBRAS',
    title: `${sourceMeal.title} (sobras)`,
    time: sourceMeal.time ?? '13:00',
  };
}
