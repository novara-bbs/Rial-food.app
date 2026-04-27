import React, { createContext, useContext, useMemo, useCallback, useEffect, useRef } from 'react';
import { Recipe, DailyCheckIn as DailyCheckInType, Ingredient, LoggableMeal } from '../types';
import type { FoodVariant } from '../types/food-family';
import { useDailyReset, DailyArchive } from '../hooks/useDailyReset';
import { useNavigation } from './NavigationContext';
import { createHandleLogMeal, createHandleLogMealNow, DailyLogEntry, FoodHistoryEntry } from '../features/food/handlers/meal-handlers';
import { useI18n } from '../i18n';
// Recipe handler imports moved to useRecipeState (Phase 2.5).
// Social handler imports moved to useSocialState (Phase 2.5).
import type { Story, StorySlide } from '../types/social';
import type { ChallengeProgress } from '../features/social/handlers/challenge-handlers';
// Wellness handler imports moved to useWellnessState (Phase 2.5).
import type { LogWeightArgs } from '../features/wellness/handlers/weight-handlers';
import { createHandleLoadDemoSeed, createHandleClearDemoSeed } from '../features/dev/handlers/demo-seed-handlers';
import { IS_DEV } from '../config/env';
// getRecipeSlots + ingredientIdToFamilyVariant moved to useRecipeState (Phase 2.5).
import { logger } from '../lib/logger';
import type { BodySnapshot, ToleranceLog, RealFeelEntry, StoredRealFeelEntry } from '../types/wellness';
import type { CommunityPost } from '../types/social';
import { useAuth } from './AuthContext';
import { syncOnSignIn } from '../lib/sync';
import { useProfileState } from './state/useProfileState';
import { useVitalsState, type DailyMacros } from './state/useVitalsState';
import { useUITransientState } from './state/useUITransientState';
import { usePlannerState } from './state/usePlannerState';
import { useFoodState } from './state/useFoodState';
import { useRecipeState } from './state/useRecipeState';
import { useSocialState } from './state/useSocialState';
import { useWellnessState } from './state/useWellnessState';
import type { UserProfile } from '../types/user';
import type { ShoppingItem } from '../types/planner';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Updater-compatible setter — accepts a value or a functional update. */
type Setter<T> = (v: T | ((prev: T) => T)) => void;

/** Hydration state shape. */
type HydrationState = { consumed: number; target: number };

/** Movement state shape. */
type MovementState = { steps: number; target: number; activeMinutes: number; activeTarget: number };

// LoggableMeal is now canonical in src/types/food.ts — imported above.

