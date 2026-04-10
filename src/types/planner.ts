import type { Recipe } from './recipe';

export interface MealPlanDay {
  day: string;
  meals: Recipe[];
}
