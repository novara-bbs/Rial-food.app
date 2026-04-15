import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import { useI18n } from '../../../i18n';
import SnapshotDetailModal from './SnapshotDetailModal';
import LogSnapshotModal from './LogSnapshotModal';
import type { BodySnapshot } from '../../../types/wellness';
import type { UnitSystem } from '../../food/utils/units';

interface BodyCalendarProps {
  snapshots: BodySnapshot[];
  unitSystem: UnitSystem;
}

/**
 * Monthly grid calendar. Each day cell renders the richest indicator the snapshot has:
 *   - photo → mini circular thumb
 *   - measurements only → Ruler icon
 *   - weight only → solid dot
 *   - nothing → gray empty cell
 * Tap a populated cell → SnapshotDetailModal.
 * Tap an empty (non-future) cell → LogSnapshotModal pre-filled with that date.
 */
export default function BodyCalendar({ snapshots, unitSystem }: BodyCalendarProps) {
  const { t } = useI18n();
  const p = t.progress;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logDate, setLogDate] = useState<string | null>(null);

  const snapshotsByDate = useMemo(() => {
    const m = new Map<string, BodySnapshot>();
    snapshots.forEach(s => m.set(s.date, s));
    return m;
  }, [snapshots]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = (firstDow + 6) % 7; // convert to Monday-first

  const selectedSnapshot = selectedDate ? snapshotsByDate.get(selectedDate) ?? null : null;

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));
  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth());

  return (
    <>
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label={p.prevMonth ?? 'Mes anterior'}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary">
            {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={isFutureMonth}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={p.nextMonth ?? 'Mes siguiente'}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 justify-center text-[8px]">
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> {p.weight ?? 'Peso'}
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-brand-secondary" /> {p.hasPhoto ?? 'Foto'}
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant">
            <Ruler className="w-2.5 h-2.5 text-primary" /> {p.measurements ?? 'Medidas'}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
            <span key={d} className="text-center text-[8px] font-bold text-on-surface-variant uppercase">{d}</span>
          ))}
          {Array.from({ length: offset }).map((_, i) => <div key={`pad-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const snap = snapshotsByDate.get(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            const hasPhoto = !!snap?.photoUrl;
            const hasMeasurements = !!snap?.measurements && Object.values(snap.measurements).some(v => v != null);
            const hasWeight = snap && snap.kg > 0;

            const baseClasses = `aspect-square rounded-sm flex items-center justify-center text-[9px] font-bold transition-colors relative ${
              isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low' : ''
            } ${isFuture ? 'bg-surface-container-highest/40 text-on-surface-variant/30' : 'hover:bg-primary/10 cursor-pointer'}`;

            const handleClick = () => {
              if (isFuture) return;
              if (snap) setSelectedDate(dateStr);
              else setLogDate(dateStr);
            };

            return (
              <button
                key={day}
                type="button"
                onClick={handleClick}
                disabled={isFuture}
                className={`${baseClasses} ${snap ? 'bg-surface-container-highest' : 'bg-surface-container/40'} text-tertiary`}
                aria-label={`${day} ${snap ? '(registrado)' : ''}`}
              >
                <span className="absolute top-1 left-1 text-[8px] opacity-60">{day}</span>
                {/* Indicator layer */}
                {hasPhoto ? (
                  <img src={snap!.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : hasMeasurements ? (
                  <Ruler className="w-3 h-3 text-primary" aria-hidden="true" />
                ) : hasWeight ? (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <SnapshotDetailModal
        open={!!selectedSnapshot}
        onOpenChange={open => { if (!open) setSelectedDate(null); }}
        snapshot={selectedSnapshot}
        unitSystem={unitSystem}
      />

      <LogSnapshotModal
        open={!!logDate}
        onOpenChange={open => { if (!open) setLogDate(null); }}
        unitSystem={unitSystem}
        initialDate={logDate ?? undefined}
      />
    </>
  );
}