interface AppStateContextType {
  // Profile & session
  isPro: boolean;
  setIsPro: (v: boolean) => void;
  showAIBot: boolean;
  setShowAIBot: (v: boolean) => void;
  isFirstTime: boolean;
  setIsFirstTime: (v: boolean) => void;
  /** R5: whether to show the mise-en-place pre-cook screen. Default true. */
  miseEnPlaceEnabled: boolean;
  setMiseEnPlaceEnabled: (v: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (v: UserProfile) => void;

  // Macros & vitals
  dailyMacros: DailyMacros;
  setDailyMacros: (v: DailyMacros | ((prev: DailyMacros) => DailyMacros)) => void;
  hydration: HydrationState;
  setHydration: Setter<HydrationState>;
  movement: MovementState;
  setMovement: Setter<MovementState>;
  dailyGoal: string;
  setDailyGoal: (v: string) => void;

  // Content
  savedRecipes: Recipe[];
  setSavedRecipes: Setter<Recipe[]>;
  /** MealPlan entries are Recipe objects augmented with extra runtime fields (time, type). */
  mealPlan: Record<number, Recipe[]>;
  setMealPlan: Setter<Record<number, Recipe[]>>;
  shoppingList: ShoppingItem[];
  setShoppingList: Setter<ShoppingItem[]>;
  communityPosts: CommunityPost[];
  setCommunityPosts: Setter<CommunityPost[]>;
  toleranceLogs: ToleranceLog[];
  setToleranceLogs: Setter<ToleranceLog[]>;
  realFeelLogs: StoredRealFeelEntry[];
  setRealFeelLogs: Setter<StoredRealFeelEntry[]>;

  // Check-in
  checkInStatus: DailyCheckInType | null;
  setCheckInStatus: (v: DailyCheckInType | null) => void;

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
  setDailyLog: Setter<DailyLogEntry[]>;

  // Food history & favorites (persistent across days)
  foodHistory: FoodHistoryEntry[];
  setFoodHistory: Setter<FoodHistoryEntry[]>;
  favoriteIds: string[];
  toggleFavorite: (foodId: string) => void;

  // Weight & history
  weightHistory: BodySnapshot[];
  setWeightHistory: Setter<BodySnapshot[]>;
  nutritionHistory: DailyArchive[];
  setNutritionHistory: Setter<DailyArchive[]>;

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
  setCommunityStories: Setter<Story[]>;
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
  /** Accepts a Recipe, Ingredient, or custom macro object — duck-typed for flexibility. */
  handleLogMeal: (meal: LoggableMeal) => void;
  handleLogMealNow: (meal: LoggableMeal, servings: number) => void;
  handleSaveRecipe: (recipe: Recipe) => void;
  /** `recipe` is a post-summary object (not a full Recipe) attached to community posts. */
  handleCreatePost: (content: string, performance?: Record<string, unknown>, options?: { images?: string[]; recipe?: Record<string, unknown>; hashtags?: string[] }) => void;
  handleAddComment: (postId: number, commentText: string) => void;
  handleAddToleranceLog: (log: Omit<ToleranceLog, 'id'>) => void;
  handleCreateRecipeSubmit: (recipe: Recipe) => void;
  handleRealFeelLog: (entry: RealFeelEntry) => void;
  handleImportRecipe: (recipe: Recipe) => void;
  handleAddToPlan: (recipe: Recipe, dayIndex: number) => void;
  handleCheckIn: (status?: string) => void;
  handleCompleteCheckIn: (data: DailyCheckInType) => void;
  handleDeleteRecipe: (recipeId: string) => void;
  handleDuplicateRecipe: (recipe: Recipe) => void;
  handleMarkAsCooked: (recipe: Recipe) => void;
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
  handleLoadDemoSeed?: () => Promise<void>;
  handleClearDemoSeed?: () => void;
  navigateToRecipe: (recipe: Recipe) => void;
  recipeToEdit: Recipe | null;
  setRecipeToEdit: (recipe: Recipe | null) => void;
}

// UserProfile + FamilyMember moved to src/types/user.ts in Phase 2.5 [1.5.116].
// See ADR-015. Re-export here so existing internal references keep working.

// DailyMacros moved to src/contexts/state/useVitalsState.ts in Phase 2.5 [1.5.117].
// See ADR-015. Re-imported above for local references.

// ShoppingItem moved to src/types/planner.ts in Phase 2.5 [1.5.119].

// Body-state types defined in src/types/wellness.ts
export type { BodySnapshot, BodyMeasurements } from '../types/wellness';

// ─── Context ─────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { navigateTo, previousScreen } = useNavigation();
  const { t } = useI18n();

  // UI transient state (not persisted) — extracted to useUITransientState (Phase 2.5).
  // Includes selectedChallengeId + recipeToEdit (previously declared further down).
  const {
    selectedRecipe, setSelectedRecipe,
    selectedCreatorId, setSelectedCreatorId,
    selectedPostId, setSelectedPostId,
    selectedStoryAuthorId, setSelectedStoryAuthorId,
    selectedChallengeId, setSelectedChallengeId,
    targetPlanDay, setTargetPlanDay,
    openScannerOnAddMeal, setOpenScannerOnAddMeal,
    recipeToEdit, setRecipeToEdit,
  } = useUITransientState();

  // likedPosts + savedPosts (and their toggle handlers) moved to useSocialState (Phase 2.5).

  // Profile state — extracted to useProfileState hook (Phase 2.5, ADR-015).
  // Owns: isPro, showAIBot, isFirstTime, miseEnPlaceEnabled, userProfile.
  // Plus the R8.3 foodDislikes→foodPreferences migration and 3 sync effects.
  const {
    isPro, setIsPro,
    showAIBot, setShowAIBot,
    isFirstTime, setIsFirstTime,
    miseEnPlaceEnabled, setMiseEnPlaceEnabled,
    userProfile, setUserProfile,
  } = useProfileState();

  // Vitals state — extracted to useVitalsState hook (Phase 2.5, ADR-015).
  // Owns: dailyMacros, hydration, movement, dailyGoal, checkInStatus + 4 sync effects.
  const {
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    dailyGoal, setDailyGoal,
    checkInStatus, setCheckInStatus,
  } = useVitalsState();

