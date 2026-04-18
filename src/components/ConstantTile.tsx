/**
 * ConstantTile — biometric/constant tile primitive (PR 7, ADR-009 V2 addendum).
 *
 * Uniform visual container for "constants" — biometric metrics that may
 * or may not have data. Distinct from `StatTile`: StatTile assumes you
 * already have a value to display; ConstantTile is built around the 6
 * canonical states a biometric can be in (loading / two empty flavours /
 * three value flavours with or without trend). Consumer reference:
 * Bevel IMG_0976 / 0993 / 0994 — see `docs/market/bevel-design-playbook.md` §4.10.
 */
import type { ComponentType, SVGProps } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type ConstantTileState =
  | 'loading'
  | 'empty-no-template'
  | 'empty-no-data'
  | 'value-stable'
  | 'value-trending-up'
  | 'value-trending-down';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

export interface ConstantTileCopy {
  /** Hero copy for empty-no-template + empty-no-data. Default: "No hay datos". */
  noData?: string;
  /** Sub copy for empty-no-template. Default: "Sin rango". */
  noRange?: string;
  /** Sub copy for empty-no-data. Default: "Sin tendencias". */
  noTrends?: string;
  /** Sub copy for value-stable. Default: "Estable". */
  stable?: string;
}

interface ConstantTileProps {
  icon: IconComponent;
  label: string;
  state: ConstantTileState;
  /** Hero value for `value-*` states. Numbers render as-is; format upstream. */
  value?: string | number;
  /** Unit string shown beneath value (kg, cm, %). */
  unit?: string;
  /** Trend copy shown next to the trend icon (e.g. "+0.3 kg"). */
  trendValue?: string;
  copy?: ConstantTileCopy;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

const DEFAULT_COPY: Required<ConstantTileCopy> = {
  noData: 'No hay datos',
  noRange: 'Sin rango',
  noTrends: 'Sin tendencias',
  stable: 'Estable',
};

function TrendIcon({ state }: { state: ConstantTileState }) {
  if (state === 'value-trending-up') return <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />;
  if (state === 'value-trending-down') return <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />;
  return <Minus className="w-3.5 h-3.5" aria-hidden="true" />;
}

const TREND_COLOR: Record<'value-stable' | 'value-trending-up' | 'value-trending-down', string> = {
  'value-stable': 'text-on-surface-variant',
  'value-trending-up': 'text-brand-secondary',
  'value-trending-down': 'text-primary',
};

export default function ConstantTile({
  icon: Icon,
  label,
  state,
  value,
  unit,
  trendValue,
  copy,
  onClick,
  ariaLabel,
  className = '',
}: ConstantTileProps) {
  const resolvedCopy = { ...DEFAULT_COPY, ...copy };
  const interactive = !!onClick;

  const base = `bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 aspect-[1.2/1] flex flex-col justify-between text-left ${
    interactive
      ? 'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors'
      : ''
  } ${className}`.trim();

  const topRow = (
    <div className="flex items-center gap-1.5 text-on-surface-variant">
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="font-label text-micro uppercase tracking-widest truncate">{label}</span>
    </div>
  );

  const body = (() => {
    if (state === 'loading') {
      return (
        <div className="space-y-1.5" aria-hidden="true">
          <div className="h-5 w-20 rounded-sm bg-surface-container-high animate-pulse" />
          <div className="h-3 w-12 rounded-sm bg-surface-container-high animate-pulse" />
        </div>
      );
    }

    if (state === 'empty-no-template' || state === 'empty-no-data') {
      const sub = state === 'empty-no-template' ? resolvedCopy.noRange : resolvedCopy.noTrends;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-headline font-bold text-body-sm text-on-surface-variant">
            {resolvedCopy.noData}
          </span>
          <span className="text-micro uppercase tracking-widest text-on-surface-variant/70">
            {sub}
          </span>
        </div>
      );
    }

    // value-* states
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1">
          <span className="font-headline font-black text-title-sm text-tertiary">{value ?? '—'}</span>
          {unit && <span className="text-caption text-on-surface-variant">{unit}</span>}
        </div>
        <span className={`inline-flex items-center gap-1 text-micro font-bold uppercase tracking-widest ${TREND_COLOR[state]}`}>
          <TrendIcon state={state} />
          {state === 'value-stable' ? resolvedCopy.stable : trendValue ?? ''}
        </span>
      </div>
    );
  })();

  const defaultAria = ariaLabel ?? (
    state === 'loading' ? label :
    state === 'empty-no-template' || state === 'empty-no-data' ? `${label}: ${resolvedCopy.noData}` :
    `${label}: ${value ?? ''} ${unit ?? ''}`.trim()
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={defaultAria}
        data-state={state}
        className={base}
      >
        {topRow}
        {body}
      </button>
    );
  }

  return (
    <div className={base} aria-label={defaultAria} data-state={state}>
      {topRow}
      {body}
    </div>
  );
}
