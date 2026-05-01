import { Calendar, UtensilsCrossed, Trash2, Pencil, Check, X, Minus, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '@/components/ui/Typography';
import RecipeImage from '@/components/ui/RecipeImage';
import { useI18n } from '../../../i18n';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';
import type { FoodVariant } from '../../../types/food-family';
import type { Recipe, LoggableMeal } from '../../../types';
import type { DailyMacros } from '../../../contexts/state/useVitalsState';

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
import ContextualScoreChip from '../../food/components/ContextualScoreChip';
import { normalizeGoal } from '../../food/utils/contextual-score';
import { variantFromLogEntry } from '../../food/utils/variant-from-log';
import { safeSumMacros } from '../utils/safe-macros';

interface TodaysMealsProps {
  dailyLog: DailyLogEntry[];
  todaysMeals: PlannedMeal[];
  onLogMealNow?: (meal: LoggableMeal, servings: number) => void;
  onNavigateToPlan?: () => void;
  onAddMeal: () => void;
  setDailyLog?: Setter<DailyLogEntry[]>;
  setDailyMacros?: Setter<DailyMacros>;
  onNavigateToRecipe?: (recipe: Recipe) => void;
  /** P13 [1.5.71] — pool of known variants for contextual score resolution. */
  mergedVariants?: readonly FoodVariant[];
  /** P13 [1.5.71] — raw user goal string; normalised for grade selection. */
  userGoal?: string | null;
}

export default function TodaysMeals({
  dailyLog, todaysMeals, onLogMealNow, onNavigateToPlan, onAddMeal,
  setDailyLog, setDailyMacros,
  onNavigateToRecipe,
  mergedVariants,
  userGoal,
}: TodaysMealsProps) {
  const { t } = useI18n();
  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | null>(null);
  const [editGrams, setEditGrams] = useState(0);

  // P13 [1.5.71] — resolve the goal once; null when unknown/pre-onboarding,
  // which suppresses the chip per-entry gracefully.
  const activeGoal = useMemo(() => normalizeGoal(userGoal), [userGoal]);

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

  const slotIcons: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎', other: '🍽️' };
  const hasContent = dailyLog.length > 0 || todaysMeals.length > 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <Heading level="h2" className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-primary" /> {t.home.todaysLog}
        </Heading>
        {dailyLog.length > 0 && (
          <span className="text-micro font-label font-bold uppercase tracking-widest text-on-surface-variant">
            {dailyLog.length} {dailyLog.length === 1 ? t.home.foodSingular : t.home.foods}
          </span>
        )}
      </div>

      {/* Logged meals */}
      {dailyLog.length > 0 && (
        <>
          <SectionCard padding="none" spacing="none" className="divide-y divide-outline-variant/10 overflow-hidden">
            {dailyLog.map((entry) => {
              const isEditing = editingEntry?.id === entry.id;
              const previewFactor = isEditing && entry.grams ? editGrams / entry.grams : 1;
              const previewMacros = isEditing ? {
                cal: Math.round(entry.macros.cal * previewFactor),
                pro: +(entry.macros.pro * previewFactor).toFixed(1),
                carbs: +(entry.macros.carbs * previewFactor).toFixed(1),
                fats: +(entry.macros.fats * previewFactor).toFixed(1),
              } : entry.macros;

              // P13 [1.5.71] — compute contextual score per entry under the user's active goal.
              // Resolver returns null when we can't produce a meaningful grade
              // (no id match + no grams), which suppresses the chip gracefully.
              const scoreVariant =
                activeGoal && mergedVariants
                  ? variantFromLogEntry(entry, mergedVariants)
                  : null;

              return (
                <div key={entry.id}>
                  <div className="flex items-center gap-3 px-4 py-3 group">
                    <span className="text-title-sm shrink-0">{slotIcons[entry.mealSlot] || '🍽️'}</span>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => entry.grams ? startEdit(entry) : undefined}>
                      <span className="font-headline text-micro font-bold uppercase text-tertiary truncate block">{entry.title}</span>
                      <div className="flex items-center gap-2 text-micro font-label tracking-widest uppercase text-on-surface-variant mt-0.5">
                        <span>{entry.time}</span>
                        <span>·</span>
                        <span className="text-primary font-bold">{entry.portionDescription}</span>
                        <span>·</span>
                        <span>{previewMacros.cal} kcal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* P13 [1.5.71] — contextual grade for the user's active goal.
                          Suppressed when goal unknown or variant can't be resolved. */}
                      {scoreVariant && activeGoal && !isEditing && (
                        <span className="mr-1">
                          <ContextualScoreChip
                            variant={scoreVariant}
                            goal={activeGoal}
                            size="sm"
                          />
                        </span>
                      )}
                      {/* HIG 44×44 tap targets, always visible (opacity-0+group-hover
                          was invisible on touch devices where there's no hover). */}
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

                  {/* Inline edit panel */}
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
          </SectionCard>
          {/* Diary totals — defensive sum guards against malformed entries. */}
          {(() => {
            const totals = safeSumMacros(dailyLog);
            return (
              <div className="flex items-center justify-between bg-surface-container-highest/50 rounded-sm px-4 py-2.5">
                <span className="text-micro font-label font-bold uppercase tracking-widest text-on-surface-variant">{t.home.totalLogged}</span>
                <div className="flex items-center gap-3 text-micro font-headline font-bold uppercase tracking-wider">
                  <span className="text-primary">{Math.round(totals.cal)} kcal</span>
                  <span className="text-macro-protein">{totals.pro.toFixed(0)}g P</span>
                  <span className="text-macro-carbs">{totals.carbs.toFixed(0)}g C</span>
                  <span className="text-macro-fats">{totals.fats.toFixed(0)}g F</span>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Planned meals (not yet logged) */}
      {todaysMeals.length > 0 && (
        <div className="space-y-2">
          {dailyLog.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> {t.home.plannedToday}
              </span>
              <button type="button" onClick={onNavigateToPlan} className="text-micro font-bold text-primary uppercase tracking-widest hover:underline min-h-11 px-3">{t.plan.title}</button>
            </div>
          )}
          {!dailyLog.length && (
            <div className="flex items-center justify-between px-1">
              <Heading level="h3" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> {t.home.plannedToday}
              </Heading>
              <button type="button" onClick={onNavigateToPlan} className="text-micro font-bold text-primary uppercase tracking-widest hover:underline min-h-11 px-3">{t.plan.title}</button>
            </div>
          )}
          {todaysMeals.map((meal, idx) => {
            const imgSrc = meal.image || meal.img || null;
            return (
              <SectionCard key={meal.id || idx} padding="none" spacing="none" className="p-3 flex items-center gap-3 group">
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
                    fallbackEmoji="🍽️"
                    className="w-11 h-11 rounded-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-micro font-semibold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded inline-block mb-0.5">{meal.type || meal.time}</span>
                    <Heading level="h3" className="truncate text-body-sm">{meal.title}</Heading>
                    <span className="text-caption text-on-surface-variant">{meal.cal ?? meal.macros?.calories} {t.common.kcal}</span>
                  </div>
                </button>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onLogMealNow?.(meal, 1); }}
                  className="shrink-0 px-3 min-h-11 bg-primary text-on-primary rounded-sm text-micro font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  {t.home.logIt}
                </button>
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 p-10 rounded-sm text-center">
          <p className="font-label text-body-sm text-on-surface-variant uppercase tracking-widest">{t.empty.planEmpty}</p>
          <button type="button" onClick={onAddMeal} className="mt-4 text-primary font-bold uppercase text-micro tracking-widest hover:underline">{t.fab.logMeal}</button>
        </div>
      )}
    </section>
  );
}
