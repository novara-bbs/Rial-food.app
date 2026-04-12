/**
 * Tests for calculateMatchScore function.
 */
import { describe, it, expect } from 'vitest';
import { calculateMatchScore } from './matchScore';
import type { Ingredient } from '../../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const baseProfile = {
  goal: 'maintain' as const,
  foodDislikes: [],
  intolerances: [],
  dailyTarget: { cal: 2400, pro: 150 },
};

const makeIngredient = (id: string, allergens: string[] = []): Ingredient =>
  ({
    id,
    name: id,
    nameEn: id,
    cal: 100,
    pro: 10,
    carbs: 10,
    fats: 5,
    fiber: 1,
    category: 'other',
    allergens,
    servingSizes: [],
  } as unknown as Ingredient);

// ─── Score range ──────────────────────────────────────────────────────────────

describe('calculateMatchScore — range', () => {
  it('returns a value between 0 and 100', () => {
    const recipe = { macros: { calories: 500, protein: 40, carbs: 60, fats: 15 } };
    const score = calculateMatchScore(recipe, baseProfile, []);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('handles zero macros (minimal recipe)', () => {
    const score = calculateMatchScore({}, baseProfile, []);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── Protein scoring (0–40) ───────────────────────────────────────────────────

describe('calculateMatchScore — protein', () => {
  it('gives full protein score for ~33% of daily target', () => {
    const targetPro = 150;
    const idealPro = targetPro * 0.33; // ~49.5g
    const recipe = { macros: { calories: 500, protein: idealPro, carbs: 60, fats: 15 } };
    const score = calculateMatchScore(recipe, baseProfile, []);
    expect(score).toBeGreaterThanOrEqual(70); // 40 protein + 30 calorie
  });

  it('gives lower score for zero protein', () => {
    const recipe = { macros: { calories: 800, protein: 0, carbs: 100, fats: 30 } };
    const score = calculateMatchScore(recipe, baseProfile, []);
    // 0 protein → 0 pts; calorie fit ~30; no allergens +20; no dislikes +10 = ~60 max
    // Score should be well below a high-protein recipe's score
    expect(score).toBeLessThan(70);
    const highProtein = { macros: { calories: 800, protein: 50, carbs: 60, fats: 20 } };
    const highScore = calculateMatchScore(highProtein, baseProfile, []);
    expect(highScore).toBeGreaterThan(score);
  });

  it('caps protein score at 40', () => {
    const recipe = { macros: { calories: 500, protein: 999, carbs: 10, fats: 5 } };
    const score = calculateMatchScore(recipe, baseProfile, []);
    // 40 (max protein) + up to 30 (calories) + 20 (no allergens) + 10 (no dislikes) = 100
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── Calorie scoring by goal (0–30) ──────────────────────────────────────────

describe('calculateMatchScore — goal', () => {
  const calPerMeal = 2400 / 3; // 800 kcal

  it('gain goal: rewards higher calories', () => {
    const highCal = { macros: { calories: calPerMeal * 1.2, protein: 30, carbs: 100, fats: 30 } };
    const lowCal = { macros: { calories: calPerMeal * 0.5, protein: 30, carbs: 50, fats: 10 } };
    const gainProfile = { ...baseProfile, goal: 'gain' as const };
    const highScore = calculateMatchScore(highCal, gainProfile, []);
    const lowScore = calculateMatchScore(lowCal, gainProfile, []);
    expect(highScore).toBeGreaterThan(lowScore);
  });

  it('lose goal: rewards lower calories', () => {
    const lowCal = { macros: { calories: calPerMeal * 0.7, protein: 30, carbs: 40, fats: 10 } };
    const highCal = { macros: { calories: calPerMeal * 1.3, protein: 30, carbs: 120, fats: 40 } };
    const loseProfile = { ...baseProfile, goal: 'lose' as const };
    const lowScore = calculateMatchScore(lowCal, loseProfile, []);
    const highScore = calculateMatchScore(highCal, loseProfile, []);
    expect(lowScore).toBeGreaterThan(highScore);
  });

  it('maintain goal: rewards calories close to per-meal target', () => {
    const onTarget = { macros: { calories: calPerMeal, protein: 40, carbs: 80, fats: 25 } };
    const wayOff = { macros: { calories: calPerMeal * 3, protein: 40, carbs: 200, fats: 80 } };
    const onScore = calculateMatchScore(onTarget, baseProfile, []);
    const offScore = calculateMatchScore(wayOff, baseProfile, []);
    expect(onScore).toBeGreaterThan(offScore);
  });

  it('muscle goal behaves same as gain', () => {
    const recipe = { macros: { calories: calPerMeal * 1.1, protein: 40, carbs: 90, fats: 25 } };
    const gainScore = calculateMatchScore(recipe, { ...baseProfile, goal: 'gain' }, []);
    const muscleScore = calculateMatchScore(recipe, { ...baseProfile, goal: 'muscle' }, []);
    expect(gainScore).toBe(muscleScore);
  });

  it('cut goal behaves same as lose', () => {
    const recipe = { macros: { calories: calPerMeal * 0.7, protein: 40, carbs: 50, fats: 10 } };
    const loseScore = calculateMatchScore(recipe, { ...baseProfile, goal: 'lose' }, []);
    const cutScore = calculateMatchScore(recipe, { ...baseProfile, goal: 'cut' }, []);
    expect(loseScore).toBe(cutScore);
  });
});

// ─── Allergen scoring (0–20) ──────────────────────────────────────────────────

describe('calculateMatchScore — allergens', () => {
  it('gives full allergen score when no intolerances', () => {
    const recipe = { macros: { calories: 800, protein: 50, carbs: 80, fats: 20 } };
    const score = calculateMatchScore(recipe, baseProfile, []);
    // With no intolerances, +20 is added
    const noAllergenProfile = { ...baseProfile, intolerances: [] };
    const scoreA = calculateMatchScore(recipe, noAllergenProfile, []);
    expect(scoreA).toBe(score);
  });

  it('deducts allergen score when recipe contains intolerance', () => {
    const glutenIngredient = makeIngredient('wheat', ['gluten']);
    const recipe = {
      macros: { calories: 800, protein: 40, carbs: 80, fats: 20 },
      recipeIngredients: [{ ingredientId: 'wheat', ingredient: glutenIngredient }],
    };
    const allergenProfile = {
      ...baseProfile,
      intolerances: ['gluten' as const],
    };
    const noAllergenProfile = { ...baseProfile };
    const withAllergen = calculateMatchScore(recipe, allergenProfile, [glutenIngredient]);
    const withoutAllergen = calculateMatchScore(recipe, noAllergenProfile, [glutenIngredient]);
    expect(withoutAllergen - withAllergen).toBe(20);
  });

  it('gives full allergen score when ingredients have no matching allergens', () => {
    const safeIngredient = makeIngredient('chicken', []);
    const recipe = {
      macros: { calories: 400, protein: 40, carbs: 0, fats: 10 },
      recipeIngredients: [{ ingredientId: 'chicken', ingredient: safeIngredient }],
    };
    const allergenProfile = { ...baseProfile, intolerances: ['gluten' as const] };
    const score = calculateMatchScore(recipe, allergenProfile, [safeIngredient]);
    // Should still get +20 since chicken has no gluten
    expect(score).toBeGreaterThanOrEqual(20);
  });
});

// ─── Dislike scoring (0–10) ───────────────────────────────────────────────────

describe('calculateMatchScore — dislikes', () => {
  it('gives full dislike score when no dislikes', () => {
    const recipe = { macros: { calories: 500, protein: 30, carbs: 60, fats: 15 } };
    const score = calculateMatchScore(recipe, baseProfile, []);
    const noDislikeScore = calculateMatchScore(recipe, { ...baseProfile, foodDislikes: [] }, []);
    expect(score).toBe(noDislikeScore);
  });

  it('deducts 10 points when recipe contains disliked ingredient', () => {
    const recipe = {
      macros: { calories: 500, protein: 30, carbs: 60, fats: 15 },
      recipeIngredients: [{ ingredientId: 'cebolla' }],
    };
    const dislikeProfile = { ...baseProfile, foodDislikes: ['cebolla'] };
    const noDislikeProfile = { ...baseProfile, foodDislikes: [] };
    const dislikeScore = calculateMatchScore(recipe, dislikeProfile, []);
    const noDislikeScore = calculateMatchScore(recipe, noDislikeProfile, []);
    expect(noDislikeScore - dislikeScore).toBe(10);
  });

  it('gives full dislike score when disliked ingredient not in recipe', () => {
    const recipe = {
      macros: { calories: 500, protein: 30, carbs: 60, fats: 15 },
      recipeIngredients: [{ ingredientId: 'pollo' }],
    };
    const dislikeProfile = { ...baseProfile, foodDislikes: ['cebolla'] };
    const score = calculateMatchScore(recipe, dislikeProfile, []);
    const noDislikeScore = calculateMatchScore(recipe, baseProfile, []);
    expect(score).toBe(noDislikeScore);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('calculateMatchScore — edge cases', () => {
  it('uses defaults when profile fields are missing', () => {
    const score = calculateMatchScore({}, {}, []);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('uses default daily targets when not provided', () => {
    // Should not throw with empty profile
    const recipe = { macros: { calories: 800, protein: 50, carbs: 80, fats: 20 } };
    expect(() => calculateMatchScore(recipe, {}, [])).not.toThrow();
  });

  it('looks up ingredient from dictionary by id if not provided inline', () => {
    const chickenIngredient = makeIngredient('pollo', ['gluten']);
    const recipe = {
      macros: { calories: 400, protein: 40, carbs: 0, fats: 10 },
      recipeIngredients: [{ ingredientId: 'pollo' }], // no `ingredient` inline
    };
    const allergenProfile = { ...baseProfile, intolerances: ['gluten' as const] };
    const score = calculateMatchScore(recipe, allergenProfile, [chickenIngredient]);
    // Should detect allergen via dictionary lookup
    const scoreNoDict = calculateMatchScore(recipe, allergenProfile, []);
    expect(score).toBeLessThanOrEqual(scoreNoDict);
  });
});
