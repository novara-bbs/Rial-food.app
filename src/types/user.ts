import type { Recipe } from './recipe';
import type { ToleranceLog, DailyCheckIn } from './wellness';
import type { MealPlanDay } from './planner';
import type { Allergen } from './food';
import type { SocialLinks } from './social';
import type { Sex } from '../features/food/utils/nutrition';
export type { Sex };

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

/** A family member for portion scaling and family-mode meal planning. */
export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  goal: string;
  activityLevel?: string;
}

/**
 * The user's persisted profile — onboarding inputs + later edits.
 * Single source of truth for goal/activity/biometrics; consumed by
 * `nutrition.ts` for TDEE calculation and by every screen that needs
 * personalization.
 */
export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  sex: Sex;
  goal: string;
  activity: string;
  trains: boolean;
  dietaryPreferences: string[];
  /** 'metric' (g/ml) or 'imperial' (oz/fl oz). Default: metric */
  unitSystem?: 'metric' | 'imperial';
  /**
   * Trinario food preferences — R8.3.
   * Record<ingredientId, 'like' | 'dislike' | null>
   * null = neutral (removed from map in practice).
   * Replaces `foodDislikes` as the source of truth; `foodDislikes` is kept
   * as a derived getter in profileSlices for backward-compat with utils.
   */
  foodPreferences?: Record<string, 'like' | 'dislike'>;
  /** @deprecated Use foodPreferences. Kept for migration compatibility. */
  foodDislikes?: string[];
  /** Declared food intolerances/allergies */
  intolerances?: Allergen[];
  /** Short bio for creator profile */
  bio?: string;
  /** Social media links for creator profile */
  socialLinks?: SocialLinks;
  /** Target weight in kg — for goal tracking */
  targetWeight?: number;
  /** Family members for meal scaling */
  family?: FamilyMember[];
  /**
   * Dashboard display mode.
   * @deprecated Sprint E [1.5.218] — superseded by `UserPreferences.sectionTiers`
   * which supports per-section tiers + per-widget overrides. Kept on the type
   * for one release so the auto-migration in `usePreferencesState` can read it.
   * Do NOT add new reads — use `usePreferences()` instead.
   */
  mode?: 'simple' | 'advanced';
  /** Avatar URL */
  avatar?: string;
  /** Free-form private notes (allergies, supplements, medication). Max 500 chars. R8.4. */
  personalNotes?: string;
  /** Creator verification flag — set by admin. Enables "Publish as verified recipe" checkbox in CreateRecipe. R7.3. */
  isVerifiedCreator?: boolean;
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

