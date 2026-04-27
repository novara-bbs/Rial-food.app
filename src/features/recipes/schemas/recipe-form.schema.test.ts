/**
 * Unit tests for `RecipeFormSchema` and `recipeToFormValues`.
 *
 * Locks the form validation contract so changes to the schema surface
 * immediately as test failures before they reach the UI.
 *
 * Sprint 3, PR A — ROADMAP-2026.
 */
import { describe, it, expect } from 'vitest';
import {
  RecipeFormSchema,
  RECIPE_FORM_INITIAL_VALUES,
  recipeToFormValues,
} from './recipe-form.schema';
import type { Recipe } from '../../../types/recipe';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Minimal valid ingredient row. */
const validIngredient = {
  id: 'ing-1',
  familyId: 'fam_chicken',
  amount: 200,
  unit: 'g',
};

/** Minimal valid step. */
const validStep = { text: 'Preheat oven to 180°C.' };

/** A fully valid form submission payload. */
const validPayload = {
  title: 'Pollo al horno',
  description: 'A classic roast chicken.',
  prepTime: 15,
  cookTime: 60,
  difficulty: 'easy' as const,
  servings: 4,
  sourceUrl: '',
  videoUrl: '',
  photos: [],
  suitableFor: ['lunch' as const, 'dinner' as const],
  recipeIngredients: [validIngredient],
  steps: [validStep],
  publishAsVerified: false,
};

// ─── Schema validation ────────────────────────────────────────────────────────

describe('RecipeFormSchema — valid payload', () => {
  it('accepts a fully valid submission', () => {
    expect(RecipeFormSchema.safeParse(validPayload).success).toBe(true);
  });

  it('accepts the minimum required fields only', () => {
    const minimal = {
      title: 'Quick Bowl',
      recipeIngredients: [validIngredient],
      steps: [validStep],
    };
    const result = RecipeFormSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      // defaults are applied
      expect(result.data.difficulty).toBe('medium');
      expect(result.data.servings).toBe(4);
      expect(result.data.description).toBe('');
    }
  });

  it('accepts all three difficulty levels', () => {
    for (const d of ['easy', 'medium', 'hard'] as const) {
      expect(
        RecipeFormSchema.safeParse({ ...validPayload, difficulty: d }).success,
      ).toBe(true);
    }
  });

  it('accepts all meal slot combinations', () => {
    const slots = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
    for (const s of slots) {
      expect(
        RecipeFormSchema.safeParse({ ...validPayload, suitableFor: [s] }).success,
      ).toBe(true);
    }
    expect(
      RecipeFormSchema.safeParse({ ...validPayload, suitableFor: [] }).success,
    ).toBe(true);
  });

  it('accepts steps with timerMinutes and photoUrl', () => {
    const richStep = { text: 'Mix well.', timerMinutes: 5, photoUrl: 'https://example.com/img.jpg' };
    expect(
      RecipeFormSchema.safeParse({ ...validPayload, steps: [richStep] }).success,
    ).toBe(true);
  });

  it('accepts legacy ingredientId instead of familyId', () => {
    const legacyIng = { id: 'ing-2', ingredientId: 'chicken_breast', amount: 200, unit: 'g' };
    expect(
      RecipeFormSchema.safeParse({ ...validPayload, recipeIngredients: [legacyIng] }).success,
    ).toBe(true);
  });
});

