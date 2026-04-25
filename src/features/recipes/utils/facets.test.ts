import { describe, it, expect } from 'vitest';
import {
  parseMinutes,
  deriveCuisine,
  deriveDietaryTags,
  deriveTimeBucket,
  deriveDifficulty,
  deriveTotalMinutes,
  countActive,
  matchesFilters,
} from './facets';
import type { Recipe } from '../../../types/recipe';

// ─── Test helpers ─────────────────────────────────────────────────────────

function makeRecipe(overrides: Partial<Recipe> & { tag?: string } = {}): Recipe {
  const { tag, ...rest } = overrides;
  const base: Recipe = {
    id: 'test',
    title: 'Test Recipe',
    description: '',
    image: '',
    prepTime: '10M',
    cookTime: '20M',
    difficulty: 'Fácil',
    macros: { calories: 0, protein: 0, carbs: 0, fats: 0, saturatedFat: 0, transFat: 0, sugar: 0 },
    tags: [],
    ...rest,
  };
  if (tag !== undefined) {
    (base as unknown as { tag: string }).tag = tag;
  }
  return base;
}

// ─── parseMinutes ─────────────────────────────────────────────────────────

describe('parseMinutes', () => {
  it('parses canonical XXM format', () => {
    expect(parseMinutes('10M')).toBe(10);
    expect(parseMinutes('0M')).toBe(0);
    expect(parseMinutes('45M')).toBe(45);
  });
  it('parses composite hours+minutes', () => {
    expect(parseMinutes('1h 30min')).toBe(90);
    expect(parseMinutes('2 horas 15 minutos')).toBe(135);
  });
  it('parses bare numbers as minutes', () => {
    expect(parseMinutes('25')).toBe(25);
  });
  it('returns 0 for empty / unparseable', () => {
    expect(parseMinutes('')).toBe(0);
    expect(parseMinutes(undefined)).toBe(0);
    expect(parseMinutes('hola')).toBe(0);
  });
});

// ─── deriveTotalMinutes ──────────────────────────────────────────────────

describe('deriveTotalMinutes', () => {
  it('sums prepTime + cookTime', () => {
    const r = makeRecipe({ prepTime: '10M', cookTime: '20M' });
    expect(deriveTotalMinutes(r)).toBe(30);
  });
  it('handles zero cookTime', () => {
    const r = makeRecipe({ prepTime: '5M', cookTime: '0M' });
    expect(deriveTotalMinutes(r)).toBe(5);
  });
});

// ─── deriveTimeBucket boundaries ─────────────────────────────────────────

describe('deriveTimeBucket', () => {
  it('returns under15 for total < 15', () => {
    expect(deriveTimeBucket(makeRecipe({ prepTime: '5M', cookTime: '0M' }))).toBe('under15');
    expect(deriveTimeBucket(makeRecipe({ prepTime: '7M', cookTime: '7M' }))).toBe('under15');
  });
  it('returns under30 for 15 <= total < 30', () => {
    expect(deriveTimeBucket(makeRecipe({ prepTime: '15M', cookTime: '0M' }))).toBe('under30');
    expect(deriveTimeBucket(makeRecipe({ prepTime: '10M', cookTime: '19M' }))).toBe('under30');
  });
  it('returns under60 for 30 <= total < 60', () => {
    expect(deriveTimeBucket(makeRecipe({ prepTime: '15M', cookTime: '15M' }))).toBe('under60');
    expect(deriveTimeBucket(makeRecipe({ prepTime: '20M', cookTime: '39M' }))).toBe('under60');
  });
  it('returns over60 for total >= 60', () => {
    expect(deriveTimeBucket(makeRecipe({ prepTime: '30M', cookTime: '30M' }))).toBe('over60');
    expect(deriveTimeBucket(makeRecipe({ prepTime: '60M', cookTime: '0M' }))).toBe('over60');
  });
});

// ─── deriveDifficulty ────────────────────────────────────────────────────

describe('deriveDifficulty', () => {
  it('maps ES literals (with diacritics) to canonical', () => {
    expect(deriveDifficulty(makeRecipe({ difficulty: 'Fácil' }))).toBe('easy');
    expect(deriveDifficulty(makeRecipe({ difficulty: 'Medio' }))).toBe('medium');
    expect(deriveDifficulty(makeRecipe({ difficulty: 'Difícil' }))).toBe('hard');
  });
  it('falls back to medium for unknown values', () => {
    expect(deriveDifficulty(makeRecipe({ difficulty: 'random' as Recipe['difficulty'] }))).toBe('medium');
  });
});

// ─── deriveCuisine — golden seeds ────────────────────────────────────────

