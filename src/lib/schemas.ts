/**
 * Zod schemas for runtime validation of persisted and API data.
 * Used to validate localStorage hydration and external API responses.
 */
import { z } from 'zod';
import { logger } from './logger';

// ─── Macros ────────────────────────────────────────────
export const MacrosSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  saturatedFat: z.number().optional(),
  transFat: z.number().optional(),
});

// ─── User Profile (localStorage shape) ─────────────────
export const UserProfileSchema = z.object({
  name: z.string().default(''),
  age: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  gender: z.string().optional(),
  goal: z.string().optional(),
  activity: z.string().optional(),
  trains: z.boolean().optional(),
  dietaryPreferences: z.array(z.string()).default([]),
  unitSystem: z.enum(['metric', 'imperial']).default('metric'),
  foodDislikes: z.array(z.string()).default([]),
  intolerances: z.array(z.string()).default([]),
  bio: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  targetWeight: z.number().optional(),
  family: z.array(z.object({
    id: z.string(),
    name: z.string(),
    age: z.number().optional(),
    restrictions: z.array(z.string()).optional(),
  })).optional(),
  mode: z.string().optional(),
  avatar: z.string().optional(),
});

// ─── Daily Macros ──────────────────────────────────────
export const DailyMacrosSchema = z.object({
  consumed: z.object({ cal: z.number(), pro: z.number(), carbs: z.number(), fats: z.number() }),
  target: z.object({ cal: z.number(), pro: z.number(), carbs: z.number(), fats: z.number() }),
});

// ─── Recipe (persisted) ────────────────────────────────
export const RecipeSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  description: z.string().default(''),
  image: z.string().default(''),
  macros: MacrosSchema.optional(),
  tags: z.array(z.string()).default([]),
  prepTime: z.union([z.string(), z.number()]).default('0'),
  cookTime: z.union([z.string(), z.number()]).default('0'),
  difficulty: z.string().default('Fácil'),
  servings: z.number().optional(),
  publishedBy: z.string().optional(),
  // Canonical slot vocabulary (multi-valued, post-Q19 meal-taxonomy).
  suitableFor: z.array(z.enum(['breakfast', 'lunch', 'dinner', 'snack'])).optional(),
  // Legacy single-valued slot — retained for hydration of pre-Q19 user data.
  // Consumers should go through `getRecipeSlots()` to normalise to MealSlot[].
  mealType: z.string().optional(),
  tag: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  // Dual-shape during food-family migration: the new canonical form carries
  // `familyId` (+ optional `variantId`); pre-migration payloads only carry
  // `ingredientId`. We accept either — at least one must be present, enforced
  // by a `refine` predicate so silent empty entries still surface in dev.
  recipeIngredients: z.array(z.object({
    id: z.string(),
    familyId: z.string().optional(),
    variantId: z.string().optional(),
    ingredientId: z.string().optional(),
    amount: z.number(),
    unit: z.string(),
    ingredient: z.unknown().optional(),
  }).refine(
    v => Boolean(v.familyId || v.ingredientId),
    { message: 'RecipeIngredient requires familyId or legacy ingredientId' },
  )).optional(),
  steps: z.array(z.object({
    text: z.string(),
    photoUrl: z.string().optional(),
    timerMinutes: z.number().optional(),
  })).optional(),
  instructions: z.array(z.string()).optional(),
}).passthrough(); // allow extra fields from seed data

// ─── Shopping Item ─────────────────────────────────────
export const ShoppingItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  checked: z.boolean().default(false),
  quantity: z.union([z.string(), z.number()]).optional(),
  unit: z.string().optional(),
  source: z.array(z.string()).optional(),
});

// ─── DailyCheckIn ──────────────────────────────────────
export const DailyCheckInSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  status: z.enum(['Optimal', 'Stable', 'Sluggish', 'Recovering']),
  sleep: z.number(),
  stress: z.number(),
  symptoms: z.array(z.string()),
}).passthrough();

// ─── Safe parse helper ─────────────────────────────────
/**
 * Safely parse data against a zod schema.
 * Returns parsed data on success, or fallback on failure.
 * Logs validation errors to console in development.
 */
export function safeParse<T>(schema: z.ZodType<T>, data: unknown, fallback: T): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const meta = (import.meta as unknown as { env?: { DEV?: boolean } });
  if (meta.env?.DEV) {
    logger.warn('Schema validation failed', { error: result.error });
  }
  return fallback;
}

/**
 * Validate an array against a schema, filtering out invalid items.
 */
export function safeParseArray<T>(schema: z.ZodType<T>, data: unknown, fallback: T[] = []): T[] {
  if (!Array.isArray(data)) return fallback;
  return data
    .map(item => schema.safeParse(item))
    .filter((r): r is { success: true; data: T } => r.success)
    .map(r => r.data);
}