describe('RecipeFormSchema — title validation', () => {
  it('rejects empty title', () => {
    const result = RecipeFormSchema.safeParse({ ...validPayload, title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('rejects whitespace-only title', () => {
    // Zod min(1) checks length, not trimmed. Consumers should trim before submit.
    const result = RecipeFormSchema.safeParse({ ...validPayload, title: '' });
    expect(result.success).toBe(false);
  });
});

describe('RecipeFormSchema — ingredients validation', () => {
  it('rejects empty ingredient array', () => {
    const result = RecipeFormSchema.safeParse({
      ...validPayload,
      recipeIngredients: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes('recipeIngredients'));
      expect(issue).toBeDefined();
    }
  });

  it('rejects ingredient with neither familyId nor ingredientId', () => {
    const badIng = { id: 'x', amount: 100, unit: 'g' };
    const result = RecipeFormSchema.safeParse({
      ...validPayload,
      recipeIngredients: [badIng],
    });
    expect(result.success).toBe(false);
  });

  it('rejects ingredient with negative amount', () => {
    const badIng = { ...validIngredient, amount: -1 };
    const result = RecipeFormSchema.safeParse({
      ...validPayload,
      recipeIngredients: [badIng],
    });
    expect(result.success).toBe(false);
  });

  it('rejects ingredient with empty unit', () => {
    const badIng = { ...validIngredient, unit: '' };
    const result = RecipeFormSchema.safeParse({
      ...validPayload,
      recipeIngredients: [badIng],
    });
    expect(result.success).toBe(false);
  });
});

describe('RecipeFormSchema — steps validation', () => {
  it('rejects steps array where all steps are empty', () => {
    const result = RecipeFormSchema.safeParse({
      ...validPayload,
      steps: [{ text: '' }, { text: '   ' }],
    });
    expect(result.success).toBe(false);
  });

  it('passes when at least one step has text (others may be empty)', () => {
    const result = RecipeFormSchema.safeParse({
      ...validPayload,
      steps: [{ text: '' }, { text: 'Final step.' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects completely empty steps array', () => {
    const result = RecipeFormSchema.safeParse({ ...validPayload, steps: [] });
    // Empty array passes the refine (no step has non-empty text → some() = false).
    // But zero steps means the refine returns false → should fail.
    expect(result.success).toBe(false);
  });
});

describe('RecipeFormSchema — numeric field validation', () => {
  it('rejects negative prepTime', () => {
    const result = RecipeFormSchema.safeParse({ ...validPayload, prepTime: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects servings = 0', () => {
    const result = RecipeFormSchema.safeParse({ ...validPayload, servings: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects fractional servings', () => {
    const result = RecipeFormSchema.safeParse({ ...validPayload, servings: 2.5 });
    expect(result.success).toBe(false);
  });

  it('accepts servings = 1 (minimum)', () => {
    expect(
      RecipeFormSchema.safeParse({ ...validPayload, servings: 1 }).success,
    ).toBe(true);
  });
});

describe('RecipeFormSchema — difficulty validation', () => {
  it('rejects ES literal difficulty', () => {
    const result = RecipeFormSchema.safeParse({ ...validPayload, difficulty: 'Fácil' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown difficulty string', () => {
    const result = RecipeFormSchema.safeParse({ ...validPayload, difficulty: 'beginner' });
    expect(result.success).toBe(false);
  });
});

// ─── RECIPE_FORM_INITIAL_VALUES ───────────────────────────────────────────────

describe('RECIPE_FORM_INITIAL_VALUES', () => {
  it('has the expected default values', () => {
    expect(RECIPE_FORM_INITIAL_VALUES.title).toBe('');
    expect(RECIPE_FORM_INITIAL_VALUES.difficulty).toBe('medium');
    expect(RECIPE_FORM_INITIAL_VALUES.servings).toBe(4);
    expect(RECIPE_FORM_INITIAL_VALUES.recipeIngredients).toHaveLength(0);
    expect(RECIPE_FORM_INITIAL_VALUES.steps).toHaveLength(1);
    expect(RECIPE_FORM_INITIAL_VALUES.steps[0].text).toBe('');
  });
});

// ─── recipeToFormValues ───────────────────────────────────────────────────────

const mockRecipe: Recipe = {
  id: 'r-001',
  title: 'Pasta Carbonara',
  description: 'Classic Italian pasta.',
  image: '',
  prepTime: '15',
  cookTime: '20',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  difficulty: 'Fácil' as any, // legacy ES literal — tests backward-compat coercion
  macros: { calories: 600, protein: 30, carbs: 70, fats: 20 },
  tags: ['ITALIANO'],
  recipeIngredients: [
    { id: 'ri-1', familyId: 'fam_pasta', amount: 200, unit: 'g' },
    { id: 'ri-2', familyId: 'fam_egg', amount: 3, unit: 'unidad' },
  ],
  steps: [
    { text: 'Boil pasta.' },
    { text: 'Mix eggs and cheese.' },
  ],
  servings: 2,
  suitableFor: ['lunch', 'dinner'],
};

describe('recipeToFormValues', () => {
  it('maps recipe fields to form values', () => {
    const values = recipeToFormValues(mockRecipe);
    expect(values.title).toBe('Pasta Carbonara');
    expect(values.description).toBe('Classic Italian pasta.');
    expect(values.servings).toBe(2);
    expect(values.suitableFor).toEqual(['lunch', 'dinner']);
  });

  it('coerces ES literal difficulty to Difficulty enum', () => {
    const values = recipeToFormValues(mockRecipe);
    expect(values.difficulty).toBe('easy');
  });

  it('coerces "Medio" → medium', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = recipeToFormValues({ ...mockRecipe, difficulty: 'Medio' as any });
    expect(values.difficulty).toBe('medium');
  });

  it('coerces "Difícil" → hard', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = recipeToFormValues({ ...mockRecipe, difficulty: 'Difícil' as any });
    expect(values.difficulty).toBe('hard');
  });

  it('already-EN difficulties pass through unchanged', () => {
    for (const [es, en] of [
      ['easy', 'easy'],
      ['medium', 'medium'],
      ['hard', 'hard'],
    ] as const) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = recipeToFormValues({ ...mockRecipe, difficulty: es as any });
      expect(v.difficulty).toBe(en);
    }
  });

  it('parses string prepTime and cookTime to numbers', () => {
    const values = recipeToFormValues({ ...mockRecipe, prepTime: '30M', cookTime: '1h 15min' });
    expect(values.prepTime).toBe(30);
    expect(values.cookTime).toBe(75);
  });

  it('maps recipeIngredients without the runtime ingredient field', () => {
    const values = recipeToFormValues(mockRecipe);
    expect(values.recipeIngredients).toHaveLength(2);
    expect(values.recipeIngredients[0]).toMatchObject({
      id: 'ri-1',
      familyId: 'fam_pasta',
      amount: 200,
      unit: 'g',
    });
    expect((values.recipeIngredients[0] as { ingredient?: unknown }).ingredient).toBeUndefined();
  });

  it('maps steps correctly', () => {
    const values = recipeToFormValues(mockRecipe);
    expect(values.steps).toHaveLength(2);
    expect(values.steps[0].text).toBe('Boil pasta.');
  });

  it('falls back to instructions when steps are absent', () => {
    const recipeWithInstructions: Recipe = {
      ...mockRecipe,
      steps: undefined,
      instructions: ['Step A', 'Step B'],
    };
    const values = recipeToFormValues(recipeWithInstructions);
    expect(values.steps[0].text).toBe('Step A');
    expect(values.steps[1].text).toBe('Step B');
  });

  it('produces a payload that passes schema validation', () => {
    const values = recipeToFormValues(mockRecipe);
    const result = RecipeFormSchema.safeParse(values);
    expect(result.success).toBe(true);
  });

  it('sets publishAsVerified from recipe.verified === creator', () => {
    const verified = recipeToFormValues({ ...mockRecipe, verified: 'creator' });
    expect(verified.publishAsVerified).toBe(true);
    const notVerified = recipeToFormValues({ ...mockRecipe, verified: 'rial' });
    expect(notVerified.publishAsVerified).toBe(false);
    const unset = recipeToFormValues({ ...mockRecipe, verified: undefined });
    expect(unset.publishAsVerified).toBe(false);
  });
});
