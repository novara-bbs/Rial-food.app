import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * SortControl — canonical ordering primitive (ADR-013).
 *
 * Sort is a separate axis from filtering. Expressing it as an extra chip or
 * tab mixes semantics (filter = reduce set, sort = reorder set). This
 * component wraps a native `<select>` with brand chrome so keyboard/AT stay
 * accessible while every sort surface looks identical across screens.
 *
 * Visual: inline-flex button-like container with `ArrowUpDown` leading icon,
 * current option label, and trailing `ChevronDown`. The native select is
 * absolutely positioned on top with `opacity-0` so clicks open the OS picker.
 */

export interface SortOption {
  id: string;
  label: string;
}

export interface SortControlProps {
  options: SortOption[];
  active: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export default function SortControl({
  options,
  active,
  onChange,
  ariaLabel,
  className,
}: SortControlProps) {
  const current = options.find(o => o.id === active) ?? options[0];

  return (
    <div
      data-sort-control
      className={cn(
        'relative inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary/50 transition-colors',
        className,
      )}
    >
      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="text-nano font-medium normal-case tracking-normal truncate max-w-[140px]">
        {current?.label ?? ''}
      </span>
      <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden="true" />
      <select
        value={active}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
