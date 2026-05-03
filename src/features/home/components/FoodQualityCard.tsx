/**
 * FoodQualityCard — Sprint D expandable card showing 6 food-quality metrics.
 *
 * Collapsed state (default):
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  [◯63] Calidad de la comida                          [∨]   │
 *   │        6 parámetros · cobertura media 63%                   │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * Expanded state:
 *   + 6 `<QualityMetricRow>` items separated by dividers
 *   + optional "Parciales" note
 *   + "Ver nutrición total →" CTA
 *
 * The score ring reuses the same SVG stroke-dasharray idiom as `MacroRingsCard`.
 * Token-pure: no hex, no `dark:` prefix, no raw Tailwind text sizes.
 */
import { useState, useId } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '../../../components/ui/Typography';
import { useI18n } from '../../../i18n';
import QualityMetricRow from './QualityMetricRow';
import type { DailyQuality, QualityBadge, QualityMetricKey } from '../utils/daily-quality';

export interface FoodQualityCardProps {
  quality: DailyQuality;
  onViewNutrition?: () => void;
  anchorId?: string;
  className?: string;
  /** Start expanded (useful for Calidad tab of NutritionDetail). */
  defaultExpanded?: boolean;
  /**
   * When true, render only the inner content (no SectionCard wrapper).
   * Used by Home.tsx to compose Macros + Quality inside a single shared
   * SectionCard (Sprint H+).
   */
  bare?: boolean;
}

// ─── Metric row config ────────────────────────────────────────────────────────
// Sprint G: icons removed (PDF reference uses just colored dots in QualityMetricRow).

const METRIC_KEYS: QualityMetricKey[] = [
  'fiber',
  'sugar',
  'saturatedFat',
  'salt',
  'ultraProcessed',
  'fruitsVegetables',
];

const SCORE_RING_SIZE = 44;
const SCORE_RING_STROKE = 5;
const SCORE_RING_RADIUS = (SCORE_RING_SIZE - SCORE_RING_STROKE) / 2;
const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_RING_RADIUS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the CSS color variable to use for the score ring based on coverage score. */
function scoreRingColor(score: number): string {
  if (score >= 70) return 'var(--color-primary)';
  if (score >= 40) return 'var(--color-tertiary)';
  return 'var(--color-error)';
}

/** Returns the Tailwind text color class for the score number. */
function scoreTextClass(score: number): string {
  if (score >= 70) return 'text-primary';
  if (score >= 40) return 'text-tertiary';
  return 'text-error';
}

function badgeToI18nKey(badge: QualityBadge): keyof { good: string; moderate: string; high: string; low: string; inProgress: string; partialData: string } {
  switch (badge) {
    case 'good':         return 'good';
    case 'moderate':     return 'moderate';
    case 'high':         return 'high';
    case 'low':          return 'low';
    case 'in-progress':  return 'inProgress';
    case 'partial-data': return 'partialData';
  }
}

