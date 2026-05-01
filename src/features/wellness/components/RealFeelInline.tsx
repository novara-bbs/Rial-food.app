import { useState, useEffect } from 'react';
import { X, Zap, Leaf, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../../i18n';
import { Heading } from '@/components/ui/Typography';
import type { RealFeelEntry, EnergySignal, DigestionSignal, MindsetSignal } from '../../../types/wellness';

// Re-export so existing callers that imported from this file keep working.
export type { RealFeelEntry } from '../../../types/wellness';

const EMOJIS = [
  { level: 1, emoji: '😴', key: 'terrible' },
  { level: 2, emoji: '😕', key: 'bad' },
  { level: 3, emoji: '😐', key: 'neutral' },
  { level: 4, emoji: '😊', key: 'good' },
  { level: 5, emoji: '💪', key: 'great' },
];

const TAG_KEYS = ['bloating', 'energy', 'heaviness', 'lightness', 'clarity', 'drowsiness', 'cramps', 'headache'] as const;

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
    <button type="button"
      onClick={onClick}
      className={`flex-1 py-2 text-micro font-semibold uppercase tracking-wider rounded-sm border transition-all ${
        active ? `${color} border-transparent` : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-surface-container-low border border-primary/30 rounded-sm p-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h3" variant="overline" className="text-body-sm text-primary">
          {t.realFeel.howDoYouFeel}
        </Heading>
        <button type="button" onClick={() => { setVisible(false); onDismiss(); }} className="text-on-surface-variant hover:text-primary transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Emoji selector */}
      <div className="flex justify-between gap-2 mb-4">
        {EMOJIS.map(e => (
          <Button
            key={e.level}
            variant="ghost"
            onClick={() => setSelectedLevel(e.level)}
            className={`flex-1 flex-col gap-1.5 py-3 h-auto rounded-sm border transition-all ${
              selectedLevel === e.level
                ? 'border-primary bg-primary/10 scale-110 hover:bg-primary/15'
                : 'border-outline-variant/20 bg-surface-container hover:border-primary/50'
            }`}
          >
            <span className="text-2xl">{e.emoji}</span>
            <span className="text-micro font-label uppercase tracking-wider text-on-surface-variant">
              {(t.realFeel.levels as Record<string, string>)[e.key]}
            </span>
          </Button>
        ))}
      </div>

      {/* Structured signals + tags (shown after emoji selection) */}
      {selectedLevel !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
          {/* Energy */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-micro font-semibold uppercase tracking-widest text-on-surface-variant">{t.realFeel.energy}</span>
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
              <span className="text-micro font-semibold uppercase tracking-widest text-on-surface-variant">{t.realFeel.digestion}</span>
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
              <span className="text-micro font-semibold uppercase tracking-widest text-on-surface-variant">{t.realFeel.mindset}</span>
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
                <button type="button"
                  key={key}
                  onClick={() => toggleTag(key)}
                  className={`inline-flex items-center min-h-[22px] px-2.5 rounded-full text-nano font-medium normal-case tracking-normal border transition-all ${
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

          <Button onClick={handleSubmit} className="w-full py-3">
            ✓ {t.common.done}
          </Button>
        </div>
      )}
    </div>
  );
}
