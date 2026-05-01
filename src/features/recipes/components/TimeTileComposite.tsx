/**
 * TimeTileComposite — R2.2 (R2 plan v2).
 *
 * Three circular-arc tiles showing Prep / Cook / Rest times. Inspired by
 * Kitchen Stories' time breakdown pattern (IMG_1019). Each tile renders a
 * thin SVG stroke-dasharray ring around the time value; the arc length is
 * proportional to that step's share of total time, giving an at-a-glance
 * visual weight without requiring the user to compute the sum.
 *
 * When `restTime` is "0M" or absent the Rest tile is omitted, keeping the
 * layout clean for instant-cook recipes (wraps, smoothies, etc.).
 */
import type { ReactNode } from 'react';
import { useI18n } from '../../../i18n';

// ─── time parsing ────────────────────────────────────────────────────────────

/** Parse "10M", "1H", "1H30M", "0M", "" → minutes (number). */
function parseMinutes(raw: string | undefined): number {
  if (!raw) return 0;
  const h = raw.match(/(\d+)H/i);
  const m = raw.match(/(\d+)M/i);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

/** Format minutes back to a human label: "5 min", "1 h 30 min". */
function fmtMinutes(mins: number): string {
  if (mins <= 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// ─── SVG arc ring ─────────────────────────────────────────────────────────────

const R = 26;          // circle radius
const CX = 32;         // centre x
const CY = 32;         // centre y
const CIRC = 2 * Math.PI * R;  // full circumference ≈ 163.4

interface ArcRingProps {
  /** 0–1 fill fraction. */
  fraction: number;
  /** Tailwind/CSS colour for the progress arc. */
  color: string;
}

function ArcRing({ fraction, color }: ArcRingProps) {
  // Clamp so we always show at least a tiny sliver and never overshoot
  const pct = Math.min(Math.max(fraction, 0.04), 1);
  const dash = pct * CIRC;
  return (
    <svg
      width={64}
      height={64}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="absolute inset-0"
    >
      {/* Background track */}
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        className="text-outline-variant/20"
      />
      {/* Progress arc — starts at 12 o'clock via rotation */}
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${CIRC}`}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
    </svg>
  );
}

// ─── single tile ──────────────────────────────────────────────────────────────

interface TileProps {
  label: string;
  minutes: number;
  fraction: number;
  arcColor: string;
  icon?: ReactNode;
}

function Tile({ label, minutes, fraction, arcColor }: TileProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Arc ring + centred time */}
      <div className="relative w-16 h-16">
        <ArcRing fraction={fraction} color={arcColor} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-headline font-bold text-micro text-tertiary leading-none text-center px-0.5">
            {fmtMinutes(minutes)}
          </span>
        </div>
      </div>
      {/* Label */}
      <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant text-center">
        {label}
      </span>
    </div>
  );
}

// ─── public component ─────────────────────────────────────────────────────────

export interface TimeTileCompositeProps {
  prepTime: string;
  cookTime: string;
  /** When falsy or "0M" the Rest tile is omitted. */
  restTime?: string;
  className?: string;
}

export default function TimeTileComposite({
  prepTime,
  cookTime,
  restTime,
  className = '',
}: TimeTileCompositeProps) {
  const { t } = useI18n();

  const prep = parseMinutes(prepTime);
  const cook = parseMinutes(cookTime);
  const rest = parseMinutes(restTime);
  const total = prep + cook + rest || 1; // guard zero-division

  const showRest = rest > 0;

  // Arc colour tokens (CSS variables via Tailwind)
  const arcColors = {
    prep: 'var(--color-brand-secondary, #f59e0b)',
    cook: 'var(--color-primary, #22c55e)',
    rest: 'var(--color-tertiary, #6366f1)',
  };

  return (
    <div className={`flex items-start justify-around gap-2 ${className}`}>
      <Tile
        label={t.recipes.prepTime}
        minutes={prep}
        fraction={prep / total}
        arcColor={arcColors.prep}
      />
      <Tile
        label={t.recipes.cookTime}
        minutes={cook}
        fraction={cook / total}
        arcColor={arcColors.cook}
      />
      {showRest && (
        <Tile
          label={t.recipes.restTime ?? 'Reposo'}
          minutes={rest}
          fraction={rest / total}
          arcColor={arcColors.rest}
        />
      )}
    </div>
  );
}
