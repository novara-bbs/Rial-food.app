import type { Macros, Micronutrients, RecipeIngredient } from './food';

/**
 * Canonical meal slot vocabulary used across the app (recipes, planner,
 * logger, discovery filters). Single source of truth — do NOT re-declare.
 */
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_SLOTS: readonly MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export interface RecipeStep {
  text: string;
  photoUrl?: string;
  timerMinutes?: number;
}

export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'other';

/**
 * Parsed result of a recipe `videoUrl`. `canEmbed` is true only for platforms
 * we can render inline without cross-origin surprises (currently YouTube only).
 * For the rest, the VideoSection renders a poster + CTA that opens the source
 * app via Capacitor Browser (iOS Universal Links / Android App Links take
 * over when the TikTok / Instagram app is installed).
 */
export interface ParsedVideo {
  platform: VideoPlatform;
  embedUrl: string | null;
  watchUrl: string;
  videoId?: string;
  posterUrl?: string;
  canEmbed: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  photos?: string[];
  videoUrl?: string;
  sourceUrl?: string;
  sourceType?: 'youtube' | 'tiktok' | 'instagram' | 'blog' | 'original';
  publishedBy?: string;
  publishedByName?: string;
  servings?: number;
  prepTime: string;
  cookTime: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  macros: Macros;
  micros?: Micronutrients;
  supplements?: string[];
  tags: string[];
  ingredients?: string[];
  recipeIngredients?: RecipeIngredient[];
  instructions?: string[];
  steps?: RecipeStep[];
  forkedFrom?: {
    recipeId: string | number;
    creatorId: string;
    creatorName: string;
    title: string;
  };
  forkCount?: number;
  /**
   * Which meal slots this recipe fits well. Empty/undefined means "versatile"
   * (shows in every slot filter). Replaces the single-valued legacy `mealType`
   * — a recipe can now be marked suitable for e.g. both lunch and dinner.
   */
  suitableFor?: MealSlot[];
  /**
   * @deprecated Use `suitableFor` instead. Kept for localStorage hydration
   * of pre-Q19 user data; migrated on read via `getRecipeSlots()`.
   */
  mealType?: string;
  /**
   * Editorial tier marker (R2 plan v2). When set, the recipe gets the
   * verified-treatment branch in `RecipeDetail` (hero bleed, serif title,
   * sticky CTA) behind the `featureFlags.verifiedRecipePolish` gate.
   *
   * - `'rial'`  → curated by the RIAL nutrition team (default for seed heroes).
   * - `'creator'` → published by a user with `isVerifiedCreator: true` flag
   *                 (R7 sprint wires that surface; gate stays `false` until
   *                 R2.3 ships the consumer).
   * - `null` / `undefined` → user-saved or generic recipe (default tier).
   */
  verified?: 'rial' | 'creator' | null;
  /**
   * ISO timestamps of each time the user marked this recipe as cooked
   * (NYT Cooking pattern — R2 plan v2). Always append, never mutate.
   * Used by Cocina filter "Ya cocinadas" and by the badge "Cocinada N veces".
   * Undefined/empty means never cooked.
   */
  cookedAt?: string[];
}
