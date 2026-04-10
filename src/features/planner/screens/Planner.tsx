import { ShoppingCart, Plus, ChevronRight, Clock, CheckCircle2, Utensils, BookOpen, LogIn, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n';
import EmptyState from '../../../components/EmptyState';
import { analyzeBatchCooking } from '../utils/batch-cooking';
import { detectLeftovers } from '../utils/meal-reuse';

// ─── Execution state ──────────────────────────────────────────────────────────

export type MealExecutionStatus = 'planned' | 'prepped' | 'cooked' | 'logged';

const STATUS_CYCLE: MealExecutionStatus[] = ['planned', 'prepped', 'cooked', 'logged'];

const STATUS_CONFIG: Record<MealExecutionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  planned: {
    label: 'PLANEADO',
    color: 'bg-surface-container-highest text-on-surface-variant',
    icon: <BookOpen className="w-3 h-3" />,
  },
  prepped: {
    label: 'PREPARADO',
    color: 'bg-primary/15 text-primary',
    icon: <Clock className="w-3 h-3" />,
  },
  cooked: {
    label: 'COCINADO',
    color: 'bg-brand-secondary/15 text-brand-secondary',
    icon: <Utensils className="w-3 h-3" />,
  },
  logged: {
    label: 'REGISTRADO',
    color: 'bg-primary/15 text-primary',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

function nextStatus(current: MealExecutionStatus): MealExecutionStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PlannerProps {
  onOpenShoppingList?: () => void;
  onAddMeal?: (dayIndex: number) => void;
  onLogMeal?: (meal: any) => void;
  mealPlan?: Record<number, any[]>;
  setMealPlan?: (fn: any) => void;
  setShoppingList?: (fn: any) => void;
}

export default function Planner({
  onOpenShoppingList,
  onAddMeal,
  onLogMeal,
  mealPlan,
  setMealPlan,
  setShoppingList,
}: PlannerProps) {
  const { t } = useI18n();
  const currentDayIndex = new Date().getDay();
  const adjustedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  const [activeDay, setActiveDay] = useState(adjustedDayIndex);
  const [showBatchInsights, setShowBatchInsights] = useState(false);

  const dayLetters = [
    t.plan.days.mon, t.plan.days.tue, t.plan.days.wed, t.plan.days.thu,
    t.plan.days.fri, t.plan.days.sat, t.plan.days.sun,
  ];
  const dayNames = [
    t.plan.daysLong.mon, t.plan.daysLong.tue, t.plan.daysLong.wed, t.plan.daysLong.thu,
    t.plan.daysLong.fri, t.plan.daysLong.sat, t.plan.daysLong.sun,
  ];

  const currentMeals = mealPlan ? mealPlan[activeDay] || [] : [];
  const totalCals = currentMeals.reduce((sum: number, meal: any) => sum + (meal.cal || 0), 0);
  const totalPro  = currentMeals.reduce((sum: number, meal: any) => sum + (meal.pro || 0), 0);

  // ─── Batch + leftover insights ──────────────────────────────────────────────
  const batchAnalysis = mealPlan ? analyzeBatchCooking(mealPlan) : null;
  const leftoverSuggestions = mealPlan ? detectLeftovers(mealPlan) : [];

  // ─── Update execution status ────────────────────────────────────────────────
  function cycleStatus(mealId: any) {
    if (!setMealPlan) return;
    setMealPlan((prev: Record<number, any[]>) => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).map((m: any) => {
        if (m.id !== mealId) return m;
        const current: MealExecutionStatus = m.executionStatus ?? 'planned';
        return { ...m, executionStatus: nextStatus(current) };
      }),
    }));
  }

  function handleLog(meal: any) {
    // Cycle to logged + call parent
    if (setMealPlan) {
      setMealPlan((prev: Record<number, any[]>) => ({
        ...prev,
        [activeDay]: (prev[activeDay] || []).map((m: any) =>
          m.id !== meal.id ? m : { ...m, executionStatus: 'logged' as MealExecutionStatus },
        ),
      }));
    }
    onLogMeal?.(meal);
  }

  // ─── Add suggested leftover ─────────────────────────────────────────────────
  function addLeftover(suggestion: ReturnType<typeof detectLeftovers>[number]) {
    if (!setMealPlan || !mealPlan) return;
    const sourceMeals = mealPlan[suggestion.sourceDayIndex] || [];
    const sourceMeal  = sourceMeals.find((m: any) =>
      (m.title ?? '') === suggestion.mealTitle,
    );
    if (!sourceMeal) return;
    const newMeal = {
      ...sourceMeal,
      id: Date.now(),
      tag: 'SOBRAS',
      title: `${sourceMeal.title} (sobras)`,
      executionStatus: 'planned' as MealExecutionStatus,
    };
    setMealPlan((prev: Record<number, any[]>) => ({
      ...prev,
      [suggestion.suggestedDayIndex]: [...(prev[suggestion.suggestedDayIndex] || []), newMeal],
    }));
  }

  // ─── Delete meal from plan ───────────────────────────────────────────────
  function deleteMeal(mealId: any) {
    if (!setMealPlan) return;
    const mealToDelete = currentMeals.find((m: any) => m.id === mealId);
    setMealPlan((prev: Record<number, any[]>) => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).filter((m: any) => m.id !== mealId),
    }));
    // Remove associated shopping items (by matching ingredient names from the recipe)
    if (setShoppingList && mealToDelete?.recipeIngredients?.length > 0) {
      const ingredientNames = new Set(
        mealToDelete.recipeIngredients.map((ri: any) =>
          (ri.ingredient?.name || ri.name || '').toLowerCase(),
        ).filter(Boolean),
      );
      setShoppingList((prev: any[]) =>
        prev.filter((item: any) => {
          const itemBase = (item.name || '').toLowerCase().split(' (')[0];
          return !ingredientNames.has(itemBase);
        }),
      );
    }
    toast.info(t.planner.mealDeleted);
  }

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-label text-xs tracking-[0.2em] text-primary uppercase mb-1 block">{t.planner.weeklyPlan}</span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary">{t.planner.currentWeek}</h2>
        </div>
        <button
          onClick={onOpenShoppingList}
          aria-label={t.planner.shoppingListBtn}
          className="bg-primary text-on-primary px-5 py-3 font-label text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          {t.planner.shoppingListBtn}
        </button>
      </section>

      {/* ── Batch cooking insights banner ──────────────────────────────────── */}
      {batchAnalysis?.hasOpportunities && (
        <button
          onClick={() => setShowBatchInsights(v => !v)}
          className="w-full bg-surface-container-low border border-primary/20 rounded-sm p-4 text-left transition-colors hover:border-primary/40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-label text-[9px] uppercase tracking-widest text-primary font-bold">{t.planner.batchCooking}</p>
                <p className="font-headline font-bold text-sm text-tertiary">
                  {t.planner.batchSaveTime.replace('{mins}', String(batchAnalysis.totalTimeSavedMins))}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
              {showBatchInsights ? t.planner.batchClose : t.planner.batchViewOpportunities}
            </span>
          </div>

          {showBatchInsights && (
            <div className="mt-4 space-y-2 border-t border-outline-variant/20 pt-4">
              {batchAnalysis.sessions.map((session, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="font-label text-xs font-bold text-tertiary">
                      {session.baseIngredient} — {t.planner.batchPrepareOnce.replace('{count}', String(session.recipeNames.length))}
                    </p>
                    <p className="font-label text-[9px] text-on-surface-variant mt-0.5">
                      {session.recipeNames.join(' · ')} · {t.planner.batchSave.replace('{mins}', String(session.timeSavedMins))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </button>
      )}

      {/* ── Day selector ───────────────────────────────────────────────────── */}
      <section
        className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20"
        role="group"
        aria-label={t.planner.weeklyPlan}
      >
        <div className="flex justify-between items-center">
          {dayLetters.map((letter, index) => {
            const dayMeals = mealPlan?.[index] || [];
            const loggedCount = dayMeals.filter((m: any) => m.executionStatus === 'logged').length;
            const hasMeals = dayMeals.length > 0;
            return (
              <div key={index} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setActiveDay(index)}
                  aria-label={dayNames[index]}
                  aria-pressed={activeDay === index}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-headline font-bold text-sm md:text-base cursor-pointer transition-all ${
                    activeDay === index
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-110'
                      : 'bg-surface-container-highest text-on-surface-variant hover:text-tertiary hover:bg-surface-container-high'
                  }`}
                >
                  {letter}
                </button>
                {/* Dot: green = all logged, amber = some, gray = planned */}
                {hasMeals && (
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    loggedCount === dayMeals.length ? 'bg-primary' :
                    loggedCount > 0 ? 'bg-brand-secondary' :
                    'bg-outline-variant/50'
                  }`} aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Daily summary ──────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
            <h3 className="font-headline text-xl font-bold uppercase tracking-tight text-tertiary">{dayNames[activeDay]}</h3>
            <div className="flex gap-4 text-xs font-label tracking-widest uppercase" aria-label={t.planner.dailyTotal}>
              <div className="flex flex-col items-end">
                <span className="text-on-surface-variant">{t.home.kcal}</span>
                <span className="text-primary font-bold text-sm">{totalCals} {t.common.kcal}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-on-surface-variant">{t.home.protein}</span>
                <span className="text-brand-secondary font-bold text-sm">{totalPro}{t.common.g}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <span>{t.planner.dailyTotal}</span>
              <span>{Math.round((totalCals / 2000) * 100)}%</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((totalCals / 2000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Leftover suggestions for this day ──────────────────────────── */}
        {leftoverSuggestions.filter(s => s.suggestedDayIndex === activeDay).length > 0 && (
          <div className="space-y-2">
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
              {t.planner.leftoverSuggestion}
            </p>
            {leftoverSuggestions
              .filter(s => s.suggestedDayIndex === activeDay)
              .map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-surface-container-low border border-amber-500/20 rounded-sm px-4 py-3"
                >
                  <div>
                    <p className="font-label text-xs font-bold text-tertiary">{s.mealTitle}</p>
                    <p className="font-label text-[9px] text-on-surface-variant">
                      {t.planner.leftoverFrom.replace('{day}', dayNames[s.sourceDayIndex])} · {t.planner.leftoverGoodFor.replace('{days}', String(s.freshnessWindowDays))}
                    </p>
                  </div>
                  <button
                    onClick={() => addLeftover(s)}
                    className="text-[9px] font-bold uppercase tracking-widest text-brand-secondary bg-brand-secondary/10 px-3 py-1.5 rounded-full hover:bg-brand-secondary/20 transition-colors"
                  >
                    + {t.planner.leftoverAdd}
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* ── Meal list ──────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {currentMeals.length === 0 ? (
            <EmptyState
              icon="📅"
              description={t.planner.noMeals}
              ctaLabel={t.planner.addMealBtn}
              onCta={() => onAddMeal?.(activeDay)}
            />
          ) : (
            currentMeals.map((meal: any, idx: number) => {
              const execStatus: MealExecutionStatus = meal.executionStatus ?? 'planned';
              const statusCfg = STATUS_CONFIG[execStatus];
              return (
                <div
                  key={meal.id || idx}
                  className={`bg-surface-container-low p-4 rounded-sm border transition-all ${
                    execStatus === 'logged'
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-outline-variant/20 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-11 h-11 bg-surface-container-highest rounded-sm flex items-center justify-center shrink-0 overflow-hidden">
                      {meal.img ? (
                        <img src={meal.img} alt={meal.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="font-headline font-bold text-tertiary text-base">{meal.title?.charAt(0)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-label text-[9px] tracking-widest text-primary uppercase font-bold">
                          {meal.time} · {meal.type}
                        </p>
                        {meal.tag && meal.tag !== 'PLANEADO' && (
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded">
                            {meal.tag}
                          </span>
                        )}
                      </div>
                      <h4 className="font-headline font-bold text-sm uppercase text-tertiary leading-tight">{meal.title}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[9px] font-bold text-primary">{meal.cal} {t.common.kcal}</span>
                        <span className="text-[9px] text-on-surface-variant">·</span>
                        <span className="text-[9px] text-brand-secondary font-bold">{meal.pro || 0}g P</span>
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Status badge — tap to cycle */}
                      <button
                        onClick={() => cycleStatus(meal.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider transition-colors ${statusCfg.color}`}
                        title={t.planner.tapToChangeStatus}
                      >
                        {statusCfg.icon}
                        {statusCfg.label}
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Log quick action — only when not yet logged */}
                        {execStatus !== 'logged' && (
                          <button
                            onClick={() => handleLog(meal)}
                            className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <LogIn className="w-3 h-3" />
                            {t.planner.logMeal}
                          </button>
                        )}

                        {/* Delete from plan */}
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-error transition-colors"
                          title={t.planner.deleteMeal}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Add meal button */}
          <button
            onClick={() => onAddMeal?.(activeDay)}
            aria-label={t.planner.addMealBtn}
            className="w-full border-2 border-dashed border-outline-variant/30 p-4 rounded-sm flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors font-label text-xs font-bold tracking-widest uppercase"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> {t.planner.addMealBtn}
          </button>
        </div>
      </section>
    </div>
  );
}
