/**
 * Tests for meal handler factories.
 * Covers: createHandleLogMeal, createHandleLogMealNow (defensive), createHandleRepeatYesterday
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { createHandleLogMeal, createHandleLogMealNow, createHandleRepeatYesterday } from './meal-handlers';
import type { Translations } from '../../../i18n';
import type { DailyArchive } from '../../../hooks/useDailyReset';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeMeal = (overrides: Record<string, unknown> = {}) => ({
  id: 'm1',
  title: 'Pollo a la plancha',
  cal: 320, pro: 40, carbs: 5, fats: 8,
  macros: { calories: 320, protein: 40, carbs: 5, fats: 8 },
  grams: 200,
  mealSlot: 'lunch',
  portionDescription: '200g',
  recipeIngredients: [],
  ...overrides,
});

/** Cast an incomplete translation object to Translations for test stubs. */
const t = (partial: Record<string, unknown> = {}) => partial as unknown as Translations;

const partialT = t({
  mealToasts: {
    mealLogged: '¡Comida registrada!',
    addedToPlan: 'Añadido al plan',
    defaultMealName: 'Comida',
  },
});

const makeBaseDeps = (overrides: Record<string, unknown> = {}) => ({
  targetPlanDay: null as number | null,
  setMealPlan: vi.fn(),
  setShoppingList: vi.fn(),
  setTargetPlanDay: vi.fn(),
  setDailyMacros: vi.fn(),
  setDailyLog: vi.fn(),
  setFoodHistory: vi.fn(),
  navigateTo: vi.fn(),
  previousScreen: 'home',
  t: partialT,
  ...overrides,
});

/** Make a minimal DailyArchive for tests (required fields filled). */
const makeDailyArchive = (overrides: Partial<DailyArchive> = {}): DailyArchive => ({
  date: '2026-04-14',
  macros: { consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 }, target: { cal: 2000, pro: 150, carbs: 220, fats: 60 } },
  hydration: 0,
  movement: 0,
  mealCount: 0,
  dailyLog: [],
  ...overrides,
});

// ─── createHandleLogMeal — daily log path (targetPlanDay = null) ──────────────

describe('createHandleLogMeal — daily log path', () => {
  let deps: ReturnType<typeof makeBaseDeps>;
  let handler: ReturnType<typeof createHandleLogMeal>;

  beforeEach(() => {
    deps = makeBaseDeps({ targetPlanDay: null });
    handler = createHandleLogMeal(deps);
  });

  it('updates consumed macros in dailyMacros', () => {
    handler(makeMeal());
    expect(deps.setDailyMacros).toHaveBeenCalledOnce();

    const updater = (deps.setDailyMacros as any).mock.calls[0][0];
    const prev = { consumed: { cal: 100, pro: 10, carbs: 5, fats: 3 }, target: { cal: 2000, pro: 150, carbs: 220, fats: 60 } };
    const result = updater(prev);
    expect(result.consumed.cal).toBe(420);  // 100 + 320
    expect(result.consumed.pro).toBe(50);   // 10 + 40
    expect(result.consumed.carbs).toBe(10); // 5 + 5
    expect(result.consumed.fats).toBe(11);  // 3 + 8
  });

  it('appends entry to daily log with correct shape', () => {
    handler(makeMeal());
    expect(deps.setDailyLog).toHaveBeenCalledOnce();

    const updater = (deps.setDailyLog as any).mock.calls[0][0];
    const result = updater([]);
    expect(result).toHaveLength(1);
    const entry = result[0];
    expect(entry.title).toBe('Pollo a la plancha');
    expect(entry.macros.cal).toBe(320);
    expect(entry.macros.pro).toBe(40);
    expect(entry.mealSlot).toBe('lunch');
    expect(typeof entry.id).toBe('number');
  });

  it('navigates to previousScreen after logging', () => {
    handler(makeMeal());
    expect(deps.navigateTo).toHaveBeenCalledWith('home');
  });

  it('does not touch meal plan when targetPlanDay is null', () => {
    handler(makeMeal());
    expect(deps.setMealPlan).not.toHaveBeenCalled();
  });

  it('handles meal with macros nested under .macros (recipe format)', () => {
    const recipeMeal = {
      id: 'recipe-1', title: 'Ensalada César',
      macros: { calories: 250, protein: 12, carbs: 20, fats: 14 },
      recipeIngredients: [],
    };
    handler(recipeMeal);
    const updater = (deps.setDailyMacros as any).mock.calls[0][0];
    const prev = { consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 }, target: { cal: 2000, pro: 150, carbs: 220, fats: 60 } };
    const result = updater(prev);
    expect(result.consumed.cal).toBe(250);
    expect(result.consumed.pro).toBe(12);
  });
});

