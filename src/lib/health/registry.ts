/**
 * Health provider registry — Sprint E [1.5.219] Phase 3.
 *
 * Single entry point for all health data access in feature code.
 * Feature files must never import provider files directly — they must use
 * the helpers exported from this module. This invariant is enforced by the
 * `health-provider-isolation` convention test.
 *
 * ## Adding a new provider
 * 1. Create `src/lib/health/providers/<id>.ts` implementing `HealthProvider`.
 * 2. Import it here and add it to `ALL_PROVIDERS`.
 * 3. Add the `HealthSourceId` to `src/types/preferences.ts`.
 * Done — the UI, settings, and widget-visibility checks update automatically.
 *
 * @see src/lib/health/types.ts
 * @see src/test/conventions/health-provider-isolation.test.ts
 */

import type { HealthProvider, HealthMetrics } from './types';
import type { HealthPermission, HealthSourceId, UserPreferences } from '../../types/preferences';
import { manualProvider } from './providers/manual';
import { appleHealthProvider } from './providers/apple-health';
import { googleFitProvider } from './providers/google-fit';

// ─── Provider registry ───────────────────────────────────────────────────────

/**
 * All registered providers, in priority order.
 * `manual` is always first — it is the fallback that is always available.
 * Native providers are checked second (only one platform runs at a time).
 */
const ALL_PROVIDERS: readonly HealthProvider[] = [
  manualProvider,
  appleHealthProvider,
  googleFitProvider,
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * All providers that `isAvailable()` on the current platform, regardless of
 * user preferences. Used by the onboarding flow to discover what can be
 * offered before any preferences exist.
 */
export function getPlatformProviders(): HealthProvider[] {
  return ALL_PROVIDERS.filter(p => p.isAvailable());
}

/**
 * Providers that are both available on this platform AND enabled in the
 * user's preferences (i.e. the user has connected them). Used by widget
 * visibility to decide which health-gated widgets to unlock.
 *
 * @param prefs The current `UserPreferences` (from `useAppState().preferences`).
 */
export function getActiveProviders(prefs: UserPreferences): HealthProvider[] {
  const connectedIds = new Set(
    prefs.healthSources.filter(s => s.enabled).map(s => s.id),
  );
  return ALL_PROVIDERS.filter(p => p.isAvailable() && connectedIds.has(p.id));
}

/**
 * Look up a specific provider by its `HealthSourceId`.
 * Returns `undefined` if the id is not registered (future-safe for
 * preferences that reference a provider not yet in this build).
 */
export function getProviderById(id: HealthSourceId): HealthProvider | undefined {
  return ALL_PROVIDERS.find(p => p.id === id);
}

/**
 * Union of all `HealthPermission` values granted across the user's active
 * sources. A widget that requires `'sleep'` permission will only render if
 * this set includes `'sleep'`.
 *
 * This reads from `prefs.healthSources[].permissions` — the permissions the
 * user previously granted via `requestPermissions()`. It does NOT call any
 * plugin at render time.
 */
export function getAvailablePermissions(prefs: UserPreferences): Set<HealthPermission> {
  const perms = new Set<HealthPermission>();
  for (const source of prefs.healthSources) {
    if (!source.enabled) continue;
    for (const perm of source.permissions) {
      perms.add(perm);
    }
  }
  return perms;
}

/**
 * Convenience: fetch a merged `HealthMetrics` snapshot from all active
 * providers. Later providers overwrite earlier ones on a per-field basis,
 * so native sources (Apple Health, Google Fit) win over manual entries.
 *
 * Returns `{}` if no providers are active or all providers return empty.
 * Never throws.
 *
 * @param prefs The current user preferences.
 */
export async function fetchMergedMetrics(prefs: UserPreferences): Promise<HealthMetrics> {
  const providers = getActiveProviders(prefs);
  const grantedPerms = getAvailablePermissions(prefs);
  const permsArray = Array.from(grantedPerms);

  let merged: HealthMetrics = {};
  for (const provider of providers) {
    try {
      const metrics = await provider.fetchMetrics(permsArray);
      merged = { ...merged, ...metrics };
    } catch {
      // Never let one provider failure affect others.
    }
  }
  return merged;
}
