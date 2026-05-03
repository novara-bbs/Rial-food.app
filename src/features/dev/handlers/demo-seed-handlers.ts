// NOTE: demo-seed data is dynamically imported inside createHandleLoadDemoSeed
// so Vite code-splits it out of the main bundle. The data chunk is only fetched
// when the "Load Demo" button is actually pressed (dev-only path). [Sprint 33]
import { ALL_SEED_KEYS, clearSeed } from '../../../lib/seedVersion';
import type { Recipe } from '../../../types/recipe';
import type { UserProfile } from '../../../types/user';
import type { CommunityPost, Story } from '../../../types/social';
import type { ToleranceLog, StoredRealFeelEntry, BodySnapshot } from '../../../types/wellness';
import type { ShoppingItem } from '../../../types/planner';
import type { DailyLogEntry, FoodHistoryEntry } from '../../food/handlers/meal-handlers';
import type { DailyMacros } from '../../../contexts/state/useVitalsState';
import type { DailyArchive } from '../../../hooks/useDailyReset';

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

// ─── Hydration / Movement shapes (matches useVitalsState defaults) ─────────────

interface HydrationState { consumed: number; target: number }
interface MovementState { steps: number; target: number; activeMinutes: number; activeTarget: number; workoutMinutes: number }

// ─── DemoSeedSetters ──────────────────────────────────────────────────────────

export interface DemoSeedSetters {
  setUserProfile: (v: UserProfile) => void;
  setDailyMacros: (v: DailyMacros) => void;
  setHydration: (v: HydrationState) => void;
  setMovement: (v: MovementState) => void;
  setDailyGoal: (v: string) => void;
  setDailyLog: (v: DailyLogEntry[]) => void;
  setFoodHistory: (v: FoodHistoryEntry[]) => void;
  setWeightHistory: (v: BodySnapshot[]) => void;
  setNutritionHistory: (v: DailyArchive[]) => void;
  setRealFeelLogs: (v: StoredRealFeelEntry[]) => void;
  setSavedRecipes: (v: Recipe[]) => void;
  setMealPlan: (v: Record<number, Recipe[]>) => void;
  setShoppingList: (v: ShoppingItem[]) => void;
  setCommunityPosts: (v: CommunityPost[]) => void;
  setCommunityStories: (v: Story[]) => void;
  setToleranceLogs: (v: ToleranceLog[]) => void;
}

// ─── createHandleLoadDemoSeed ─────────────────────────────────────────────────

export function createHandleLoadDemoSeed(setters: DemoSeedSetters) {
  return async (): Promise<void> => {
    const { buildDemoSeed } = await import('../data/demo-seed');
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

// ─── createHandleClearDemoSeed ────────────────────────────────────────────────

export function createHandleClearDemoSeed(setters: DemoSeedSetters) {
  return (): void => {
    // Reset React state in-memory to defaults that won't persist garbage.
    setters.setUserProfile({
      name: '',
      age: 32,
      height: 175,
      weight: 78,
      sex: 'female',
      goal: 'maintain',
      activity: 'active',
      trains: false,
      dietaryPreferences: [],
    } as UserProfile);
    setters.setDailyMacros({
      consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
      target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
    });
    setters.setHydration({ consumed: 0, target: 10 });
    setters.setMovement({ steps: 0, target: 10000, activeMinutes: 0, activeTarget: 45, workoutMinutes: 0 });
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