// ─── createHandleLogMeal — plan log path (targetPlanDay set) ─────────────────

describe('createHandleLogMeal — plan path', () => {
  let deps: ReturnType<typeof makeBaseDeps>;
  let handler: ReturnType<typeof createHandleLogMeal>;

  beforeEach(() => {
    deps = makeBaseDeps({ targetPlanDay: 2 });
    handler = createHandleLogMeal(deps);
  });

  it('adds meal to the specified plan day', () => {
    handler(makeMeal());
    expect(deps.setMealPlan).toHaveBeenCalledOnce();

    const updater = (deps.setMealPlan as any).mock.calls[0][0];
    const prev = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    const result = updater(prev);
    expect(result[2]).toHaveLength(1);
    expect(result[2][0].title).toBe('Pollo a la plancha');
  });

  it('resets targetPlanDay to null after planning', () => {
    handler(makeMeal());
    expect(deps.setTargetPlanDay).toHaveBeenCalledWith(null);
  });

  it('navigates to cocina after planning', () => {
    handler(makeMeal());
    expect(deps.navigateTo).toHaveBeenCalledWith('cocina');
  });

  it('does not update daily macros when adding to plan', () => {
    handler(makeMeal());
    expect(deps.setDailyMacros).not.toHaveBeenCalled();
  });

  it('adds ingredient to shopping list for a recipe with recipeIngredients', () => {
    const mealWithIngredients = makeMeal({
      recipeIngredients: [
        { ingredient: { name: 'Pollo', category: 'Proteína', baseUnit: 'g' }, amount: 200, unit: 'g' },
      ],
    });
    handler(mealWithIngredients);
    const updater = (deps.setShoppingList as any).mock.calls[0][0];
    const result = updater([]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].checked).toBe(false);
  });
});

// ─── createHandleRepeatYesterday ──────────────────────────────────────────────

describe('createHandleRepeatYesterday', () => {
  it('does nothing when nutritionHistory is empty', () => {
    const setDailyLog = vi.fn();
    const setDailyMacros = vi.fn();
    const handler = createHandleRepeatYesterday({ setDailyLog, setDailyMacros, nutritionHistory: [], t: partialT });
    handler();
    expect(setDailyLog).not.toHaveBeenCalled();
    expect(setDailyMacros).not.toHaveBeenCalled();
  });

  it('repeats most recent day entries into daily log', () => {
    const yesterday = makeDailyArchive({
      macros: { consumed: { cal: 1800, pro: 120, carbs: 200, fats: 55 }, target: { cal: 2000, pro: 150, carbs: 220, fats: 60 } },
      dailyLog: [
        { id: 1, title: 'Avena', macros: { cal: 350, pro: 12, carbs: 60, fats: 6 }, mealSlot: 'breakfast', portionDescription: '100g', time: '08:00', ingredientIds: [] },
        { id: 2, title: 'Pollo', macros: { cal: 320, pro: 40, carbs: 0, fats: 8 }, mealSlot: 'lunch', portionDescription: '200g', time: '13:00', ingredientIds: [] },
      ],
    });

    const setDailyLog = vi.fn();
    const setDailyMacros = vi.fn();
    const handler = createHandleRepeatYesterday({ setDailyLog, setDailyMacros, nutritionHistory: [yesterday], t: partialT });

    handler();
    expect(setDailyLog).toHaveBeenCalledOnce();
    const entries = (setDailyLog as any).mock.calls[0][0];
    expect(entries).toHaveLength(2);
    expect(entries[0].title).toBe('Avena');
    // Ids should be new (not the same as yesterday's)
    expect(entries[0].id).not.toBe(1);
  });

  it('recalculates total macros from repeated entries', () => {
    const yesterday = makeDailyArchive({
      macros: { consumed: { cal: 670, pro: 52, carbs: 60, fats: 14 }, target: { cal: 2000, pro: 150, carbs: 220, fats: 60 } },
      dailyLog: [
        { id: 1, title: 'Avena', macros: { cal: 350, pro: 12, carbs: 60, fats: 6 }, mealSlot: 'breakfast', portionDescription: '100g', time: '08:00', ingredientIds: [] },
        { id: 2, title: 'Pollo', macros: { cal: 320, pro: 40, carbs: 0, fats: 8 }, mealSlot: 'lunch', portionDescription: '200g', time: '13:00', ingredientIds: [] },
      ],
    });

    const setDailyMacros = vi.fn();
    const handler = createHandleRepeatYesterday({ setDailyLog: vi.fn(), setDailyMacros, nutritionHistory: [yesterday], t: partialT });
    handler();

    expect(setDailyMacros).toHaveBeenCalledOnce();
    const updater = (setDailyMacros as any).mock.calls[0][0];
    const result = updater({ consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 }, target: { cal: 2000, pro: 150, carbs: 220, fats: 60 } });
    expect(result.consumed.cal).toBe(670);  // 350 + 320
    expect(result.consumed.pro).toBe(52);   // 12 + 40
  });
});

