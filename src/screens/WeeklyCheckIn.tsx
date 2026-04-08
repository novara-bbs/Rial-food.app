import { ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { useAppState } from '../contexts/AppStateContext';
import { useI18n } from '../i18n';

interface WeeklyEntry {
  id: number;
  weekStart: string; // ISO date
  workedWell: string;
  whatWasHard: string;
  focusNextWeek: string;
  avgVitality: number; // 0-100
  mealsLogged: number;
  consistencyDays: number;
}

export default function WeeklyCheckIn({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const { realFeelLogs, mealPlan } = useAppState();
  const [weeklyEntries, setWeeklyEntries] = useLocalStorageState<WeeklyEntry[]>('weeklyCheckIns', []);
  const [viewingPast, setViewingPast] = useState(false);
  const [pastIndex, setPastIndex] = useState(0);

  const [workedWell, setWorkedWell] = useState('');
  const [whatWasHard, setWhatWasHard] = useState('');
  const [focusNext, setFocusNext] = useState('');

  // Compute this week's stats
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekLogs = realFeelLogs.filter((l: any) => l.date && new Date(l.date) >= weekStart);
  const avgVitality = thisWeekLogs.length > 0
    ? Math.round((thisWeekLogs.reduce((s: number, l: any) => s + (l.level || 3), 0) / thisWeekLogs.length) * 20)
    : 0;
  const consistencyDays = new Set(thisWeekLogs.map((l: any) => l.date ? new Date(l.date).toDateString() : null).filter(Boolean)).size;
  const totalPlannedThisWeek = Object.values(mealPlan || {}).reduce((s: number, meals: any) => s + (meals?.length || 0), 0);

  const handleSave = () => {
    if (!workedWell.trim() && !whatWasHard.trim() && !focusNext.trim()) {
      toast.error('Completa al menos un campo');
      return;
    }
    const entry: WeeklyEntry = {
      id: Date.now(),
      weekStart: weekStart.toISOString(),
      workedWell: workedWell.trim(),
      whatWasHard: whatWasHard.trim(),
      focusNextWeek: focusNext.trim(),
      avgVitality,
      mealsLogged: thisWeekLogs.length,
      consistencyDays,
    };
    setWeeklyEntries(prev => [entry, ...prev]);
    toast.success('¡Reflexión semanal guardada!');
    onBack();
  };

  const pastEntry = weeklyEntries[pastIndex];

  const vitalityLabel = (v: number) => v >= 75 ? '🟢 Alta' : v >= 50 ? '🟡 Media' : v > 0 ? '🔴 Baja' : '—';

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-surface-container-highest rounded-sm transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">RIAL</span>
          <h1 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">Reflexión Semanal</h1>
        </div>
      </div>

      {/* Toggle: current / history */}
      <div className="flex border border-outline-variant/20 rounded-sm overflow-hidden">
        <button
          onClick={() => setViewingPast(false)}
          className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest transition-colors ${!viewingPast ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setViewingPast(true)}
          className={`flex-1 py-3 font-headline text-xs font-bold uppercase tracking-widest transition-colors ${viewingPast ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'}`}
        >
          Historial ({weeklyEntries.length})
        </button>
      </div>

      {!viewingPast ? (
        <>
          {/* This week's stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 text-center">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-1">Vitalidad</span>
              <span className="font-headline font-black text-2xl text-primary">{avgVitality > 0 ? avgVitality : '—'}</span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">/100</span>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 text-center">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-1">Registros</span>
              <span className="font-headline font-black text-2xl text-brand-secondary">{thisWeekLogs.length}</span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">entradas RF</span>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-4 text-center">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mb-1">Consistencia</span>
              <span className="font-headline font-black text-2xl text-tertiary">{consistencyDays}/7</span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block mt-1">días</span>
            </div>
          </div>

          {/* Reflection fields */}
          <div className="space-y-4">
            <div>
              <label className="font-headline text-xs font-bold uppercase tracking-widest text-primary block mb-2">
                ✅ ¿Qué funcionó bien esta semana?
              </label>
              <textarea
                value={workedWell}
                onChange={e => setWorkedWell(e.target.value)}
                placeholder="Ej. Comí proteína en todas las comidas, dormí mejor..."
                rows={3}
                className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="font-headline text-xs font-bold uppercase tracking-widest text-error block mb-2">
                🔴 ¿Qué fue difícil?
              </label>
              <textarea
                value={whatWasHard}
                onChange={e => setWhatWasHard(e.target.value)}
                placeholder="Ej. Mucho estrés laboral, no planifiqué bien las cenas..."
                rows={3}
                className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="font-headline text-xs font-bold uppercase tracking-widest text-brand-secondary block mb-2">
                🎯 Enfoque de la próxima semana
              </label>
              <textarea
                value={focusNext}
                onChange={e => setFocusNext(e.target.value)}
                placeholder="Ej. Preparar comidas los domingos, beber 2L de agua al día..."
                rows={3}
                className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm font-body focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Guardar Reflexión
          </button>
        </>
      ) : (
        /* Past entries */
        <div className="space-y-6">
          {weeklyEntries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-on-surface-variant font-body">Aún no tienes reflexiones guardadas.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPastIndex(Math.min(pastIndex + 1, weeklyEntries.length - 1))}
                  disabled={pastIndex >= weeklyEntries.length - 1}
                  className="w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                  Semana del {new Date(pastEntry.weekStart).toLocaleDateString()}
                </span>
                <button
                  onClick={() => setPastIndex(Math.max(pastIndex - 1, 0))}
                  disabled={pastIndex <= 0}
                  className="w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">Vitalidad</span>
                  <span className="font-headline font-black text-xl text-primary">{pastEntry.avgVitality}</span>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">Registros</span>
                  <span className="font-headline font-black text-xl text-brand-secondary">{pastEntry.mealsLogged}</span>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 text-center">
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant block">Días</span>
                  <span className="font-headline font-black text-xl text-tertiary">{pastEntry.consistencyDays}/7</span>
                </div>
              </div>

              {pastEntry.workedWell && (
                <div className="bg-surface-container-low border border-primary/20 rounded-sm p-4">
                  <p className="font-label text-[9px] uppercase tracking-widest text-primary mb-2">✅ Funcionó bien</p>
                  <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.workedWell}</p>
                </div>
              )}
              {pastEntry.whatWasHard && (
                <div className="bg-surface-container-low border border-error/20 rounded-sm p-4">
                  <p className="font-label text-[9px] uppercase tracking-widest text-error mb-2">🔴 Fue difícil</p>
                  <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.whatWasHard}</p>
                </div>
              )}
              {pastEntry.focusNextWeek && (
                <div className="bg-surface-container-low border border-brand-secondary/20 rounded-sm p-4">
                  <p className="font-label text-[9px] uppercase tracking-widest text-brand-secondary mb-2">🎯 Foco</p>
                  <p className="text-sm text-on-surface font-body leading-relaxed">{pastEntry.focusNextWeek}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
