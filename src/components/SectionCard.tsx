/**
 * Canonical card container — Q13.
 *
 * Replaces the `bg-surface-container-low border border-outline-variant/20
 * rounded-sm p-5 space-y-3` hand-roll that appears 15+ times across
 * Progress.tsx, WeeklyReview.tsx and Home surfaces.
 */
import type { ReactNode } from 'react';

import { Heading } from '@/components/ui/Typography';

interface SectionCardProps {
  /** Primary headline (defaults to `font-headline bold uppercase tracking-widest`). */
  title?: ReactNode;
  /** Leading icon, rendered inside the title row. */
  icon?: ReactNode;
  /** Slot for a `<DataSourceCaption>` (or any node) under the title. */
  caption?: ReactNode;
  /** Slot aligned to the right side of the header (trend chip, CTA, toggle). */
  action?: ReactNode;
  /** Internal vertical padding. `none` omits padding for list containers or custom layouts. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Vertical spacing of children. `none` omits `space-y-*` for grids or divide-y layouts. */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Extra Tailwind classes merged with the base container classes. */
  className?: string;
  children: ReactNode;
}

const PAD: Record<NonNullable<SectionCardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

const SPACE: Record<NonNullable<SectionCardProps['spacing']>, string> = {
  none: '',
  sm: 'space-y-2',
  md: 'space-y-3',
  lg: 'space-y-4',
};

export default function SectionCard({
  title,
  icon,
  caption,
  action,
  padding = 'md',
  spacing = 'md',
  className = '',
  children,
}: SectionCardProps) {
  const hasHeader = !!(title || icon || caption || action);
  return (
    <section
      className={[
        // eslint-disable-next-line no-restricted-syntax -- this IS the SectionCard source definition; the rule is correct for all other files
        'bg-surface-container-low border border-outline-variant/20 rounded-sm shadow-elev-1',
        PAD[padding],
        SPACE[spacing],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            {title != null && (
              <Heading level="h3" variant="overline" className="flex items-center gap-2">
                {icon}
                {title}
              </Heading>
            )}
            {caption}
          </div>
          {action != null && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
