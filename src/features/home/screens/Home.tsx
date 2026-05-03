import { Plus, CheckCircle2, Sparkles, ShoppingCart, ChevronRight } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { computeDailyQuality } from '../utils/daily-quality';
import { kcalFromSteps, type ActivityProfile } from '../utils/activity-calories';
import { setNutritionDetailInitialTab } from '../utils/nutrition-detail-nav';
import { useSelectedDayData } from '../hooks/useSelectedDayData';
import HomeQuickStats from '../components/HomeQuickStats';
import WeeklyMiniDash from '../components/WeeklyMiniDash';
import MealGapSuggestion from '../components/MealGapSuggestion';
import { findNextPlanned } from '../utils/dedupe-planned';
import { safeSumMacros } from '../utils/safe-macros';
import QuickActions from '../components/QuickActions';
import ProgressPreviewCard from '../components/ProgressPreviewCard';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { getInsights } from '../../wellness/utils/correlations';
import { featureFlags } from '../../../lib/featureFlags';
import { calcVitality } from '../utils/homeWidgets';
import { computeDayStatus } from '../utils/dayStatus';
import { calcWeekMacros } from '../../wellness/utils/week-stats';
import { calcStreaks } from '../../wellness/utils/streaks';
import { calcWeightTrend } from '../../wellness/utils/weight-trend';
import { createHandleRepeatYesterday } from '../../food/handlers/meal-handlers';
import { STORAGE_KEYS } from '../../../lib/storage-keys';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import type { DailyArchive } from '../../../hooks/useDailyReset';
import type { BodySnapshot, StoredRealFeelEntry, RealFeelEntry } from '../../../types/wellness';
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
  // Phase 3 Sprint B3 — selectedDate is global so Home + NutritionDetail share it.
  // Sprint K-fix7 [1.5.211] — also reads workoutLog + handlers (single useAppState call).
  const {
    selectedDate, setSelectedDate, resetToToday,
    workoutLog, handleLogWorkout, handleEditWorkout, handleDeleteWorkout,
    weightHistory, shoppingList, savedRecipes, mergedVariants, foodHistory, followedCreators,
  } = useAppState();

  // Phase 3 Sprint B4 — full day-snapshot swap (today === live, past === archive).
  const { effectiveDailyMacros, effectiveDailyLog, effectiveHydration, effectiveMovement, effectiveWorkoutLog, isViewingToday } =
    useSelectedDayData({ selectedDate, liveDailyMacros: dailyMacros, liveDailyLog: dailyLog, liveHydration: hydration, liveMovement: movement, liveWorkoutLog: workoutLog, history: nutritionHistory });

  // `isTrainingDay` is derived from the log so HomeQuickStats keeps its activity indicator.
  const isTrainingDay = workoutLog.length > 0;
  const lastCalRef = useRef(dailyMacros.consumed.cal);
  const [guidedDismissed, setGuidedDismissed] = useState(() => {
    try { return localStorage.getItem('rial_guidedSetupDismissed') === 'true'; } catch { return false; }
  });

  const isSimpleMode = userProfile?.mode === 'simple' || !userProfile?.mode;

  // Sprint H/v2: TodayCategoryChips removed — card titles already convey the
  // section semantics (ENERGÍA / BALANCE DEL DÍA / MACROS DEL DÍA / CALIDAD).
  // The same gate still controls whether the v2 cards (Balance / Macros /
  // Quality) are shown.
  const showGaugeV2Cards = featureFlags.homeGaugeV2 && !isSimpleMode;

  // Sprint K-fix5 [1.5.209] / K-fix7 [1.5.211] — activity calories computed from
  // real profile-based formulas. Steps via `kcalFromSteps`. Workouts SUM all
  // entries in `workoutLog` (multi-workout per day) — each entry's kcal was
  // frozen at log time, so historical correctness is preserved even when the
  // user later changes weight or sex.
  const profile: ActivityProfile = useMemo(() => ({
    weight: userProfile?.weight,
    sex: userProfile?.sex,
  }), [userProfile?.weight, userProfile?.sex]);

  const exerciseCalories = useMemo(() => {
    const stepKcal = kcalFromSteps(movement.steps, profile);
    const workoutKcal = workoutLog.reduce((sum, w) => sum + w.kcal, 0);
    return stepKcal + workoutKcal;
  }, [movement.steps, workoutLog, profile]);

  // Vitality (Real Score) from RealFeel logs
  const { avgVitality, trend: vitalityTrend } = useMemo(
    () => calcVitality(realFeelLogs || []),
    [realFeelLogs]
  );

  // Weekly progress metrics — canonical calcWeekMacros (Q13)
  // (weightHistory etc. now destructured at the top with workoutLog — Sprint K-fix7).
  const weekMacros = useMemo(
    () => calcWeekMacros(
      nutritionHistory ?? [],
      dailyMacros.target,
      0,
    ),
    [nutritionHistory, dailyMacros.target]
  );
  const weightTrend = useMemo(
    () => calcWeightTrend((weightHistory ?? []) as BodySnapshot[], userProfile?.targetWeight),
    [weightHistory, userProfile?.targetWeight]
  );

  // Streaks — canonical calcStreaks (Q13). Meal-log streak is the one surfaced in the UI.
  // Q15: also expose bestStreakDays to show personal record in the badge.
  const { streakDays, bestStreakDays } = useMemo(() => {
    const streaks = calcStreaks({
      history: nutritionHistory ?? [],
      realFeelLogs: realFeelLogs ?? [],
      todayHasMeals: dailyLog.length > 0,
    });
    return { streakDays: streaks.mealLog.current, bestStreakDays: streaks.mealLog.best };
  }, [nutritionHistory, realFeelLogs, dailyLog.length]);

  // Daily food-quality — Sprint D. Computes 6 metrics from the effective log
  // (live today or archived past day). Memoized on log + fiber consumed.
  const dailyQuality = useMemo(
    () =>
      computeDailyQuality({
        log: effectiveDailyLog,
        consumedFiber: effectiveDailyMacros.consumed.fiber ?? 0,
        targetFiber: effectiveDailyMacros.target.fiber,
      }),
    [effectiveDailyLog, effectiveDailyMacros.consumed.fiber, effectiveDailyMacros.target.fiber],
  );

  // Shopping pending count
  const shoppingPendingCount = useMemo(
    () => shoppingList.filter((item) => !item.checked).length || 0,
    [shoppingList]
  );

  // Yesterday's data for "Repeat yesterday" quick action
  const yesterdayData = useMemo(() => {
    const sorted = [...nutritionHistory].sort((a, b) => b.date.localeCompare(a.date));
    const yesterday = sorted[0];
    if (!yesterday?.dailyLog?.length) return null;
    const kcal = safeSumMacros(yesterday.dailyLog).cal;
    return { kcal, count: yesterday.dailyLog.length };
  }, [nutritionHistory]);

  // Repeat yesterday handler
  const handleRepeatYesterday = useCallback(
    () => {
      if (!setDailyLog || !setDailyMacros) return;
      createHandleRepeatYesterday({ setDailyLog, setDailyMacros, nutritionHistory, t })();
    },
    [setDailyLog, setDailyMacros, nutritionHistory, t]
  );

  // Guided Setup steps — memoized so toggling unrelated state doesn't rebuild.
  // Reads STORAGE_KEYS.RECIPE_VIEWED eagerly at render time (flag flips when user
  // visits RecipeDetail for the first time; see createHandleNavigateToRecipe).
  const guidedSteps = useMemo(() => {
    const hasLoggedMeal = dailyLog.length > 0 || (nutritionHistory ?? []).some((h) => h.mealCount > 0);
    const hasPlannedDay = Object.values(mealPlan || {}).some((d) => d.length > 0);
    const hasViewedRecipe =
      typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.RECIPE_VIEWED);
    return [
      { id: 'profile', label: t.guidedSetup.configProfile, done: true },
      { id: 'meal', label: t.guidedSetup.logFirstMeal, done: hasLoggedMeal },
      { id: 'recipe', label: t.guidedSetup.exploreRecipe, done: hasViewedRecipe },
      { id: 'plan', label: t.guidedSetup.planFirstDay, done: hasPlannedDay, action: onNavigateToPlan },
    ];
  }, [dailyLog.length, nutritionHistory, mealPlan, onNavigateToPlan, t]);
  const guidedCompleted = useMemo(() => guidedSteps.filter((s) => s.done).length, [guidedSteps]);

  // Smart Insights — memoized; heavy computation over logs + history
  const insights = useMemo(
    () =>
      getInsights({
        realFeelLogs: realFeelLogs || [],
        savedRecipes: [],
        mealPlan: mealPlan || {},
        dailyMacros,
        hydration,
        streakDays,
      }),
    [realFeelLogs, mealPlan, dailyMacros, hydration, streakDays]
  );

  // Next meal suggestion — planned meal first, fallback to best macro-filling
  // recipe. Hour-gating (`<20`) keeps the inline banner inside TodaysMeals
  // from suggesting more food past dinner. The previous `dailyLog.length === 0`
  // gate was dropped in [1.5.182] because the banner is now embedded in the
  // unified TodaysMeals card and stays useful even before the first log.
  const nextMealSuggestion = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 20) return null;

    const today = new Date().getDay();
    const dayIdx = today === 0 ? 6 : today - 1;
    const planned = (mealPlan?.[dayIdx] ?? []) as (Recipe & { time?: string })[];
    const unloggedPlanned = findNextPlanned(planned, dailyLog);
    if (unloggedPlanned) {
      // Defensive `?? 0` against malformed planned entries. Some legacy
      // localStorage shapes lacked the canonical `macros` object — guarding
      // here keeps the home resilient instead of crashing the render tree.
      return {
        title: unloggedPlanned.title,
        cal: unloggedPlanned.macros?.calories ?? 0,
        pro: unloggedPlanned.macros?.protein ?? 0,
        time: unloggedPlanned.time,
        source: 'plan' as const,
        recipe: unloggedPlanned,
      };
    }

    // Fallback: best macro-filling recipe from saved
    const remainingPro = dailyMacros.target.pro - dailyMacros.consumed.pro;
    if (remainingPro > 10 && savedRecipes.length > 0) {
      const sorted = [...savedRecipes].sort((a, b) => {
        const aPro = a.macros?.protein ?? 0;
        const bPro = b.macros?.protein ?? 0;
        return Math.abs(remainingPro - aPro) - Math.abs(remainingPro - bPro);
      });
      const best = sorted[0];
      if (best) {
        return {
          title: best.title,
          cal: best.macros?.calories ?? 0,
          pro: best.macros?.protein ?? 0,
          source: 'recipe' as const,
          recipe: best,
        };
      }
    }
    return null;
  }, [dailyLog, mealPlan, savedRecipes, dailyMacros]);

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

  // Today's planned meals
  const today = new Date().getDay();
  const adjustedDayIndex = today === 0 ? 6 : today - 1;
  const todaysMeals = mealPlan?.[adjustedDayIndex] || [];

  const handleAddWater = () => {
    setHydration((prev) => ({ ...prev, consumed: Math.min(prev.consumed + 1, prev.target) }));
  };
  const handleRemoveWater = () => {
    setHydration((prev) => ({ ...prev, consumed: Math.max(prev.consumed - 1, 0) }));
  };

  // Phase 1 — quick-stats chip-row navigation. Resolves each chip target to
  // an existing Home action/route, reusing callbacks already wired from
  // upstream. `hydration` and `insights` focus in-page surfaces (the
  // Hydration SectionCard and Smart Insights block); `progress` + `activity`
  // delegate to their tab routes. No new bottom sheets (§Phase 1 conservative).
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

  const weightDeltaForChip = useMemo(() => {
    if (weightTrend.weekDelta == null) return undefined;
    return {
      value: weightTrend.weekDelta,
      unit: (userProfile?.unitSystem === 'imperial' ? 'lb' : 'kg') as 'kg' | 'lb',
      since: 'week' as const,
    };
  }, [weightTrend.weekDelta, userProfile?.unitSystem]);

  return (
    <PageShell maxWidth="wide" spacing="lg">
      {/* 1. Header — fecha + pacing chip + vitality & streak row (Bevel-style) */}
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

      {/* Phase 3 Sprint B4 — read-only banner when viewing a past day. */}
      {!isViewingToday && <PastDayBanner onResetToToday={resetToToday} />}

      {/* Sprint C — SmartInsightCard. Surfaces the top contextual insight
            above the gauge. Hidden when there are no insights yet (the
            wellness engine needs ≥7 days of Real Feel logs to produce most
            patterns); we don't render an empty state because the rest of
            the home already coaches the user. */}
      {!isSimpleMode && featureFlags.homeGaugeV2 && insights.length > 0 && (
        <SmartInsightCard
          message={insights[0].detail}
          tone={insights[0].tone === 'warning' ? 'warning' : insights[0].tone === 'positive' ? 'positive' : 'neutral'}
        />
      )}

      {/* 2. Guided Setup — first 7 days (p-4 to match other tinted-primary cards) */}
      {!guidedDismissed && (
        <section className="bg-surface-container-low border border-primary/20 p-4 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-headline font-bold text-body-sm uppercase tracking-widest text-tertiary">{t.guidedSetup.title}</span>
            </div>
            <span className="font-mono text-micro text-primary font-bold">{guidedCompleted}/{guidedSteps.length}</span>
          </div>
          <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(guidedCompleted / guidedSteps.length) * 100}%` }} />
          </div>
          <div className="space-y-2">
            {guidedSteps.map((step) => (
              <button
                type="button"
                key={step.id}
                onClick={step.done ? undefined : step.action}
                disabled={step.done}
                className={`w-full flex items-center gap-3 text-left min-h-11 px-3 rounded-sm transition-colors ${step.done ? 'opacity-60' : 'hover:bg-surface-container-highest cursor-pointer'}`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-outline-variant/40 shrink-0" />
                )}
                <span className={`text-label font-bold uppercase tracking-widest ${step.done ? 'text-on-surface-variant line-through' : 'text-tertiary'}`}>{step.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('rial_guidedSetupDismissed', 'true');
              setGuidedDismissed(true);
            }}
            className="w-full text-center text-micro font-bold text-on-surface-variant uppercase tracking-widest hover:underline min-h-11 pt-1"
          >
            {t.guidedSetup.dismiss}
          </button>
        </section>
      )}

      {/* 3. Nutrition Hero — above the fold (Q15: goal prop for ICP-adaptive status chip) */}
      <NutritionHero dailyMacros={effectiveDailyMacros} mode={isSimpleMode ? 'simple' : 'advanced'} exerciseCalories={isViewingToday ? exerciseCalories : 0} goal={userProfile?.goal} onNavigateToNutritionDetail={onNavigateToNutritionDetail} />

      {/* Sprint H: TodayCategoryChips removed — card titles already convey
          section semantics (Energía / Balance / Macros / Calidad). */}

      {/* 4. HomeQuickStats — chip-row (advanced only; hidden under v2 since
            its info is folded into the new MacroRingsCard / FoodQualityCard). */}
      {!featureFlags.homeGaugeV2 && (
        <HomeQuickStats
          mode={isSimpleMode ? 'simple' : 'advanced'}
          weightDelta={weightDeltaForChip}
          activityToday={{ minutes: movement.activeMinutes || 0, isTrainingDay }}
          insightCount={insights.length}
          onNavigate={handleQuickStatNav}
        />
      )}

      {/* Sprint K-fix7 [1.5.211] — Activity card split:
            • StepsCard moves DOWN below TodaysWorkouts (next to deporte)
            • TodaysWorkouts moves DOWN below the meal CTA (parallel to TodaysMeals)
            • This slot now only renders the merged Nutrition card (Macros + Calidad). */}
      {showGaugeV2Cards && (
        <SectionCard
          padding="md"
          spacing="md"
          className="scroll-mt-24"
        >
          {/* Macros rings — no title (self-evident) */}
          <MacroRingsCard
            dailyMacros={effectiveDailyMacros}
            anchorId="macros"
            bare
          />
          {/* Hairline divider between Macros and Calidad */}
          <hr className="border-0 border-t border-outline-variant/20" />
          {/* Calidad de la comida — collapsible, with score ring + 6 metrics */}
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

      {/* 5. Hydration — immediately after Macros+Calidad (Sprint K reorder).
            Extracted to HydrationCard; data-anchor="hydration" preserved inside. */}
      <HydrationCard
        consumed={effectiveHydration.consumed}
        target={effectiveHydration.target}
        onIncrement={handleAddWater}
        onDecrement={handleRemoveWater}
        onTargetChange={isViewingToday ? (n) => setHydration((prev) => ({ ...prev, target: n })) : undefined}
        disabled={!isViewingToday}
        className="scroll-mt-24"
      />

      {/* 6. Today's Meals — unified Plan + Log + Next Up banner [1.5.182] */}
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

      {/* 7. Primary Action — single Log Meal button (Check-in collapsed into FAB). */}
      <Button
        onClick={onAddMeal}
        className="w-full p-4 gap-3 shadow-elev-3 shadow-primary/10 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {t.fab.logMeal}
      </Button>

      {/* 7c. Sprint K-fix7 [1.5.211] — Today's Workouts — parallel timeline to
            TodaysMeals. Multi-workout per day with intensity + minutes per entry,
            kcal frozen at log time. Reuses ExerciseLogSheet for add/edit. */}
      <TodaysWorkouts
        workoutLog={effectiveWorkoutLog}
        profile={profile}
        onLogWorkout={(intensity, minutes, p) => handleLogWorkout(intensity, minutes, p)}
        onEditWorkout={(id, intensity, minutes, p) => handleEditWorkout(id, intensity, minutes, p)}
        onDeleteWorkout={(id) => handleDeleteWorkout(id)}
        disabled={!isViewingToday}
      />

      {/* 7d. Sprint K-fix7 [1.5.211] — Steps card (split from HealthAndExerciseCard).
            Steps are a continuous accumulator (NEAT) — they don't fit the timeline
            metaphor, but they're grouped here visually with the Deporte block. */}
      <StepsCard
        movement={{ steps: effectiveMovement.steps, target: effectiveMovement.target }}
        onStepsChange={(newSteps) => isViewingToday && setMovement?.((prev) => ({ ...prev, steps: newSteps }))}
        profile={profile}
        disabled={!isViewingToday}
      />

      {/* 7b. Quick Actions — repeat yesterday (only when no meals logged today) */}
      {dailyLog.length === 0 && yesterdayData && (
        <QuickActions
          yesterdayKcal={yesterdayData.kcal}
          yesterdayCount={yesterdayData.count}
          onRepeatYesterday={handleRepeatYesterday}
        />
      )}

      {/* 8. P11 [1.5.69] — Qué me falta hoy: personalized macro-gap suggestions.
            Sprint 50 [1.5.164] — also surfaces recipes from the user's vault
            (planned-today + not-eaten-today bias) before the ingredients block. */}
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

      {/* 10. Shopping Reminder — conditional (p-4 homologado con otras tinted cards) */}
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

      {/* 11. Weekly Mini Dashboard — advanced mode only */}
      {!isSimpleMode && (
        <WeeklyMiniDash
          calAvg={weekMacros.avg.cal}
          proteinHitDays={weekMacros.hitDays.pro}
          totalDays={weekMacros.daysLogged}
          weekDelta={weightTrend.weekDelta}
          onNavigateToProgress={() => onNavigateToProgress?.()}
        />
      )}

      {/* 12. Progress Preview Card — advanced only (hidden when homeRingGrid flag on). */}
      {!isSimpleMode && !featureFlags.homeRingGrid && (
        <ProgressPreviewCard
          weightHistory={weightHistory}
          unitSystem={userProfile?.unitSystem ?? 'metric'}
          targetWeight={userProfile?.targetWeight}
          onNavigateToProgress={onNavigateToProgress}
        />
      )}

      {/* 13. Real Feel — BottomSheet popup, opens 3s post-meal-log (Sprint K-fix3 [1.5.207]).
            Replaces the previous in-flow card section. */}
      {!isSimpleMode && onRealFeelLog && (
        <RealFeelSheet
          open={showRealFeel}
          onOpenChange={setShowRealFeel}
          onSubmit={(entry) => { onRealFeelLog(entry); setShowRealFeel(false); }}
          onDismiss={() => setShowRealFeel(false)}
        />
      )}

      {/* 16. Smart Insights — advanced only */}
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
