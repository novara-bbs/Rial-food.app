/**
 * Tests for Zod schema helpers and individual schemas.
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  safeParse,
  safeParseArray,
  MacrosSchema,
  UserProfileSchema,
  DailyMacrosSchema,
  RecipeSchema,
  ShoppingItemSchema,
  DailyCheckInSchema,
} from './schemas';

// ─── safeParse ────────────────────────────────────────────────────────────────

describe('safeParse', () => {
  const NumSchema = z.object({ value: z.number() });

  it('returns parsed data on success', () => {
    const result = safeParse(NumSchema, { value: 42 }, { value: 0 });
    expect(result).toEqual({ value: 42 });
  });

  it('returns fallback on invalid data', () => {
    const result = safeParse(NumSchema, { value: 'bad' }, { value: -1 });
    expect(result).toEqual({ value: -1 });
  });

  it('returns fallback on null', () => {
    const result = safeParse(NumSchema, null, { value: 0 });
    expect(result).toEqual({ value: 0 });
  });

  it('returns fallback on undefined', () => {
    const result = safeParse(NumSchema, undefined, { value: 0 });
    expect(result).toEqual({ value: 0 });
  });

  it('applies defaults from schema', () => {
    const WithDefault = z.object({ name: z.string().default('anon') });
    const result = safeParse(WithDefault, {}, { name: 'fallback' });
    expect(result.name).toBe('anon');
  });
});

// ─── safeParseArray ──────────────────────────────────────────────────────────

describe('safeParseArray', () => {
  const StrSchema = z.object({ label: z.string() });

  it('parses a valid array', () => {
    const result = safeParseArray(StrSchema, [{ label: 'a' }, { label: 'b' }]);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('a');
  });

  it('filters out invalid items', () => {
    const input = [{ label: 'ok' }, { label: 42 }, null, { label: 'also-ok' }];
    const result = safeParseArray(StrSchema, input);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.label)).toEqual(['ok', 'also-ok']);
  });

  it('returns fallback for non-array input', () => {
    const result = safeParseArray(StrSchema, 'not-an-array', []);
    expect(result).toEqual([]);
  });

  it('returns empty array by default for non-array input', () => {
    const result = safeParseArray(StrSchema, null);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    const result = safeParseArray(StrSchema, []);
    expect(result).toHaveLength(0);
  });
});

// ─── MacrosSchema ─────────────────────────────────────────────────────────────

describe('MacrosSchema', () => {
  const validMacros = { calories: 500, protein: 30, carbs: 60, fats: 15 };

  it('parses valid macros', () => {
    const result = MacrosSchema.safeParse(validMacros);
    expect(result.success).toBe(true);
  });

  it('accepts optional fiber and sugar', () => {
    const result = MacrosSchema.safeParse({ ...validMacros, fiber: 5, sugar: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fiber).toBe(5);
      expect(result.data.sugar).toBe(10);
    }
  });

  it('rejects missing required fields', () => {
    const result = MacrosSchema.safeParse({ calories: 500 });
    expect(result.success).toBe(false);
  });

  it('rejects string values', () => {
    const result = MacrosSchema.safeParse({ ...validMacros, calories: 'lots' });
    expect(result.success).toBe(false);
  });
});

// ─── UserProfileSchema ────────────────────────────────────────────────────────

describe('UserProfileSchema', () => {
  it('parses valid profile', () => {
    const result = UserProfileSchema.safeParse({
      name: 'Ana',
      age: 28,
      weight: 65,
      height: 168,
      goal: 'lose',
      activity: 'moderate',
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults for optional arrays', () => {
    const result = UserProfileSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dietaryPreferences).toEqual([]);
      expect(result.data.foodDislikes).toEqual([]);
      expect(result.data.intolerances).toEqual([]);
      expect(result.data.name).toBe('');
      expect(result.data.unitSystem).toBe('metric');
    }
  });

  it('rejects invalid unitSystem', () => {
    const result = UserProfileSchema.safeParse({ unitSystem: 'furlongs' });
    expect(result.success).toBe(false);
  });

  it('accepts imperial unitSystem', () => {
    const result = UserProfileSchema.safeParse({ unitSystem: 'imperial' });
    expect(result.success).toBe(true);
  });

  it('validates family member structure', () => {
    const result = UserProfileSchema.safeParse({
      family: [{ id: '1', name: 'Bob', age: 10 }],
    });
    expect(result.success).toBe(true);
  });
});

// ─── DailyMacrosSchema ────────────────────────────────────────────────────────

describe('DailyMacrosSchema', () => {
  const valid = {
    consumed: { cal: 1200, pro: 80, carbs: 150, fats: 40 },
    target: { cal: 2000, pro: 150, carbs: 200, fats: 65 },
  };

  it('parses valid daily macros', () => {
    const result = DailyMacrosSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects missing consumed', () => {
    const result = DailyMacrosSchema.safeParse({ target: valid.target });
    expect(result.success).toBe(false);
  });

  it('rejects partial target', () => {
    const result = DailyMacrosSchema.safeParse({
      consumed: valid.consumed,
      target: { cal: 2000 },
    });
    expect(result.success).toBe(false);
  });
});

// ─── RecipeSchema ─────────────────────────────────────────────────────────────

describe('RecipeSchema', () => {
  const validRecipe = {
    id: 'r1',
    title: 'Ensalada César',
    description: 'Clásica ensalada',
  };

  it('parses a minimal valid recipe', () => {
    const result = RecipeSchema.safeParse(validRecipe);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Ensalada César');
    }
  });

  it('applies defaults for tags and description', () => {
    const result = RecipeSchema.safeParse({ id: 1, title: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.description).toBe('');
    }
  });

  it('accepts numeric id', () => {
    const result = RecipeSchema.safeParse({ id: 42, title: 'Test' });
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = RecipeSchema.safeParse({ id: '1' });
    expect(result.success).toBe(false);
  });

  it('passes through extra fields (seed data compat)', () => {
    const result = RecipeSchema.safeParse({ ...validRecipe, extraField: true, customField: 'hello' });
    expect(result.success).toBe(true);
  });

  it('parses recipe steps', () => {
    const result = RecipeSchema.safeParse({
      ...validRecipe,
      steps: [{ text: 'Mezclar todo', timerMinutes: 5 }],
    });
    expect(result.success).toBe(true);
  });
});

// ─── ShoppingItemSchema ───────────────────────────────────────────────────────

describe('ShoppingItemSchema', () => {
  const validItem = { id: 1, name: 'Espinacas', category: 'Verduras y Vegetales', checked: false };

  it('parses a valid shopping item', () => {
    const result = ShoppingItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it('applies default checked=false', () => {
    const result = ShoppingItemSchema.safeParse({ id: 2, name: 'Leche', category: 'Lácteos y Huevos' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.checked).toBe(false);
  });

  it('accepts quantity as string or number', () => {
    expect(ShoppingItemSchema.safeParse({ ...validItem, quantity: '500g' }).success).toBe(true);
    expect(ShoppingItemSchema.safeParse({ ...validItem, quantity: 2 }).success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = ShoppingItemSchema.safeParse({ id: 1, category: 'Other', checked: false });
    expect(result.success).toBe(false);
  });
});

// ─── DailyCheckInSchema ───────────────────────────────────────────────────────

describe('DailyCheckInSchema', () => {
  const validCheckIn = {
    id: 'ci-1',
    userId: 'user-1',
    date: '2026-04-12',
    status: 'Optimal' as const,
    sleep: 8,
    stress: 2,
    symptoms: [],
  };

  it('parses a valid check-in', () => {
    const result = DailyCheckInSchema.safeParse(validCheckIn);
    expect(result.success).toBe(true);
  });

  it('accepts all valid statuses', () => {
    const statuses = ['Optimal', 'Stable', 'Sluggish', 'Recovering'] as const;
    for (const status of statuses) {
      const result = DailyCheckInSchema.safeParse({ ...validCheckIn, status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = DailyCheckInSchema.safeParse({ ...validCheckIn, status: 'Unknown' });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric sleep', () => {
    const result = DailyCheckInSchema.safeParse({ ...validCheckIn, sleep: 'eight' });
    expect(result.success).toBe(false);
  });
});
