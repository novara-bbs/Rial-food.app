import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Target, ClipboardList } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import { useState } from 'react';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { useI18n } from '../../../i18n';
import PageHeader from '../../../components/patterns/PageHeader';

interface WeeklyEntry {
  id: number;
  weekStart: string;
  workedWell: string;
  whatWasHard: string;
  focusNextWeek: string;
  avgVitality: number;
  mealsLogged: number;
  consistencyDays: number;
}

/**
 * History-only browser for past weekly reflections.
 * The reflection form itself now lives inline in Progress.tsx (Q16).
 */
export default function WeeklyCheckIn({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const [weeklyEntries] = useLocalStorageState<WeeklyEntry[]>('weeklyCheckIns', []);
  const [pastIndex, setPastIndex] = useState(0);

  const pastEntry = weeklyEntries[pastIndex];

  return (
    <PageShell maxWidth="narrow" spacing="lg">
      <PageHeader onBack={onBack} title={t.weekly?.historyTitle || 'Historial de Reflexiones'} />

      <div className="space-y-6">
        {weeklyEntries.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-4" />
            <p className="text-on-surface-variant font-body">{t.weekly?.noReflections || 'Aún no tienes reflexiones guardadas.'}</p>
            <p className="text-micro text-on-surface-variant/60 uppercase tracking-widest mt-2">
              {t.weekly?.writeFromProgress || 'Escribe reflexiones desde Tu Progreso → Nutrición'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button type="button"
                onClick={() => setPastIndex(Math.min(pastIndex + 1, weeklyEntries.length - 1))}
                disabled={pastIndex >= weeklyEntries.length - 1}
                className="w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                {t.weekly?.weekOf || 'Semana del'} {new Date(pastEntry.weekStart).toLocaleDateString()}
              </span>
              <button type="button"
                onClick={() => setPastIndex(Math.max(pastIndex - 1, 0))}
                disabled={pastIndex <= 0}
                className="w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.weekly?.vitality || 'Vitalidad'}</span>
                <span className="font-headline font-black text-xl text-primary">{pastEntry.avgVitality}</span>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.weekly?.logs || 'Registros'}</span>
                <span className="font-headline font-black text-xl text-brand-secondary">{pastEntry.mealsLogged}</span>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.weekly?.days || 'días'}</span>
                <span className="font-headline font-black text-xl text-tertiary">{pastEntry.consistencyDays}/7</span>
              </div>
            </div>

            {pastEntry.workedWell && (
              <div className="bg-surface-container-low border border-primary/20 rounded-sm p-4">
                <p className="font-label text-micro uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {t.weekly?.workedWell || 'Funcionó bien'}
                </p>
                <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.workedWell}</p>
              </div>
            )}
            {pastEntry.whatWasHard && (
              <div className="bg-surface-container-low border border-error/20 rounded-sm p-4">
                <p className="font-label text-micro uppercase tracking-widest text-error mb-2 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {t.weekly?.wasHard || 'Fue difícil'}
                </p>
                <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.whatWasHard}</p>
              </div>
            )}
            {pastEntry.focusNextWeek && (
              <div className="bg-surface-container-low border border-brand-secondary/20 rounded-sm p-4">
                <p className="font-label text-micro uppercase tracking-widest text-brand-secondary mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" /> {t.weekly?.focus || 'Foco'}
                </p>
                <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.focusNextWeek}</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
