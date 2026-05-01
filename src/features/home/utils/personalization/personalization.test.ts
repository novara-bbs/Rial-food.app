/**
 * Sprint 53 [1.5.184] — personalization scorer pipeline tests.
 *
 * Each scorer is unit-tested in isolation, then orchestration cases verify
 * that scorers compose correctly and that the reason picked matches the
 * REASON_PRIORITY ranking.
 */
import { describe, it, expect } from 'vitest';
import type { Recipe } from '../../../../types/recipe';
import type { UserProfile } from '../../../../types/user';
import type { DailyArchive } from '../../../../hooks/useDailyReset';
import type { FoodHistoryEntry } from '../../../food/handlers/meal-handlers';
import type { PersonalizationContext } from './types';
import { composeScorers } from './combine';
import { dropFilter, isAlreadyLoggedToday } from './scorers/filters';
import { macroDensityBase } from './scorers/macro-density';
import { planContextScorer } from './scorers/plan-context';
import { affinityScorer } from './scorers/affinity';
import { familiarityScorer } from './scorers/familiarity';
import { weeklyFatigueScorer } from './scorers/weekly-fatigue';
import { preferencesScorer } from './scorers/preferences';
import { socialScorer } from './scorers/social';
import { tierScorer } from './scorers/tier';
import { embeddingScorer } from './scorers/embedding';

const baseRecipe = (over: Partial<Recipe> = {}): Recipe => ({
  id: 'r-test',
  title: 'Pollo al Limón',
  description: '',
  image: '',
  prepTime: '10 min',
  cookTime: '15 min',
  difficulty: 'Fácil',
  macros: { calories: 500, protein: 40, carbs: 30, fats: 18 },
  tags: [],
  ingredients: ['pechuga de pollo', 'limón', 'aceite de oliva'],
  ...over,
});

const baseCtx = (over: Partial<PersonalizationContext> = {}): PersonalizationContext => ({
  macroKey: 'pro',
  mealPlanToday: [],
  dailyLog: [],
  weeklyArchive: [],
  savedRecipes: [],
  foodHistory: [],
  userProfile: null,
  followedCreators: [],
  intolerances: [],
  slotGuess: 'lunch',
  ...over,
});

describe('macroDensityBase', () => {
  it('returns the per-portion macro grams for protein/carbs/fats', () => {
    const r = baseRecipe();
    expect(macroDensityBase(r, 'pro')).toBe(40);
    expect(macroDensityBase(r, 'carbs')).toBe(30);
    expect(macroDensityBase(r, 'fats')).toBe(18);
  });

  it('applies anti-mono-macro penalty for cal deficit when only one macro is non-zero', () => {
    const monoMacroRecipe = baseRecipe({ macros: { calories: 500, protein: 0, carbs: 100, fats: 0 } });
    const balanced = baseRecipe();
    expect(macroDensityBase(monoMacroRecipe, 'cal')).toBe(100 * 0.2); // mono → ×0.2
    expect(macroDensityBase(balanced, 'cal')).toBe((40 + 30 + 18) * 1); // 3 macros → ×1
  });
});

describe('planContextScorer', () => {
  it('stacks planned-today + not-eaten when recipe is on todays plan', () => {
    const r = baseRecipe();
    const ctx = baseCtx({ mealPlanToday: [r] });
    const contributions = planContextScorer(r, ctx);
    expect(contributions).toHaveLength(2);
    expect(contributions[0].weight).toBe(1.15); // not-eaten baseline
    expect(contributions[1].weight).toBe(1.25); // planned-today on top
    expect(contributions[1].reason).toBe('planned-today');
  });

  it('emits only the not-eaten baseline when not planned', () => {
    const r = baseRecipe();
    const ctx = baseCtx();
    const contributions = planContextScorer(r, ctx);
    expect(contributions).toHaveLength(1);
    expect(contributions[0].reason).toBe('not-eaten');
  });
});

describe('affinityScorer', () => {
  it('boosts when recipe ingredients overlap with frequent foodHistory', () => {
    const r = baseRecipe();
    const history: FoodHistoryEntry[] = [
      { foodId: 'f1', title: 'pollo', lastUsed: 1, useCount: 25, lastMacros: { cal: 0, pro: 0, carbs: 0, fats: 0 }, lastPortionDescription: '', source: 'dictionary' },
    ];
    const contributions = affinityScorer(r, baseCtx({ foodHistory: history }));
    expect(contributions).toHaveLength(1);
    expect(contributions[0].weight).toBeGreaterThan(1);
    expect(contributions[0].reason).toBe('history');
  });

  it('returns no contribution when foodHistory is empty', () => {
    expect(affinityScorer(baseRecipe(), baseCtx())).toEqual([]);
  });
});

