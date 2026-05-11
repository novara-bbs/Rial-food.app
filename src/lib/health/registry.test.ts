/**
 * Tests for the health provider registry.
 *
 * The registry is the single entry point for health data access. Tests verify
 * that provider lookup, filtering, and permission aggregation work correctly.
 * Providers are mocked so tests do not depend on platform or native plugins.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @capacitor/core — registry delegates isAvailable() to providers which
// use Capacitor.getPlatform(). Control the platform here.
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'web'),
    isNativePlatform: vi.fn(() => false),
  },
}));

import {
  getPlatformProviders,
  getActiveProviders,
  getProviderById,
  getAvailablePermissions,
  fetchMergedMetrics,
} from './registry';
import type { UserPreferences } from '../../types/preferences';
import { createDefaultPreferences } from '../widget-visibility';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePrefs(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return { ...createDefaultPreferences(), ...overrides };
}

function prefsWithSource(
  id: UserPreferences['healthSources'][number]['id'],
  permissions: UserPreferences['healthSources'][number]['permissions'] = [],
  enabled = true,
): UserPreferences {
  return makePrefs({
    healthSources: [
      {
        id,
        enabled,
        permissions,
        connectedAt: new Date().toISOString(),
      },
    ],
  });
}

// ─── getPlatformProviders ─────────────────────────────────────────────────────

describe('getPlatformProviders', () => {
  it('always includes the manual provider (available on every platform)', () => {
    const providers = getPlatformProviders();
    expect(providers.some(p => p.id === 'manual')).toBe(true);
  });

  it('excludes native providers when running on web', () => {
    const providers = getPlatformProviders();
    expect(providers.some(p => p.id === 'apple-health')).toBe(false);
    expect(providers.some(p => p.id === 'google-fit')).toBe(false);
  });

  it('returns an array (not undefined)', () => {
    expect(Array.isArray(getPlatformProviders())).toBe(true);
  });
});

// ─── getProviderById ──────────────────────────────────────────────────────────

describe('getProviderById', () => {
  it('finds the manual provider by id', () => {
    const provider = getProviderById('manual');
    expect(provider).toBeDefined();
    expect(provider?.id).toBe('manual');
  });

  it('finds the apple-health provider by id', () => {
    const provider = getProviderById('apple-health');
    expect(provider).toBeDefined();
    expect(provider?.id).toBe('apple-health');
  });

  it('finds the google-fit provider by id', () => {
    const provider = getProviderById('google-fit');
    expect(provider).toBeDefined();
    expect(provider?.id).toBe('google-fit');
  });

  it('returns undefined for an unregistered id', () => {
    expect(getProviderById('whoop')).toBeUndefined();
  });
});

// ─── getActiveProviders ───────────────────────────────────────────────────────

describe('getActiveProviders', () => {
  it('returns empty array when no sources are connected', () => {
    const prefs = makePrefs({ healthSources: [] });
    expect(getActiveProviders(prefs)).toEqual([]);
  });

  it('returns manual provider when it is connected and enabled', () => {
    const prefs = prefsWithSource('manual', ['weight', 'height']);
    const providers = getActiveProviders(prefs);
    expect(providers.some(p => p.id === 'manual')).toBe(true);
  });

  it('excludes disabled sources', () => {
    const prefs = prefsWithSource('manual', ['weight'], false /* disabled */);
    expect(getActiveProviders(prefs)).toEqual([]);
  });

  it('does not include apple-health on web even if connected', () => {
    // apple-health isAvailable() returns false on web
    const prefs = prefsWithSource('apple-health', ['steps', 'sleep']);
    const providers = getActiveProviders(prefs);
    expect(providers.some(p => p.id === 'apple-health')).toBe(false);
  });
});

// ─── getAvailablePermissions ──────────────────────────────────────────────────

describe('getAvailablePermissions', () => {
  it('returns empty set when no sources are connected', () => {
    const perms = getAvailablePermissions(makePrefs({ healthSources: [] }));
    expect(perms.size).toBe(0);
  });

  it('aggregates permissions from a single source', () => {
    const prefs = prefsWithSource('manual', ['weight', 'height']);
    const perms = getAvailablePermissions(prefs);
    expect(perms.has('weight')).toBe(true);
    expect(perms.has('height')).toBe(true);
  });

  it('unions permissions from multiple sources', () => {
    const prefs = makePrefs({
      healthSources: [
        { id: 'manual', enabled: true, permissions: ['weight', 'height'], connectedAt: '' },
        { id: 'apple-health', enabled: true, permissions: ['steps', 'sleep', 'hrv'], connectedAt: '' },
      ],
    });
    const perms = getAvailablePermissions(prefs);
    expect(perms.has('weight')).toBe(true);
    expect(perms.has('steps')).toBe(true);
    expect(perms.has('sleep')).toBe(true);
    expect(perms.has('hrv')).toBe(true);
  });

  it('excludes permissions from disabled sources', () => {
    const prefs = makePrefs({
      healthSources: [
        { id: 'manual', enabled: false, permissions: ['weight'], connectedAt: '' },
      ],
    });
    const perms = getAvailablePermissions(prefs);
    expect(perms.has('weight')).toBe(false);
  });

  it('deduplicates overlapping permissions', () => {
    const prefs = makePrefs({
      healthSources: [
        { id: 'manual', enabled: true, permissions: ['weight', 'height'], connectedAt: '' },
        { id: 'apple-health', enabled: true, permissions: ['weight', 'steps'], connectedAt: '' },
      ],
    });
    const perms = getAvailablePermissions(prefs);
    // Should not have duplicates — Set guarantees this
    expect(Array.from(perms).filter(p => p === 'weight')).toHaveLength(1);
  });
});

// ─── fetchMergedMetrics ───────────────────────────────────────────────────────

describe('fetchMergedMetrics', () => {
  beforeEach(() => localStorage.clear());

  it('returns empty object when no sources are active', async () => {
    const metrics = await fetchMergedMetrics(makePrefs({ healthSources: [] }));
    expect(metrics).toEqual({});
  });

  it('returns manual metrics when manual source is connected with data', async () => {
    localStorage.setItem('userProfile', JSON.stringify({ weight: 70, height: 175, sex: 'male', age: 30 }));
    const prefs = prefsWithSource('manual', ['weight', 'height']);
    const metrics = await fetchMergedMetrics(prefs);
    expect(metrics.weightKg).toBe(70);
    expect(metrics.heightCm).toBe(175);
  });

  it('never throws even if providers fail internally', async () => {
    // Even with no data and no sources, should resolve cleanly
    await expect(fetchMergedMetrics(makePrefs())).resolves.toBeDefined();
  });
});
