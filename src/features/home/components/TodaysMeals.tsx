import { Calendar, UtensilsCrossed, Trash2, Pencil, Check, X, Minus, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '@/components/ui/Typography';
import RecipeImage from '@/components/ui/RecipeImage';
import { useI18n } from '../../../i18n';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import type { FoodVariant } from '../../../types/food-family';
import type { Recipe, LoggableMeal } from '../../../types';
import type { DailyMacros } from '../../../contexts/state/useVitalsState';
import ContextualScoreChip from '../../food/components/ContextualScoreChip';
import { normalizeGoal } from '../../food/utils/contextual-score';
import { variantFromLogEntry } from '../../food/utils/variant-from-log';
import { safeSumMacros } from '../utils/safe-macros';
import { filterUnloggedPlanned } from '../utils/dedupe-planned';

type Setter<T> = (fn: T | ((prev: T) => T)) => void;

/** Runtime meal-plan entry passed from mealPlan[today]; carries planner fields beyond Recipe. */
type PlannedMeal = Recipe & {
  executionStatus?: string;
  /** @deprecated Legacy; prefer macros.calories */ cal?: number;
  /** @deprecated Legacy; prefer macros.protein */  pro?: number;
  /** @deprecated Legacy; prefer Recipe.image */    img?: string;
  time?: string;
  type?: string;
};

/** Inline "Next up" banner derived in Home.tsx and rendered inside the unified card header. */
export interface NextSuggestion {
  title: string;
  cal: number;
  pro: number;
  time?: string;
  source: 'plan' | 'recipe';
  recipe?: Recipe;
}

interface TodaysMealsProps {
  dailyLog: DailyLogEntry[];
  todaysMeals: PlannedMeal[];
  onLogMealNow?: (meal: LoggableMeal, servings: number) => void;
  onNavigateToPlan?: () => void;
  onAddMeal: () => void;
  setDailyLog?: Setter<DailyLogEntry[]>;
  setDailyMacros?: Setter<DailyMacros>;
  onNavigateToRecipe?: (recipe: Recipe) => void;
  /** Pre-computed inline next-up banner. Hour-gating + source resolution lives upstream. */
  nextSuggestion?: NextSuggestion | null;
  onNextTap?: () => void;
  /** P13 [1.5.71] — pool of known variants for contextual score resolution. */
  mergedVariants?: readonly FoodVariant[];
  /** P13 [1.5.71] — raw user goal string; normalised for grade selection. */
  userGoal?: string | null;
}

const slotIcons: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
  other: '🍽️',
};

const interpolate = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

