import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * ChipRow — canonical filter chip primitive (ADR-013).
 *
 * One axis = one primitive:
 *   - source / view / type            → TabNav
 *   - 1-of-N optional facet           → ChipRow mode="single"
 *   - 0-to-N multi-select facets      → ChipRow mode="multi"
 *   - ordering                        → SortControl
 *
 * Variants (visual layout):
 *   - "pill"  horizontal rounded chips with optional count suffix
 *   - "icon"  vertical icon-on-top + label-below tiles (meal-type selectors)
 *   - "emoji" horizontal chips with emoji prefix (e.g. category selectors)
 *
 * Tones:
 *   - "default" primary brand highlight on active
 *   - "danger"  error-tinted highlight + leading × icon on active (excluded-state
 *     semantics — FoodDictionary allergens). Only makes sense in mode="multi".
 *
 * Replaces FilterRow (shim kept for backward compatibility; do not add new
 * imports of FilterRow — use ChipRow directly).
 */

export type ChipRowMode = 'single' | 'multi';
export type ChipRowVariant = 'pill' | 'icon' | 'emoji';
export type ChipRowTone = 'default' | 'danger';

export interface ChipOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  emoji?: string;
  count?: number;
}

// Discriminated-union props so single/multi typecheck independently.
type ChipRowSingleProps = {
  mode?: 'single';
  active: string | null;
  onChange: (next: string | null) => void;
};

type ChipRowMultiProps = {
  mode: 'multi';
  active: string[];
  onChange: (next: string[]) => void;
};

type ChipRowBaseProps = {
  options: ChipOption[];
  variant?: ChipRowVariant;
  tone?: ChipRowTone;
  ariaLabel?: string;
  className?: string;
};

export type ChipRowProps = ChipRowBaseProps & (ChipRowSingleProps | ChipRowMultiProps);

function isActive(props: ChipRowProps, id: string): boolean {
  if (props.mode === 'multi') return props.active.includes(id);
  return props.active === id;
}

function handleToggle(props: ChipRowProps, id: string): void {
  if (props.mode === 'multi') {
    const next = props.active.includes(id)
      ? props.active.filter(x => x !== id)
      : [...props.active, id];
    props.onChange(next);
    return;
  }
  props.onChange(props.active === id ? null : id);
}

export default function ChipRow(props: ChipRowProps) {
  const {
    options,
    variant = 'pill',
    tone = 'default',
    ariaLabel,
    className,
  } = props;

  const role = props.mode === 'multi' ? 'group' : 'radiogroup';

  if (variant === 'icon') {
    return (
      <div
        role={role}
        aria-label={ariaLabel}
        data-chip-row
        data-variant="icon"
        data-mode={props.mode ?? 'single'}
        data-tone={tone}
        className={cn('flex gap-3 overflow-x-auto hide-scrollbar', className)}
      >
        {options.map(opt => {
          const Icon = opt.icon;
          const active = isActive(props, opt.id);
          return (
            <button
              type="button"
              key={opt.id}
              role={props.mode === 'multi' ? undefined : 'radio'}
              aria-checked={props.mode === 'multi' ? undefined : active}
              aria-pressed={props.mode === 'multi' ? active : undefined}
              onClick={() => handleToggle(props, opt.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2 rounded-sm shrink-0 transition-colors',
                active
                  ? tone === 'danger'
                    ? 'bg-error/15 text-error border border-error/30'
                    : 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-highest',
              )}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span className="text-micro font-black tracking-widest uppercase">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // "pill" + "emoji" share the horizontal rounded-full chip layout; emoji adds a
  // leading glyph in place of a Lucide icon.
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      data-chip-row
      data-variant={variant}
      data-mode={props.mode ?? 'single'}
      data-tone={tone}
      className={cn('flex gap-2 overflow-x-auto hide-scrollbar', className)}
    >
      {options.map(opt => {
        const Icon = opt.icon;
        const active = isActive(props, opt.id);
        const showDangerX = active && tone === 'danger';
        return (
          <button
            type="button"
            key={opt.id}
            role={props.mode === 'multi' ? undefined : 'radio'}
            aria-checked={props.mode === 'multi' ? undefined : active}
            aria-pressed={props.mode === 'multi' ? active : undefined}
            onClick={() => handleToggle(props, opt.id)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-micro font-label font-bold uppercase tracking-widest transition-all',
              active
                ? tone === 'danger'
                  ? 'bg-error/15 text-error border border-error/30'
                  : 'bg-primary text-on-primary'
                : 'bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary/50',
            )}
          >
            <span className="flex items-center gap-1.5">
              {showDangerX && <X className="w-3 h-3" aria-hidden="true" />}
              {variant === 'emoji' && opt.emoji && <span aria-hidden="true">{opt.emoji}</span>}
              {Icon && <Icon className="w-3 h-3" />}
              {opt.label}
              {opt.count !== undefined && (
                <span className="opacity-70">({opt.count})</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
