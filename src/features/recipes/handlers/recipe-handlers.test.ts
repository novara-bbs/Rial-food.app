/**
 * Tests for recipe handler factories.
 * Covers: createHandleSaveRecipe, createHandleAddToPlan,
 *         createHandleDeleteRecipe, createHandleDuplicateRecipe, createHandleCreateRecipeSubmit
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createHandleSaveRecipe,
  createHandleAddToPlan,
  createHandleDeleteRecipe,
  createHandleDuplicateRecipe,
  createHandleCreateRecipeSubmit,
} from './recipe-handlers';
import type { Recipe } from '../../../types/recipe';
import type { Translations } from '../../../i18n';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** Minimal but type-complete Recipe test factory. */
const makeRecipe = (id: string = 'r1', extra: Record<string, unknown> = {}): Recipe => ({
  id,
  title: `Recipe ${id}`,
  description: '',
  image: '',
  prepTime: '10M',
  cookTime: '20M',
  difficulty: 'Fácil',
  macros: { calories: 400, protein: 30, carbs: 45, fats: 10, saturatedFat: 2, transFat: 0, sugar: 5 },
  recipeIngredients: [
    { id: 'ri-1', ingredient: { name: 'Pollo', category: 'Proteína', baseUnit: 'g' } as any, amount: 200, unit: 'g' },
  ],
  tags: [],
  tag: 'RECETA',
  publishedBy: 'user-abc',
  ...extra,
} as Recipe);

/** Cast an incomplete translation object to Translations for test stubs. */
const t = (partial: Record<string, unknown> = {}) => partial as unknown as Translations;

// ─── createHandleSaveRecipe ───────────────────────────────────────────────────

