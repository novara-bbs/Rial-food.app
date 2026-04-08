import { ArrowLeft, Zap, CheckCircle, Battery, AlertTriangle, Moon, Activity } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../i18n';

export default function DailyCheckIn({ initialStatus, onBack, onComplete }: { initialStatus: string | null, onBack: () => void, onComplete?: (data: any) => void }) {
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

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-tertiary hover:bg-surface-container-highest transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="font-label text-xs tracking-[0.2em] text-primary uppercase block">{t.checkIn.title}</span>
          <h2 className="font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary">{t.checkIn.morningReport}</h2>
        </div>
      </header>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section>
          <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary mb-4">Estado General</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setStatus('optimal')}
              className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                status === 'optimal' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-primary/50'
              }`}
            >
              <Zap className="w-6 h-6" />
              <span className="font-label text-xs font-bold tracking-widest uppercase">Genial</span>
              <span className="text-[10px] text-center opacity-80 leading-tight">Alta Energía</span>
            </button>
            <button 
              onClick={() => setStatus('stable')}
              className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                status === 'stable' 
                  ? 'border-on-surface-variant bg-surface-container-highest text-tertiary' 
                  : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-on-surface-variant/50'
              }`}
            >
              <CheckCircle className="w-6 h-6" />
              <span className="font-label text-xs font-bold tracking-widest uppercase">Bien</span>
              <span className="text-[10px] text-center opacity-80 leading-tight">Sintiéndome Normal</span>
            </button>
            <button 
              onClick={() => setStatus('sluggish')}
              className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                status === 'sluggish' 
                  ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary' 
                  : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-brand-secondary/50'
              }`}
            >
              <Battery className="w-6 h-6" />
              <span className="font-label text-xs font-bold tracking-widest uppercase">Cansado</span>
              <span className="text-[10px] text-center opacity-80 leading-tight">Baja Energía</span>
            </button>
            <button 
              onClick={() => setStatus('bloated')}
              className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                status === 'bloated' 
                  ? 'border-error bg-error/10 text-error' 
                  : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-error/50'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="font-label text-xs font-bold tracking-widest uppercase">Mal</span>
              <span className="text-[10px] text-center opacity-80 leading-tight">Dolores o Hinchazón</span>
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" /> Duración del Sueño
            </h3>
            <span className="font-headline text-2xl font-bold text-primary">{sleep}h</span>
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
            <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary flex items-center gap-2">
              <Activity className="w-5 h-5 text-error" /> Esfuerzo Diario
            </h3>
            <span className="font-headline text-2xl font-bold text-error">{stress}/10</span>
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
            <span>Bajo</span>
            <span>Alto</span>
          </div>
        </section>

        <section>
          <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary mb-4">Síntomas Específicos</h3>
          <div className="flex flex-wrap gap-3">
            {availableSymptoms.map(sym => (
              <button 
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className={`px-4 py-2 rounded-full font-label text-xs font-bold tracking-wider uppercase transition-colors border ${
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

        <button 
          disabled={!status}
          onClick={() => {
            if (onComplete && status) {
              onComplete({ status, sleep, stress, symptoms });
            } else {
              onBack();
            }
          }}
          className={`w-full py-4 rounded-sm font-headline font-bold text-lg uppercase tracking-widest transition-colors mt-8 ${
            status 
              ? 'bg-primary text-on-primary hover:bg-primary-container' 
              : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
          }`}
        >
          Registrar
        </button>
      </div>
    </div>
  );
}
