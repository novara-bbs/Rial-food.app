/**
 * OnboardingScaffold — PR 9 (playbook §4.11).
 *
 * Step-body wrapper that unifies the 6 onboarding steps under the same shape:
 *
 *   - optional centered `heroSlot` (Bevel IMG_0951/0952/0956 — 3D card / emoji /
 *     illustration; in RIAL: `PartyPopper` on step 6 "ready").
 *   - required `title` (H3, uppercase tracking-tight — consistent with the
 *     legacy step titles in `Onboarding.tsx`).
 *   - optional `subtitle` (muted caption).
 *   - `children` — the interactive zone (form, pills, cards, grid…). Any
 *     trailing hint text (italic adjustLater, centered palette hint, etc.)
 *     lives inside children with its native styling — the scaffold does NOT
 *     prescribe hint typography to keep the PR 9 migration zero-UX-change.
 *
 * Two visual variants:
 *   - `default` — left-aligned title, vertical flow (steps 1-5).
 *   - `centered` — centered title + hero on top (step 6 "ready").
 *
 * The outer modal chrome (progress bar + back-button + step counter + primary
 * CTA) stays in `Onboarding.tsx`. This primitive is a **per-step content
 * wrapper**, not a full-page scaffold — RIAL's onboarding has a single modal
 * shell with a persistent footer CTA, distinct from Bevel's per-page CTA
 * pattern.
 *
 * Future consumers: HealthKit grant, Apple Sign-In, camera/notification
 * permissions (Q6+). These will share the same shape with a different
 * `heroSlot` + `children`.
 */
import type { ReactNode } from 'react';

interface OnboardingScaffoldProps {
  /** Step heading — rendered as H3, uppercase, tracking-tight. */
  title: ReactNode;
  /** Muted caption under the title. */
  subtitle?: ReactNode;
  /** Hero visual rendered above the title (only in `centered` variant). */
  heroSlot?: ReactNode;
  /** Interactive content (form, cards, pills, grid). */
  children: ReactNode;
  /** Visual variant. `centered` stacks hero + title + children centered (step 6). */
  variant?: 'default' | 'centered';
  /** Extra Tailwind classes merged with the outer wrapper. */
  className?: string;
}

export default function OnboardingScaffold({
  title,
  subtitle,
  heroSlot,
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
      {heroSlot && <div className={isCentered ? 'shrink-0' : ''}>{heroSlot}</div>}
      <div className={isCentered ? 'space-y-2' : 'space-y-1'}>
        <h3
          className={[
            'font-headline font-bold uppercase tracking-tight',
            isCentered ? 'text-2xl text-primary' : 'text-lg text-tertiary',
          ].join(' ')}
        >
          {title}
        </h3>
        {subtitle && (
          <p className={isCentered ? 'text-on-surface-variant' : 'text-sm text-on-surface-variant'}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
