/**
 * P8 `[1.5.65]` — coverage + contract tests for FAMILY_IMAGES.
 *
 * Ensures every seed FoodFamily has a visual identity and the fallback helper
 * does its job. Protects against silently shipping families that would render
 * with the generic plate emoji (acceptable one-off, bad at scale).
 */
import { describe, it, expect } from 'vitest';
import { FOOD_FAMILIES } from './food-families';
import {
  FAMILY_IMAGES,
  FALLBACK_FAMILY_IMAGE,
  getFamilyImage,
} from './family-images';

describe('FAMILY_IMAGES', () => {
  it('covers every seed FoodFamily', () => {
    const missing = FOOD_FAMILIES
      .filter(f => !(f.id in FAMILY_IMAGES))
      .map(f => f.id);
    expect(missing, `missing image mapping for: ${missing.join(', ')}`).toEqual([]);
  });

  it('has every entry as a non-empty string', () => {
    for (const [id, emoji] of Object.entries(FAMILY_IMAGES)) {
      expect(emoji, `empty image for ${id}`).toBeTruthy();
      expect(typeof emoji).toBe('string');
    }
  });

  it('declares a fallback image', () => {
    expect(FALLBACK_FAMILY_IMAGE).toBeTruthy();
    expect(typeof FALLBACK_FAMILY_IMAGE).toBe('string');
  });
});

describe('getFamilyImage', () => {
  it('returns the mapped emoji for a known id', () => {
    expect(getFamilyImage('fam_chicken_breast')).toBe('🍗');
    expect(getFamilyImage('fam_broccoli')).toBe('🥦');
    expect(getFamilyImage('fam_avocado')).toBe('🥑');
  });

  it('returns the fallback for an unknown id', () => {
    expect(getFamilyImage('fam_nonexistent')).toBe(FALLBACK_FAMILY_IMAGE);
  });

  it('buildFamilies populates family.image for every seed family', () => {
    for (const family of FOOD_FAMILIES) {
      expect(family.image, `family ${family.id} missing image`).toBeTruthy();
    }
  });
});
