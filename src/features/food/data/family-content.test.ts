/**
 * P8 `[1.5.65]` — contract tests for FAMILY_CONTENT.
 *
 * This file grows over time as the LLM-bootstrap script fills in content for
 * the remaining ~140 families. The test suite enforces shape invariants on
 * whatever IS present, without requiring full coverage (coverage is a
 * progressive admin-review task).
 */
import { describe, it, expect } from 'vitest';
import { FAMILY_CONTENT, getFamilyContent } from './family-content.generated';
import { FOOD_FAMILIES } from './food-families';
import { CULINARY_USE_SLUGS, SUBSTITUTE_REASONS } from '../../../types/food-family';

describe('FAMILY_CONTENT — shape invariants', () => {
  const culinarySet = new Set(CULINARY_USE_SLUGS as readonly string[]);
  const reasonSet = new Set(SUBSTITUTE_REASONS as readonly string[]);
  const familyIds = new Set(FOOD_FAMILIES.map(f => f.id));

  it('ships a non-empty initial seed', () => {
    expect(Object.keys(FAMILY_CONTENT).length).toBeGreaterThanOrEqual(5);
  });

  it('every entry has bilingual longDescription (es + en)', () => {
    for (const [id, entry] of Object.entries(FAMILY_CONTENT)) {
      expect(entry.longDescription.es.length, `${id} es empty`).toBeGreaterThan(50);
      expect(entry.longDescription.en.length, `${id} en empty`).toBeGreaterThan(50);
    }
  });

  it('every entry has 3-8 culinary uses from the closed slug set', () => {
    for (const [id, entry] of Object.entries(FAMILY_CONTENT)) {
      expect(entry.culinaryUses.length, `${id} culinaryUses`).toBeGreaterThanOrEqual(3);
      expect(entry.culinaryUses.length, `${id} culinaryUses`).toBeLessThanOrEqual(8);
      for (const slug of entry.culinaryUses) {
        expect(culinarySet.has(slug), `${id} invalid culinary slug: ${slug}`).toBe(true);
      }
    }
  });

  it('every entry has 2-5 substitutes, each a valid familyId + reason slug', () => {
    for (const [id, entry] of Object.entries(FAMILY_CONTENT)) {
      expect(entry.substitutes.length, `${id} substitutes`).toBeGreaterThanOrEqual(2);
      expect(entry.substitutes.length, `${id} substitutes`).toBeLessThanOrEqual(5);
      for (const sub of entry.substitutes) {
        expect(familyIds.has(sub.familyId), `${id} dangling substitute: ${sub.familyId}`).toBe(true);
        expect(reasonSet.has(sub.reason), `${id} invalid reason: ${sub.reason}`).toBe(true);
      }
    }
  });

  it('every entry key references a real family id', () => {
    for (const id of Object.keys(FAMILY_CONTENT)) {
      expect(familyIds.has(id), `FAMILY_CONTENT contains ghost id: ${id}`).toBe(true);
    }
  });
});

describe('getFamilyContent', () => {
  it('returns the entry for a known family with content', () => {
    expect(getFamilyContent('fam_chicken_breast')).toBeDefined();
    expect(getFamilyContent('fam_chicken_breast')?.culinaryUses.length).toBeGreaterThan(0);
  });

  it('returns undefined for a family without content (graceful fallback path)', () => {
    // Find any family NOT in FAMILY_CONTENT.
    const uncovered = FOOD_FAMILIES.find(f => !(f.id in FAMILY_CONTENT));
    if (uncovered) {
      expect(getFamilyContent(uncovered.id)).toBeUndefined();
    }
  });

  it('buildFamilies merges content into family.longDescription when present', () => {
    const chicken = FOOD_FAMILIES.find(f => f.id === 'fam_chicken_breast');
    expect(chicken?.longDescription).toBeDefined();
    expect(chicken?.longDescription?.es.length).toBeGreaterThan(50);
  });
});
