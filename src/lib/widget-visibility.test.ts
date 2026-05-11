/**
 * Tests for widget-visibility pure logic — Sprint E [1.5.218].
 *
 * Covers:
 *   1. Default preferences shape
 *   2. Tier matrix invariants (simple ⊆ standard ⊆ advanced)
 *   3. Resolver: tier-based visibility
 *   4. Resolver: per-widget overrides (hide + force-show)
 *   5. Resolver: health-source requirements
 *   6. Resolver: combination of overrides + requirements
 *   7. Edge cases: empty section tier, unknown widget, manual source always present
 */
import { describe, it, expect } from 'vitest';
import type { HealthSourceConnection, UserPreferences, WidgetId } from '../types/preferences';
import {
  DEFAULT_TIER,
  WIDGET_MATRIX,
  WIDGET_REQUIREMENTS,
  createDefaultPreferences,
  getTierForSection,
  getVisibleWidgets,
  hasPermission,
  isWidgetInSection,
  isWidgetKnown,
  meetsHealthRequirement,
} from './widget-visibility';

const baseSources: HealthSourceConnection[] = [
  { id: 'manual', enabled: true, permissions: ['weight', 'height'], connectedAt: new Date(0).toISOString() },
];

const withPrefs = (overrides: Partial<UserPreferences> = {}): UserPreferences => ({
  ...createDefaultPreferences(),
  ...overrides,
});

// ─── 1. Defaults ─────────────────────────────────────────────────────────────

describe('createDefaultPreferences', () => {
  it('returns version 1 with empty tiers, empty overrides, manual health source', () => {
    const prefs = createDefaultPreferences();
    expect(prefs.version).toBe(1);
    expect(prefs.sectionTiers).toEqual({});
    expect(prefs.widgetOverrides).toEqual({});
    expect(prefs.healthSources).toHaveLength(1);
    expect(prefs.healthSources[0].id).toBe('manual');
    expect(prefs.healthSources[0].enabled).toBe(true);
    expect(prefs.migratedFromLegacyMode).toBe(false);
  });
});

// ─── 2. Matrix invariants ────────────────────────────────────────────────────

/**
 * Sections where lower tiers may use COMPACT variant widgets that get
 * replaced (not extended) by full widgets in higher tiers. Inclusion
 * invariant doesn't apply here. Document the alternate-pair below.
 */
const TIER_ALTERNATE_SECTIONS: Record<string, string> = {
  'home.hydration': 'simple uses hydration-chip (compact); standard/advanced use hydration-card (full). Not a subset.',
};

describe('WIDGET_MATRIX tier inclusion (simple ⊆ standard ⊆ advanced)', () => {
  it.each(Object.keys(WIDGET_MATRIX))('section %s: simple widgets all appear in standard (unless alternate variant)', (section) => {
    if (TIER_ALTERNATE_SECTIONS[section]) return;
    const tiers = WIDGET_MATRIX[section as keyof typeof WIDGET_MATRIX];
    for (const widget of tiers.simple) {
      expect(tiers.standard, `${section}: '${widget}' in simple but missing from standard`).toContain(widget);
    }
  });

  it.each(Object.keys(WIDGET_MATRIX))('section %s: standard widgets all appear in advanced (unless alternate variant)', (section) => {
    if (TIER_ALTERNATE_SECTIONS[section]) return;
    const tiers = WIDGET_MATRIX[section as keyof typeof WIDGET_MATRIX];
    for (const widget of tiers.standard) {
      expect(tiers.advanced, `${section}: '${widget}' in standard but missing from advanced`).toContain(widget);
    }
  });

  it('alternate sections are documented', () => {
    // Just verifies the alternate-list isn't silently empty if a section drops out.
    expect(Object.keys(TIER_ALTERNATE_SECTIONS).every(s => s in WIDGET_MATRIX)).toBe(true);
  });
});

describe('WIDGET_REQUIREMENTS sanity', () => {
  it('only references known widgets', () => {
    for (const id of Object.keys(WIDGET_REQUIREMENTS) as WidgetId[]) {
      expect(isWidgetKnown(id), `'${id}' has a health requirement but is not in any section matrix`).toBe(true);
    }
  });
});

// ─── 3. Tier resolver ────────────────────────────────────────────────────────

describe('getTierForSection', () => {
  it('returns explicit tier when set', () => {
    const prefs = withPrefs({ sectionTiers: { 'home.energy': 'advanced' } });
    expect(getTierForSection(prefs, 'home.energy')).toBe('advanced');
  });

  it('falls back to DEFAULT_TIER when unset', () => {
    expect(getTierForSection(createDefaultPreferences(), 'home.energy')).toBe(DEFAULT_TIER);
  });
});

// ─── 4. Override resolver ────────────────────────────────────────────────────

