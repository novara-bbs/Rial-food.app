/**
 * Demo Rial — orchestrator. Exports a single loadDemoSeed() that fills
 * every relevant store with the Clara (ICP Cut) fixture. Reuses existing
 * seed files (recipes, meal plan, shopping, tolerance, posts, stories,
 * creators) and layers the timeline/today/food-history on top.
 *
 * This module is dev-only — the UI gate is in DemoSeedCard, not here.
 */
import { buildDemoTimeline, CLARA_MACROS_TARGET, CLARA_TARGET_KG, type RealFeelLog } from './demo-seed-timeline';
import { buildDemoToday } from './demo-seed-today';
import { buildDemoFoodHistory } from './demo-seed-food-history';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { BodySnapshot, WeeklyCheckInEntry } from '../../../types/wellness';
import type { DailyLogEntry, FoodHistoryEntry } from '../../food/handlers/meal-handlers';
import type { CommunityPost, ProgressPostPayload } from '../../../types/social';

/**
 * Keys that the demo seed writes. Used by `clearDemoSeed` to know exactly
 * what to reset — the rest of localStorage (user prefs, auth, etc.) is left alone.
 */
export const DEMO_SEED_KEYS = [
  'userProfile',
  'dailyMacros',
  'hydration',
  'movement',
  'dailyGoal',
  'dailyLog',
  'foodHistory',
  'weightHistory',
  'nutritionHistory',
  'realFeelLogs',
  'weeklyCheckIns',
  'savedRecipes',
  'mealPlan',
  'shoppingList',
  'communityPosts',
  'communityStories',
  'toleranceLogs',
  'demoSeedVersion',
] as const;

export interface DemoSeedBundle {
  userProfile: {
    name: string;
    age: number;
    height: number;
    weight: number;
    gender: string;
    goal: string;
    activity: string;
    trains: boolean;
    dietaryPreferences: string[];
    unitSystem?: 'metric' | 'imperial';
    targetWeight?: number;
    mode?: 'simple' | 'advanced';
  };
  dailyMacros: { consumed: { cal: number; pro: number; carbs: number; fats: number }; target: { cal: number; pro: number; carbs: number; fats: number } };
  hydration: { consumed: number; target: number };
  movement: { steps: number; target: number; activeMinutes: number; activeTarget: number };
  dailyGoal: string;
  dailyLog: DailyLogEntry[];
  foodHistory: FoodHistoryEntry[];
  weightHistory: BodySnapshot[];
  nutritionHistory: DailyArchive[];
  realFeelLogs: RealFeelLog[];
  weeklyCheckIns: WeeklyCheckInEntry[];
  savedRecipes: unknown[];
  mealPlan: Record<number, unknown[]>;
  shoppingList: unknown[];
  communityPosts: CommunityPost[];
  communityStories: unknown[];
  toleranceLogs: unknown[];
  version: number;
}

const DEMO_SEED_VERSION = 1;

/**
 * Clara's canonical profile. Mirrors the narrative of the timeline
 * (weight already reflects "today" / end of 30 days).
 */
function buildClaraProfile() {
  return {
    name: 'Clara',
    age: 29,
    height: 168,
    weight: 69.1,
    gender: 'female',
    goal: 'cut',
    activity: 'active',
    trains: true,
    dietaryPreferences: [],
    unitSystem: 'metric' as const,
    targetWeight: CLARA_TARGET_KG,
    mode: 'simple' as const,
  };
}

/**
 * Two auto-generated "Clara" posts inside the community feed:
 *  - milestone at day -14 (−1.0 kg)
 *  - snapshot today (full delta + photo)
 */
