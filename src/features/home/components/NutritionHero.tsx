import { Zap, HelpCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';
import SectionCard from '../../../components/SectionCard';

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

  const remaining = dailyMacros.target.cal - dailyMacros.consumed.cal + exerciseCalories;

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

      {/*
        Calorie equation hero — RESTANTE as primary number, math as caption.
        Replaces the former 4-column flex layout that clipped "RESTANTE" on ≤375 px widths.
      */}
      <SectionCard padding="md" spacing="sm">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="font-label text-micro uppercase tracking-wider font-bold text-on-surface-variant">
              {t.home.remaining}
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-headline font-bold text-display text-primary tabular-nums leading-none">
                {remaining}
              </span>
              <span className="font-label text-label font-bold text-on-surface-variant uppercase tracking-wider">
                {t.home.kcal}
              </span>
            </div>
          </div>
          <dl className="shrink-0 text-right font-label text-micro uppercase tracking-wider space-y-1">
            <div className="flex items-baseline justify-end gap-1.5">
              <dt className="text-on-surface-variant font-bold">{t.home.target}</dt>
              <dd className="tabular-nums font-bold text-on-surface">{dailyMacros.target.cal}</dd>
            </div>
            <div className="flex items-baseline justify-end gap-1.5">
              <dt className="text-on-surface-variant font-bold">− {t.home.food}</dt>
              <dd className="tabular-nums font-bold text-on-surface">{dailyMacros.consumed.cal}</dd>
            </div>
            <div className="flex items-baseline justify-end gap-1.5">
              <dt className="text-on-surface-variant font-bold">+ {t.home.exercise}</dt>
              <dd className="tabular-nums font-bold text-brand-secondary">{exerciseCalories}</dd>
            </div>
          </dl>
        </div>
      </SectionCard>

      {/* Macro progress */}
      {mode === 'simple' ? (
        <SectionCard padding="lg" spacing="lg">
          {macroItems.map((m) => (
            <div key={m.label} className="space-y-2">
              <div className="flex justify-between items-center gap-3">
                <span className="font-label text-label font-bold uppercase tracking-wider text-on-surface-variant">{m.label}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-label text-micro font-bold text-on-surface-variant uppercase tracking-wider tabular-nums">{m.consumed} / {m.target}{m.unit}</span>
                  <span className="font-headline font-bold text-body-sm text-tertiary w-10 text-right tabular-nums">{m.val}%</span>
                </div>
              </div>
              <div className="h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full ${m.barColor} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(m.val, 100)}%` }} />
              </div>
            </div>
          ))}
        </SectionCard>
      ) : (
        <SectionCard padding="lg" spacing="md" className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {macroItems.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 ${m.bg} rounded-full flex items-center justify-center relative`}>
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={175.9 * (1 - Math.min(m.val, 100) / 100)} strokeLinecap="round" className={m.color} />
                </svg>
                <span className={`absolute font-label text-label font-black ${m.color}`}>{m.val}%</span>
              </div>
              <div className="text-center mt-1">
                <span className="font-label text-label font-bold uppercase tracking-wider text-on-surface-variant block">{m.label}</span>
                <span className="font-label text-micro font-bold text-tertiary uppercase tracking-wider tabular-nums">{m.consumed} / {m.target}{m.unit}</span>
              </div>
            </div>
          ))}
        </SectionCard>
      )}
    </section>
  );
}