describe('getVisibleWidgets — overrides', () => {
  it('respects override visible:false (hides a tier-default widget)', () => {
    const prefs = withPrefs({
      sectionTiers: { 'home.energy': 'standard' },
      widgetOverrides: { 'macro-rings': { visible: false } },
    });
    expect(getVisibleWidgets('home.energy', prefs)).toEqual(['energy-arc']);
  });

  it('respects override visible:true (force-shows a higher-tier widget)', () => {
    const prefs = withPrefs({
      sectionTiers: { 'home.activity': 'simple' },     // only steps-card
      widgetOverrides: { 'exercise-card': { visible: true } },
    });
    const result = getVisibleWidgets('home.activity', prefs);
    expect(result).toContain('steps-card');
    expect(result).toContain('exercise-card');
  });

  it('ignores force-show for widgets NOT in the section matrix', () => {
    const prefs = withPrefs({
      sectionTiers: { 'home.energy': 'simple' },
      widgetOverrides: { 'sleep-card': { visible: true } }, // belongs to home.activity, not home.energy
    });
    expect(getVisibleWidgets('home.energy', prefs)).not.toContain('sleep-card');
  });
});

// ─── 5. Health-source requirements ───────────────────────────────────────────

describe('getVisibleWidgets — health source requirements', () => {
  it('hides sleep-card when no source provides sleep permission', () => {
    const prefs = withPrefs({ sectionTiers: { 'home.activity': 'advanced' }, healthSources: baseSources });
    const result = getVisibleWidgets('home.activity', prefs);
    expect(result).not.toContain('sleep-card');
    expect(result).not.toContain('hrv-card');
  });

  it('shows sleep-card when a source grants sleep permission', () => {
    const prefs = withPrefs({
      sectionTiers: { 'home.activity': 'advanced' },
      healthSources: [
        ...baseSources,
        { id: 'apple-health', enabled: true, permissions: ['sleep', 'steps'], connectedAt: new Date().toISOString() },
      ],
    });
    expect(getVisibleWidgets('home.activity', prefs)).toContain('sleep-card');
  });

  it('hides sleep-card when source is disabled even if permission listed', () => {
    const prefs = withPrefs({
      sectionTiers: { 'home.activity': 'advanced' },
      healthSources: [
        ...baseSources,
        { id: 'apple-health', enabled: false, permissions: ['sleep'], connectedAt: new Date().toISOString() },
      ],
    });
    expect(getVisibleWidgets('home.activity', prefs)).not.toContain('sleep-card');
  });

  it('force-show via override cannot bypass missing data (health-req still gates)', () => {
    const prefs = withPrefs({
      sectionTiers: { 'home.activity': 'simple' },
      widgetOverrides: { 'sleep-card': { visible: true } },
      healthSources: baseSources, // no sleep permission
    });
    expect(getVisibleWidgets('home.activity', prefs)).not.toContain('sleep-card');
  });
});

// ─── 6. Tier defaults ────────────────────────────────────────────────────────

describe('getVisibleWidgets — tier defaults', () => {
  it('uses DEFAULT_TIER (standard) when section tier is unset', () => {
    const prefs = createDefaultPreferences();
    expect(getVisibleWidgets('home.energy', prefs)).toEqual(WIDGET_MATRIX['home.energy'][DEFAULT_TIER]);
  });

  it('preserves matrix order in output', () => {
    const prefs = withPrefs({ sectionTiers: { 'home.energy': 'advanced' } });
    const expected = WIDGET_MATRIX['home.energy'].advanced;
    expect(getVisibleWidgets('home.energy', prefs)).toEqual(expected);
  });
});

// ─── 7. Helpers ──────────────────────────────────────────────────────────────

describe('hasPermission', () => {
  it('returns false when no source has the permission', () => {
    expect(hasPermission(baseSources, 'sleep')).toBe(false);
  });

  it('returns true when an enabled source grants it', () => {
    const sources: HealthSourceConnection[] = [
      ...baseSources,
      { id: 'whoop', enabled: true, permissions: ['hrv'], connectedAt: new Date().toISOString() },
    ];
    expect(hasPermission(sources, 'hrv')).toBe(true);
  });

  it('returns false when only a disabled source grants it', () => {
    const sources: HealthSourceConnection[] = [
      { id: 'whoop', enabled: false, permissions: ['hrv'], connectedAt: new Date().toISOString() },
    ];
    expect(hasPermission(sources, 'hrv')).toBe(false);
  });
});

describe('meetsHealthRequirement', () => {
  it('passes for widgets with no requirement', () => {
    expect(meetsHealthRequirement('energy-arc', baseSources)).toBe(true);
  });

  it('fails for sleep-card when no sleep permission', () => {
    expect(meetsHealthRequirement('sleep-card', baseSources)).toBe(false);
  });
});

describe('isWidgetInSection / isWidgetKnown', () => {
  it('energy-arc is in home.energy', () => {
    expect(isWidgetInSection('energy-arc', 'home.energy')).toBe(true);
  });

  it('energy-arc is NOT in home.activity', () => {
    expect(isWidgetInSection('energy-arc', 'home.activity')).toBe(false);
  });

  it('isWidgetKnown returns true for widgets in the matrix', () => {
    expect(isWidgetKnown('energy-arc')).toBe(true);
  });

  it('isWidgetKnown returns false for glucose-card (no section yet)', () => {
    // glucose-card exists in WidgetId type but is not yet placed in any section
    expect(isWidgetKnown('glucose-card')).toBe(false);
  });
});
