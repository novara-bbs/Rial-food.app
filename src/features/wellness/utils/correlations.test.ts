/**
 * Tests for the Correlation Engine (correlations.ts)
 * Covers: getCorrelations, getInsights, getFoodInsights
 */
import { describe, it, expect } from 'vitest';
import { getCorrelations, getInsights, getFoodInsights } from './correlations';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeLog(overrides: Partial<{
  id: number;
  date: string;
  level: number;
  tags: string[];
  energy?: 'high' | 'stable' | 'low';
  digestion?: 'clean' | 'sensitive' | 'bloated';
  mindset?: 'calm' | 'balanced' | 'stressed';
}> = {}) {
  return {
    id: overrides.id ?? Date.now(),
    date: overrides.date ?? new Date().toISOString(),
    level: overrides.level ?? 3,
    tags: overrides.tags ?? [],
    energy: overrides.energy,
    digestion: overrides.digestion,
    mindset: overrides.mindset,
  };
}

/** Generate N logs spread over N days with a given level and tags */
function generateLogs(count: number, level: number, tags: string[] = [], dayOffset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (dayOffset + i));
    d.setHours(9 + (i % 3) * 3, 0, 0, 0); // Distribute across morning/afternoon/evening
    return makeLog({ id: i + 1, date: d.toISOString(), level, tags });
  });
}

// ─── getCorrelations ─────────────────────────────────────────────────────────

describe('getCorrelations', () => {
  it('returns empty array for fewer than 7 logs', () => {
    const logs = generateLogs(5, 3, ['ligereza']);
    const result = getCorrelations(logs);
    expect(Array.isArray(result)).toBe(true);
    // Tag correlations require ≥7 logs
    expect(result.filter(r => r.id.startsWith('tag-'))).toHaveLength(0);
  });

  it('detects positive tag correlation when tag appears in high-level logs', () => {
    // 10 logs with 'ligereza' tag at level 4-5, 5 logs without at level 2
    const highLogs = generateLogs(10, 5, ['ligereza']);
    const lowLogs = generateLogs(5, 2, []);
    const result = getCorrelations([...highLogs, ...lowLogs]);
    const tagInsight = result.find(r => r.id === 'tag-ligereza');
    expect(tagInsight).toBeDefined();
    expect(tagInsight?.tone).toBe('positive');
    expect(tagInsight?.confidence).toBeGreaterThan(0);
    expect(tagInsight?.confidence).toBeLessThanOrEqual(1);
  });

  it('detects warning tag correlation when tag appears in low-level logs', () => {
    // 10 logs with 'hinchazón' tag at level 1-2, 5 logs without at level 4
    const lowLogs = generateLogs(10, 1, ['hinchazón']);
    const highLogs = generateLogs(5, 4, []);
    const result = getCorrelations([...lowLogs, ...highLogs]);
    const tagInsight = result.find(r => r.id === 'tag-hinchazón');
    expect(tagInsight).toBeDefined();
    expect(tagInsight?.tone).toBe('warning');
  });

  it('returns insights sorted by confidence descending', () => {
    const logs = [
      ...generateLogs(10, 5, ['ligereza']),
      ...generateLogs(8, 1, ['hinchazón']),
      ...generateLogs(4, 3),
    ];
    const result = getCorrelations(logs);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].confidence).toBeGreaterThanOrEqual(result[i].confidence);
    }
  });

  it('each insight has required fields', () => {
    const logs = [
      ...generateLogs(10, 5, ['ligereza']),
      ...generateLogs(5, 2),
    ];
    const result = getCorrelations(logs);
    for (const insight of result) {
      expect(typeof insight.id).toBe('string');
      expect(typeof insight.title).toBe('string');
      expect(typeof insight.detail).toBe('string');
      expect(typeof insight.confidence).toBe('number');
      expect(['positive', 'warning', 'neutral']).toContain(insight.tone);
      expect(typeof insight.emoji).toBe('string');
    }
  });

  it('detects consistency trend for improving logs', () => {
    // Create logs where recent logs are higher level than older ones
    const olderLogs = Array.from({ length: 10 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (20 + i));
      return makeLog({ id: i, date: d.toISOString(), level: 2, tags: [] });
    });
    const recentLogs = Array.from({ length: 10 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return makeLog({ id: 100 + i, date: d.toISOString(), level: 5, tags: [] });
    });
    const result = getCorrelations([...olderLogs, ...recentLogs]);
    const trend = result.find(r => r.id === 'trend-consistency');
    // With clear improvement (avg 2→5), should detect positive trend
    expect(trend).toBeDefined();
    expect(trend?.tone).toBe('positive');
  });
});

// ─── getInsights ─────────────────────────────────────────────────────────────

