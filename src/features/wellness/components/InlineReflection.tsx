import { CheckCircle2, XCircle, Target, ChevronDown, ChevronUp } from 'lucide-react';

interface WeeklyEntry {
  workedWell: string;
  whatWasHard: string;
}

interface InlineReflectionProps {
  latestEntry: WeeklyEntry | undefined;
  reflectionOpen: boolean;
  onToggle: () => void;
  workedWell: string;
  setWorkedWell: (v: string) => void;
  whatWasHard: string;
  setWhatWasHard: (v: string) => void;
  focusNext: string;
  setFocusNext: (v: string) => void;
  onSave: () => void;
  onNavigateHistory: () => void;
  t: {
    reflectionTitle?: string;
    noReflections?: string;
    viewHistory?: string;
  };
  tWeekly: {
    workedWellLabel?: string;
    workedWellPlaceholder?: string;
    whatWasHardLabel?: string;
    whatWasHardPlaceholder?: string;
    focusNextLabel?: string;
    focusNextPlaceholder?: string;
    saveReflection?: string;
  };
}

export default function InlineReflection({
  latestEntry, reflectionOpen, onToggle, workedWell, setWorkedWell, whatWasHard, setWhatWasHard,
  focusNext, setFocusNext, onSave, onNavigateHistory, t, tWeekly,
}: InlineReflectionProps) {
  return (
    <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-tertiary flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          {t.reflectionTitle || 'Reflexión Semanal'}
        </h2>
        {reflectionOpen
          ? <ChevronUp className="w-4 h-4 text-on-surface-variant" />
          : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
      </button>

      {/* Collapsed: show latest excerpt */}
      {!reflectionOpen && latestEntry && (
        <div className="text-xs text-on-surface-variant leading-relaxed">
          {latestEntry.workedWell && <p className="truncate">✅ {latestEntry.workedWell}</p>}
          {latestEntry.whatWasHard && <p className="truncate">⚠️ {latestEntry.whatWasHard}</p>}
        </div>
      )}
      {!reflectionOpen && !latestEntry && (
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
          {t.noReflections || 'Sin reflexiones aún. Escribe tu primera.'}
        </p>
      )}

      {/* Expanded: reflection form */}
      {reflectionOpen && (
        <div className="space-y-3 pt-2 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="font-headline text-xs font-bold uppercase tracking-widest text-primary block mb-1.5">
              <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />
              {tWeekly.workedWellLabel || '¿Qué funcionó bien?'}
            </label>
            <textarea
              value={workedWell}
              onChange={e => setWorkedWell(e.target.value)}
              placeholder={tWeekly.workedWellPlaceholder || 'Ej. Comí proteína en todas las comidas...'}
              rows={2}
              className="w-full p-3 bg-surface-container-highest border border-outline-variant/20 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="font-headline text-xs font-bold uppercase tracking-widest text-error block mb-1.5">
              <XCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
              {tWeekly.whatWasHardLabel || '¿Qué fue difícil?'}
            </label>
            <textarea
              value={whatWasHard}
              onChange={e => setWhatWasHard(e.target.value)}
              placeholder={tWeekly.whatWasHardPlaceholder || 'Ej. No planifiqué bien las cenas...'}
              rows={2}
              className="w-full p-3 bg-surface-container-highest border border-outline-variant/20 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="font-headline text-xs font-bold uppercase tracking-widest text-brand-secondary block mb-1.5">
              <Target className="w-3 h-3 inline mr-1 -mt-0.5" />
              {tWeekly.focusNextLabel || 'Foco próxima semana'}
            </label>
            <textarea
              value={focusNext}
              onChange={e => setFocusNext(e.target.value)}
              placeholder={tWeekly.focusNextPlaceholder || 'Ej. Preparar comidas los domingos...'}
              rows={2}
              className="w-full p-3 bg-surface-container-highest border border-outline-variant/20 rounded-sm text-on-surface placeholder:text-on-surface-variant text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onSave}
              className="flex-1 py-3 bg-primary text-on-primary rounded-sm font-headline font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              {tWeekly.saveReflection || 'Guardar'}
            </button>
            <button type="button"
              onClick={onNavigateHistory}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              {t.viewHistory || 'Historial →'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
