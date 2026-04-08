import { ShoppingCart, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../i18n';
import EmptyState from '../components/EmptyState';

export default function Planner({ onOpenShoppingList, onAddMeal, mealPlan }: { onOpenShoppingList?: () => void, onAddMeal?: (dayIndex: number) => void, mealPlan?: Record<number, any[]> }) {
  const { t } = useI18n();
  const currentDayIndex = new Date().getDay();
  const adjustedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  const [activeDay, setActiveDay] = useState(adjustedDayIndex);

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
  const totalPro = currentMeals.reduce((sum: number, meal: any) => sum + (meal.pro || 0), 0);

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8">
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

      {/* Day selector */}
      <section className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20" role="group" aria-label={t.planner.weeklyPlan}>
        <div className="flex justify-between items-center">
          {dayLetters.map((letter, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
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
              {activeDay === index && <div className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </section>

      {/* Meals for selected day */}
      <section className="space-y-6">
        <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-2xl space-y-4">
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

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <span>{t.planner.dailyTotal}</span>
              <span>{Math.round((totalCals / 2000) * 100)}%</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min((totalCals / 2000) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Meal list */}
        <div className="space-y-3">
          {currentMeals.length === 0 ? (
            <EmptyState
              icon="📅"
              description={t.planner.noMeals}
              ctaLabel={t.planner.addMealBtn}
              onCta={() => onAddMeal?.(activeDay)}
            />
          ) : (
            currentMeals.map((meal: any, idx: number) => (
              <div
                key={meal.id || idx}
                className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 group cursor-pointer hover:border-primary/50 transition-all"
                role="button"
                aria-label={meal.title}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {meal.img ? (
                      <img src={meal.img} alt={meal.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="font-headline font-bold text-tertiary text-lg">{meal.title?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-label text-[10px] tracking-widest text-primary uppercase mb-0.5 font-bold">{meal.time} · {meal.type}</p>
                    <h4 className="font-headline font-bold text-base uppercase text-tertiary">{meal.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:text-right">
                  <div className="flex gap-4 text-xs font-label tracking-widest uppercase bg-surface-container-highest px-4 py-2 rounded-lg">
                    <span className="text-primary font-bold">{meal.cal} {t.common.kcal}</span>
                    <span className="text-brand-secondary font-bold">{meal.pro || 0}{t.common.g} P</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors hidden sm:block" />
                </div>
              </div>
            ))
          )}

          {/* Add meal button */}
          <button
            onClick={() => onAddMeal?.(activeDay)}
            aria-label={t.planner.addMealBtn}
            className="w-full border-2 border-dashed border-outline-variant/30 p-4 rounded-2xl flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors font-label text-xs font-bold tracking-widest uppercase"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> {t.planner.addMealBtn}
          </button>
        </div>
      </section>
    </div>
  );
}
