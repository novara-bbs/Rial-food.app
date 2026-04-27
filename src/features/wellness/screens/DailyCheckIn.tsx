import { Zap, CheckCircle, Battery, AlertTriangle, Moon, Activity } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useState } from 'react';
import { useI18n } from '../../../i18n';
import PageHeader from '../../../components/patterns/PageHeader';
import { Heading } from '@/components/ui/Typography';

export default function DailyCheckIn({
  initialStatus,
  onBack,
  onComplete,
  presentation = 'route',
}: {
  initialStatus: string | null;
  onBack: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete?: (data: any) => void;
  presentation?: 'sheet' | 'route';
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [sleep, setSleep] = useState<number>(7);
  const [stress, setStress] = useState<number>(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const availableSymptoms = [
    t.checkIn.symptomsList.bloating, t.checkIn.symptomsList.brainFog, t.checkIn.symptomsList.jointPain,
    t.checkIn.symptomsList.lethargy, t.checkIn.symptomsList.cravings, t.checkIn.symptomsList.headache,
  ];

  const toggleSymptom = (symptom: string) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const body = (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section>
          <Heading level="h3" className="text-body-lg tracking-tight mb-4">{t.checkIn.generalStatus}</Heading>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" 
              onClick={() => setStatus('optimal')}
              className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                status === 'optimal' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-primary/50'
              }`}
            >
              <Zap className="w-6 h-6" />
              <span className="font-label text-micro font-bold tracking-widest uppercase">{t.checkIn.optimal}</span>
              <span className="text-micro text-center opacity-80 leading-tight">{t.checkIn.highEnergy}</span>
            </button>
            <button type="button" 
              onClick={() => setStatus('stable')}
              className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                status === 'stable' 
                  ? 'border-on-surface-variant bg-surface-container-highest text-tertiary' 
                  : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-on-surface-variant/50'
              }`}
            >
              <CheckCircle className="w-6 h-6" />
              <span className="font-label text-micro font-bold tracking-widest uppercase">{t.checkIn.good}</span>
              <span className="text-micro text-center opacity-80 leading-tight">{t.checkIn.feelingNormal}</span>
            </button>
            <button type="button" 
              onClick={() => setStatus('sluggish')}
              className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                status === 'sluggish' 
                  ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary' 
                  : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-brand-secondary/50'
              }`}
            >
              <Battery className="w-6 h-6" />
              <span className="font-label text-micro font-bold tracking-widest uppercase">{t.checkIn.tired}</span>
              <span className="text-micro text-center opacity-80 leading-tight">{t.checkIn.lowEnergy}</span>
            </button>
            <button type="button" 
              onClick={() => setStatus('bloated')}
              className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                status === 'bloated' 
                  ? 'border-error bg-error/10 text-error' 
                  : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-error/50'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="font-label text-micro font-bold tracking-widest uppercase">{t.checkIn.bad}</span>
              <span className="text-micro text-center opacity-80 leading-tight">{t.checkIn.painBloating}</span>
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <Heading level="h3" className="text-body-lg tracking-tight flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" /> {t.checkIn.sleepDuration}
            </Heading>
            <span className="font-headline text-title font-bold text-primary">{sleep}h</span>
          </div>
          <input 
            type="range" 
            min="3" 
            max="12" 
            step="0.5"
            value={sleep} 
            onChange={(e) => setSleep(parseFloat(e.target.value))}
            className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-on-surface-variant mt-2 font-label tracking-widest uppercase">
            <span>3h</span>
            <span>12h</span>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <Heading level="h3" className="text-body-lg tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-error" /> {t.checkIn.dailyEffort}
            </Heading>
            <span className="font-headline text-title font-bold text-error">{stress}/10</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={stress} 
            onChange={(e) => setStress(parseInt(e.target.value))}
            className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-error"
          />
          <div className="flex justify-between text-xs text-on-surface-variant mt-2 font-label tracking-widest uppercase">
            <span>{t.checkIn.low}</span>
            <span>{t.checkIn.high}</span>
          </div>
        </section>

        <section>
          <Heading level="h3" className="text-body-lg tracking-tight mb-4">{t.checkIn.specificSymptoms}</Heading>
          <div className="flex flex-wrap gap-3">
            {availableSymptoms.map(sym => (
              <button type="button" 
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className={`px-4 py-2 rounded-full font-label text-micro font-bold tracking-wider uppercase transition-colors border ${
                  symptoms.includes(sym)
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </section>

        <button type="button" 
          disabled={!status}
          onClick={() => {
            if (onComplete && status) {
              onComplete({ status, sleep, stress, symptoms });
            } else {
              onBack();
            }
          }}
          className={`w-full py-4 rounded-sm font-headline font-bold text-body-lg uppercase tracking-widest transition-colors mt-8 ${
            status 
              ? 'bg-primary text-on-primary hover:bg-primary-container' 
              : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
          }`}
        >
          {t.checkIn.register}
        </button>
    </div>
  );

  if (presentation === 'sheet') {
    return (
      <BottomSheet
        open={true}
        onOpenChange={v => { if (!v) onBack(); }}
        title={t.checkIn.morningReport}
        size="focus"
        headerLayout="back-title-action"
        onBack={onBack}
      >
        {body}
      </BottomSheet>
    );
  }

  return (
    <PageShell maxWidth="default" spacing="lg">
      <PageHeader onBack={onBack} label={t.checkIn.title} title={t.checkIn.morningReport} />
      {body}
    </PageShell>
  );
}
