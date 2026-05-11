/**
 * Preferences state slice — Sprint E [1.5.218].
 *
 * Owns the user preferences schema (tier per section + per-widget
 * overrides + connected health sources). Auto-migrates from the legacy
 * `UserProfile.mode: 'simple' | 'advanced'` field once at hydration.
 *
 * Hook composition pattern matches `useProfileState` etc. — see ADR-015.
 *
 * Migration policy:
 *  - If `preferences` exists in localStorage → use it (no migration needed).
 *  - Else if `userProfile` exists AND has `mode` → migrate (one-time):
 *      - mode='simple'   → all sections tier='simple'
 *      - mode='advanced' → all sections tier='advanced'
 *  - Else if `userProfile` exists but `mode` is undefined → tier='simple'
 *    (preserves the legacy default behavior on the home dashboard).
 *  - Else (no `userProfile`, fresh install) → leave sectionTiers empty
 *    so DEFAULT_TIER ('standard') applies — new users get the better view.
 *
 * The migration runs once and stamps `migratedFromLegacyMode: true` to
 * be idempotent across hot reloads and HMR.
 */
import { useEffect } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { STORAGE_KEYS } from '../../lib/storage-keys';
import { createDefaultPreferences } from '../../lib/widget-visibility';
import type {
  DetailTier,
  HealthSourceConnection,
  Section,
  UserPreferences,
  WidgetId,
  WidgetOverride,
} from '../../types/preferences';
import type { UserProfile } from '../../types/user';
import { SECTIONS } from '../../types/preferences';

// ─── Migration ───────────────────────────────────────────────────────────────

/**
 * Pure function. Migrate from legacy `UserProfile.mode` to the new
 * preferences schema. Idempotent — calling twice returns the same result.
 *
 * @param prefs Current preferences (may be default if first run)
 * @param profileMode Value of `userProfile.mode` ('simple', 'advanced', or undefined)
 * @param hasExistingProfile True if a UserProfile was already persisted
 *                           (distinguishes "established user" from "fresh install")
 */
export function migrateFromLegacyMode(
  prefs: UserPreferences,
  profileMode: UserProfile['mode'],
  hasExistingProfile: boolean,
): UserPreferences {
  if (prefs.migratedFromLegacyMode) return prefs;

  // Decide the tier to apply across all sections.
  let tier: DetailTier;
  if (profileMode === 'advanced') {
    tier = 'advanced';
  } else if (profileMode === 'simple') {
    tier = 'simple';
  } else if (hasExistingProfile) {
    // Established user with no explicit mode — preserve the legacy
    // home-dashboard default which treated `mode !== 'advanced'` as simple.
    tier = 'simple';
  } else {
    // Fresh install — leave sectionTiers empty, DEFAULT_TIER ('standard')
    // applies via the visibility resolver.
    return { ...prefs, migratedFromLegacyMode: true };
  }

  const sectionTiers: Partial<Record<Section, DetailTier>> = {};
  for (const section of SECTIONS) {
    sectionTiers[section] = tier;
  }

  return {
    ...prefs,
    sectionTiers,
    migratedFromLegacyMode: true,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface PreferencesActions {
  setTier: (section: Section, tier: DetailTier) => void;
  setWidgetOverride: (widget: WidgetId, override: WidgetOverride | null) => void;
  addHealthSource: (source: HealthSourceConnection) => void;
  updateHealthSource: (id: HealthSourceConnection['id'], patch: Partial<HealthSourceConnection>) => void;
  removeHealthSource: (id: HealthSourceConnection['id']) => void;
  resetPreferences: () => void;
}

export function usePreferencesState(
  profileMode: UserProfile['mode'],
  hasExistingProfile: boolean,
): { preferences: UserPreferences; actions: PreferencesActions } {
  const [preferences, setPreferences] = useLocalStorageState<UserPreferences>(
    STORAGE_KEYS.PREFERENCES,
    createDefaultPreferences(),
  );

  // One-shot migration from legacy `userProfile.mode`. Idempotent via the
  // `migratedFromLegacyMode` flag inside the schema.
  useEffect(() => {
    if (preferences.migratedFromLegacyMode) return;
    setPreferences(prev => migrateFromLegacyMode(prev, profileMode, hasExistingProfile));
    // We intentionally don't include `profileMode` / `hasExistingProfile`
    // in deps — migration is a one-time event at the first render of a
    // session, driven by `preferences.migratedFromLegacyMode`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.migratedFromLegacyMode]);

  const actions: PreferencesActions = {
    setTier(section, tier) {
      setPreferences(prev => ({ ...prev, sectionTiers: { ...prev.sectionTiers, [section]: tier } }));
    },
    setWidgetOverride(widget, override) {
      setPreferences(prev => {
        const next = { ...prev.widgetOverrides };
        if (override == null) {
          delete next[widget];
        } else {
          next[widget] = override;
        }
        return { ...prev, widgetOverrides: next };
      });
    },
    addHealthSource(source) {
      setPreferences(prev => {
        const idx = prev.healthSources.findIndex(s => s.id === source.id);
        const next = [...prev.healthSources];
        if (idx >= 0) next[idx] = source;
        else next.push(source);
        return { ...prev, healthSources: next };
      });
    },
    updateHealthSource(id, patch) {
      setPreferences(prev => ({
        ...prev,
        healthSources: prev.healthSources.map(s => (s.id === id ? { ...s, ...patch } : s)),
      }));
    },
    removeHealthSource(id) {
      setPreferences(prev => ({
        ...prev,
        healthSources: prev.healthSources.filter(s => s.id !== id),
      }));
    },
    resetPreferences() {
      setPreferences(createDefaultPreferences());
    },
  };

  return { preferences, actions };
}
