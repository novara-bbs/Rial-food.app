import type { Recipe } from './recipe';

export interface MealPlanDay {
  day: string;
  meals: Recipe[];
}

/** A line item on the shopping list (manually added or auto-generated from the plan). */
export interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  checked: boolean;
}
