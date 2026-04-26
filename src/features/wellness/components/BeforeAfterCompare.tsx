/**
 * Before/after photo compare — PR 6b (+ 6c refinements).
 *
 * Market gap: MacroFactor, Yazio, Cronometer all ship a side-by-side
 * progress-photo comparator. RIAL already stores `BodySnapshot.photoUrl`
 * but had no way to put two of them next to each other with weight +
 * days delta. This component closes that gap as a sibling view inside
 * `<BodyTimeline>` (no new route, no new modal).
 *
 * States:
 * - `not-enough`   → less than 2 photos available (shows optional CTA to log one)
 * - `picker`       → one or both slots empty; scrollable thumb grid
 * - `viewing`      → both chosen; render the side-by-side diff
 *
 * On mount the component auto-seeds {before: photos[0], after: photos[N-1]}
 * so the viewing branch is 1 tap away. Users can still reset/swap. Pair
 * state is ephemeral (no persistence).
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Camera, Share2, X } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import { bodyWeightFromKg, getBodyWeightUnit, type UnitSystem } from '../../food/utils/units';
import type { BodySnapshot } from '../../../types/wellness';

export type CompareGoalType = 'loss' | 'gain' | 'maintain';

export interface BeforeAfterCompareCopy {
  title?: string;
  exit?: string;
  notEnough?: string;
  notEnoughCta?: string;
  pickBefore?: string;
  pickAfter?: string;
  beforeLabel?: string;
  afterLabel?: string;
  daysPattern?: string;   // "{{n}} días"
  swap?: string;
  reset?: string;
  shareLabel?: string;
}

interface BeforeAfterCompareProps {
  snapshots: BodySnapshot[];
  unitSystem: UnitSystem;
  onExit: () => void;
  onShare?: (before: BodySnapshot, after: BodySnapshot) => void;
  /** CTA inside the "not enough photos" empty state (typically deep-links to LogSnapshotModal). */
  onLogSnapshot?: () => void;
  /** Drives delta color semantics. Default `'loss'` (drop = primary / gain = brand-secondary). */
  goalType?: CompareGoalType;
  copy?: BeforeAfterCompareCopy;
}

const DAY_MS = 86_400_000;

/** Positive integer days between two YYYY-MM-DD strings. DST-safe via midday anchor. */
export function daysBetweenISO(beforeISO: string, afterISO: string): number {
  const a = new Date(beforeISO + 'T12:00:00').getTime();
  const b = new Date(afterISO + 'T12:00:00').getTime();
  return Math.max(0, Math.round(Math.abs(b - a) / DAY_MS));
}

/**
 * Color for the delta value, given a goal type. Gain-seekers see +delta as desirable
 * (primary), loss-seekers see -delta as desirable (primary), maintainers see neutral.
 * Exported for convention testing.
 */
