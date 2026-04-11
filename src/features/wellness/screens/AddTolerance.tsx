import { Search, Plus, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n';
import PageHeader from '../../../components/patterns/PageHeader';

export default function AddTolerance({ onBack, onAddLog }: { onBack: () => void, onAddLog?: (log: any) => void }) {
  const { t } = useI18n();
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [toleranceLevel, setToleranceLevel] = useState<'optimal' | 'neutral' | 'inflammation' | null>(null);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const symptomKeys = ['bloating', 'brainFog', 'jointPain', 'fatigue', 'rash', 'headache', 'indigestion', 'musclePain', 'anxiety', 'insomnia'] as const;

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]);
  };

  const recentIngredients = ['Whey Protein', 'Steel Cut Oats', 'Almond Butter', 'Greek Yogurt', 'Quinoa'];
  const displayIngredients = searchQuery.trim()
    ? recentIngredients.filter(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
    : recentIngredients;

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
      <PageHeader onBack={onBack} label={t.tolerance.biometricLog} title={t.tolerance.title} />

      {!selectedIngredient ? (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.tolerance.searchIngredient}
              className="w-full bg-surface-container-low border border-outline-variant/30 py-4 pl-12 pr-4 text-sm font-label tracking-widest focus:outline-none focus:border-primary uppercase rounded-sm text-tertiary placeholder:text-on-surface-variant/50"
            />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-on-surface-variant mb-4 border-b border-outline-variant/20 pb-2">{t.tolerance.recentIngredients}</h3>
            <div className="space-y-2">
              {displayIngredients.map((ing, idx) => (
                <button key={idx} onClick={() => setSelectedIngredient(ing)} className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-sm border border-outline-variant/20 hover:border-primary/30 transition-colors text-left group">
                  <span className="font-headline font-bold text-base uppercase text-tertiary">{ing}</span>
                  <Plus className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                </button>
              ))}
              {displayIngredients.length === 0 && searchQuery.trim() && (
                <button onClick={() => setSelectedIngredient(searchQuery)} className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-sm border border-primary/50 hover:bg-primary/10 transition-colors text-left">
                  <span className="font-headline font-bold text-base uppercase text-primary">+ "{searchQuery}"</span>
                  <Plus className="w-5 h-5 text-primary" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20 flex justify-between items-center">
            <span className="font-headline font-bold text-lg uppercase text-tertiary">{selectedIngredient}</span>
            <button onClick={() => setSelectedIngredient(null)} className="text-xs font-label font-bold tracking-widest uppercase text-primary hover:underline">{t.common.edit}</button>
          </div>

          <section>
            <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary mb-4">{t.tolerance.toleranceLevel}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'optimal' as const, icon: CheckCircle2, label: t.tolerance.levels.optimal, activeClass: 'border-primary bg-primary/10 text-primary' },
                { key: 'neutral' as const, icon: Activity, label: t.tolerance.levels.neutral, activeClass: 'border-on-surface-variant bg-surface-container-highest text-tertiary' },
                { key: 'inflammation' as const, icon: AlertCircle, label: t.tolerance.levels.inflammation, activeClass: 'border-error bg-error/10 text-error' },
              ].map(level => {
                const Icon = level.icon;
                return (
                  <button key={level.key} onClick={() => setToleranceLevel(level.key)}
                    className={`p-4 rounded-sm border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      toleranceLevel === level.key ? level.activeClass : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-primary/50'
                    }`}>
                    <Icon className="w-8 h-8" />
                    <span className="font-label text-xs font-bold tracking-widest uppercase">{level.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary mb-4">{t.checkIn.symptoms}</h3>
            <div className="flex flex-wrap gap-2">
              {symptomKeys.map(key => {
                const label = (t.checkIn.symptomsList as Record<string, string>)[key] || key;
                return (
                  <button key={key} onClick={() => toggleSymptom(label)}
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all border ${
                      selectedSymptoms.includes(label) ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary/30'
                    }`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="font-headline text-lg font-bold tracking-tight uppercase text-tertiary mb-4">{t.common.notes}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.createPost.placeholder}
              className="w-full h-32 bg-surface-container-low border border-outline-variant/30 p-4 text-sm font-body focus:outline-none focus:border-primary rounded-sm text-tertiary placeholder:text-on-surface-variant/50 resize-none"
            />
          </section>

          <button
            disabled={!toleranceLevel}
            onClick={() => {
              if (onAddLog && selectedIngredient && toleranceLevel) {
                onAddLog({ ingredient: selectedIngredient, level: toleranceLevel, symptoms: selectedSymptoms, notes });
              } else {
                onBack();
              }
            }}
            className={`w-full py-4 rounded-sm font-headline font-bold text-lg uppercase tracking-widest transition-colors ${
              toleranceLevel ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
            }`}
          >
            {t.common.save}
          </button>
        </div>
      )}
    </div>
  );
}