describe('deriveCuisine', () => {
  it('detects mediterranean from tags[]', () => {
    expect(deriveCuisine(makeRecipe({ tags: ['MEDITERRÁNEO'] }))).toBe('mediterranean');
  });
  it('detects mediterranean from legacy tag (singular)', () => {
    expect(deriveCuisine(makeRecipe({ tag: 'MEDITERRÁNEO' }))).toBe('mediterranean');
  });
  it('returns "other" when no cuisine keyword present', () => {
    expect(deriveCuisine(makeRecipe({ tags: ['EXPRESS', 'DESAYUNO'] }))).toBe('other');
  });
  it('detects asian via japanese keyword', () => {
    expect(deriveCuisine(makeRecipe({ tags: ['Cocina japonesa'] }))).toBe('asian');
  });
  it('detects mexican via accent-insensitive match', () => {
    expect(deriveCuisine(makeRecipe({ tags: ['mexicana'] }))).toBe('mexican');
  });
});

// ─── deriveDietaryTags ───────────────────────────────────────────────────

describe('deriveDietaryTags', () => {
  it('detects vegan and implies vegetarian', () => {
    const out = deriveDietaryTags(makeRecipe({ tags: ['VEGANO'] }));
    expect(out).toContain('vegan');
    expect(out).toContain('vegetarian');
  });
  it('detects highProtein from "ALTO PROTEÍNA"', () => {
    expect(deriveDietaryTags(makeRecipe({ tags: ['ALTO PROTEÍNA'] }))).toContain('highProtein');
  });
  it('returns empty array when no diet tag present', () => {
    expect(deriveDietaryTags(makeRecipe({ tags: ['EXPRESS', 'POSTRE'] }))).toEqual([]);
  });
  it('detects multiple diets', () => {
    const out = deriveDietaryTags(makeRecipe({ tags: ['VEGANO', 'ALTO PROTEÍNA'] }));
    expect(out).toContain('vegan');
    expect(out).toContain('vegetarian');
    expect(out).toContain('highProtein');
  });
});

// ─── countActive ──────────────────────────────────────────────────────────

describe('countActive', () => {
  it('returns 0 for empty values', () => {
    expect(countActive({})).toBe(0);
    expect(countActive({ cuisine: [], diet: [], time: null, source: 'all' })).toBe(0);
  });
  it('counts strings, arrays, and ignores "all" / null', () => {
    expect(countActive({ cuisine: ['italian', 'mexican'], time: 'under30', source: 'all' })).toBe(3);
    expect(countActive({ diet: ['vegan'], difficulty: 'easy' })).toBe(2);
  });
});

// ─── matchesFilters ──────────────────────────────────────────────────────

describe('matchesFilters', () => {
  const veganRecipe = makeRecipe({ tags: ['VEGANO'], prepTime: '5M', cookTime: '10M', difficulty: 'Fácil' });
  const medRecipe = makeRecipe({ tags: ['MEDITERRÁNEO'], prepTime: '15M', cookTime: '25M', difficulty: 'Medio' });
  const longRecipe = makeRecipe({ tags: ['BATCH'], prepTime: '30M', cookTime: '60M', difficulty: 'Difícil' });

  it('returns true for empty values (no filters)', () => {
    expect(matchesFilters(veganRecipe, {})).toBe(true);
  });
  it('cuisine union — matches if recipe cuisine is in selected set', () => {
    expect(matchesFilters(medRecipe, { cuisine: ['mediterranean', 'italian'] })).toBe(true);
    expect(matchesFilters(veganRecipe, { cuisine: ['mediterranean'] })).toBe(false);
  });
  it('diet intersection — recipe must satisfy ALL selected diets', () => {
    expect(matchesFilters(veganRecipe, { diet: ['vegan'] })).toBe(true);
    expect(matchesFilters(veganRecipe, { diet: ['vegan', 'highProtein'] })).toBe(false);
  });
  it('time bucket equality', () => {
    expect(matchesFilters(veganRecipe, { time: 'under30' })).toBe(true);
    expect(matchesFilters(veganRecipe, { time: 'over60' })).toBe(false);
  });
  it('difficulty equality', () => {
    expect(matchesFilters(longRecipe, { difficulty: 'hard' })).toBe(true);
    expect(matchesFilters(longRecipe, { difficulty: 'easy' })).toBe(false);
  });
  it('mealSlot — recipe.suitableFor must include slot', () => {
    const r = makeRecipe({ suitableFor: ['lunch', 'dinner'] });
    expect(matchesFilters(r, { mealSlot: 'lunch' })).toBe(true);
    expect(matchesFilters(r, { mealSlot: 'breakfast' })).toBe(false);
  });
  it('source — uses opts.sourceContext', () => {
    expect(matchesFilters(veganRecipe, { source: 'mine' }, { sourceContext: { isMine: true } })).toBe(true);
    expect(matchesFilters(veganRecipe, { source: 'mine' }, { sourceContext: { isMine: false } })).toBe(false);
    expect(matchesFilters(veganRecipe, { source: 'all' }, { sourceContext: {} })).toBe(true);
  });
  it('combined filters — every active section must pass', () => {
    expect(
      matchesFilters(medRecipe, {
        cuisine: ['mediterranean'],
        difficulty: 'medium',
        time: 'under60',
      }),
    ).toBe(true);
    expect(
      matchesFilters(medRecipe, {
        cuisine: ['mediterranean'],
        difficulty: 'easy', // medRecipe is medium → fail
      }),
    ).toBe(false);
  });
});
