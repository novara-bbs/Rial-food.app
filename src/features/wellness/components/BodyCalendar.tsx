import { useState, useMemo } from 'react';
import { Ruler, Camera } from 'lucide-react';
import { useI18n } from '../../../i18n';
import SnapshotDetailModal from './SnapshotDetailModal';
import LogSnapshotModal from './LogSnapshotModal';
import DayGridCalendar from '../../../components/DayGridCalendar';
import SectionCard from '../../../components/SectionCard';
import type { BodySnapshot } from '../../../types/wellness';
import type { UnitSystem } from '../../food/utils/units';
import { todayLocal } from '../../../lib/dates';

interface BodyCalendarProps {
  snapshots: BodySnapshot[];
  unitSystem: UnitSystem;
}

/**
 * Monthly grid calendar for body snapshots. Each day cell renders the
 * richest indicator the snapshot has:
 *   - photo → mini circular thumb
 *   - measurements only → Ruler icon
 *   - weight only → solid dot
 *   - nothing → gray empty cell
 * Tap a populated cell → SnapshotDetailModal.
 * Tap an empty (non-future) cell → LogSnapshotModal pre-filled with that date.
 *
 * Post-Q13 this component is a thin wrapper around `<DayGridCalendar>`.
 */
export default function BodyCalendar({ snapshots, unitSystem }: BodyCalendarProps) {
  const { t } = useI18n();
  const p = t.progress;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logDate, setLogDate] = useState<string | null>(null);

  const snapshotsByDate = useMemo(() => {
    const m = new Map<string, BodySnapshot>();
    snapshots.forEach(s => m.set(s.date, s));
    return m;
  }, [snapshots]);

  const selectedSnapshot = selectedDate ? snapshotsByDate.get(selectedDate) ?? null : null;

  const legend = (
    <div className="flex flex-wrap items-center gap-3 justify-center text-micro">
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
  );

  return (
    <>
      <SectionCard padding="md" spacing="md">
        <DayGridCalendar<BodySnapshot>
          mode="month"
          data={snapshotsByDate}
          legend={legend}
          prevMonthLabel={p.prevMonth ?? 'Mes anterior'}
          nextMonthLabel={p.nextMonth ?? 'Mes siguiente'}
          onSelect={(dateStr) => setSelectedDate(dateStr)}
          onSelectEmpty={(dateStr) => setLogDate(dateStr)}
          cellClassName={({ payload }) => payload ? 'bg-surface-container-highest text-tertiary' : 'bg-surface-container/40 text-tertiary'}
          cellAriaLabel={({ date, payload }) => `${date.slice(-2)} ${payload ? '(registrado)' : ''}`}
          renderCell={({ date, payload }) => {
            const hasPhoto = !!payload?.photoUrl;
            const hasMeasurements = !!payload?.measurements && Object.values(payload.measurements).some(v => v != null);
            const hasWeight = !!payload && payload.kg > 0;
            const day = Number(date.slice(-2));
            return (
              <>
                <span className="absolute top-1 left-1 text-micro opacity-60">{day}</span>
                {hasPhoto ? (
                  <img src={payload!.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : hasMeasurements ? (
                  <Ruler className="w-3 h-3 text-primary" aria-hidden="true" />
                ) : hasWeight ? (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                ) : null}
              </>
            );
          }}
          emptyState={
            <div className="text-center py-4 space-y-2">
              <Camera className="w-5 h-5 text-on-surface-variant/50 mx-auto" aria-hidden="true" />
              <p className="text-xs text-on-surface-variant">{p.bodyCalendarEmpty ?? 'Aún no has añadido snapshots'}</p>
              <button
                type="button"
                onClick={() => setLogDate(todayLocal())}
                className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-sm text-micro font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                {p.logFirstSnapshot ?? 'Registrar primer snapshot'}
              </button>
            </div>
          }
        />
      </SectionCard>

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
