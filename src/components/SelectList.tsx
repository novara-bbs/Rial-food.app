/**
 * SelectList — PR 9 (playbook §4.11).
 *
 * Vertical card list where each card is a navigation/action trigger (no
 * selection state). Bevel IMG_0958 pattern: "¿Qué dispositivo ponible usas?"
 * — 6 options (Apple Watch / Garmin / Helio Strap / Salud Apple / Oura / No
 * tengo) as independent cards with chevron-right.
 *
 * Differs from `RadioCardGroup`:
 *   - `SelectList` emits a one-shot action (`onSelect`), no active state.
 *   - `RadioCardGroup` has a current selection (`value`/`onChange`).
 *
 * Anatomy:
 *   - card: full-width, `border` + `bg-surface-container-low`, hover
 *     `border-primary/50`.
 *   - optional leading icon (lucide component).
 *   - required label (bold headline style).
 *   - optional description line (muted, text-sm).
 *   - trailing `ChevronRight` on every card (consistent navigation
 *     affordance).
 *
 * Consumers in PR 9: none — exported as a stable primitive anticipated by
 * §4.11 for future step-types. Expected first consumers (Q6+):
 *   - HealthKit / Google Fit grant (source selection)
 *   - Wearable device selection (Apple Watch / Garmin / Fitbit / skip)
 *   - Permissions granting (camera / notifications / photos)
 *
 * Not to be confused with a menu or dropdown — cards have HIG-sized
 * (`min-h-14`) tap targets and full-width hit areas.
 */
import { ChevronRight } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

export interface SelectListItem<Id extends string = string> {
  id: Id;
  label: ReactNode;
  /** Optional description line under the label (muted, text-sm). */
  desc?: ReactNode;
  /** Lucide icon component (passed as `Icon`, not instantiated). */
  icon?: ElementType;
  /** Tailwind tint for the icon (e.g. `text-primary`). */
  iconClassName?: string;
}

interface SelectListProps<Id extends string> {
  /** Ordered items. Rendered in the given order. */
  items: ReadonlyArray<SelectListItem<Id>>;
  /** Called with the item id when the user taps a card. */
  onSelect: (id: Id) => void;
  /** Accessible label for the list (announced by screen readers). */
  ariaLabel?: string;
  /** Extra Tailwind classes merged with the outer `<ul>`. */
  className?: string;
}

export default function SelectList<Id extends string>({
  items,
  onSelect,
  ariaLabel,
  className = '',
}: SelectListProps<Id>) {
  return (
    <ul
      aria-label={ariaLabel}
      className={['space-y-2', className].filter(Boolean).join(' ')}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className="w-full min-h-14 flex items-center gap-4 p-4 rounded-sm border border-outline-variant/20 bg-surface-container-low hover:border-primary/50 hover:bg-surface-container transition-all text-left"
            >
              {Icon && (
                <Icon
                  className={[
                    'w-6 h-6 shrink-0',
                    item.iconClassName ?? 'text-on-surface-variant',
                  ].join(' ')}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-headline font-bold text-sm uppercase tracking-wider text-tertiary">
                  {item.label}
                </div>
                {item.desc && (
                  <div className="mt-1 text-xs text-on-surface-variant normal-case tracking-normal font-normal">
                    {item.desc}
                  </div>
                )}
              </div>
              <ChevronRight
                className="w-5 h-5 text-on-surface-variant shrink-0"
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
