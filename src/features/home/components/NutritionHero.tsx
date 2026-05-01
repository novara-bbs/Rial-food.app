import { Zap, HelpCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { Heading } from '../../../components/ui/Typography';
import SectionCard from '../../../components/SectionCard';
import { featureFlags } from '../../../lib/featureFlags';
import NutritionHeroRing from './NutritionHeroRing';

interface Macros {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
}

export default function NutritionHero({ dailyMacros, mode = 'advanced', exerciseCalories = 0, goal }: { dailyMacros: Macros; mode?: 'simple' | 'advanced'; exerciseCalories?: number; goal?: string }) {
  const { t } = useI18n();

  // PR 8 — Bevel Home ring-grid. When the feature flag is on, render the
  // new semi-ring 270° + 3-col macros shape (Option A hybrid, see
  // docs/market/home-patterns-benchmark.md §4.4). The legacy equation-hero
  // path below remains untouched as the fallback when the flag is off — the
  // rollback path is flipping `homeRingGrid` back to `false`. The hook above
  // must run before this early-return to respect rules-of-hooks.
  if (featureFlags.homeRingGrid) {
    return (
      <NutritionHeroRing dailyMacros={dailyMacros} mode={mode} exerciseCalories={exerciseCalories} goal={goal} />
    );
  }

  // Guard divisions when target is 0 (pre-onboarding, partial data) — avoids
  // `Infinity%` rendering. Negative consumed clamps to 0.
  const pct = (consumed: number, target: number) =>
    target > 0 ? Math.round((Math.max(0, consumed) / target) * 100) : 0;
  const macroProgress = {
    cal: pct(dailyMacros.consumed.cal, dailyMacros.target.cal),
    pro: pct(dailyMacros.consumed.pro, dailyMacros.target.pro),
    carbs: pct(dailyMacros.consumed.carbs, dailyMacros.target.carbs),
    fats: pct(dailyMacros.consumed.fats, dailyMacros.target.fats),
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
      <div className="flex items-center justify-between">
        <Heading level="h2" className="font-headline text-title-sm font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> {t.home.weekSummary}
          <span title={t.home.macroTooltip}>
            <HelpCircle className="w-4 h-4 text-on-surface-variant cursor-help" />
          </span>
        </Heading>
      </div>

      {/*
        Calorie hero — mode-adaptive (simple vs advanced).
        Simple: large Remaining number + visible daily-goal caption.
        Advanced: 3-col Consumido | Restante | Objetivo + running-sum caption below.
      */}
      <SectionCard padding="md" spacing="sm">
        {mode === 'simple' ? (
          <div className="flex flex-col items-center text-center gap-2">
            <span className="font-label text-micro uppercase tracking-widest font-bold text-on-surface-variant">
              {t.home.remaining}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline font-bold text-display text-primary tabular-nums leading-none">
                {remaining}
              </span>
              <span className="font-label text-label font-bold text-on-surface-variant uppercase tracking-wider">
                {t.home.kcal}
              </span>
            </div>
            <span
              className="font-label text-body-sm text-on-surface-variant"
              data-testid="hero-daily-goal-caption"
            >
              {t.home.dayGoal.replace('{n}', String(dailyMacros.target.cal))}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center" data-testid="hero-kcal-3col">
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-micro font-semibold uppercase tracking-widest text-on-surface-variant">
                  {t.home.consumed}
                </span>
                <span className="font-headline font-bold text-title-lg text-on-surface tabular-nums leading-none">
                  {dailyMacros.consumed.cal}
                </span>
                <span className="font-label text-micro font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t.home.kcal}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-micro font-semibold uppercase tracking-widest text-on-surface-variant">
                  {t.home.remaining}
                </span>
                <span className="font-headline font-bold text-title-lg text-primary tabular-nums leading-none">
                  {remaining}
                </span>
                <span className="font-label text-micro font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t.home.kcal}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-micro font-semibold uppercase tracking-widest text-on-surface-variant">
                  {t.home.target}
                </span>
                <span className="font-headline font-bold text-title-lg text-on-surface tabular-nums leading-none">
                  {dailyMacros.target.cal}
                </span>
                <span className="font-label text-micro font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t.home.kcal}
                </span>
              </div>
            </div>
            <dl
              className="flex items-center justify-center gap-4 flex-wrap font-label text-micro uppercase tracking-wider"
              data-testid="hero-running-sum"
            >
              <div className="flex items-baseline gap-1.5">
                <dt className="text-on-surface-variant font-bold">− {t.home.food}</dt>
                <dd className="tabular-nums font-bold text-on-surface">{dailyMacros.consumed.cal}</dd>
              </div>
              <div className="flex items-baseline gap-1.5">
                <dt className="text-on-surface-variant font-bold">+ {t.home.exercise}</dt>
                <dd className="tabular-nums font-bold text-brand-secondary">{exerciseCalories}</dd>
              </div>
            </dl>
          </div>
        )}
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
