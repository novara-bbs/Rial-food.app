/**
 * MacroRingsCard — Sprint C horizontal 3-ring grid (Carbos / Proteína /
 * Grasas). Fiber has been moved to `FoodQualityCard` since it's a quality
 * metric (encourage-direction) more than a structural macro. Replaces the
 * stacked `MacroProgressRow` rows in the NutritionHeroRing layout when
 * `homeGaugeV2` is on. Layout matches the editorial reference:
 *
 *   ┌── SectionCard "Macros del día" ──────────────────────────┐
 *   │                                                          │
 *   │      ◯99%        ◯90%        ◯36%                        │
 *   │      CARBOS      PROTEÍNA    GRASAS                      │
 *   │      de 178g     de 160g     de 65g                      │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Each ring is a small SVG circle stroke-dasharray, coloured per macro
 * (`bg-macro-{key}` tokens — already wired in `index.css`). The percent
 * sits inside the ring, the macro label below it, and the abs/target
 * caption right under that.
 */
import SectionCard from '../../../components/SectionCard';
import { useI18n } from '../../../i18n';

interface DailyMacrosLike {
  consumed: { pro: number; carbs: number; fats: number };
  target: { pro: number; carbs: number; fats: number };
}

export interface MacroRingsCardProps {
  dailyMacros: DailyMacrosLike;
  /** Ring outer size in px (default 64 → matches the reference). */
  ringSize?: number;
  /** Optional anchor attribute so `useChipScrollSpy` can target this card. */
  anchorId?: string;
  /**
   * When true, render only the rings grid (no SectionCard wrapper). Used by
   * Home.tsx to compose Macros + Quality inside a single shared SectionCard
   * (Sprint H+).
   */
  bare?: boolean;
  className?: string;
}

interface MacroRow {
  key: 'carbs' | 'protein' | 'fats';
  label: string;
  consumed: number;
  target: number;
  /** CSS variable name in `index.css`. Resolves to a per-theme hex. */
  colorVar: string;
}

const RING_STROKE = 6;

function buildPercent(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((consumed / target) * 100)));
}

export default function MacroRingsCard({
  dailyMacros,
  ringSize = 64,
  anchorId = 'macros',
  bare = false,
  className,
}: MacroRingsCardProps) {
  const { t } = useI18n();

  const rows: MacroRow[] = [
    {
      key: 'carbs',
      label: t.home.carbs,
      consumed: dailyMacros.consumed.carbs,
      target: dailyMacros.target.carbs,
      colorVar: '--color-macro-carbs',
    },
    {
      key: 'protein',
      label: t.home.protein,
      consumed: dailyMacros.consumed.pro,
      target: dailyMacros.target.pro,
      colorVar: '--color-macro-protein',
    },
    {
      key: 'fats',
      label: t.home.fats,
      consumed: dailyMacros.consumed.fats,
      target: dailyMacros.target.fats,
      colorVar: '--color-macro-fats',
    },
  ];

  // Inner grid — used both standalone and inside the merged Nutrition card.
  const grid = (
    <div
      className="grid grid-cols-3 gap-2"
      data-testid="macro-rings-card"
      data-anchor={anchorId}
    >
      {rows.map((row) => (
        <MacroRing
          key={row.key}
          row={row}
          size={ringSize}
          ofTargetTemplate={t.home.macroRings.ofTarget}
        />
      ))}
    </div>
  );

  if (bare) {
    return grid;
  }

  return (
    <SectionCard
      padding="md"
      spacing="md"
      className={`scroll-mt-24 ${className ?? ''}`.trim()}
    >
      {grid}
    </SectionCard>
  );
}

interface MacroRingProps {
  row: MacroRow;
  size: number;
  ofTargetTemplate: string;
}

function MacroRing({ row, size, ofTargetTemplate }: MacroRingProps) {
  const pct = buildPercent(row.consumed, row.target);
  const radius = (size - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);
  const ofTarget = ofTargetTemplate
    .replace('{target}', String(Math.round(row.target)))
    .replace('{unit}', 'g');

  return (
    <div
      className="flex flex-col items-center gap-1.5"
      data-testid={`macro-ring-${row.key}`}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${row.label}: ${row.consumed} / ${row.target}g (${pct}%)`}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-surface-container-highest)"
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`var(${row.colorVar})`}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
            data-testid={`macro-ring-${row.key}-fill`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Inner flex with items-baseline keeps the % aligned to the digit's baseline,
              while the outer items-center centers the whole group vertically. */}
          <div className="flex items-baseline">
            <span
              className="font-headline font-bold text-body-sm tabular-nums leading-none"
              style={{ color: pct > 0 ? `var(${row.colorVar})` : 'var(--color-on-surface-variant)' }}
            >
              {pct}
            </span>
            <span
              className="font-body text-micro font-semibold tabular-nums ml-px"
              style={{ color: pct > 0 ? `var(${row.colorVar})` : 'var(--color-on-surface-variant)' }}
              aria-hidden="true"
            >
              %
            </span>
          </div>
        </div>
      </div>
      <span className="font-label text-label font-bold uppercase tracking-widest text-on-surface text-center">
        {row.label}
      </span>
      <span className="font-body text-micro text-on-surface-variant text-center tabular-nums">
        {ofTarget}
      </span>
    </div>
  );
}
