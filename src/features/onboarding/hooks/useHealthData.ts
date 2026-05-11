/**
 * useHealthData — onboarding hook for pre-filling body metrics from a
 * connected health source.
 *
 * Sprint E [1.5.219] Phase 3: refactored to consume the health provider
 * registry (`src/lib/health/registry.ts`) instead of hard-coding Apple
 * Health behaviour. The public API (`UseHealthDataResult`) is unchanged —
 * all callers continue to work without modification.
 *
 * How it works:
 *  1. Queries `getPlatformProviders()` for any provider that can supply
 *     body metrics (weight, height).
 *  2. On `enable()`, requests permission from the first available provider,
 *     fetches a `HealthMetrics` snapshot, then maps it to `HealthDataSnapshot`.
 *  3. The `?onb-health-mock=on` URL flag still works in development to
 *     simulate availability + data without a native build.
 *
 * When the real native plugins are installed, no change is needed here —
 * the registry picks them up automatically because their `isAvailable()`
 * returns true on the matching platform.
 */

import { Capacitor } from '@capacitor/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPlatformProviders } from '../../../lib/health/registry';
import type { HealthProvider } from '../../../lib/health/types';
import type { HealthPermission } from '../../../types/preferences';

// ─── Public types ─────────────────────────────────────────────────────────────

/** Biometric snapshot surfaced to the onboarding body-data step. */
export interface HealthDataSnapshot {
  weightKg: number | null;
  heightCm: number | null;
  birthDate: Date | null;
  biologicalSex: 'male' | 'female' | null;
}

export interface UseHealthDataResult {
  /** True when the platform + provider support health data access. */
  available: boolean;
  /** True when the user has enabled the toggle. */
  enabled: boolean;
  /** True while permission is being requested or data is loading. */
  loading: boolean;
  /** Non-null when the last enable() call failed. */
  error: string | null;
  /** The latest snapshot; null until the user enables access. */
  data: HealthDataSnapshot | null;
  /** Request permission and load data. */
  enable: () => Promise<void>;
  /** Clear the enabled state (does not revoke OS permission). */
  disable: () => void;
}

// ─── Permissions requested for onboarding ─────────────────────────────────────

/** The subset of permissions this hook asks for (body data only). */
const BODY_PERMISSIONS: HealthPermission[] = ['weight', 'height'];

// ─── Mock fixture for dev QA ──────────────────────────────────────────────────

const MOCK_SNAPSHOT: HealthDataSnapshot = {
  weightKg: 74,
  heightCm: 178,
  birthDate: new Date('1993-06-15'),
  biologicalSex: 'male',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map a `HealthMetrics` object to the onboarding-specific snapshot shape. */
function metricsToSnapshot(
  metrics: Awaited<ReturnType<HealthProvider['fetchMetrics']>>,
): HealthDataSnapshot {
  return {
    weightKg: metrics.weightKg ?? null,
    heightCm: metrics.heightCm ?? null,
    birthDate: metrics.birthDate ?? null,
    biologicalSex: metrics.biologicalSex ?? null,
  };
}

/** True only in a non-native dev environment with the mock flag set. */
function isMockEnabled(): boolean {
  return (
    (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true &&
    !Capacitor.isNativePlatform() &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('onb-health-mock') === 'on'
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns health data availability and an `enable()` action for the
 * onboarding body-data step.
 *
 * In development: add `?onb-health-mock=on` to the URL to simulate an
 * "available + data" state without a native build.
 */
export function useHealthData(): UseHealthDataResult {
  const useMock = isMockEnabled();

  // Find the first platform provider that can supply body metrics.
  // Computed once on mount; stable across renders (platform does not change).
  const provider = useMemo<HealthProvider | null>(() => {
    if (useMock) return null; // handled via mock path
    return (
      getPlatformProviders().find(p =>
        p.supportedPermissions().some(perm => BODY_PERMISSIONS.includes(perm)),
      ) ?? null
    );
  }, [useMock]);

  const isAvailable = useMock || provider !== null;

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HealthDataSnapshot | null>(null);

  // Reset state when availability changes (e.g. on hot-reload with flag toggle).
  useEffect(() => {
    if (!isAvailable) {
      setEnabled(false);
      setData(null);
      setError(null);
    }
  }, [isAvailable]);

  const enable = useCallback(async () => {
    if (!isAvailable) return;
    setLoading(true);
    setError(null);

    try {
      if (useMock) {
        // Dev QA path — simulate a short async delay then return mock data.
        await new Promise<void>(resolve => setTimeout(resolve, 400));
        setData(MOCK_SNAPSHOT);
        setEnabled(true);
        return;
      }

      if (!provider) return;

      // Request the body-data permissions from the platform provider.
      const granted = await provider.requestPermissions(BODY_PERMISSIONS);
      if (granted.length === 0) {
        setError('No permissions granted');
        return;
      }

      // Fetch the metrics snapshot and map to the onboarding shape.
      const metrics = await provider.fetchMetrics(granted);
      setData(metricsToSnapshot(metrics));
      setEnabled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [isAvailable, useMock, provider]);

  const disable = useCallback(() => {
    setEnabled(false);
    setData(null);
    setError(null);
  }, []);

  return { available: isAvailable, enabled, loading, error, data, enable, disable };
}
