/**
 * Canonical polymorphic calendar — Q13.
 *
 * Consolidates three independent implementations:
 *   - BodyCalendar (ideal reference)
 *   - Progress → Nutrición → Consistencia inline grid
 *   - ChallengeDetail week strip (opt-in migration)
 *
 * The caller owns the data→payload mapping; this component only owns
 * the visual grid + navigation + tap/empty-tap affordances.
 */
import { useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type DayGridMode = 'month' | 'week-strip';

interface DayGridCalendarProps<T> {
  mode: DayGridMode;
  /** Month-mode anchor; if omitted the component manages its own month state. */
  anchorDate?: Date;
  /** Called with the new first-of-month when the user navigates. */
  onChangeAnchor?: (d: Date) => void;
  /** Map date (YYYY-MM-DD) → payload. Pure lookup. */
  data: Map<string, T>;
  /** Called when a populated cell is tapped. */
  onSelect?: (date: string, payload: T) => void;
  /** Called when an empty non-future cell is tapped. */
  onSelectEmpty?: (date: string) => void;
  /** Renders cell content. Keep lightweight — this runs per day. */
  renderCell: (args: {
    date: string;
    payload?: T;
    isToday: boolean;
    isFuture: boolean;
  }) => ReactNode;
  /** Custom cell classes layered over the base (e.g. `bg-surface-container-highest` when populated). */
  cellClassName?: (args: { date: string; payload?: T; isToday: boolean; isFuture: boolean }) => string;
  /** Accessible label for each cell (prepended to `day`). */
  cellAriaLabel?: (args: { date: string; payload?: T }) => string;
  /** Legend row rendered above the grid (optional). */
  legend?: ReactNode;
  /** Labels for prev/next month buttons. */
  prevMonthLabel?: string;
  nextMonthLabel?: string;
  /** Week-start preference. Defaults to Monday-first to match BodyCalendar. */
  weekStart?: 'mon' | 'sun';
  /** 7-char array of weekday abbreviations in the chosen weekStart order. */
  weekdayLabels?: readonly string[];
  ariaLabel?: string;
  /** Rendered below the grid when `data` is empty. Use for CTA prompts. */
  emptyState?: ReactNode;
}

const DEFAULT_WEEKDAYS_MON = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
const DEFAULT_WEEKDAYS_SUN = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const;

function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function DayGridCalendar<T>({
  mode,
  anchorDate,
  onChangeAnchor,
  data,
  onSelect,
  onSelectEmpty,
  renderCell,
  cellClassName,
  cellAriaLabel,
  legend,
  prevMonthLabel = 'Previous month',
  nextMonthLabel = 'Next month',
  weekStart = 'mon',
  weekdayLabels,
  ariaLabel,
  emptyState,
}: DayGridCalendarProps<T>) {
  const now = useMemo(() => new Date(), []);
  const todayStr = isoLocal(now);

  // Local anchor fallback when the caller doesn't provide one
  const [internalAnchor, setInternalAnchor] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const anchor = anchorDate ?? internalAnchor;
  const setAnchor = (d: Date) => {
    if (onChangeAnchor) onChangeAnchor(d);
    else setInternalAnchor(d);
  };

  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0 = Sun
  const offset = weekStart === 'mon' ? (firstDow + 6) % 7 : firstDow;

  const labels = weekdayLabels ?? (weekStart === 'mon' ? DEFAULT_WEEKDAYS_MON : DEFAULT_WEEKDAYS_SUN);

  // ── Month mode ─────────────────────────────────────────────────────────────
  if (mode === 'month') {
    return (
      <div className="space-y-3" aria-label={ariaLabel}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setAnchor(new Date(year, month - 1, 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label={prevMonthLabel}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary">
            {anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={() => setAnchor(new Date(year, month + 1, 1))}
            disabled={isFutureMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={nextMonthLabel}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {legend}

        <div className="grid grid-cols-7 gap-1.5" role="grid">
          {labels.map(d => (
            <span key={d} className="text-center text-micro font-bold text-on-surface-variant uppercase">{d}</span>
          ))}
          {Array.from({ length: offset }).map((_, i) => <div key={`pad-${i}`} aria-hidden="true" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const payload = data.get(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;

            const base = `aspect-square rounded-sm flex items-center justify-center text-micro font-bold transition-colors relative ${
              isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low' : ''
            } ${isFuture ? 'bg-surface-container-highest/40 text-on-surface-variant/30' : 'hover:bg-primary/10'}`;
            const extra = cellClassName?.({ date: dateStr, payload, isToday, isFuture }) ?? '';

            const handleClick = () => {
              if (isFuture) return;
              if (payload !== undefined) onSelect?.(dateStr, payload);
              else onSelectEmpty?.(dateStr);
            };

            const clickable = !isFuture && ((payload !== undefined && !!onSelect) || (payload === undefined && !!onSelectEmpty));

            const aria = cellAriaLabel?.({ date: dateStr, payload }) ?? `${day}`;

            return (
              <button
                key={day}
                type="button"
                onClick={handleClick}
                disabled={!clickable}
                className={`${base} ${extra} ${clickable ? 'cursor-pointer' : 'cursor-default'}`.trim()}
                aria-label={aria}
              >
                {renderCell({ date: dateStr, payload, isToday, isFuture })}
              </button>
            );
          })}
        </div>

        {emptyState && data.size === 0 && emptyState}
      </div>
    );
  }

  // ── Week-strip mode ────────────────────────────────────────────────────────
  // Renders the 7 most-recent days ending at the anchor (or today).
  const stripEnd = anchorDate ?? now;
  const days: Array<{ date: string; isToday: boolean; isFuture: boolean }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(stripEnd.getFullYear(), stripEnd.getMonth(), stripEnd.getDate() - i);
    const ds = isoLocal(d);
    days.push({ date: ds, isToday: ds === todayStr, isFuture: ds > todayStr });
  }

  return (
    <div className="space-y-2" aria-label={ariaLabel}>
      {legend}
      <div className="grid grid-cols-7 gap-1.5" role="grid">
        {days.map(({ date, isToday, isFuture }) => {
          const payload = data.get(date);
          const base = `aspect-square rounded-sm flex items-center justify-center text-micro font-bold transition-colors relative ${
            isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low' : ''
          } ${isFuture ? 'bg-surface-container-highest/40 text-on-surface-variant/30' : 'hover:bg-primary/10'}`;
          const extra = cellClassName?.({ date, payload, isToday, isFuture }) ?? '';
          const clickable = !isFuture && ((payload !== undefined && !!onSelect) || (payload === undefined && !!onSelectEmpty));
          const handleClick = () => {
            if (isFuture) return;
            if (payload !== undefined) onSelect?.(date, payload);
            else onSelectEmpty?.(date);
          };
          return (
            <button
              key={date}
              type="button"
              onClick={handleClick}
              disabled={!clickable}
              className={`${base} ${extra} ${clickable ? 'cursor-pointer' : 'cursor-default'}`.trim()}
              aria-label={cellAriaLabel?.({ date, payload }) ?? date}
            >
              {renderCell({ date, payload, isToday, isFuture })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
