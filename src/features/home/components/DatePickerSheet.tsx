/**
 * DatePickerSheet — Phase 3 Sprint B / 1.5.190
 *
 * Owner brief: tap on "Hoy, 2 may" pill → open picker → swap day.
 * Last 14 days navigable. Today = live data, past = archived snapshot.
 *
 * Pattern: BottomSheet `compact` size + scrollable list of day rows.
 * Each row shows: day-name · short date · kcal preview (or "Sin datos").
 * Today is always present; past days come from `nutritionHistory` archive.
 *
 * State coupling: caller owns `selectedDate` and consumes onSelect.
 * Sheet itself is stateless wrt selection (presentational).
 */
import { Check } from 'lucide-react';
import BottomSheet from '../../../components/ui/bottom-sheet';
import { useI18n } from '../../../i18n';
import { dateToLocal } from '../../../lib/dates';
import type { DailyArchive } from '../../../hooks/useDailyReset';

interface DatePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently selected day in YYYY-MM-DD local format. */
  selectedDate: string;
  /** Days back to show. Defaults to 14. */
  daysBack?: number;
  /** Live kcal/macros for today (used so today's row reflects current state, not stale archive). */
  todayKcal: number;
  /** Archive entries (last 14+ days). */
  history: DailyArchive[];
  onSelect: (date: string) => void;
}

const DAY_NAME_FMT = (locale: string, date: Date) =>
  new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
const SHORT_DATE_FMT = (locale: string, date: Date) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);

interface DayRow {
  date: string;
  dayName: string;
  shortDate: string;
  isToday: boolean;
  isYesterday: boolean;
  kcal: number | null;
  tracked: boolean;
}

function buildDayRows({
  daysBack,
  todayKcal,
  history,
  locale,
  now,
}: {
  daysBack: number;
  todayKcal: number;
  history: DailyArchive[];
  locale: string;
  now: Date;
}): DayRow[] {
  const todayStr = dateToLocal(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = dateToLocal(yesterday);
  const archiveByDate = new Map(history.map((h) => [h.date, h]));

  const rows: DayRow[] = [];
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = dateToLocal(d);
    const isToday = iso === todayStr;
    const isYesterday = iso === yesterdayStr;
    const archived = archiveByDate.get(iso);
    const kcal = isToday
      ? Math.round(todayKcal)
      : archived?.tracked
        ? Math.round(archived.macros.consumed.cal ?? 0)
        : null;
    rows.push({
      date: iso,
      dayName: DAY_NAME_FMT(locale, d),
      shortDate: SHORT_DATE_FMT(locale, d),
      isToday,
      isYesterday,
      kcal,
      tracked: isToday || archived?.tracked === true,
    });
  }
  return rows;
}

export default function DatePickerSheet({
  open,
  onOpenChange,
  selectedDate,
  daysBack = 14,
  todayKcal,
  history,
  onSelect,
}: DatePickerSheetProps) {
  const { t, locale } = useI18n();
  const rows = buildDayRows({ daysBack, todayKcal, history, locale, now: new Date() });

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.home.dayPicker.title}
      size="compact"
      headerLayout="title-centered"
    >
      <ul className="divide-y divide-outline-variant/20">
        {rows.map((row) => {
          const isSelected = row.date === selectedDate;
          let displayLabel = row.dayName;
          if (row.isToday) displayLabel = t.home.dayPicker.today;
          else if (row.isYesterday) displayLabel = t.home.dayPicker.yesterday;
          return (
            <li key={row.date}>
              <button
                type="button"
                onClick={() => {
                  onSelect(row.date);
                  onOpenChange(false);
                }}
                className={`w-full flex items-center justify-between gap-3 py-3 px-1 text-left rounded-sm transition-colors ${
                  isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-highest'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
                data-testid={`day-row-${row.date}`}
                aria-current={isSelected ? 'date' : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex items-center justify-center w-5 h-5 shrink-0 ${
                      isSelected ? 'text-primary' : 'text-transparent'
                    }`}
                    aria-hidden="true"
                  >
                    <Check className="w-4 h-4" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body text-body-sm font-semibold text-on-surface truncate capitalize">
                      {displayLabel}
                    </span>
                    <span className="font-body text-micro text-on-surface-variant tabular-nums">
                      {row.shortDate}
                    </span>
                  </div>
                </div>
                <span
                  className={`font-body text-body-sm tabular-nums shrink-0 ${
                    row.tracked ? 'font-semibold text-on-surface' : 'italic text-on-surface-variant'
                  }`}
                >
                  {row.kcal !== null ? `${row.kcal} kcal` : t.home.dayPicker.noData}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
