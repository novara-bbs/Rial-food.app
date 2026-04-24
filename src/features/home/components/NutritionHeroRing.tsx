/**
 * PR 8 — flag-on path for NutritionHero.
 *
 * Shape (Option A hybrid from `docs/market/home-patterns-benchmark.md` §4.4):
 *   - Semi-ring 270° open at bottom (Yazio / Lifesum convergence, 2/5 strict
 *     + 4/5 "ring family" in the matrix). Progress fills clockwise from 7:30
 *     toward 4:30; track is a muted full 270° arc behind it.
 *   - Number hero centered inside the ring — remaining kcal as the primary
 *     glanceable metric (3/5 competitors make this the hero number).
 *   - Below the ring: 3-col row with carbs / protein / fats (absolute
 *     `consumed / target g`). Yazio pattern — vertical budget wins over
 *     3-donut stack (§4.4 macros decision).
 *
 * Implementation notes:
 *   - Handwritten SVG arc — no recharts import, zero bundle impact. The
 *     arc math lives in `describeSemiRingArc()` below.
 *   - Same props interface as `NutritionHero` so the caller (`Home.tsx`)
 *     does not need to branch. The flag decision is made inside
 *     `NutritionHero.tsx` which routes to this component when on.
 *   - `mode` prop kept for API parity with the legacy hero, but ignored —
 *     the flag-on shape is a single unified layout (`simple` vs `detailed`
 *     distinction becomes moot once the ring carries the scalar).
 *   - Colors use theme tokens only (see ADR-003 + DESIGN-SYSTEM.md).
 */