describe('familiarityScorer', () => {
  it('emits cooked-before reason when cookedAt has 1+ entries', () => {
    const r = baseRecipe({ cookedAt: ['2026-01-01T12:00:00Z'] });
    const contributions = familiarityScorer(r, baseCtx());
    expect(contributions.find((c) => c.reason === 'cooked-before')).toBeDefined();
  });

  it('scales bonus by cook count tiers', () => {
    const oneCook = familiarityScorer(baseRecipe({ cookedAt: ['x'] }), baseCtx());
    const fiveCooks = familiarityScorer(baseRecipe({ cookedAt: ['a', 'b', 'c', 'd', 'e'] }), baseCtx());
    const oneWeight = oneCook.find((c) => c.signal === 'cooked-before')?.weight ?? 1;
    const fiveWeight = fiveCooks.find((c) => c.signal === 'cooked-before')?.weight ?? 1;
    expect(fiveWeight).toBeGreaterThan(oneWeight);
  });

  it('adds saved-bonus when recipe is in savedRecipes', () => {
    const r = baseRecipe();
    const contributions = familiarityScorer(r, baseCtx({ savedRecipes: [r] }));
    expect(contributions.find((c) => c.signal === 'saved-bonus')).toBeDefined();
  });
});

describe('weeklyFatigueScorer', () => {
  const archive = (titles: readonly string[][]): readonly DailyArchive[] =>
    titles.map((dayTitles, idx) => ({
      date: `2026-04-${String(idx + 1).padStart(2, '0')}`,
      macros: { consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 }, target: { cal: 2000, pro: 150, carbs: 200, fats: 70 } },
      hydration: { consumed: 0, target: 10 },
      movement: { activeMinutes: 0, steps: 0 },
      mealCount: dayTitles.length,
      dailyLog: dayTitles.map((t) => ({ title: t })),
    }));

  it('penalises a recipe eaten 2+ days', () => {
    const r = baseRecipe();
    const ctx = baseCtx({ weeklyArchive: archive([['Pollo al Limón'], ['Pollo al Limón']]) });
    const contributions = weeklyFatigueScorer(r, ctx);
    expect(contributions[0].weight).toBeLessThan(1);
  });

  it('returns no contribution when recipe is absent from archive', () => {
    expect(weeklyFatigueScorer(baseRecipe(), baseCtx())).toEqual([]);
  });
});

describe('preferencesScorer', () => {
  it('boosts when recipe ingredients overlap with liked foods', () => {
    const profile = { foodPreferences: { pollo: 'like' } } as Partial<UserProfile> as UserProfile;
    const contributions = preferencesScorer(baseRecipe(), baseCtx({ userProfile: profile }));
    expect(contributions.find((c) => c.reason === 'liked')).toBeDefined();
  });

  it('penalises when recipe ingredients overlap with disliked foods', () => {
    const profile = { foodPreferences: { pollo: 'dislike' } } as Partial<UserProfile> as UserProfile;
    const contributions = preferencesScorer(baseRecipe(), baseCtx({ userProfile: profile }));
    const dislike = contributions.find((c) => c.signal === 'disliked-foods');
    expect(dislike).toBeDefined();
    expect(dislike!.weight).toBeLessThan(1);
  });
});

describe('socialScorer', () => {
  it('boosts recipes from followed creators', () => {
    const r = baseRecipe({ publishedBy: 'creator-7' });
    const contributions = socialScorer(r, baseCtx({ followedCreators: ['creator-7'] }));
    expect(contributions[0].reason).toBe('creator-follow');
  });

  it('returns no contribution when recipe creator is not followed', () => {
    const r = baseRecipe({ publishedBy: 'creator-7' });
    expect(socialScorer(r, baseCtx({ followedCreators: ['creator-9'] }))).toEqual([]);
  });
});

describe('tierScorer', () => {
  it('rewards self-published with +0.10 additive', () => {
    const contributions = tierScorer(baseRecipe(), baseCtx());
    const self = contributions.find((c) => c.signal === 'tier-self');
    expect(self?.weight).toBe(0.10);
  });

  it('penalises forked recipes with -0.05', () => {
    const r = baseRecipe({ forkedFrom: { recipeId: 'x', creatorId: 'c1', creatorName: 'A', title: 'Original' } });
    const contributions = tierScorer(r, baseCtx());
    expect(contributions.find((c) => c.signal === 'tier-fork')?.weight).toBe(-0.05);
  });
});

