import { Zap, HelpCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';

interface Macros {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
}

export default function NutritionHero({ dailyMacros, mode = 'detailed', exerciseCalories = 0 }: { dailyMacros: Macros; mode?: 'simple' | 'detailed'; exerciseCalories?: number }) {
  const { t } = useI18n();

  const macroProgress = {
    cal: Math.round((dailyMacros.consumed.cal / dailyMacros.target.cal) * 100),
    pro: Math.round((dailyMacros.consumed.pro / dailyMacros.target.pro) * 100),
    carbs: Math.round((dailyMacros.consumed.carbs / dailyMacros.target.carbs) * 100),
    fats: Math.round((dailyMacros.consumed.fats / dailyMacros.target.fats) * 100),
  };

  const macroItems = [
    { label: t.home.kcal, consumed: dailyMacros.consumed.cal, target: dailyMacros.target.cal, unit: 'kcal', val: macroProgress.cal, color: 'text-primary', bg: 'bg-primary/10', barColor: 'bg-primary' },
    { label: t.home.protein, consumed: dailyMacros.consumed.pro, target: dailyMacros.target.pro, unit: 'g', val: macroProgress.pro, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10', barColor: 'bg-brand-secondary' },
    { label: t.home.carbs, consumed: dailyMacros.consumed.carbs, target: dailyMacros.target.carbs, unit: 'g', val: macroProgress.carbs, color: 'text-tertiary', bg: 'bg-tertiary/10', barColor: 'bg-tertiary' },
    { label: t.home.fats, consumed: dailyMacros.consumed.fats, target: dailyMacros.target.fats, unit: 'g', val: macroProgress.fats, color: 'text-error', bg: 'bg-error/10', barColor: 'bg-error' },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> {t.home.weekSummary}
          <span title={t.home.macroTooltip}>
            <HelpCircle className="w-4 h-4 text-on-surface-variant cursor-help" />
          </span>
        </h2>
      </div>

      {/* Calorie Math: Target - Food + Exercise = Remaining */}
      <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
        <div className="text-center flex-1">
          <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.home.target}</span>
          <span className="font-headline font-bold text-tertiary">{dailyMacros.target.cal}</span>
        </div>
        <span className="text-on-surface-variant font-bold text-lg">-</span>
        <div className="text-center flex-1">
          <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.home.food}</span>
          <span className="font-headline font-bold text-tertiary">{dailyMacros.consumed.cal}</span>
        </div>
        <span className="text-on-surface-variant font-bold text-lg">+</span>
        <div className="text-center flex-1">
          <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.home.exercise}</span>
          <span className="font-headline font-bold text-brand-secondary">{exerciseCalories}</span>
        </div>
        <span className="text-on-surface-variant font-bold text-lg">=</span>
        <div className="text-center flex-1">
          <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{t.home.remaining}</span>
          <span className="font-headline font-bold text-primary text-xl">{dailyMacros.target.cal - dailyMacros.consumed.cal + exerciseCalories}</span>
        </div>
      </div>

      {/* Macro progress */}
      {mode === 'simple' ? (
        <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-sm space-y-6">
          {macroItems.map((m) => (
            <div key={m.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{m.consumed} / {m.target}{m.unit}</span>
                  <span className="font-headline font-bold text-sm text-tertiary w-10 text-right">{m.val}%</span>
                </div>
              </div>
              <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full ${m.barColor} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(m.val, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded-sm grid grid-cols-2 md:grid-cols-4 gap-6">
          {macroItems.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 ${m.bg} rounded-full flex items-center justify-center relative`}>
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={175.9 * (1 - Math.min(m.val, 100) / 100)} strokeLinecap="round" className={m.color} />
                </svg>
                <span className={`absolute text-xs font-black ${m.color}`}>{m.val}%</span>
              </div>
              <div className="text-center mt-1">
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block">{m.label}</span>
                <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">{m.consumed} / {m.target}{m.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
