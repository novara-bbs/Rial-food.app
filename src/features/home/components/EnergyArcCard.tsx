/**
 * EnergyArcCard — Home hero gauge.
 *
 * Sprint H (`[1.5.200]`) — editorial gauge upgrade per owner reference image:
 *   - Wider, more open arc (radius 88, stroke 16, center offset reduced).
 *   - **Lime → primary linear gradient** on the progress arc (not flat green).
 *   - **3-layer needle**: blurred halo + white ring + primary core.
 *   - **Responsive sizing** via `clamp(280px, 80vw, 380px)` on the wrapper —
 *     gauge scales fluidly across phones, phablets, and tablets.
 *   - Tighter "1155" letter-spacing for editorial feel.
 *   - `%` superscript-style on the centre stat to match MacroRingsCard.
 *
 * The macros card and the quality card are rendered as separate siblings in
 * `Home.tsx`; this component owns *only* the energy hero.
 */
import { useId } from 'react';
import SectionCard from '../../../components/SectionCard';
import { useI18n } from '../../../i18n';
import {
  describeGaugeProgress,
  describeGaugeTrack,
  gaugeProgress,
  gaugeNeedlePoint,
} from '../utils/gauge-arc';

interface DailyMacrosLike {
  consumed: { cal: number };
  target: { cal: number };
}

export interface EnergyArcCardProps {
  dailyMacros: DailyMacrosLike;
  /**
   * Optional fixed width override in px. When omitted (default), the gauge
   * uses `clamp(280px, 80vw, 380px)` for fluid responsive scaling.
   */
  size?: number;
  /** Optional anchor attribute so `useChipScrollSpy` can target this card. */
  anchorId?: string;
}

const GAUGE_VIEWBOX = 200;        // logical viewport width — gauge centred horizontally
const GAUGE_VIEWBOX_H = 130;      // logical viewport height — cropped to remove empty bottom (Sprint I)
const GAUGE_RADIUS = 88;          // arc radius inside the viewport
const GAUGE_STROKE = 16;          // arc width
const GAUGE_NEEDLE_R = 7;         // core dot radius; halo + ring scale from this
const GAUGE_CY_OFFSET = 18;       // shift arc down so number reads centred

/** Default fluid sizing — overridable via `size` prop. */
const DEFAULT_RESPONSIVE_WIDTH = 'clamp(280px, 80vw, 380px)';