describe('embeddingScorer (RAG stub)', () => {
  it('returns no contribution when embeddings are absent (current default)', () => {
    expect(embeddingScorer(baseRecipe(), baseCtx())).toEqual([]);
  });

  it('emits cosine-similarity multiplier when embeddings are present', () => {
    const r = baseRecipe({ id: 'r-1' });
    const userVector = [1, 0, 0];
    const ctx = baseCtx({
      embeddings: [{ recipeId: 'r-1', vector: [1, 0, 0] }],
      userVector,
    });
    const contributions = embeddingScorer(r, ctx);
    expect(contributions[0].reason).toBe('embedding');
    expect(contributions[0].weight).toBeGreaterThan(1);
  });
});

describe('dropFilter (hard filters)', () => {
  it('drops recipes with allergens the user is intolerant to', () => {
    const r = baseRecipe({ ingredients: ['gluten', 'pasta'] });
    expect(dropFilter(r, baseCtx({ intolerances: ['gluten'] }))).toBe(true);
  });

  it('drops recipes whose suitableFor does not match the slot', () => {
    const r = baseRecipe({ suitableFor: ['breakfast'] });
    expect(dropFilter(r, baseCtx({ slotGuess: 'lunch' }))).toBe(true);
  });

  it('drops recipes already logged today', () => {
    const r = baseRecipe();
    const log = [
      { id: 1, title: 'Pollo al Limón', portionDescription: '', mealSlot: 'lunch', time: '13:00', macros: { cal: 0, pro: 0, carbs: 0, fats: 0 } },
    ];
    expect(isAlreadyLoggedToday(r, log)).toBe(true);
    expect(dropFilter(r, baseCtx({ dailyLog: log }))).toBe(true);
  });
});

describe('composeScorers — orchestration', () => {
  it('combines multipliers and additives correctly', () => {
    const r = baseRecipe();
    // Custom scorer set: 1.5× mult + 0.2 additive.
    const result = composeScorers(r, baseCtx(), 10, [
      () => [{ kind: 'multiplier', weight: 1.5, signal: 'm' }],
      () => [{ kind: 'additive', weight: 0.2, signal: 'a' }],
    ]);
    expect(result.score).toBeCloseTo(10 * 1.5 + 0.2);
  });

  it('picks the highest-priority reason among meaningful contributions', () => {
    const r = baseRecipe();
    const result = composeScorers(r, baseCtx(), 10, [
      () => [{ kind: 'multiplier', weight: 1.05, reason: 'macro-density', signal: 'm' }],
      () => [{ kind: 'multiplier', weight: 1.10, reason: 'history', signal: 'h' }],
      () => [{ kind: 'multiplier', weight: 1.25, reason: 'planned-today', signal: 'p' }],
    ]);
    expect(result.reason).toBe('planned-today');
  });

  it('falls back to macro-density reason when no scorer flags one', () => {
    const result = composeScorers(baseRecipe(), baseCtx(), 10, [
      () => [{ kind: 'multiplier', weight: 1.05, signal: 's' }],
    ]);
    expect(result.reason).toBe('macro-density');
  });
});

describe('Full pipeline integration — Sprint 53', () => {
  it('combines history + cooked-before + creator-follow into a high score', () => {
    const r = baseRecipe({
      id: 'r-pollo',
      cookedAt: ['2026-04-01T00:00:00Z', '2026-04-15T00:00:00Z', '2026-04-20T00:00:00Z'],
      publishedBy: 'creator-1',
    });
    const profile = { foodPreferences: { pollo: 'like' } } as Partial<UserProfile> as UserProfile;
    const history: FoodHistoryEntry[] = [
      { foodId: 'f1', title: 'pollo', lastUsed: 1, useCount: 30, lastMacros: { cal: 0, pro: 0, carbs: 0, fats: 0 }, lastPortionDescription: '', source: 'dictionary' },
    ];
    const ctx = baseCtx({
      foodHistory: history,
      savedRecipes: [r],
      followedCreators: ['creator-1'],
      userProfile: profile,
    });
    const base = macroDensityBase(r, 'pro');
    const result = composeScorers(r, ctx, base, [
      planContextScorer,
      affinityScorer,
      familiarityScorer,
      weeklyFatigueScorer,
      preferencesScorer,
      socialScorer,
      tierScorer,
      embeddingScorer,
    ]);
    expect(result.score).toBeGreaterThan(base);
    // The strongest meaningful reason should win — none here is planned-today.
    // creator-follow ranks above history > cooked-before > liked > not-eaten.
    expect(result.reason).toBe('creator-follow');
  });
});