describe('createHandleSaveRecipe', () => {
  let setSavedRecipes: ReturnType<typeof vi.fn>;
  let handler: ReturnType<typeof createHandleSaveRecipe>;

  beforeEach(() => {
    setSavedRecipes = vi.fn();
    handler = createHandleSaveRecipe({ setSavedRecipes: setSavedRecipes as any, t: t() });
  });

  it('adds recipe when not already saved', () => {
    handler(makeRecipe('r1'));
    const updater = setSavedRecipes.mock.calls[0][0];
    const result = updater([]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
    expect(result[0].tag).toBe('GUARDADO');
  });

  it('removes recipe when already saved (toggle)', () => {
    handler(makeRecipe('r1'));
    const updater = setSavedRecipes.mock.calls[0][0];
    const existing = [{ ...makeRecipe('r1'), tag: 'GUARDADO' }];
    const result = updater(existing);
    expect(result).toHaveLength(0);
  });

  it('preserves unrelated saved recipes', () => {
    handler(makeRecipe('r2'));
    const updater = setSavedRecipes.mock.calls[0][0];
    const existing = [{ ...makeRecipe('r1'), tag: 'GUARDADO' }];
    const result = updater(existing);
    expect(result).toHaveLength(2);
    expect(result.some((r: any) => r.id === 'r1')).toBe(true);
    expect(result.some((r: any) => r.id === 'r2')).toBe(true);
  });
});

// ─── createHandleAddToPlan ────────────────────────────────────────────────────

describe('createHandleAddToPlan', () => {
  let setMealPlan: ReturnType<typeof vi.fn>;
  let setShoppingList: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setMealPlan = vi.fn();
    setShoppingList = vi.fn();
  });

  const makeHandler = () => createHandleAddToPlan({
    setSavedRecipes: vi.fn() as any,
    setMealPlan: setMealPlan as any,
    setShoppingList: setShoppingList as any,
    navigateTo: vi.fn(),
    t: t(),
  });

  it('adds recipe entry to the correct day index', () => {
    makeHandler()(makeRecipe(), 3);
    const updater = setMealPlan.mock.calls[0][0];
    const prev = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    const result = updater(prev);
    expect(result[3]).toHaveLength(1);
    expect(result[3][0].title).toBe('Recipe r1');
    expect(result[3][0].tag).toBe('PLANEADO');
    expect(result[3][0].macros?.calories).toBe(400);
  });

  it('does not modify other days', () => {
    makeHandler()(makeRecipe(), 2);
    const updater = setMealPlan.mock.calls[0][0];
    const prev = { 0: ['x'], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    const result = updater(prev);
    expect(result[0]).toHaveLength(1); // day 0 untouched
    expect(result[2]).toHaveLength(1); // day 2 got new item
  });

  it('adds recipe ingredients to shopping list', () => {
    makeHandler()(makeRecipe(), 0);
    const updater = setShoppingList.mock.calls[0][0];
    const result = updater([]);
    expect(result.length).toBeGreaterThan(0);
    const names = result.map((r: any) => r.name).join(' ');
    expect(names.toLowerCase()).toContain('pollo');
    expect(result[0].checked).toBe(false);
  });

  // ─── Wave 0.11 — mealType-aware slot mapping ─────────────────────────────

  it('maps breakfast recipes to DESAYUNO at 08:00', () => {
    makeHandler()(makeRecipe('r1', { mealType: 'breakfast' }), 0);
    const updater = setMealPlan.mock.calls[0][0];
    const result = updater({ 0: [] });
    expect(result[0][0].time).toBe('08:00');
    expect(result[0][0].type).toBe('DESAYUNO');
  });

  it('maps dinner recipes to CENA at 20:00', () => {
    makeHandler()(makeRecipe('r1', { mealType: 'dinner' }), 0);
    const updater = setMealPlan.mock.calls[0][0];
    const result = updater({ 0: [] });
    expect(result[0][0].time).toBe('20:00');
    expect(result[0][0].type).toBe('CENA');
  });

  it('maps snack recipes to MERIENDA at 17:00', () => {
    makeHandler()(makeRecipe('r1', { mealType: 'snack' }), 0);
    const updater = setMealPlan.mock.calls[0][0];
    const result = updater({ 0: [] });
    expect(result[0][0].time).toBe('17:00');
    expect(result[0][0].type).toBe('MERIENDA');
  });

  it('defaults to COMIDA at 13:00 when mealType is missing', () => {
    makeHandler()(makeRecipe('r1'), 0);
    const updater = setMealPlan.mock.calls[0][0];
    const result = updater({ 0: [] });
    expect(result[0][0].time).toBe('13:00');
    expect(result[0][0].type).toBe('COMIDA');
  });

  it('accepts ES mealType values (desayuno, cena, merienda)', () => {
    makeHandler()(makeRecipe('r1', { mealType: 'desayuno' }), 0);
    const updater = setMealPlan.mock.calls[0][0];
    const result = updater({ 0: [] });
    expect(result[0][0].type).toBe('DESAYUNO');
  });

  it('uses i18n plan labels when t is provided (EN locale)', () => {
    const handler = createHandleAddToPlan({
      setSavedRecipes: vi.fn() as any,
      setMealPlan: setMealPlan as any,
      setShoppingList: setShoppingList as any,
      navigateTo: vi.fn(),
      t: t({ plan: { mealTypeBreakfast: 'BREAKFAST', mealTypeLunch: 'LUNCH', mealTypeDinner: 'DINNER', mealTypeSnack: 'SNACK' } }),
    });
    handler(makeRecipe('r1', { mealType: 'dinner' }), 0);
    const updater = setMealPlan.mock.calls[0][0];
    const result = updater({ 0: [] });
    expect(result[0][0].type).toBe('DINNER');
  });

  // ─── Wave 0.11 — aggregateShoppingItems dedup ────────────────────────────

  it('aggregates duplicate ingredients instead of appending strings', () => {
    const existing = [
      { id: 1, name: 'Pollo', category: 'Proteína', checked: false, quantity: 100, unit: 'g', source: ['Prev'] },
    ];
    makeHandler()(makeRecipe(), 0);
    const updater = setShoppingList.mock.calls[0][0];
    const result = updater(existing);
    // Should dedup + sum the 100g existing + 200g new → 300g total
    const pollo = result.find((r: any) => r.name === 'Pollo');
    expect(pollo).toBeDefined();
    expect(pollo.quantity).toBe(300);
    // Only one entry for Pollo (not two)
    expect(result.filter((r: any) => r.name === 'Pollo')).toHaveLength(1);
  });

  it('produces GroceryItem shape (object), never raw strings', () => {
    makeHandler()(makeRecipe(), 0);
    const updater = setShoppingList.mock.calls[0][0];
    const result = updater([]);
    result.forEach((item: any) => {
      expect(typeof item).toBe('object');
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('checked');
    });
  });
});

// ─── createHandleDeleteRecipe ─────────────────────────────────────────────────

describe('createHandleDeleteRecipe', () => {
  it('removes recipe by id from saved list', () => {
    const setSavedRecipes = vi.fn();
    const navigateTo = vi.fn();
    const handler = createHandleDeleteRecipe({ setSavedRecipes, navigateTo, t: t() });

    handler('r1');
    const updater = setSavedRecipes.mock.calls[0][0];
    const existing = [makeRecipe('r1'), makeRecipe('r2')];
    const result = updater(existing);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r2');
  });

  it('navigates to cocina after deletion', () => {
    const navigateTo = vi.fn();
    const handler = createHandleDeleteRecipe({ setSavedRecipes: vi.fn(), navigateTo, t: t() });
    handler('r1');
    expect(navigateTo).toHaveBeenCalledWith('cocina');
  });

  it('handles deleting a non-existent id gracefully', () => {
    const setSavedRecipes = vi.fn();
    const handler = createHandleDeleteRecipe({ setSavedRecipes, navigateTo: vi.fn(), t: t() });
    handler('non-existent');
    const updater = setSavedRecipes.mock.calls[0][0];
    const existing = [makeRecipe('r1')];
    const result = updater(existing);
    expect(result).toHaveLength(1);
  });
});

