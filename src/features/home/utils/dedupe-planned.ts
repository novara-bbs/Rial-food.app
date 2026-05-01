import type { Recipe } from '../../../types';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

type WithTitle = { title?: string };

const norm = (s: string | undefined | null) => (s ?? '').toLowerCase().trim();

/**
 * Filter planned meals that already have a logged counterpart today.
 *
 * Why title-based:
 *   the MealPlan shape is `Record<number, Recipe[]>` and DailyLogEntry has no
 *   `recipeId` cross-link. Title lowercase+trim matching is the existing
 *   contract used by `Home.tsx#nextMealSuggestion` since [1.5.107]. Refactor
 *   to id-based dedupe is queued for the MealPlan typing sprint.
 */
export function filterUnloggedPlanned<T extends Recipe & WithTitle>(
  planned: T[],
  log: DailyLogEntry[],
): T[] {
  if (!planned.length) return planned;
  const loggedTitles = new Set(log.map((e) => norm(e.title)));
  return planned.filter((m) => !loggedTitles.has(norm(m.title)));
}

/**
 * Find the next still-unlogged planned meal (by render order). Used to
 * derive the inline "next up" banner inside TodaysMeals.
 */
export function findNextPlanned<T extends Recipe & WithTitle>(
  planned: T[],
  log: DailyLogEntry[],
): T | null {
  const remaining = filterUnloggedPlanned(planned, log);
  return remaining[0] ?? null;
}
