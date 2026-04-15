import { useState } from 'react';
import { User, Users, Target, Sparkles, Plus, Trash2, Crown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '../../../../i18n';
import { bodyWeightFromKg, bodyWeightToKg, heightFromCm, heightToCm, getBodyWeightUnit, getHeightUnit } from '../../../food/utils/units';
import { calculateDailyTargets, type Goal, type ActivityLevel, type Sex } from '../../../food/utils/nutrition';

interface Props {
  userProfile: any;
  setUserProfile: any;
  setDailyMacros?: any;
  isPro: boolean;
  setIsPro?: any;
}

export default function SettingsProfile({ userProfile, setUserProfile, setDailyMacros, isPro, setIsPro }: Props) {
  const { t } = useI18n();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', age: 30, goal: 'maintain', activityLevel: 'active' });

  const updateBiometric = (key: string, value: any) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => {
      const updated = { ...prev, [key]: value };
      if (['weight', 'height', 'age', 'gender', 'goal', 'activity'].includes(key) && setDailyMacros) {
        const targets = calculateDailyTargets(
          updated.weight || 78, updated.height || 175, updated.age || 32,
          (updated.gender || 'female') as Sex,
          (updated.activity || 'active') as ActivityLevel,
          (updated.goal || 'maintain') as Goal,
        );
        setDailyMacros((prev: any) => ({ ...prev, target: targets }));
      }
      return updated;
    });
  };

  const addFamilyMember = () => {
    if (!newMember.name) return;
    setUserProfile((prev: any) => ({
      ...prev,
      family: [...(prev.family || []), { ...newMember, id: Date.now().toString() }]
    }));
    setNewMember({ name: '', age: 30, goal: 'maintain', activityLevel: 'active' });
    setIsAddingMember(false);
  };

  const removeFamilyMember = (id: string) => {
    setUserProfile((prev: any) => ({
      ...prev,
      family: (prev.family || []).filter((m: any) => m.id !== id)
    }));
  };

  const goalLabels: Record<string, string> = {
    muscle: t.settings.goalMuscle,
    cut: t.settings.goalCut,
    maintain: t.settings.goalMaintain,
    health: t.settings.goalHealth,
    family: t.settings.goalFamily,
  };

  return (
    <>
      {/* Profile Section */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 flex items-center gap-4">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt={t.settings.profileAlt} className="w-16 h-16 rounded-full object-cover border-2 border-primary" referrerPolicy="no-referrer" />
        <div className="flex-1">
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{userProfile?.name || 'User'}</h3>
          {isPro ? (
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-sm font-label font-bold uppercase tracking-widest inline-flex items-center gap-1 w-fit mt-1">
              <Crown className="w-3 h-3" /> {t.settings.proMember}
            </span>
          ) : (
            <span className="bg-surface-container-highest text-on-surface-variant text-[10px] px-2 py-0.5 rounded-sm font-label font-bold uppercase tracking-widest inline-block mt-1">
              {t.settings.freePlan}
            </span>
          )}
        </div>
        <button type="button"
          onClick={() => setIsPro && setIsPro(!isPro)}
          className={`px-4 py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase transition-colors ${
            isPro
              ? 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/30'
              : 'bg-primary text-on-primary hover:bg-primary/90'
          }`}
        >
          {isPro ? t.settings.manage : t.settings.upgrade}
        </button>
      </div>

      {/* Dashboard Mode Section */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase tracking-tight">{t.settings.userExperience}</h3>
        </div>
        <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
          <div>
            <h4 className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest">{t.settings.dashboardMode}</h4>
            <p className="text-xs text-on-surface-variant mt-1">{t.settings.dashboardModeDesc}</p>
          </div>
          <div className="flex bg-surface-container-low rounded-full p-1 border border-outline-variant/20">
            {(['simple', 'advanced'] as const).map((mode) => (
              <button type="button"
                key={mode}
                onClick={() => updateBiometric('mode', mode)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  (userProfile?.mode === mode || (!userProfile?.mode && mode === 'simple'))
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-tertiary'
                }`}
              >
                {mode === 'simple' ? t.settings.simple : t.settings.advanced}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Biometrics Section */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-primary" />
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.biometrics}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.age}</label>
            <input type="number" value={userProfile?.age || 32}
              onChange={(e) => updateBiometric('age', parseInt(e.target.value))}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.heightLabel} ({getHeightUnit(userProfile?.unitSystem ?? 'metric')})</label>
            <input type="number" step="0.1" inputMode="decimal"
              value={heightFromCm(userProfile?.height || 175, userProfile?.unitSystem ?? 'metric')}
              onChange={(e) => updateBiometric('height', heightToCm(parseFloat(e.target.value) || 0, userProfile?.unitSystem ?? 'metric'))}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.weightLabel} ({getBodyWeightUnit(userProfile?.unitSystem ?? 'metric')})</label>
            <input type="number" step="0.1" inputMode="decimal"
              value={bodyWeightFromKg(userProfile?.weight || 78, userProfile?.unitSystem ?? 'metric')}
              onChange={(e) => updateBiometric('weight', bodyWeightToKg(parseFloat(e.target.value) || 0, userProfile?.unitSystem ?? 'metric'))}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.targetWeight || 'Peso objetivo'} ({getBodyWeightUnit(userProfile?.unitSystem ?? 'metric')})</label>
            <input type="number" step="0.1" inputMode="decimal"
              value={userProfile?.targetWeight ? bodyWeightFromKg(userProfile.targetWeight, userProfile?.unitSystem ?? 'metric') : ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateBiometric('targetWeight', val ? bodyWeightToKg(val, userProfile?.unitSystem ?? 'metric') : undefined);
              }}
              placeholder={t.settings.optional || 'Opcional'}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.gender}</label>
            <select value={userProfile?.gender || 'female'}
              onChange={(e) => updateBiometric('gender', e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary uppercase text-xs focus:outline-none focus:border-primary">
              <option value="male">{t.settings.male}</option>
              <option value="female">{t.settings.female}</option>
              <option value="other">{t.settings.other}</option>
            </select>
          </div>
          <div className="col-span-full">
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.name}</label>
            <input type="text" value={userProfile?.name || ''}
              onChange={(e) => updateBiometric('name', e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>
      </div>

      {/* Family Profiles Section */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.familyProfiles}</h3>
          </div>
          <button type="button"
            onClick={() => setIsAddingMember(true)}
            className="text-primary font-label text-[10px] font-bold tracking-widest uppercase hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> {t.settings.addMember}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(userProfile?.family || []).map((member: any) => (
            <div key={member.id} className="bg-surface-container-highest p-4 rounded-sm border border-outline-variant/10 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm uppercase text-tertiary">{member.name}</h4>
                  <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
                    {member.age} {t.settings.years} • {goalLabels[member.goal] || member.goal}
                  </p>
                </div>
              </div>
              <button type="button"
                onClick={() => removeFamilyMember(member.id)}
                className="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100 p-2"
                aria-label={t.settings.removeMember.replace('{name}', member.name)}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {isAddingMember && (
            <div className="bg-surface-container-highest p-4 rounded-sm border border-primary/30 col-span-full">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-full">
                  <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.memberName}</label>
                  <input type="text" value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary"
                    placeholder={t.settings.memberNamePlaceholder} />
                </div>
                <div>
                  <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.memberAge}</label>
                  <input type="number" value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.memberGoal}</label>
                  <select value={newMember.goal}
                    onChange={(e) => setNewMember({ ...newMember, goal: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary uppercase text-xs focus:outline-none focus:border-primary">
                    {Object.entries(goalLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={addFamilyMember}
                  className="flex-1 bg-primary text-on-primary py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase">
                  {t.settings.saveMember}
                </button>
                <button type="button" onClick={() => setIsAddingMember(false)}
                  className="flex-1 bg-surface-container-low text-on-surface-variant py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase border border-outline-variant/20">
                  {t.common.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-primary" />
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.goalsActivity}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.mainGoal}</label>
            <select value={userProfile?.goal || 'maintain'}
              onChange={(e) => updateBiometric('goal', e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary uppercase text-xs focus:outline-none focus:border-primary">
              {Object.entries(goalLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.activityLevel}</label>
            <select value={userProfile?.activity || 'active'}
              onChange={(e) => updateBiometric('activity', e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary uppercase text-xs focus:outline-none focus:border-primary">
              <option value="sedentary">{t.settings.actSedentary}</option>
              <option value="light">{t.settings.actLight}</option>
              <option value="active">{t.settings.actActive}</option>
              <option value="veryActive">{t.settings.actVeryActive}</option>
            </select>
          </div>
          <div className="col-span-full flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10 mt-4">
            <div>
              <h4 className="font-headline font-bold text-sm uppercase text-tertiary tracking-widest">{t.settings.trains}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{t.settings.trainsDesc}</p>
            </div>
            <Switch checked={userProfile?.trains || false} onCheckedChange={(v) => updateBiometric('trains', v)} />
          </div>
        </div>
      </div>
    </>
  );
}
