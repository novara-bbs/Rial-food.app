import { useState, useMemo } from 'react';
import { Target, Leaf, ShieldAlert, Search, X } from 'lucide-react';
import { useI18n } from '../../../../i18n';
import type { Ingredient, Allergen } from '../../../../types';

interface Props {
  dailyMacros: any;
  setDailyMacros: any;
  userProfile: any;
  setUserProfile: any;
  dictionary: Ingredient[];
}

export default function SettingsNutrition({ dailyMacros, setDailyMacros, userProfile, setUserProfile, dictionary }: Props) {
  const { t } = useI18n();
  const [dislikeSearch, setDislikeSearch] = useState('');

  const dislikeResults = useMemo(() => {
    if (!dislikeSearch || dislikeSearch.length < 2) return [];
    const q = dislikeSearch.toLowerCase();
    return dictionary
      .filter((d) => (d.name.toLowerCase().includes(q) || d.nameEn.toLowerCase().includes(q)) && !(userProfile?.foodDislikes || []).includes(d.id))
      .slice(0, 6);
  }, [dislikeSearch, dictionary, userProfile?.foodDislikes]);

  const toggleDietaryPreference = (pref: string) => {
    if (!setUserProfile) return;
    setUserProfile((prev: any) => {
      const current = prev.dietaryPreferences || [];
      if (current.includes(pref)) return { ...prev, dietaryPreferences: current.filter((p: string) => p !== pref) };
      return { ...prev, dietaryPreferences: [...current, pref] };
    });
  };

  const addDislike = (id: string) => {
    setUserProfile((prev: any) => ({ ...prev, foodDislikes: [...(prev.foodDislikes || []), id] }));
    setDislikeSearch('');
  };

  const removeDislike = (id: string) => {
    setUserProfile((prev: any) => ({ ...prev, foodDislikes: (prev.foodDislikes || []).filter((d: string) => d !== id) }));
  };

  const toggleIntolerance = (allergen: Allergen) => {
    setUserProfile((prev: any) => {
      const current: Allergen[] = prev.intolerances || [];
      if (current.includes(allergen)) return { ...prev, intolerances: current.filter((a) => a !== allergen) };
      return { ...prev, intolerances: [...current, allergen] };
    });
  };

  const dietaryOptions = [
    { key: 'vegan', label: t.settings.dietVegan },
    { key: 'vegetarian', label: t.settings.dietVegetarian },
    { key: 'keto', label: t.settings.dietKeto },
    { key: 'glutenFree', label: t.settings.dietGlutenFree },
    { key: 'lactoseFree', label: t.settings.dietDairyFree },
    { key: 'paleo', label: t.settings.dietPaleo },
    { key: 'mediterranean', label: t.settings.dietMediterranean },
  ];

  const allergenOptions: { key: Allergen; label: string }[] = [
    { key: 'gluten', label: 'Gluten' },
    { key: 'dairy', label: t.settings.intoleranceDairy || 'Dairy' },
    { key: 'eggs', label: t.settings.intoleranceEggs || 'Eggs' },
    { key: 'nuts', label: t.settings.intoleranceNuts || 'Nuts' },
    { key: 'fish', label: t.settings.intoleranceFish || 'Fish' },
    { key: 'shellfish', label: t.settings.intoleranceShellfish || 'Shellfish' },
    { key: 'soy', label: t.settings.intoleranceSoy || 'Soy' },
  ];

  const macroSliders = [
    { key: 'cal', label: t.settings.calories, unit: 'KCAL', min: 1500, max: 4000, step: 50, accent: 'accent-primary', defaultVal: 2400 },
    { key: 'pro', label: t.settings.protein, unit: 'g', min: 50, max: 300, step: 5, accent: 'accent-primary', defaultVal: 180 },
    { key: 'carbs', label: t.settings.carbs, unit: 'g', min: 50, max: 400, step: 5, accent: 'accent-secondary', defaultVal: 250 },
    { key: 'fats', label: t.settings.fats, unit: 'g', min: 30, max: 150, step: 5, accent: 'accent-error', defaultVal: 65 },
  ] as const;

  return (
    <>
      {/* Macro Targets */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-primary" />
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.dailyGoals}</h3>
        </div>
        <div className="space-y-6">
          {macroSliders.map(({ key, label, unit, min, max, step, accent, defaultVal }) => (
            <div key={key}>
              <div className="flex justify-between text-xs font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">{label}</span>
                <span className="text-tertiary">{dailyMacros?.target?.[key] ?? defaultVal} {unit}</span>
              </div>
              <input type="range" min={min} max={max} step={step}
                value={dailyMacros?.target?.[key] ?? defaultVal}
                onChange={(e) => setDailyMacros && setDailyMacros((prev: any) => ({ ...prev, target: { ...prev.target, [key]: parseInt(e.target.value) } }))}
                className={`w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer ${accent}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Leaf className="w-6 h-6 text-primary" />
          <h3 className="font-headline text-xl font-bold text-tertiary uppercase">{t.settings.dietaryPreferences}</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {dietaryOptions.map((option) => (
            <button type="button" key={option.key}
              onClick={() => toggleDietaryPreference(option.key)}
              className={`px-4 py-2 rounded-full font-label text-xs font-bold tracking-wider uppercase transition-colors border ${
                userProfile?.dietaryPreferences?.includes(option.key)
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30 hover:border-primary/50'
              }`}>
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
            <input type="text" value={dislikeSearch}
              onChange={(e) => setDislikeSearch(e.target.value)}
              placeholder={t.settings.foodDislikesPlaceholder}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm py-2 pl-9 pr-3 text-tertiary text-sm focus:outline-none focus:border-primary" />
          </div>
          {dislikeResults.length > 0 && (
            <div className="mt-1 bg-surface-container-highest border border-outline-variant/20 rounded-sm max-h-40 overflow-y-auto">
              {dislikeResults.map((d) => (
                <button type="button" key={d.id} onClick={() => addDislike(d.id)} className="w-full text-left px-3 py-2 text-sm text-tertiary hover:bg-primary/10 transition-colors">
                  {d.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {(userProfile?.foodDislikes || []).map((id: string) => {
              const ing = dictionary.find((d) => d.id === id);
              return (
                <span key={id} className="inline-flex items-center gap-1 bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {ing?.name || id}
                  <button type="button" onClick={() => removeDislike(id)} aria-label={t.settings.removeItem} className="hover:bg-error/20 rounded-full p-0.5"><X className="w-3 h-3" aria-hidden="true" /></button>
                </span>
              );
            })}
          </div>
        </div>

        {/* Intolerances */}
        <div>
          <label className="block font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.intolerances}</label>
          <div className="flex flex-wrap gap-3">
            {allergenOptions.map((opt) => (
              <button type="button" key={opt.key}
                onClick={() => toggleIntolerance(opt.key)}
                className={`px-4 py-2 rounded-full font-label text-xs font-bold tracking-wider uppercase transition-colors border ${
                  (userProfile?.intolerances || []).includes(opt.key)
                    ? 'bg-error text-white border-error'
                    : 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30 hover:border-error/50'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
