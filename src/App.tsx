import { useState, useMemo, Suspense } from 'react';
import Onboarding from './features/profile/components/Onboarding';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import CreateModal from './components/CreateModal';
import GlobalHeader from './components/GlobalHeader';
import ErrorBoundary from './components/ErrorBoundary';
import { Sparkles } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useNavigation } from './contexts/NavigationContext';
import { useAppState } from './contexts/AppStateContext';
import { Toaster } from 'sonner';
import { screens } from './config/routes';
import { getFoodInsights } from './features/wellness/utils/correlations';
import type { DailyArchive } from './hooks/useDailyReset';
import type { WeightEntry } from './contexts/AppStateContext';

const {
  Home, Explore, Cocina, More, RecipeDetail, AddMeal, AddTolerance,
  DailyCheckIn, CreateRecipe, CreatePost, AICoach, RealFeelDiary,
  FastingTimer, ImportRecipeURL, Settings, Profile, Pantry,
  WeeklyCheckIn, RialPlus, CreatorVerification, CreatorDashboard, FoodDictionary,
  Challenges, CreatorProfile, PostDetail, StoryViewer, CreateStory,
  Notifications: NotificationsScreen, ChallengeDetail, Progress,
} = screens;

function LoadingSkeleton() {
  return (
    <div className="px-6 max-w-4xl mx-auto space-y-4 animate-pulse pt-8">
      <div className="h-8 w-48 bg-surface-container-low rounded-sm" />
      <div className="h-4 w-72 bg-surface-container-low rounded-sm" />
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="h-32 bg-surface-container-low rounded-sm" />
        <div className="h-32 bg-surface-container-low rounded-sm" />
      </div>
      <div className="h-48 bg-surface-container-low rounded-sm" />
    </div>
  );
}

