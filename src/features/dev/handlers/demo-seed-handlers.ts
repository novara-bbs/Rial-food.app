import { buildDemoSeed } from '../data/demo-seed';
import { ALL_SEED_KEYS, clearSeed } from '../../../lib/seedVersion';

/**
 * Dev handlers for loading and clearing the Demo Rial seed.
 *
 * Implementation rationale:
 *  - Setters are React state; we call them in one pass so consumers re-render
 *    against the final consistent snapshot instead of intermediate partials.
 *  - `clearDemoSeed` resets React state to neutral defaults and clears the
 *    seed-version markers (`rial_seedVersion_<key>`) for every key in
 *    `ALL_SEED_KEYS`. Without that, `shouldReseed` would see matching
 *    versions on reload and leave the user with empty seeded slots.
 *  - `weeklyCheckIns` is written directly here because no setter is wired
 *    through AppStateContext — WeeklyCheckIn owns its own `useLocalStorageState`.
 *    `useLocalStorageState` stores keys as-is (no `rial_` prefix), so we
 *    write the plain `weeklyCheckIns` key.
 */

export interface DemoSeedSetters {
  setUserProfile: (v: any) => void;
  setDailyMacros: (v: any) => void;
  setHydration: (v: any) => void;
  setMovement: (v: any) => void;
  setDailyGoal: (v: any) => void;
  setDailyLog: (v: any) => void;
  setFoodHistory: (v: any) => void;
  setWeightHistory: (v: any) => void;
  setNutritionHistory: (v: any) => void;
  setRealFeelLogs: (v: any) => void;
  setSavedRecipes: (v: any) => void;
  setMealPlan: (v: any) => void;
  setShoppingList: (v: any) => void;
  setCommunityPosts: (v: any) => void;
  setCommunityStories: (v: any) => void;
  setToleranceLogs: (v: any) => void;
}

export function createHandleLoadDemoSeed(setters: DemoSeedSetters) {
  return async (): Promise<void> => {
    const seed = await buildDemoSeed();
    setters.setUserProfile(seed.userProfile);
    setters.setDailyMacros(seed.dailyMacros);
    setters.setHydration(seed.hydration);
    setters.setMovement(seed.movement);
    setters.setDailyGoal(seed.dailyGoal);
    setters.setDailyLog(seed.dailyLog);
    setters.setFoodHistory(seed.foodHistory);
    setters.setWeightHistory(seed.weightHistory);
    setters.setNutritionHistory(seed.nutritionHistory);
    setters.setRealFeelLogs(seed.realFeelLogs);
    setters.setSavedRecipes(seed.savedRecipes);
    setters.setMealPlan(seed.mealPlan);
    setters.setShoppingList(seed.shoppingList);
    setters.setCommunityPosts(seed.communityPosts);
    setters.setCommunityStories(seed.communityStories);
    setters.setToleranceLogs(seed.toleranceLogs);

    // Weekly check-ins have no AppStateContext setter. `useLocalStorageState`
    // stores keys unprefixed, so write to `weeklyCheckIns` directly.
    try {
      window.localStorage.setItem('weeklyCheckIns', JSON.stringify(seed.weeklyCheckIns));
    } catch {
      // ignore
    }
  };
}

export function createHandleClearDemoSeed(setters: DemoSeedSetters) {
  return (): void => {
    // Reset React state in-memory to defaults that won't persist garbage.
    setters.setUserProfile({
      name: '',
      age: 32,
      height: 175,
      weight: 78,
      gender: 'female',
      goal: 'maintain',
      activity: 'active',
      trains: false,
      dietaryPreferences: [],
    });
    setters.setDailyMacros({
      consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
      target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
    });
    setters.setHydration({ consumed: 0, target: 10 });
    setters.setMovement({ steps: 0, target: 10000, activeMinutes: 0, activeTarget: 45 });
    setters.setDailyGoal('');
    setters.setDailyLog([]);
    setters.setFoodHistory([]);
    setters.setWeightHistory([]);
    setters.setNutritionHistory([]);
    setters.setRealFeelLogs([]);
    setters.setSavedRecipes([]);
    setters.setMealPlan({});
    setters.setShoppingList([]);
    setters.setCommunityPosts([]);
    setters.setCommunityStories([]);
    setters.setToleranceLogs([]);

    // Clear the seed-version markers so `shouldReseed` fires again on next
    // mount. `clearSeed` also removes the data key itself — the React
    // setters above will re-persist `[]`/`{}` defaults via useEffect, but
    // the missing version marker is what makes `shouldReseed` return true
    // on reload (stored < current). Also wipes the direct-write
    // `weeklyCheckIns` slot which has no setter path.
    try {
      for (const seedKey of ALL_SEED_KEYS) {
        clearSeed(seedKey, seedKey);
      }
    } catch {
      // ignore
    }
  };
}
