/**
 * Zod schema for the CreateRecipe / EditRecipe form.
 *
 * Single source of truth for:
 *   - Field-level validation (title required, min 1 ingredient, etc.)
 *   - TypeScript types via `z.infer<>`
 *   - Default initial values for a new recipe form
 *   - Adapter to hydrate the form from an existing `Recipe` (for editing)
 *
 * Intentionally has NO React imports. Import this in both the form hook
 * (PR D) and unit tests (PR A) without any client-side overhead.
 *
 * Sprint 3, PR A — ROADMAP-2026.
 */
import { z } from 'zod';
import { DIFFICULTIES } from '../../../types/taxonomy';
import { MEAL_SLOTS } from '../../../types/recipe';
import type { Recipe } from '../../../types/recipe';

// ─── Sub-schemas ────────────────────────────────────────────────────────────

/**
 * Ingredient row inside the form. Mirrors `RecipeIngredient`.
 * The `ingredient` field carries the runtime-resolved `Ingredient` object for
 * display (macro tooltips, name lookup). It is accepted but not validated by Zod
 * — `z.unknown()` passthrough so the form state round-trips without data loss.
 */
export const RecipeIngredientFormSchema = z
  .object({
    id: z.string(),
    familyId: z.string().optional(),
    variantId: z.string().optional(),
    /** @deprecated Legacy id — still accepted for hydration of pre-migration data. */
    ingredientId: z.string().optional(),
    amount: z.number().min(0, 'Amount must be non-negative'),
    unit: z.string().min(1, 'Unit is required'),
    /** Display name (denormalized for quick render without resolver). */
    name: z.string().optional(),
    nameEn: z.string().optional(),
    brandName: z.string().optional(),
    /**
     * Runtime-resolved Ingredient object — present in form state for macro
     * display, stripped when persisting. Typed `unknown` so Zod doesn't validate
     * the internal Ingredient shape.
     */
    ingredient: z.unknown().optional(),
  })
  .refine(v => Boolean(v.familyId || v.ingredientId), {
    message: 'RecipeIngredient requires familyId or legacy ingredientId',
  });

export type RecipeIngredientFormValues = z.infer<typeof RecipeIngredientFormSchema>;

/** Instruction step inside the form. */
export const RecipeStepFormSchema = z.object({
  text: z.string(),
  photoUrl: z.string().optional(),
  timerMinutes: z.number().positive().optional(),
  /** R5: ingredient IDs highlighted in CookMode for this step. */
  ingredientIds: z.array(z.string()).optional(),
});

export type RecipeStepFormValues = z.infer<typeof RecipeStepFormSchema>;

// ─── Main schema ─────────────────────────────────────────────────────────────

export const RecipeFormSchema = z.object({
  // ── Basic info ─────────────────────────────────────────
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().default(''),
  prepTime: z.number().min(0, 'Prep time must be non-negative').default(0),
  cookTime: z.number().min(0, 'Cook time must be non-negative').default(0),
  /** Canonical EN difficulty — replaces the legacy ES-literal `Recipe.difficulty`. */
  difficulty: z.enum(DIFFICULTIES).default('medium'),
  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(1, 'At least 1 serving required')
    .default(4),
  /** Optional blog / source link. Empty string is allowed. */
  sourceUrl: z.string().default(''),
  /** Optional video URL (YouTube, TikTok, Instagram…). Empty string is allowed. */
  videoUrl: z.string().default(''),

  // ── Media ──────────────────────────────────────────────
  /** Base64 data URLs or Supabase Storage URLs. */
  photos: z.array(z.string()).default([]),
  /** Meal slots this recipe is suitable for. Empty = versatile. */
  suitableFor: z.array(z.enum(MEAL_SLOTS)).default([]),

  // ── Ingredients ────────────────────────────────────────
  recipeIngredients: z
    .array(RecipeIngredientFormSchema)
    .min(1, { message: 'At least one ingredient is required' }),

  // ── Instructions ───────────────────────────────────────
  steps: z
    .array(RecipeStepFormSchema)
    .refine(
      steps => steps.some(s => s.text.trim().length > 0),
      { message: 'At least one step with text is required' },
    ),

  // ── Meta ───────────────────────────────────────────────
  publishAsVerified: z.boolean().default(false),
});