export default function App() {
  const { theme } = useTheme();
  const { currentScreen, previousScreen, navigateTo } = useNavigation();
  const {
    isPro, showAIBot,
    isFirstTime, setIsFirstTime,
    userProfile, setUserProfile,
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    savedRecipes, setSavedRecipes,
    mealPlan, setMealPlan, shoppingList, setShoppingList,
    communityPosts, toleranceLogs, realFeelLogs,
    checkInStatus, selectedRecipe,
    targetPlanDay, setTargetPlanDay, dictionary,
    dailyLog, setDailyLog,
    weightHistory, nutritionHistory,
    selectedChallengeId,
    isPro: isProState, setIsPro,
    showAIBot: showAIBotState, setShowAIBot,
    handleLogMeal, handleLogMealNow,
    handleSaveRecipe, handleCreatePost, handleAddComment,
    handleAddToleranceLog, handleCreateRecipeSubmit,
    handleRealFeelLog, handleImportRecipe, handleAddToPlan,
    handleCheckIn, handleCompleteCheckIn, navigateToRecipe,
    recipeToEdit,
  } = useAppState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const aiCoachMemory = useMemo(() => {
    const weekAgoDate = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const recentHistory = (nutritionHistory as DailyArchive[]).filter(e => e.date >= weekAgoDate);
    const weeklyNutritionAvg = recentHistory.length > 0
      ? {
          cal: Math.round(recentHistory.reduce((s, e) => s + (e.macros?.consumed?.cal || 0), 0) / recentHistory.length),
          pro: Math.round(recentHistory.reduce((s, e) => s + (e.macros?.consumed?.pro || 0), 0) / recentHistory.length),
          carbs: Math.round(recentHistory.reduce((s, e) => s + (e.macros?.consumed?.carbs || 0), 0) / recentHistory.length),
          fats: Math.round(recentHistory.reduce((s, e) => s + (e.macros?.consumed?.fats || 0), 0) / recentHistory.length),
        }
      : undefined;

    const sortedWeights = [...(weightHistory as WeightEntry[])].sort((a, b) => a.date.localeCompare(b.date));
    const weightTrend = sortedWeights.length > 0
      ? (() => {
          const cur = sortedWeights[sortedWeights.length - 1].kg;
          const weekAgoEntry = sortedWeights.find(e => e.date <= weekAgoDate);
          const delta = weekAgoEntry ? +(cur - weekAgoEntry.kg).toFixed(1) : 0;
          return { current: cur, delta7d: delta, ratePerWeek: delta };
        })()
      : undefined;

    return {
      dailyMacros, checkInStatus, toleranceLogs, savedRecipes,
      userGoal: userProfile.goal,
      intolerances: userProfile.intolerances || [],
      foodDislikes: (userProfile.foodDislikes || []).map((id: string) => dictionary.find(d => d.id === id)?.name || id),
      recentFoodInsights: getFoodInsights(realFeelLogs, dictionary).slice(0, 5).map(i => ({ name: i.ingredientName, tone: i.tone, avgLevel: i.avgLevel })),
      weeklyNutritionAvg,
      weightTrend,
      loggingStreak: dailyLog.length > 0 ? 1 : 0,
    };
  }, [dailyMacros, checkInStatus, toleranceLogs, savedRecipes, userProfile, dictionary, realFeelLogs, nutritionHistory, weightHistory, dailyLog]);

  const handleCreateAction = (action: string) => {
    setIsCreateModalOpen(false);
    if (action === 'log-meal') { setTargetPlanDay(null); navigateTo('add-meal'); }
    if (action === 'log-tolerance') navigateTo('add-tolerance');
    if (action === 'create-recipe') navigateTo('create-recipe');
    if (action === 'post-update') navigateTo('create-post');
    if (action === 'import-url') navigateTo('import-url');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <Home onNavigateToRecipe={navigateToRecipe} onCheckIn={handleCheckIn} onAddMeal={() => navigateTo('add-meal')} onNavigateToPlan={() => navigateTo('cocina')} onNavigateToExplore={() => navigateTo('explore')} onNavigateToProgress={() => navigateTo('progress')} dailyMacros={dailyMacros} setDailyMacros={setDailyMacros} checkInStatus={checkInStatus} onLogMealNow={handleLogMealNow} mealPlan={mealPlan} hydration={hydration} setHydration={setHydration} movement={movement} setMovement={setMovement} userProfile={userProfile} realFeelLogs={realFeelLogs} onRealFeelLog={handleRealFeelLog} dailyLog={dailyLog} setDailyLog={setDailyLog} nutritionHistory={nutritionHistory} />;
      case 'cocina': return <Cocina onAddMeal={(dayIndex) => { setTargetPlanDay(dayIndex); navigateTo('add-meal'); }} onCreateRecipe={() => navigateTo('create-recipe')} onNavigateToRecipe={navigateToRecipe} savedRecipes={savedRecipes} setSavedRecipes={setSavedRecipes} mealPlan={mealPlan} setMealPlan={setMealPlan} shoppingList={shoppingList} setShoppingList={setShoppingList} onLogMeal={handleLogMeal} isPro={isPro} onImportUrl={() => navigateTo('import-url')} />;
      case 'explore': return <Explore onNavigateToRecipe={navigateToRecipe} savedRecipes={savedRecipes} onSaveRecipe={handleSaveRecipe} communityPosts={communityPosts} onAddComment={handleAddComment} />;
      case 'more': return <More navigateTo={navigateTo} />;
      case 'recipe-detail': return <RecipeDetail recipe={selectedRecipe} onBack={() => navigateTo(previousScreen)} onSaveRecipe={handleSaveRecipe} isSaved={savedRecipes.some((r: any) => r.id === selectedRecipe?.id)} onAddToPlan={handleAddToPlan} onLogMealNow={handleLogMealNow} onAddToShoppingList={(items: any) => setShoppingList((prev: any) => [...prev, ...items])} dictionary={dictionary} userProfile={userProfile} />;
      case 'add-meal': return <AddMeal onBack={() => { setTargetPlanDay(null); navigateTo(previousScreen); }} onLogMeal={handleLogMeal} dailyMacros={dailyMacros} savedRecipes={savedRecipes} dictionary={dictionary} />;
      case 'add-tolerance': return <AddTolerance onBack={() => navigateTo(previousScreen)} onAddLog={handleAddToleranceLog} />;
      case 'create-recipe': return <CreateRecipe onBack={() => navigateTo(previousScreen)} onCreateRecipe={handleCreateRecipeSubmit} dictionary={dictionary} />;
      case 'edit-recipe': return <CreateRecipe onBack={() => navigateTo(previousScreen)} onCreateRecipe={handleCreateRecipeSubmit} dictionary={dictionary} initialRecipe={recipeToEdit} />;
      case 'create-post': return <CreatePost onBack={() => navigateTo(previousScreen)} onCreatePost={handleCreatePost} />;
      case 'daily-check-in': return <DailyCheckIn initialStatus={checkInStatus?.status || null} onBack={() => navigateTo(previousScreen)} onComplete={handleCompleteCheckIn} />;
      case 'ai-coach': return <AICoach onBack={() => navigateTo(previousScreen)} isPro={isPro} memoryContext={aiCoachMemory} />;
      case 'profile': return <Profile userProfile={userProfile} onBack={() => navigateTo(previousScreen)} realFeelLogs={realFeelLogs} savedRecipes={savedRecipes} communityPosts={communityPosts} />;
      case 'settings': return <Settings dailyMacros={dailyMacros} setDailyMacros={setDailyMacros} isPro={isProState} setIsPro={setIsPro} showAIBot={showAIBotState} setShowAIBot={setShowAIBot} userProfile={userProfile} setUserProfile={setUserProfile} dictionary={dictionary} />;
      case 'real-feel-diary': return <RealFeelDiary realFeelLogs={realFeelLogs} onBack={() => navigateTo('more')} />;
      case 'fasting-timer': return <FastingTimer onBack={() => navigateTo('more')} />;
      case 'pantry': return <Pantry onBack={() => navigateTo('more')} />;
      case 'weekly-check-in': return <WeeklyCheckIn onBack={() => navigateTo('more')} />;
      case 'rial-plus': return <RialPlus onBack={() => navigateTo('more')} />;
      case 'import-url': return <ImportRecipeURL onBack={() => navigateTo(previousScreen)} onImport={handleImportRecipe} />;
      case 'creator-verification': return <CreatorVerification onBack={() => navigateTo('more')} />;
      case 'creator-dashboard': return <CreatorDashboard onBack={() => navigateTo('more')} />;
      case 'challenges': return <Challenges onBack={() => navigateTo('more')} />;
      case 'creator-profile': return <CreatorProfile onBack={() => navigateTo(previousScreen)} />;
      case 'post-detail': return <PostDetail onBack={() => navigateTo(previousScreen)} />;
      case 'story-viewer': return <StoryViewer onBack={() => navigateTo(previousScreen)} />;
      case 'create-story': return <CreateStory onBack={() => navigateTo(previousScreen)} />;
      case 'notifications': return <NotificationsScreen onBack={() => navigateTo(previousScreen)} />;
      case 'challenge-detail': return <ChallengeDetail onBack={() => navigateTo(previousScreen)} challengeId={selectedChallengeId || 'green-7'} />;
      case 'progress': return <Progress onBack={() => navigateTo(previousScreen)} />;
      case 'food-dictionary': return <FoodDictionary navigateTo={navigateTo} />;
      default: return null;
    }
  };

  return (
    <>
      <Onboarding isOpen={isFirstTime} onClose={() => setIsFirstTime(false)} onComplete={(result) => {
        setUserProfile(result.userProfile);
        setDailyMacros((prev: any) => ({ ...prev, target: result.targets }));
        setIsFirstTime(false);
      }} />
      <div className={`flex h-dvh overflow-hidden bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary ${theme}`}>
        <Toaster theme={theme.includes('dark') ? 'dark' : 'light'} position="top-center" toastOptions={{
          className: 'bg-surface-container-highest border border-outline-variant/20 text-tertiary font-headline font-bold uppercase tracking-widest rounded-sm',
        }} />
        <Sidebar currentScreen={currentScreen} setCurrentScreen={navigateTo} onOpenCreate={() => setIsCreateModalOpen(true)} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <GlobalHeader
            onOpenSettings={() => navigateTo('settings')}
            onOpenProfile={() => navigateTo('profile')}
            onOpenNotifications={() => navigateTo('notifications')}
            userName={userProfile?.name}
            isPro={isPro}
          />
          <main className="flex-1 overflow-y-auto pb-24 md:pb-8 pt-4 hide-scrollbar">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {renderScreen()}
                </div>
              </Suspense>
            </ErrorBoundary>
          </main>
          <div className="fixed right-6 flex flex-col gap-4 z-50 md:bottom-8" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}>
            {currentScreen !== 'ai-coach' && showAIBot && (
              <button
                type="button"
                onClick={() => navigateTo('ai-coach')}
                className="w-14 h-14 bg-surface-container-highest border-2 border-primary text-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/20 transition-transform hover:scale-105"
                aria-label="AI Coach"
              >
                <Sparkles className="w-6 h-6" />
              </button>
            )}
          </div>
          <BottomNav currentScreen={currentScreen} setCurrentScreen={navigateTo} onOpenCreate={() => setIsCreateModalOpen(true)} />
        </div>
        <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSelect={handleCreateAction} />
      </div>
    </>
  );
}
