import { Sparkles, CheckCircle2 } from 'lucide-react';
import type { Translations } from '../../../i18n';

export interface GuidedStep {
  id: string;
  label: string;
  done: boolean;
  action?: () => void;
}

export interface GuidedSetupSectionProps {
  steps: GuidedStep[];
  onDismiss: () => void;
  t: Translations;
}

export default function GuidedSetupSection({ steps, onDismiss, t }: GuidedSetupSectionProps) {
  const completed = steps.filter((s) => s.done).length;

  return (
    <section className="bg-surface-container-low border border-primary/20 p-4 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-headline font-bold text-body-sm uppercase tracking-widest text-tertiary">{t.guidedSetup.title}</span>
        </div>
        <span className="font-mono text-micro text-primary font-bold">{completed}/{steps.length}</span>
      </div>
      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(completed / steps.length) * 100}%` }} />
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <button
            type="button"
            key={step.id}
            onClick={step.done ? undefined : step.action}
            disabled={step.done}
            className={`w-full flex items-center gap-3 text-left min-h-11 px-3 rounded-sm transition-colors ${step.done ? 'opacity-60' : 'hover:bg-surface-container-highest cursor-pointer'}`}
          >
            {step.done ? (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-outline-variant/40 shrink-0" />
            )}
            <span className={`text-label font-bold uppercase tracking-widest ${step.done ? 'text-on-surface-variant line-through' : 'text-tertiary'}`}>{step.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="w-full text-center text-micro font-bold text-on-surface-variant uppercase tracking-widest hover:underline min-h-11 pt-1"
      >
        {t.guidedSetup.dismiss}
      </button>
    </section>
  );
}

export const GUIDED_DISMISSED_KEY = 'rial_guidedSetupDismissed';
