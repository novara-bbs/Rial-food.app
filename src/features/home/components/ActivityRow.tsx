import { Footprints, Activity, Dumbbell, Link2 } from 'lucide-react';
import { useState } from 'react';
import SectionCard from '../../../components/SectionCard';
import { useI18n } from '../../../i18n';

interface ActivityRowProps {
  movement: { steps: number; target: number; activeMinutes: number; activeTarget: number };
  setMovement?: (m: any) => void;
  isTrainingDay: boolean;
  setIsTrainingDay: (v: boolean) => void;
}

export default function ActivityRow({ movement, setMovement, isTrainingDay, setIsTrainingDay }: ActivityRowProps) {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);

  // Empty state: no movement data at all → nudge to connect a health source.
  // Stub CTA (no handler yet) — Apple Health / Google Fit wiring is a separate
  // Capacitor sprint. Manual edit still available via the "Editar" button.
  const isDisconnected = movement.steps === 0 && movement.activeMinutes === 0;

  return (
    <SectionCard padding="md" spacing="lg">
      {isDisconnected && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-sm p-3 min-h-11 hover:bg-primary/10 transition-colors"
        >
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <span className="font-label text-micro uppercase tracking-widest text-primary font-bold block">
              {t.home.connectHealth ?? 'Conectar Apple Health / Google Fit'}
            </span>
            <span className="text-micro text-on-surface-variant block">
              {t.home.orLogManually ?? 'O registra manualmente'}
            </span>
          </div>
        </button>
      )}

      {/* Steps + Active minutes */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Footprints className="w-5 h-5 text-primary" />
          <div>
            <span className="font-headline font-bold text-sm uppercase text-tertiary tracking-widest">{movement.steps} / {movement.target}</span>
            <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block">{t.home.stepsLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-brand-secondary" />
            <span className="text-xs font-bold text-tertiary">{movement.activeMinutes}{t.home.activeMinLabel}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="min-h-11 px-3 text-micro text-primary hover:underline font-bold uppercase tracking-widest"
          >
            {isEditing ? t.home.close : t.home.edit}
          </button>
        </div>
      </div>

      {/* Steps progress bar */}
      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min((movement.steps / movement.target) * 100, 100)}%` }} />
      </div>

      {/* Training day toggle */}
      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          <span className="font-headline text-xs font-bold uppercase text-tertiary tracking-wider">
            {isTrainingDay ? t.home.trainingDay : t.home.restDay}
          </span>
        </div>
        <button type="button"
          onClick={() => setIsTrainingDay(!isTrainingDay)}
          className={`relative w-12 h-6 rounded-full transition-colors ${isTrainingDay ? 'bg-primary' : 'bg-surface-container-highest'}`}
          aria-label={isTrainingDay ? (t.home.restDay ?? 'Rest day') : (t.home.trainingDay ?? 'Training day')}
          aria-pressed={isTrainingDay}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-on-primary shadow transition-transform ${isTrainingDay ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Edit panel */}
      {isEditing && (
        <div className="pt-3 border-t border-outline-variant/10 animate-in fade-in slide-in-from-top-2 space-y-3">
          <div>
            <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block mb-2">{t.home.addSteps}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMovement && setMovement({ ...movement, steps: movement.steps + 500 })} className="flex-1 bg-surface-container-highest min-h-11 rounded text-xs font-bold text-tertiary">+500</button>
              <button type="button" onClick={() => setMovement && setMovement({ ...movement, steps: movement.steps + 1000 })} className="flex-1 bg-surface-container-highest min-h-11 rounded text-xs font-bold text-tertiary">+1000</button>
            </div>
          </div>
          <div>
            <span className="font-label text-micro uppercase tracking-widest text-on-surface-variant block mb-2">{t.home.addActiveMin}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMovement && setMovement({ ...movement, activeMinutes: movement.activeMinutes + 10 })} className="flex-1 bg-surface-container-highest min-h-11 rounded text-xs font-bold text-tertiary">+10m</button>
              <button type="button" onClick={() => setMovement && setMovement({ ...movement, activeMinutes: movement.activeMinutes + 30 })} className="flex-1 bg-surface-container-highest min-h-11 rounded text-xs font-bold text-tertiary">+30m</button>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
