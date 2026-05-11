/**
 * Manual health provider — Sprint E [1.5.219] Phase 3.
 *
 * Always available on every platform. Reads biometric data that the user
 * entered manually during onboarding or later updated in Settings. This
 * provider never prompts the OS for permissions — all data comes from the
 * locally persisted `UserProfile`.
 *
 * Supported permissions: `weight`, `height` (body metrics the user typed).
 * Step counts and workout data from manual logging flow through app state
 * directly, so they are not exposed here.
 */

import type { HealthProvider, HealthMetrics } from '../types';
import type { HealthPermission } from '../../../types/preferences';
import { STORAGE_KEYS } from '../../storage-keys';

// ─── Supported subset ────────────────────────────────────────────────────────

const MANUAL_PERMISSIONS: HealthPermission[] = ['weight', 'height'];

// ─── Provider implementation ─────────────────────────────────────────────────

export const manualProvider: HealthProvider = {
  id: 'manual',
  label: 'Manual',

  isAvailable(): boolean {
    // Manual entry is always possible — no plugin or OS permission needed.
    return true;
  },

  supportedPermissions(): HealthPermission[] {
    return MANUAL_PERMISSIONS;
  },

  async requestPermissions(permissions: HealthPermission[]): Promise<HealthPermission[]> {
    // No OS dialog needed. Grant every requested permission that we support.
    return permissions.filter(p => (MANUAL_PERMISSIONS as HealthPermission[]).includes(p));
  },

  async fetchMetrics(permissions: HealthPermission[]): Promise<HealthMetrics> {
    const metrics: HealthMetrics = {};

    let profile: Record<string, unknown> | null = null;
    try {
      const raw = typeof localStorage !== 'undefined'
        ? localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
        : null;
      if (raw) profile = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      // localStorage unavailable (SSR, tests without jsdom) — return empty.
      return metrics;
    }

    if (!profile) return metrics;

    if (permissions.includes('weight') && typeof profile.weight === 'number' && profile.weight > 0) {
      metrics.weightKg = profile.weight;
    }

    if (permissions.includes('height') && typeof profile.height === 'number' && profile.height > 0) {
      metrics.heightCm = profile.height;
    }

    // Derive sex + birthDate from profile for onboarding pre-fill even though
    // they are not declared as formal HealthPermissions. Consumers that need
    // these fields can check metrics.biologicalSex / metrics.birthDate.
    if (typeof profile.sex === 'string' && (profile.sex === 'male' || profile.sex === 'female')) {
      metrics.biologicalSex = profile.sex;
    }

    if (typeof profile.age === 'number' && profile.age > 0) {
      const birthYear = new Date().getFullYear() - profile.age;
      metrics.birthDate = new Date(birthYear, 0, 1);
    }

    return metrics;
  },
};
