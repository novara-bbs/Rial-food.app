/**
 * Canonical segmented tab selector — Q13.
 *
 * Extracted from Progress main tabs + Body view toggle. Also replaces
 * similar patterns elsewhere.
 */
import type { ReactNode } from 'react';

type Size = 'sm' | 'md';

interface SegmentedTabsOption<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedTabsProps<T extends string> {
  options: ReadonlyArray<SegmentedTabsOption<T>>;
  value: T;
  onChange: (v: T) => void;
  size?: Size;
  ariaLabel?: string;
  className?: string;
}

const SIZE: Record<Size, { outer: string; btn: string }> = {
  sm: { outer: 'p-0.5 gap-0.5', btn: 'px-3 py-1.5 text-micro' },
  md: { outer: 'p-1 gap-1', btn: 'flex-1 py-2 text-micro' },
};

export default function SegmentedTabs<T extends string>({
  options, value, onChange, size = 'md', ariaLabel, className = '',
}: SegmentedTabsProps<T>) {
  const sz = SIZE[size];
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex bg-surface-container rounded-sm ${sz.outer} ${className}`.trim()}
    >
      {options.map(opt => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`${sz.btn} flex items-center justify-center gap-1.5 font-bold uppercase tracking-widest rounded-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              active
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-tertiary'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
