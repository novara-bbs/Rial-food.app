/**
 * Surfaces the most recent weekly check-in inside Progress → Nutrición.
 *
 * Q13 — resolves the orphan where `weeklyCheckIns` writes in the demo
 * seed never reached the screen the user expects to see them.
 *
 * Deep-links:
 *   - "Ver reflexión completa" → WeeklyCheckIn screen
 *   - "Resumen de la semana" → WeeklyReview screen
 */
import { NotebookPen, ArrowRight } from 'lucide-react';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useI18n } from '../../../i18n';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import SectionCard from '../../../components/SectionCard';
import DataSourceCaption from './DataSourceCaption';
import type { WeeklyCheckInEntry } from '../../../types/wellness';

interface LatestReflectionCardProps {
  /** Optional override; defaults to reading from localStorage key `weeklyCheckIns`. */
  entries?: WeeklyCheckInEntry[];
}

function formatWeekLabel(weekStart: string): string {
  try {
    const d = new Date(weekStart + 'T12:00:00');
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  } catch {
    return weekStart;
  }
}

export default function LatestReflectionCard({ entries }: LatestReflectionCardProps) {
  const { t } = useI18n();
  const { navigateTo } = useNavigation();
  const p = t.progress;
  const [stored] = useLocalStorageState<WeeklyCheckInEntry[]>('weeklyCheckIns', []);
  const source = entries ?? stored;

  const latest = [...(source || [])]
    .sort((a, b) => (b.weekStart || '').localeCompare(a.weekStart || ''))[0];

  if (!latest) {
    return (
      <SectionCard
        icon={<NotebookPen className="w-4 h-4 text-primary" aria-hidden="true" />}
        title={p.latestReflectionTitle ?? 'Última reflexión'}
        caption={<DataSourceCaption kind="manual" label={p.dataSourceManualReflection ?? 'completa tu domingo de reflexión'} />}
      >
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {p.latestReflectionEmpty ?? 'Termina tu primera reflexión del domingo'}
        </p>
        <button
          type="button"
          onClick={() => navigateTo('weekly-check-in')}
          className="mt-1 inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-sm text-micro font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          {p.openWeeklyCheckIn ?? 'Ver reflexión completa'}
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </button>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={<NotebookPen className="w-4 h-4 text-primary" aria-hidden="true" />}
      title={p.latestReflectionTitle ?? 'Última reflexión'}
      caption={<DataSourceCaption kind="manual" label={p.dataSourceManualReflection ?? 'completa tu domingo de reflexión'} />}
      action={
        <span className="font-label text-micro uppercase tracking-widest text-primary">
          {formatWeekLabel(latest.weekStart)}
        </span>
      }
    >
      {latest.workedWell && (
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
          {latest.workedWell}
        </p>
      )}

      {latest.avgVitality != null && (
        <div className="flex items-center gap-2 pt-1">
          <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant">
            {p.ritmoVitality ?? 'Real Feel'}
          </span>
          <span className="font-headline font-bold text-body-sm text-primary">{latest.avgVitality}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={() => navigateTo('weekly-check-in')}
          className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-sm text-micro font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          {p.openWeeklyCheckIn ?? 'Ver reflexión completa'}
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => navigateTo('weekly-review')}
          className="inline-flex items-center gap-1.5 border border-outline-variant/30 text-tertiary px-3 py-1.5 rounded-sm text-micro font-semibold uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-colors"
        >
          {p.openWeeklyReview ?? 'Resumen de la semana'}
        </button>
      </div>
    </SectionCard>
  );
}
