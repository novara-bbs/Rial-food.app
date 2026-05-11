import React, { createContext, useContext, useMemo } from 'react';
import { useDailyReset } from '../hooks/useDailyReset';
import { useNavigation } from './NavigationContext';
import { createHandleLogMeal, createHandleLogMealNow } from '../features/food/handlers/meal-handlers';
import {
  createHandleLogWorkout,
  createHandleEditWorkout,
  createHandleDeleteWorkout,
} from '../features/home/handlers/workout-handlers';
import { useI18n } from '../i18n';
import { useProfileState } from './state/useProfileState';
import { usePreferencesState } from './state/usePreferencesState';
import { useVitalsState } from './state/useVitalsState';
import { useDayNavigation } from './state/useDayNavigation';
import { useUITransientState } from './state/useUITransientState';
import { usePlannerState } from './state/usePlannerState';
import { useFoodState } from './state/useFoodState';
import { useRecipeState } from './state/useRecipeState';
import { useSocialState } from './state/useSocialState';
import { useWellnessState } from './state/useWellnessState';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { useDemoSeedHandlers } from './hooks/useDemoSeedHandlers';
import type { AppStateContextType } from './types/app-state';

// Re-exports preserved so existing imports (including tests) keep working.
export type { BodySnapshot, BodyMeasurements } from '../types/wellness';

// ─── Context ─────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { navigateTo, previousScreen } = useNavigation();
  const { t } = useI18n();

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

  const {
    isPro, setIsPro,
    showAIBot, setShowAIBot,
    isFirstTime, setIsFirstTime,
    miseEnPlaceEnabled, setMiseEnPlaceEnabled,
    userProfile, setUserProfile,
  } = useProfileState();

  // Sprint E [1.5.218] — preferences slice (replaces UserProfile.mode binary).
  // Migration from legacy mode runs once on first hydration; idempotent.
  // The hook needs `userProfile.mode` and a "has the user been here before?"
  // signal — `!isFirstTime` is the truthiest available proxy.
  const { preferences, actions: preferencesActions } = usePreferencesState(
    userProfile?.mode,
    !isFirstTime,
  );

  const {
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    dailyGoal, setDailyGoal,
    checkInStatus, setCheckInStatus,
    workoutLog, setWorkoutLog,
  } = useVitalsState();

  const { selectedDate, setSelectedDate, resetToToday } = useDayNavigation();

  const {
    userFoods, addUserFood,
    userVariants, addUserVariant, updateUserVariant, removeUserVariant,
    userVariantBarcodes, addVariantBarcode,
    mergedDictionary, mergedVariants,
    dailyLog, setDailyLog,
    foodHistory, setFoodHistory,
    favoriteIds, toggleFavorite, setFavoriteIds,
  } = useFoodState({ t });

  const { mealPlan, setMealPlan, shoppingList, setShoppingList } = usePlannerState();

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

  // Reset daily counters when calendar date changes (midnight rollover)
  useDailyReset({ setDailyLog, setDailyMacros, setHydration, setMovement, setWorkoutLog });

  // Q6 sign-in pull — extracted to useSupabaseSync hook (Phase 2.5+).
  useSupabaseSync({
    setUserProfile, setDailyMacros, setSavedRecipes, setMealPlan,
    setShoppingList, setRealFeelLogs, setToleranceLogs, setWeightHistory,
    setNutritionHistory, setIsPro, setDailyLog, setFoodHistory, setFavoriteIds,
  });

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleLogMeal = useMemo(
    () => createHandleLogMeal({ targetPlanDay, setMealPlan, setShoppingList, setTargetPlanDay, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t }),
    [targetPlanDay, setTargetPlanDay, setMealPlan, setShoppingList, setDailyMacros, setDailyLog, setFoodHistory, navigateTo, previousScreen, t],
  );
  const handleLogMealNow = useMemo(
    () => createHandleLogMealNow({ setDailyMacros, setDailyLog, setFoodHistory, navigateTo, t }),
    [setDailyMacros, setDailyLog, setFoodHistory, navigateTo, t],
  );

  const handleLogWorkout = useMemo(() => createHandleLogWorkout({ setWorkoutLog }), [setWorkoutLog]);
  const handleEditWorkout = useMemo(() => createHandleEditWorkout({ setWorkoutLog }), [setWorkoutLog]);
  const handleDeleteWorkout = useMemo(() => createHandleDeleteWorkout({ setWorkoutLog }), [setWorkoutLog]);

  const { handleLoadDemoSeed, handleClearDemoSeed } = useDemoSeedHandlers({
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
  });

  // ─── Context value (memoized to prevent unnecessary consumer re-renders) ────

  const value = useMemo<AppStateContextType>(() => ({
    isPro, setIsPro,
    showAIBot, setShowAIBot,
    isFirstTime, setIsFirstTime,
    miseEnPlaceEnabled, setMiseEnPlaceEnabled,
    userProfile, setUserProfile,
    preferences,
    preferencesActions,
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    dailyGoal, setDailyGoal,
    selectedDate, setSelectedDate, resetToToday,
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
    workoutLog, setWorkoutLog,
    handleLogWorkout, handleEditWorkout, handleDeleteWorkout,
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
    userProfile, setUserProfile,
    preferences, preferencesActions,
    dailyMacros, setDailyMacros,
    hydration, setHydration, movement, setMovement, dailyGoal, setDailyGoal,
    selectedDate, setSelectedDate, resetToToday,
    savedRecipes, setSavedRecipes, mealPlan, setMealPlan,
    shoppingList, setShoppingList, communityPosts, setCommunityPosts,
    toleranceLogs, setToleranceLogs, realFeelLogs, setRealFeelLogs,
    checkInStatus, setCheckInStatus, userFoods, addUserFood,
    userVariants, addUserVariant, updateUserVariant, removeUserVariant,
    userVariantBarcodes, addVariantBarcode, mergedVariants,
    dailyLog, setDailyLog,
    workoutLog, setWorkoutLog, handleLogWorkout, handleEditWorkout, handleDeleteWorkout,
    foodHistory, setFoodHistory, favoriteIds, toggleFavorite,
    weightHistory, setWeightHistory, nutritionHistory, setNutritionHistory,
    selectedRecipe, setSelectedRecipe, targetPlanDay, setTargetPlanDay, openScannerOnAddMeal, setOpenScannerOnAddMeal, selectedStoryAuthorId, setSelectedStoryAuthorId, selectedCreatorId, setSelectedCreatorId, selectedPostId, setSelectedPostId, selectedChallengeId, setSelectedChallengeId,
    likedPosts, toggleLikePost, savedPosts, toggleSavePost,
    communityStories, setCommunityStories, handlePublishStory, handleMarkStoryViewed,
    notifications, markAllNotificationsRead, markNotificationRead,
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
    recipeToEdit, setRecipeToEdit,
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
