import { Pencil, Zap } from 'lucide-react';

interface DataSourceCaptionProps {
  /** `auto` = aggregated from existing data; `manual` = user-entered events. */
  kind: 'auto' | 'manual';
  /** One-line description of when/how the value updates. */
  label: string;
  className?: string;
}

/**
 * Tiny caption that explains whether a section's value updates automatically
 * (aggregated from other data) or manually (user events). Persistent micro-UI
 * — no tooltip, no modal. Educates the user about the mental model without
 * adding any interaction cost.
 *
 * Color conventions:
 *  - auto   → primary (green-ish in light, coral in dark via design token)
 *  - manual → secondary (amber/brand-secondary)
 */
export default function DataSourceCaption({ kind, label, className = '' }: DataSourceCaptionProps) {
  const Icon = kind === 'auto' ? Zap : Pencil;
  const color = kind === 'auto' ? 'text-primary' : 'text-brand-secondary';

  return (
    <p className={`flex items-center gap-1 text-micro font-label tracking-widest uppercase text-on-surface-variant ${className}`}>
      <Icon className={`w-3 h-3 ${color}`} aria-hidden="true" />
      <span className={`${color} font-bold`}>{kind === 'auto' ? 'Auto' : 'Manual'}</span>
      <span className="opacity-60">·</span>
      <span className="normal-case tracking-normal font-normal">{label}</span>
    </p>
  );
}
