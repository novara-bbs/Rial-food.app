import { Sun, UtensilsCrossed, Moon, Apple } from 'lucide-react';
import { useI18n } from '../../../i18n';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
}

export default function MealSlotSelector({ value, onChange }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex gap-2">
      {SLOTS.map(slot => (
        <button
          key={slot.id}
          type="button"
          onClick={() => onChange(slot.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-sm border transition-colors font-headline text-[9px] font-bold uppercase tracking-widest ${
            value === slot.id
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary/40 hover:text-tertiary'
          }`}
        >
          {slot.icon}
          {slot.label(t)}
        </button>
      ))}
    </div>
  );
}
