import React, { createContext, useContext, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Recipe, DailyCheckIn as DailyCheckInType, Ingredient } from '../types';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { useDailyReset, DailyArchive } from '../hooks/useDailyReset';
import { useNavigation } from './NavigationContext';
import { Allergen } from '../types';
import { INGREDIENT_DICTIONARY } from '../features/food/data/ingredients';
import { SEED_RECIPES } from '../features/food/data/seed-recipes';
import { SEED_MEAL_PLAN } from '../features/planner/data/seed-meal-plan';
import { SEED_SHOPPING_LIST } from '../features/planner/data/seed-shopping';
import { SEED_POSTS } from '../features/social/data/seed-posts';
import { SEED_TOLERANCE_LOGS } from '../features/wellness/data/seed-tolerance';
import { createHandleLogMeal, createHandleLogMealNow, DailyLogEntry, FoodHistoryEntry } from '../features/food/handlers/meal-handlers';
import { useI18n } from '../i18n';
import { createHandleSaveRecipe, createHandleAddToPlan, createHandleCreateRecipeSubmit, createHandleImportRecipe, createHandleDeleteRecipe, createHandleDuplicateRecipe } from '../features/recipes/handlers/recipe-handlers';
import { createHandleCreatePost, createHandleAddComment } from '../features/social/handlers/social-handlers';
import { createHandlePublishStory, createHandleMarkStoryViewed } from '../features/social/handlers/story-handlers';
import { SEED_STORIES } from '../features/social/data/seed-stories';
import type { Story, StorySlide, Notification as NotificationType, SocialLinks } from '../types/social';
import { createHandleAddToleranceLog, createHandleRealFeelLog, createHandleCheckIn, createHandleCompleteCheckIn } from '../features/wellness/handlers/wellness-handlers';

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

  // User foods (scanned / custom)
  userFoods: Ingredient[];
  addUserFood: (food: Ingredient) => void;

  // Daily food diary log
  dailyLog: DailyLogEntry[];
  setDailyLog: (v: any) => void;

  // Food history & favorites (persistent across days)
  foodHistory: FoodHistoryEntry[];
  favoriteIds: string[];
  toggleFavorite: (foodId: string) => void;

  // Weight & history
  weightHistory: WeightEntry[];
  setWeightHistory: (v: any) => void;
  nutritionHistory: DailyArchive[];
  setNutritionHistory: (v: any) => void;

  // Misc
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (v: Recipe | null) => void;
  targetPlanDay: number | null;
  setTargetPlanDay: (v: number | null) => void;
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
  selectedChallengeId: string | null;
  setSelectedChallengeId: (id: string | null) => void;

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

export interface WeightEntry {
  date: string;
  kg: number;
  note?: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { navigateTo, currentScreen, previousScreen } = useNavigation();
  const { t } = useI18n();

  // UI state (not persisted)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [targetPlanDay, setTargetPlanDay] = useState<number | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useLocalStorageState<number[]>('likedPosts', []);
  const [savedPosts, setSavedPosts] = useLocalStorageState<number[]>('savedPosts', []);

