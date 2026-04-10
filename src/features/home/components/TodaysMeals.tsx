import { Calendar, UtensilsCrossed, Trash2, Pencil, Check, X, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n';
import type { DailyLogEntry } from '../../food/handlers/meal-handlers';

interface TodaysMealsProps {
  dailyLog: DailyLogEntry[];
  todaysMeals: any[];
  onLogMealNow?: (recipe: any, servings: number) => void;
  onNavigateToPlan?: () => void;
  onAddMeal: () => void;
  setDailyLog?: (fn: any) => void;
  setDailyMacros?: (fn: any) => void;
  onNavigateToRecipe?: (recipe: any) => void;
}

export default function TodaysMeals({
  dailyLog, todaysMeals, onLogMealNow, onNavigateToPlan, onAddMeal,
  setDailyLog, setDailyMacros, onNavigateToRecipe,
}: TodaysMealsProps) {
  const { t } = useI18n();
  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | null>(null);
  const [editGrams, setEditGrams] = useState(0);

  const startEdit = (entry: DailyLogEntry) => {
    setEditingEntry(entry);
    setEditGrams(entry.grams ?? 100);
  };

  const confirmEdit = () => {
    if (!editingEntry || !setDailyLog || !setDailyMacros) return;
    const original = editingEntry;
    const origGrams = original.grams ?? 100;
    const factor = editGrams / origGrams;

    const newMacros = {
      cal: Math.round(original.macros.cal * factor),
      pro: +(original.macros.pro * factor).toFixed(1),
      carbs: +(original.macros.carbs * factor).toFixed(1),
      fats: +(original.macros.fats * factor).toFixed(1),
    };

    setDailyLog((prev: DailyLogEntry[]) =>
      prev.map(e => e.id === original.id ? {
        ...e, grams: editGrams, macros: newMacros, portionDescription: `${editGrams}g`,
      } : e),
    );

    setDailyMacros((prev: any) => ({
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
      setDailyMacros((prev: any) => ({
        ...prev,
        consumed: {
          cal: Math.max(0, (prev.consumed?.cal || 0) - (entry.macros?.cal || 0)),
          pro: Math.max(0, (prev.consumed?.pro || 0) - (entry.macros?.pro || 0)),
          carbs: Math.max(0, (prev.consumed?.carbs || 0) - (entry.macros?.carbs || 0)),
          fats: Math.max(0, (prev.consumed?.fats || 0) - (entry.macros?.fats || 0)),
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
        <h2 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-primary" /> {t.home.todaysLog}
        </h2>
        {dailyLog.length > 0 && (
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
            {dailyLog.length} {dailyLog.length === 1 ? t.home.foodSingular : t.home.foods}
          </span>
        )}
      </div>

      {/* Logged meals */}
      {dailyLog.length > 0 && (
        <>
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm divide-y divide-outline-variant/10 overflow-hidden">
            {dailyLog.map((entry) => {
              const isEditing = editingEntry?.id === entry.id;
              const previewFactor = isEditing && entry.grams ? editGrams / entry.grams : 1;
              const previewMacros = isEditing ? {
                cal: Math.round(entry.macros.cal * previewFactor),
                pro: +(entry.macros.pro * previewFactor).toFixed(1),
                carbs: +(entry.macros.carbs * previewFactor).toFixed(1),
                fats: +(entry.macros.fats * previewFactor).toFixed(1),
              } : entry.macros;

              return (
                <div key={entry.id}>
                  <div className="flex items-center gap-3 px-4 py-3 group">
                    <span className="text-lg shrink-0">{slotIcons[entry.mealSlot] || '🍽️'}</span>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => entry.grams ? startEdit(entry) : undefined}>
                      <span className="font-headline text-xs font-bold uppercase text-tertiary truncate block">{entry.title}</span>
                      <div className="flex items-center gap-2 text-[9px] font-label tracking-widest uppercase text-on-surface-variant mt-0.5">
                        <span>{entry.time}</span>
                        <span>·</span>
                        <span className="text-primary font-bold">{entry.portionDescription}</span>
                        <span>·</span>
                        <span>{previewMacros.cal} kcal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {entry.grams && (
                        <button onClick={() => startEdit(entry)} className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(entry)} className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
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
                          <input type="text" inputMode="decimal" value={editGrams} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) setEditGrams(v); }} className="w-16 text-center bg-transparent text-on-surface font-headline font-bold text-sm border-x border-outline-variant/20 py-1.5 focus:outline-none" />
                          <button type="button" onClick={() => setEditGrams(editGrams + 10)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">g</span>
                        <button onClick={confirmEdit} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingEntry(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant hover:text-tertiary transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: 'kcal', value: previewMacros.cal, color: 'text-primary' },
                          { label: 'P', value: `${previewMacros.pro}g`, color: 'text-red-400' },
                          { label: 'C', value: `${previewMacros.carbs}g`, color: 'text-amber-400' },
                          { label: 'F', value: `${previewMacros.fats}g`, color: 'text-sky-400' },
                        ].map(m => (
                          <div key={m.label} className="bg-surface-container-highest rounded-sm py-1 px-2 text-center">
                            <span className={`block font-headline font-bold text-xs ${m.color}`}>{m.value}</span>
                            <span className="text-[8px] font-label uppercase tracking-widest text-on-surface-variant">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Diary totals */}
          <div className="flex items-center justify-between bg-surface-container-highest/50 rounded-sm px-4 py-2.5">
            <span className="text-[9px] font-label font-bold uppercase tracking-widest text-on-surface-variant">{t.home.totalLogged}</span>
            <div className="flex items-center gap-3 text-[10px] font-headline font-bold uppercase tracking-wider">
              <span className="text-primary">{dailyLog.reduce((s, e) => s + e.macros.cal, 0)} kcal</span>
              <span className="text-red-400">{dailyLog.reduce((s, e) => s + e.macros.pro, 0).toFixed(0)}g P</span>
              <span className="text-amber-400">{dailyLog.reduce((s, e) => s + e.macros.carbs, 0).toFixed(0)}g C</span>
              <span className="text-sky-400">{dailyLog.reduce((s, e) => s + e.macros.fats, 0).toFixed(0)}g F</span>
            </div>
          </div>
        </>
      )}

      {/* Planned meals (not yet logged) */}
      {todaysMeals.length > 0 && (
        <div className="space-y-2">
          {dailyLog.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> {t.home.plannedToday}
              </span>
              <button onClick={onNavigateToPlan} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">{t.plan.title}</button>
            </div>
          )}
          {!dailyLog.length && (
            <div className="flex items-center justify-between px-1">
              <span className="font-headline text-sm font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> {t.home.plannedToday}
              </span>
              <button onClick={onNavigateToPlan} className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">{t.plan.title}</button>
            </div>
          )}
          {todaysMeals.map((meal: any, idx: number) => (
            <div key={meal.id || idx} className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-sm flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-sm bg-surface-container-highest overflow-hidden shrink-0">
                <img src={meal.img || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"} alt={meal.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">{meal.type || meal.time}</span>
                </div>
                <h3 className="font-headline text-sm font-bold text-tertiary uppercase truncate mt-0.5">{meal.title}</h3>
                <span className="text-[10px] text-on-surface-variant font-mono">{meal.cal} {t.common.kcal}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onLogMealNow && onLogMealNow(meal, 1); }}
                className="shrink-0 px-4 py-2 bg-primary text-on-primary rounded-sm text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                {t.home.logIt}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="bg-surface-container-low border border-dashed border-outline-variant/40 p-10 rounded-sm text-center">
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest">{t.empty.planEmpty}</p>
          <button onClick={onAddMeal} className="mt-4 text-primary font-bold uppercase text-xs tracking-widest hover:underline">{t.fab.logMeal}</button>
        </div>
      )}
    </section>
  );
}
