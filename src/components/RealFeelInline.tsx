import { useState, useEffect } from 'react';
import { X, Zap, Leaf, Brain } from 'lucide-react';
import { useI18n } from '../i18n';

const EMOJIS = [
  { level: 1, emoji: '😴', key: 'terrible' },
  { level: 2, emoji: '😕', key: 'bad' },
  { level: 3, emoji: '😐', key: 'neutral' },
  { level: 4, emoji: '😊', key: 'good' },
  { level: 5, emoji: '💪', key: 'great' },
];

const TAG_KEYS = ['bloating', 'energy', 'heaviness', 'lightness', 'clarity', 'drowsiness', 'cramps', 'headache'] as const;

type EnergySignal = 'high' | 'stable' | 'low';
type DigestionSignal = 'clean' | 'sensitive' | 'bloated';
type MindsetSignal = 'calm' | 'balanced' | 'stressed';

export interface RealFeelEntry {
  level: number;
  tags: string[];
  note?: string;
  energy?: EnergySignal;
  digestion?: DigestionSignal;
  mindset?: MindsetSignal;
}

export default function RealFeelInline({ onSubmit, onDismiss }: {
  onSubmit: (entry: RealFeelEntry) => void;
  onDismiss: () => void;
}) {
  const { t } = useI18n();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [energy, setEnergy] = useState<EnergySignal | null>(null);
  const [digestion, setDigestion] = useState<DigestionSignal | null>(null);
  const [mindset, setMindset] = useState<MindsetSignal | null>(null);
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 60 seconds if ignored
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 60000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  const handleSubmit = () => {
    if (selectedLevel === null) return;
    onSubmit({
      level: selectedLevel,
      tags: selectedTags,
      energy: energy ?? undefined,
      digestion: digestion ?? undefined,
      mindset: mindset ?? undefined,
    });
    setVisible(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const tagLabels: Record<string, string> = {
    bloating: t.realFeel.tags.bloating,
    energy: t.realFeel.tags.energy,
    heaviness: t.realFeel.tags.heaviness,
    lightness: t.realFeel.tags.lightness,
    clarity: t.realFeel.tags.clarity,
    drowsiness: t.realFeel.tags.drowsiness,
    cramps: t.realFeel.tags.cramps,
    headache: t.realFeel.tags.headache,
  };

  const signalBtn = (
    active: boolean,
    onClick: () => void,
    label: string,
    color: string
  ) => (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-all ${
        active ? `${color} border-transparent` : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-surface-container-low border border-primary/30 rounded-2xl p-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-primary">
          {t.realFeel.howDoYouFeel}
        </h3>
        <button onClick={() => { setVisible(false); onDismiss(); }} className="text-on-surface-variant hover:text-primary transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Emoji selector */}
      <div className="flex justify-between gap-2 mb-4">
        {EMOJIS.map(e => (
          <button
            key={e.level}
            onClick={() => setSelectedLevel(e.level)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-sm border transition-all ${
              selectedLevel === e.level
                ? 'border-primary bg-primary/10 scale-110'
                : 'border-outline-variant/20 bg-surface-container hover:border-primary/50'
            }`}
          >
            <span className="text-2xl">{e.emoji}</span>
            <span className="text-[8px] font-label uppercase tracking-wider text-on-surface-variant">
              {(t.realFeel.levels as any)[e.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Structured signals + tags (shown after emoji selection) */}
      {selectedLevel !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
          {/* Energy */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{t.realFeel.energy}</span>
            </div>
            <div className="flex gap-1.5">
              {signalBtn(energy === 'high', () => setEnergy(energy === 'high' ? null : 'high'), t.realFeel.signals.energyHigh, 'bg-primary/20 text-primary')}
              {signalBtn(energy === 'stable', () => setEnergy(energy === 'stable' ? null : 'stable'), t.realFeel.signals.energyStable, 'bg-brand-secondary/20 text-brand-secondary')}
              {signalBtn(energy === 'low', () => setEnergy(energy === 'low' ? null : 'low'), t.realFeel.signals.energyLow, 'bg-on-surface-variant/20 text-on-surface-variant')}
            </div>
          </div>

          {/* Digestion */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Leaf className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{t.realFeel.digestion}</span>
            </div>
            <div className="flex gap-1.5">
              {signalBtn(digestion === 'clean', () => setDigestion(digestion === 'clean' ? null : 'clean'), t.realFeel.signals.digestionClean, 'bg-primary/20 text-primary')}
              {signalBtn(digestion === 'sensitive', () => setDigestion(digestion === 'sensitive' ? null : 'sensitive'), t.realFeel.signals.digestionSensitive, 'bg-brand-secondary/20 text-brand-secondary')}
              {signalBtn(digestion === 'bloated', () => setDigestion(digestion === 'bloated' ? null : 'bloated'), t.realFeel.signals.digestionBloated, 'bg-error/20 text-error')}
            </div>
          </div>

          {/* Mindset */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Brain className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{t.realFeel.mindset}</span>
            </div>
            <div className="flex gap-1.5">
              {signalBtn(mindset === 'calm', () => setMindset(mindset === 'calm' ? null : 'calm'), t.realFeel.signals.mindsetCalm, 'bg-primary/20 text-primary')}
              {signalBtn(mindset === 'balanced', () => setMindset(mindset === 'balanced' ? null : 'balanced'), t.realFeel.signals.mindsetBalanced, 'bg-brand-secondary/20 text-brand-secondary')}
              {signalBtn(mindset === 'stressed', () => setMindset(mindset === 'stressed' ? null : 'stressed'), t.realFeel.signals.mindsetStressed, 'bg-error/20 text-error')}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {TAG_KEYS.map(key => {
              const selected = selectedTags.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleTag(key)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {tagLabels[key]}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            ✓ {t.common.done}
          </button>
        </div>
      )}
    </div>
  );
}
