import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '../../i18n';

/**
 * FilterButton — canonical trigger for `<FilterSheet>` (ADR-014).
 *
 * Compact button matching `SearchInput` height for flex-row alignment with
 * search + sort. Renders a numeric badge in the top-right corner when
 * `activeCount > 0` so the user can see at-a-glance whether filters are on
 * even when the sheet is closed.
 *
 * Visual: rounded square (~44px) with `SlidersHorizontal` icon. Active-state
 * tint when `activeCount > 0` (border + icon turn primary).
 */

export interface FilterButtonProps {
  onClick: () => void;
  activeCount?: number;
  /** Visible label (optional — when omitted shows icon only). Defaults to none. */
  label?: string;
  /** Accessible label, falls back to `t.filters.title`. */
  ariaLabel?: string;
  className?: string;
}

export default function FilterButton({
  onClick,
  activeCount = 0,
  label,
  ariaLabel,
  className,
}: FilterButtonProps) {
  const { t } = useI18n();
  const resolvedAria = ariaLabel ?? t.filters.title;
  const hasActive = activeCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={resolvedAria}
      data-filter-button
      data-active={hasActive ? 'true' : 'false'}
      className={cn(
        'relative shrink-0 inline-flex items-center gap-2 px-3 min-h-11 rounded-sm border transition-colors',
        hasActive
          ? 'bg-primary/10 border-primary/40 text-primary'
          : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:border-primary/50',
        className,
      )}
    >
      <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
      {label && (
        <span className="text-pico font-medium normal-case tracking-normal">
          {label}
        </span>
      )}
      {hasActive && (
        <span
          className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-primary text-on-primary font-headline text-micro font-bold"
          aria-hidden="true"
        >
          {activeCount}
        </span>
      )}
    </button>
  );
}
