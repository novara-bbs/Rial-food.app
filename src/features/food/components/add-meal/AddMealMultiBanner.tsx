import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../../i18n';

interface MultiTotals {
  cal: number;
  pro: number;
  carbs: number;
  fats: number;
}

interface AddMealMultiBannerProps {
  count: number;
  totals: MultiTotals;
  onClear: () => void;
  onLogAll: () => void;
}

/**
 * Fixed floating banner shown during multi-add mode while items are queued.
 * Announced as a live region so screen-readers narrate additions without
 * interrupting the user (role="status" aria-live="polite").
 */
export default function AddMealMultiBanner({
  count, totals, onClear, onLogAll,
}: AddMealMultiBannerProps) {
  const { t } = useI18n();

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4 md:bottom-20"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 7rem)' }}
    >
      <div
        role="status"
        aria-live="polite"
        className="max-w-lg mx-auto bg-surface-container-highest border border-primary/30 rounded-sm p-3 shadow-elev-3 flex items-center gap-3"
      >
        <div className="flex-1 min-w-0">
          <span className="font-headline text-micro uppercase tracking-widest text-tertiary block">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
          <span className="text-micro font-label tracking-widest text-on-surface-variant uppercase">
            {totals.cal} {t.common.kcal} · {totals.pro.toFixed(0)}g P · {totals.carbs.toFixed(0)}g C · {totals.fats.toFixed(0)}g F
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          aria-label={t.common.delete}
          className="text-on-surface-variant hover:text-error transition-colors p-1.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <Button
          variant="default"
          onClick={onLogAll}
          className="font-headline text-micro uppercase tracking-widest"
        >
          {t.addMealScreen?.logAll?.replace('{count}', String(count)) ?? `Registrar (${count})`}
        </Button>
      </div>
    </div>
  );
}
