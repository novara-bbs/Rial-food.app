import { Flame, Plus, CheckCircle2, Droplets, Sparkles, Sun, Moon, ShoppingCart, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import RealFeelInline from '../../wellness/components/RealFeelInline';
import NutritionHero from '../components/NutritionHero';
import TodaysMeals from '../components/TodaysMeals';
import ActivityRow from '../components/ActivityRow';
import RealScoreBadge from '../components/RealScoreBadge';
import WeeklyMiniDash from '../components/WeeklyMiniDash';
import NextMealSuggestion from '../components/NextMealSuggestion';
import QuickActions from '../components/QuickActions';
import { useI18n } from '../../../i18n';
import { useAppState } from '../../../contexts/AppStateContext';
import { calculateStreak } from '../../profile/utils/gamification';
import { getInsights } from '../../wellness/utils/correlations';
import { calcVitality, calcWeeklyProgress } from '../utils/homeWidgets';
import { createHandleRepeatYesterday } from '../../food/handlers/meal-handlers';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

export default function Home({
  onCheckIn,
  onAddMeal,
  onNavigateToPlan,
  onNavigateToExplore,
  checkInStatus,
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
  onCheckIn: (status?: string) => void,
  onAddMeal: () => void,
  onNavigateToPlan: () => void,
  onNavigateToExplore: () => void,
  onNavigateToProgress?: () => void,
  checkInStatus: any,
  dailyMacros: any,
  setDailyMacros?: (fn: any) => void,
  userProfile: any,
  mealPlan?: any,
  onNavigateToRecipe?: (recipe: any) => void,
  onLogMealNow?: (recipe: any, servings: number) => void,
  hydration: { consumed: number, target: number },
  setHydration: (h: any) => void,
  movement: { steps: number, target: number, activeMinutes: number, activeTarget: number },
  setMovement?: (m: any) => void,
  realFeelLogs?: any[],
  onRealFeelLog?: (entry: any) => void,
  dailyLog?: DailyLogEntry[],
  setDailyLog?: (fn: any) => void,
  nutritionHistory?: any[],
}) {
  const { t } = useI18n();
  const [greeting, setGreeting] = useState(t.home.goodMorning);
  const [timeIcon, setTimeIcon] = useState(<Sun className="w-6 h-6 text-amber-400" />);
  const [isEditingHydration, setIsEditingHydration] = useState(false);
  const [showRealFeel, setShowRealFeel] = useState(false);
  const [isTrainingDay, setIsTrainingDay] = useState(false);
  const lastCalRef = useRef(dailyMacros.consumed.cal);
  const [guidedDismissed, setGuidedDismissed] = useState(() => {
    try { return localStorage.getItem('rial_guidedSetupDismissed') === 'true'; } catch { return false; }
  });

  const streakDays = calculateStreak((realFeelLogs || []).map((l: any) => l.date).filter(Boolean));
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

  // Weekly progress metrics
  const { weightHistory, shoppingList, savedRecipes } = useAppState();
  const weeklyProgress = useMemo(
    () => calcWeeklyProgress(nutritionHistory as any[], weightHistory as any[], dailyMacros.target.pro),
    [nutritionHistory, weightHistory, dailyMacros.target.pro]
  );

  // Shopping pending count
  const shoppingPendingCount = useMemo(
    () => (shoppingList as any[])?.filter((item: any) => !item.checked).length || 0,
    [shoppingList]
  );

  // Yesterday's data for "Repeat yesterday" quick action
  const yesterdayData = useMemo(() => {
    const sorted = [...nutritionHistory].sort((a: any, b: any) => b.date.localeCompare(a.date));
    const yesterday = sorted[0] as any;
    if (!yesterday?.dailyLog?.length) return null;
    const kcal = yesterday.dailyLog.reduce((s: number, e: any) => s + (e.macros?.cal || 0), 0);
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

  // Next meal suggestion — planned meal or best macro-filling recipe
  const nextMealSuggestion = useMemo(() => {
    const hour = new Date().getHours();
    const nextSlot = hour < 10 ? 'lunch' : hour < 15 ? 'dinner' : hour < 20 ? 'snack' : null;
    if (!nextSlot || dailyLog.length === 0) return null;

    // Check planned meals first
    const today = new Date().getDay();
    const dayIdx = today === 0 ? 6 : today - 1;
    const planned = (mealPlan?.[dayIdx] || []) as any[];
    const loggedTitles = new Set(dailyLog.map(e => e.title.toLowerCase()));
    const unloggedPlanned = planned.find((m: any) => !loggedTitles.has((m.title || m.name || '').toLowerCase()));
    if (unloggedPlanned) {
      return {
        title: unloggedPlanned.title || unloggedPlanned.name,
        cal: unloggedPlanned.cal || unloggedPlanned.macros?.calories || 0,
        pro: unloggedPlanned.pro || unloggedPlanned.macros?.protein || 0,
        source: 'plan' as const,
        recipe: unloggedPlanned,
      };
    }

    // Fallback: best macro-filling recipe from saved
    const remainingPro = dailyMacros.target.pro - dailyMacros.consumed.pro;
    if (remainingPro > 10 && (savedRecipes as any[])?.length > 0) {
      const sorted = [...(savedRecipes as any[])].sort((a: any, b: any) => {
        const aPro = a.pro || a.macros?.protein || 0;
        const bPro = b.pro || b.macros?.protein || 0;
        return Math.abs(remainingPro - aPro) - Math.abs(remainingPro - bPro);
      });
      const best = sorted[0];
      if (best) {
        return {
          title: best.title || best.name,
          cal: best.cal || best.macros?.calories || 0,
          pro: best.pro || best.macros?.protein || 0,
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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) {
      setGreeting(t.home.goodAfternoon);
      setTimeIcon(<Sun className="w-6 h-6 text-amber-500" />);
    } else if (hour >= 17) {
      setGreeting(t.home.goodEvening);
      setTimeIcon(<Moon className="w-6 h-6 text-indigo-400" />);
    } else {
      setGreeting(t.home.goodMorning);
    }
  }, [t]);

  // Today's planned meals
  const today = new Date().getDay();
  const adjustedDayIndex = today === 0 ? 6 : today - 1;
  const todaysMeals = mealPlan?.[adjustedDayIndex] || [];

  const handleAddWater = () => {
    setHydration((prev: any) => ({ ...prev, consumed: Math.min(prev.consumed + 1, prev.target + 5) }));
  };

  return (
    <div className="px-6 max-w-5xl mx-auto space-y-8 pb-24">
      {/* 1. Header — greeting + streak */}
      <section className="pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {timeIcon}
          <h1 className="font-headline text-3xl font-black text-tertiary uppercase tracking-tight leading-none">
            {greeting}, {userProfile.name?.split(' ')[0] || t.home.friend}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isSimpleMode && <RealScoreBadge avgVitality={avgVitality} trend={vitalityTrend} onTap={() => onNavigateToProgress?.()} />}
          <div className="flex items-center gap-1.5 bg-brand-secondary/10 text-brand-secondary px-3 py-1.5 rounded-full border border-brand-secondary/20 shadow-sm">
            <Flame className="w-4 h-4" />
            <span className="font-bold text-[10px] uppercase tracking-widest">{t.home.streak}: {streakDays} {t.home.days}</span>
          </div>
        </div>
      </section>

      {/* 2. Guided Setup — first 7 days */}
      {!guidedDismissed && (() => {
        const steps = [
          { id: 'profile', label: t.guidedSetup?.configProfile || 'Configura tu perfil', done: true },
          { id: 'meal', label: t.guidedSetup?.logFirstMeal || 'Registra tu primera comida', done: dailyLog.length > 0 || nutritionHistory?.some((h: any) => h.mealCount > 0) },
          { id: 'recipe', label: t.guidedSetup?.exploreRecipe || 'Explora una receta', done: !!localStorage.getItem('rial_recipeViewed') },
          { id: 'plan', label: t.guidedSetup?.planFirstDay || 'Planifica tu primer día', done: Object.values(mealPlan || {}).some((d: any) => Array.isArray(d) && d.length > 0), action: onNavigateToPlan },
        ];
        const completed = steps.filter(s => s.done).length;
        return (
          <section className="bg-surface-container-low border border-primary/30 p-5 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary">{t.guidedSetup?.title || '¡Empieza aquí!'}</span>
              </div>
              <span className="font-mono text-[10px] text-primary font-bold">{completed}/{steps.length}</span>
            </div>
            <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(completed / steps.length) * 100}%` }} />
            </div>
            <div className="space-y-2">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={step.done ? undefined : step.action}
                  disabled={step.done}
                  className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-sm transition-colors ${step.done ? 'opacity-60' : 'hover:bg-surface-container-highest cursor-pointer'}`}
                >
                  {step.done
                    ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-outline-variant/40 shrink-0" />
                  }
                  <span className={`text-xs font-bold uppercase tracking-widest ${step.done ? 'text-on-surface-variant line-through' : 'text-tertiary'}`}>{step.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { localStorage.setItem('rial_guidedSetupDismissed', 'true'); setGuidedDismissed(true); }}
              className="w-full text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:underline pt-1"
            >
              {t.guidedSetup?.dismiss || 'Ya sé cómo funciona'}
            </button>
          </section>
        );
      })()}

      {/* 3. Nutrition Hero — above the fold */}
      <NutritionHero dailyMacros={dailyMacros} mode={isSimpleMode ? 'simple' : 'detailed'} exerciseCalories={exerciseCalories} />

      {/* 4. Weekly Mini Dashboard — advanced mode only */}
      {!isSimpleMode && (
        <WeeklyMiniDash
          calAvg={weeklyProgress.calAvg}
          proteinHitDays={weeklyProgress.proteinHitDays}
          totalDays={weeklyProgress.totalDays}
          weekDelta={weeklyProgress.weekDelta}
          onNavigateToProgress={() => onNavigateToProgress?.()}
        />
      )}

      {/* 5. Primary Actions — Log Meal + Check-in */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onAddMeal}
          className="bg-primary text-on-primary p-5 rounded-sm flex flex-col items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 group"
        >
          <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-headline font-bold text-xs uppercase tracking-widest">{t.fab.logMeal}</span>
        </button>
        <button
          onClick={() => onCheckIn()}
          className={`p-5 rounded-sm flex flex-col items-center justify-center gap-3 transition-all group border ${
            checkInStatus
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-surface-container-low border-outline-variant/20 hover:border-primary text-tertiary'
          }`}
        >
          <CheckCircle2 className={`w-6 h-6 text-primary group-hover:scale-110 transition-transform`} />
          <span className="font-headline font-bold text-xs uppercase tracking-widest">
            {checkInStatus ? t.home.registered : t.home.checkIn}
          </span>
        </button>
      </div>

      {/* 5b. Quick Actions — repeat yesterday (only when no meals logged today) */}
      {dailyLog.length === 0 && yesterdayData && (
        <QuickActions
          yesterdayKcal={yesterdayData.kcal}
          yesterdayCount={yesterdayData.count}
          onRepeatYesterday={handleRepeatYesterday}
        />
      )}

      {/* 6. Hydration — compact row */}
      <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-secondary/10 rounded-full flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5 text-brand-secondary" />
            </div>
            <div>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{t.home.water}</p>
              <p className="font-headline font-bold text-sm text-tertiary uppercase">{hydration.consumed} / {hydration.target} {t.home.cups}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingHydration(!isEditingHydration)}
              className="text-[10px] text-brand-secondary hover:underline font-bold uppercase tracking-widest"
            >
              {isEditingHydration ? t.home.close : t.home.edit}
            </button>
            <button
              onClick={handleAddWater}
              className="w-9 h-9 bg-brand-secondary text-on-secondary rounded-full flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-secondary/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        {isEditingHydration && (
          <div className="pt-3 mt-3 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{t.home.dailyTarget} ({t.home.cups})</span>
              <span className="font-headline font-bold text-sm text-brand-secondary">{hydration.target}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={hydration.target}
              onChange={(e) => setHydration({ ...hydration, target: parseInt(e.target.value) })}
              className="w-full accent-secondary"
            />
          </div>
        )}
      </div>

      {/* 6. Real Feel — conditional post-meal */}
      {showRealFeel && onRealFeelLog && (
        <section>
          <RealFeelInline
            onSubmit={(entry) => { onRealFeelLog(entry); setShowRealFeel(false); }}
            onDismiss={() => setShowRealFeel(false)}
          />
        </section>
      )}

      {/* 7. Today's Meals — merged planned + diary */}
      <TodaysMeals
        dailyLog={dailyLog}
        todaysMeals={todaysMeals}
        onLogMealNow={onLogMealNow}
        onNavigateToPlan={onNavigateToPlan}
        onAddMeal={onAddMeal}
        setDailyLog={setDailyLog}
        setDailyMacros={setDailyMacros}
        onNavigateToRecipe={onNavigateToRecipe}
      />

      {/* 7b. Next Meal Suggestion — after logging at least 1 meal */}
      <NextMealSuggestion
        suggestion={nextMealSuggestion}
        onTap={() => {
          if (nextMealSuggestion?.recipe && onNavigateToRecipe) {
            onNavigateToRecipe(nextMealSuggestion.recipe);
          }
        }}
      />

      {/* 7c. Shopping Reminder — conditional */}
      {shoppingPendingCount > 0 && (
        <button onClick={onNavigateToPlan} className="bg-surface-container-low border border-outline-variant/20 p-3 rounded-sm flex items-center gap-3 w-full hover:border-primary/30 transition-colors">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-tertiary flex-1 text-left">
            {(t.home.shoppingPending as string)?.replace('{count}', String(shoppingPendingCount))}
          </span>
          <ChevronRight className="w-4 h-4 text-on-surface-variant" />
        </button>
      )}

      {/* 8. Activity — compact card */}
      {!isSimpleMode && (
        <ActivityRow
          movement={movement}
          setMovement={setMovement}
          isTrainingDay={isTrainingDay}
          setIsTrainingDay={setIsTrainingDay}
        />
      )}

      {/* 9. Smart Insights — conditional */}
      {(() => {
        const insights = getInsights({
          realFeelLogs: realFeelLogs || [],
          savedRecipes: [],
          mealPlan: mealPlan || {},
          dailyMacros,
          hydration,
          streakDays,
        });
        if (!insights.length) return null;
        return (
          <section className="space-y-3">
            <h2 className="font-headline text-sm font-bold tracking-widest uppercase text-tertiary flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-primary" /> {t.home.insights}
            </h2>
            {insights.slice(0, 3).map(ins => (
              <div key={ins.id} className={`p-4 rounded-sm border flex items-start gap-3 ${
                ins.tone === 'warning' ? 'bg-error/5 border-error/20' :
                ins.tone === 'positive' ? 'bg-brand-secondary/5 border-brand-secondary/20' :
                'bg-surface-container-low border-outline-variant/20'
              }`}>
                <span className="text-xl shrink-0">{ins.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-xs font-bold uppercase tracking-widest text-tertiary">{ins.title}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{ins.detail}</p>
                </div>
              </div>
            ))}
          </section>
        );
      })()}
    </div>
  );
}
