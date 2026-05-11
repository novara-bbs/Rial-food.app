/**
 * Tests for the Google Health Connect provider stub.
 *
 * The provider is a stub (plugin not yet installed). Tests verify the
 * interface contract: correct id/label, correct platform check, correct
 * supported permissions, and that stub methods return safe empty values.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @capacitor/core so tests run in Node/jsdom without the native bridge.
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'web'),
    isNativePlatform: vi.fn(() => false),
  },
}));

import { googleFitProvider } from './google-fit';
import { Capacitor } from '@capacitor/core';

const mockCapacitor = vi.mocked(Capacitor);

beforeEach(() => {
  vi.clearAllMocks();
  mockCapacitor.getPlatform.mockReturnValue('web');
});

describe('googleFitProvider — identity', () => {
  it('has id "google-fit"', () => {
    expect(googleFitProvider.id).toBe('google-fit');
  });

  it('has a non-empty label', () => {
    expect(googleFitProvider.label.length).toBeGreaterThan(0);
  });
});

describe('googleFitProvider — isAvailable', () => {
  it('returns false on web', () => {
    mockCapacitor.getPlatform.mockReturnValue('web');
    expect(googleFitProvider.isAvailable()).toBe(false);
  });

  it('returns false on ios', () => {
    mockCapacitor.getPlatform.mockReturnValue('ios');
    expect(googleFitProvider.isAvailable()).toBe(false);
  });

  it('returns true on android', () => {
    mockCapacitor.getPlatform.mockReturnValue('android');
    expect(googleFitProvider.isAvailable()).toBe(true);
  });

  it('returns false if Capacitor throws', () => {
    mockCapacitor.getPlatform.mockImplementation(() => { throw new Error('not native'); });
    expect(googleFitProvider.isAvailable()).toBe(false);
  });
});

describe('googleFitProvider — supportedPermissions', () => {
  it('includes common health permissions', () => {
    const perms = googleFitProvider.supportedPermissions();
    expect(perms).toContain('steps');
    expect(perms).toContain('sleep');
    expect(perms).toContain('hrv');
    expect(perms).toContain('weight');
    expect(perms).toContain('height');
  });
});

describe('googleFitProvider — requestPermissions (stub)', () => {
  it('returns empty array (plugin not installed)', async () => {
    const granted = await googleFitProvider.requestPermissions(['steps', 'sleep']);
    expect(granted).toEqual([]);
  });
});

describe('googleFitProvider — fetchMetrics (stub)', () => {
  it('returns empty metrics (plugin not installed)', async () => {
    const metrics = await googleFitProvider.fetchMetrics(['steps', 'sleep']);
    expect(metrics).toEqual({});
  });

  it('never throws even with empty permissions list', async () => {
    await expect(googleFitProvider.fetchMetrics([])).resolves.toBeDefined();
  });
});