describe('getInsights', () => {
  const defaultCtx = {
    realFeelLogs: generateLogs(7, 3),
    savedRecipes: [],
    mealPlan: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    dailyMacros: { target: { cal: 2000, pro: 150, carbs: 220, fats: 60 }, consumed: { cal: 0, pro: 0, carbs: 0, fats: 0 } },
    hydration: { glasses: 2, target: 8 },
    streakDays: 3,
  };

  it('returns an array of InsightRecommendation objects', () => {
    const result = getInsights(defaultCtx);
    expect(Array.isArray(result)).toBe(true);
  });

  it('each insight has required fields', () => {
    const result = getInsights(defaultCtx);
    for (const insight of result) {
      expect(typeof insight.id).toBe('string');
      expect(typeof insight.title).toBe('string');
      expect(typeof insight.detail).toBe('string');
      expect(typeof insight.confidence).toBe('number');
      expect(['positive', 'warning', 'neutral']).toContain(insight.tone);
      expect(['timing', 'composition', 'adherence', 'wellbeing']).toContain(insight.category);
    }
  });

  it('generates hydration insight when consumed < 60% of target', () => {
    const ctx = { ...defaultCtx, hydration: { consumed: 1, glasses: 1, target: 8 } };
    const result = getInsights(ctx);
    const hydrationInsight = result.find(r => r.id === 'hydration-low');
    expect(hydrationInsight).toBeDefined();
    expect(hydrationInsight?.tone).toBe('warning');
  });

  it('generates protein insight when consumed is below 80% of target', () => {
    const ctx = {
      ...defaultCtx,
      // consumed.pro (10) is 33% of target.pro (30) — well below 80% threshold
      dailyMacros: { target: { cal: 2000, pro: 30, carbs: 220, fats: 60 }, consumed: { cal: 500, pro: 10, carbs: 50, fats: 15 } },
    };
    const result = getInsights(ctx);
    const proteinInsight = result.find(r => r.id === 'protein-low');
    expect(proteinInsight).toBeDefined();
    expect(proteinInsight?.tone).toBe('warning');
  });

  it('sorts results by confidence descending', () => {
    const result = getInsights(defaultCtx);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].confidence).toBeGreaterThanOrEqual(result[i].confidence);
    }
  });
});

// ─── getFoodInsights ─────────────────────────────────────────────────────────

describe('getFoodInsights', () => {
  const mockDictionary = [
    { id: 'ing-1', name: 'Pollo', allergens: [], category: 'Proteína', tags: ['animal'], macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 }, baseUnit: 'g' },
    { id: 'ing-2', name: 'Brócoli', allergens: [], category: 'Verdura', tags: ['vegetal'], macros: { calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4 }, baseUnit: 'g' },
    { id: 'ing-3', name: 'Huevo', allergens: ['huevo'], category: 'Proteína', tags: ['animal'], macros: { calories: 155, protein: 13, carbs: 1.1, fats: 11 }, baseUnit: 'g' },
  ] as any[];

  it('returns empty array for fewer than 7 linked logs', () => {
    const logs = Array.from({ length: 5 }, () => ({
      ...makeLog({ level: 4, tags: [] }),
      ingredientIds: ['ing-1'],
    }));
    const result = getFoodInsights(logs, mockDictionary);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when logs have no ingredientIds', () => {
    const logs = generateLogs(10, 4);
    const result = getFoodInsights(logs, mockDictionary);
    expect(result).toHaveLength(0);
  });

  it('returns positive insight for ingredient correlated with high wellbeing', () => {
    // 8 logs with ing-1 at level 5, overall avg ~2.5
    const highLogs = Array.from({ length: 8 }, (_, i) => ({
      ...makeLog({ id: i, level: 5, tags: [] }),
      ingredientIds: ['ing-1'],
    }));
    const lowLogs = Array.from({ length: 8 }, (_, i) => ({
      ...makeLog({ id: 100 + i, level: 1, tags: [] }),
      ingredientIds: ['ing-2'],
    }));
    const result = getFoodInsights([...highLogs, ...lowLogs], mockDictionary);
    const chickenInsight = result.find(r => r.ingredientId === 'ing-1');
    expect(chickenInsight).toBeDefined();
    expect(chickenInsight?.tone).toBe('positive');
    expect(chickenInsight?.ingredientName).toBe('Pollo');
  });

  it('returns warning insight for ingredient correlated with low wellbeing', () => {
    const highLogs = Array.from({ length: 8 }, (_, i) => ({
      ...makeLog({ id: i, level: 5, tags: [] }),
      ingredientIds: ['ing-1'],
    }));
    const lowLogs = Array.from({ length: 8 }, (_, i) => ({
      ...makeLog({ id: 100 + i, level: 1, tags: [] }),
      ingredientIds: ['ing-3'],
    }));
    const result = getFoodInsights([...highLogs, ...lowLogs], mockDictionary);
    const eggInsight = result.find(r => r.ingredientId === 'ing-3');
    expect(eggInsight).toBeDefined();
    expect(eggInsight?.tone).toBe('warning');
  });

  it('insights are sorted by magnitude of level deviation', () => {
    const highLogs = Array.from({ length: 8 }, (_, i) => ({
      ...makeLog({ id: i, level: 5 }),
      ingredientIds: ['ing-1'],
    }));
    const midLogs = Array.from({ length: 5 }, (_, i) => ({
      ...makeLog({ id: 100 + i, level: 3 }),
      ingredientIds: ['ing-2'],
    }));
    const lowLogs = Array.from({ length: 8 }, (_, i) => ({
      ...makeLog({ id: 200 + i, level: 1 }),
      ingredientIds: ['ing-3'],
    }));
    const result = getFoodInsights([...highLogs, ...midLogs, ...lowLogs], mockDictionary);
    // Strong deviations (ing-1 and ing-3) should rank before neutral (ing-2)
    const positions = result.map(r => r.ingredientId);
    const midPos = positions.indexOf('ing-2');
    const highPos = positions.indexOf('ing-1');
    if (midPos !== -1 && highPos !== -1) {
      expect(highPos).toBeLessThan(midPos);
    }
  });
});
