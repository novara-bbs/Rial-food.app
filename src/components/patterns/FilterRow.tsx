import React from 'react';
import { cn } from '../../lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface FilterRowProps {
  options: FilterOption[];
  active: string;
  onChange: (id: string) => void;
  /** icon = flex-col icon+label buttons, pill = rounded-full text chips */
  variant?: 'icon' | 'pill';
  className?: string;
}

/**
 * Horizontal scrollable filter row. Two variants:
 * - "icon": vertical icon + label buttons (meal-type selectors)
 * - "pill": rounded-full chips with optional count (collection filters)
 */
export default function FilterRow({
  options,
  active,
  onChange,
  variant = 'pill',
  className,
}: FilterRowProps) {
  if (variant === 'icon') {
    return (
      <div className={cn('flex gap-3 overflow-x-auto hide-scrollbar', className)}>
        {options.map(opt => {
          const Icon = opt.icon;
          const isActive = active === opt.id;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2 rounded-sm shrink-0 transition-colors',
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-highest',
              )}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span className="text-[9px] font-black tracking-widest uppercase">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // variant === 'pill'
  return (
    <div className={cn('flex gap-2 overflow-x-auto hide-scrollbar', className)}>
      {options.map(opt => {
        const Icon = opt.icon;
        const isActive = active === opt.id;
        return (
          <button
            type="button"
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all',
              isActive
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low border border-outline-variant/20 text-on-surface-variant hover:border-primary/50',
            )}
          >
            <span className="flex items-center gap-1.5">
              {Icon && <Icon className="w-3 h-3" />}
              {opt.label}
              {opt.count !== undefined && ` (${opt.count})`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
