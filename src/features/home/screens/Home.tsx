import { Plus, CheckCircle2, Droplets, Sparkles, ShoppingCart, ChevronRight, BarChart3 } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import RealFeelInline from '../../wellness/components/RealFeelInline';
import NutritionHero from '../components/NutritionHero';
import TodaysMeals from '../components/TodaysMeals';
import ActivityRow from '../components/ActivityRow';
import HomeHeader from '../components/HomeHeader';
import HomeQuickStats from '../components/HomeQuickStats';
import WeeklyMiniDash from '../components/WeeklyMiniDash';
import NextMealSuggestion from '../components/NextMealSuggestion';
import MealGapSuggestion from '../components/MealGapSuggestion';
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
interface MovementState { steps: number; target: number; activeMinutes: number; activeTarget: number }

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
}: {
  onAddMeal: () => void,
  onNavigateToPlan: () => void,
  onNavigateToProgress?: () => void,
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
  const [isEditingHydration, setIsEditingHydration] = useState(false);
  const [showRealFeel, setShowRealFeel] = useState(false);
  const [isTrainingDay, setIsTrainingDay] = useState(false);
  const lastCalRef = useRef(dailyMacros.consumed.cal);
  const [guidedDismissed, setGuidedDismissed] = useState(() => {
    try { return localStorage.getItem('rial_guidedSetupDismissed') === 'true'; } catch { return false; }
  });

  const isSimpleMode = userProfile?.mode === 'simple' || !userProfile?.mode;

  // Derive exercise calories from active minutes + training day
  const exerciseCalories = useMemo(() => {
    const mins = movement.activeMinutes || 0;
    if (isTrainingDay) return Math.max(200, Math.round(mins * 5));
    return Math.round(mins * 3);
  }, [movement.activeMinutes, isTrainingDay]);

  // Vitality (Real Score) from RealFeel logs
  const { avgVitality, trend: vitalityTrend } = useMemo(
    () => calcVitality(realFeelLogs || []),
    [realFeelLogs]
  );

  // Weekly progress metrics — canonical calcWeekMacros (Q13)
  const { weightHistory, shoppingList, savedRecipes, mergedVariants, foodHistory } = useAppState();
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
    const kcal = yesterday.dailyLog.reduce((s: number, e) => s + (e.macros?.cal || 0), 0);
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

  // Next meal suggestion — planned meal or best macro-filling recipe
  const nextMealSuggestion = useMemo(() => {
    const hour = new Date().getHours();
    const nextSlot = hour < 10 ? 'lunch' : hour < 15 ? 'dinner' : hour < 20 ? 'snack' : null;
    if (!nextSlot || dailyLog.length === 0) return null;

    // Check planned meals first
    const today = new Date().getDay();
    const dayIdx = today === 0 ? 6 : today - 1;
    const planned = mealPlan?.[dayIdx] ?? [];
    const loggedTitles = new Set(dailyLog.map(e => e.title.toLowerCase()));
    const unloggedPlanned = planned.find((m) => !loggedTitles.has(m.title.toLowerCase()));
    if (unloggedPlanned) {
      return {
        title: unloggedPlanned.title,
        cal: unloggedPlanned.macros.calories,
        pro: unloggedPlanned.macros.protein,
        source: 'plan' as const,
        recipe: unloggedPlanned,
      };
    }

    // Fallback: best macro-filling recipe from saved
    const remainingPro = dailyMacros.target.pro - dailyMacros.consumed.pro;
    if (remainingPro > 10 && savedRecipes.length > 0) {
      const sorted = [...savedRecipes].sort((a, b) => {
        const aPro = a.macros.protein;
        const bPro = b.macros.protein;
        return Math.abs(remainingPro - aPro) - Math.abs(remainingPro - bPro);
      });
      const best = sorted[0];
      if (best) {
        return {
          title: best.title,
          cal: best.macros.calories,
          pro: best.macros.protein,
          source: 'recipe' as const,
          recipe: best,
        };
      }
    }
    return null;
  }, [dailyLog, mealPlan, savedRecipes, dailyMacros]);

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
    setHydration((prev) => ({ ...prev, consumed: Math.min(prev.consumed + 1, prev.target + 5) }));
  };

  // Phase 1 — quick-stats chip-row navigation. Resolves each chip target to
  // an existing Home action/route, reusing callbacks already wired from
  // upstream. `hydration` and `insights` focus in-page surfaces (the
  // Hydration SectionCard and Smart Insights block); `progress` + `activity`
  // delegate to their tab routes. No new bottom sheets (§Phase 1 conservative).
  const handleQuickStatNav = useCallback(
    (target: 'hydration' | 'progress' | 'activity' | 'insights') => {
      if (target === 'progress' || target === 'activity') {
        onNavigateToProgress?.();
        return;
      }
      if (target === 'hydration') {
        setIsEditingHydration(true);
        if (typeof document !== 'undefined') {
          document.querySelector('[data-testid="home-hydration-card"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
      />

      {/* 2. Guided Setup — first 7 days (p-4 to match other tinted-primary cards) */}
      {!guidedDismissed && (
        <section className="bg-surface-container-low border border-primary/20 p-4 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary">{t.guidedSetup.title}</span>
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
      <NutritionHero dailyMacros={dailyMacros} mode={isSimpleMode ? 'simple' : 'advanced'} exerciseCalories={exerciseCalories} goal={userProfile?.goal} />

      {/* 4. HomeQuickStats — chip-row (advanced only; simple returns null) */}
      <HomeQuickStats
        mode={isSimpleMode ? 'simple' : 'advanced'}
        hydration={hydration}
        weightDelta={weightDeltaForChip}
        activityToday={{ minutes: movement.activeMinutes || 0, isTrainingDay }}
        insightCount={insights.length}
        onNavigate={handleQuickStatNav}
      />

      {/* 5. Today's Meals — primary action surface (moved up from pos 7) */}
      <TodaysMeals
        dailyLog={dailyLog}
        todaysMeals={todaysMeals}
        onLogMealNow={onLogMealNow}
        onNavigateToPlan={onNavigateToPlan}
        onAddMeal={onAddMeal}
        setDailyLog={setDailyLog}
        setDailyMacros={setDailyMacros}
        onNavigateToRecipe={onNavigateToRecipe}
        mergedVariants={mergedVariants}
        userGoal={userProfile?.goal}
      />

      {/* 6. Primary Action — single Log Meal button (Check-in collapsed into FAB). */}
      <Button
        onClick={onAddMeal}
        className="w-full p-4 gap-3 shadow-elev-3 shadow-primary/10 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {t.fab.logMeal}
      </Button>

      {/* 6b. Quick Actions — repeat yesterday (only when no meals logged today) */}
      {dailyLog.length === 0 && yesterdayData && (
        <QuickActions
          yesterdayKcal={yesterdayData.kcal}
          yesterdayCount={yesterdayData.count}
          onRepeatYesterday={handleRepeatYesterday}
        />
      )}

      {/* 7. Hydration — compact row (ad-hoc divider replaced with nested SectionCard padding) */}
      <SectionCard padding="md" spacing="md">
        <div
          className="flex items-center justify-between"
          data-testid="home-hydration-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-secondary/10 rounded-full flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5 text-brand-secondary" />
            </div>
            <div>
              <p className="font-label text-micro text-on-surface-variant uppercase tracking-widest">{t.home.water}</p>
              <p className="font-headline font-bold text-sm text-tertiary uppercase">{hydration.consumed} / {hydration.target} {t.home.cups}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingHydration(!isEditingHydration)}
              className="text-micro text-brand-secondary hover:underline font-bold uppercase tracking-widest min-h-11 px-3"
            >
              {isEditingHydration ? t.home.close : t.home.edit}
            </button>
            <Button
              variant="brand"
              size="icon"
              onClick={handleAddWater}
              className="rounded-full shadow-elev-3 shadow-secondary/20 active:scale-95 shrink-0"
              aria-label={t.home.addWater ?? 'Add water'}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {isEditingHydration && (
          <div className="pt-3 border-t border-outline-variant/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">{t.home.dailyTarget} ({t.home.cups})</span>
              <span className="font-headline font-bold text-sm text-brand-secondary">{hydration.target}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={hydration.target}
              onChange={(e) => setHydration({ ...hydration, target: parseInt(e.target.value) })}
              aria-label={`${t.home.dailyTarget} (${t.home.cups})`}
              className="w-full accent-secondary"
            />
          </div>
        )}
      </SectionCard>

      {/* 8. Next Meal Suggestion — after logging at least 1 meal */}
      <NextMealSuggestion
        suggestion={nextMealSuggestion}
        onTap={() => {
          if (nextMealSuggestion?.recipe && onNavigateToRecipe) {
            onNavigateToRecipe(nextMealSuggestion.recipe);
          }
        }}
      />

      {/* 9. P11 [1.5.69] — Qué me falta hoy: personalized macro-gap suggestions.
            Sprint 50 [1.5.164] — also surfaces recipes from the user's vault
            (planned-today + not-eaten-today bias) before the ingredients block. */}
      {onLogMealNow && (
        <MealGapSuggestion
          dailyMacros={dailyMacros}
          mergedVariants={mergedVariants}
          savedRecipes={savedRecipes}
          mealPlanToday={todaysMeals}
          dailyLog={dailyLog}
          onNavigateToRecipe={onNavigateToRecipe}
          foodHistory={foodHistory}
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

      {/* 13. Progress deep-link banner — advanced only, visible when history exists */}
      {!isSimpleMode && onNavigateToProgress && nutritionHistory.length > 0 && (
        <Button
          variant="ghost"
          onClick={onNavigateToProgress}
          className="w-full p-4 gap-4 text-left h-auto bg-primary/5 border border-primary/20 hover:bg-primary/10"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">{t.progress.title}</p>
            <p className="text-caption text-on-surface-variant mt-0.5 leading-relaxed">{t.progress.desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary shrink-0" />
        </Button>
      )}

      {/* 14. Activity — advanced only */}
      {!isSimpleMode && (
        <ActivityRow
          movement={movement}
          setMovement={setMovement}
          isTrainingDay={isTrainingDay}
          setIsTrainingDay={setIsTrainingDay}
        />
      )}

      {/* 15. Real Feel — conditional post-meal, advanced only */}
      {!isSimpleMode && showRealFeel && onRealFeelLog && (
        <section>
          <RealFeelInline
            onSubmit={(entry) => { onRealFeelLog(entry); setShowRealFeel(false); }}
            onDismiss={() => setShowRealFeel(false)}
          />
        </section>
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
    </PageShell>
  );
}
