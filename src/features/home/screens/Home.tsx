import { Plus, Sparkles, ShoppingCart, ChevronRight } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useCallback } from 'react';
import RealFeelSheet from '../../wellness/components/RealFeelSheet';
import NutritionHero from '../components/NutritionHero';
import TodaysMeals from '../components/TodaysMeals';
import HomeHeader from '../components/HomeHeader';
import DatePickerSheet from '../components/DatePickerSheet';
import PastDayBanner from '../components/PastDayBanner';
import SmartInsightCard from '../components/SmartInsightCard';
import StepsCard from '../components/StepsCard';
import TodaysWorkouts from '../components/TodaysWorkouts';
import HydrationCard from '../components/HydrationCard';
import MacroRingsCard from '../components/MacroRingsCard';
import FoodQualityCard from '../components/FoodQualityCard';
import GuidedSetupSection, { GUIDED_DISMISSED_KEY } from '../components/GuidedSetupSection';
import { setNutritionDetailInitialTab } from '../utils/nutrition-detail-nav';
import { useSelectedDayData } from '../hooks/useSelectedDayData';
import { useHomeData } from '../hooks/useHomeData';
import HomeQuickStats from '../components/HomeQuickStats';
import WeeklyMiniDash from '../components/WeeklyMiniDash';
import MealGapSuggestion from '../components/MealGapSuggestion';
import QuickActions from '../components/QuickActions';
import ProgressPreviewCard from '../components/ProgressPreviewCard';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { featureFlags } from '../../../lib/featureFlags';
import { computeDayStatus } from '../utils/dayStatus';
import { createHandleRepeatYesterday } from '../../food/handlers/meal-handlers';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { StoredRealFeelEntry, RealFeelEntry } from '../../../types/wellness';
import type { UserProfile } from '../../../types/user';
import type { Recipe, LoggableMeal } from '../../../types';
import type { DailyMacros } from '../../../contexts/state/useVitalsState';
import InsightRow from '../components/InsightRow';

type Setter<T> = (fn: T | ((prev: T) => T)) => void;
interface HydrationState { consumed: number; target: number }
interface MovementState { steps: number; target: number; activeMinutes: number; activeTarget: number; workoutMinutes: number }

