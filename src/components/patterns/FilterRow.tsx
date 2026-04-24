import React from 'react';
import ChipRow, { type ChipOption } from './ChipRow';

/**
 * @deprecated Use `ChipRow` directly (ADR-013). This file is a backward-compat
 * shim so we can migrate call-sites incrementally without a 7-file rename PR.
 * No new code should import `FilterRow`; the shim will be removed in a later
 * sprint once every call-site is migrated.
 */

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

/** @deprecated Use `ChipRow` instead. */
export default function FilterRow({
  options,
  active,
  onChange,
  variant = 'pill',
  className,
}: FilterRowProps) {
  // Legacy FilterRow always called onChange(id) on click — never with null —
  // so `all` source chips expected `setActiveCollection('all')` etc. to
  // toggle off. ChipRow's single-mode emits `null` when the active chip is
  // clicked again; we coalesce to empty string for compat.
  const chipOptions: ChipOption[] = options.map(o => ({
    id: o.id,
    label: o.label,
    icon: o.icon,
    count: o.count,
  }));
  return (
    <ChipRow
      mode="single"
      variant={variant}
      options={chipOptions}
      active={active}
      onChange={(next) => onChange((next ?? active) as string)}
      className={className}
    />
  );
}