export default function TodaysMeals({
  dailyLog,
  todaysMeals,
  onLogMealNow,
  onNavigateToPlan,
  onAddMeal,
  setDailyLog,
  setDailyMacros,
  onNavigateToRecipe,
  nextSuggestion,
  onNextTap,
  mergedVariants,
  userGoal,
}: TodaysMealsProps) {
  const { t } = useI18n();
  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | null>(null);
  const [editGrams, setEditGrams] = useState(0);

  // P13 [1.5.71] — resolve the goal once; null when unknown/pre-onboarding,
  // which suppresses the chip per-entry gracefully.
  const activeGoal = useMemo(() => normalizeGoal(userGoal), [userGoal]);

  // Plan→Log dedupe: a planned meal already logged today shouldn't render twice.
  // Sprint 51 [1.5.182] — entry-only fade-in (Tailwind animate-in) replaces
  // motion/react after the bundle budget veto. The dedupe + fade-in still
  // perceptually moves the meal from Plan to Log; exit animation skipped.
  // `motion-reduce:animate-none` honours prefers-reduced-motion.
  const visiblePlanned = useMemo(
    () => filterUnloggedPlanned(todaysMeals, dailyLog),
    [todaysMeals, dailyLog],
  );

  const startEdit = (entry: DailyLogEntry) => {
    setEditingEntry(entry);
    setEditGrams(entry.grams ?? 100);
  };

  const confirmEdit = () => {
    if (!editingEntry || !setDailyLog || !setDailyMacros) return;
    const original = editingEntry;
    const origGrams = original.grams && original.grams > 0 ? original.grams : 100;
    const rawFactor = editGrams / origGrams;
    const factor = Number.isFinite(rawFactor) && rawFactor > 0 ? rawFactor : 1;

    const m = original.macros ?? { cal: 0, pro: 0, carbs: 0, fats: 0 };
    const newMacros = {
      cal: Math.round((m.cal ?? 0) * factor),
      pro: +((m.pro ?? 0) * factor).toFixed(1),
      carbs: +((m.carbs ?? 0) * factor).toFixed(1),
      fats: +((m.fats ?? 0) * factor).toFixed(1),
    };

    setDailyLog((prev: DailyLogEntry[]) =>
      prev.map(e => e.id === original.id ? {
        ...e, grams: editGrams, macros: newMacros, portionDescription: `${editGrams}g`,
      } : e),
    );

    setDailyMacros((prev) => ({
      ...prev,
      consumed: {
        cal: Math.max(0, prev.consumed.cal + (newMacros.cal - original.macros.cal)),
        pro: Math.max(0, prev.consumed.pro + (newMacros.pro - original.macros.pro)),
        carbs: Math.max(0, prev.consumed.carbs + (newMacros.carbs - original.macros.carbs)),
        fats: Math.max(0, prev.consumed.fats + (newMacros.fats - original.macros.fats)),
      },
    }));

    setEditingEntry(null);
  };

  const handleDelete = (entry: DailyLogEntry) => {
    if (!setDailyLog) return;
    setDailyLog((prev: DailyLogEntry[]) => prev.filter(e => e.id !== entry.id));
    if (setDailyMacros) {
      setDailyMacros((prev) => ({
        ...prev,
        consumed: {
          cal: Math.max(0, prev.consumed.cal - (entry.macros?.cal || 0)),
          pro: Math.max(0, prev.consumed.pro - (entry.macros?.pro || 0)),
          carbs: Math.max(0, prev.consumed.carbs - (entry.macros?.carbs || 0)),
          fats: Math.max(0, prev.consumed.fats - (entry.macros?.fats || 0)),
        },
      }));
    }
    if (editingEntry?.id === entry.id) setEditingEntry(null);
  };

  const hasLog = dailyLog.length > 0;
  const hasPlan = visiblePlanned.length > 0;
  const totals = useMemo(() => safeSumMacros(dailyLog), [dailyLog]);
  const nextLabelKey =
    nextSuggestion?.source === 'plan' && nextSuggestion.time
      ? 'nextUpInline'
      : 'nextUpInlineNoTime';
  const nextLabel = nextSuggestion
    ? interpolate(t.home[nextLabelKey], {
        title: nextSuggestion.title,
        time: nextSuggestion.time ?? '',
      })
    : '';

  return (
    <section className="space-y-3" data-testid="todays-meals">
      <div className="flex items-center justify-between px-1">
        <Heading level="h2" className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-primary" /> {t.home.todayHeader}
        </Heading>
        {hasLog && (
          <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
            {dailyLog.length} {dailyLog.length === 1 ? t.home.foodSingular : t.home.foods}
          </span>
        )}
      </div>

      {/* Empty global — Plan and Log both empty */}
      {!hasLog && !hasPlan && (
        <SectionCard
          padding="none"
          spacing="none"
          className="border-dashed border-outline-variant/40 px-4 py-8 text-center"
        >
          <p className="font-label text-body-sm text-on-surface-variant uppercase tracking-widest">
            {t.home.emptyAll}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAddMeal}
              className="text-primary font-bold uppercase text-micro tracking-widest hover:underline min-h-11 px-3"
            >
              {t.fab.logMeal}
            </button>
            <span className="text-on-surface-variant text-micro">·</span>
            <button
              type="button"
              onClick={onNavigateToPlan}
              className="text-primary font-bold uppercase text-micro tracking-widest hover:underline min-h-11 px-3"
            >
              {t.home.planTodayCta}
            </button>
          </div>
        </SectionCard>
      )}

      {/* Unified card — only when there's something to show */}
      {(hasLog || hasPlan) && (
        <SectionCard padding="none" spacing="none" className="overflow-hidden">
          {/* Inline Next Up banner */}
          {nextSuggestion && (
            <button
              type="button"
              onClick={onNextTap}
              data-testid="todays-meals-next-up"
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-surface-container-highest/40 border-b border-outline-variant/15 text-left hover:bg-surface-container-highest/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="flex-1 min-w-0 text-micro font-label font-bold uppercase tracking-widest text-primary truncate">
                {nextLabel}
              </span>
              <ChevronRight className="w-4 h-4 text-primary shrink-0" />
            </button>
          )}

          {/* Plan band — always rendered inside the unified card (shows inline empty when !hasPlan). */}
          <div className="border-b border-outline-variant/15 last:border-b-0">
              <div className="flex items-center justify-between px-4 pt-3 pb-1.5 gap-2">
                <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {t.home.plannedToday}
                </span>
                <Button
                  variant="ghost"
                  size="pill"
                  onClick={onNavigateToPlan}
                  className="shrink-0 text-primary"
                >
                  {t.plan.title}
                </Button>
              </div>

              {hasPlan ? (
                <div className="divide-y divide-outline-variant/10">
                  {visiblePlanned.map((meal, idx) => {
                    const imgSrc = meal.image || meal.img || null;
                    const calVal = meal.cal ?? meal.macros?.calories ?? 0;
                    const slotLabel = meal.type || meal.time || '';
                    const metaParts = [slotLabel, meal.time && meal.type ? meal.time : null, `${calVal} ${t.common.kcal}`]
                      .filter(Boolean);
                    const key = String(meal.id ?? `${meal.title}-${idx}`);
                    return (
                        <div
                          key={key}
                          className="flex items-center gap-3 px-4 py-2.5 group animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none"
                        >
                          <button
                            type="button"
                            onClick={() => onNavigateToRecipe?.(meal)}
                            disabled={!onNavigateToRecipe}
                            aria-label={`${t.postCard.viewRecipe}: ${meal.title}`}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default"
                          >
                            <RecipeImage
                              src={imgSrc}
                              alt={meal.title}
                              variant="thumbnail"
                              fallbackEmoji={slotIcons[meal.type || 'other'] || '🍽️'}
                              className="w-10 h-10 rounded-sm shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-headline text-body-sm font-bold text-on-surface truncate block">
                                {meal.title}
                              </span>
                              <span className="font-body text-label text-on-surface-variant normal-case tracking-normal">
                                {metaParts.join(' · ')}
                              </span>
                            </div>
                          </button>
                          <Button
                            variant="outline"
                            size="pill"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLogMealNow?.(meal, 1);
                            }}
                            className="shrink-0"
                          >
                            <Plus className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                            {t.home.logIt}
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="px-4 pb-3">
                  <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                    {t.home.emptyPlanInline}
                  </span>
                </div>
              )}
          </div>

          {/* Log band */}
          <div>
            <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
              <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" /> {t.home.loggedSection}
              </span>
            </div>

            {hasLog ? (
              <div className="divide-y divide-outline-variant/10">
                  {dailyLog.map((entry) => {
                    const isEditing = editingEntry?.id === entry.id;
                    const previewFactor = isEditing && entry.grams ? editGrams / entry.grams : 1;
                    const previewMacros = isEditing ? {
                      cal: Math.round(entry.macros.cal * previewFactor),
                      pro: +(entry.macros.pro * previewFactor).toFixed(1),
                      carbs: +(entry.macros.carbs * previewFactor).toFixed(1),
                      fats: +(entry.macros.fats * previewFactor).toFixed(1),
                    } : entry.macros;

                    const scoreVariant =
                      activeGoal && mergedVariants
                        ? variantFromLogEntry(entry, mergedVariants)
                        : null;

                    return (
                      <div
                        key={entry.id}
                        className="animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
                      >
                        <div className="flex items-center gap-3 px-4 py-2.5 group">
                          <RecipeImage
                            src={entry.image ?? null}
                            alt={entry.title}
                            variant="thumbnail"
                            fallbackEmoji={slotIcons[entry.mealSlot] || '🍽️'}
                            className="w-10 h-10 rounded-sm shrink-0"
                          />
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => entry.grams ? startEdit(entry) : undefined}
                          >
                            <span className="font-headline text-body-sm font-bold text-on-surface truncate block">
                              {entry.title}
                            </span>
                            <div className="flex items-center gap-1.5 font-body text-label text-on-surface-variant normal-case tracking-normal">
                              <span>{entry.time}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-primary font-semibold">{entry.portionDescription}</span>
                              <span aria-hidden="true">·</span>
                              <span>{previewMacros.cal} {t.common.kcal}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {scoreVariant && activeGoal && !isEditing && (
                              <span className="mr-1">
                                <ContextualScoreChip
                                  variant={scoreVariant}
                                  goal={activeGoal}
                                  size="sm"
                                />
                              </span>
                            )}
                            {entry.grams && (
                              <button
                                type="button"
                                onClick={() => startEdit(entry)}
                                aria-label={t.home.editMeal}
                                className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(entry)}
                              aria-label={t.home.deleteMealAria}
                              className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="px-4 pb-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-surface-container-highest rounded-sm border border-outline-variant/20 overflow-hidden flex-1">
                                <button type="button" onClick={() => setEditGrams(Math.max(1, editGrams - 10))} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input type="text" inputMode="decimal" value={editGrams} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setEditGrams(v); }} aria-label={t.home.editPortionGrams} className="w-16 text-center bg-transparent text-on-surface font-headline font-bold text-body-sm border-x border-outline-variant/20 py-1.5 focus:outline-none" />
                                <button type="button" onClick={() => setEditGrams(editGrams + 10)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="text-micro font-headline font-bold uppercase tracking-widest text-on-surface-variant">g</span>
                              <button type="button" onClick={confirmEdit} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
                                <Check className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => setEditingEntry(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant hover:text-tertiary transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[
                                { label: 'kcal', value: previewMacros.cal, color: 'text-primary' },
                                { label: 'P', value: `${previewMacros.pro}g`, color: 'text-macro-protein' },
                                { label: 'C', value: `${previewMacros.carbs}g`, color: 'text-macro-carbs' },
                                { label: 'F', value: `${previewMacros.fats}g`, color: 'text-macro-fats' },
                              ].map(m => (
                                <div key={m.label} className="bg-surface-container-highest rounded-sm py-1 px-2 text-center">
                                  <span className={`block font-headline font-bold text-micro ${m.color}`}>{m.value}</span>
                                  <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">{m.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="px-4 pb-3">
                <span className="text-micro font-label uppercase tracking-widest text-on-surface-variant">
                  {t.home.emptyLog}
                </span>
              </div>
            )}

            {hasLog && (
              <div className="flex items-center justify-between bg-surface-container-highest/50 px-4 py-2.5 border-t border-outline-variant/15">
                <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
                  {t.home.totalLogged}
                </span>
                <div className="flex items-center gap-3 text-micro font-headline font-bold uppercase tracking-wider">
                  <span className="text-primary">{Math.round(totals.cal)} {t.common.kcal}</span>
                  <span className="text-macro-protein">{totals.pro.toFixed(0)}g P</span>
                  <span className="text-macro-carbs">{totals.carbs.toFixed(0)}g C</span>
                  <span className="text-macro-fats">{totals.fats.toFixed(0)}g F</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </section>
  );
}
