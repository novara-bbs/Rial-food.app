/**
 * Regression tests for the Demo Rial handlers.
 *
 * Two specific bugs this suite locks in:
 *
 *  1. Clear demo must remove the `rial_seedVersion_<key>` markers for every
 *     seeded key, otherwise `shouldReseed` returns false on reload (stored ==
 *     current) and the user is stuck with empty seeded slots.
 *  2. The load path writes `weeklyCheckIns` unprefixed because that is how
 *     `useLocalStorageState` stores it — the earlier `rial_weeklyCheckIns`
 *     key was never read by anything.
 *
 * `buildDemoSeed` dynamic-imports large seed modules; we mock it here to
 * keep the test hermetic and fast.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHandleClearDemoSeed, createHandleLoadDemoSeed, type DemoSeedSetters } from './demo-seed-handlers';
import { ALL_SEED_KEYS, setStoredSeedVersion, __internal } from '../../../lib/seedVersion';

vi.mock('../data/demo-seed', () => ({
  buildDemoSeed: vi.fn(async () => ({
    userProfile: { name: 'Clara', age: 29, height: 168, weight: 69.1, sex: 'female', goal: 'cut', activity: 'active', trains: true, dietaryPreferences: [] },
    dailyMacros: { consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 }, target: { cal: 0, pro: 0, carbs: 0, fats: 0 } },
    hydration: { consumed: 0, target: 10 },
    movement: { steps: 0, target: 10000, activeMinutes: 0, activeTarget: 45 },
    dailyGoal: '',
    dailyLog: [],
    foodHistory: [],
    weightHistory: [],
    nutritionHistory: [],
    realFeelLogs: [],
    weeklyCheckIns: [{ id: 'w1', week: 1 }],
    savedRecipes: [],
    mealPlan: {},
    shoppingList: [],
    communityPosts: [],
    communityStories: [],
    toleranceLogs: [],
  })),
}));

function makeSetters(): DemoSeedSetters & Record<string, ReturnType<typeof vi.fn>> {
  return {
    setUserProfile: vi.fn(),
    setDailyMacros: vi.fn(),
    setHydration: vi.fn(),
    setMovement: vi.fn(),
    setDailyGoal: vi.fn(),
    setDailyLog: vi.fn(),
    setFoodHistory: vi.fn(),
    setWeightHistory: vi.fn(),
    setNutritionHistory: vi.fn(),
    setRealFeelLogs: vi.fn(),
    setSavedRecipes: vi.fn(),
    setMealPlan: vi.fn(),
    setShoppingList: vi.fn(),
    setCommunityPosts: vi.fn(),
    setCommunityStories: vi.fn(),
    setToleranceLogs: vi.fn(),
  };
}

describe('createHandleLoadDemoSeed', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('calls every setter exactly once with the bundle payload', async () => {
    const setters = makeSetters();
    await createHandleLoadDemoSeed(setters)();

    for (const key of Object.keys(setters)) {
      expect(setters[key]).toHaveBeenCalledTimes(1);
    }
  });

  it('writes weeklyCheckIns to the unprefixed localStorage key (not rial_weeklyCheckIns)', async () => {
    const setters = makeSetters();
    await createHandleLoadDemoSeed(setters)();

    // This is the regression that the earlier handler was missing — it wrote
    // `rial_weeklyCheckIns`, which the WeeklyCheckIn screen never read.
    expect(window.localStorage.getItem('weeklyCheckIns')).toBe(
      JSON.stringify([{ id: 'w1', week: 1 }]),
    );
    expect(window.localStorage.getItem('rial_weeklyCheckIns')).toBeNull();
  });

  it('does not write the orphan rial_demoSeedVersion key', async () => {
    const setters = makeSetters();
    await createHandleLoadDemoSeed(setters)();

    // Pre-fix the handler wrote `rial_demoSeedVersion` but nothing ever
    // read it — dropped as dead code.
    expect(window.localStorage.getItem('rial_demoSeedVersion')).toBeNull();
  });
});

describe('createHandleClearDemoSeed', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('resets every setter to a neutral default', () => {
    const setters = makeSetters();
    createHandleClearDemoSeed(setters)();

    for (const key of Object.keys(setters)) {
      expect(setters[key]).toHaveBeenCalledTimes(1);
    }
    // Collection setters are called with [] / {}.
    expect(setters.setDailyLog).toHaveBeenCalledWith([]);
    expect(setters.setSavedRecipes).toHaveBeenCalledWith([]);
    expect(setters.setMealPlan).toHaveBeenCalledWith({});
  });

  it('removes every rial_seedVersion_<key> marker — the actual bug fix', () => {
    // Simulate a user who already has seed-version markers stamped (normal
    // state after AppStateContext has run its seed useEffects).
    for (const key of ALL_SEED_KEYS) {
      setStoredSeedVersion(key);
      expect(window.localStorage.getItem(__internal.VERSION_STORAGE_KEY(key))).not.toBeNull();
    }

    const setters = makeSetters();
    createHandleClearDemoSeed(setters)();

    for (const key of ALL_SEED_KEYS) {
      expect(
        window.localStorage.getItem(__internal.VERSION_STORAGE_KEY(key)),
        `marker for "${key}" should be cleared so shouldReseed fires on reload`,
      ).toBeNull();
    }
  });

  it('removes the unprefixed weeklyCheckIns slot populated by the load path', () => {
    window.localStorage.setItem('weeklyCheckIns', JSON.stringify([{ id: 'old' }]));
    const setters = makeSetters();
    createHandleClearDemoSeed(setters)();

    expect(window.localStorage.getItem('weeklyCheckIns')).toBeNull();
  });

  it('does not touch unrelated localStorage keys (auth, prefs)', () => {
    window.localStorage.setItem('sb-auth-token', 'dont-wipe-me');
    window.localStorage.setItem('rial_theme', 'dark');
    window.localStorage.setItem('rial_recipeViewed', '1');

    const setters = makeSetters();
    createHandleClearDemoSeed(setters)();

    expect(window.localStorage.getItem('sb-auth-token')).toBe('dont-wipe-me');
    expect(window.localStorage.getItem('rial_theme')).toBe('dark');
    expect(window.localStorage.getItem('rial_recipeViewed')).toBe('1');
  });
});
