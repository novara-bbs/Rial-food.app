/**
 * Home advanced calorie + macro hero (post-1.5.186 redesign).
 *
 * Owner brief (2026-05-01): "que arriba se vean las calorías con su porcentaje
 * que llevas, el objetivo a la orilla y las que llevas con el circulito; abajo
 * la diferenciación entre grasas, carbohidratos y proteína, y la fibra como
 * tercera subsección; y un enlace a una pantalla extendida".
 *
 * Layout (advanced):
 *   ┌──── SectionCard ─────────────────────────────────┐
 *   │  78%       ╭───────────╮                          │
 *   │  KCAL      │  1155      │   ← ring with consumed   │
 *   │            │  ───────   │     over target inside    │
 *   │            │   1850     │                           │
 *   │            ╰───────────╯                          │
 *   │   Target − Food + Exercise running-sum dl          │
 *   └────────────────────────────────────────────────────┘
 *   ┌──── SectionCard ─────────────────────────────────┐
 *   │  4 rows: [%] [label + bar] [consumed/target g]    │
 *   │  carbs · protein · fats · fiber                   │
 *   │  ─────────────                                     │
 *   │  Ver detalle nutricional        ChevronRight →    │
 *   └────────────────────────────────────────────────────┘
 *
 * Simple mode keeps the original centered ring + remaining hero,
 * unchanged from 1.5.65.
 *
 * Implementation notes:
 *   - Same SVG arc helpers as before (no recharts).
 *   - Macros use bg-macro-{key} tokens (auto-generated from --color-macro-*).
 *   - Goal-status chip preserved (Q15 logic, advanced only).
 */
import { Zap, HelpCircle, ChevronRight, Flame } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { Heading } from '../../../components/ui/Typography';
import SectionCard from '../../../components/SectionCard';
import MacroProgressRow from './MacroProgressRow';

interface Macros {
  consumed: { cal: number; pro: number; carbs: number; fats: number; fiber?: number };
  target: { cal: number; pro: number; carbs: number; fats: number; fiber?: number };
}

interface Props {
  dailyMacros: Macros;
  mode?: 'simple' | 'advanced';
  exerciseCalories?: number;
  /** User goal: 'cut' | 'muscle' | 'maintain' (or any string from profile). */
  goal?: string;
  /** Navigates to the extended NutritionDetail screen. Advanced mode only. */
  onNavigateToNutritionDetail?: () => void;
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
  const toRad = (d: number) => (d * Math.PI) / 180;
  const startX = cx + r * Math.sin(toRad(225));
  const startY = cy - r * Math.cos(toRad(225));
  const endX = cx + r * Math.sin(toRad(495));
  const endY = cy - r * Math.cos(toRad(495));
  return `M ${startX.toFixed(3)} ${startY.toFixed(3)} A ${r} ${r} 0 1 1 ${endX.toFixed(3)} ${endY.toFixed(3)}`;
}

/**
 * Inline ring component. `size` controls outer dimension in px (used by the
 * detail screen to render a larger version).
 */