function formatMetricValue(
  key: QualityMetricKey,
  value: number,
  target: number,
  servingsLabel: string,
): string {
  switch (key) {
    case 'ultraProcessed':
      return `${Math.round(value)}%`;
    case 'fruitsVegetables':
      return `${value < 1 ? value.toFixed(1) : Math.round(value * 10) / 10} / ${target} ${servingsLabel}`;
    case 'salt':
      return `${value.toFixed(1)}g / ${target}g`;
    default:
      return `${Math.round(value)}g / ${target}g`;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FoodQualityCard({
  quality,
  onViewNutrition,
  anchorId = 'quality',
  className,
  defaultExpanded = false,
  bare = false,
}: FoodQualityCardProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const bodyId = useId();

  const hasPartial = METRIC_KEYS.some((key) => quality[key].partial);
  const scoreOffset = SCORE_CIRCUMFERENCE * (1 - quality.coverageScore / 100);
  const subtitle = t.home.quality.subtitle
    .replace('{count}', String(METRIC_KEYS.length))
    .replace('{pct}', String(quality.coverageScore));

  // Inner content — used both standalone and inside the merged Nutrition card.
  const content = (
    <div
      data-testid="food-quality-card"
        data-anchor={anchorId}
      >
        {/* ── Collapsed header ── */}
        <button
          type="button"
          className="w-full flex items-center gap-3 text-left"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-label={expanded ? t.home.quality.collapseAria : t.home.quality.expandAria}
          data-testid="food-quality-toggle"
        >
          {/* Score ring */}
          <div
            className="relative shrink-0"
            style={{ width: SCORE_RING_SIZE, height: SCORE_RING_SIZE }}
            aria-hidden="true"
          >
            <svg
              viewBox={`0 0 ${SCORE_RING_SIZE} ${SCORE_RING_SIZE}`}
              className="w-full h-full -rotate-90"
              aria-hidden="true"
            >
              {/* Track */}
              <circle
                cx={SCORE_RING_SIZE / 2}
                cy={SCORE_RING_SIZE / 2}
                r={SCORE_RING_RADIUS}
                fill="none"
                stroke="var(--color-surface-container-highest)"
                strokeWidth={SCORE_RING_STROKE}
              />
              {/* Progress */}
              <circle
                cx={SCORE_RING_SIZE / 2}
                cy={SCORE_RING_SIZE / 2}
                r={SCORE_RING_RADIUS}
                fill="none"
                stroke={scoreRingColor(quality.coverageScore)}
                strokeWidth={SCORE_RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={SCORE_CIRCUMFERENCE}
                strokeDashoffset={scoreOffset}
                className="transition-all duration-700"
                data-testid="quality-score-ring-fill"
              />
            </svg>
            {/* Score number (not rotated — sits over the SVG) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className={`font-headline font-bold text-micro tabular-nums transition-colors duration-500 ${scoreTextClass(quality.coverageScore)}`}
                data-testid="quality-score-value"
              >
                {quality.coverageScore}
              </span>
            </div>
          </div>

          {/* Title + subtitle — mixed case per PDF reference (overrides default h3 uppercase) */}
          <div className="flex-1 min-w-0">
            <Heading
              level="h3"
              className="normal-case tracking-normal text-on-surface"
            >
              {t.home.quality.title}
            </Heading>
            <p className="font-body text-micro text-on-surface-variant mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Expand / collapse affordance */}
          <ChevronDown
            className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 shrink-0 ${
              expanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {/* ── Expandable body ── */}
        <div
          id={bodyId}
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!expanded}
        >
          <div
            className="mt-4 space-y-2.5"
            data-testid="quality-metrics-grid"
          >
            {METRIC_KEYS.map((key) => {
              const metric = quality[key];
              const labelKey = {
                fiber: 'fiber',
                sugar: 'sugar',
                saturatedFat: 'saturated',
                salt: 'salt',
                ultraProcessed: 'ultraprocessed',
                fruitsVegetables: 'fruitsVeg',
              }[key] as keyof typeof t.home.quality.metrics;
              const badgeI18nKey = badgeToI18nKey(metric.badge);
              const valueLabel = formatMetricValue(
                key,
                metric.value,
                metric.target,
                t.home.quality.units.servings,
              );

              return (
                <QualityMetricRow
                  key={key}
                  metricKey={key}
                  label={t.home.quality.metrics[labelKey]}
                  valueLabel={valueLabel}
                  badge={metric.badge}
                  badgeLabel={t.home.quality.badges[badgeI18nKey]}
                  partial={metric.partial}
                />
              );
            })}
          </div>

          {/* Partial data note */}
          {hasPartial && (
            <p
              className="font-body text-micro text-on-surface-variant italic mt-3"
              data-testid="quality-partial-note"
            >
              {t.home.quality.partialNote}
            </p>
          )}

          {/* CTA */}
          {onViewNutrition && (
            <button
              type="button"
              onClick={onViewNutrition}
              className="w-full flex items-center justify-center gap-1 mt-4 pt-3 border-t border-outline-variant/20 font-body text-body-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
              data-testid="view-nutrition-cta"
            >
              {t.home.quality.viewAll}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
  );

  if (bare) {
    return content;
  }

  return (
    <SectionCard
      padding="md"
      spacing="md"
      className={`scroll-mt-24 ${className ?? ''}`.trim()}
    >
      {content}
    </SectionCard>
  );
}