export default function EnergyArcCard({
  dailyMacros,
  size,
  anchorId,
}: EnergyArcCardProps) {
  const { t } = useI18n();
  const titleId = useId();
  const gradId = useId();
  const glowId = useId();

  const consumed = Math.max(0, dailyMacros.consumed.cal);
  const target = Math.max(0, dailyMacros.target.cal);
  const remaining = Math.max(0, target - consumed);
  const isOverTarget = target > 0 && consumed > target;
  const progress = gaugeProgress(consumed, target);
  const pct = Math.round(progress * 100);

  const cx = GAUGE_VIEWBOX / 2;
  // cy still computed from the original 200x200 logical centre — keeps the arc
  // helpers (gauge-arc.ts) working unchanged. ViewBox is just cropped visually.
  const cy = GAUGE_VIEWBOX / 2 + GAUGE_CY_OFFSET;
  const trackPath = describeGaugeTrack(cx, cy, GAUGE_RADIUS);
  const progressPath = describeGaugeProgress(cx, cy, GAUGE_RADIUS, progress);
  const needle = gaugeNeedlePoint(cx, cy, GAUGE_RADIUS, progress);

  const ariaLabel = t.home.energyArc.ariaLabel
    .replace('{remaining}', String(remaining))
    .replace('{pct}', String(pct));

  // Stroke for the progress arc — gradient on-target, solid error when over.
  const progressStroke = isOverTarget ? 'var(--color-error)' : `url(#${gradId})`;
  const halloFill = isOverTarget ? 'var(--color-error)' : 'var(--color-primary)';
  const coreClass = isOverTarget ? 'fill-error' : 'fill-primary';

  // Sizing: prop overrides (escape hatch for tests / specific layouts);
  // otherwise fluid clamp.
  const wrapperWidth = size != null ? `${size}px` : DEFAULT_RESPONSIVE_WIDTH;

  return (
    <SectionCard
      padding="md"
      spacing="sm"
      className="bg-transparent border-0 shadow-none"
    >
      <div
        className="flex flex-col items-center gap-1 w-full"
        data-testid="energy-arc-card"
        data-anchor={anchorId}
      >
        <div
          className="relative aspect-[20/13]"
          style={{ width: wrapperWidth }}
          role="img"
          aria-labelledby={titleId}
          aria-label={ariaLabel}
        >
          <svg
            viewBox={`0 0 ${GAUGE_VIEWBOX} ${GAUGE_VIEWBOX_H}`}
            className="w-full h-full overflow-visible"
            aria-hidden="true"
            data-testid="energy-arc-svg"
          >
            <defs>
              {/* Lime → primary horizontal gradient on the progress arc */}
              <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-macro-fiber)" />
                <stop offset="60%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
              {/* Gaussian blur for the needle halo */}
              <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {/* Track (unfilled half-circle) */}
            <path
              d={trackPath}
              fill="none"
              stroke="var(--color-outline-variant)"
              strokeOpacity={0.4}
              strokeWidth={GAUGE_STROKE}
              strokeLinecap="round"
              data-testid="energy-arc-track"
            />

            {/* Progress arc — gradient on-target, error solid when over */}
            {progressPath && (
              <path
                d={progressPath}
                fill="none"
                stroke={progressStroke}
                strokeWidth={GAUGE_STROKE}
                strokeLinecap="round"
                className="transition-all duration-700"
                data-testid="energy-arc-progress"
              />
            )}

            {/* Needle — 3 layers: halo (blur) + white ring + primary core */}
            {needle && (
              <>
                <circle
                  cx={needle.x}
                  cy={needle.y}
                  r={GAUGE_NEEDLE_R * 2.4}
                  fill={halloFill}
                  opacity={0.25}
                  filter={`url(#${glowId})`}
                  data-testid="energy-arc-needle-halo"
                />
                <circle
                  cx={needle.x}
                  cy={needle.y}
                  r={GAUGE_NEEDLE_R * 1.5}
                  fill="var(--color-surface)"
                  data-testid="energy-arc-needle-ring"
                />
                <circle
                  cx={needle.x}
                  cy={needle.y}
                  r={GAUGE_NEEDLE_R * 0.8}
                  className={coreClass}
                  data-testid="energy-arc-needle"
                />
              </>
            )}
          </svg>

          {/* Centred number + label inside the arc — sized to fill the white space.
              pt-6 nudges the number down to sit visually inside the arc curvature. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-6 pointer-events-none">
            <span
              id={titleId}
              className={`font-headline font-bold tracking-tighter tabular-nums leading-none transition-colors duration-500 ${
                isOverTarget
                  ? 'text-error'
                  : remaining > 0
                    ? 'text-on-surface'
                    : 'text-on-surface-variant'
              }`}
              style={{ fontSize: 'clamp(3.5rem, 14vw, 5.5rem)' }}
              data-testid="energy-arc-remaining"
            >
              {remaining}
            </span>
            <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant mt-1">
              {t.home.energyArc.remaining}
            </span>
          </div>
        </div>

        {/* Stats row — aligned with arc endpoints (left=arc start, right=arc end, center=arc bottom).
            Arc start/end at viewBox x=12 / x=188 of 200 → 6%/94% of wrapper width. */}
        <dl
          className="grid grid-cols-3 w-full gap-2"
          style={{ maxWidth: wrapperWidth, paddingLeft: '5%', paddingRight: '5%' }}
          data-testid="energy-arc-stats"
        >
          <div className="flex flex-col gap-1 items-start">
            <dd className="font-headline font-bold text-title-sm text-on-surface tabular-nums">
              {consumed}
            </dd>
            <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
              {t.home.energyArc.today}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <dd className={`flex items-baseline gap-px font-headline font-bold text-title-sm tabular-nums ${isOverTarget ? 'text-error' : 'text-on-surface'}`}>
              <span>{pct}</span>
              <span className="font-body text-micro font-semibold" aria-hidden="true">%</span>
            </dd>
            <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
              {t.home.energyArc.ofDay}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <dd className="font-headline font-bold text-title-sm text-on-surface-variant tabular-nums">
              {target}
            </dd>
            <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface-variant">
              {t.home.energyArc.goal}
            </span>
          </div>
        </dl>
      </div>
    </SectionCard>
  );
}