export default function Home({
  onAddMeal,
  onNavigateToPlan,
  dailyMacros,
  userProfile,
  mealPlan,
  onNavigateToRecipe,
  onLogMealNow,
  hydration,
  setHydration,
  movement,
  setMovement,
  realFeelLogs,
  onRealFeelLog,
  dailyLog = [],
  setDailyLog,
  setDailyMacros,
  nutritionHistory = [],
  onNavigateToProgress,
  onNavigateToNutritionDetail,
}: {
  onAddMeal: () => void,
  onNavigateToPlan: () => void,
  onNavigateToProgress?: () => void,
  onNavigateToNutritionDetail?: () => void,
  dailyMacros: DailyMacros,
  setDailyMacros?: Setter<DailyMacros>,
  userProfile: UserProfile,
  mealPlan?: Record<number, Recipe[]>,
  onNavigateToRecipe?: (recipe: Recipe) => void,
  onLogMealNow?: (meal: LoggableMeal, servings: number) => void,
  hydration: HydrationState,
  setHydration: Setter<HydrationState>,
  movement: MovementState,
  setMovement?: Setter<MovementState>,
  realFeelLogs?: StoredRealFeelEntry[],
  onRealFeelLog?: (entry: RealFeelEntry) => void,
  dailyLog?: DailyLogEntry[],
  setDailyLog?: Setter<DailyLogEntry[]>,
  nutritionHistory?: DailyArchive[],
}) {
  const { t } = useI18n();
  const [showRealFeel, setShowRealFeel] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const {
    selectedDate, setSelectedDate, resetToToday,
    workoutLog, handleLogWorkout, handleEditWorkout, handleDeleteWorkout,
    weightHistory, shoppingList, savedRecipes, mergedVariants, foodHistory, followedCreators,
  } = useAppState();

  const { effectiveDailyMacros, effectiveDailyLog, effectiveHydration, effectiveMovement, effectiveWorkoutLog, isViewingToday } =
    useSelectedDayData({ selectedDate, liveDailyMacros: dailyMacros, liveDailyLog: dailyLog, liveHydration: hydration, liveMovement: movement, liveWorkoutLog: workoutLog, history: nutritionHistory });

  const isTrainingDay = workoutLog.length > 0;
  const lastCalRef = useRef(dailyMacros.consumed.cal);
  const [guidedDismissed, setGuidedDismissed] = useState(() => {
    try { return localStorage.getItem(GUIDED_DISMISSED_KEY) === 'true'; } catch { return false; }
  });

  const isSimpleMode = userProfile?.mode === 'simple' || !userProfile?.mode;
  const showGaugeV2Cards = featureFlags.homeGaugeV2 && !isSimpleMode;

  const {
    profile,
    exerciseCalories,
    avgVitality,
    vitalityTrend,
    weekMacros,
    weightTrend,
    streakDays,
    bestStreakDays,
    dailyQuality,
    shoppingPendingCount,
    yesterdayData,
    guidedSteps,
    insights,
    todaysMeals,
    nextMealSuggestion,
    weightDeltaForChip,
  } = useHomeData({
    effectiveDailyMacros,
    effectiveDailyLog,
    movement,
    workoutLog,
    userProfile,
    realFeelLogs: realFeelLogs ?? [],
    nutritionHistory: nutritionHistory ?? [],
    weightHistory: weightHistory ?? [],
    shoppingList,
    savedRecipes,
    mealPlan,
    dailyLog,
    dailyMacros,
    hydration,
    onNavigateToPlan,
    t,
  });

  const handleRepeatYesterday = useCallback(
    () => {
      if (!setDailyLog || !setDailyMacros) return;
      createHandleRepeatYesterday({ setDailyLog, setDailyMacros, nutritionHistory, t })();
    },
    [setDailyLog, setDailyMacros, nutritionHistory, t],
  );

  const handleNextTap = useCallback(() => {
    if (nextMealSuggestion?.recipe && onNavigateToRecipe) {
      onNavigateToRecipe(nextMealSuggestion.recipe);
    }
  }, [nextMealSuggestion, onNavigateToRecipe]);

  // Trigger Real Feel 3 seconds after a meal is logged
  useEffect(() => {
    if (dailyMacros.consumed.cal > lastCalRef.current) {
      lastCalRef.current = dailyMacros.consumed.cal;
      const timer = setTimeout(() => setShowRealFeel(true), 3000);
      return () => clearTimeout(timer);
    }
    lastCalRef.current = dailyMacros.consumed.cal;
  }, [dailyMacros.consumed.cal]);

  const handleAddWater = () => {
    setHydration((prev) => ({ ...prev, consumed: Math.min(prev.consumed + 1, prev.target) }));
  };
  const handleRemoveWater = () => {
    setHydration((prev) => ({ ...prev, consumed: Math.max(prev.consumed - 1, 0) }));
  };

  const handleQuickStatNav = useCallback(
    (target: 'progress' | 'activity' | 'insights') => {
      if (target === 'progress' || target === 'activity') {
        onNavigateToProgress?.();
        return;
      }
      if (target === 'insights' && typeof document !== 'undefined') {
        document.querySelector('[data-testid="home-insights-section"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [onNavigateToProgress],
  );

  return (
    <PageShell maxWidth="wide" spacing="lg">
      {/* 1. Header — fecha + pacing chip + vitality & streak row */}
      <HomeHeader
        avgVitality={avgVitality}
        vitalityTrend={vitalityTrend}
        isSimpleMode={isSimpleMode}
        streakDays={streakDays}
        bestStreakDays={bestStreakDays}
        dayStatus={computeDayStatus(dailyMacros.consumed.cal, dailyMacros.target.cal)}
        onNavigateToProgress={onNavigateToProgress}
        onTapDate={() => setDatePickerOpen(true)}
        selectedDate={selectedDate}
      />

      {!isViewingToday && <PastDayBanner onResetToToday={resetToToday} />}

      {!isSimpleMode && featureFlags.homeGaugeV2 && insights.length > 0 && (
        <SmartInsightCard
          message={insights[0].detail}
          tone={insights[0].tone === 'warning' ? 'warning' : insights[0].tone === 'positive' ? 'positive' : 'neutral'}
        />
      )}

      {/* 2. Guided Setup — first 7 days */}
      {!guidedDismissed && (
        <GuidedSetupSection
          steps={guidedSteps}
          onDismiss={() => {
            localStorage.setItem(GUIDED_DISMISSED_KEY, 'true');
            setGuidedDismissed(true);
          }}
          t={t}
        />
      )}

      {/* 3. Nutrition Hero */}
      <NutritionHero dailyMacros={effectiveDailyMacros} mode={isSimpleMode ? 'simple' : 'advanced'} exerciseCalories={isViewingToday ? exerciseCalories : 0} goal={userProfile?.goal} onNavigateToNutritionDetail={onNavigateToNutritionDetail} />

      {/* 4. HomeQuickStats — chip-row (advanced only; hidden under v2) */}
      {!featureFlags.homeGaugeV2 && (
        <HomeQuickStats
          mode={isSimpleMode ? 'simple' : 'advanced'}
          weightDelta={weightDeltaForChip}
          activityToday={{ minutes: movement.activeMinutes || 0, isTrainingDay }}
          insightCount={insights.length}
          onNavigate={handleQuickStatNav}
        />
      )}

      {showGaugeV2Cards && (
        <SectionCard padding="md" spacing="md" className="scroll-mt-24">
          <MacroRingsCard
            dailyMacros={effectiveDailyMacros}
            anchorId="macros"
            bare
          />
          <hr className="border-0 border-t border-outline-variant/20" />
          <FoodQualityCard
            quality={dailyQuality}
            anchorId="quality"
            bare
            onViewNutrition={onNavigateToNutritionDetail ? () => {
              setNutritionDetailInitialTab('quality');
              onNavigateToNutritionDetail();
            } : undefined}
          />
        </SectionCard>
      )}

      {/* 5. Hydration — extracted to HydrationCard; data-anchor="hydration" preserved inside. */}
      <HydrationCard
        consumed={effectiveHydration.consumed}
        target={effectiveHydration.target}
        onIncrement={handleAddWater}
        onDecrement={handleRemoveWater}
        onTargetChange={isViewingToday ? (n) => setHydration((prev) => ({ ...prev, target: n })) : undefined}
        disabled={!isViewingToday}
        className="scroll-mt-24"
      />

      {/* 6. Today's Meals */}
      <TodaysMeals
        dailyLog={effectiveDailyLog}
        todaysMeals={todaysMeals}
        onLogMealNow={onLogMealNow}
        onNavigateToPlan={onNavigateToPlan}
        onAddMeal={onAddMeal}
        setDailyLog={setDailyLog}
        setDailyMacros={setDailyMacros}
        onNavigateToRecipe={onNavigateToRecipe}
        nextSuggestion={nextMealSuggestion}
        onNextTap={handleNextTap}
        mergedVariants={mergedVariants}
        userGoal={userProfile?.goal}
      />

      {/* 7. Primary Action */}
      <Button onClick={onAddMeal} className="w-full p-4 gap-3 shadow-elev-3 shadow-primary/10 group">
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {t.fab.logMeal}
      </Button>

      {/* 7c. Today's Workouts */}
      <TodaysWorkouts
        workoutLog={effectiveWorkoutLog}
        profile={profile}
        onLogWorkout={(intensity, minutes, p) => handleLogWorkout(intensity, minutes, p)}
        onEditWorkout={(id, intensity, minutes, p) => handleEditWorkout(id, intensity, minutes, p)}
        onDeleteWorkout={(id) => handleDeleteWorkout(id)}
        disabled={!isViewingToday}
      />

      {/* 7d. Steps card */}
      <StepsCard
        movement={{ steps: effectiveMovement.steps, target: effectiveMovement.target }}
        onStepsChange={(newSteps) => isViewingToday && setMovement?.((prev) => ({ ...prev, steps: newSteps }))}
        profile={profile}
        disabled={!isViewingToday}
      />

      {/* 7b. Quick Actions */}
      {dailyLog.length === 0 && yesterdayData && (
        <QuickActions
          yesterdayKcal={yesterdayData.kcal}
          yesterdayCount={yesterdayData.count}
          onRepeatYesterday={handleRepeatYesterday}
        />
      )}

      {/* 8. Personalized macro-gap suggestions */}
      {onLogMealNow && isViewingToday && (
        <MealGapSuggestion
          dailyMacros={effectiveDailyMacros}
          mergedVariants={mergedVariants}
          savedRecipes={savedRecipes}
          mealPlanToday={todaysMeals}
          dailyLog={effectiveDailyLog}
          weeklyArchive={(nutritionHistory ?? []).slice(-7)}
          onNavigateToRecipe={onNavigateToRecipe}
          foodHistory={foodHistory}
          userProfile={userProfile}
          followedCreators={followedCreators}
          userGoal={userProfile?.goal}
          excludeAllergens={userProfile.intolerances ?? []}
          onLogFood={(variant) => {
            const meal = {
              id: variant.id,
              title: variant.name,
              portionDescription: '100g',
              macros: {
                calories: variant.macros.calories,
                protein: variant.macros.protein,
                carbs: variant.macros.carbs,
                fats: variant.macros.fats,
              },
              mealSlot: 'snack',
            };
            onLogMealNow(meal, 1);
          }}
        />
      )}

      {/* 10. Shopping Reminder */}
      {shoppingPendingCount > 0 && (
        <button
          type="button"
          onClick={onNavigateToPlan}
          className="bg-surface-container border border-outline-variant/30 p-4 rounded-sm flex items-center gap-3 w-full min-h-11 hover:border-primary/30 hover:bg-surface-container-high transition-colors"
        >
          <ShoppingCart className="w-4 h-4 text-primary" />
          <span className="text-label font-bold uppercase tracking-widest text-tertiary flex-1 text-left">
            {(t.home.shoppingPending as string)?.replace('{count}', String(shoppingPendingCount))}
          </span>
          <ChevronRight className="w-4 h-4 text-on-surface-variant" />
        </button>
      )}

      {/* ─── advanced-only section below ─────────────────────────────────── */}

      {!isSimpleMode && (
        <WeeklyMiniDash
          calAvg={weekMacros.avg.cal}
          proteinHitDays={weekMacros.hitDays.pro}
          totalDays={weekMacros.daysLogged}
          weekDelta={weightTrend.weekDelta}
          onNavigateToProgress={() => onNavigateToProgress?.()}
        />
      )}

      {!isSimpleMode && !featureFlags.homeRingGrid && (
        <ProgressPreviewCard
          weightHistory={weightHistory}
          unitSystem={userProfile?.unitSystem ?? 'metric'}
          targetWeight={userProfile?.targetWeight}
          onNavigateToProgress={onNavigateToProgress}
        />
      )}

      {!isSimpleMode && onRealFeelLog && (
        <RealFeelSheet
          open={showRealFeel}
          onOpenChange={setShowRealFeel}
          onSubmit={(entry) => { onRealFeelLog(entry); setShowRealFeel(false); }}
          onDismiss={() => setShowRealFeel(false)}
        />
      )}

      {!isSimpleMode && insights.length > 0 && (
        <section className="space-y-3" data-testid="home-insights-section">
          <Heading level="h2" variant="overline" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {t.home.insights}
          </Heading>
          {insights.slice(0, 3).map((ins) => (
            <InsightRow key={ins.id} insight={ins} />
          ))}
        </section>
      )}

      <DatePickerSheet
        open={datePickerOpen}
        onOpenChange={setDatePickerOpen}
        selectedDate={selectedDate}
        todayKcal={dailyMacros.consumed.cal}
        history={nutritionHistory}
        onSelect={setSelectedDate}
      />
    </PageShell>
  );
}
