import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import MealSlotSelector, { type MealSlot } from '../../food/components/MealSlotSelector';

interface Props {
  onSelectDay?: (dayIndex: number) => void;
  /** Preferred callback — surfaces both day and chosen meal slot. */
  onSelect?: (dayIndex: number, slot: MealSlot) => void;
  onClose: () => void;
  /** Pre-selected slot (from `recipe.mealType`). Defaults to 'lunch'. */
  defaultSlot?: MealSlot;
}

/**
 * Weekday picker + meal-slot selector for "Add to Plan". Lets the user override
 * the recipe's implicit mealType when scheduling. Falls back to the legacy
 * `onSelectDay(idx)` callback if the caller has not upgraded to `onSelect`.
 */
export default function RecipeDaySelectorSheet({
  onSelectDay,
  onSelect,
  onClose,
  defaultSlot,
}: Props) {
  const { t } = useI18n();
  const days = t.realFeel.dayAbbr as string[];
  const [slot, setSlot] = useState<MealSlot>(defaultSlot ?? 'lunch');

  const handleSelect = (idx: number) => {
    if (onSelect) {
      onSelect(idx, slot);
    } else {
      onSelectDay?.(idx);
    }
  };

  return (
    <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20 space-y-4">
      <div>
        <p className="font-label text-caption tracking-widest text-on-surface-variant uppercase mb-2">
          {t.recipeDetail.mealSlotLabel || 'Franja'}
        </p>
        <MealSlotSelector value={slot} onChange={setSlot} />
      </div>

      <div>
        <p className="font-label text-caption tracking-widest text-on-surface-variant uppercase mb-2 text-center">
          {t.recipeDetail.selectDay}
        </p>
        <div className="flex justify-between gap-2">
          {days.map((day, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleSelect(idx)}
              aria-label={`${day} — ${slot}`}
              className="min-w-11 min-h-11 flex-1 rounded-sm bg-surface-container-highest text-tertiary font-headline font-bold hover:bg-primary hover:text-on-primary transition-colors"
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <Button variant="ghost" className="w-full" onClick={onClose}>
        {t.common.cancel}
      </Button>
    </div>
  );
}
