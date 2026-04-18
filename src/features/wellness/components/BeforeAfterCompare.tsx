/**
 * Before/after photo compare — PR 6b.
 *
 * Market gap: MacroFactor, Yazio, Cronometer all ship a side-by-side
 * progress-photo comparator. RIAL already stores `BodySnapshot.photoUrl`
 * but had no way to put two of them next to each other with weight +
 * days delta. This component closes that gap as a sibling view inside
 * `<BodyTimeline>` (no new route, no new modal).
 *
 * States:
 * - `not-enough`   → less than 2 photos available
 * - `pick-before`  → waiting for the "before" snapshot tap
 * - `pick-after`   → "before" chosen, waiting for "after"
 * - `viewing`      → both chosen; render the side-by-side diff
 *
 * Keeps all state ephemeral (no persistence — the user's photos live
 * in `weightHistory`, and the picked pair is a transient UI choice).
 */
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Share2, X } from 'lucide-react';
import SectionCard from '../../../components/SectionCard';
import { bodyWeightFromKg, getBodyWeightUnit, type UnitSystem } from '../../food/utils/units';
import type { BodySnapshot } from '../../../types/wellness';

export interface BeforeAfterCompareCopy {
  title?: string;
  exit?: string;
  notEnough?: string;
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
  copy?: BeforeAfterCompareCopy;
}

const DAY_MS = 86_400_000;

/** Positive integer days between two YYYY-MM-DD strings. */
export function daysBetweenISO(beforeISO: string, afterISO: string): number {
  const a = new Date(beforeISO + 'T12:00:00').getTime();
  const b = new Date(afterISO + 'T12:00:00').getTime();
  return Math.max(0, Math.round(Math.abs(b - a) / DAY_MS));
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
  copy = {},
}: BeforeAfterCompareProps) {
  const [beforeDate, setBeforeDate] = useState<string | null>(null);
  const [afterDate, setAfterDate] = useState<string | null>(null);

  const photos = useMemo(
    () => snapshots.filter(s => !!s.photoUrl).sort((a, b) => a.date.localeCompare(b.date)),
    [snapshots],
  );

  const before = beforeDate ? photos.find(s => s.date === beforeDate) ?? null : null;
  const after = afterDate ? photos.find(s => s.date === afterDate) ?? null : null;
  const unit = getBodyWeightUnit(unitSystem);

  const handlePick = (snap: BodySnapshot) => {
    if (!beforeDate) {
      setBeforeDate(snap.date);
      return;
    }
    if (!afterDate && snap.date !== beforeDate) {
      setAfterDate(snap.date);
    }
  };

  const swap = () => {
    setBeforeDate(afterDate);
    setAfterDate(beforeDate);
  };
  const reset = () => {
    setBeforeDate(null);
    setAfterDate(null);
  };

  const title = copy.title ?? 'Antes y después';
  const exitLabel = copy.exit ?? 'Salir';
  const beforeLabelUpper = copy.beforeLabel ?? 'ANTES';
  const afterLabelUpper = copy.afterLabel ?? 'DESPUÉS';

  /* ─── Not-enough branch ──────────────────────────────────────────── */
  if (photos.length < 2) {
    return (
      <SectionCard padding="md" spacing="sm" title={title} action={
        <button
          type="button"
          onClick={onExit}
          aria-label={exitLabel}
          className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary -mr-2"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      }>
        <p className="text-body-sm text-on-surface-variant text-center py-6">
          {copy.notEnough ?? 'Necesitas al menos 2 fotos para comparar.'}
        </p>
      </SectionCard>
    );
  }

  /* ─── Picker branch (before XOR after still empty) ─────────────────── */
  if (!before || !after) {
    const prompt = !before
      ? (copy.pickBefore ?? 'Elige la foto "antes"')
      : (copy.pickAfter ?? 'Elige la foto "después"');

    return (
      <SectionCard padding="md" spacing="sm" title={title} action={
        <button
          type="button"
          onClick={onExit}
          aria-label={exitLabel}
          className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary -mr-2"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      }>
        <p className="text-body-sm text-on-surface leading-snug">
          {prompt}
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2">
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
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm bg-primary text-on-primary text-micro font-bold uppercase tracking-widest">
                    {beforeLabelUpper}
                  </span>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-micro font-bold uppercase tracking-widest px-1 py-0.5 text-center">
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
            className="mt-2 text-micro font-bold uppercase tracking-widest text-primary self-start inline-flex items-center gap-1.5 min-h-11"
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
  const deltaColor = delta < 0 ? 'text-primary' : delta > 0 ? 'text-brand-secondary' : 'text-on-surface-variant';

  return (
    <SectionCard
      padding="md"
      spacing="sm"
      title={title}
      action={
        <button
          type="button"
          onClick={onExit}
          aria-label={exitLabel}
          className="min-w-11 min-h-11 flex items-center justify-center text-on-surface-variant hover:text-primary -mr-2"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-surface-container-high">
            <img src={before.photoUrl} alt="" className="w-full h-full object-cover" />
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm bg-primary text-on-primary text-micro font-bold uppercase tracking-widest">
              {beforeLabelUpper}
            </span>
          </div>
          <p className="text-micro font-bold uppercase tracking-widest text-on-surface-variant text-center">
            {formatDate(before.date)}
          </p>
          <p className="font-headline font-black text-title-sm text-tertiary text-center">
            {beforeKg} {unit}
          </p>
        </div>

        <div className="space-y-1">
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-surface-container-high">
            <img src={after.photoUrl} alt="" className="w-full h-full object-cover" />
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm bg-primary text-on-primary text-micro font-bold uppercase tracking-widest">
              {afterLabelUpper}
            </span>
          </div>
          <p className="text-micro font-bold uppercase tracking-widest text-on-surface-variant text-center">
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
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-surface-container-high text-on-surface text-micro font-bold uppercase tracking-widest min-h-11 hover:bg-surface-container-highest"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
          {copy.swap ?? 'Intercambiar'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-surface-container-high text-on-surface text-micro font-bold uppercase tracking-widest min-h-11 hover:bg-surface-container-highest"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          {copy.reset ?? 'Elegir otras'}
        </button>
        {onShare && (
          <button
            type="button"
            onClick={() => onShare(before, after)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-primary text-on-primary text-micro font-bold uppercase tracking-widest min-h-11 hover:bg-primary/90 ml-auto"
          >
            <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
            {copy.shareLabel ?? 'Compartir'}
          </button>
        )}
      </div>
    </SectionCard>
  );
}