export function deltaColorClass(delta: number, goalType: CompareGoalType = 'loss'): string {
  if (delta === 0) return 'text-on-surface-variant';
  if (goalType === 'maintain') return 'text-on-surface-variant';
  const desired = goalType === 'gain' ? delta > 0 : delta < 0;
  return desired ? 'text-primary' : 'text-brand-secondary';
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BeforeAfterCompare({
  snapshots,
  unitSystem,
  onExit,
  onShare,
  onLogSnapshot,
  goalType = 'loss',
  copy = {},
}: BeforeAfterCompareProps) {
  const photos = useMemo(
    () => snapshots.filter(s => !!s.photoUrl).sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots],
  );

  // Auto-seed oldest + newest so compare view is 1-tap away (PR 6c B8).
  const [beforeDate, setBeforeDate] = useState<string | null>(
    photos.length >= 2 ? photos[0].date : null,
  );
  const [afterDate, setAfterDate] = useState<string | null>(
    photos.length >= 2 ? photos[photos.length - 1].date : null,
  );

  // Re-seed if the current pair becomes invalid (e.g., a snapshot was deleted).
  useEffect(() => {
    if (photos.length < 2) return;
    const hasBefore = beforeDate && photos.some(s => s.date === beforeDate);
    const hasAfter = afterDate && photos.some(s => s.date === afterDate);
    if (!hasBefore) setBeforeDate(photos[0].date);
    if (!hasAfter) setAfterDate(photos[photos.length - 1].date);
  }, [photos, beforeDate, afterDate]);

  const before = beforeDate ? photos.find(s => s.date === beforeDate) ?? null : null;
  const after = afterDate ? photos.find(s => s.date === afterDate) ?? null : null;
  const unit = getBodyWeightUnit(unitSystem);

  const handlePick = (snap: BodySnapshot) => {
    if (!beforeDate) { setBeforeDate(snap.date); return; }
    if (!afterDate && snap.date !== beforeDate) setAfterDate(snap.date);
  };

  const swap = () => { setBeforeDate(afterDate); setAfterDate(beforeDate); };
  const reset = () => { setBeforeDate(null); setAfterDate(null); };

  const title = copy.title ?? 'Antes y después';
  const exitLabel = copy.exit ?? 'Salir';
  const beforeLabelUpper = copy.beforeLabel ?? 'ANTES';
  const afterLabelUpper = copy.afterLabel ?? 'DESPUÉS';

  const exitButton = (
    <button
      type="button"
      onClick={onExit}
      aria-label={exitLabel}
      className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary -mr-2"
    >
      <X className="w-5 h-5" aria-hidden="true" />
    </button>
  );

  /* ─── Not-enough branch ──────────────────────────────────────────── */
  if (photos.length < 2) {
    return (
      <SectionCard padding="md" spacing="sm" title={title} action={exitButton}>
        <p className="text-body-sm text-on-surface-variant text-center py-4">
          {copy.notEnough ?? 'Necesitas al menos 2 fotos para comparar.'}
        </p>
        {onLogSnapshot && (
          <button
            type="button"
            onClick={onLogSnapshot}
            className="mx-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary text-micro font-semibold uppercase tracking-widest min-h-11 hover:bg-primary/90"
          >
            <Camera className="w-4 h-4" aria-hidden="true" />
            {copy.notEnoughCta ?? 'Registrar foto'}
          </button>
        )}
      </SectionCard>
    );
  }

  /* ─── Picker branch (one or both slots empty) ─────────────────────── */
  if (!before || !after) {
    const prompt = !before
      ? (copy.pickBefore ?? 'Elige la foto "antes"')
      : (copy.pickAfter ?? 'Elige la foto "después"');

    return (
      <SectionCard padding="md" spacing="sm" title={title} action={exitButton}>
        <p className="text-body-sm text-on-surface leading-snug">
          {prompt}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {photos.map(snap => {
            const isBefore = beforeDate === snap.date;
            const disabled = !before ? false : snap.date === beforeDate;
            return (
              <button
                key={snap.date}
                type="button"
                onClick={() => !disabled && handlePick(snap)}
                aria-pressed={isBefore}
                disabled={disabled}
                className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                  isBefore
                    ? 'border-primary ring-2 ring-primary/30'
                    : disabled
                    ? 'border-outline-variant/10 opacity-40 cursor-not-allowed'
                    : 'border-outline-variant/20 hover:border-primary/50'
                }`}
              >
                <img src={snap.photoUrl} alt="" className="w-full h-full object-cover" />
                {isBefore && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm bg-primary text-on-primary text-micro font-semibold uppercase tracking-widest">
                    {beforeLabelUpper}
                  </span>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-micro font-semibold uppercase tracking-widest px-1 py-0.5 text-center">
                  {formatDate(snap.date)}
                </span>
              </button>
            );
          })}
        </div>

        {before && (
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-micro font-semibold uppercase tracking-widest text-primary self-start inline-flex items-center gap-1.5 min-h-11"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {copy.reset ?? 'Elegir otras'}
          </button>
        )}
      </SectionCard>
    );
  }

  /* ─── Viewing branch (both picked) ─────────────────────────────────── */
  const beforeKg = bodyWeightFromKg(before.kg, unitSystem);
  const afterKg = bodyWeightFromKg(after.kg, unitSystem);
  const delta = +(afterKg - beforeKg).toFixed(1);
  const days = daysBetweenISO(before.date, after.date);
  const daysText = (copy.daysPattern ?? '{{n}} días').replace('{{n}}', String(days));
  const deltaColor = deltaColorClass(delta, goalType);

  return (
    <SectionCard padding="md" spacing="sm" title={title} action={exitButton}>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-surface-container-high">
            <img src={before.photoUrl} alt="" className="w-full h-full object-cover" />
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm bg-primary text-on-primary text-micro font-semibold uppercase tracking-widest">
              {beforeLabelUpper}
            </span>
          </div>
          <p className="text-micro font-semibold uppercase tracking-widest text-on-surface-variant text-center">
            {formatDate(before.date)}
          </p>
          <p className="font-headline font-black text-title-sm text-tertiary text-center">
            {beforeKg} {unit}
          </p>
        </div>

        <div className="space-y-1">
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-surface-container-high">
            <img src={after.photoUrl} alt="" className="w-full h-full object-cover" />
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm bg-primary text-on-primary text-micro font-semibold uppercase tracking-widest">
              {afterLabelUpper}
            </span>
          </div>
          <p className="text-micro font-semibold uppercase tracking-widest text-on-surface-variant text-center">
            {formatDate(after.date)}
          </p>
          <p className="font-headline font-black text-title-sm text-tertiary text-center">
            {afterKg} {unit}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-2 border-t border-b border-outline-variant/20">
        <span className={`font-headline font-black text-title-sm ${deltaColor}`}>
          {delta > 0 ? '+' : ''}{delta} {unit}
        </span>
        <span className="w-px h-5 bg-outline-variant/40" aria-hidden="true" />
        <span className="font-headline font-bold text-body-sm text-on-surface-variant uppercase tracking-widest">
          {daysText}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={swap}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-surface-container-high text-on-surface text-micro font-semibold uppercase tracking-widest min-h-11 hover:bg-surface-container-highest"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
          {copy.swap ?? 'Intercambiar'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-surface-container-high text-on-surface text-micro font-semibold uppercase tracking-widest min-h-11 hover:bg-surface-container-highest"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          {copy.reset ?? 'Elegir otras'}
        </button>
        {onShare && (
          <button
            type="button"
            onClick={() => onShare(before, after)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-primary text-on-primary text-micro font-semibold uppercase tracking-widest min-h-11 hover:bg-primary/90 ml-auto"
          >
            <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
            {copy.shareLabel ?? 'Compartir'}
          </button>
        )}
      </div>
    </SectionCard>
  );
}
