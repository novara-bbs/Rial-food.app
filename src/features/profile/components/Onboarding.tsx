import { useState } from 'react';
import { ArrowLeft, Dumbbell, Flame, Scale, Heart, Users, ChevronRight, Check, PartyPopper, Target, Salad, Palette } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useTheme, PALETTES, type Palette as PaletteId } from '../../../contexts/ThemeContext';
import { PALETTE_SWATCH_COLORS } from '@/config/theme-previews';
import { calculateDailyTargets, calculateDailyTargetsWithBreakdown, type Goal } from '../../food/utils/nutrition';
import KcalBreakdownCard from './KcalBreakdownCard';
import { getBodyWeightUnit, getHeightUnit } from '../../food/utils/units';
import { INPUT_SURFACE_CLASSES } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import SectionCard from '../../../components/SectionCard';
import OnboardingScaffold from './OnboardingScaffold';
import RadioCardGroup, { type RadioCardOption } from '@/components/ui/RadioCardGroup';

interface OnboardingData {
  goal: string;
  name: string;
  weight: number;
  height: number;
  age: number;
  sex: 'male' | 'female';
  activity: 'sedentary' | 'light' | 'active' | 'veryActive';
  trains: boolean;
  restrictions: string[];
}

const DEFAULT_DATA: OnboardingData = {
  goal: 'maintain', name: '', weight: 70, height: 170, age: 30, sex: 'male',
  activity: 'active', trains: false, restrictions: [],
};

