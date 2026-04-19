import { Sun, UtensilsCrossed, Moon, Apple } from 'lucide-react';
import { useI18n } from '../../../i18n';
import type { MealSlot } from '../../../types';

export type { MealSlot };

interface SlotDef {
  id: MealSlot;
  icon: React.ReactNode;
  label: (t: ReturnType<typeof useI18n>['t']) => string;
}

const SLOTS: SlotDef[] = [
  { id: 'breakfast', icon: <Sun className="w-4 h-4" />,          label: t => t.home.breakfast },
  { id: 'lunch',     icon: <UtensilsCrossed className="w-4 h-4" />, label: t => t.home.lunch },
  { id: 'dinner',    icon: <Moon className="w-4 h-4" />,         label: t => t.home.dinner },
  { id: 'snack',     icon: <Apple className="w-4 h-4" />,        label: t => t.home.snack },
];

interface Props {
  value: MealSlot;
  onChange: (slot: MealSlot) => void;
  ariaLabel?: string;
}

/**
 * Exclusive 1-of-4 meal-slot selector. Uses WAI-ARIA `radiogroup` + `radio`
 * semantics so assistive tech announces the group and current selection.
 * Wave 1 hardening, mirrors PortionSelector mode toggle (Wave 0) and
 * RadioCardGroup (PR 9).
 */
export default function MealSlotSelector({ value, onChange, ariaLabel }: Props) {
  const { t } = useI18n();

  return (
    <div role="radiogroup" aria-label={ariaLabel ?? t.mealSlot.selectorLabel} className="flex gap-2">
      {SLOTS.map(slot => {
        const isOn = value === slot.id;
        return (
          <button type="button"
            key={slot.id}
            role="radio"
            aria-checked={isOn}
            onClick={() => onChange(slot.id)}
            className={`flex-1 min-h-11 flex flex-col items-center justify-center gap-1 py-2 rounded-sm border transition-colors font-headline text-micro font-bold uppercase tracking-widest ${
              isOn
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary/40 hover:text-tertiary'
            }`}
          >
            {slot.icon}
            {slot.label(t)}
          </button>
        );
      })}
    </div>
  );
}
