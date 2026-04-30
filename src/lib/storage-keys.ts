/**
 * Central registry of all localStorage keys used by the app.
 * Key VALUES must never change — existing user data depends on them.
 * Key NAMES here are the single authoritative reference; import instead of repeating strings.
 */
export const STORAGE_KEYS = {
  // ── Theme (ThemeContext) ────────────────────────────────────────────────
  THEME:             'rial-theme-v2',
  THEME_LEGACY:      'rial-theme',       // migrated on first read, then removed

  // ── Food & logging (useFoodState) ──────────────────────────────────────
  USER_FOODS:        'userFoods',
  USER_VARIANTS:     'userVariants',
  USER_VARIANT_BARCODES: 'userVariantBarcodes',
  DAILY_LOG:         'dailyLog',
  FOOD_HISTORY:      'foodHistory',
  FAVORITE_IDS:      'favoriteIds',

  // ── Recipes (useRecipeState) ────────────────────────────────────────────
  SAVED_RECIPES:     'savedRecipes',
  RECIPE_VIEWED:     'rial_recipeViewed', // first-use onboarding flag

  // ── Planner (usePlannerState) ───────────────────────────────────────────
  MEAL_PLAN:         'mealPlan',
  SHOPPING_LIST:     'shoppingList',

  // ── Profile (useProfileState) ───────────────────────────────────────────
  USER_PROFILE:      'userProfile',
  IS_PRO:            'isPro',
  SHOW_AI_BOT:       'showAIBot',
  IS_FIRST_TIME:     'isFirstTime',
  MISE_EN_PLACE:     'miseEnPlacePreCook',

  // ── Onboarding (resumable draft, cleared on complete) ──────────────────
  ONBOARDING_DRAFT:  'onboardingDraft',

  // ── Vitals (useVitalsState) ─────────────────────────────────────────────
  DAILY_MACROS:      'dailyMacros',
  HYDRATION:         'hydration',
  MOVEMENT:          'movement',
  DAILY_GOAL:        'dailyGoal',
  CHECK_IN_STATUS:   'checkInStatus',

  // ── Wellness (useWellnessState + FastingTimer + WeeklyCheckIn) ──────────
  TOLERANCE_LOGS:    'toleranceLogs',
  REAL_FEEL_LOGS:    'realFeelLogs',
  WEIGHT_HISTORY:    'weightHistory',
  NUTRITION_HISTORY: 'nutritionHistory',
  WEEKLY_CHECK_INS:  'weeklyCheckIns',
  FASTING_PROTOCOL:  'fasting-protocol',

  // ── Social (useSocialState) ─────────────────────────────────────────────
  COMMUNITY_POSTS:   'communityPosts',
  LIKED_POSTS:       'likedPosts',
  SAVED_POSTS:       'savedPosts',
  COMMUNITY_STORIES: 'communityStories',
  NOTIFICATIONS:     'notifications',
  FOLLOWED_CREATORS: 'followedCreators',
  JOINED_CHALLENGES: 'joinedChallenges',
  CHALLENGE_JOIN_DATES: 'challengeJoinDates',
  CHALLENGE_PROGRESS:   'challengeProgress',

  // ── System (SettingsSystem) ─────────────────────────────────────────────
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  PROFILE_PUBLIC:        'profilePublic',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
