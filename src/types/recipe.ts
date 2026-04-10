import type { Macros, Micronutrients, RecipeIngredient } from './food';

export interface RecipeStep {
  text: string;
  photoUrl?: string;
  timerMinutes?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  photos?: string[]; // Additional gallery photos
  videoUrl?: string; // YouTube / TikTok embed URL
  sourceUrl?: string; // Original recipe source link
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
  ingredients?: string[]; // Legacy string ingredients
  recipeIngredients?: RecipeIngredient[];
  instructions?: string[]; // Legacy plain strings
  steps?: RecipeStep[]; // Rich steps with optional media/timer
}