export type RecipeFormValues = z.infer<typeof RecipeFormSchema>;

// ─── Initial values (empty form) ─────────────────────────────────────────────

/**
 * Initial state when opening the CreateRecipe form.
 * Not validated (user hasn't filled anything yet).
 * Use as `useForm({ defaultValues: RECIPE_FORM_INITIAL_VALUES })`.
 */
export const RECIPE_FORM_INITIAL_VALUES = {
  title: '',
  description: '',
  prepTime: 0,
  cookTime: 0,
  difficulty: 'medium',
  servings: 4,
  sourceUrl: '',
  videoUrl: '',
  photos: [],
  suitableFor: [],
  recipeIngredients: [],
  steps: [{ text: '' }],
  publishAsVerified: false,
} as const satisfies Omit<RecipeFormValues, 'recipeIngredients'> & {
  recipeIngredients: RecipeIngredientFormValues[];
};

// ─── Edit adapter ─────────────────────────────────────────────────────────────

/** Maps the ES-literal difficulty stored on `Recipe` to the canonical enum. */
const DIFFICULTY_COERCE: Record<string, 'easy' | 'medium' | 'hard'> = {
  fácil: 'easy',
  facil: 'easy',
  easy: 'easy',
  medio: 'medium',
  medium: 'medium',
  difícil: 'hard',
  dificil: 'hard',
  hard: 'hard',
};

function parseTimeField(value: string | number | undefined): number {
  if (typeof value === 'number') return Math.max(0, value);
  if (!value) return 0;
  // Matches "30M", "30 min", "1h 30min", "90"
  const hourMatch = value.match(/(\d+)\s*h/i);
  const minMatch = value.match(/(\d+)\s*m/i);
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  if (!hourMatch && !minMatch) {
    const plain = parseInt(value, 10);
    return isNaN(plain) ? 0 : Math.max(0, plain);
  }
  return hours * 60 + minutes;
}

/**
 * Hydrate a `RecipeFormValues` from an existing `Recipe` for editing.
 * Handles legacy ES-literal difficulty, string time fields, and missing steps.
 */
export function recipeToFormValues(recipe: Recipe): RecipeFormValues {
  const rawDifficulty = (recipe.difficulty ?? '').toLowerCase().trim();
  const difficulty: 'easy' | 'medium' | 'hard' =
    DIFFICULTY_COERCE[rawDifficulty] ?? 'medium';

  const steps: RecipeStepFormValues[] = recipe.steps?.length
    ? recipe.steps.map(s => ({
        text: s.text ?? '',
        photoUrl: s.photoUrl,
        timerMinutes: s.timerMinutes,
        ingredientIds: s.ingredientIds,
      }))
    : recipe.instructions?.map(text => ({ text })) ?? [{ text: '' }];

  const recipeIngredients: RecipeIngredientFormValues[] =
    (recipe.recipeIngredients ?? []).map(ri => ({
      id: ri.id,
      familyId: ri.familyId,
      variantId: ri.variantId,
      ingredientId: ri.ingredientId,
      amount: ri.amount,
      unit: ri.unit,
      // Preserve runtime ingredient object so the form can display macro info
      // without an additional resolver pass. Stripped on final submit.
      ...(ri.ingredient != null ? { ingredient: ri.ingredient } : {}),
    }));

  return {
    title: recipe.title ?? '',
    description: recipe.description ?? '',
    prepTime: parseTimeField(recipe.prepTime),
    cookTime: parseTimeField(recipe.cookTime),
    difficulty,
    servings: recipe.servings ?? 4,
    sourceUrl: recipe.sourceUrl ?? '',
    videoUrl: recipe.videoUrl ?? '',
    photos: recipe.photos ?? [],
    suitableFor: recipe.suitableFor ?? [],
    recipeIngredients,
    steps,
    publishAsVerified: recipe.verified === 'creator',
  };
}
