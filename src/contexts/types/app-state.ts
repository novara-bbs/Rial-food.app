/**
 * AppStateContextType — public shape exposed by `<AppStateProvider>` to its
 * consumers via `useAppState()`. Extracted from `AppStateContext.tsx` so the
 * provider body stays focused on wiring slices into the value object.
 *
 * Slice-level types live with their owning hook (e.g. `DailyMacros` in
 * `state/useVitalsState.ts`); this file is a single roll-up.
 */
import type { Recipe, DailyCheckIn as DailyCheckInType, Ingredient, LoggableMeal } from '../../types';
import type { FoodVariant } from '../../types/food-family';
import type { DailyArchive } from '../../hooks/useDailyReset';
import type { DailyLogEntry, FoodHistoryEntry } from '../../features/food/handlers/meal-handlers';
import type { WorkoutLogEntry } from '../../features/home/types/workout-log';
import type { ExerciseIntensity } from '../../features/home/utils/exercise-intensity';
import type { ActivityProfile } from '../../features/home/utils/activity-calories';
import type { Story, StorySlide, CommunityPost, Notification } from '../../types/social';
import type { ChallengeProgress } from '../../features/social/handlers/challenge-handlers';
import type { LogWeightArgs } from '../../features/wellness/handlers/weight-handlers';
import type { BodySnapshot, BodyMeasurements, ToleranceLog, RealFeelEntry, StoredRealFeelEntry } from '../../types/wellness';
import type { UserProfile } from '../../types/user';
import type { ShoppingItem } from '../../types/planner';
import type { DailyMacros } from '../state/useVitalsState';

/** Updater-compatible setter — accepts a value or a functional update. */
export type Setter<T> = (v: T | ((prev: T) => T)) => void;

/** Hydration state shape. */
export type HydrationState = { consumed: number; target: number };

/** Movement state shape. */
export type MovementState = { steps: number; target: number; activeMinutes: number; activeTarget: number; workoutMinutes: number };

export interface AppStateContextType {
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
  setUserProfile: Setter<UserProfile>;

  // Macros & vitals
  dailyMacros: DailyMacros;
  setDailyMacros: (v: DailyMacros | ((prev: DailyMacros) => DailyMacros)) => void;
  hydration: HydrationState;
  setHydration: Setter<HydrationState>;
  movement: MovementState;
  setMovement: Setter<MovementState>;
  dailyGoal: string;
  setDailyGoal: (v: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  resetToToday: () => void;

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

  // Daily workout diary log (intentional exercise sessions).
  workoutLog: WorkoutLogEntry[];
  setWorkoutLog: Setter<WorkoutLogEntry[]>;
  /** Append a new workout entry. Computes kcal from (intensity, minutes, profile) and freezes it on the entry. */
  handleLogWorkout: (intensity: Exclude<ExerciseIntensity, 'none'>, minutes: number, profile: ActivityProfile) => WorkoutLogEntry;
  /** Replace an existing workout by id. Recomputes kcal. */
  handleEditWorkout: (id: number, intensity: Exclude<ExerciseIntensity, 'none'>, minutes: number, profile: ActivityProfile) => void;
  /** Remove a workout by id. */
  handleDeleteWorkout: (id: number) => void;

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
  notifications: Notification[];
  markAllNotificationsRead: () => void;
  markNotificationRead: (notificationId: string) => void;
  selectedChallengeId: string | null;
  setSelectedChallengeId: (id: string | null) => void;

  // Social graph — single writer via factory handler.
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
  handleCreatePost: (content: string, performance?: CommunityPost['performance'], options?: { images?: string[]; recipe?: CommunityPost['recipe']; hashtags?: string[] }) => void;
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
  handleUpdateSnapshot: (args: { date: string; photoUrl?: string; measurements?: BodyMeasurements }) => void;
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
  recipeToEdit: Partial<Recipe> | null;
  setRecipeToEdit: (recipe: Partial<Recipe> | null) => void;
}
