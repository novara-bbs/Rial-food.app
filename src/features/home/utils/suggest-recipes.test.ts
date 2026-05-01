/**
 * Sprint 50 `[1.5.164]` — recipe ranking tests.
 *
 * Locks the ranking contract:
 *   - protein deficit → high-protein recipes win
 *   - planned-today recipes win the tie
 *   - already-logged recipes are penalised
 *   - allergen substring filter blocks recipes mentioning forbidden ingredients
 *   - slot filter respects `suitableFor` when present
 */
import { describe, it, expect } from 'vitest';
import type { Recipe, MealSlot } from '../../../types/recipe';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import { rankRecipesForGap } from './suggest-recipes';

function mkRecipe(overrides: {
  id: string;
  title: string;
  protein: number;
  carbs?: number;
  fats?: number;
  calories?: number;
  ingredients?: string[];
  tags?: string[];
  suitableFor?: MealSlot[];
  publishedBy?: string;
  forkedFrom?: Recipe['forkedFrom'];
}): Recipe {
  return {
    id: overrides.id,
    title: overrides.title,
    description: '',
    image: '',
    prepTime: '10 min',
    cookTime: '15 min',
    difficulty: 'Fácil',
    macros: {
      calories: overrides.calories ?? 400,
      protein: overrides.protein,
      carbs: overrides.carbs ?? 30,
      fats: overrides.fats ?? 15,
    },
    tags: overrides.tags ?? [],
    ingredients: overrides.ingredients ?? [],
    suitableFor: overrides.suitableFor,
    publishedBy: overrides.publishedBy,
    forkedFrom: overrides.forkedFrom,
  };
}

function mkLog(title: string): DailyLogEntry {
  return {
    id: Math.floor(Math.random() * 1e9),
    title,
    portionDescription: '1 portion',
    mealSlot: 'lunch',
    time: '13:00',
    macros: { cal: 400, pro: 30, carbs: 30, fats: 15 },
  };
}

const chickenBowl = mkRecipe({
  id: 'r-chicken-bowl',
  title: 'Pollo bowl con quinoa',
  protein: 45,
  carbs: 50,
  fats: 12,
  ingredients: ['pechuga de pollo', 'quinoa', 'aguacate'],
});
const tunaSalad = mkRecipe({
  id: 'r-tuna-salad',
  title: 'Ensalada de atún',
  protein: 38,
  carbs: 12,
  fats: 8,
  ingredients: ['atún en lata', 'lechuga', 'tomate'],
});
const pastaCarbonara = mkRecipe({
  id: 'r-pasta-carbonara',
  title: 'Pasta carbonara',
  protein: 22,
  carbs: 70,
  fats: 28,
  ingredients: ['pasta', 'huevo', 'queso parmesano', 'panceta'],
});
const oatBowl = mkRecipe({
  id: 'r-oat-bowl',
  title: 'Bowl de avena',
  protein: 18,
  carbs: 60,
  fats: 10,
  ingredients: ['avena', 'plátano', 'leche'],
  suitableFor: ['breakfast'],
});
const grilledSalmon = mkRecipe({
  id: 'r-grilled-salmon',
  title: 'Salmón a la plancha',
  protein: 40,
  carbs: 0,
  fats: 22,
  ingredients: ['salmón fresco', 'limón', 'eneldo'],
  suitableFor: ['dinner'],
});

const POOL = [chickenBowl, tunaSalad, pastaCarbonara, oatBowl, grilledSalmon];

describe('rankRecipesForGap — protein deficit', () => {
  it('returns the highest-protein recipes first', () => {
    const ranked = rankRecipesForGap('pro', POOL, { limit: 3, slotGuess: 'lunch' });
    expect(ranked.length).toBeGreaterThan(0);
    // Highest protein within slot=lunch (chicken-bowl 45, tuna-salad 38) should top.
    expect(ranked[0].recipe.id).toBe('r-chicken-bowl');
  });

  it('respects the limit parameter', () => {
    const ranked = rankRecipesForGap('pro', POOL, { limit: 2, slotGuess: 'lunch' });
    expect(ranked.length).toBeLessThanOrEqual(2);
  });
});

