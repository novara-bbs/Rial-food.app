/**
 * Google Health Connect provider — Sprint E [1.5.219] Phase 3.
 *
 * STUB — the native plugin (capacitor-health-connect) is not yet
 * installed. This file exists to define the interface contract and lock
 * the health-provider-isolation convention test. When the plugin is
 * installed, replace the stub bodies with real plugin calls — nothing
 * else in the codebase needs to change.
 *
 * Dynamic `import()` is used so the bundle never breaks even if the
 * package is absent. Vite ignores the import at build time via the
 * `/* @vite-ignore *\/` comment.
 *
 * Plugin docs: https://github.com/Ad-You/capacitor-health-connect
 *
 * Installation (future owner action):
 *   npm install capacitor-health-connect
 *   npx cap sync android
 *   # Add health permissions to AndroidManifest.xml
 *   # Declare Health Connect SDK dependency in build.gradle
 */

import { Capacitor } from '@capacitor/core';
import type { HealthProvider, HealthMetrics } from '../types';
import type { HealthPermission } from '../../../types/preferences';

// ─── Permission mapping ───────────────────────────────────────────────────────

/** What Health Connect can supply once permissions are granted. */
const GOOGLE_FIT_PERMISSIONS: HealthPermission[] = [
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

export const googleFitProvider: HealthProvider = {
  id: 'google-fit',
  label: 'Health Connect',   // Google rebranded "Google Fit" to "Health Connect"

  isAvailable(): boolean {
    try {
      return Capacitor.getPlatform() === 'android';
    } catch {
      return false;
    }
  },

  supportedPermissions(): HealthPermission[] {
    return GOOGLE_FIT_PERMISSIONS;
  },

  async requestPermissions(permissions: HealthPermission[]): Promise<HealthPermission[]> {
    // STUB — no plugin installed yet.
    // Real implementation:
    //   const { HealthConnect } = await import(/* @vite-ignore */ 'capacitor-health-connect');
    //   await HealthConnect.requestHealthPermissions({ permissions: mapPermissions(permissions) });
    //   const { permissions: granted } = await HealthConnect.checkHealthPermissions({
    //     permissions: mapPermissions(permissions),
    //   });
    //   return mapBackPermissions(granted);
    void permissions;
    return [];
  },

  async fetchMetrics(permissions: HealthPermission[]): Promise<HealthMetrics> {
    // STUB — no plugin installed yet.
    // Real implementation would call HealthConnect.readRecords(...) for each
    // permission and assemble the HealthMetrics object.
    //
    // Example (steps):
    //   if (permissions.includes('steps')) {
    //     const { HealthConnect } = await import(/* @vite-ignore */ 'capacitor-health-connect');
    //     const today = new Date().toISOString().slice(0, 10);
    //     const { records } = await HealthConnect.readRecords({
    //       type: 'Steps',
    //       timeRangeFilter: { operator: 'between', startTime: today + 'T00:00:00Z', endTime: today + 'T23:59:59Z' },
    //     });
    //     metrics.steps = records.reduce((s, r) => s + r.count, 0);
    //   }
    void permissions;
    return {};
  },
};
