/**
 * Tests for the manual health provider.
 *
 * The manual provider reads biometric data from localStorage (the persisted
 * UserProfile). It is always available and never needs OS permissions.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { manualProvider } from './manual';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setProfile(partial: Record<string, unknown>) {
  localStorage.setItem('userProfile', JSON.stringify(partial));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('manualProvider — identity', () => {
  it('has id "manual"', () => {
    expect(manualProvider.id).toBe('manual');
  });

  it('has a non-empty label', () => {
    expect(manualProvider.label.length).toBeGreaterThan(0);
  });
});

describe('manualProvider — isAvailable', () => {
  it('is always available (returns true)', () => {
    expect(manualProvider.isAvailable()).toBe(true);
  });
});

describe('manualProvider — supportedPermissions', () => {
  it('includes weight and height', () => {
    const perms = manualProvider.supportedPermissions();
    expect(perms).toContain('weight');
    expect(perms).toContain('height');
  });
});

describe('manualProvider — requestPermissions', () => {
  it('grants all requested permissions that it supports', async () => {
    const granted = await manualProvider.requestPermissions(['weight', 'height']);
    expect(granted).toEqual(expect.arrayContaining(['weight', 'height']));
  });

  it('does not grant unsupported permissions', async () => {
    const granted = await manualProvider.requestPermissions(['sleep', 'hrv'] as any);
    expect(granted).toHaveLength(0);
  });

  it('partially grants a mixed list', async () => {
    const granted = await manualProvider.requestPermissions(['weight', 'sleep'] as any);
    expect(granted).toContain('weight');
    expect(granted).not.toContain('sleep');
  });
});

describe('manualProvider — fetchMetrics (no profile)', () => {
  it('returns empty metrics when localStorage is empty', async () => {
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics).toEqual({});
  });

  it('returns empty metrics when profile has no weight/height', async () => {
    setProfile({ name: 'Test' });
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics.weightKg).toBeUndefined();
    expect(metrics.heightCm).toBeUndefined();
  });
});

describe('manualProvider — fetchMetrics (with profile)', () => {
  it('returns weightKg from profile when weight permission is requested', async () => {
    setProfile({ weight: 72, height: 175, sex: 'male', age: 30 });
    const metrics = await manualProvider.fetchMetrics(['weight']);
    expect(metrics.weightKg).toBe(72);
    expect(metrics.heightCm).toBeUndefined(); // not requested
  });

  it('returns heightCm from profile when height permission is requested', async () => {
    setProfile({ weight: 72, height: 175, sex: 'male', age: 30 });
    const metrics = await manualProvider.fetchMetrics(['height']);
    expect(metrics.heightCm).toBe(175);
    expect(metrics.weightKg).toBeUndefined(); // not requested
  });

  it('returns both weight and height when both are requested', async () => {
    setProfile({ weight: 65, height: 162, sex: 'female', age: 28 });
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics.weightKg).toBe(65);
    expect(metrics.heightCm).toBe(162);
  });

  it('includes biologicalSex from profile (female)', async () => {
    setProfile({ weight: 60, height: 165, sex: 'female', age: 25 });
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics.biologicalSex).toBe('female');
  });

  it('includes biologicalSex from profile (male)', async () => {
    setProfile({ weight: 80, height: 180, sex: 'male', age: 35 });
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics.biologicalSex).toBe('male');
  });

  it('includes a birthDate derived from age', async () => {
    setProfile({ weight: 75, height: 178, sex: 'male', age: 32 });
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics.birthDate).toBeInstanceOf(Date);
    const expectedYear = new Date().getFullYear() - 32;
    expect(metrics.birthDate?.getFullYear()).toBe(expectedYear);
  });

  it('ignores zero/negative weight', async () => {
    setProfile({ weight: 0, height: 175 });
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics.weightKg).toBeUndefined();
  });

  it('ignores zero/negative height', async () => {
    setProfile({ weight: 70, height: -1 });
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics.heightCm).toBeUndefined();
  });
});

describe('manualProvider — fetchMetrics (corrupted storage)', () => {
  it('returns empty metrics gracefully when localStorage contains invalid JSON', async () => {
    localStorage.setItem('userProfile', 'not-json');
    const metrics = await manualProvider.fetchMetrics(['weight', 'height']);
    expect(metrics).toEqual({});
  });
});
