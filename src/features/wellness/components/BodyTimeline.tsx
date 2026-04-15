import { useState, useMemo } from 'react';
import { Scale } from 'lucide-react';
import { useI18n } from '../../../i18n';
import BodySnapshotCard from './BodySnapshotCard';
import SnapshotDetailModal from './SnapshotDetailModal';
import type { BodySnapshot } from '../../../types/wellness';
import type { UnitSystem } from '../../food/utils/units';

type Filter = 'all' | 'withPhoto' | 'withMeasurements';

interface BodyTimelineProps {
  snapshots: BodySnapshot[];
  unitSystem: UnitSystem;
}

export default function BodyTimeline({ snapshots, unitSystem }: BodyTimelineProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Sort newest first
  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => b.date.localeCompare(a.date)),
    [snapshots],
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case 'withPhoto':
        return sorted.filter(s => s.photoUrl);
      case 'withMeasurements':
        return sorted.filter(s => s.measurements && Object.values(s.measurements).some(v => v != null));
      default:
        return sorted;
    }
  }, [sorted, filter]);

  const selectedSnapshot = selectedDate
    ? snapshots.find(s => s.date === selectedDate) ?? null
    : null;

  const p = t.progress;

  const FILTERS: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: p.filterAll ?? 'Todos', count: sorted.length },
    { id: 'withPhoto', label: p.filterWithPhoto ?? 'Con foto', count: sorted.filter(s => s.photoUrl).length },
    { id: 'withMeasurements', label: p.filterWithMeasurements ?? 'Con medidas', count: sorted.filter(s => s.measurements && Object.values(s.measurements).some(v => v != null)).length },
  ];

  if (sorted.length === 0) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/20 border-dashed rounded-sm p-10 flex flex-col items-center gap-3 text-center">
        <Scale className="w-8 h-8 text-on-surface-variant/40" />
        <p className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest">
          {p.noSnapshotsTitle ?? 'Sin registros aún'}
        </p>
        <p className="text-xs text-on-surface-variant max-w-[200px]">
          {p.noSnapshotsDesc ?? 'Registra tu peso, fotos y medidas para ver tu evolución.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border ${
              filter === f.id
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20 hover:border-primary/50'
            }`}
          >
            {f.label} · {f.count}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-8 italic">
            {p.noFilteredSnapshots ?? 'Ningún registro coincide con este filtro.'}
          </p>
        ) : (
          filtered.map((snap, idx) => {
            // previous (older) for delta — relative to the *next* item in the sorted list
            const prev = filtered[idx + 1];
            return (
              <BodySnapshotCard
                key={snap.date}
                snapshot={snap}
                previousKg={prev?.kg ?? null}
                unitSystem={unitSystem}
                onTap={() => setSelectedDate(snap.date)}
              />
            );
          })
        )}
      </div>

      <SnapshotDetailModal
        open={!!selectedSnapshot}
        onOpenChange={open => { if (!open) setSelectedDate(null); }}
        snapshot={selectedSnapshot}
        unitSystem={unitSystem}
      />
    </>
  );
}
