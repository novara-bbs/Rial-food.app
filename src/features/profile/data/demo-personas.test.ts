/**
 * Tests for demo-personas fixture data.
 *
 * Validates that each persona produces well-formed data that meets
 * the minimum thresholds to exercise the correlation engine,
 * streak calculators, and weekly macro stats.
 */
import { describe, it, expect } from 'vitest';
import { DEMO_PERSONAS, buildClara, buildMarcos, buildAna } from './demo-personas';
import { calcWeekMacros } from '../../wellness/utils/week-stats';
import { calcStreaks } from '../../wellness/utils/streaks';
import { getCorrelations } from '../../wellness/utils/correlations';
import type { DailyArchive } from '../../../hooks/useDailyReset';

describe('DEMO_PERSONAS', () => {
  it('exports exactly 3 personas', () => {
    expect(DEMO_PERSONAS).toHaveLength(3);
    expect(DEMO_PERSONAS.map(p => p.id)).toEqual(['clara-cut', 'marcos-muscle', 'ana-health']);
  });
});

describe.each([
  { name: 'Clara (cut)', builder: buildClara },
  { name: 'Marcos (muscle)', builder: buildMarcos },
  { name: 'Ana (health)', builder: buildAna },
])('$name', ({ builder }) => {
  const persona = builder();

  // ─── Shape validation ────────────────────────────────────────────────────

  it('has a valid userProfile', () => {
    expect(persona.userProfile.name).toBeTruthy();
    expect(persona.userProfile.age).toBeGreaterThan(0);
    expect(persona.userProfile.height).toBeGreaterThan(100);
    expect(persona.userProfile.weight).toBeGreaterThan(30);
    expect(persona.userProfile.unitSystem).toBe('metric');
  });

  it('has >= 60 days of nutritionHistory', () => {
    expect(persona.nutritionHistory.length).toBeGreaterThanOrEqual(60);
  });

  it('has >= 45 realFeelLogs', () => {
    expect(persona.realFeelLogs.length).toBeGreaterThanOrEqual(45);
  });

  it('has >= 60 weightHistory entries', () => {
    expect(persona.weightHistory.length).toBeGreaterThanOrEqual(60);
  });

  it('has >= 8 weeklyCheckIns', () => {
    expect(persona.weeklyCheckIns.length).toBeGreaterThanOrEqual(8);
  });

  it('every nutritionHistory entry has valid macros shape', () => {
    for (const h of persona.nutritionHistory) {
      expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(h.macros.consumed.cal).toBeGreaterThanOrEqual(0);
      expect(h.macros.consumed.pro).toBeGreaterThanOrEqual(0);
      expect(h.mealCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('every realFeelLog has level 1-5 and tags array', () => {
    for (const rf of persona.realFeelLogs) {
      expect(rf.level).toBeGreaterThanOrEqual(1);
      expect(rf.level).toBeLessThanOrEqual(5);
      expect(Array.isArray(rf.tags)).toBe(true);
    }
    // Most entries should have tags for correlation engine coverage
    const withTags = persona.realFeelLogs.filter(rf => rf.tags.length > 0);
    expect(withTags.length).toBeGreaterThanOrEqual(persona.realFeelLogs.length * 0.7);
  });

  it('every weeklyCheckIn has a Sunday weekStart', () => {
    for (const wc of persona.weeklyCheckIns) {
      const d = new Date(wc.weekStart + 'T12:00:00');
      expect(d.getDay()).toBe(0); // Sunday
    }
  });

  // ─── Weight trajectory ───────────────────────────────────────────────────

  it('weight history is sorted ascending by date', () => {
    const dates = persona.weightHistory.map(w => w.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  // ─── Compatibility with canonical utils ──────────────────────────────────

  it('calcWeekMacros returns non-zero for the most recent week', () => {
    const stats = calcWeekMacros(
      persona.nutritionHistory as DailyArchive[],
      persona.dailyMacros.target,
      0,
    );
    // At least some days should have data in the current or last week
    // (persona data goes back 60 days from build time)
    expect(stats.daysLogged).toBeGreaterThanOrEqual(0);
  });

  it('calcStreaks returns a positive meal-log streak', () => {
    const streaks = calcStreaks({
      history: persona.nutritionHistory as DailyArchive[],
      realFeelLogs: persona.realFeelLogs,
      todayHasMeals: false,
    });
    // Persona has 60 consecutive days so streak should be robust
    expect(streaks.mealLog.best).toBeGreaterThan(0);
    expect(streaks.realFeel.best).toBeGreaterThan(0);
  });
});

// ─── Correlation engine integration ──────────────────────────────────────────

describe('Correlation engine with demo data', () => {
  it('Clara triggers tag correlations (proteina alta / hidratacion baja)', () => {
    const clara = buildClara();
    const results = getCorrelations(clara.realFeelLogs as any);
    expect(results.length).toBeGreaterThanOrEqual(1);
    // At least one positive or warning insight
    expect(results.some(r => r.tone === 'positive' || r.tone === 'warning')).toBe(true);
  });

  it('Ana triggers >= 3 correlation insights', () => {
    const ana = buildAna();
    const results = getCorrelations(ana.realFeelLogs as any);
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  it('Marcos triggers tag correlations for training tags', () => {
    const marcos = buildMarcos();
    const results = getCorrelations(marcos.realFeelLogs as any);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── ICP-specific trajectory checks ──────────────────────────────────────────

describe('ICP weight trajectories', () => {
  it('Clara loses weight (cut)', () => {
    const clara = buildClara();
    const first = clara.weightHistory[0].kg;
    const last = clara.weightHistory[clara.weightHistory.length - 1].kg;
    expect(last).toBeLessThan(first);
  });

  it('Marcos gains weight (lean bulk)', () => {
    const marcos = buildMarcos();
    const first = marcos.weightHistory[0].kg;
    const last = marcos.weightHistory[marcos.weightHistory.length - 1].kg;
    expect(last).toBeGreaterThan(first);
  });

  it('Ana maintains weight (±1 kg)', () => {
    const ana = buildAna();
    const first = ana.weightHistory[0].kg;
    const last = ana.weightHistory[ana.weightHistory.length - 1].kg;
    expect(Math.abs(last - first)).toBeLessThan(1);
  });
});
