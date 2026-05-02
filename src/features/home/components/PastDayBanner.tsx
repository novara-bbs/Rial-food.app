/**
 * PastDayBanner — Phase 3 / Sprint B4.
 *
 * Read-only banner shown above the Home content when the user is browsing a
 * past day (selectedDate !== today). Includes a "Back to today" reset action.
 */
import { useI18n } from '../../../i18n';

export default function PastDayBanner({ onResetToToday }: { onResetToToday: () => void }) {
  const { t } = useI18n();
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-sm bg-tertiary/10 border border-tertiary/20"
      data-testid="past-day-banner"
    >
      <span className="font-body text-body-sm text-on-surface">
        {t.home.dayPicker.viewingPastBanner}
      </span>
      <button
        type="button"
        onClick={onResetToToday}
        className="font-label text-micro font-bold uppercase tracking-widest text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
      >
        {t.home.dayPicker.backToToday}
      </button>
    </div>
  );
}