export default function Onboarding({ isOpen, onClose, onComplete }: {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: {
    userProfile: { name: string; age: number; height: number; weight: number; gender: string; goal: string; activity: string; trains: boolean; dietaryPreferences: string[] };
    targets: { cal: number; pro: number; carbs: number; fats: number };
    initialWeightKg?: number;
  }) => void;
}) {
  const { t } = useI18n();
  const { palette, resolvedMode, setPalette } = useTheme();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);

  const paletteLabels: Record<PaletteId, { label: string; desc: string }> = {
    neutral: { label: t.settings.paletteNeutral, desc: t.settings.paletteNeutralDesc },
    volt:    { label: t.settings.paletteVolt,    desc: t.settings.paletteVoltDesc    },
    ocean:   { label: t.settings.paletteOcean,   desc: t.settings.paletteOceanDesc   },
    ember:   { label: t.settings.paletteEmber,   desc: t.settings.paletteEmberDesc   },
  };

  const palettes = PALETTES.map(id => ({
    id,
    ...paletteLabels[id],
    ...PALETTE_SWATCH_COLORS[id],
  }));

  if (!isOpen) return null;

  const targets = calculateDailyTargets(data.weight, data.height, data.age, data.sex, data.activity, (data.goal || 'maintain') as Goal);
  const breakdown = calculateDailyTargetsWithBreakdown(data.weight, data.height, data.age, data.sex, data.activity, (data.goal || 'maintain') as Goal, data.trains);

  const handleFinish = () => {
    onComplete?.({
      userProfile: {
        name: data.name,
        age: data.age,
        height: data.height,
        weight: data.weight,
        gender: data.sex,
        goal: data.goal,
        activity: data.activity,
        trains: data.trains,
        dietaryPreferences: data.restrictions,
      },
      targets: { cal: targets.cal, pro: targets.pro, carbs: targets.carbs, fats: targets.fats },
      // Seed initial weightHistory so Progress chart has a baseline from day 1
      initialWeightKg: data.weight,
    });
    onClose();
  };

  const goalOptions: RadioCardOption<string>[] = [
    { id: 'muscle', label: t.onboarding.goals.muscle, icon: Dumbbell, iconClassName: 'text-blue-400' },
    { id: 'cut', label: t.onboarding.goals.cut, icon: Flame, iconClassName: 'text-orange-400' },
    { id: 'maintain', label: t.onboarding.goals.maintain, icon: Scale, iconClassName: 'text-green-400' },
    { id: 'health', label: t.onboarding.goals.health, icon: Heart, iconClassName: 'text-pink-400' },
    { id: 'family', label: t.onboarding.goals.family, icon: Users, iconClassName: 'text-purple-400' },
  ];

  const activityOptions: RadioCardOption<OnboardingData['activity']>[] = [
    { id: 'sedentary', label: t.onboarding.activity.sedentary },
    { id: 'light', label: t.onboarding.activity.light },
    { id: 'active', label: t.onboarding.activity.active },
    { id: 'veryActive', label: t.onboarding.activity.veryActive },
  ];

  const restrictions = [
    { id: 'vegetarian', label: t.onboarding.restrictions.vegetarian },
    { id: 'vegan', label: t.onboarding.restrictions.vegan },
    { id: 'glutenFree', label: t.onboarding.restrictions.glutenFree },
    { id: 'lactoseFree', label: t.onboarding.restrictions.lactoseFree },
    { id: 'keto', label: t.onboarding.restrictions.keto },
    { id: 'paleo', label: t.onboarding.restrictions.paleo },
    { id: 'mediterranean', label: t.onboarding.restrictions.mediterranean },
  ];

  const canNext = () => {
    if (step === 1) return !!data.goal;
    if (step === 2) return data.weight > 0 && data.height > 0 && data.age > 0;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-surface-container w-full max-w-lg max-h-[90dvh] rounded-sm border border-outline-variant/20 shadow-elev-3 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header with progress */}
        <div className="p-5 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center justify-between mb-3">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 p-1 -ml-1 text-on-surface-variant hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-xs font-label uppercase tracking-widest hidden sm:inline">{t.onboarding.back}</span>
              </button>
            ) : <div className="w-5" />}
            <h2 className="font-headline text-xl font-bold uppercase text-primary tracking-tight">RIAL</h2>
            <span className="font-mono text-xs text-on-surface-variant tracking-wider">{t.onboarding.stepCounter.replace('{current}', String(step)).replace('{total}', '6')}</span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-outline-variant/30'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: Goal */}
          {step === 1 && (
            <OnboardingScaffold
              title={t.onboarding.step1Title}
              subtitle={t.onboarding.step1Subtitle}
              heroSlot={<Target className="w-12 h-12 text-primary" aria-hidden="true" />}
            >
              <RadioCardGroup
                ariaLabel={t.onboarding.step1Title}
                options={goalOptions}
                value={data.goal}
                onChange={(id) => setData(d => ({ ...d, goal: id }))}
              />
            </OnboardingScaffold>
          )}

          {/* STEP 2: Body data */}
          {step === 2 && (
            <OnboardingScaffold title={t.onboarding.step2Title} subtitle={t.onboarding.step2Subtitle}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.name}</label>
                  <input type="text" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                    className={`${INPUT_SURFACE_CLASSES} w-full px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary`} placeholder="Vicente" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.weight} ({getBodyWeightUnit('metric')})</label>
                    <input type="number" step="0.1" inputMode="decimal" value={data.weight} onChange={e => setData(d => ({ ...d, weight: +e.target.value }))}
                      className={`${INPUT_SURFACE_CLASSES} w-full px-4 py-3 text-on-surface text-sm font-mono focus:outline-none focus:border-primary`} />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.height} ({getHeightUnit('metric')})</label>
                    <input type="number" step="0.1" inputMode="decimal" value={data.height} onChange={e => setData(d => ({ ...d, height: +e.target.value }))}
                      className={`${INPUT_SURFACE_CLASSES} w-full px-4 py-3 text-on-surface text-sm font-mono focus:outline-none focus:border-primary`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.age}</label>
                    <input type="number" value={data.age} onChange={e => setData(d => ({ ...d, age: +e.target.value }))}
                      className={`${INPUT_SURFACE_CLASSES} w-full px-4 py-3 text-on-surface text-sm font-mono focus:outline-none focus:border-primary`} />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.sex}</label>
                    <div className="flex gap-2">
                      {(['male', 'female'] as const).map(s => (
                        <button type="button" key={s} onClick={() => setData(d => ({ ...d, sex: s }))}
                          className={`flex-1 py-3 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all ${
                            data.sex === s ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/20 text-on-surface-variant bg-surface-container-low hover:border-primary/50'
                          }`}>
                          {s === 'male' ? t.onboarding.male : t.onboarding.female}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">{t.onboarding.activityLevel}</label>
                  <RadioCardGroup
                    ariaLabel={t.onboarding.activityLevel}
                    options={activityOptions}
                    value={data.activity}
                    onChange={(id) => setData(d => ({ ...d, activity: id }))}
                  />
                </div>
              </div>
            </OnboardingScaffold>
          )}

          {/* STEP 3: Calculated plan — INDYA kcal-breakdown pattern (R8.1) */}
          {step === 3 && (
            <OnboardingScaffold
              title={t.onboarding.step3Title}
              subtitle={t.onboarding.basedOnData}
            >
              {/* Macro summary hero — keeps the familiar big-number UX */}
              <SectionCard padding="lg" spacing="none">
                <div className="text-center mb-6">
                  <span className="font-mono text-5xl font-black text-primary">{targets.cal}</span>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{t.onboarding.dailyCal}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="font-mono text-2xl font-bold text-tertiary">{targets.pro}g</span>
                    <p className="text-micro text-on-surface-variant uppercase tracking-widest">{t.home.protein}</p>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-tertiary">{targets.carbs}g</span>
                    <p className="text-micro text-on-surface-variant uppercase tracking-widest">{t.home.carbs}</p>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-tertiary">{targets.fats}g</span>
                    <p className="text-micro text-on-surface-variant uppercase tracking-widest">{t.home.fats}</p>
                  </div>
                </div>
              </SectionCard>

              {/* Transparent kcal breakdown — INDYA pedagogy */}
              <KcalBreakdownCard breakdown={breakdown} showTooltip />
              <div>
                <p className="text-sm text-on-surface-variant mb-3">{t.onboarding.doYouTrain}</p>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button type="button" key={String(v)} onClick={() => setData(d => ({ ...d, trains: v }))}
                      className={`flex-1 py-3 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all ${
                        data.trains === v ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/20 text-on-surface-variant bg-surface-container-low'
                      }`}>
                      {v ? t.onboarding.yesTraining : t.onboarding.noTraining}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-on-surface-variant italic">{t.onboarding.adjustLater}</p>
            </OnboardingScaffold>
          )}

          {/* STEP 4: Restrictions */}
          {step === 4 && (
            <OnboardingScaffold
              title={t.onboarding.step4Title}
              subtitle={t.onboarding.step4Subtitle}
              heroSlot={<Salad className="w-12 h-12 text-primary" aria-hidden="true" />}
            >
              <div className="flex flex-wrap gap-2">
                {restrictions.map(r => {
                  const selected = data.restrictions.includes(r.id);
                  return (
                    <button type="button" key={r.id}
                      onClick={() => setData(d => ({
                        ...d,
                        restrictions: selected ? d.restrictions.filter(x => x !== r.id) : [...d.restrictions, r.id],
                      }))}
                      className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                        selected ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/20 text-on-surface-variant bg-surface-container-low hover:border-primary/50'
                      }`}>
                      {selected && '✓ '}{r.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="self-start text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-primary underline underline-offset-4 transition-colors"
              >
                {t.onboarding.skip}
              </button>
            </OnboardingScaffold>
          )}

          {/* STEP 5: Palette */}
          {step === 5 && (
            <OnboardingScaffold
              title={t.onboarding.step5PaletteTitle}
              subtitle={t.onboarding.step5PaletteSubtitle}
              heroSlot={<Palette className="w-12 h-12 text-primary" aria-hidden="true" />}
            >
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t.settings.palette}>
                {palettes.map((p) => {
                  const selected = palette === p.id;
                  const swatch = resolvedMode === 'dark' ? p.dark : p.light;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPalette(p.id)}
                      className={`relative rounded-sm overflow-hidden border transition-all text-left min-h-[120px] ${
                        selected
                          ? 'border-primary ring-1 ring-primary'
                          : 'border-outline-variant/30 hover:border-outline-variant/60'
                      }`}
                      style={{ backgroundColor: swatch.bg }}
                    >
                      {p.id === 'neutral' && (
                        <span
                          className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full font-mono text-micro tracking-widest uppercase"
                          style={{
                            backgroundColor: swatch.primary,
                            color: swatch.bg,
                          }}
                        >
                          {t.settings.paletteRecommended}
                        </span>
                      )}
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: swatch.primary }} />
                          <div className="h-1.5 rounded flex-1" style={{ backgroundColor: swatch.textMuted, opacity: 0.4 }} />
                        </div>
                        <div className="rounded p-2 mb-2" style={{ backgroundColor: swatch.surface }}>
                          <div className="h-1.5 rounded mb-1" style={{ backgroundColor: swatch.text, opacity: 0.85, width: '70%' }} />
                          <div className="h-1 rounded" style={{ backgroundColor: swatch.textMuted, opacity: 0.5, width: '90%' }} />
                        </div>
                        <div className="rounded px-2 py-1 text-center" style={{ backgroundColor: swatch.primary }}>
                          <div className="h-1.5 rounded mx-auto" style={{ backgroundColor: swatch.bg, width: '60%', opacity: 0.9 }} />
                        </div>
                      </div>
                      <div className="px-3 pb-3 flex items-center justify-between">
                        <span
                          className="font-headline font-bold text-label uppercase tracking-widest"
                          style={{ color: swatch.text }}
                        >
                          {p.label}
                        </span>
                        {selected && (
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: swatch.primary }}
                          >
                            <Check className="w-2.5 h-2.5" style={{ color: swatch.bg }} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-on-surface-variant text-center">{t.onboarding.step5PaletteHint}</p>
            </OnboardingScaffold>
          )}

          {/* STEP 6: Ready */}
          {step === 6 && (
            <OnboardingScaffold
              variant="centered"
              heroSlot={<PartyPopper className="w-14 h-14 text-primary mx-auto" />}
              title={t.onboarding.step5Title}
              subtitle={t.onboarding.readyMessage}
            >
              <SectionCard padding="md" spacing="md" className="text-left w-full">
                {data.name && <div className="flex justify-between text-sm"><span className="text-on-surface-variant">{t.onboarding.name}</span><span className="font-bold text-tertiary">{data.name}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">{t.onboarding.dailyCal}</span><span className="font-mono font-bold text-primary">{targets.cal} kcal</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">{t.home.protein}</span><span className="font-mono font-bold text-tertiary">{targets.pro}g</span></div>
                {data.restrictions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {data.restrictions.map(r => (
                      <span key={r} className="text-micro font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">{r}</span>
                    ))}
                  </div>
                )}
              </SectionCard>
            </OnboardingScaffold>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-outline-variant/10 shrink-0 space-y-2">
          {step < 6 ? (
            <>
              <Button
                variant="default"
                size="lg"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="w-full"
              >
                {t.onboarding.next} <ChevronRight className="w-4 h-4" />
              </Button>
              {!canNext() && (
                <p className="text-xs text-on-surface-variant text-center">{t.onboarding.selectHint}</p>
              )}
            </>
          ) : (
            <Button
              variant="default"
              size="lg"
              onClick={handleFinish}
              className="w-full"
            >
              {t.onboarding.start}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