// ─── createHandleDuplicateRecipe ──────────────────────────────────────────────

describe('createHandleDuplicateRecipe', () => {
  it('creates a new recipe with a different id', () => {
    const setSavedRecipes = vi.fn();
    const handler = createHandleDuplicateRecipe({ setSavedRecipes, navigateTo: vi.fn(), t: t() });

    handler(makeRecipe('r1'));
    const updater = setSavedRecipes.mock.calls[0][0];
    const result = updater([makeRecipe('r1')]);
    const newRecipe = result[0]; // prepended
    expect(newRecipe.id).not.toBe('r1');
    expect(newRecipe.publishedBy).toBe('self');
    expect(newRecipe.tag).toBe('MI RECETA');
  });

  it('sets forkedFrom to point to the original recipe', () => {
    const setSavedRecipes = vi.fn();
    const handler = createHandleDuplicateRecipe({ setSavedRecipes, navigateTo: vi.fn(), t: t() });
    const original = makeRecipe('r1');
    handler(original);
    const updater = setSavedRecipes.mock.calls[0][0];
    const result = updater([original]);
    const duplicated = result.find((r: any) => r.id !== 'r1');
    expect(duplicated?.forkedFrom?.recipeId).toBe('r1');
  });

  it('uses forkedFrom.recipeId from original when recipe is already a fork', () => {
    const setSavedRecipes = vi.fn();
    const handler = createHandleDuplicateRecipe({ setSavedRecipes, navigateTo: vi.fn(), t: t() });
    const originalId = 'original-123';
    const forkedRecipe = makeRecipe('r2', {
      forkedFrom: { recipeId: originalId, creatorId: 'other', creatorName: 'Other', title: 'Orig' },
    });
    handler(forkedRecipe);
    const updater = setSavedRecipes.mock.calls[0][0];
    const result = updater([forkedRecipe]);
    const reFork = result.find((r: any) => r.id !== 'r2');
    // Should trace back to the original, not the intermediate fork
    expect(reFork?.forkedFrom?.recipeId).toBe(originalId);
  });

  it('increments forkCount on the original recipe', () => {
    const setSavedRecipes = vi.fn();
    const handler = createHandleDuplicateRecipe({ setSavedRecipes, navigateTo: vi.fn(), t: t() });
    const original = { ...makeRecipe('r1'), forkCount: 2 };
    handler(original);
    const updater = setSavedRecipes.mock.calls[0][0];
    const result = updater([original]);
    const origInResult = result.find((r: any) => r.id === 'r1');
    expect(origInResult?.forkCount).toBe(3);
  });
});

// ─── createHandleCreateRecipeSubmit ──────────────────────────────────────────

describe('createHandleCreateRecipeSubmit', () => {
  it('creates new recipe with id=Date.now() when no id provided', () => {
    const setSavedRecipes = vi.fn();
    const navigateTo = vi.fn();
    const handler = createHandleCreateRecipeSubmit({ setSavedRecipes, navigateTo, t: t() });

    const newRecipe = { ...makeRecipe(), id: '' }; // empty id → treated as new
    handler(newRecipe as Recipe);
    const updater = setSavedRecipes.mock.calls[0][0];
    const result = updater([]);
    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('string'); // id is now String(Date.now())
    expect(result[0].publishedBy).toBe('self');
    expect(result[0].tag).toBe('MI RECETA');
  });

  it('updates existing recipe when id is present', () => {
    const setSavedRecipes = vi.fn();
    const navigateTo = vi.fn();
    const handler = createHandleCreateRecipeSubmit({ setSavedRecipes, navigateTo, t: t() });

    const updated = { ...makeRecipe('r1'), title: 'Updated Title' };
    handler(updated);
    const updater = setSavedRecipes.mock.calls[0][0];
    const existing = [makeRecipe('r1'), makeRecipe('r2')];
    const result = updater(existing);
    const r1 = result.find((r: any) => r.id === 'r1');
    expect(r1?.title).toBe('Updated Title');
    expect(result).toHaveLength(2);
  });

  it('navigates to cocina after submitting', () => {
    const navigateTo = vi.fn();
    const handler = createHandleCreateRecipeSubmit({ setSavedRecipes: vi.fn(), navigateTo, t: t() });
    handler(makeRecipe());
    expect(navigateTo).toHaveBeenCalledWith('cocina');
  });
});
