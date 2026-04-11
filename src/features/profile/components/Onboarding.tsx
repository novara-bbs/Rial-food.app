import { useState } from 'react';
import { ArrowLeft, Dumbbell, Flame, Scale, Heart, Users, ChevronRight, Check, PartyPopper, Sun, Moon } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useTheme } from '../../../contexts/ThemeContext';
import { calculateDailyTargets, type Goal } from '../../food/utils/nutrition';
import type { Theme } from '../../../contexts/ThemeContext';

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
  goal: '', name: '', weight: 70, height: 170, age: 30, sex: 'male',
  activity: 'active', trains: false, restrictions: [],
};

export default function Onboarding({ isOpen, onClose, onComplete }: {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: { userProfile: any; targets: any }) => void;
}) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);

  const paletteFamilies = [
    {
      family: 'VOLT',
      themes: [
        { id: 'dark', modeLabel: t.settings.themeNight, primary: '#dcfd05', bg: '#09090b', surface: '#18181b', text: '#ffffff', textMuted: '#a1a1aa', mode: 'dark' },
        { id: 'light', modeLabel: t.settings.themeDay, primary: '#09090b', bg: '#ffffff', surface: '#f4f4f5', text: '#09090b', textMuted: '#71717a', mode: 'light' },
      ],
    },
    {
      family: 'OCEAN',
      themes: [
        { id: 'blue-dark', modeLabel: t.settings.themeNight, primary: '#38bdf8', bg: '#020617', surface: '#0f172a', text: '#f0f9ff', textMuted: '#94a3b8', mode: 'dark' },
        { id: 'blue-light', modeLabel: t.settings.themeDay, primary: '#0284c7', bg: '#f8fafc', surface: '#f1f5f9', text: '#0f172a', textMuted: '#64748b', mode: 'light' },
      ],
    },
    {
      family: 'EMBER',
      themes: [
        { id: 'orange-dark', modeLabel: t.settings.themeNight, primary: '#fdac6c', bg: '#0c0a09', surface: '#1c1917', text: '#ffffff', textMuted: '#a8a29e', mode: 'dark' },
        { id: 'orange-light', modeLabel: t.settings.themeDay, primary: '#ea580c', bg: '#fafaf9', surface: '#f5f5f4', text: '#292524', textMuted: '#78716c', mode: 'light' },
      ],
    },
  ];

  if (!isOpen) return null;

  const targets = calculateDailyTargets(data.weight, data.height, data.age, data.sex, data.activity, (data.goal || 'maintain') as Goal);

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
    });
    onClose();
  };

  const goals = [
    { id: 'muscle', label: t.onboarding.goals.muscle, icon: Dumbbell, color: 'text-blue-400' },
    { id: 'cut', label: t.onboarding.goals.cut, icon: Flame, color: 'text-orange-400' },
    { id: 'maintain', label: t.onboarding.goals.maintain, icon: Scale, color: 'text-green-400' },
    { id: 'health', label: t.onboarding.goals.health, icon: Heart, color: 'text-pink-400' },
    { id: 'family', label: t.onboarding.goals.family, icon: Users, color: 'text-purple-400' },
  ];

  const activities = [
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
      <div className="bg-surface-container w-full max-w-lg max-h-[90vh] rounded-sm border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header with progress */}
        <div className="p-5 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center justify-between mb-3">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="p-1 text-on-surface-variant hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : <div className="w-5" />}
            <h2 className="font-headline text-xl font-bold uppercase text-primary tracking-tight">RIAL</h2>
            <span className="font-mono text-xs text-on-surface-variant">{step}/6</span>
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
            <>
              <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.onboarding.step1Title}</h3>
              <div className="space-y-2">
                {goals.map(g => {
                  const Icon = g.icon;
                  const selected = data.goal === g.id;
                  return (
                    <button type="button"
                      key={g.id}
                      onClick={() => setData(d => ({ ...d, goal: g.id }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-sm border transition-all text-left ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${selected ? 'text-primary' : g.color}`} />
                      <span className={`font-headline font-bold text-sm uppercase tracking-wider ${selected ? 'text-primary' : 'text-tertiary'}`}>{g.label}</span>
                      {selected && <Check className="w-5 h-5 text-primary ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* STEP 2: Body data */}
          {step === 2 && (
            <>
              <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.onboarding.step2Title}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.name}</label>
                  <input type="text" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface text-sm focus:outline-none focus:border-primary" placeholder="Vicente" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.weight} (kg)</label>
                    <input type="number" step="0.1" inputMode="decimal" value={data.weight} onChange={e => setData(d => ({ ...d, weight: +e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface text-sm font-mono focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.height} (cm)</label>
                    <input type="number" step="0.1" inputMode="decimal" value={data.height} onChange={e => setData(d => ({ ...d, height: +e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface text-sm font-mono focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">{t.onboarding.age}</label>
                    <input type="number" value={data.age} onChange={e => setData(d => ({ ...d, age: +e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-sm text-on-surface text-sm font-mono focus:outline-none focus:border-primary" />
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
                  <div className="space-y-2">
                    {activities.map(a => (
                      <button type="button" key={a.id} onClick={() => setData(d => ({ ...d, activity: a.id as OnboardingData['activity'] }))}
                        className={`w-full text-left px-4 py-3 rounded-sm border text-sm transition-all ${
                          data.activity === a.id ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-outline-variant/20 text-on-surface-variant bg-surface-container-low hover:border-primary/50'
                        }`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: Calculated plan */}
          {step === 3 && (
            <>
              <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.onboarding.step3Title}</h3>
              <p className="text-sm text-on-surface-variant">{t.onboarding.basedOnData}</p>
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
                <div className="text-center mb-6">
                  <span className="font-mono text-5xl font-black text-primary">{targets.cal}</span>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{t.onboarding.dailyCal}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="font-mono text-2xl font-bold text-tertiary">{targets.pro}g</span>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">{t.home.protein}</p>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-tertiary">{targets.carbs}g</span>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">{t.home.carbs}</p>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-tertiary">{targets.fats}g</span>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">{t.home.fats}</p>
                  </div>
                </div>
              </div>
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
            </>
          )}

          {/* STEP 4: Restrictions */}
          {step === 4 && (
            <>
              <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.onboarding.step4Title}</h3>
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
              <p className="text-xs text-on-surface-variant">{t.onboarding.skip}</p>
            </>
          )}

          {/* STEP 5: Palette */}
          {step === 5 && (
            <>
              <h3 className="font-headline text-lg font-bold uppercase text-tertiary tracking-tight">{t.onboarding.step5PaletteTitle}</h3>
              <p className="text-xs text-on-surface-variant -mt-2">{t.onboarding.step5PaletteSubtitle}</p>
              <div className="space-y-4">
                {paletteFamilies.map(({ family, themes: familyThemes }) => (
                  <div key={family}>
                    <span className="font-mono text-[9px] tracking-[0.3em] text-on-surface-variant uppercase block mb-2">{family}</span>
                    <div className="grid grid-cols-2 gap-2">
                      {familyThemes.map(th => (
                        <button type="button"
                          key={th.id}
                          onClick={() => setTheme(th.id as Theme)}
                          className={`relative rounded-sm overflow-hidden border transition-all text-left ${
                            theme === th.id
                              ? 'border-primary ring-1 ring-primary'
                              : 'border-outline-variant/30 hover:border-outline-variant/60'
                          }`}
                          style={{ backgroundColor: th.bg }}
                        >
                          <div className="p-2.5">
                            <div className="flex items-center gap-1 mb-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: th.primary }} />
                              <div className="h-1.5 rounded flex-1" style={{ backgroundColor: th.textMuted, opacity: 0.4 }} />
                            </div>
                            <div className="rounded p-1.5 mb-1.5" style={{ backgroundColor: th.surface }}>
                              <div className="h-1.5 rounded mb-1" style={{ backgroundColor: th.text, opacity: 0.8, width: '70%' }} />
                              <div className="h-1 rounded" style={{ backgroundColor: th.textMuted, opacity: 0.5, width: '90%' }} />
                            </div>
                            <div className="rounded px-2 py-1 text-center" style={{ backgroundColor: th.primary }}>
                              <div className="h-1.5 rounded mx-auto" style={{ backgroundColor: th.bg, width: '60%', opacity: 0.9 }} />
                            </div>
                          </div>
                          <div className="px-2.5 pb-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {th.mode === 'light' ? <Sun className="w-3 h-3" style={{ color: th.textMuted }} /> : <Moon className="w-3 h-3" style={{ color: th.textMuted }} />}
                              <span className="font-headline font-bold text-[9px] uppercase tracking-widest" style={{ color: th.text }}>{th.modeLabel}</span>
                            </div>
                            {theme === th.id && (
                              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: th.primary }}>
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: th.bg }} />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant text-center">{t.onboarding.step5PaletteHint}</p>
            </>
          )}

          {/* STEP 6: Ready */}
          {step === 6 && (
            <div className="text-center py-6 space-y-6">
              <PartyPopper className="w-14 h-14 text-primary mx-auto" />
              <h3 className="font-headline text-2xl font-bold uppercase text-primary tracking-tight">{t.onboarding.step5Title}</h3>
              <p className="text-on-surface-variant">{t.onboarding.readyMessage}</p>
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-5 text-left space-y-3">
                {data.name && <div className="flex justify-between text-sm"><span className="text-on-surface-variant">{t.onboarding.name}</span><span className="font-bold text-tertiary">{data.name}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">{t.onboarding.dailyCal}</span><span className="font-mono font-bold text-primary">{targets.cal} kcal</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">{t.home.protein}</span><span className="font-mono font-bold text-tertiary">{targets.pro}g</span></div>
                {data.restrictions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {data.restrictions.map(r => (
                      <span key={r} className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">{r}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-outline-variant/10 shrink-0">
          {step < 6 ? (
            <button type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {t.onboarding.next} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button"
              onClick={handleFinish}
              className="w-full py-4 bg-primary text-on-primary rounded-sm font-headline text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all"
            >
              {t.onboarding.start}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