describe('rankRecipesForGap — planned-today bonus', () => {
  it('promotes a recipe that is on todays meal plan', () => {
    // Tuna alone has lower protein than chicken-bowl (38 vs 45). With a
    // planned-today bonus, tuna's score = 38 * 1.25 * 1.15 ≈ 54.6 which
    // beats chicken-bowl's 45 * 1.15 ≈ 51.75. Bonus should flip the order.
    const ranked = rankRecipesForGap('pro', POOL, {
      limit: 3,
      slotGuess: 'lunch',
      mealPlanToday: [tunaSalad],
    });
    expect(ranked[0].recipe.id).toBe('r-tuna-salad');
    expect(ranked[0].reason).toBe('planned-today');
  });
});

describe('rankRecipesForGap — already-logged dedupe (Sprint 52)', () => {
  it('excludes a recipe that already appears in the daily log', () => {
    const ranked = rankRecipesForGap('pro', POOL, {
      limit: 5,
      slotGuess: 'lunch',
      dailyLog: [mkLog('Pollo bowl con quinoa')],
    });
    // Hard exclusion now — recipe is removed from the result entirely.
    expect(ranked.find(r => r.recipe.id === 'r-chicken-bowl')).toBeUndefined();
    // Other recipes still surface.
    expect(ranked.find(r => r.recipe.id === 'r-tuna-salad')).toBeDefined();
  });

  it('matches case-insensitively when comparing log title', () => {
    const ranked = rankRecipesForGap('pro', POOL, {
      limit: 5,
      slotGuess: 'lunch',
      dailyLog: [mkLog('POLLO BOWL CON QUINOA')],
    });
    expect(ranked.find(r => r.recipe.id === 'r-chicken-bowl')).toBeUndefined();
  });
});

describe('rankRecipesForGap — allergen filter', () => {
  it('excludes recipes whose ingredients contain a user intolerance keyword', () => {
    const ranked = rankRecipesForGap('pro', POOL, {
      limit: 10,
      slotGuess: 'lunch',
      intolerances: ['fish'],
    });
    // Tuna salad has 'atún' → blocked. Salmón is dinner-slot anyway, but blocked too.
    expect(ranked.find(r => r.recipe.id === 'r-tuna-salad')).toBeUndefined();
    expect(ranked.find(r => r.recipe.id === 'r-grilled-salmon')).toBeUndefined();
  });

  it('excludes dairy-mentioning recipes when the user is dairy-intolerant', () => {
    const ranked = rankRecipesForGap('pro', POOL, {
      limit: 10,
      slotGuess: 'breakfast',
      intolerances: ['dairy'],
    });
    // Oat bowl has 'leche' in ingredients → blocked.
    expect(ranked.find(r => r.recipe.id === 'r-oat-bowl')).toBeUndefined();
  });
});

describe('rankRecipesForGap — slot filter', () => {
  it('hides recipes whose suitableFor does not include the current slot', () => {
    const ranked = rankRecipesForGap('pro', POOL, {
      limit: 10,
      slotGuess: 'breakfast',
    });
    // grilled salmon is dinner-only.
    expect(ranked.find(r => r.recipe.id === 'r-grilled-salmon')).toBeUndefined();
    // oat bowl is breakfast-only and should appear.
    expect(ranked.find(r => r.recipe.id === 'r-oat-bowl')).toBeTruthy();
  });

  it('shows versatile recipes (no suitableFor) in any slot', () => {
    const ranked = rankRecipesForGap('pro', POOL, {
      limit: 10,
      slotGuess: 'snack',
    });
    expect(ranked.find(r => r.recipe.id === 'r-chicken-bowl')).toBeTruthy();
  });
});

describe('rankRecipesForGap — empty inputs', () => {
  it('returns an empty array when the pool is empty', () => {
    const ranked = rankRecipesForGap('pro', [], { slotGuess: 'lunch' });
    expect(ranked).toEqual([]);
  });

  it('returns an empty array when no recipe contributes positive macro', () => {
    const zeroProteinPool = [mkRecipe({ id: 'r-zero', title: 'Vacío', protein: 0 })];
    const ranked = rankRecipesForGap('pro', zeroProteinPool, { slotGuess: 'lunch' });
    expect(ranked).toEqual([]);
  });
});
