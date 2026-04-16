/**
 * Canonical metric tile — Q13.
 *
 * Replaces hand-rolled stat tiles in Progress dashboard, WeeklyMiniDash,
 * WeeklyReview macro grid and Profile body-data.
 *
 * When `onClick` is provided the tile is rendered as a `<button>` with
 * proper focus affordance — replacing the old `<div onClick>` anti-pattern.
 */
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type ValueColor = 'primary' | 'secondary' | 'tertiary' | 'on-surface-variant' | 'error';
type Trend = 'up' | 'down' | 'flat';
type Variant = 'plain' | 'raised';
type Size = 'sm' | 'md';

interface StatTileProps {
  /** Short caption above the big value. */
  label: string;
  /** The hero number or text. Numbers are rendered as-is; format upstream. */
  value: ReactNode;
  /** Colour variant for the value. Defaults to `tertiary`. */
  valueColor?: ValueColor;
  /** Leading icon, rendered next to the value. */
  icon?: ReactNode;
  /** Optional trend indicator; renders a small arrow. */
  trend?: Trend;
  /** Extra trend copy (`"+5%"`, `"+0.3 kg"`). */
  trendValue?: string;
  /** Sub-line under the value (`"esta semana"`). */
  subtle?: string;
  /** When present, renders as a `<button>` with hover/focus styles. */
  onClick?: () => void;
  /** Accessible label when the default "label value" is insufficient. */
  ariaLabel?: string;
  /** Visual style: `plain` uses the card background, `raised` pops with surface-container. */
  variant?: Variant;
  /** Tile size. */
  size?: Size;
  className?: string;
}

const VALUE_COLOR: Record<ValueColor, string> = {
  primary: 'text-primary',
  secondary: 'text-brand-secondary',
  tertiary: 'text-tertiary',
  'on-surface-variant': 'text-on-surface-variant',
  error: 'text-error',
};

const TREND_COLOR: Record<Trend, string> = {
  up: 'text-brand-secondary',
  down: 'text-error',
  flat: 'text-on-surface-variant',
};

const VARIANT: Record<Variant, string> = {
  plain: 'bg-surface-container-low border border-outline-variant/20',
  raised: 'bg-surface-container',
};

const SIZE: Record<Size, { wrap: string; label: string; value: string; subtle: string }> = {
  sm: { wrap: 'p-3', label: 'text-micro', value: 'text-lg', subtle: 'text-micro' },
  md: { wrap: 'p-4', label: 'text-micro', value: 'text-xl', subtle: 'text-micro' },
};

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />;
  return <Minus className="w-3.5 h-3.5" aria-hidden="true" />;
}

export default function StatTile({
  label,
  value,
  valueColor = 'tertiary',
  icon,
  trend,
  trendValue,
  subtle,
  onClick,
  ariaLabel,
  variant = 'plain',
  size = 'sm',
  className = '',
}: StatTileProps) {
  const sz = SIZE[size];
  const interactive = !!onClick;

  const base = `${VARIANT[variant]} rounded-sm ${sz.wrap} flex flex-col gap-1 text-left ${interactive ? 'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors' : ''} ${className}`.trim();

  const inner = (
    <>
      <span className={`font-label ${sz.label} uppercase tracking-widest text-on-surface-variant`}>{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={`font-headline font-black ${sz.value} ${VALUE_COLOR[valueColor]}`}>{value}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 text-micro font-bold ${TREND_COLOR[trend]}`}>
            <TrendIcon trend={trend} />
            {trendValue}
          </span>
        )}
      </div>
      {subtle && <span className={`${sz.subtle} text-on-surface-variant`}>{subtle}</span>}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? `${label}: ${typeof value === 'string' || typeof value === 'number' ? value : ''}`}
        className={base}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className={base} aria-label={ariaLabel}>
      {inner}
    </div>
  );
}
