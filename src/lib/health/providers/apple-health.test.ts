/**
 * Tests for the Apple Health provider stub.
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

import { appleHealthProvider } from './apple-health';
import { Capacitor } from '@capacitor/core';

const mockCapacitor = vi.mocked(Capacitor);

beforeEach(() => {
  vi.clearAllMocks();
  mockCapacitor.getPlatform.mockReturnValue('web');
});

describe('appleHealthProvider — identity', () => {
  it('has id "apple-health"', () => {
    expect(appleHealthProvider.id).toBe('apple-health');
  });

  it('has a non-empty label', () => {
    expect(appleHealthProvider.label.length).toBeGreaterThan(0);
  });
});

describe('appleHealthProvider — isAvailable', () => {
  it('returns false on web', () => {
    mockCapacitor.getPlatform.mockReturnValue('web');
    expect(appleHealthProvider.isAvailable()).toBe(false);
  });

  it('returns false on android', () => {
    mockCapacitor.getPlatform.mockReturnValue('android');
    expect(appleHealthProvider.isAvailable()).toBe(false);
  });

  it('returns true on ios', () => {
    mockCapacitor.getPlatform.mockReturnValue('ios');
    expect(appleHealthProvider.isAvailable()).toBe(true);
  });

  it('returns false if Capacitor throws', () => {
    mockCapacitor.getPlatform.mockImplementation(() => { throw new Error('not native'); });
    expect(appleHealthProvider.isAvailable()).toBe(false);
  });
});

describe('appleHealthProvider — supportedPermissions', () => {
  it('includes common health permissions', () => {
    const perms = appleHealthProvider.supportedPermissions();
    expect(perms).toContain('steps');
    expect(perms).toContain('sleep');
    expect(perms).toContain('hrv');
    expect(perms).toContain('weight');
    expect(perms).toContain('height');
  });
});

describe('appleHealthProvider — requestPermissions (stub)', () => {
  it('returns empty array (plugin not installed)', async () => {
    const granted = await appleHealthProvider.requestPermissions(['steps', 'sleep']);
    expect(granted).toEqual([]);
  });
});

describe('appleHealthProvider — fetchMetrics (stub)', () => {
  it('returns empty metrics (plugin not installed)', async () => {
    const metrics = await appleHealthProvider.fetchMetrics(['steps', 'sleep']);
    expect(metrics).toEqual({});
  });

  it('never throws even with empty permissions list', async () => {
    await expect(appleHealthProvider.fetchMetrics([])).resolves.toBeDefined();
  });
});