  const toggleLikePost = (postId: number) => {
    setLikedPosts((prev: number[]) => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  const toggleSavePost = (postId: number) => {
    setSavedPosts((prev: number[]) => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

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

  const [dailyMacros, setDailyMacros] = useLocalStorageState<DailyMacros>('dailyMacros', {
    consumed: { cal: 840, pro: 45, carbs: 110, fats: 25 },
    target: { cal: 2400, pro: 180, carbs: 250, fats: 65 },
  });

  const [hydration, setHydration] = useLocalStorageState('hydration', { consumed: 4, target: 10 });

  const [movement, setMovement] = useLocalStorageState('movement', {
    steps: 6432,
    target: 10000,
    activeMinutes: 24,
    activeTarget: 45,
  });

  const [dailyGoal, setDailyGoal] = useLocalStorageState('dailyGoal', 'Bebe 2L de agua hoy');

  // User-created / scanned foods
  const [userFoods, setUserFoods] = useLocalStorageState<Ingredient[]>('userFoods', []);

  const addUserFood = (food: Ingredient) => {
    setUserFoods((prev: Ingredient[]) => {
      // Avoid duplicates by id
      if (prev.some(f => f.id === food.id)) return prev;
      return [food, ...prev];
    });
    toast.success(t.mealToasts.foodSaved);
  };

  // Merged dictionary: built-in + user foods
  const mergedDictionary = useMemo(
    () => [...INGREDIENT_DICTIONARY, ...userFoods],
    [userFoods],
  );

  const [savedRecipes, setSavedRecipes] = useLocalStorageState<any[]>('savedRecipes', SEED_RECIPES);

  const [mealPlan, setMealPlan] = useLocalStorageState<Record<number, any[]>>('mealPlan', SEED_MEAL_PLAN);

  const [shoppingList, setShoppingList] = useLocalStorageState<ShoppingItem[]>('shoppingList', SEED_SHOPPING_LIST);

  const [communityPosts, setCommunityPosts] = useLocalStorageState<any[]>('communityPosts', SEED_POSTS);

  const [toleranceLogs, setToleranceLogs] = useLocalStorageState<any[]>('toleranceLogs', SEED_TOLERANCE_LOGS);

  const [realFeelLogs, setRealFeelLogs] = useLocalStorageState<any[]>('realFeelLogs', []);

  // Stories
  const [communityStories, setCommunityStories] = useLocalStorageState<Story[]>('communityStories', SEED_STORIES);

  // Notifications
  const [notifications, setNotifications] = useLocalStorageState<NotificationType[]>('notifications', []);
  const markAllNotificationsRead = () => {
    setNotifications((prev: NotificationType[]) => prev.map(n => ({ ...n, read: true })));
  };

  // Challenge detail
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // Weight & nutrition history (persistent across days)
  const [weightHistory, setWeightHistory] = useLocalStorageState<WeightEntry[]>('weightHistory', []);
  const [nutritionHistory, setNutritionHistory] = useLocalStorageState<DailyArchive[]>('nutritionHistory', []);

  // Daily food diary log (persisted, cleared manually or on new day)
  const [dailyLog, setDailyLog] = useLocalStorageState<DailyLogEntry[]>('dailyLog', []);

  // Persistent food history & favorites (NOT reset daily)
  const [foodHistory, setFoodHistory] = useLocalStorageState<FoodHistoryEntry[]>('foodHistory', []);
  const [favoriteIds, setFavoriteIds] = useLocalStorageState<string[]>('favoriteIds', []);

  const toggleFavorite = (foodId: string) => {
    setFavoriteIds((prev: string[]) =>
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );
  };

  // Reset daily counters when calendar date changes (midnight rollover)
  useDailyReset({ setDailyLog, setDailyMacros, setHydration, setMovement });

  // ─── Handlers (delegated to feature modules) ───────────────────────────────

  const navigateToRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    navigateTo('recipe-detail');
  };

  const handleLogMeal = createHandleLogMeal({ targetPlanDay, setMealPlan, setShoppingList, setTargetPlanDay, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t });
  const handleLogMealNow = createHandleLogMealNow({ setDailyMacros, setDailyLog, setFoodHistory, navigateTo, t });
  const handleSaveRecipe = createHandleSaveRecipe({ setSavedRecipes, t });
  const handleAddToPlan = createHandleAddToPlan({ setSavedRecipes, setMealPlan, setShoppingList, navigateTo, t });
  const handleCreateRecipeSubmit = createHandleCreateRecipeSubmit({ setSavedRecipes, navigateTo, t });
  const handleDeleteRecipe = createHandleDeleteRecipe({ setSavedRecipes, navigateTo, t });
  const handleDuplicateRecipe = createHandleDuplicateRecipe({ setSavedRecipes, navigateTo, t });
  const handleImportRecipe = createHandleImportRecipe({ setSavedRecipes, navigateTo, t });
  const [recipeToEdit, setRecipeToEdit] = useState<any>(null);
  const handleCreatePost = createHandleCreatePost({ setCommunityPosts, navigateTo, t });
  const handlePublishStory = createHandlePublishStory({ setCommunityStories, navigateTo, t });
  const handleMarkStoryViewed = createHandleMarkStoryViewed({ setCommunityStories });
  const handleAddComment = createHandleAddComment({ setCommunityPosts, t });
  const handleAddToleranceLog = createHandleAddToleranceLog({ setToleranceLogs, navigateTo, t });
  const handleRealFeelLog = createHandleRealFeelLog({ setRealFeelLogs, getDailyLog: () => dailyLog });
  const handleCheckIn = createHandleCheckIn({ setCheckInStatus, navigateTo });
  const handleCompleteCheckIn = createHandleCompleteCheckIn({ setCheckInStatus, navigateTo, t });

  // ─── Context value ──────────────────────────────────────────────────────────

  const value: AppStateContextType = {
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
    dailyLog, setDailyLog,
    foodHistory, favoriteIds, toggleFavorite,
    weightHistory, setWeightHistory,
    nutritionHistory, setNutritionHistory,
    selectedRecipe, setSelectedRecipe,
    targetPlanDay, setTargetPlanDay,
    selectedCreatorId, setSelectedCreatorId,
    selectedPostId, setSelectedPostId,
    likedPosts, toggleLikePost,
    savedPosts, toggleSavePost,
    communityStories, setCommunityStories,
    handlePublishStory, handleMarkStoryViewed,
    notifications, markAllNotificationsRead,
    selectedChallengeId, setSelectedChallengeId,
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
    navigateToRecipe,
    recipeToEdit, setRecipeToEdit,
  };

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
