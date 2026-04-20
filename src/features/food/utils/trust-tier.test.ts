import { describe, it, expect } from 'vitest';
import type { FoodVariant } from '../../../types/food-family';
import {
  deriveTier,
  TRUST_TIERS,
  TIER_COLOR,
  TIER_ICON,
} from './trust-tier';

// Minimal stub — we only care about `source` + `variantType` in deriveTier.
function variant(partial: Partial<FoodVariant>): FoodVariant {
  return {
    id: partial.id ?? 'test_variant',
    familyId: partial.familyId ?? 'fam_test',
    name: partial.name ?? 'Test',
    nameEn: partial.nameEn ?? 'Test',
    variantType: partial.variantType ?? 'canonical',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: [],
    macros: { calories: 0, protein: 0, carbs: 0, fats: 0 },
    micros: { vitamins: {}, minerals: {}, others: {} },
    allergens: [],
    source: partial.source ?? 'seed',
    ...partial,
  };
}

describe('deriveTier', () => {
  it('source=seed + variantType=canonical → canonical', () => {
    expect(deriveTier(variant({ source: 'seed', variantType: 'canonical' }))).toBe('canonical');
  });

  it('source=seed + variantType=preparation → canonical (lab-verified USDA variant)', () => {
    expect(deriveTier(variant({ source: 'seed', variantType: 'preparation' }))).toBe('canonical');
  });

  it('source=seed + variantType=brand → curated (RIAL-verified brand seed)', () => {
    expect(deriveTier(variant({ source: 'seed', variantType: 'brand' }))).toBe('curated');
  });

  it('source=user → personal', () => {
    expect(deriveTier(variant({ source: 'user', variantType: 'user' }))).toBe('personal');
  });

  it('source=off → personal (scanned via OFF barcode)', () => {
    expect(deriveTier(variant({ source: 'off', variantType: 'brand' }))).toBe('personal');
  });

  it('source=edamam falls back to canonical', () => {
    expect(deriveTier(variant({ source: 'edamam', variantType: 'canonical' }))).toBe('canonical');
  });
});

describe('tier metadata', () => {
  it('TRUST_TIERS lists all 4 tiers in canonical order', () => {
    expect(TRUST_TIERS).toEqual(['canonical', 'curated', 'personal', 'community']);
  });

  it('TIER_COLOR covers all tiers and uses design tokens', () => {
    for (const tier of TRUST_TIERS) {
      expect(TIER_COLOR[tier]).toBeTruthy();
      expect(TIER_COLOR[tier]).toMatch(/^text-/);
    }
  });

  it('TIER_ICON uses lucide icon names for all tiers', () => {
    expect(TIER_ICON.canonical).toBe('ShieldCheck');
    expect(TIER_ICON.curated).toBe('Sparkles');
    expect(TIER_ICON.personal).toBe('UserRound');
    expect(TIER_ICON.community).toBe('Users');
  });
});
