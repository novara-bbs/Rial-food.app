/**
 * RadioCardGroup — PR 9 (playbook §4.11).
 *
 * Binary/ternary/N-ary exclusive selector rendered as a vertical stack of
 * cards. Semantic roles: outer `<div role="radiogroup">` + each card
 * `<button role="radio" aria-checked>` so screen readers announce it as an
 * actual radio group (not just a button list).
 *
 * Anatomy:
 *   - card: full-width left-aligned, `border` + `bg-surface-container-low`,
 *     active state `border-primary bg-primary/10` + `ring-1 ring-primary/40`
 *     (subtle, Bevel IMG_0962 pattern).
 *   - optional leading icon (lucide component), tinted per-option via
 *     `iconClassName` or `text-primary` when selected.
 *   - required label (bold headline style, tracking-wider).
 *   - optional description line (muted, text-sm).
 *   - trailing `Check` on the selected card.
 *
 * Differs from `SelectList`:
 *   - `RadioCardGroup` has **selection state** (one active at a time).
 *   - `SelectList` has **no selection state** — each card is a nav trigger.
 *
 * Bevel references: IMG_0962 (imperial/metric radio cards), IMG_0968 (goal
 * selector with icon + label + active border).
 *
 * Consumers in PR 9:
 *   - `Onboarding` step 1 (goal — 5 cards with icon + label)
 *   - `Onboarding` step 2 activity list (4 cards label-only)
 *
 * Future consumers: any selector with ≤ 5 options that benefits from
 * radio semantics (unit system, privacy tier, frequency picker).
 */
import { Check } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

export interface RadioCardOption<Id extends string = string> {
  id: Id;
  label: ReactNode;
  /** Lucide icon component (passed as `Icon`, not instantiated). */
  icon?: ElementType;
  /** Tailwind tint for the icon when unselected (e.g. `text-blue-400`). */
  iconClassName?: string;
  /** Optional description line under the label (muted, text-sm). */
  desc?: ReactNode;
}

interface RadioCardGroupProps<Id extends string> {
  /** Ordered options. Rendered in the given order. */
  options: ReadonlyArray<RadioCardOption<Id>>;
  /** Currently selected option id (or empty string when nothing is selected). */
  value: Id | '';
  /** Called with the new id when the user taps a card. */
  onChange: (id: Id) => void;
  /** Accessible label for the radiogroup (announced by screen readers). */
  ariaLabel?: string;
  /** Extra Tailwind classes merged with the outer `<div role="radiogroup">`. */
  className?: string;
}

export default function RadioCardGroup<Id extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: RadioCardGroupProps<Id>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={['space-y-2', className].filter(Boolean).join(' ')}
    >
      {options.map((option) => {
        const selected = value === option.id;
        const Icon = option.icon;
        return (
          <button
            type="button"
            key={option.id}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={[
              'w-full flex items-center gap-4 p-4 rounded-sm border transition-all text-left',
              selected
                ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/50',
            ].join(' ')}
            data-selected={selected}
          >
            {Icon && (
              <Icon
                className={[
                  'w-6 h-6 shrink-0',
                  selected ? 'text-primary' : option.iconClassName ?? 'text-on-surface-variant',
                ].join(' ')}
              />
            )}
            <div className="flex-1 min-w-0">
              <div
                className={[
                  'font-headline font-bold text-sm uppercase tracking-wider',
                  selected ? 'text-primary' : 'text-tertiary',
                ].join(' ')}
              >
                {option.label}
              </div>
              {option.desc && (
                <div className="mt-1 text-xs text-on-surface-variant normal-case tracking-normal font-normal">
                  {option.desc}
                </div>
              )}
            </div>
            {selected && <Check className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
