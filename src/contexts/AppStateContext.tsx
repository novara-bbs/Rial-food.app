import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Recipe, DailyCheckIn as DailyCheckInType, Ingredient } from '../types';
import type { FoodVariant } from '../types/food-family';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { useDailyReset, DailyArchive } from '../hooks/useDailyReset';
import { useNavigation } from './NavigationContext';
import { Allergen } from '../types';
import { createHandleLogMeal, createHandleLogMealNow, DailyLogEntry, FoodHistoryEntry } from '../features/food/handlers/meal-handlers';
import { useI18n } from '../i18n';
import { createHandleSaveRecipe, createHandleAddToPlan, createHandleCreateRecipeSubmit, createHandleImportRecipe, createHandleDeleteRecipe, createHandleDuplicateRecipe, createHandleMarkAsCooked } from '../features/recipes/handlers/recipe-handlers';
import { createHandleCreatePost, createHandleAddComment } from '../features/social/handlers/social-handlers';
import { createHandlePublishStory, createHandleMarkStoryViewed } from '../features/social/handlers/story-handlers';
import { createHandleFollowCreator } from '../features/social/handlers/creator-handlers';
import {
  createHandleJoinChallenge,
  createHandleLeaveChallenge,
  createHandleCheckInChallenge,
  createHandleToggleChallenge,
  type ChallengeProgress,
} from '../features/social/handlers/challenge-handlers';
import type { Story, StorySlide, Notification as NotificationType, SocialLinks } from '../types/social';
import { createHandleAddToleranceLog, createHandleRealFeelLog, createHandleCheckIn, createHandleCompleteCheckIn } from '../features/wellness/handlers/wellness-handlers';
import { createHandleLogWeight, createHandleUpdateSnapshot, createHandleDeleteSnapshot, type LogWeightArgs } from '../features/wellness/handlers/weight-handlers';
import { createHandleShareProgress } from '../features/wellness/handlers/progress-share-handlers';
import { createHandleLoadDemoSeed, createHandleClearDemoSeed } from '../features/dev/handlers/demo-seed-handlers';
import { shouldReseed, setStoredSeedVersion } from '../lib/seedVersion';
import { getRecipeSlots } from '../features/recipes/utils/meal-slot';
import { ingredientIdToFamilyVariant } from '../features/food/utils/food-family-resolver';
import { logger } from '../lib/logger';
import type { BodySnapshot } from '../types/wellness';
import type { CommunityPost } from '../types/social';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppStateContextType {
  // Profile & session
  isPro: boolean;
  setIsPro: (v: boolean) => void;
  showAIBot: boolean;
  setShowAIBot: (v: boolean) => void;
  isFirstTime: boolean;
  setIsFirstTime: (v: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (v: UserProfile) => void;

  // Macros & vitals
  dailyMacros: DailyMacros;
  setDailyMacros: (v: DailyMacros | ((prev: DailyMacros) => DailyMacros)) => void;
  hydration: { consumed: number; target: number };
  setHydration: (v: any) => void;
  movement: { steps: number; target: number; activeMinutes: number; activeTarget: number };
  setMovement: (v: any) => void;
  dailyGoal: string;
  setDailyGoal: (v: string) => void;

  // Content
  savedRecipes: Recipe[];
  setSavedRecipes: (v: any) => void;
  mealPlan: Record<number, any[]>;
  setMealPlan: (v: any) => void;
  shoppingList: ShoppingItem[];
  setShoppingList: (v: any) => void;
  communityPosts: any[];
  setCommunityPosts: (v: any) => void;
  toleranceLogs: any[];
  setToleranceLogs: (v: any) => void;
  realFeelLogs: any[];
  setRealFeelLogs: (v: any) => void;

  // Check-in
  checkInStatus: DailyCheckInType | null;
  setCheckInStatus: (v: any) => void;

  // User foods (scanned / custom) — legacy flat list kept for backward-compat
  userFoods: Ingredient[];
  addUserFood: (food: Ingredient) => void;

  // User variants — scanned brand/product variants stored under a FoodFamily.
  // Separate from legacy `userFoods` so flat-ingredient consumers are untouched.
  userVariants: FoodVariant[];
  addUserVariant: (variant: FoodVariant) => void;
  updateUserVariant: (id: string, updates: Partial<Pick<FoodVariant, 'brand' | 'macros'>>) => void;
  removeUserVariant: (id: string) => void;
  /** barcode → variantId index (seed-matched + user-saved). Enables instant re-recognition. */
  userVariantBarcodes: Record<string, string>;
  addVariantBarcode: (barcode: string, variantId: string) => void;
  /** Unified variant pool: FOOD_VARIANTS (seed) + userVariants. Pass to matchFamilyForScan / searchFamilies. */
  mergedVariants: FoodVariant[];

  // Daily food diary log
  dailyLog: DailyLogEntry[];
  setDailyLog: (v: any) => void;

  // Food history & favorites (persistent across days)
  foodHistory: FoodHistoryEntry[];
  setFoodHistory: (v: any) => void;
  favoriteIds: string[];
  toggleFavorite: (foodId: string) => void;

  // Weight & history
  weightHistory: BodySnapshot[];
  setWeightHistory: (v: any) => void;
  nutritionHistory: DailyArchive[];
  setNutritionHistory: (v: any) => void;

  // Misc
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (v: Recipe | null) => void;
  targetPlanDay: number | null;
  setTargetPlanDay: (v: number | null) => void;
  /** Transient flag: when true, AddMeal opens the barcode scanner on mount (reset after consume). */
  openScannerOnAddMeal: boolean;
  setOpenScannerOnAddMeal: (v: boolean) => void;
  /** Transient: authorId the user tapped in StoryRingsRow — consumed by StoryViewer to set initial story. */
  selectedStoryAuthorId: string | null;
  setSelectedStoryAuthorId: (id: string | null) => void;
  dictionary: Ingredient[];

  // Social / creator profile
  selectedCreatorId: string | null;
  setSelectedCreatorId: (id: string | null) => void;
  selectedPostId: number | null;
  setSelectedPostId: (id: number | null) => void;
  likedPosts: number[];
  toggleLikePost: (postId: number) => void;
  savedPosts: number[];
  toggleSavePost: (postId: number) => void;
  communityStories: Story[];
  setCommunityStories: (fn: any) => void;
  handlePublishStory: (slides: StorySlide[]) => void;
  handleMarkStoryViewed: (storyId: string) => void;
  notifications: import('../types/social').Notification[];
  markAllNotificationsRead: () => void;
  markNotificationRead: (notificationId: string) => void;
  selectedChallengeId: string | null;
  setSelectedChallengeId: (id: string | null) => void;

  // Social graph — single writer via factory handler (replaces 5 inline
  // useLocalStorageState declarations across Discover/CreatorProfile/Community/
  // Challenges/ChallengeDetail/CreatorVerification). Wave 3.
  followedCreators: string[];
  handleFollowCreator: (creatorId: string) => { followed: boolean };
  joinedChallenges: string[];
  challengeJoinDates: Record<string, string>;
  challengeProgress: Record<string, ChallengeProgress>;
  handleJoinChallenge: (challengeId: string) => void;
  handleLeaveChallenge: (challengeId: string) => void;
  handleCheckInChallenge: (challengeId: string) => { alreadyCheckedIn: boolean };
  handleToggleChallenge: (challengeId: string) => void;

  // Handlers
  handleLogMeal: (meal: any) => void;
  handleLogMealNow: (meal: any, servings: number) => void;
  handleSaveRecipe: (recipe: any) => void;
  handleCreatePost: (content: string, performance?: any, options?: { images?: string[]; recipe?: any; hashtags?: string[] }) => void;
  handleAddComment: (postId: number, commentText: string) => void;
  handleAddToleranceLog: (log: any) => void;
  handleCreateRecipeSubmit: (recipe: any) => void;
  handleRealFeelLog: (entry: any) => void;
  handleImportRecipe: (recipe: any) => void;
  handleAddToPlan: (recipe: any, dayIndex: number) => void;
  handleCheckIn: (status?: string) => void;
  handleCompleteCheckIn: (data: any) => void;
  handleDeleteRecipe: (recipeId: any) => void;
  handleDuplicateRecipe: (recipe: any) => void;
  handleMarkAsCooked: (recipe: any) => void;
  handleLogWeight: (args: LogWeightArgs) => { replaced: boolean };
  handleUpdateSnapshot: (args: { date: string; photoUrl?: string; measurements?: import('../types/wellness').BodyMeasurements }) => void;
  handleDeleteSnapshot: (date: string) => void;
  handleShareProgress: (args: {
    snapshot: BodySnapshot;
    referenceSnapshot?: BodySnapshot;
    content: string;
    kind?: 'snapshot' | 'milestone';
    author?: { id?: string; name?: string; img?: string; role?: string };
  }) => CommunityPost;
  handleLoadDemoSeed: () => Promise<void>;
  handleClearDemoSeed: () => void;
  navigateToRecipe: (recipe: any) => void;
  recipeToEdit: any;
  setRecipeToEdit: (recipe: any) => void;
}

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  goal: string;
  activityLevel?: string;
}

interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  goal: string;
  activity: string;
  trains: boolean;
  dietaryPreferences: string[];
  /** 'metric' (g/ml) or 'imperial' (oz/fl oz). Default: metric */
  unitSystem?: 'metric' | 'imperial';
  /** Ingredient IDs the user dislikes */
  foodDislikes?: string[];
  /** Declared food intolerances/allergies */
  intolerances?: Allergen[];
  /** Short bio for creator profile */
  bio?: string;
  /** Social media links for creator profile */
  socialLinks?: SocialLinks;
  /** Target weight in kg — for goal tracking */
  targetWeight?: number;
  /** Family members for meal scaling */
  family?: FamilyMember[];
  /** Dashboard display mode */
  mode?: 'simple' | 'advanced';
  /** Avatar URL */
  avatar?: string;
}

interface DailyMacros {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
}

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  checked: boolean;
}

// Body-state types defined in src/types/wellness.ts
export type { BodySnapshot, BodyMeasurements } from '../types/wellness';

// ─── Context ─────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { navigateTo, previousScreen } = useNavigation();
  const { t } = useI18n();

  // UI state (not persisted)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [targetPlanDay, setTargetPlanDay] = useState<number | null>(null);
  const [openScannerOnAddMeal, setOpenScannerOnAddMeal] = useState<boolean>(false);
  const [selectedStoryAuthorId, setSelectedStoryAuthorId] = useState<string | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useLocalStorageState<number[]>('likedPosts', []);
  const [savedPosts, setSavedPosts] = useLocalStorageState<number[]>('savedPosts', []);

  // Toggle handlers are declared further down, after `setCommunityPosts` is
  // bound, so the callback closure captures the correct setter.

  // Persisted state
  const [isPro, setIsPro] = useLocalStorageState<boolean>('isPro', false);
  const [showAIBot, setShowAIBot] = useLocalStorageState<boolean>('showAIBot', true);
  const [isFirstTime, setIsFirstTime] = useLocalStorageState<boolean>('isFirstTime', true);
  const [checkInStatus, setCheckInStatus] = useLocalStorageState<DailyCheckInType | null>('checkInStatus', null);

  const [userProfile, setUserProfile] = useLocalStorageState<UserProfile>('userProfile', {
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

  // Fresh-install starts at zero — the hardcoded 840 cal / 45 g pro default used
  // to show as if the user had already eaten before ever logging anything.
  // "Lo que ves es lo que has hecho" → zeros for consumed, zeros for intake.
  const [dailyMacros, setDailyMacros] = useLocalStorageState<DailyMacros>('dailyMacros', {
    consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 },
    target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
  });

  const [hydration, setHydration] = useLocalStorageState('hydration', { consumed: 0, target: 10 });

  const [movement, setMovement] = useLocalStorageState('movement', {
    steps: 0,
    target: 10000,
    activeMinutes: 0,
    activeTarget: 45,
  });

  const [dailyGoal, setDailyGoal] = useLocalStorageState('dailyGoal', '');

  // User-created / scanned foods
  const [userFoods, setUserFoods] = useLocalStorageState<Ingredient[]>('userFoods', []);

  const addUserFood = useCallback((food: Ingredient) => {
    setUserFoods((prev: Ingredient[]) => {
      // Avoid duplicates by id
      if (prev.some(f => f.id === food.id)) return prev;
      return [food, ...prev];
    });
    toast.success(t.mealToasts.foodSaved);
  }, [setUserFoods, t]);

  // User variants: brand/product FoodVariants stored under a FoodFamily.
  // New localStorage key — no seedVersion bump (user-only data, no seed to merge).
  const [userVariants, setUserVariants] = useLocalStorageState<FoodVariant[]>('userVariants', []);
  const [userVariantBarcodes, setUserVariantBarcodes] = useLocalStorageState<Record<string, string>>('userVariantBarcodes', {});

  const addUserVariant = useCallback((variant: FoodVariant) => {
    setUserVariants((prev: FoodVariant[]) => {
      if (prev.some(v => v.id === variant.id)) return prev;
      return [variant, ...prev];
    });
    toast.success(t.mealToasts.foodSaved);
  }, [setUserVariants, t]);

  const updateUserVariant = useCallback((id: string, updates: Partial<Pick<FoodVariant, 'brand' | 'macros'>>) => {
    setUserVariants((prev: FoodVariant[]) =>
      prev.map(v => v.id === id ? { ...v, ...updates } : v),
    );
  }, [setUserVariants]);

  const removeUserVariant = useCallback((id: string) => {
    setUserVariants((prev: FoodVariant[]) => prev.filter(v => v.id !== id));
    setUserVariantBarcodes((prev: Record<string, string>) => {
      const next = { ...prev };
      Object.keys(next).forEach(barcode => {
        if (next[barcode] === id) delete next[barcode];
      });
      return next;
    });
  }, [setUserVariants, setUserVariantBarcodes]);

  const addVariantBarcode = useCallback((barcode: string, variantId: string) => {
    setUserVariantBarcodes((prev: Record<string, string>) => ({ ...prev, [barcode]: variantId }));
  }, [setUserVariantBarcodes]);

  // Ingredient dictionary (lazy-loaded to keep ~90KB out of the initial bundle)
  const [baseDictionary, setBaseDictionary] = useState<Ingredient[]>([]);
  useEffect(() => {
    let cancelled = false;
    import('../features/food/data/ingredients').then((m) => {
      if (!cancelled) setBaseDictionary(m.INGREDIENT_DICTIONARY);
    });
    return () => { cancelled = true; };
  }, []);

  const mergedDictionary = useMemo(
    () => [...baseDictionary, ...userFoods],
    [baseDictionary, userFoods],
  );

  // Seed FoodVariants — lazy-loaded from food-variants.ts to keep them out of
  // the initial bundle (same pattern as baseDictionary above).
  const [baseFoodVariants, setBaseFoodVariants] = useState<FoodVariant[]>([]);
  useEffect(() => {
    let cancelled = false;
    import('../features/food/data/food-variants').then((m) => {
      if (!cancelled) setBaseFoodVariants(m.FOOD_VARIANTS as FoodVariant[]);
    }).catch((err) => logger.warn('food-variants lazy load failed', { err }));
    return () => { cancelled = true; };
  }, []);

  /** Unified variant pool used by matchFamilyForScan + searchFamilies (P5/P3). */
  const mergedVariants = useMemo<FoodVariant[]>(
    () => [...baseFoodVariants, ...userVariants],
    [baseFoodVariants, userVariants],
  );

  // Seeded content — all lazy-loaded on first mount via `shouldReseed()`.
  // The presence-only guard used before meant bumps to a seed file never
  // reached users who had visited a previous deploy (their localStorage
  // already had the old array, so the import was skipped forever). Now
  // each key has a version in `src/lib/seedVersion.ts`; bumping it causes
  // existing users to re-hydrate on next mount.
  //
  // Three merge strategies — chosen per key by data nature:
  //   • preserve-user   — dedup by `id`, keep items where publishedBy==='self'
  //                       or tag==='IMPORTADA', replace rest with fresh seed.
  //                       Only `savedRecipes` (mixed user/demo content).
  //   • preserve-if-nonempty — if user already has data, don't touch it;
  //                       only re-seed an empty slot. For transactional logs
  //                       and the meal plan.
  //   • replace         — overwrite completely. For demo-only content
  //                       (communityPosts, communityStories).
  //
  // Functional setter guards still protect against the race where a user
  // write lands between `shouldReseed()` and the async `.then()`.
  // `.catch()` is added so a failed chunk (network flake, CDN edge issue)
  // surfaces in DevTools instead of disappearing silently.
  const [savedRecipes, setSavedRecipes] = useLocalStorageState<any[]>('savedRecipes', []);
  useEffect(() => {
    if (!shouldReseed('savedRecipes', 'savedRecipes')) return;
    import('../features/food/data/seed-recipes')
      .then((m) => {
        // preserve-user: keep user-created + imported recipes; replace the rest.
        setSavedRecipes((prev: any[]) => {
          if (prev.length === 0) return m.SEED_RECIPES;
          const userOwned = prev.filter(
            (r) => r && (r.publishedBy === 'self' || r.tag === 'IMPORTADA'),
          );
          const userIds = new Set(userOwned.map((r) => r.id));
          const seedFresh = m.SEED_RECIPES.filter((r: any) => !userIds.has(r.id));
          return [...userOwned, ...seedFresh];
        });
        setStoredSeedVersion('savedRecipes');
      })
      .catch((err) => logger.warn('seed.savedRecipes load failed', { err }));
  }, []);

  // Q19 meal-taxonomy: one-shot idempotent migration. Normalises any surviving
  // legacy `mealType` string into the canonical `suitableFor: MealSlot[]`
  // shape so storage isn't hybrid forever. Idempotent — skips when every
  // recipe already matches the target shape.
  useEffect(() => {
    setSavedRecipes((prev: any[]) => {
      if (!prev.length) return prev;
      const needsMigration = prev.some(
        (r) => r && r.mealType && (!r.suitableFor || r.suitableFor.length === 0),
      );
      if (!needsMigration) return prev;
      return prev.map((r) => {
        if (!r || r.suitableFor?.length) return r;
        const slots = getRecipeSlots(r);
        if (!slots) return r;
        const { mealType: _legacy, ...rest } = r;
        return { ...rest, suitableFor: slots };
      });
    });
  }, []);

  // P4.4 — RecipeIngredient hydration: for legacy `ingredientId`-only entries
  // that lack `familyId`, populate `familyId` (and `variantId`) in memory so
  // `resolveRecipeIngredient()` can resolve them via the new dual-schema path.
  // This does NOT rewrite localStorage — it is an in-memory projection only.
  // A future seedVersion bump + eager migration will persist the change.
  // Idempotent: skips recipes where every ingredient already has `familyId`.
  useEffect(() => {
    setSavedRecipes((prev: any[]) => {
      if (!prev.length) return prev;
      const needsMigration = prev.some((r: any) =>
        r?.recipeIngredients?.some((ri: any) => !ri.familyId && ri.ingredientId),
      );
      if (!needsMigration) return prev;
      return prev.map((r: any) => {
        if (!r?.recipeIngredients) return r;
        const migratedRIs = r.recipeIngredients.map((ri: any) => {
          if (ri.familyId || !ri.ingredientId) return ri;
          const mapped = ingredientIdToFamilyVariant(ri.ingredientId);
          if (!mapped) return ri;
          return { ...ri, familyId: mapped.familyId, variantId: mapped.variantId };
        });
        return { ...r, recipeIngredients: migratedRIs };
      });
    });
  }, []);

  const [mealPlan, setMealPlan] = useLocalStorageState<Record<number, any[]>>('mealPlan', {});
  useEffect(() => {
    if (!shouldReseed('mealPlan', 'mealPlan')) return;
    import('../features/planner/data/seed-meal-plan')
      .then((m) => {
        // preserve-if-nonempty: user's existing plan is sacred.
        setMealPlan((prev: Record<number, any[]>) =>
          Object.keys(prev).length === 0 ? m.SEED_MEAL_PLAN : prev,
        );
        setStoredSeedVersion('mealPlan');
      })
      .catch((err) => logger.warn('seed.mealPlan load failed', { err }));
  }, []);

  const [shoppingList, setShoppingList] = useLocalStorageState<ShoppingItem[]>('shoppingList', []);
  useEffect(() => {
    if (!shouldReseed('shoppingList', 'shoppingList')) return;
    import('../features/planner/data/seed-shopping')
      .then((m) => {
        // preserve-if-nonempty: user may have a real list in progress.
        setShoppingList((prev: ShoppingItem[]) =>
          prev.length === 0 ? m.SEED_SHOPPING_LIST : prev,
        );
        setStoredSeedVersion('shoppingList');
      })
      .catch((err) => logger.warn('seed.shoppingList load failed', { err }));
  }, []);

  const [communityPosts, setCommunityPosts] = useLocalStorageState<any[]>('communityPosts', []);
  useEffect(() => {
    if (!shouldReseed('communityPosts', 'communityPosts')) return;
    import('../features/social/data/seed-posts')
      .then((m) => {
        // replace: demo content, Q6 will swap this for backend-sourced posts.
        setCommunityPosts(m.SEED_POSTS);
        setStoredSeedVersion('communityPosts');
      })
      .catch((err) => logger.warn('seed.communityPosts load failed', { err }));
  }, []);

  // Toggles for like/save. Kept id-list for per-user state (cross-device sync +
  // fast lookup) AND mutate canonical `post.likes`/`post.saves` counter on
  // `communityPosts` so PostCard can render the real total. Prior code rendered
  // `post.likes + (isLiked ? 1 : 0)` — cosmetic-only, broke for other-user
  // likes coming from backend at Q6. Declared after `setCommunityPosts` is
  // bound (React captures closure at definition time).
  const toggleLikePost = useCallback((postId: number) => {
    setLikedPosts((prev: number[]) => {
      const willLike = !prev.includes(postId);
      setCommunityPosts((posts: any[]) =>
        posts.map(p => p.id === postId
          ? { ...p, likes: Math.max(0, (p.likes || 0) + (willLike ? 1 : -1)) }
          : p,
        ),
      );
      return willLike ? [...prev, postId] : prev.filter(id => id !== postId);
    });
  }, [setLikedPosts, setCommunityPosts]);

  const toggleSavePost = useCallback((postId: number) => {
    setSavedPosts((prev: number[]) => {
      const willSave = !prev.includes(postId);
      setCommunityPosts((posts: any[]) =>
        posts.map(p => p.id === postId
          ? { ...p, saves: Math.max(0, (p.saves || 0) + (willSave ? 1 : -1)) }
          : p,
        ),
      );
      return willSave ? [...prev, postId] : prev.filter(id => id !== postId);
    });
  }, [setSavedPosts, setCommunityPosts]);

  const [toleranceLogs, setToleranceLogs] = useLocalStorageState<any[]>('toleranceLogs', []);
  useEffect(() => {
    if (!shouldReseed('toleranceLogs', 'toleranceLogs')) return;
    import('../features/wellness/data/seed-tolerance')
      .then((m) => {
        // preserve-if-nonempty: a user's tolerance journal is their record.
        setToleranceLogs((prev: any[]) =>
          prev.length === 0 ? m.SEED_TOLERANCE_LOGS : prev,
        );
        setStoredSeedVersion('toleranceLogs');
      })
      .catch((err) => logger.warn('seed.toleranceLogs load failed', { err }));
  }, []);

  const [realFeelLogs, setRealFeelLogs] = useLocalStorageState<any[]>('realFeelLogs', []);

  // Stories — lazy-seeded
  const [communityStories, setCommunityStories] = useLocalStorageState<Story[]>('communityStories', []);
  useEffect(() => {
    if (!shouldReseed('communityStories', 'communityStories')) return;
    import('../features/social/data/seed-stories')
      .then((m) => {
        // replace: demo content, Q6 will swap for backend-sourced stories.
        setCommunityStories(m.SEED_STORIES);
        setStoredSeedVersion('communityStories');
      })
      .catch((err) => logger.warn('seed.communityStories load failed', { err }));
  }, []);

  // Notifications
  const [notifications, setNotifications] = useLocalStorageState<NotificationType[]>('notifications', []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev: NotificationType[]) => prev.map(n => ({ ...n, read: true })));
  }, [setNotifications]);
  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev: NotificationType[]) =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  }, [setNotifications]);

  // Challenge detail
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // Social graph + challenge persistence — single writer via factory handler.
  // Prior to Wave 3 these were declared inline in each screen
  // (Discover/CreatorProfile/Community/Challenges/ChallengeDetail/
  // CreatorVerification), which caused stale-snapshot bugs: a toggle from
  // Discover wasn't reflected in Community until unmount. Centralising the
  // setters here means every consumer sees the same ref via context.
  const [followedCreators, setFollowedCreators] = useLocalStorageState<string[]>('followedCreators', []);
  const [joinedChallenges, setJoinedChallenges] = useLocalStorageState<string[]>('joinedChallenges', []);
  const [challengeJoinDates, setChallengeJoinDates] = useLocalStorageState<Record<string, string>>('challengeJoinDates', {});
  const [challengeProgress, setChallengeProgress] = useLocalStorageState<Record<string, ChallengeProgress>>('challengeProgress', {});

  // Weight & nutrition history (persistent across days)
  const [weightHistory, setWeightHistory] = useLocalStorageState<BodySnapshot[]>('weightHistory', []);
  const [nutritionHistory, setNutritionHistory] = useLocalStorageState<DailyArchive[]>('nutritionHistory', []);

  // Weight history — lazy-seeded
  useEffect(() => {
    if (!shouldReseed('weightHistory', 'weightHistory')) return;
    import('../features/wellness/data/seed-body-snapshots')
      .then((m) => {
        // preserve-if-nonempty: user's weight history is their record.
        setWeightHistory((prev: BodySnapshot[]) =>
          prev.length === 0 ? m.BODY_SNAPSHOT_SEED : prev,
        );
        setStoredSeedVersion('weightHistory');
      })
      .catch((err) => logger.warn('seed.weightHistory load failed', { err }));
  }, []);

  // Nutrition history — lazy-seeded
  useEffect(() => {
    if (!shouldReseed('nutritionHistory', 'nutritionHistory')) return;
    import('../features/wellness/data/seed-nutrition-history')
      .then((m) => {
        // preserve-if-nonempty: user's daily archive is their record.
        setNutritionHistory((prev: DailyArchive[]) =>
          prev.length === 0 ? m.SEED_NUTRITION_HISTORY : prev,
        );
        setStoredSeedVersion('nutritionHistory');
      })
      .catch((err) => logger.warn('seed.nutritionHistory load failed', { err }));
  }, []);

  // RealFeel logs — lazy-seeded
  useEffect(() => {
    if (!shouldReseed('realFeelLogs', 'realFeelLogs')) return;
    import('../features/wellness/data/seed-real-feel-logs')
      .then((m) => {
        // preserve-if-nonempty: user's mood/feel journal is their record.
        setRealFeelLogs((prev: any[]) =>
          prev.length === 0 ? m.SEED_REAL_FEEL_LOGS : prev,
        );
        setStoredSeedVersion('realFeelLogs');
      })
      .catch((err) => logger.warn('seed.realFeelLogs load failed', { err }));
  }, []);

  // Weekly check-ins — lazy-seeded. Writes directly to localStorage because
  // WeeklyCheckIn screen owns its own `useLocalStorageState('weeklyCheckIns')`;
  // we just pre-populate the slot before the screen mounts.
  useEffect(() => {
    if (!shouldReseed('weeklyCheckIns', 'weeklyCheckIns')) return;
    import('../features/wellness/data/seed-weekly-checkins')
      .then((m) => {
        // preserve-if-nonempty: only seed if no check-ins exist yet. We can't
        // use a React setter here, so read-then-write with JSON.parse guard.
        try {
          const raw = window.localStorage.getItem('weeklyCheckIns');
          const existing = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(existing) || existing.length === 0) {
            window.localStorage.setItem('weeklyCheckIns', JSON.stringify(m.SEED_WEEKLY_CHECKINS));
          }
        } catch {
          window.localStorage.setItem('weeklyCheckIns', JSON.stringify(m.SEED_WEEKLY_CHECKINS));
        }
        setStoredSeedVersion('weeklyCheckIns');
      })
      .catch((err) => logger.warn('seed.weeklyCheckIns load failed', { err }));
  }, []);

  // Daily food diary log (persisted, cleared manually or on new day)
  const [dailyLog, setDailyLog] = useLocalStorageState<DailyLogEntry[]>('dailyLog', []);

  // Persistent food history & favorites (NOT reset daily)
  const [foodHistory, setFoodHistory] = useLocalStorageState<FoodHistoryEntry[]>('foodHistory', []);
  const [favoriteIds, setFavoriteIds] = useLocalStorageState<string[]>('favoriteIds', []);

  const toggleFavorite = useCallback((foodId: string) => {
    setFavoriteIds((prev: string[]) =>
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );
  }, [setFavoriteIds]);

  // Reset daily counters when calendar date changes (midnight rollover)
  useDailyReset({ setDailyLog, setDailyMacros, setHydration, setMovement });

  // ─── Handlers (delegated to feature modules, memoized to prevent re-renders) ──

  const navigateToRecipe = useCallback((recipe: any) => {
    setSelectedRecipe(recipe);
    // Mark the Guided Setup "Explora una receta" step complete (Home.tsx reads this key).
    // useLocalStorageState prefixes with `rial_` — the reader on Home.tsx:250 checks `rial_recipeViewed`.
    try { window.localStorage.setItem('rial_recipeViewed', '1'); } catch { /* private mode */ }
    navigateTo('recipe-detail');
  }, [navigateTo]);

  const handleLogMeal = useMemo(
    () => createHandleLogMeal({ targetPlanDay, setMealPlan, setShoppingList, setTargetPlanDay, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t }),
    [targetPlanDay, setMealPlan, setShoppingList, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t],
  );
  const handleLogMealNow = useMemo(
    () => createHandleLogMealNow({ setDailyMacros, setDailyLog, setFoodHistory, navigateTo, t }),
    [setDailyMacros, setDailyLog, setFoodHistory, navigateTo, t],
  );
  const handleSaveRecipe = useMemo(
    () => createHandleSaveRecipe({ setSavedRecipes, t }),
    [setSavedRecipes, t],
  );
  const handleAddToPlan = useMemo(
    () => createHandleAddToPlan({ setSavedRecipes, setMealPlan, setShoppingList, navigateTo, t }),
    [setSavedRecipes, setMealPlan, setShoppingList, navigateTo, t],
  );
  const handleCreateRecipeSubmit = useMemo(
    () => createHandleCreateRecipeSubmit({ setSavedRecipes, navigateTo, t }),
    [setSavedRecipes, navigateTo, t],
  );
  const handleDeleteRecipe = useMemo(
    () => createHandleDeleteRecipe({ setSavedRecipes, navigateTo, t }),
    [setSavedRecipes, navigateTo, t],
  );
  const handleMarkAsCooked = useMemo(
    () => createHandleMarkAsCooked({ setSavedRecipes, t }),
    [setSavedRecipes, t],
  );
  const handleDuplicateRecipe = useMemo(
    () => createHandleDuplicateRecipe({ setSavedRecipes, navigateTo, t }),
    [setSavedRecipes, navigateTo, t],
  );
  const handleLogWeight = useMemo(
    () => createHandleLogWeight({ setWeightHistory, setUserProfile }),
    [setWeightHistory, setUserProfile],
  );
  const handleUpdateSnapshot = useMemo(
    () => createHandleUpdateSnapshot({ setWeightHistory }),
    [setWeightHistory],
  );
  const handleDeleteSnapshot = useMemo(
    () => createHandleDeleteSnapshot({ setWeightHistory, setUserProfile }),
    [setWeightHistory, setUserProfile],
  );
  const handleImportRecipe = useMemo(
    () => createHandleImportRecipe({ setSavedRecipes, navigateTo, t }),
    [setSavedRecipes, navigateTo, t],
  );
  const [recipeToEdit, setRecipeToEdit] = useState<any>(null);
  // Ref getters so the social/story handlers always see the latest userProfile
  // and translation table without invalidating their identity every render.
  const userProfileRef = useRef(userProfile);
  useEffect(() => { userProfileRef.current = userProfile; }, [userProfile]);
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);
  const getUserProfile = useCallback(() => userProfileRef.current, []);
  const getT = useCallback(() => tRef.current, []);
  const handleCreatePost = useMemo(
    () => createHandleCreatePost({ setCommunityPosts, navigateTo, getUserProfile, getT }),
    [setCommunityPosts, navigateTo, getUserProfile, getT],
  );
  const handlePublishStory = useMemo(
    () => createHandlePublishStory({ setCommunityStories, navigateTo, getUserProfile, getT }),
    [setCommunityStories, navigateTo, getUserProfile, getT],
  );
  const handleMarkStoryViewed = useMemo(
    () => createHandleMarkStoryViewed({ setCommunityStories }),
    [setCommunityStories],
  );
  const handleAddComment = useMemo(
    () => createHandleAddComment({ setCommunityPosts, getUserProfile, getT }),
    [setCommunityPosts, getUserProfile, getT],
  );
  const notifyToast = useCallback((msg: string) => toast.success(msg), []);
  const handleFollowCreator = useMemo(
    () => createHandleFollowCreator({ setFollowedCreators, getT, notify: notifyToast }),
    [setFollowedCreators, getT, notifyToast],
  );
  const handleJoinChallenge = useMemo(
    () => createHandleJoinChallenge({
      setJoinedChallenges,
      setJoinDates: setChallengeJoinDates,
      setChallengeProgress,
      getT,
      notify: notifyToast,
    }),
    [setJoinedChallenges, setChallengeJoinDates, setChallengeProgress, getT, notifyToast],
  );
  const handleLeaveChallenge = useMemo(
    () => createHandleLeaveChallenge({
      setJoinedChallenges,
      setChallengeProgress,
      getT,
      notify: notifyToast,
    }),
    [setJoinedChallenges, setChallengeProgress, getT, notifyToast],
  );
  const handleCheckInChallenge = useMemo(
    () => createHandleCheckInChallenge({ setChallengeProgress, getT, notify: notifyToast }),
    [setChallengeProgress, getT, notifyToast],
  );
  // Wrapper toggle — readlinked to a ref of `joinedChallenges` so the handler
  // always sees the latest list (otherwise toggling right after a join would
  // still see the pre-join snapshot and double-add).
  const joinedChallengesRef = useRef(joinedChallenges);
  useEffect(() => { joinedChallengesRef.current = joinedChallenges; }, [joinedChallenges]);
  const handleToggleChallenge = useMemo(
    () => createHandleToggleChallenge({
      getJoinedChallenges: () => joinedChallengesRef.current,
      handleJoinChallenge,
      handleLeaveChallenge,
    }),
    [handleJoinChallenge, handleLeaveChallenge],
  );
  const handleAddToleranceLog = useMemo(
    () => createHandleAddToleranceLog({ setToleranceLogs, navigateTo }),
    [setToleranceLogs, navigateTo],
  );
  const handleRealFeelLog = useMemo(
    () => createHandleRealFeelLog({ setRealFeelLogs, getDailyLog: () => dailyLog }),
    [setRealFeelLogs, dailyLog],
  );
  const handleCheckIn = useMemo(
    () => createHandleCheckIn({ setCheckInStatus, navigateTo }),
    [setCheckInStatus, navigateTo],
  );
  const handleCompleteCheckIn = useMemo(
    () => createHandleCompleteCheckIn({ setCheckInStatus, navigateTo }),
    [setCheckInStatus, navigateTo],
  );
  const handleShareProgress = useMemo(
    () => createHandleShareProgress({ setCommunityPosts }),
    [setCommunityPosts],
  );
  const handleLoadDemoSeed = useMemo(
    () => createHandleLoadDemoSeed({
      setUserProfile,
      setDailyMacros,
      setHydration,
      setMovement,
      setDailyGoal,
      setDailyLog,
      setFoodHistory,
      setWeightHistory,
      setNutritionHistory,
      setRealFeelLogs,
      setSavedRecipes,
      setMealPlan,
      setShoppingList,
      setCommunityPosts,
      setCommunityStories,
      setToleranceLogs,
    }),
    [
      setUserProfile, setDailyMacros, setHydration, setMovement, setDailyGoal,
      setDailyLog, setFoodHistory, setWeightHistory, setNutritionHistory,
      setRealFeelLogs, setSavedRecipes, setMealPlan, setShoppingList,
      setCommunityPosts, setCommunityStories, setToleranceLogs,
    ],
  );
  const handleClearDemoSeed = useMemo(
    () => createHandleClearDemoSeed({
      setUserProfile,
      setDailyMacros,
      setHydration,
      setMovement,
      setDailyGoal,
      setDailyLog,
      setFoodHistory,
      setWeightHistory,
      setNutritionHistory,
      setRealFeelLogs,
      setSavedRecipes,
      setMealPlan,
      setShoppingList,
      setCommunityPosts,
      setCommunityStories,
      setToleranceLogs,
    }),
    [
      setUserProfile, setDailyMacros, setHydration, setMovement, setDailyGoal,
      setDailyLog, setFoodHistory, setWeightHistory, setNutritionHistory,
      setRealFeelLogs, setSavedRecipes, setMealPlan, setShoppingList,
      setCommunityPosts, setCommunityStories, setToleranceLogs,
    ],
  );

  // ─── Context value (memoized to prevent unnecessary consumer re-renders) ────

  const value = useMemo<AppStateContextType>(() => ({
    isPro, setIsPro,
    showAIBot, setShowAIBot,
    isFirstTime, setIsFirstTime,
    userProfile, setUserProfile,
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    dailyGoal, setDailyGoal,
    savedRecipes, setSavedRecipes,
    mealPlan, setMealPlan,
    shoppingList, setShoppingList,
    communityPosts, setCommunityPosts,
    toleranceLogs, setToleranceLogs,
    realFeelLogs, setRealFeelLogs,
    checkInStatus, setCheckInStatus,
    userFoods, addUserFood,
    userVariants, addUserVariant, updateUserVariant, removeUserVariant,
    userVariantBarcodes, addVariantBarcode,
    mergedVariants,
    dailyLog, setDailyLog,
    foodHistory, setFoodHistory, favoriteIds, toggleFavorite,
    weightHistory, setWeightHistory,
    nutritionHistory, setNutritionHistory,
    selectedRecipe, setSelectedRecipe,
    targetPlanDay, setTargetPlanDay,
    openScannerOnAddMeal, setOpenScannerOnAddMeal,
    selectedStoryAuthorId, setSelectedStoryAuthorId,
    selectedCreatorId, setSelectedCreatorId,
    selectedPostId, setSelectedPostId,
    likedPosts, toggleLikePost,
    savedPosts, toggleSavePost,
    communityStories, setCommunityStories,
    handlePublishStory, handleMarkStoryViewed,
    notifications, markAllNotificationsRead, markNotificationRead,
    selectedChallengeId, setSelectedChallengeId,
    followedCreators, handleFollowCreator,
    joinedChallenges, challengeJoinDates, challengeProgress,
    handleJoinChallenge, handleLeaveChallenge, handleCheckInChallenge, handleToggleChallenge,
    dictionary: mergedDictionary,
    handleLogMeal,
    handleLogMealNow,
    handleSaveRecipe,
    handleCreatePost,
    handleAddComment,
    handleAddToleranceLog,
    handleCreateRecipeSubmit,
    handleRealFeelLog,
    handleImportRecipe,
    handleAddToPlan,
    handleCheckIn,
    handleCompleteCheckIn,
    handleDeleteRecipe,
    handleDuplicateRecipe,
    handleMarkAsCooked,
    handleLogWeight,
    handleUpdateSnapshot,
    handleDeleteSnapshot,
    handleShareProgress,
    handleLoadDemoSeed,
    handleClearDemoSeed,
    navigateToRecipe,
    recipeToEdit, setRecipeToEdit,
  }), [
    isPro, setIsPro, showAIBot, setShowAIBot, isFirstTime, setIsFirstTime,
    userProfile, setUserProfile, dailyMacros, setDailyMacros,
    hydration, setHydration, movement, setMovement, dailyGoal, setDailyGoal,
    savedRecipes, setSavedRecipes, mealPlan, setMealPlan,
    shoppingList, setShoppingList, communityPosts, setCommunityPosts,
    toleranceLogs, setToleranceLogs, realFeelLogs, setRealFeelLogs,
    checkInStatus, setCheckInStatus, userFoods, addUserFood,
    userVariants, addUserVariant, updateUserVariant, removeUserVariant,
    userVariantBarcodes, addVariantBarcode, mergedVariants,
    dailyLog, setDailyLog, foodHistory, setFoodHistory, favoriteIds, toggleFavorite,
    weightHistory, setWeightHistory, nutritionHistory, setNutritionHistory,
    selectedRecipe, targetPlanDay, openScannerOnAddMeal, selectedStoryAuthorId, selectedCreatorId, selectedPostId,
    likedPosts, toggleLikePost, savedPosts, toggleSavePost,
    communityStories, setCommunityStories, handlePublishStory, handleMarkStoryViewed,
    notifications, markAllNotificationsRead, markNotificationRead, selectedChallengeId,
    followedCreators, handleFollowCreator,
    joinedChallenges, challengeJoinDates, challengeProgress,
    handleJoinChallenge, handleLeaveChallenge, handleCheckInChallenge, handleToggleChallenge,
    mergedDictionary,
    handleLogMeal, handleLogMealNow, handleSaveRecipe,
    handleCreatePost, handleAddComment, handleAddToleranceLog,
    handleCreateRecipeSubmit, handleRealFeelLog, handleImportRecipe,
    handleAddToPlan, handleCheckIn, handleCompleteCheckIn,
    handleDeleteRecipe, handleDuplicateRecipe, handleMarkAsCooked, handleLogWeight, handleUpdateSnapshot, handleDeleteSnapshot,
    handleShareProgress, handleLoadDemoSeed, handleClearDemoSeed, navigateToRecipe,
    recipeToEdit,
  ]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
