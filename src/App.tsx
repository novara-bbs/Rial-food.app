import React, { useState } from 'react';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Home from './screens/Home';
import Explore from './screens/Explore';
import Cocina from './screens/Cocina';
import More from './screens/More';
import RecipeDetail from './screens/RecipeDetail';
import AddMeal from './screens/AddMeal';
import AddTolerance from './screens/AddTolerance';
import DailyCheckIn from './screens/DailyCheckIn';
import CreateRecipe from './screens/CreateRecipe';
import CreatePost from './screens/CreatePost';
import CreateModal from './components/CreateModal';
import AICoach from './screens/AICoach';
import RealFeelDiary from './screens/RealFeelDiary';
import FastingTimer from './screens/FastingTimer';
import ImportRecipeURL from './screens/ImportRecipeURL';
import Settings from './screens/Settings';
import Profile from './screens/Profile';
import Pantry from './screens/Pantry';
import WeeklyCheckIn from './screens/WeeklyCheckIn';
import RialPlus from './screens/RialPlus';
import GlobalHeader from './components/GlobalHeader';
import { Sparkles } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useI18n } from './i18n';
import { useNavigation } from './contexts/NavigationContext';
import { useAppState } from './contexts/AppStateContext';
import { Toaster, toast } from 'sonner';

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
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderScreen()}
            </div>
          </main>
          <div className="fixed bottom-24 md:bottom-8 right-6 flex flex-col gap-4 z-50">
            {currentScreen !== 'ai-coach' && showAIBot && (
              <button
                onClick={() => navigateTo('ai-coach')}
                className="w-14 h-14 bg-surface-container-highest border-2 border-primary text-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/20 transition-transform hover:scale-105"
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