function buildClaraCommunityPosts(snapshots: BodySnapshot[]): CommunityPost[] {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return [];

  const first = sorted[0];
  const milestoneIdx = sorted.findIndex(s => first.kg - s.kg >= 1);
  const milestoneSnap = milestoneIdx > 0 ? sorted[milestoneIdx] : null;
  const latest = sorted[sorted.length - 1];

  const posts: CommunityPost[] = [];

  if (milestoneSnap) {
    const payload: ProgressPostPayload = {
      kind: 'milestone',
      currentKg: milestoneSnap.kg,
      deltaKg: +(milestoneSnap.kg - first.kg).toFixed(1),
      sinceDate: first.date,
      photoUrl: milestoneSnap.photoUrl,
    };
    posts.push({
      id: Date.now() - 86_400_000 * 14,
      author: {
        id: 'self',
        name: 'Clara',
        img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
        role: 'Miembro',
        time: 'Hace 2 semanas',
      },
      content: 'Primer kilo abajo! 🎉 Cenas ligeras + entrenos constantes. Sigo.',
      images: [],
      type: 'progress',
      progress: payload,
      hashtags: ['progress', 'cut'],
      likes: 42,
      comments: 6,
      saves: 3,
      commentsList: [
        { id: Date.now() - 86_400_000 * 14 + 1, text: 'Vamos Clara!!', author: 'Laura M.', time: 'Hace 2 semanas' },
      ],
      createdAt: new Date(Date.now() - 86_400_000 * 14).toISOString(),
    });
  }

  const latestPayload: ProgressPostPayload = {
    kind: 'snapshot',
    currentKg: latest.kg,
    deltaKg: +(latest.kg - first.kg).toFixed(1),
    sinceDate: first.date,
    photoUrl: latest.photoUrl,
  };
  posts.push({
    id: Date.now(),
    author: {
      id: 'self',
      name: 'Clara',
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      role: 'Miembro',
      time: 'Justo ahora',
    },
    content: '30 días, −3.3 kg. Me fío del proceso, no de la báscula diaria.',
    images: [],
    type: 'progress',
    progress: latestPayload,
    hashtags: ['progress', 'cut', 'realfood'],
    likes: 18,
    comments: 2,
    saves: 1,
    commentsList: [],
    createdAt: new Date().toISOString(),
  });

  return posts;
}

/**
 * Build the full Clara bundle. Pure data — does not touch localStorage or React state.
 * Loads base seeds (recipes, meal plan, shopping, tolerance, posts, stories) via
 * dynamic import to stay aligned with the lazy-loading pattern in AppStateContext.
 */
export async function buildDemoSeed(): Promise<DemoSeedBundle> {
  const [recipesMod, mealPlanMod, shoppingMod, toleranceMod, postsMod, storiesMod] = await Promise.all([
    import('../../food/data/seed-recipes'),
    import('../../planner/data/seed-meal-plan'),
    import('../../planner/data/seed-shopping'),
    import('../../wellness/data/seed-tolerance'),
    import('../../social/data/seed-posts'),
    import('../../social/data/seed-stories'),
  ]);

  const { history, snapshots, realFeelLogs, weeklyCheckIns } = buildDemoTimeline();
  const today = buildDemoToday();
  const foodHistory = buildDemoFoodHistory();
  const claraPosts = buildClaraCommunityPosts(snapshots);

  return {
    userProfile: buildClaraProfile(),
    dailyMacros: { consumed: today.consumed, target: today.target },
    hydration: today.hydration,
    movement: today.movement,
    dailyGoal: today.dailyGoal,
    dailyLog: today.dailyLog,
    foodHistory,
    weightHistory: snapshots,
    nutritionHistory: history,
    realFeelLogs,
    weeklyCheckIns,
    savedRecipes: recipesMod.SEED_RECIPES,
    mealPlan: mealPlanMod.SEED_MEAL_PLAN,
    shoppingList: shoppingMod.SEED_SHOPPING_LIST,
    toleranceLogs: toleranceMod.SEED_TOLERANCE_LOGS,
    communityPosts: [...claraPosts, ...postsMod.SEED_POSTS],
    communityStories: storiesMod.SEED_STORIES,
    version: DEMO_SEED_VERSION,
  };
}

export { CLARA_MACROS_TARGET, CLARA_TARGET_KG };
