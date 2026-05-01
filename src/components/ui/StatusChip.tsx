/**
 * StatusChip — primitive for one-shot status indicators (non-filter).
 *
 * Distinct purpose:
 *   - `ChipRow` (`src/components/patterns/ChipRow.tsx`) — single/multi filter rows (ADR-013).
 *   - `Badge` (`src/components/ui/badge.tsx`) — static label (no interaction, no border tint).
 *   - `StatusChip` (this file) — small status pill with token-tinted background, optional
 *     leading icon and trailing slot, optionally clickable (renders `<button>` vs `<span>`).
 *
 * Used by the Today header (Streak, RealScore, DayStatus) and the advanced quick-stats row
 * (Hydration, Weight, Activity, Insights). Replaces 4 ad-hoc inline implementations.
 *
 * Tokens are tone-mapped — never hardcode hex. Shape stays constant across tones for
 * vertical/horizontal rhythm consistency.
 */
import type { ReactNode, MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusChipTone =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger';

const TONE_MAP: Record<StatusChipTone, string> = {
  primary:
    'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 hover:border-primary/40',
  secondary:
    'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20 hover:bg-brand-secondary/15 hover:border-brand-secondary/40',
  neutral:
    'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container hover:border-outline',
  success:
    'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 hover:border-primary/40',
  warning:
    'bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20',
  danger:
    'bg-error/10 text-error border-error/20',
};

const SHAPE =
  'inline-flex items-center gap-1 min-h-[22px] px-2 rounded-full border shadow-elev-1 ' +
  'text-nano font-medium leading-none normal-case tracking-normal whitespace-nowrap ' +
  'snap-start transition-colors';

export interface StatusChipProps {
  tone?: StatusChipTone;
  icon?: LucideIcon;
  trailing?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  className?: string;
  testId?: string;
  children: ReactNode;
}

export default function StatusChip({
  tone = 'neutral',
  icon: Icon,
  trailing,
  onClick,
  ariaLabel,
  className,
  testId,
  children,
}: StatusChipProps) {
  const classes = cn(SHAPE, TONE_MAP[tone], className);
  const content = (
    <>
      {Icon && <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />}
      <span className="truncate">{children}</span>
      {trailing}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classes}
        aria-label={ariaLabel}
        data-testid={testId}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={classes}
      role={ariaLabel ? 'status' : undefined}
      aria-label={ariaLabel}
      aria-live={ariaLabel ? 'polite' : undefined}
      data-testid={testId}
    >
      {content}
    </span>
  );
}