export function CalorieRing({
  consumed,
  target,
  size = 176,
  ariaLabel,
  layout = 'consumed-target',
  consumedLabel = 'Consumed',
  targetLabel = 'Target',
  remainingLabel = 'Remaining',
}: {
  consumed: number;
  target: number;
  size?: number;
  ariaLabel: string;
  /**
   * `consumed-target` (default, post-1.5.189 polish): big REMAINING inside the ring
   * with `kcal` inline + caption + bottom corner labels (consumed left, target right).
   * `remaining` legacy: big remaining kcal number only (used by simple-mode fallback).
   */
  layout?: 'consumed-target' | 'remaining';
  consumedLabel?: string;
  targetLabel?: string;
  remainingLabel?: string;
}) {
  const cx = 90;
  const cy = 90;
  const r = 72;
  const progress = target > 0 ? Math.max(0, Math.min(consumed / target, 1)) : 0;
  const progressPath = describeSemiRingArc(cx, cy, r, progress);
  const trackPath = describeSemiRingTrack(cx, cy, r);
  const remaining = Math.max(0, target - consumed);

  // Layout `consumed-target`: ring + corner labels in a flex column. Labels live
  // OUTSIDE the SVG container as a sibling row → guarantees no visual overlap with
  // the arc termini, and keeps the structure resilient to ring size changes.
  const ring = (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true" data-testid="hero-ring-svg">
        <path d={trackPath} fill="none" stroke="var(--surface-container-highest)" strokeWidth={18} strokeLinecap="round" />
        {progressPath && (
          <path
            d={progressPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={18}
            strokeLinecap="round"
            className="text-primary transition-all duration-700"
            data-testid="hero-ring-progress"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
        {layout === 'remaining' && (
          <>
            <span className="font-headline font-bold text-display text-primary tabular-nums leading-none">
              {Math.round(remaining)}
            </span>
            <span className="font-label text-micro font-bold text-on-surface-variant uppercase tracking-widest mt-1">
              kcal
            </span>
          </>
        )}
        {layout === 'consumed-target' && (
          <>
            <div className="flex items-baseline gap-1">
              <span className="font-headline font-bold text-headline text-on-surface tabular-nums leading-none">
                {Math.round(remaining)}
              </span>
              <span className="font-body text-body-sm font-medium text-on-surface-variant leading-none">
                kcal
              </span>
            </div>
            <span className="font-body text-micro text-on-surface-variant mt-1 leading-none">
              {remainingLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );

  if (layout === 'remaining') return ring;

  // consumed-target → ring + corner-labels row below
  return (
    <div className="flex flex-col items-center gap-2">
      {ring}
      <div className="flex items-start justify-between" style={{ width: size }}>
        <div className="flex flex-col items-start leading-tight">
          <span className="font-body text-body-sm font-semibold text-on-surface tabular-nums">
            {Math.round(consumed)}
          </span>
          <span className="font-body text-micro text-on-surface-variant">
            {consumedLabel}
          </span>
        </div>
        <div className="flex flex-col items-end leading-tight">
          <span className="font-body text-body-sm font-semibold text-on-surface tabular-nums">
            {Math.round(target)}
          </span>
          <span className="font-body text-micro text-on-surface-variant">
            {targetLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NutritionHeroRing({
  dailyMacros,
  mode = 'advanced',
  exerciseCalories = 0,
  goal,
  onNavigateToNutritionDetail,
}: Props) {
  const { t } = useI18n();

  const remaining = dailyMacros.target.cal - dailyMacros.consumed.cal + exerciseCalories;

  // Macro rows — order: carbs, protein, fats, fiber (matches owner brief).
  const macroRows = [
    {
      key: 'carbs',
      label: t.home.carbs,
      consumed: dailyMacros.consumed.carbs,
      target: dailyMacros.target.carbs,
      colorClassName: 'bg-macro-carbs',
    },
    {
      key: 'protein',
      label: t.home.protein,
      consumed: dailyMacros.consumed.pro,
      target: dailyMacros.target.pro,
      colorClassName: 'bg-macro-protein',
    },
    {
      key: 'fats',
      label: t.home.fats,
      consumed: dailyMacros.consumed.fats,
      target: dailyMacros.target.fats,
      colorClassName: 'bg-macro-fats',
    },
    {
      key: 'fiber',
      label: t.home.fiber,
      consumed: dailyMacros.consumed.fiber ?? 0,
      target: dailyMacros.target.fiber ?? 30,
      colorClassName: 'bg-macro-fiber',
    },
  ];

  const ringAria = t.home.ringAriaLabel.replace('{remaining}', String(remaining));

  // ── Simple mode early-return ────────────────────────────────────────────────
  // Simple users are here to cook, not to track macros. Show only a compact
  // kcal pill that taps into NutritionDetail for the rare drill-down. No
  // header, no ring, no macros card, no goal-status chip — the rest of Home
  // surfaces (today's meals, recipes) get the breathing room.
  if (mode === 'simple') {
    const PillTag = onNavigateToNutritionDetail ? 'button' : 'div';
    return (
      <section data-testid="nutrition-hero-ring" data-mode="simple">
        <PillTag
          {...(onNavigateToNutritionDetail
            ? { type: 'button' as const, onClick: onNavigateToNutritionDetail }
            : {})}
          aria-label={ringAria}
          data-testid="hero-simple-pill"
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm bg-surface-container-low border border-outline-variant/20 ${
            onNavigateToNutritionDetail
              ? 'hover:bg-surface-container-highest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
              : ''
          }`}
        >
          <Flame className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span className="font-label text-body-sm font-semibold tabular-nums text-on-surface">
            {dailyMacros.consumed.cal}
            <span className="text-on-surface-variant"> / {dailyMacros.target.cal}</span>
          </span>
          <span className="font-label text-micro font-bold uppercase tracking-widest text-on-surface-variant">
            {t.home.kcal}
          </span>
          {onNavigateToNutritionDetail && (
            <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0 ml-auto" aria-hidden="true" />
          )}
        </PillTag>
      </section>
    );
  }

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
      <div className="flex items-center justify-between">
        <Heading level="h2" className="font-headline text-title-sm font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> {t.home.weekSummary}
          <span title={t.home.macroTooltip}>
            <HelpCircle className="w-4 h-4 text-on-surface-variant cursor-help" />
          </span>
        </Heading>
      </div>

      {/* Hero — same SectionCard padding as macros card so % left-edge aligns with
          card content below, but chrome (bg/border/shadow) cancelled so the hero
          reads as "estado del día" (no contenedor visual). */}
      <SectionCard
        padding="lg"
        spacing="md"
        className="bg-transparent border-0 shadow-none"
      >
        <div className="flex flex-col gap-3" data-testid="hero-ring-pct">
          <div className="flex items-center justify-between gap-2">
            <span className="font-headline font-bold text-hero text-on-surface tabular-nums leading-none">
              {Math.round(((Math.max(0, dailyMacros.consumed.cal)) / Math.max(1, dailyMacros.target.cal)) * 100)}%
            </span>
            <CalorieRing
              consumed={dailyMacros.consumed.cal}
              target={dailyMacros.target.cal}
              size={200}
              ariaLabel={ringAria}
              layout="consumed-target"
              consumedLabel={t.home.consumed}
              targetLabel={t.home.target}
              remainingLabel={t.home.remaining}
            />
          </div>
          <dl
            className="flex items-center justify-center gap-4 flex-wrap font-body text-body-sm font-medium tabular-nums"
            data-testid="hero-ring-running-sum"
          >
            <div className="flex items-baseline gap-1.5">
              <dt className="text-on-surface-variant">{t.home.target}</dt>
              <dd className="font-semibold text-on-surface">{dailyMacros.target.cal}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-on-surface-variant">− {t.home.food}</dt>
              <dd className="font-semibold text-on-surface">{dailyMacros.consumed.cal}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-on-surface-variant">+ {t.home.exercise}</dt>
              <dd className="font-semibold text-brand-secondary">{exerciseCalories}</dd>
            </div>
          </dl>
        </div>
      </SectionCard>

      {/* Macros — 4 rows + bottom CTA to NutritionDetail (micros, vitamins, supplements). */}
      <SectionCard padding="lg" spacing="md">
        <div className="space-y-5">
          {macroRows.map((m) => (
            <MacroProgressRow
              key={m.key}
              label={m.label}
              consumed={m.consumed}
              target={m.target}
              colorClassName={m.colorClassName}
              testId={`macro-row-${m.key}`}
            />
          ))}
        </div>

        {mode === 'advanced' && onNavigateToNutritionDetail && (
          <button
            type="button"
            onClick={onNavigateToNutritionDetail}
            className="mt-5 pt-4 border-t border-outline-variant/30 w-full flex items-center justify-between font-label text-micro font-bold uppercase tracking-widest text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
            data-testid="nutrition-detail-cta"
          >
            <span>{t.home.viewNutritionDetail}</span>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          </button>
        )}
      </SectionCard>

      {/* ICP-adaptive goal-status chip (Q15) — only shown when user has a goal set. */}
      {goalStatus && (
        <div
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-sm font-label text-micro font-semibold uppercase tracking-widest transition-colors ${
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
