import { useTheme, type Theme } from '../../../contexts/ThemeContext';
import { Palette, Moon, Sun, Check, User, Target, Smartphone, Leaf, LogOut, ChevronRight, Crown, Sparkles, Users, Plus, Trash2, Globe, Scale, ShieldAlert, X, Search, Bell, Download, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useI18n, type Locale } from '../../../i18n';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState';
import { getNutritionHistory } from '../../../hooks/useDailyReset';
import type { Allergen, Ingredient } from '../../../types';
import { bodyWeightFromKg, bodyWeightToKg, heightFromCm, heightToCm, getBodyWeightUnit, getHeightUnit } from '../../food/utils/units';

export default function Settings({ dailyMacros, setDailyMacros, isPro, setIsPro, showAIBot, setShowAIBot, userProfile, setUserProfile, dictionary = [] }: { dailyMacros?: any, setDailyMacros?: any, isPro?: boolean, setIsPro?: any, showAIBot?: boolean, setShowAIBot?: any, userProfile?: any, setUserProfile?: any, dictionary?: Ingredient[] }) {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', age: 30, goal: 'maintain', activityLevel: 'moderate' });

  const addFamilyMember = () => {
    if (!newMember.name) return;
    setUserProfile((prev: any) => ({
      ...prev,
      family: [...(prev.family || []), { ...newMember, id: Date.now().toString() }]
    }));
    setNewMember({ name: '', age: 30, goal: 'maintain', activityLevel: 'moderate' });
    setIsAddingMember(false);
  };

  const removeFamilyMember = (id: string) => {
    setUserProfile((prev: any) => ({
      ...prev,
      family: (prev.family || []).filter((m: any) => m.id !== id)
    }));
  };
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorageState('notificationsEnabled', true);
  const [profilePublic, setProfilePublic] = useLocalStorageState('profilePublic', false);

  const exportCSV = () => {
    const history = getNutritionHistory();
    if (history.length === 0) {
      toast.info(t.settings.noDataToExport);
      return;
    }
    const header = 'date,calories,protein,carbs,fats,hydration,mealCount\n';
    const rows = history.map(h =>
      `${h.date},${h.macros.consumed.cal},${h.macros.consumed.pro},${h.macros.consumed.carbs},${h.macros.consumed.fats},${h.hydration},${h.mealCount}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rial-nutrition-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.settings.exportSuccess);
  };

  const deleteAllData = () => {
    if (!confirm(t.settings.deleteConfirm)) return;
    const keysToKeep = ['rial_lastActiveDate'];
    const allKeys = Object.keys(localStorage).filter(k => !keysToKeep.includes(k));
    allKeys.forEach(k => localStorage.removeItem(k));
    toast.success(t.settings.dataDeleted);
    window.location.reload();
  };

  const [connectedDevices, setConnectedDevices] = useState({
    whoop: true,
    oura: false,
    garmin: false
  });

  const toggleDevice = (device: keyof typeof connectedDevices) => {
    setConnectedDevices(prev => ({
      ...prev,
      [device]: !prev[device]
    }));
  };

  const toggleDietaryPreference = (pref: string) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => {
      const current = prev.dietaryPreferences || [];
      if (current.includes(pref)) {
        return { ...prev, dietaryPreferences: current.filter((p: string) => p !== pref) };
      }
      return { ...prev, dietaryPreferences: [...current, pref] };
    });
  };

  const updateBiometric = (key: string, value: any) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => ({ ...prev, [key]: value }));
  };

  const dietaryOptions = [
    { key: 'Vegano', label: t.settings.dietVegan },
    { key: 'Vegetariano', label: t.settings.dietVegetarian },
    { key: 'Keto', label: t.settings.dietKeto },
    { key: 'Alto en Proteína', label: t.settings.dietHighProtein },
    { key: 'Sin Gluten', label: t.settings.dietGlutenFree },
    { key: 'Sin Lácteos', label: t.settings.dietDairyFree },
    { key: 'Paleo', label: t.settings.dietPaleo },
    { key: 'Bajo en Carbohidratos', label: t.settings.dietLowCarb },
  ];

  // Food dislikes search
  const [dislikeSearch, setDislikeSearch] = useState('');
  const dislikeResults = useMemo(() => {
    if (!dislikeSearch || dislikeSearch.length < 2) return [];
    const q = dislikeSearch.toLowerCase();
    return dictionary
      .filter(d => (d.name.toLowerCase().includes(q) || d.nameEn.toLowerCase().includes(q)) && !(userProfile?.foodDislikes || []).includes(d.id))
      .slice(0, 6);
  }, [dislikeSearch, dictionary, userProfile?.foodDislikes]);

  const addDislike = (id: string) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => ({ ...prev, foodDislikes: [...(prev.foodDislikes || []), id] }));
    setDislikeSearch('');
  };

  const removeDislike = (id: string) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => ({ ...prev, foodDislikes: (prev.foodDislikes || []).filter((d: string) => d !== id) }));
  };

  const toggleIntolerance = (allergen: Allergen) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => {
      const current: Allergen[] = prev.intolerances || [];
      if (current.includes(allergen)) return { ...prev, intolerances: current.filter(a => a !== allergen) };
      return { ...prev, intolerances: [...current, allergen] };
    });
  };

  const allergenOptions: { key: Allergen; label: string }[] = [
    { key: 'gluten', label: 'Gluten' },
    { key: 'dairy', label: t.settings.intoleranceDairy || 'Dairy' },
    { key: 'eggs', label: t.settings.intoleranceEggs || 'Eggs' },
    { key: 'nuts', label: t.settings.intoleranceNuts || 'Nuts' },
    { key: 'fish', label: t.settings.intoleranceFish || 'Fish' },
    { key: 'shellfish', label: t.settings.intoleranceShellfish || 'Shellfish' },
    { key: 'soy', label: t.settings.intoleranceSoy || 'Soy' },
  ];

  const themes = [
    {
      id: 'dark', family: 'VOLT', mode: 'dark',
      modeLabel: t.settings.themeNight,
      primary: '#dcfd05', bg: '#09090b', surface: '#18181b', text: '#ffffff', textMuted: '#a1a1aa',
    },
    {
      id: 'light', family: 'VOLT', mode: 'light',
      modeLabel: t.settings.themeDay,
      primary: '#09090b', bg: '#ffffff', surface: '#f4f4f5', text: '#09090b', textMuted: '#71717a',
    },
    {
      id: 'blue-dark', family: 'OCEAN', mode: 'dark',
      modeLabel: t.settings.themeNight,
      primary: '#38bdf8', bg: '#020617', surface: '#0f172a', text: '#f0f9ff', textMuted: '#94a3b8',
    },
    {
      id: 'blue-light', family: 'OCEAN', mode: 'light',
      modeLabel: t.settings.themeDay,
      primary: '#0284c7', bg: '#f8fafc', surface: '#f1f5f9', text: '#0f172a', textMuted: '#64748b',
    },
    {
      id: 'orange-dark', family: 'EMBER', mode: 'dark',
      modeLabel: t.settings.themeNight,
      primary: '#fdac6c', bg: '#0c0a09', surface: '#1c1917', text: '#ffffff', textMuted: '#a8a29e',
    },
    {
      id: 'orange-light', family: 'EMBER', mode: 'light',
      modeLabel: t.settings.themeDay,
      primary: '#ea580c', bg: '#fafaf9', surface: '#f5f5f4', text: '#292524', textMuted: '#78716c',
    },
  ];

  const goalLabels: Record<string, string> = {
    lose: t.settings.goalLose,
    maintain: t.settings.goalMaintain,
    gain: t.settings.goalGain,
    performance: t.settings.goalPerformance,
  };

  return (
    <div className="px-6 max-w-4xl mx-auto space-y-8 pb-24">
      <section className="space-y-6">
        <span className="font-label text-xs tracking-[0.2em] text-primary uppercase mb-1 block">{t.settings.title}</span>
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter uppercase text-tertiary mb-6">{t.settings.title}</h2>
        
        {/* Profile Section */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt={t.settings.profileAlt} className="w-16 h-16 rounded-full object-cover border-2 border-primary" referrerPolicy="no-referrer" />
          <div className="flex-1">
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">Sarah Jenkins</h3>
            {isPro ? (
              <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-sm font-label font-bold uppercase tracking-widest inline-block mt-1 flex items-center gap-1 w-fit">
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
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div>
                <h4 className="font-headline font-bold text-sm text-tertiary uppercase tracking-widest">{t.settings.dashboardMode}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{t.settings.dashboardModeDesc}</p>
              </div>
              <div className="flex bg-surface-container-low rounded-full p-1 border border-outline-variant/20">
                <button type="button"
                  onClick={() => updateBiometric('mode', 'simple')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${userProfile?.mode === 'simple' || !userProfile?.mode ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-tertiary'}`}
                >
                  {t.settings.simple}
                </button>
                <button type="button"
                  onClick={() => updateBiometric('mode', 'advanced')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${userProfile?.mode === 'advanced' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-tertiary'}`}
                >
                  {t.settings.advanced}
                </button>
              </div>
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
              <input
                type="number"
                value={userProfile?.age || 32}
                onChange={(e) => updateBiometric('age', parseInt(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.heightLabel} ({getHeightUnit(userProfile?.unitSystem ?? 'metric')})</label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={heightFromCm(userProfile?.height || 175, userProfile?.unitSystem ?? 'metric')}
                onChange={(e) => updateBiometric('height', heightToCm(parseFloat(e.target.value) || 0, userProfile?.unitSystem ?? 'metric'))}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.weightLabel} ({getBodyWeightUnit(userProfile?.unitSystem ?? 'metric')})</label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={bodyWeightFromKg(userProfile?.weight || 78, userProfile?.unitSystem ?? 'metric')}
                onChange={(e) => updateBiometric('weight', bodyWeightToKg(parseFloat(e.target.value) || 0, userProfile?.unitSystem ?? 'metric'))}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.targetWeight || 'Peso objetivo'} ({getBodyWeightUnit(userProfile?.unitSystem ?? 'metric')})</label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={userProfile?.targetWeight ? bodyWeightFromKg(userProfile.targetWeight, userProfile?.unitSystem ?? 'metric') : ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateBiometric('targetWeight', val ? bodyWeightToKg(val, userProfile?.unitSystem ?? 'metric') : undefined);
                }}
                placeholder={t.settings.optional || 'Opcional'}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.gender}</label>
              <select 
                value={userProfile?.gender || 'female'}
                onChange={(e) => updateBiometric('gender', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary uppercase text-xs focus:outline-none focus:border-primary"
              >
                <option value="male">{t.settings.male}</option>
                <option value="female">{t.settings.female}</option>
                <option value="other">{t.settings.other}</option>
              </select>
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
              className="text-primary font-label text-[10px] font-bold tracking-widest uppercase hover:underline flex items-center gap-1"
            >
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
                  aria-label={t.settings.removeMember.replace('{name}', member.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {isAddingMember && (
              <div className="bg-surface-container-highest p-4 rounded-sm border border-primary/30 col-span-full">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-full">
                    <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.memberName}</label>
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary"
                      placeholder={t.settings.memberNamePlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.memberAge}</label>
                    <input
                      type="number"
                      value={newMember.age}
                      onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.memberGoal}</label>
                    <select 
                      value={newMember.goal}
                      onChange={(e) => setNewMember({ ...newMember, goal: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary uppercase text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="lose">{t.settings.goalLose}</option>
                      <option value="maintain">{t.settings.goalMaintain}</option>
                      <option value="gain">{t.settings.goalGain}</option>
                      <option value="performance">{t.settings.goalPerformance}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" 
                    onClick={addFamilyMember}
                    className="flex-1 bg-primary text-on-primary py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase"
                  >
                    {t.settings.saveMember}
                  </button>
                  <button type="button"
                    onClick={() => setIsAddingMember(false)}
                    className="flex-1 bg-surface-container-low text-on-surface-variant py-2 rounded-sm font-label text-xs font-bold tracking-widest uppercase border border-outline-variant/20"
                  >
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
              <select 
                value={userProfile?.goal || 'maintain'}
                onChange={(e) => updateBiometric('goal', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary uppercase text-xs focus:outline-none focus:border-primary"
              >
                <option value="lose">{t.settings.goalLose}</option>
                <option value="maintain">{t.settings.goalMaintain}</option>
                <option value="gain">{t.settings.goalGain}</option>
                <option value="performance">{t.settings.goalPerformance}</option>
              </select>
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.activityLevel}</label>
              <select 
                value={userProfile?.activityLevel || 'moderate'}
                onChange={(e) => updateBiometric('activityLevel', e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 px-3 text-tertiary uppercase text-xs focus:outline-none focus:border-primary"
              >
                <option value="sedentary">{t.settings.actSedentary}</option>
                <option value="light">{t.settings.actLight}</option>
                <option value="moderate">{t.settings.actModerate}</option>
                <option value="very">{t.settings.actVery}</option>
                <option value="extra">{t.settings.actExtra}</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Coach Settings */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.aiAssistant}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex flex-col">
                <h4 className="font-headline font-bold text-sm uppercase text-tertiary">{t.settings.aiFloatingBtn}</h4>
                <p className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mt-1">
                  {showAIBot ? t.settings.aiVisibleAll : t.settings.aiHidden}
                </p>
              </div>
              <Switch checked={!!showAIBot} onCheckedChange={(v) => setShowAIBot && setShowAIBot(v)} />
            </div>
          </div>
        </div>

        {/* Wearable Integrations */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.connectedDevices}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">W</div>
                <div>
                  <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Whoop</h4>
                  <p className={`font-label text-[10px] tracking-widest uppercase ${connectedDevices.whoop ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {connectedDevices.whoop ? t.settings.connected : t.settings.notConnected}
                  </p>
                </div>
              </div>
              <Switch checked={connectedDevices.whoop} onCheckedChange={() => toggleDevice('whoop')} />
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs">O</div>
                <div>
                  <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Oura Ring</h4>
                  <p className={`font-label text-[10px] tracking-widest uppercase ${connectedDevices.oura ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {connectedDevices.oura ? t.settings.connected : t.settings.notConnected}
                  </p>
                </div>
              </div>
              <Switch checked={connectedDevices.oura} onCheckedChange={() => toggleDevice('oura')} />
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-sm border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">G</div>
                <div>
                  <h4 className="font-headline font-bold text-sm uppercase text-tertiary">Garmin Connect</h4>
                  <p className={`font-label text-[10px] tracking-widest uppercase ${connectedDevices.garmin ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {connectedDevices.garmin ? t.settings.connected : t.settings.notConnected}
                  </p>
                </div>
              </div>
              <Switch checked={connectedDevices.garmin} onCheckedChange={() => toggleDevice('garmin')} />
            </div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.dailyGoals}</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">{t.settings.calories}</span>
                <span className="text-tertiary">{dailyMacros?.target?.cal || 2400} KCAL</span>
              </div>
              <input 
                type="range" 
                min="1500" 
                max="4000" 
                step="50" 
                value={dailyMacros?.target?.cal || 2400} 
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, cal: parseInt(e.target.value) } }))}
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" 
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">{t.settings.protein}</span>
                <span className="text-tertiary">{dailyMacros?.target?.pro || 180}g</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={dailyMacros?.target?.pro || 180}
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, pro: parseInt(e.target.value) } }))}
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">{t.settings.carbs}</span>
                <span className="text-tertiary">{dailyMacros?.target?.carbs || 250}g</span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="5"
                value={dailyMacros?.target?.carbs || 250}
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, carbs: parseInt(e.target.value) } }))}
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-secondary"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">{t.settings.fats}</span>
                <span className="text-tertiary">{dailyMacros?.target?.fats || 65}g</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="150" 
                step="5" 
                value={dailyMacros?.target?.fats || 65} 
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, fats: parseInt(e.target.value) } }))}
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-error" 
              />
            </div>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.dietaryPreferences}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {dietaryOptions.map(option => (
              <button type="button"
                key={option.key}
                onClick={() => toggleDietaryPreference(option.key)}
                className={`px-4 py-2 rounded-full font-label text-xs font-bold tracking-wider uppercase transition-colors border ${
                  userProfile?.dietaryPreferences?.includes(option.key)
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Preferences — Dislikes + Intolerances */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.foodPreferences}</h3>
          </div>

          {/* Dislikes */}
          <div className="mb-6">
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.foodDislikes}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
              <input
                type="text"
                value={dislikeSearch}
                onChange={(e) => setDislikeSearch(e.target.value)}
                placeholder={t.settings.foodDislikesPlaceholder}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 pl-9 pr-3 text-tertiary text-sm focus:outline-none focus:border-primary"
              />
            </div>
            {dislikeResults.length > 0 && (
              <div className="mt-1 bg-surface-container-highest border border-outline-variant/20 rounded-sm max-h-40 overflow-y-auto">
                {dislikeResults.map(d => (
                  <button type="button" key={d.id} onClick={() => addDislike(d.id)} className="w-full text-left px-3 py-2 text-sm text-tertiary hover:bg-primary/10 transition-colors">
                    {d.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {(userProfile?.foodDislikes || []).map((id: string) => {
                const ing = dictionary.find(d => d.id === id);
                return (
                  <span key={id} className="inline-flex items-center gap-1 bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {ing?.name || id}
                    <button type="button" onClick={() => removeDislike(id)} className="hover:bg-error/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Intolerances */}
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.intolerances}</label>
            <div className="flex flex-wrap gap-3">
              {allergenOptions.map(opt => (
                <button type="button"
                  key={opt.key}
                  onClick={() => toggleIntolerance(opt.key)}
                  className={`px-4 py-2 rounded-full font-label text-xs font-bold tracking-wider uppercase transition-colors border ${
                    (userProfile?.intolerances || []).includes(opt.key)
                      ? 'bg-error text-white border-error'
                      : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30 hover:border-error/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.socialLinksTitle}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1">{t.settings.instagramUsername}</label>
              <div className="flex items-center gap-2 bg-surface-container-highest rounded-sm border border-outline-variant/20 px-3 py-2">
                <span className="text-xs text-on-surface-variant">@</span>
                <input
                  type="text"
                  value={userProfile?.socialLinks?.instagram || ''}
                  onChange={e => setUserProfile((prev: any) => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value || undefined } }))}
                  placeholder="username"
                  className="bg-transparent text-sm text-on-surface flex-1 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1">{t.settings.youtubeChannel}</label>
              <input
                type="url"
                value={userProfile?.socialLinks?.youtube || ''}
                onChange={e => setUserProfile((prev: any) => ({ ...prev, socialLinks: { ...prev.socialLinks, youtube: e.target.value || undefined } }))}
                placeholder="https://youtube.com/@channel"
                className="w-full bg-surface-container-highest rounded-sm border border-outline-variant/20 px-3 py-2 text-sm text-on-surface outline-none"
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1">{t.settings.tiktokUsername}</label>
              <div className="flex items-center gap-2 bg-surface-container-highest rounded-sm border border-outline-variant/20 px-3 py-2">
                <span className="text-xs text-on-surface-variant">@</span>
                <input
                  type="text"
                  value={userProfile?.socialLinks?.tiktok || ''}
                  onChange={e => setUserProfile((prev: any) => ({ ...prev, socialLinks: { ...prev.socialLinks, tiktok: e.target.value || undefined } }))}
                  placeholder="username"
                  className="bg-transparent text-sm text-on-surface flex-1 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-1">{t.settings.websiteUrl}</label>
              <input
                type="url"
                value={userProfile?.socialLinks?.website || ''}
                onChange={e => setUserProfile((prev: any) => ({ ...prev, socialLinks: { ...prev.socialLinks, website: e.target.value || undefined } }))}
                placeholder="https://example.com"
                className="w-full bg-surface-container-highest rounded-sm border border-outline-variant/20 px-3 py-2 text-sm text-on-surface outline-none"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.appearance}</h3>
          </div>
          
          <div className="space-y-4">
            {(['VOLT', 'OCEAN', 'EMBER'] as const).map(family => {
              const pair = themes.filter(th => th.family === family);
              return (
                <div key={family}>
                  <span className="font-mono text-[9px] tracking-[0.3em] text-on-surface-variant uppercase block mb-2">{family}</span>
                  <div className="grid grid-cols-2 gap-3">
                    {pair.map(th => (
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
                        {/* Mini UI preview */}
                        <div className="p-2.5">
                          {/* Simulated header bar */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: th.primary }} />
                            <div className="h-1.5 rounded flex-1" style={{ backgroundColor: th.textMuted, opacity: 0.4 }} />
                          </div>
                          {/* Simulated content card */}
                          <div className="rounded p-1.5 mb-1.5" style={{ backgroundColor: th.surface }}>
                            <div className="h-1.5 rounded mb-1" style={{ backgroundColor: th.text, opacity: 0.8, width: '70%' }} />
                            <div className="h-1 rounded" style={{ backgroundColor: th.textMuted, opacity: 0.5, width: '90%' }} />
                          </div>
                          {/* Simulated CTA button */}
                          <div className="rounded px-2 py-1 text-center" style={{ backgroundColor: th.primary }}>
                            <div className="h-1.5 rounded mx-auto" style={{ backgroundColor: th.bg, width: '60%', opacity: 0.9 }} />
                          </div>
                        </div>
                        {/* Label row */}
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
              );
            })}
          </div>
        </div>

        {/* Language */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-primary" />
            <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.language}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {([
              { id: 'es' as Locale, label: 'Español', flag: '🇪🇸' },
              { id: 'en' as Locale, label: 'English', flag: '🇬🇧' },
            ]).map(lang => (
              <button type="button"
                key={lang.id}
                onClick={() => setLocale(lang.id)}
                className={`flex items-center gap-3 p-4 rounded-sm border-2 transition-all ${
                  locale === lang.id
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-headline font-bold text-sm text-tertiary uppercase">{lang.label}</span>
                {locale === lang.id && <Check className="w-5 h-5 text-primary ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Unit System */}
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.unitSystem}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{t.settings.unitSystemDesc}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {([
              { id: 'metric' as const, label: t.settings.metric, desc: t.settings.metricDesc },
              { id: 'imperial' as const, label: t.settings.imperial, desc: t.settings.imperialDesc },
            ]).map(sys => (
              <button type="button"
                key={sys.id}
                onClick={() => setUserProfile && setUserProfile((prev: any) => ({ ...prev, unitSystem: sys.id }))}
                className={`flex flex-col items-start p-4 rounded-sm border-2 transition-all ${
                  (userProfile?.unitSystem ?? 'metric') === sys.id
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-headline font-bold text-sm text-tertiary uppercase">{sys.label}</span>
                  {(userProfile?.unitSystem ?? 'metric') === sys.id && <Check className="w-5 h-5 text-primary" />}
                </div>
                <span className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant mt-1">{sys.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications & Privacy */}
        <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 p-5 space-y-4">
          <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">{t.settings.notificationsPrivacy}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-on-surface-variant" />
              <span className="text-sm font-body text-on-surface">{t.settings.notifications}</span>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-on-surface-variant" />
              <span className="text-sm font-body text-on-surface">{t.settings.publicProfile}</span>
            </div>
            <Switch checked={profilePublic} onCheckedChange={setProfilePublic} />
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-surface-container-low rounded-sm border border-outline-variant/20 p-5 space-y-4">
          <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">{t.settings.dataSection}</h3>
          <button type="button"
            onClick={exportCSV}
            className="w-full py-3 bg-surface-container-highest rounded-sm font-headline text-xs font-bold uppercase tracking-widest text-tertiary hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> {t.settings.exportCSV}
          </button>
          <Button
            variant="destructive"
            onClick={deleteAllData}
            className="w-full"
          >
            <AlertTriangle className="w-4 h-4" /> {t.settings.deleteData}
          </Button>
        </div>

        {/* Logout */}
        <Button variant="destructive" size="lg" className="w-full">
          <LogOut className="w-5 h-5" /> {t.settings.logout}
        </Button>
      </section>
    </div>
  );
}
