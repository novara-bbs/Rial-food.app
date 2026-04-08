import React, { useState, Suspense } from 'react';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import CreateModal from './components/CreateModal';
import GlobalHeader from './components/GlobalHeader';
import ErrorBoundary from './components/ErrorBoundary';
import { Sparkles } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useI18n } from './i18n';
import { useNavigation } from './contexts/NavigationContext';
import { useAppState } from './contexts/AppStateContext';
import { Toaster, toast } from 'sonner';

// Lazy-loaded screens
const Home = React.lazy(() => import('./screens/Home'));
const Explore = React.lazy(() => import('./screens/Explore'));
const Cocina = React.lazy(() => import('./screens/Cocina'));
const More = React.lazy(() => import('./screens/More'));
const RecipeDetail = React.lazy(() => import('./screens/RecipeDetail'));
const AddMeal = React.lazy(() => import('./screens/AddMeal'));
const AddTolerance = React.lazy(() => import('./screens/AddTolerance'));
const DailyCheckIn = React.lazy(() => import('./screens/DailyCheckIn'));
const CreateRecipe = React.lazy(() => import('./screens/CreateRecipe'));
const CreatePost = React.lazy(() => import('./screens/CreatePost'));
const AICoach = React.lazy(() => import('./screens/AICoach'));
const RealFeelDiary = React.lazy(() => import('./screens/RealFeelDiary'));
const FastingTimer = React.lazy(() => import('./screens/FastingTimer'));
const ImportRecipeURL = React.lazy(() => import('./screens/ImportRecipeURL'));
const Settings = React.lazy(() => import('./screens/Settings'));
const Profile = React.lazy(() => import('./screens/Profile'));
const Pantry = React.lazy(() => import('./screens/Pantry'));
const WeeklyCheckIn = React.lazy(() => import('./screens/WeeklyCheckIn'));
const RialPlus = React.lazy(() => import('./screens/RialPlus'));
const CreatorVerification = React.lazy(() => import('./screens/CreatorVerification'));
const CreatorDashboard = React.lazy(() => import('./screens/CreatorDashboard'));

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
  const { t } = useI18n();
  const { theme } = useTheme();
  const { currentScreen, previousScreen, navigateTo } = useNavigation();
  const {
    isPro, showAIBot,
    isFirstTime, setIsFirstTime,
    userProfile, setUserProfile,
    dailyMacros, setDailyMacros,
    hydration, setHydration,
    movement, setMovement,
    dailyGoal, setDailyGoal,
    savedRecipes, setSavedRecipes,
    mealPlan, shoppingList, setShoppingList,
    communityPosts, toleranceLogs, realFeelLogs,
    checkInStatus, selectedRecipe,
    targetPlanDay, setTargetPlanDay, dictionary,
    isPro: isProState, setIsPro,
    showAIBot: showAIBotState, setShowAIBot,
    handleLogMeal, handleLogMealNow,
    handleSaveRecipe, handleCreatePost, handleAddComment,
    handleAddToleranceLog, handleCreateRecipeSubmit,
    handleRealFeelLog, handleImportRecipe, handleAddToPlan,
    handleCheckIn, handleCompleteCheckIn, navigateToRecipe,
  } = useAppState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      case 'home': return <Home onNavigateToRecipe={navigateToRecipe} onCheckIn={handleCheckIn} onAddMeal={() => navigateTo('add-meal')} onNavigateToPlan={() => navigateTo('cocina')} onNavigateToExplore={() => navigateTo('explore')} dailyMacros={dailyMacros} checkInStatus={checkInStatus} onLogMealNow={handleLogMealNow} mealPlan={mealPlan} hydration={hydration} setHydration={setHydration} movement={movement} setMovement={setMovement} dailyGoal={dailyGoal} setDailyGoal={setDailyGoal} userProfile={userProfile} realFeelLogs={realFeelLogs} onRealFeelLog={handleRealFeelLog} />;
      case 'cocina': return <Cocina onAddMeal={(dayIndex) => { setTargetPlanDay(dayIndex); navigateTo('add-meal'); }} onCreateRecipe={() => navigateTo('create-recipe')} onNavigateToRecipe={navigateToRecipe} savedRecipes={savedRecipes} setSavedRecipes={setSavedRecipes} mealPlan={mealPlan} shoppingList={shoppingList} setShoppingList={setShoppingList} isPro={isPro} onImportUrl={() => navigateTo('import-url')} />;
      case 'explore': return <Explore onNavigateToRecipe={navigateToRecipe} savedRecipes={savedRecipes} onSaveRecipe={handleSaveRecipe} communityPosts={communityPosts} onAddComment={handleAddComment} />;
      case 'more': return <More navigateTo={navigateTo} />;
      case 'recipe-detail': return <RecipeDetail recipe={selectedRecipe} onBack={() => navigateTo(previousScreen)} onSaveRecipe={handleSaveRecipe} isSaved={savedRecipes.some((r: any) => r.id === selectedRecipe?.id)} onAddToPlan={handleAddToPlan} onLogMealNow={handleLogMealNow} onAddToShoppingList={(items: any) => setShoppingList((prev: any) => [...prev, ...items])} dictionary={dictionary} userProfile={userProfile} />;
      case 'add-meal': return <AddMeal onBack={() => { setTargetPlanDay(null); navigateTo(previousScreen); }} onLogMeal={handleLogMeal} dailyMacros={dailyMacros} savedRecipes={savedRecipes} dictionary={dictionary} />;
      case 'add-tolerance': return <AddTolerance onBack={() => navigateTo(previousScreen)} onAddLog={handleAddToleranceLog} />;
      case 'create-recipe': return <CreateRecipe onBack={() => navigateTo(previousScreen)} onCreateRecipe={handleCreateRecipeSubmit} dictionary={dictionary} />;
      case 'create-post': return <CreatePost onBack={() => navigateTo(previousScreen)} onCreatePost={handleCreatePost} />;
      case 'daily-check-in': return <DailyCheckIn initialStatus={checkInStatus?.status || null} onBack={() => navigateTo(previousScreen)} onComplete={handleCompleteCheckIn} />;
      case 'ai-coach': return <AICoach onBack={() => navigateTo(previousScreen)} isPro={isPro} memoryContext={{ dailyMacros, checkInStatus, toleranceLogs, savedRecipes }} />;
      case 'profile': return <Profile userProfile={userProfile} onBack={() => navigateTo(previousScreen)} realFeelLogs={realFeelLogs} savedRecipes={savedRecipes} communityPosts={communityPosts} />;
      case 'settings': return <Settings dailyMacros={dailyMacros} setDailyMacros={setDailyMacros} isPro={isProState} setIsPro={setIsPro} showAIBot={showAIBotState} setShowAIBot={setShowAIBot} userProfile={userProfile} setUserProfile={setUserProfile} />;
      case 'real-feel-diary': return <RealFeelDiary realFeelLogs={realFeelLogs} onBack={() => navigateTo('more')} />;
      case 'fasting-timer': return <FastingTimer onBack={() => navigateTo('more')} />;
      case 'pantry': return <Pantry onBack={() => navigateTo('more')} />;
      case 'weekly-check-in': return <WeeklyCheckIn onBack={() => navigateTo('more')} />;
      case 'rial-plus': return <RialPlus onBack={() => navigateTo('more')} />;
      case 'import-url': return <ImportRecipeURL onBack={() => navigateTo(previousScreen)} onImport={handleImportRecipe} />;
      case 'creator-verification': return <CreatorVerification onBack={() => navigateTo('more')} />;
      case 'creator-dashboard': return <CreatorDashboard onBack={() => navigateTo('more')} />;
      default: return <Home onNavigateToRecipe={navigateToRecipe} onCheckIn={handleCheckIn} onAddMeal={() => navigateTo('add-meal')} onNavigateToPlan={() => navigateTo('cocina')} onNavigateToExplore={() => navigateTo('explore')} dailyMacros={dailyMacros} checkInStatus={checkInStatus} onLogMealNow={handleLogMealNow} mealPlan={mealPlan} hydration={hydration} setHydration={setHydration} movement={movement} setMovement={setMovement} dailyGoal={dailyGoal} setDailyGoal={setDailyGoal} userProfile={userProfile} realFeelLogs={realFeelLogs} onRealFeelLog={handleRealFeelLog} />;
    }
  };

  return (
    <>
      <Onboarding isOpen={isFirstTime} onClose={() => setIsFirstTime(false)} onComplete={(result) => {
        setUserProfile(result.userProfile);
        setDailyMacros((prev: any) => ({ ...prev, target: result.targets }));
        setIsFirstTime(false);
      }} />
      <div className={`flex h-screen overflow-hidden bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary ${theme}`}>
        <Toaster theme={theme.includes('dark') ? 'dark' : 'light'} position="top-center" toastOptions={{
          className: 'bg-surface-container-highest border border-outline-variant/20 text-tertiary font-headline font-bold uppercase tracking-widest rounded-sm',
        }} />
        <Sidebar currentScreen={currentScreen} setCurrentScreen={navigateTo} onOpenCreate={() => setIsCreateModalOpen(true)} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <GlobalHeader
            onOpenSettings={() => navigateTo('settings')}
            onOpenProfile={() => navigateTo('profile')}
            onOpenNotifications={() => toast.info(t.common.comingSoon)}
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
          <div className="fixed bottom-24 md:bottom-8 right-6 flex flex-col gap-4 z-50">
            {currentScreen !== 'ai-coach' && showAIBot && (
              <button
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
