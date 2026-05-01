import { useState, useMemo } from 'react';
import { Target, Leaf, ShieldAlert, Search, X, Droplets, Footprints, Heart, Ban } from 'lucide-react';
import { useI18n } from '../../../../i18n';
import type { Ingredient, Allergen } from '../../../../types';
import type { UserProfile } from '../../../../types/user';
import type { DailyMacros } from '../../../../contexts/state/useVitalsState';
import { INPUT_SURFACE_CLASSES } from '@/components/ui/surface';
import { Heading } from '@/components/ui/Typography';

type Setter<T> = (fn: T | ((prev: T) => T)) => void;

interface HydrationState { consumed: number; target: number }
interface MovementState { steps: number; target: number; activeMinutes: number; activeTarget: number }

interface Props {
  dailyMacros: DailyMacros;
  setDailyMacros: Setter<DailyMacros>;
  userProfile: UserProfile;
  setUserProfile: Setter<UserProfile>;
  dictionary: Ingredient[];
  hydration?: HydrationState;
  setHydration?: Setter<HydrationState>;
  movement?: MovementState;
  setMovement?: Setter<MovementState>;
}

export default function SettingsNutrition({ dailyMacros, setDailyMacros, userProfile, setUserProfile, dictionary, hydration, setHydration, movement, setMovement }: Props) {
  const { t } = useI18n();
  const [dislikeSearch, setDislikeSearch] = useState('');
  const foodPreferences: Record<string, 'like' | 'dislike'> = userProfile?.foodPreferences ?? {};

  const prefSearchResults = useMemo(() => {
    if (!dislikeSearch || dislikeSearch.length < 2) return [];
    const prefs: Record<string, 'like' | 'dislike'> = userProfile?.foodPreferences ?? {};
    const q = dislikeSearch.toLowerCase();
    return dictionary
      .filter((d) => (d.name.toLowerCase().includes(q) || d.nameEn.toLowerCase().includes(q)) && !prefs[d.id])
      .slice(0, 6);
  }, [dislikeSearch, dictionary, userProfile?.foodPreferences]);

  const toggleDietaryPreference = (pref: string) => {
    if (!setUserProfile) return;
    setUserProfile((prev: UserProfile) => {
      const current = prev.dietaryPreferences || [];
      if (current.includes(pref)) return { ...prev, dietaryPreferences: current.filter((p: string) => p !== pref) };
      return { ...prev, dietaryPreferences: [...current, pref] };
    });
  };

  /** Set or toggle a food preference. Passing `null` removes the entry (neutral). */
  const setFoodPref = (id: string, pref: 'like' | 'dislike' | null) => {
    setUserProfile((prev: UserProfile) => {
      const current: Record<string, 'like' | 'dislike'> = { ...(prev.foodPreferences ?? {}) };
      if (pref === null || current[id] === pref) {
        delete current[id]; // toggle off → neutral
      } else {
        current[id] = pref;
      }
      return { ...prev, foodPreferences: current };
    });
    setDislikeSearch('');
  };

  const toggleIntolerance = (allergen: Allergen) => {
    setUserProfile((prev: UserProfile) => {
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
    { key: 'dairy', label: t.settings.intoleranceDairy },
    { key: 'eggs', label: t.settings.intoleranceEggs },
    { key: 'nuts', label: t.settings.intoleranceNuts },
    { key: 'fish', label: t.settings.intoleranceFish },
    { key: 'shellfish', label: t.settings.intoleranceShellfish },
    { key: 'soy', label: t.settings.intoleranceSoy },
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
          <Target className="w-6 h-6 text-primary" aria-hidden="true" />
          <Heading level="h3">{t.settings.dailyGoals}</Heading>
        </div>
        <div className="space-y-6">
          {macroSliders.map(({ key, label, unit, min, max, step, accent, defaultVal }) => (
            <div key={key}>
              <div className="flex justify-between text-micro font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">{label}</span>
                <span className="text-tertiary">{dailyMacros?.target?.[key] ?? defaultVal} {unit}</span>
              </div>
              <input type="range" min={min} max={max} step={step}
                value={dailyMacros?.target?.[key] ?? defaultVal}
                onChange={(e) => setDailyMacros && setDailyMacros((prev: DailyMacros) => ({ ...prev, target: { ...prev.target, [key]: parseInt(e.target.value) } }))}
                className={`w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer ${accent}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <Leaf className="w-6 h-6 text-primary" aria-hidden="true" />
          <Heading level="h3">{t.settings.dietaryPreferences}</Heading>
        </div>
        <div className="flex flex-wrap gap-3">
          {dietaryOptions.map((option) => (
            <button type="button" key={option.key}
              onClick={() => toggleDietaryPreference(option.key)}
              className={`inline-flex items-center min-h-[22px] px-2.5 rounded-full text-pico font-medium normal-case tracking-normal transition-colors border ${
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
          <ShieldAlert className="w-6 h-6 text-primary" aria-hidden="true" />
          <Heading level="h3">{t.settings.foodPreferences}</Heading>
        </div>

        {/* Trinario food preferences — R8.3 INDYA pattern */}
        <div className="mb-6">
          <label className="block font-label text-micro tracking-widest uppercase text-on-surface-variant mb-2">
            {t.settings.foodPrefSearch}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" aria-hidden="true" />
            <input type="text" value={dislikeSearch}
              onChange={(e) => setDislikeSearch(e.target.value)}
              placeholder={t.settings.foodDislikesPlaceholder}
              className={`${INPUT_SURFACE_CLASSES} w-full py-2 pl-9 pr-3 text-tertiary text-body-sm focus:outline-none focus:border-primary`} />
          </div>
          {prefSearchResults.length > 0 && (
            <div className="mt-1 bg-surface-container-highest border border-outline-variant/10 rounded-sm max-h-40 overflow-y-auto">
              {prefSearchResults.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-3 py-2 hover:bg-primary/5 transition-colors">
                  <span className="text-body-sm text-tertiary flex-1">{d.name}</span>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setFoodPref(d.id, 'like')}
                      aria-label={t.settings.prefLike}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
                      <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button type="button"
                      onClick={() => setFoodPref(d.id, 'dislike')}
                      aria-label={t.settings.prefDislike}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-error/10 hover:bg-error/20 text-error transition-colors">
                      <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Saved preferences list */}
          {Object.entries(foodPreferences).length > 0 && (
            <div className="mt-3 space-y-1">
              {Object.entries(foodPreferences).map(([id, pref]) => {
                const ing = dictionary.find((d) => d.id === id);
                const isLike = pref === 'like';
                return (
                  <div key={id} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                    <span className="text-body-sm text-on-surface flex-1">{ing?.name || id}</span>
                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => setFoodPref(id, 'like')}
                        aria-label={t.settings.prefLike}
                        aria-pressed={isLike}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isLike ? 'bg-primary text-on-primary' : 'text-on-surface-variant/40 hover:text-primary'}`}>
                        <Heart className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <button type="button"
                        onClick={() => setFoodPref(id, 'dislike')}
                        aria-label={t.settings.prefDislike}
                        aria-pressed={!isLike}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${!isLike ? 'bg-error text-white' : 'text-on-surface-variant/40 hover:text-error'}`}>
                        <Ban className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <button type="button"
                        onClick={() => setFoodPref(id, null)}
                        aria-label={t.settings.removeItem}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant/30 hover:text-on-surface-variant transition-colors">
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Intolerances */}
        <div>
          <label className="block font-label text-micro tracking-widest uppercase text-on-surface-variant mb-2">{t.settings.intolerances}</label>
          <div className="flex flex-wrap gap-3">
            {allergenOptions.map((opt) => (
              <button type="button" key={opt.key}
                onClick={() => toggleIntolerance(opt.key)}
                className={`inline-flex items-center min-h-[22px] px-2.5 rounded-full text-pico font-medium normal-case tracking-normal transition-colors border ${
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

      {/* Activity & Hydration Goals */}
      {(setHydration || setMovement) && (
        <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/20 space-y-6">
          <div className="flex items-center gap-3">
            <Droplets className="w-6 h-6 text-primary" aria-hidden="true" />
            <Heading level="h3">{t.settings.activityGoals}</Heading>
          </div>

          {/* Hydration target */}
          {setHydration && hydration && (
            <div>
              <div className="flex justify-between text-micro font-label font-bold tracking-widest uppercase mb-2">
                <span className="text-on-surface-variant">{t.settings.hydrationTarget}</span>
                <span className="text-tertiary">{hydration.target} {t.home.cups}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={hydration.target}
                onChange={(e) =>
                  setHydration((prev: HydrationState) => ({ ...prev, target: parseInt(e.target.value) }))
                }
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-secondary"
                aria-label={t.settings.hydrationTarget}
              />
            </div>
          )}

          {/* Movement goals */}
          {setMovement && movement && (
            <>
              <div>
                <div className="flex justify-between text-micro font-label font-bold tracking-widest uppercase mb-2">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <Footprints className="w-3 h-3" aria-hidden="true" />
                    {t.settings.stepsTarget}
                  </span>
                  <span className="text-tertiary">{movement.target.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={500}
                  value={movement.target}
                  onChange={(e) =>
                    setMovement((prev: MovementState) => ({ ...prev, target: parseInt(e.target.value) }))
                  }
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label={t.settings.stepsTarget}
                />
              </div>
              <div>
                <div className="flex justify-between text-micro font-label font-bold tracking-widest uppercase mb-2">
                  <span className="text-on-surface-variant">{t.settings.activeMinTarget}</span>
                  <span className="text-tertiary">{movement.activeTarget} min</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={movement.activeTarget}
                  onChange={(e) =>
                    setMovement((prev: MovementState) => ({ ...prev, activeTarget: parseInt(e.target.value) }))
                  }
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                  aria-label={t.settings.activeMinTarget}
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