// ─── createHandleLogMealNow — defensive [1.5.175] ─────────────────────────────

describe('createHandleLogMealNow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeNowDeps = () => ({
    setDailyMacros: vi.fn(),
    setDailyLog: vi.fn(),
    setFoodHistory: vi.fn(),
    navigateTo: vi.fn(),
    t: t({
      mealToasts: { defaultPortion: '1 ración', defaultMealName: 'Comida', portionsLogged: '{servings}× {title}' },
      errors: { logMealFailed: 'No pudimos registrar' },
    }),
  });

  it('logs a valid planned meal: mutates macros + log, navigates home', () => {
    const deps = makeNowDeps();
    const handler = createHandleLogMealNow(deps);
    handler(makeMeal() as any, 1);

    expect(deps.setDailyMacros).toHaveBeenCalledOnce();
    expect(deps.setDailyLog).toHaveBeenCalledOnce();
    expect(deps.navigateTo).toHaveBeenCalledWith('home');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('rejects null meal payload (no mutations, toast error)', () => {
    const deps = makeNowDeps();
    const handler = createHandleLogMealNow(deps);
    handler(null as any, 1);

    expect(deps.setDailyMacros).not.toHaveBeenCalled();
    expect(deps.setDailyLog).not.toHaveBeenCalled();
    expect(deps.navigateTo).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('No pudimos registrar');
  });

  it('filters null/undefined entries from recipeIngredients', () => {
    const deps = makeNowDeps();
    const handler = createHandleLogMealNow(deps);
    const meal = makeMeal({
      recipeIngredients: [null, undefined, { ingredientId: 'x' }, { id: 'y' }] as any,
    });
    handler(meal as any, 1);

    expect(deps.setDailyLog).toHaveBeenCalledOnce();
    const updater = (deps.setDailyLog as any).mock.calls[0][0];
    const result = updater([]);
    expect(result[0].ingredientIds).toEqual(['x', 'y']);
  });

  it('clamps invalid servings to 1 (NaN, 0, negative)', () => {
    const deps = makeNowDeps();
    const handler = createHandleLogMealNow(deps);
    handler(makeMeal() as any, 0);

    expect(deps.setDailyMacros).toHaveBeenCalledOnce();
    const updater = (deps.setDailyMacros as any).mock.calls[0][0];
    const result = updater({ consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 }, target: { cal: 0, pro: 0, carbs: 0, fats: 0 } });
    expect(result.consumed.cal).toBe(320);  // 320 × 1 (clamped)
  });

  it('catches errors and surfaces toast without throwing', () => {
    const deps = makeNowDeps();
    deps.setDailyMacros.mockImplementation(() => {
      throw new Error('boom');
    });
    const handler = createHandleLogMealNow(deps);
    expect(() => handler(makeMeal() as any, 1)).not.toThrow();
    expect(toast.error).toHaveBeenCalled();
  });
});

