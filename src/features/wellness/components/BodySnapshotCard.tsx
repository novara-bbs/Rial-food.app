import { Scale, Camera, Ruler, Share2 } from 'lucide-react';
import { bodyWeightFromKg, getBodyWeightUnit, type UnitSystem } from '../../food/utils/units';
import { BUTTON_CARD_SURFACE_CLASSES } from '../../../components/ui/surface';
import type { BodySnapshot } from '../../../types/wellness';

interface BodySnapshotCardProps {
  snapshot: BodySnapshot;
  previousKg?: number | null;   // for delta badge
  unitSystem: UnitSystem;
  onTap: () => void;
  /** When provided, a Share icon-button appears top-right; opens the composer. */
  onShare?: (snapshot: BodySnapshot) => void;
  shareLabel?: string;
}

/**
 * Compact card that renders one BodySnapshot — shows whatever fields the
 * snapshot actually has (photo thumb, weight, measurements, note).
 * Used inside BodyTimeline. Tap → opens SnapshotDetailModal.
 */
export default function BodySnapshotCard({ snapshot, previousKg, unitSystem, onTap, onShare, shareLabel }: BodySnapshotCardProps) {
  const unit = getBodyWeightUnit(unitSystem);
  const displayKg = snapshot.kg > 0 ? bodyWeightFromKg(snapshot.kg, unitSystem) : null;
  const delta = displayKg !== null && previousKg != null && previousKg > 0
    ? +(displayKg - bodyWeightFromKg(previousKg, unitSystem)).toFixed(1)
    : null;

  const deltaColor =
    delta === null ? '' : delta < 0 ? 'text-primary' : delta > 0 ? 'text-brand-secondary' : 'text-on-surface-variant';

  const dateLabel = new Date(snapshot.date + 'T12:00:00').toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const hasPhoto = !!snapshot.photoUrl;
  const hasMeasurements = !!snapshot.measurements && Object.values(snapshot.measurements).some(v => v != null);
  const m = snapshot.measurements ?? {};

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onTap}
        className={`w-full ${BUTTON_CARD_SURFACE_CLASSES} p-3 flex items-start gap-3 hover:border-primary/40 transition-colors text-left`}
      >
        {/* Left: thumb or icon */}
        <div className="w-16 h-16 rounded-sm shrink-0 overflow-hidden bg-primary/10 flex items-center justify-center">
          {hasPhoto ? (
            <img src={snapshot.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Scale className="w-6 h-6 text-primary/60" aria-hidden="true" />
          )}
        </div>

        {/* Right: body */}
        <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-label text-micro text-on-surface-variant uppercase tracking-widest">
            {dateLabel}
          </span>
          <div className="flex items-center gap-1">
            {hasPhoto && <Camera className="w-3 h-3 text-primary/60" aria-hidden="true" />}
            {hasMeasurements && <Ruler className="w-3 h-3 text-primary/60" aria-hidden="true" />}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-headline font-black text-body text-tertiary">
            {displayKg !== null ? `${displayKg} ${unit}` : '—'}
          </span>
          {delta !== null && delta !== 0 && (
            <span className={`text-micro font-bold ${deltaColor}`}>
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
        </div>

        {hasMeasurements && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {m.chestCm != null && (
              <span className="text-micro font-bold uppercase tracking-widest bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-sm">
                P {m.chestCm}
              </span>
            )}
            {m.waistCm != null && (
              <span className="text-micro font-bold uppercase tracking-widest bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-sm">
                C {m.waistCm}
              </span>
            )}
            {m.hipsCm != null && (
              <span className="text-micro font-bold uppercase tracking-widest bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-sm">
                Ca {m.hipsCm}
              </span>
            )}
            {m.bodyFatPct != null && (
              <span className="text-micro font-bold uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                {m.bodyFatPct}%
              </span>
            )}
          </div>
        )}

        {snapshot.note && (
          <p className="text-micro text-on-surface-variant/80 italic line-clamp-2">
            {snapshot.note}
          </p>
        )}
        </div>
      </button>

      {onShare && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onShare(snapshot); }}
          aria-label={shareLabel ?? 'Compartir con la comunidad'}
          className="absolute top-2 right-2 p-1.5 rounded-sm bg-surface-container/80 backdrop-blur-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
