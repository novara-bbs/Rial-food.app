import { Sun, UtensilsCrossed, Moon, Apple } from 'lucide-react';
import { useI18n } from '../../../i18n';
import type { MealSlot } from '../../../types';

/**
 * Multi-select twin of `MealSlotSelector`. Used when tagging a recipe with the
 * meal slots it fits ("suitable for"). Empty selection is valid and means
 * "versatile" — the recipe shows in every slot filter. See ADR / Q19
 * meal-taxonomy migration for the product rationale.
 */
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
  value: MealSlot[];
  onChange: (slots: MealSlot[]) => void;
  ariaLabel?: string;
}

export default function MealSlotMultiSelect({ value, onChange, ariaLabel }: Props) {
  const { t } = useI18n();

  const toggle = (slot: MealSlot) => {
    onChange(
      value.includes(slot)
        ? value.filter(s => s !== slot)
        : [...value, slot],
    );
  };

  return (
    <div role="group" aria-label={ariaLabel ?? t.createRecipe.suitableForLabel} className="flex gap-2">
      {SLOTS.map(slot => {
        const isOn = value.includes(slot.id);
        return (
          <button type="button"
            key={slot.id}
            onClick={() => toggle(slot.id)}
            aria-pressed={isOn}
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