  // Food state — extracted to useFoodState (Phase 2.5, ADR-015).
  // Owns userFoods, userVariants, userVariantBarcodes, dailyLog, foodHistory,
  // favoriteIds + their wrapper callbacks + lazy-loaded dictionary/variants
  // + 6 sync effects.
  const {
    userFoods, addUserFood,
    userVariants, addUserVariant, updateUserVariant, removeUserVariant,
    userVariantBarcodes, addVariantBarcode,
    mergedDictionary, mergedVariants,
    dailyLog, setDailyLog,
    foodHistory, setFoodHistory,
    favoriteIds, toggleFavorite, setFavoriteIds,
  } = useFoodState({ t });

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
  // Planner state — extracted to usePlannerState (Phase 2.5, ADR-015).
  // Owns mealPlan + shoppingList + their lazy seeds + 2 sync effects.
  const { mealPlan, setMealPlan, shoppingList, setShoppingList } = usePlannerState();

  // Recipe state — extracted to useRecipeState (Phase 2.5).
  // Owns savedRecipes + 2 migrations + 7 handlers + navigateToRecipe + sync.
  const {
    savedRecipes, setSavedRecipes,
    navigateToRecipe,
    handleSaveRecipe,
    handleAddToPlan,
    handleCreateRecipeSubmit,
    handleDeleteRecipe,
    handleMarkAsCooked,
    handleDuplicateRecipe,
    handleImportRecipe,
  } = useRecipeState({ setMealPlan, setShoppingList, setSelectedRecipe, navigateTo, t });

  // Social state — extracted to useSocialState (Phase 2.5).
  // Owns 9 persisted vars (community/stories/notifications/likes/saves/
  // social-graph/challenges) + 4 inline callbacks + 9 handler factories +
  // ref-getter pattern + 6 sync effects.
  const {
    communityPosts, setCommunityPosts,
    communityStories, setCommunityStories,
    notifications, markAllNotificationsRead, markNotificationRead,
    likedPosts, toggleLikePost,
    savedPosts, toggleSavePost,
    followedCreators,
    joinedChallenges,
    challengeJoinDates,
    challengeProgress,
    handleCreatePost,
    handleAddComment,
    handlePublishStory,
    handleMarkStoryViewed,
    handleFollowCreator,
    handleJoinChallenge,
    handleLeaveChallenge,
    handleCheckInChallenge,
    handleToggleChallenge,
  } = useSocialState({ userProfile, t, navigateTo });

  // Wellness state — extracted to useWellnessState (Phase 2.5).
  // Owns toleranceLogs, realFeelLogs, weightHistory, nutritionHistory + 4 lazy
  // seeds + weeklyCheckIns seed + 4 sync effects + 8 handlers.
  const {
    toleranceLogs, setToleranceLogs,
    realFeelLogs, setRealFeelLogs,
    weightHistory, setWeightHistory,
    nutritionHistory, setNutritionHistory,
    handleLogWeight, handleUpdateSnapshot, handleDeleteSnapshot,
    handleAddToleranceLog, handleRealFeelLog,
    handleCheckIn, handleCompleteCheckIn,
    handleShareProgress,
  } = useWellnessState({
    setUserProfile,
    setCheckInStatus,
    setCommunityPosts,
    dailyLog,
    navigateTo,
  });

  // dailyLog, foodHistory, favoriteIds + toggleFavorite moved to useFoodState (Phase 2.5).

  // Reset daily counters when calendar date changes (midnight rollover)
  useDailyReset({ setDailyLog, setDailyMacros, setHydration, setMovement });

  // ─── Q6: Supabase sync wiring ────────────────────────────────────────────────
  // AppStateProvider lives inside AuthProvider (main.tsx), so useAuth() is safe here.
  const { status: authStatus } = useAuth();
  const prevAuthStatusRef = useRef<string>('loading');

  // On sign-in: pull remote data and merge into local state (last-write-wins per key).
  // Values arrive from Supabase JSONB — we trust the schema matches what we stored.
  const applyRemoteData = useCallback((remote: Partial<Record<string, unknown>>) => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (remote.userProfile) setUserProfile(remote.userProfile as UserProfile);
    if (remote.dailyMacros) setDailyMacros(remote.dailyMacros as DailyMacros);
    if (remote.savedRecipes) setSavedRecipes(remote.savedRecipes as any[]);
    if (remote.mealPlan) setMealPlan(remote.mealPlan as Record<number, any[]>);
    if (remote.shoppingList) setShoppingList(remote.shoppingList as ShoppingItem[]);
    if (remote.realFeelLogs) setRealFeelLogs(remote.realFeelLogs as any[]);
    if (remote.toleranceLogs) setToleranceLogs(remote.toleranceLogs as any[]);
    if (remote.weightHistory) setWeightHistory(remote.weightHistory as BodySnapshot[]);
    if (remote.nutritionHistory) setNutritionHistory(remote.nutritionHistory as DailyArchive[]);
    if (typeof remote.isPro === 'boolean') setIsPro(remote.isPro);
    if (remote.dailyLog) setDailyLog(remote.dailyLog as DailyLogEntry[]);
    if (remote.foodHistory) setFoodHistory(remote.foodHistory as FoodHistoryEntry[]);
    if (remote.favoriteIds) setFavoriteIds(remote.favoriteIds as string[]);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [
    setUserProfile, setDailyMacros, setSavedRecipes, setMealPlan,
    setShoppingList, setRealFeelLogs, setToleranceLogs, setWeightHistory,
    setNutritionHistory, setIsPro, setDailyLog, setFoodHistory, setFavoriteIds,
  ]);

