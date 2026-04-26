import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useI18n } from '../../i18n';

/**
 * ActiveFilterStrip — canonical "applied filters" feedback row (ADR-014).
 *
 * Shows the filters currently in effect as dismissible chips with an optional
 * Reset link at the end. Lives between the search row and the result list,
 * mirroring the Uber Eats / Glovo / Just Eat pattern.
 *
 * Distinct from ChipRow:
 *   - ChipRow shows ALL options for a single facet (toggle-on/toggle-off).
 *   - ActiveFilterStrip shows the user's CURRENT selections across multiple
 *     facets (always-on, click-to-remove). Tinted styling differentiates it
 *     visually from solid-active ChipRow chips.
 *
 * Eliminates the inline pill anti-pattern (each screen reimplementing its
 * own dismiss chip from scratch). One primitive, canonical typography +
 * spacing aligned with ChipRow pill (`px-4 py-2 rounded-full text-micro`).
 */

export interface ActiveFilterChip {
  /** Stable unique id for the chip — typically `${facet}:${value}` (e.g. "diet:vegan"). */
  key: string;
  /** i18n-resolved display label. */
  label: string;
  /** Optional facet-type emoji rendered to the LEFT of the label. */
  emoji?: string;
}

export interface ActiveFilterStripProps {
  chips: ActiveFilterChip[];
  onDismiss: (key: string) => void;
  /** When provided, renders a "Reset" link at the end that clears all filters at once. */
  onReset?: () => void;
  /** Override the Reset link label (defaults to `t.filters.reset`). */
  resetLabel?: string;
  /** Override the per-chip aria-label builder (defaults to `t.filters.removeAriaLabel`). */
  removeAriaLabel?: (label: string) => string;
  className?: string;
}

export default function ActiveFilterStrip({
  chips,
  onDismiss,
  onReset,
  resetLabel,
  removeAriaLabel,
  className,
}: ActiveFilterStripProps) {
  const { t } = useI18n();

  // Render nothing when no filters are active — the caller need not gate on
  // chips.length and the strip simply disappears from the layout.
  if (chips.length === 0) return null;

  const resolvedReset = resetLabel ?? t.filters.reset;
  const buildAria =
    removeAriaLabel ??
    ((label: string) =>
      ((t.filters as Record<string, unknown>).removeAriaLabel as string | undefined ?? 'Quitar filtro {label}').replace(
        '{label}',
        label,
      ));

  return (
    <div
      data-active-filter-strip
      className={cn('flex items-center gap-2 flex-wrap', className)}
    >
      {chips.map(chip => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onDismiss(chip.key)}
          aria-label={buildAria(chip.label)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-micro font-headline font-semibold normal-case tracking-normal transition-colors hover:bg-primary/20"
        >
          {chip.emoji && <span aria-hidden="true">{chip.emoji}</span>}
          {chip.label}
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      ))}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="text-micro font-headline font-medium normal-case tracking-normal text-on-surface-variant hover:text-primary transition-colors px-2 py-1.5 underline-offset-2 hover:underline"
        >
          {resolvedReset}
        </button>
      )}
    </div>
  );
}