import { Zap, HelpCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';
import SectionCard from '../../../components/SectionCard';

interface Macros {
  consumed: { cal: number; pro: number; carbs: number; fats: number };
  target: { cal: number; pro: number; carbs: number; fats: number };
}

interface Props {
  dailyMacros: Macros;
  mode?: 'simple' | 'detailed';
  exerciseCalories?: number;
  /** User goal: 'cut' | 'muscle' | 'maintain' (or any string from profile). */
  goal?: string;
}

/**
 * Builds an SVG path for a 270° semi-ring arc open at the bottom.
 * `progress` is 0–1; the arc is drawn clockwise starting at the 7:30 position
 * (θ=225° measured clockwise from 12 o'clock).
 *
 * Returns `null` when progress is 0 (nothing to draw).
 */
export function describeSemiRingArc(
  cx: number,
  cy: number,
  r: number,
  progress: number,
): string | null {
  if (progress <= 0) return null;
  const capped = Math.min(progress, 1);
  const sweepDeg = capped * 270;
  const startDeg = 225;
  const endDeg = startDeg + sweepDeg;
  const toRad = (d: number) => (d * Math.PI) / 180;
  // Clockwise-from-top coordinate: x = cx + r·sin(θ), y = cy − r·cos(θ)
  const startX = cx + r * Math.sin(toRad(startDeg));
  const startY = cy - r * Math.cos(toRad(startDeg));
  const endX = cx + r * Math.sin(toRad(endDeg));
  const endY = cy - r * Math.cos(toRad(endDeg));
  const largeArc = sweepDeg > 180 ? 1 : 0;
  const sweep = 1; // clockwise
  return `M ${startX.toFixed(3)} ${startY.toFixed(3)} A ${r} ${r} 0 ${largeArc} ${sweep} ${endX.toFixed(3)} ${endY.toFixed(3)}`;
}

/**
 * Full 270° track (used for the muted background arc).
 */
export function describeSemiRingTrack(cx: number, cy: number, r: number): string {
  // Hard-coded full sweep — equivalent to describeSemiRingArc(cx, cy, r, 1).
  const toRad = (d: number) => (d * Math.PI) / 180;
  const startX = cx + r * Math.sin(toRad(225));
  const startY = cy - r * Math.cos(toRad(225));
  const endX = cx + r * Math.sin(toRad(495));
  const endY = cy - r * Math.cos(toRad(495));
  return `M ${startX.toFixed(3)} ${startY.toFixed(3)} A ${r} ${r} 0 1 1 ${endX.toFixed(3)} ${endY.toFixed(3)}`;
}

export default function NutritionHeroRing({ dailyMacros, exerciseCalories = 0, goal }: Props) {
  const { t } = useI18n();

  const remaining = dailyMacros.target.cal - dailyMacros.consumed.cal + exerciseCalories;
  const consumedProgress =
    dailyMacros.target.cal > 0
      ? Math.max(0, Math.min(dailyMacros.consumed.cal / dailyMacros.target.cal, 1))
      : 0;

  // SVG geometry — 180×180 viewBox, r=72 keeps a 12-px stroke + breathing room.
  const cx = 90;
  const cy = 90;
  const r = 72;
  const progressPath = describeSemiRingArc(cx, cy, r, consumedProgress);
  const trackPath = describeSemiRingTrack(cx, cy, r);

  const macros = [
    {
      key: 'carbs',
      label: t.home.carbs,
      consumed: dailyMacros.consumed.carbs,
      target: dailyMacros.target.carbs,
      dotClass: 'bg-tertiary',
      barClass: 'bg-tertiary',
    },
    {
      key: 'protein',
      label: t.home.protein,
      consumed: dailyMacros.consumed.pro,
      target: dailyMacros.target.pro,
      dotClass: 'bg-brand-secondary',
      barClass: 'bg-brand-secondary',
    },
    {
      key: 'fats',
      label: t.home.fats,
      consumed: dailyMacros.consumed.fats,
      target: dailyMacros.target.fats,
      dotClass: 'bg-error',
      barClass: 'bg-error',
    },
  ];

  const ringAria = t.home.ringAriaLabel.replace('{remaining}', String(remaining));

  /** Resolve the ICP-adaptive goal-status chip (Q15). */
  const goalStatus: { text: string; isPositive: boolean } | null = (() => {
    if (!goal) return null;
    const abs = Math.abs(remaining);
    if (goal === 'cut') {
      if (remaining >= 0)
        return { text: t.home.goalCutOnTrack.replace('{n}', String(remaining)), isPositive: true };
      return { text: t.home.goalOver.replace('{n}', String(abs)), isPositive: false };
    }
    if (goal === 'muscle') {
      if (remaining > 0)
        return { text: t.home.goalMuscleNeed.replace('{n}', String(remaining)), isPositive: false };
      return { text: t.home.goalMuscleDone, isPositive: true };
    }
    if (goal === 'maintain') {
      if (remaining >= 0)
        return { text: t.home.goalMaintainBalance.replace('{n}', String(remaining)), isPositive: true };
      return { text: t.home.goalOver.replace('{n}', String(abs)), isPositive: false };
    }
    return null;
  })();

  return (
    <section className="space-y-4" data-testid="nutrition-hero-ring">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-headline text-xl font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> {t.home.weekSummary}
          <span title={t.home.macroTooltip}>
            <HelpCircle className="w-4 h-4 text-on-surface-variant cursor-help" />
          </span>
        </h2>
      </div>

      <SectionCard padding="lg" spacing="md">
        {/* Semi-ring hero — number is the hero, ring is backdrop (Yazio pattern). */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-44 h-44" role="img" aria-label={ringAria}>
            <svg
              viewBox="0 0 180 180"
              className="w-full h-full"
              aria-hidden="true"
              data-testid="hero-ring-svg"
            >
              {/* Track — muted full 270° arc */}
              <path
                d={trackPath}
                fill="none"
                stroke="var(--surface-container-highest)"
                strokeWidth={12}
                strokeLinecap="round"
              />
              {/* Progress — clockwise fill */}
              {progressPath && (
                <path
                  d={progressPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={12}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-700"
                  data-testid="hero-ring-progress"
                />
              )}
            </svg>
            {/* Centered number overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="font-headline font-bold text-display text-primary tabular-nums leading-none">
                {remaining}
              </span>
              <span className="font-label text-micro font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                {t.home.kcal} {t.home.remaining}
              </span>
            </div>
          </div>

          {/* Running-sum caption — "Objetivo − Alimentos + Ejercicio" (MFP pattern §3.4). */}
          <dl className="flex items-center justify-center gap-4 flex-wrap font-label text-micro uppercase tracking-wider pt-2">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-on-surface-variant font-bold">{t.home.target}</dt>
              <dd className="tabular-nums font-bold text-on-surface">{dailyMacros.target.cal}</dd>
            </div>
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
      </SectionCard>

      {/* 3-col macros row — Yazio pattern (dot + thin bar + absolute). */}
      <SectionCard padding="md" spacing="md" className="grid grid-cols-3 gap-4">
        {macros.map((m) => {
          const pct =
            m.target > 0 ? Math.min(Math.max(m.consumed / m.target, 0), 1) * 100 : 0;
          return (
            <div key={m.key} className="flex flex-col gap-1.5" data-testid={`macro-col-${m.key}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${m.dotClass}`} aria-hidden="true" />
                <span className="font-label text-micro font-bold uppercase tracking-widest text-on-surface-variant truncate">
                  {m.label}
                </span>
              </div>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.barClass} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="font-label text-micro font-bold tabular-nums text-tertiary uppercase tracking-wider">
                {m.consumed} / {m.target}
                <span className="text-on-surface-variant ml-0.5">g</span>
              </div>
            </div>
          );
        })}
      </SectionCard>

      {/* ICP-adaptive goal-status chip (Q15) — only shown when user has a goal set. */}
      {goalStatus && (
        <div
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-sm font-label text-micro font-bold uppercase tracking-widest transition-colors ${
            goalStatus.isPositive
              ? 'bg-primary/10 text-primary'
              : 'bg-error/10 text-error'
          }`}
          data-testid="goal-status-chip"
          aria-live="polite"
        >
          {goalStatus.text}
        </div>
      )}
    </section>
  );
}
