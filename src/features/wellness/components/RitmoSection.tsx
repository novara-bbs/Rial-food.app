import { useState, useMemo, type ReactNode } from 'react';
import { Activity, Droplets, Footprints, Heart, ChevronDown } from 'lucide-react';
import { type DailyArchive, archiveHydrationConsumed, archiveActiveMinutes } from '../../../hooks/useDailyReset';
import { dateToLocal } from '../../../lib/dates';
import DataSourceCaption from './DataSourceCaption';
import Sparkline from '../../../components/Sparkline';
import SectionCard from '../../../components/SectionCard';
import { Heading } from '@/components/ui/Typography';

interface RitmoSectionProps {
  history: DailyArchive[];
  realFeelLogs: Array<{ date?: string; level?: number }>;
  title: string;
  captionLabel: string;
  /** Labels for the three sparklines — pass from useI18n so it stays translated. */
  labels: {
    hydration: string;
    movement: string;
    vitality: string;
  };
  emptyLabel: string;
  daysLabel: string;
}

/**
 * Collapsible "Ritmo diario" panel for the Nutrición tab.
 * Shows 14-day sparklines for hydration, movement and Real Feel vitality.
 * Covers the Health-seeker ICP without fragmenting navigation into a 3rd tab.
 *
 * All three series are AUTO — aggregated from existing stores. No manual input here.
 */
export default function RitmoSection({
  history, realFeelLogs, title, captionLabel, labels, emptyLabel, daysLabel,
}: RitmoSectionProps) {
  const [open, setOpen] = useState(false);

  const series = useMemo(() => {
    // Build last-14-day series. Fill gaps with nulls so the chart stays date-aligned.
    const now = new Date();
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(dateToLocal(d));
    }

    const histByDate = new Map(history.map(h => [h.date, h]));

    // Real Feel avg per day (log.level 1–5 → vitality 20–100)
    const rfByDate = new Map<string, { sum: number; n: number }>();
    for (const log of realFeelLogs) {
      if (!log.date) continue;
      const d = dateToLocal(new Date(log.date));
      const cur = rfByDate.get(d) ?? { sum: 0, n: 0 };
      cur.sum += (log.level ?? 3) * 20;
      cur.n += 1;
      rfByDate.set(d, cur);
    }

    const hydration = days.map(d => {
      const h = histByDate.get(d);
      return h ? archiveHydrationConsumed(h) : null;
    });
    const movement = days.map(d => {
      const h = histByDate.get(d);
      return h ? archiveActiveMinutes(h) : null;
    });
    const vitality = days.map(d => {
      const r = rfByDate.get(d);
      return r && r.n > 0 ? Math.round(r.sum / r.n) : null;
    });

    const anyData = [hydration, movement, vitality].some(arr => arr.some(v => v != null));
    return { days, hydration, movement, vitality, anyData };
  }, [history, realFeelLogs]);

  return (
    <SectionCard padding="none" spacing="none" className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 hover:bg-surface-container/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" aria-hidden="true" />
          <div className="flex flex-col items-start gap-1">
            <Heading level="h2" variant="overline" className="text-body-sm">
              {title}
            </Heading>
            <DataSourceCaption kind="auto" label={captionLabel} />
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-outline-variant/10 pt-4">
          {series.anyData ? (
            <>
              <RitmoRow
                icon={<Droplets className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
                label={labels.hydration}
                values={series.hydration}
                colorVar="var(--primary)"
              />
              <RitmoRow
                icon={<Footprints className="w-3.5 h-3.5 text-brand-secondary" aria-hidden="true" />}
                label={labels.movement}
                values={series.movement}
                colorVar="var(--brand-secondary)"
              />
              <RitmoRow
                icon={<Heart className="w-3.5 h-3.5 text-tertiary" aria-hidden="true" />}
                label={labels.vitality}
                values={series.vitality}
                colorVar="var(--tertiary)"
              />
              <p className="text-micro text-on-surface-variant/80 pt-1">
                {series.days.length} {daysLabel}
              </p>
            </>
          ) : (
            <div className="h-16 flex items-center justify-center text-on-surface-variant text-xs font-label uppercase tracking-widest">
              {emptyLabel}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function RitmoRow({
  icon, label, values, colorVar,
}: {
  icon: ReactNode;
  label: string;
  values: Array<number | null>;
  colorVar: string;
}) {
  const numeric = values.filter((v): v is number => v != null);
  const avg = numeric.length >= 1
    ? Math.round(numeric.reduce((s, v) => s + v, 0) / numeric.length)
    : null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-micro">
        <span className="flex items-center gap-1.5 font-label uppercase tracking-widest text-on-surface-variant">
          {icon}
          {label}
        </span>
        <span className="font-headline font-bold text-tertiary">
          {avg ?? '—'}
        </span>
      </div>
      <Sparkline values={values} color={colorVar} ariaLabel={label} />
    </div>
  );
}