  useEffect(() => {
    if (authStatus !== 'authed' || prevAuthStatusRef.current === 'authed') {
      prevAuthStatusRef.current = authStatus;
      return;
    }
    prevAuthStatusRef.current = 'authed';
    syncOnSignIn()
      .then(applyRemoteData)
      .catch(err => logger.warn('syncOnSignIn failed', { err: String(err) }));
  }, [authStatus, applyRemoteData]);

  // Push on change — no-op when Supabase is unconfigured or user not signed in.
  // savedRecipes sync (with data-URL guard) moved to useRecipeState (Phase 2.5).
  // userProfile sync moved to useProfileState (Phase 2.5).
  // dailyMacros, hydration, movement, dailyGoal sync moved to useVitalsState (Phase 2.5).
  // mealPlan + shoppingList sync moved to usePlannerState (Phase 2.5).
  // userFoods, userVariants, userVariantBarcodes, dailyLog, foodHistory,
  // favoriteIds sync moved to useFoodState (Phase 2.5).
  // mealPlan + shoppingList sync moved to usePlannerState (Phase 2.5).
  // realFeelLogs, toleranceLogs, weightHistory, nutritionHistory sync moved to useWellnessState (Phase 2.5).
  // isPro, isFirstTime sync moved to useProfileState (Phase 2.5).
  // dailyLog, foodHistory, favoriteIds, userFoods, userVariants,
  // userVariantBarcodes sync moved to useFoodState (Phase 2.5).
  // likedPosts, savedPosts, followedCreators, joinedChallenges,
  // challengeJoinDates, challengeProgress sync moved to useSocialState (Phase 2.5).
  // ──────────────────────────────────────────────────────────────────────────────

  // ─── Handlers (delegated to feature modules, memoized to prevent re-renders) ──
  // navigateToRecipe + 7 recipe handlers moved to useRecipeState (Phase 2.5).

  const handleLogMeal = useMemo(
    () => createHandleLogMeal({ targetPlanDay, setMealPlan, setShoppingList, setTargetPlanDay, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t }),
    [targetPlanDay, setMealPlan, setShoppingList, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t],
  );
  const handleLogMealNow = useMemo(
    () => createHandleLogMealNow({ setDailyMacros, setDailyLog, setFoodHistory, navigateTo, t }),
    [setDailyMacros, setDailyLog, setFoodHistory, navigateTo, t],
  );
  // Recipe handlers moved to useRecipeState (Phase 2.5).
  // Wellness handlers (logWeight, updateSnapshot, deleteSnapshot,
  // addToleranceLog, realFeelLog, checkIn, completeCheckIn, shareProgress)
  // moved to useWellnessState (Phase 2.5).
  // recipeToEdit moved to useUITransientState (Phase 2.5).
  // Social handlers (createPost, addComment, publishStory, markStoryViewed,
  // followCreator, joinChallenge, leaveChallenge, checkInChallenge,
  // toggleChallenge) + ref-getter pattern moved to useSocialState (Phase 2.5).
  // Wellness handlers (addToleranceLog, realFeelLog, checkIn, completeCheckIn,
  // shareProgress) moved to useWellnessState (Phase 2.5).
  const handleLoadDemoSeed = useMemo(
    () => IS_DEV ? createHandleLoadDemoSeed({
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
    }) : undefined,
    [
      setUserProfile, setDailyMacros, setHydration, setMovement, setDailyGoal,
      setDailyLog, setFoodHistory, setWeightHistory, setNutritionHistory,
      setRealFeelLogs, setSavedRecipes, setMealPlan, setShoppingList,
      setCommunityPosts, setCommunityStories, setToleranceLogs,
    ],
  );
  const handleClearDemoSeed = useMemo(
    () => IS_DEV ? createHandleClearDemoSeed({
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
    }) : undefined,
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
    miseEnPlaceEnabled, setMiseEnPlaceEnabled,
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
    miseEnPlaceEnabled, setMiseEnPlaceEnabled,
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
