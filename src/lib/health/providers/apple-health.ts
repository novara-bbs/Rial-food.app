/**
 * Apple Health (HealthKit) provider — Sprint E [1.5.219] Phase 3.
 *
 * STUB — the native plugin (@perfood/capacitor-healthkit) is not yet
 * installed. This file exists to define the interface contract and lock
 * the health-provider-isolation convention test. When the plugin is
 * installed, replace the stub bodies with real plugin calls — nothing
 * else in the codebase needs to change.
 *
 * Dynamic `import()` is used so the bundle never breaks even if the
 * package is absent. Vite ignores the import at build time via the
 * `/* @vite-ignore *\/` comment. TypeScript does not see the module
 * types, so the import result is treated as `unknown`.
 *
 * Plugin docs: https://github.com/perfood/capacitor-healthkit
 *
 * Installation (future owner action):
 *   npm install @perfood/capacitor-healthkit
 *   npx cap sync ios
 *   # Add NSHealthShareUsageDescription to Info.plist
 *   # Add HealthKit entitlement to the Xcode target
 */

import { Capacitor } from '@capacitor/core';
import type { HealthProvider, HealthMetrics } from '../types';
import type { HealthPermission } from '../../../types/preferences';

// ─── Permission mapping ───────────────────────────────────────────────────────

/** What this provider can supply once HealthKit permission is granted. */
const APPLE_HEALTH_PERMISSIONS: HealthPermission[] = [
  'steps',
  'distance',
  'workouts',
  'sleep',
  'hrv',
  'resting-hr',
  'weight',
  'height',
];

// ─── Provider implementation ─────────────────────────────────────────────────

export const appleHealthProvider: HealthProvider = {
  id: 'apple-health',
  label: 'Apple Health',

  isAvailable(): boolean {
    try {
      return Capacitor.getPlatform() === 'ios';
    } catch {
      return false;
    }
  },

  supportedPermissions(): HealthPermission[] {
    return APPLE_HEALTH_PERMISSIONS;
  },

  async requestPermissions(permissions: HealthPermission[]): Promise<HealthPermission[]> {
    // STUB — no plugin installed yet.
    // Real implementation:
    //   const { CapacitorHealthkit } = await import(/* @vite-ignore */ '@perfood/capacitor-healthkit');
    //   await CapacitorHealthkit.requestAuthorization({ read: mapPermissions(permissions) });
    //   return permissions; // HealthKit does not report which were denied
    void permissions;
    return [];
  },

  async fetchMetrics(permissions: HealthPermission[]): Promise<HealthMetrics> {
    // STUB — no plugin installed yet.
    // Real implementation would call CapacitorHealthkit.queryHKitSampleType(...)
    // for each permission and assemble the HealthMetrics object.
    //
    // Example (steps):
    //   if (permissions.includes('steps')) {
    //     const { CapacitorHealthkit } = await import(/* @vite-ignore */ '@perfood/capacitor-healthkit');
    //     const today = new Date().toISOString().slice(0, 10);
    //     const result = await CapacitorHealthkit.queryHKitSampleType({
    //       sampleName: 'stepCount',
    //       startDate: today + 'T00:00:00Z',
    //       endDate: today + 'T23:59:59Z',
    //       limit: 1,
    //     });
    //     metrics.steps = result.countReturn;
    //   }
    void permissions;
    return {};
  },
};
