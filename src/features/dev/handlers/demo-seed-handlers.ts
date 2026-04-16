import { buildDemoSeed, DEMO_SEED_KEYS } from '../data/demo-seed';

/**
 * Dev handlers for loading and clearing the Demo Rial seed.
 *
 * Implementation rationale:
 *  - Setters are React state; we call them in one pass so consumers re-render
 *    against the final consistent snapshot instead of intermediate partials.
 *  - `clearDemoSeed` removes ONLY the `rial_*` keys the demo writes. Auth,
 *    sync flags, and unrelated prefs stay intact.
 *  - `rial_demoSeedVersion` is written so future versions can hot-swap without
 *    pushing stale data back.
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

    // Weekly check-ins + demoSeedVersion are written directly to localStorage
    // because they're not exposed via AppStateContext setters.
    try {
      window.localStorage.setItem('rial_weeklyCheckIns', JSON.stringify(seed.weeklyCheckIns));
      window.localStorage.setItem('rial_demoSeedVersion', String(seed.version));
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

    // Clear any demo-owned localStorage keys that don't have setters wired.
    try {
      for (const key of DEMO_SEED_KEYS) {
        window.localStorage.removeItem(`rial_${key}`);
      }
      window.localStorage.removeItem('rial_weeklyCheckIns');
    } catch {
      // ignore
    }
  };
}
