/**
 * TogglePillGroup — multi-select chip group.
 *
 * Replaces the raw `<button>` pill grids that previously lived in the diet
 * step. Pills carry `aria-pressed` for screen-reader semantics and snap to
 * the design tokens so we never reach for hex, the `dark` prefix, or inline styles.
 *
 * Layout: wrap-flow (no horizontal scroll). Each pill is at least 44px tall
 * (ADR-003). Selected state inherits `--primary` via tokens.
 */
import { Check } from 'lucide-react';

interface PillOption {
  id: string;
  label: string;
}

interface TogglePillGroupProps {
  options: ReadonlyArray<PillOption>;
  selected: ReadonlyArray<string>;
  onToggle: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export default function TogglePillGroup({
  options,
  selected,
  onToggle,
  ariaLabel,
  className = '',
}: TogglePillGroupProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={['flex flex-wrap gap-2', className].filter(Boolean).join(' ')}
    >
      {options.map(option => {
        const isOn = selected.includes(option.id);
        return (
          <button
            type="button"
            key={option.id}
            onClick={() => onToggle(option.id)}
            aria-pressed={isOn}
            data-selected={isOn}
            className={[
              'inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full border text-body-sm font-medium transition-colors',
              'active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isOn
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline-variant/30 bg-surface-container-low text-on-surface hover:border-primary/40',
            ].join(' ')}
          >
            {isOn && <Check className="size-3.5" aria-hidden="true" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
