import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';

interface Props {
  onSelectDay: (dayIndex: number) => void;
  onClose: () => void;
}

/**
 * Weekday picker for "Add to Plan". Seven buttons (one per weekday) + cancel.
 * Extracted from RecipeDetail so the sheet can be reused from other screens.
 */
export default function RecipeDaySelectorSheet({ onSelectDay, onClose }: Props) {
  const { t } = useI18n();
  const days = t.realFeel.dayAbbr as string[];

  return (
    <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
      <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase mb-3 text-center">
        {t.recipeDetail.selectDay}
      </p>
      <div className="flex justify-between gap-2 mb-4">
        {days.map((day, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => onSelectDay(idx)}
            className="w-10 h-10 rounded-sm bg-surface-container-highest text-tertiary font-headline font-bold hover:bg-primary hover:text-on-primary transition-colors"
          >
            {day}
          </button>
        ))}
      </div>
      <Button variant="ghost" className="w-full" onClick={onClose}>
        {t.common.cancel}
      </Button>
    </div>
  );
}
