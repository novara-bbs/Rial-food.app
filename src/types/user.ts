import type { Recipe } from './recipe';
import type { ToleranceLog, DailyCheckIn } from './wellness';
import type { MealPlanDay } from './planner';

export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  avatarUrl?: string;
  connectedDevices: {
    whoop: boolean;
    oura: boolean;
    garmin: boolean;
  };
  dailyTargets: {
    cal: number;
    pro: number;
    carbs: number;
    fats: number;
  };
  dietaryPreferences: string[];
}

export interface AppState {
  user: User | null;
  checkInStatus: DailyCheckIn | null;
  dailyMacros: {
    consumed: { cal: number; pro: number; carbs: number; fats: number };
    target: { cal: number; pro: number; carbs: number; fats: number };
  };
  savedRecipes: Recipe[];
  toleranceLogs: ToleranceLog[];
  mealPlan: MealPlanDay[];
  shoppingList: string[];
}

