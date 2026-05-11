/**
 * Tests for usePreferencesState — Sprint E [1.5.218].
 *
 * Covers:
 *   - migrateFromLegacyMode pure function:
 *       - mode='simple'    → all sections 'simple'
 *       - mode='advanced'  → all sections 'advanced'
 *       - mode=undefined + existing profile → all sections 'simple'
 *       - mode=undefined + fresh install     → sectionTiers stays empty
 *       - idempotent (second call returns same shape with no double-write)
 *       - already-migrated input returns unchanged
 */
import { describe, it, expect } from 'vitest';
import { createDefaultPreferences } from '../../lib/widget-visibility';
import { SECTIONS } from '../../types/preferences';
import { migrateFromLegacyMode } from './usePreferencesState';

describe('migrateFromLegacyMode', () => {
  it("mode='simple' applies tier 'simple' to every section", () => {
    const prefs = createDefaultPreferences();
    const result = migrateFromLegacyMode(prefs, 'simple', true);
    expect(result.migratedFromLegacyMode).toBe(true);
    for (const section of SECTIONS) {
      expect(result.sectionTiers[section]).toBe('simple');
    }
  });

  it("mode='advanced' applies tier 'advanced' to every section", () => {
    const prefs = createDefaultPreferences();
    const result = migrateFromLegacyMode(prefs, 'advanced', true);
    expect(result.migratedFromLegacyMode).toBe(true);
    for (const section of SECTIONS) {
      expect(result.sectionTiers[section]).toBe('advanced');
    }
  });

  it('mode=undefined + existing profile → all sections simple (preserves legacy default)', () => {
    const prefs = createDefaultPreferences();
    const result = migrateFromLegacyMode(prefs, undefined, true);
    expect(result.migratedFromLegacyMode).toBe(true);
    for (const section of SECTIONS) {
      expect(result.sectionTiers[section]).toBe('simple');
    }
  });

  it('mode=undefined + NO existing profile → sectionTiers empty (DEFAULT_TIER applies)', () => {
    const prefs = createDefaultPreferences();
    const result = migrateFromLegacyMode(prefs, undefined, false);
    expect(result.migratedFromLegacyMode).toBe(true);
    expect(result.sectionTiers).toEqual({});
  });

  it('is idempotent — second call after already-migrated returns input unchanged', () => {
    const first = migrateFromLegacyMode(createDefaultPreferences(), 'advanced', true);
    const second = migrateFromLegacyMode(first, 'simple', true);
    // Second call should NOT re-migrate (would overwrite tiers).
    expect(second).toBe(first);
    expect(second.sectionTiers['home.energy']).toBe('advanced');
  });

  it('preserves widgetOverrides and healthSources during migration', () => {
    const prefs = {
      ...createDefaultPreferences(),
      widgetOverrides: { 'sleep-card': { visible: true } },
      healthSources: [
        ...createDefaultPreferences().healthSources,
        { id: 'apple-health' as const, enabled: true, permissions: ['sleep' as const], connectedAt: '2026-01-01T00:00:00Z' },
      ],
    };
    const result = migrateFromLegacyMode(prefs, 'simple', true);
    expect(result.widgetOverrides).toEqual(prefs.widgetOverrides);
    expect(result.healthSources).toEqual(prefs.healthSources);
  });

  it('does not mutate the input object', () => {
    const prefs = createDefaultPreferences();
    const snapshot = JSON.parse(JSON.stringify(prefs));
    migrateFromLegacyMode(prefs, 'simple', true);
    expect(prefs).toEqual(snapshot);
  });
});
