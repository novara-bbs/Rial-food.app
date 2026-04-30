/**
 * useHealthData — abstraction over Apple Health (HealthKit) and Google
 * Health Connect for the onboarding body-data step.
 *
 * This module exports the shared interface + the stub implementation.
 * When the native plugins are ready (requires Apple Developer Health
 * entitlement, Info.plist NSHealthShareUsageDescription, and
 * AndroidManifest health.READ_* permissions), swap the stub body for the
 * real plugin calls — everything else stays the same.
 *
 * TODO: replace stub with:
 *   - iOS: @perfood/capacitor-healthkit
 *   - Android: capacitor-health-connect
 * See docs/ai/state.md "Active plan" for the deferred sprint reference.
 *
 * Dev QA: add ?onb-health-mock=on to the URL in development to simulate
 * an "available + data" state without a native build.
 */
import { Capacitor } from '@capacitor/core';
import { useCallback, useEffect, useState } from 'react';

// ── Public types ──────────────────────────────────────────────────────────────

export interface HealthDataSnapshot {
  weightKg: number | null;
  heightCm: number | null;
  birthDate: Date | null;
  biologicalSex: 'male' | 'female' | null;
}

export interface UseHealthDataResult {
  /** True when the platform and plugin support health data access. */
  available: boolean;
  /** True when the user has enabled the toggle. */
  enabled: boolean;
  /** True while permission is being requested or data is loading. */
  loading: boolean;
  /** Non-null when the last enable() call failed. Already localized caller side. */
  error: string | null;
  /** The latest snapshot; null until the user enables access. */
  data: HealthDataSnapshot | null;
  /** Request permission and load data. */
  enable: () => Promise<void>;
  /** Clear the enabled state (does not revoke OS permission). */
  disable: () => void;
}

// ── Mock fixture for dev QA ───────────────────────────────────────────────────

const MOCK_SNAPSHOT: HealthDataSnapshot = {
  weightKg: 74,
  heightCm: 178,
  birthDate: new Date('1993-06-15'),
  biologicalSex: 'male',
};

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns a stub that always reports `available: false` on web and on
 * native builds where the health plugins are not yet installed.
 *
 * In development, ?onb-health-mock=on simulates availability + data so
 * the HealthSyncCard UI can be exercised without a native build.
 */
export function useHealthData(): UseHealthDataResult {
  const isMock =
    (import.meta as any)?.env?.DEV === true &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('onb-health-mock') === 'on';

  // On a real native build, check Capacitor.isNativePlatform() AND whether
  // the health plugin is registered. Stub: always false unless mock flag.
  const isAvailable = isMock && !Capacitor.isNativePlatform() === false
    ? false  // native but plugins not installed → false
    : isMock; // mock flag active in dev → simulate available

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HealthDataSnapshot | null>(null);

  // Clear state when availability changes (e.g. on hot-reload with flag toggle).
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
      // TODO: real plugin — request permission here.
      // Stub: simulate a short async delay then return mock data.
      await new Promise<void>(resolve => setTimeout(resolve, 400));
      setData(MOCK_SNAPSHOT);
      setEnabled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [isAvailable]);

  const disable = useCallback(() => {
    setEnabled(false);
    setData(null);
    setError(null);
  }, []);

  return { available: isAvailable, enabled, loading, error, data, enable, disable };
}
