import { useState, useMemo } from 'react';
import { Scale, ArrowLeftRight } from 'lucide-react';
import { useI18n } from '../../../i18n';
import BodySnapshotCard from './BodySnapshotCard';
import SnapshotDetailModal from './SnapshotDetailModal';
import SectionCard from '../../../components/SectionCard';
import BeforeAfterCompare, { type CompareGoalType } from './BeforeAfterCompare';
import type { BodySnapshot } from '../../../types/wellness';
import type { UnitSystem } from '../../food/utils/units';

type Filter = 'all' | 'withPhoto' | 'withMeasurements';

interface BodyTimelineProps {
  snapshots: BodySnapshot[];
  unitSystem: UnitSystem;
  onShare?: (snapshot: BodySnapshot) => void;
  shareLabel?: string;
  /** Share 2 snapshots as a before/after pair (falls back to `onShare(after)` when unset). */
  onShareCompare?: (before: BodySnapshot, after: BodySnapshot) => void;
  /** Drives delta color semantics in BeforeAfterCompare. Default `'loss'`. */
  goalType?: CompareGoalType;
  /** CTA for the "not enough photos" empty state inside BeforeAfterCompare. */
  onLogSnapshot?: () => void;
}

export default function BodyTimeline({ snapshots, unitSystem, onShare, shareLabel, onShareCompare, goalType, onLogSnapshot }: BodyTimelineProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

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
      <SectionCard padding="none" spacing="none" className="border-dashed p-10 flex flex-col items-center gap-3 text-center">
        <Scale className="w-8 h-8 text-on-surface-variant/40" />
        <p className="font-headline font-bold text-body-sm text-tertiary uppercase tracking-widest">
          {p.noSnapshotsTitle ?? 'Sin registros aún'}
        </p>
        <p className="text-xs text-on-surface-variant max-w-[200px]">
          {p.noSnapshotsDesc ?? 'Registra tu peso, fotos y medidas para ver tu evolución.'}
        </p>
      </SectionCard>
    );
  }

  const photoCount = sorted.filter(s => s.photoUrl).length;
  const canCompare = photoCount >= 2;

  const shareCompareHandler = onShareCompare
    ? (before: BodySnapshot, after: BodySnapshot) => onShareCompare(before, after)
    : onShare
    ? (_before: BodySnapshot, after: BodySnapshot) => onShare(after)
    : undefined;

  return (
    <>
      {/* Filter chips + Compare toggle */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 inline-flex items-center min-h-[22px] px-2.5 rounded-full text-nano font-medium normal-case tracking-normal transition-colors border ${
              filter === f.id
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20 hover:border-primary/50'
            }`}
          >
            {f.label} · {f.count}
          </button>
        ))}
        {canCompare && (
          <button
            type="button"
            onClick={() => setCompareMode(v => !v)}
            aria-pressed={compareMode}
            className={`shrink-0 inline-flex items-center gap-1 min-h-[22px] px-2.5 rounded-full text-nano font-medium normal-case tracking-normal transition-colors border ${
              compareMode
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20 hover:border-primary/50'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
            {p.compareCta ?? 'Comparar'}
          </button>
        )}
      </div>

      {/* Compare view OR Cards */}
      {compareMode ? (
        <BeforeAfterCompare
          snapshots={sorted}
          unitSystem={unitSystem}
          onExit={() => setCompareMode(false)}
          onShare={shareCompareHandler}
          onLogSnapshot={onLogSnapshot}
          goalType={goalType}
          copy={{
            title: p.compareTitle,
            exit: p.compareExit,
            notEnough: p.compareNotEnough,
            notEnoughCta: p.compareNotEnoughCta,
            pickBefore: p.compareSelectBefore,
            pickAfter: p.compareSelectAfter,
            beforeLabel: p.compareBeforeLabel,
            afterLabel: p.compareAfterLabel,
            daysPattern: p.compareDaysPattern,
            swap: p.compareSwap,
            reset: p.compareReset,
            shareLabel,
          }}
        />
      ) : (
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
                  onShare={onShare}
                  shareLabel={shareLabel}
                />
              );
            })
          )}
        </div>
      )}

      <SnapshotDetailModal
        open={!!selectedSnapshot}
        onOpenChange={open => { if (!open) setSelectedDate(null); }}
        snapshot={selectedSnapshot}
        unitSystem={unitSystem}
      />
    </>
  );
}
