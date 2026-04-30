/**
 * OnboardingScaffold — step-body wrapper.
 *
 * Provides the consistent shape for every step body:
 *
 *   - optional centered `heroSlot` (illustration / emoji / 3D card).
 *   - required `title` (rendered as `<Heading level="h2">` by default).
 *   - optional `subtitle` (muted body text).
 *   - `children` — the interactive zone (form, pills, cards, grid…).
 *
 * Two variants:
 *   - `default` — left-aligned title + content (most steps).
 *   - `centered` — centered hero on top, centered title + subtitle + content
 *     (welcome / done / plan reveal).
 *
 * The outer modal chrome (progress bar, header, footer CTA) lives in
 * `Onboarding.tsx`. This is a per-step content wrapper.
 */
import type { ReactNode } from 'react';

import { Heading, Text } from '@/components/ui/Typography';

interface OnboardingScaffoldProps {
  /** Step heading. Rendered as `<Heading level="h2">` for a11y hierarchy. */
  title: ReactNode;
  /** Muted caption under the title. */
  subtitle?: ReactNode;
  /** Hero visual rendered above the title (only in `centered` variant). */
  heroSlot?: ReactNode;
  /** id assigned to the heading so the section can be `aria-labelledby`. */
  titleId?: string;
  /** Interactive content (form, cards, pills, grid). */
  children: ReactNode;
  /** Visual variant. `centered` stacks hero + title + children centered. */
  variant?: 'default' | 'centered';
  /** Extra Tailwind classes merged with the outer wrapper. */
  className?: string;
}

export default function OnboardingScaffold({
  title,
  subtitle,
  heroSlot,
  titleId,
  children,
  variant = 'default',
  className = '',
}: OnboardingScaffoldProps) {
  const isCentered = variant === 'centered';

  return (
    <div
      className={[
        'flex flex-col',
        isCentered ? 'items-center text-center gap-6 py-6' : 'gap-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-variant={variant}
    >
      {heroSlot && (
        <div className={isCentered ? 'shrink-0' : ''} aria-hidden="true">
          {heroSlot}
        </div>
      )}
      <div className={isCentered ? 'space-y-2' : 'space-y-1'}>
        <Heading
          level="h2"
          variant={isCentered ? 'editorial' : 'default'}
          id={titleId}
          tabIndex={-1}
          className={isCentered ? 'text-primary' : ''}
        >
          {title}
        </Heading>
        {subtitle && (
          <Text variant={isCentered ? 'body' : 'body-sm'}>{subtitle}</Text>
        )}
      </div>
      {children}
    </div>
  );
}
