/**
 * Tests for seed hydration versioning util.
 *
 * Lives next to the implementation so it's picked up by vitest's default
 * discovery (the `src/test/` folder is for cross-cutting convention tests).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  SEED_VERSIONS,
  ALL_SEED_KEYS,
  getStoredSeedVersion,
  setStoredSeedVersion,
  shouldReseed,
  clearSeed,
  __internal,
} from './seedVersion';

function resetStorage() {
  window.localStorage.clear();
}

describe('seedVersion', () => {
  beforeEach(resetStorage);

  describe('SEED_VERSIONS registry', () => {
    it('exposes every key as a positive integer', () => {
      for (const key of ALL_SEED_KEYS) {
        expect(SEED_VERSIONS[key]).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(SEED_VERSIONS[key])).toBe(true);
      }
    });

    it('includes savedRecipes at v2 (sprint-q18 overhaul) or higher', () => {
      // If this breaks, someone downgraded — forbidden. See the doc
      // comment in seedVersion.ts about never decreasing versions.
      expect(SEED_VERSIONS.savedRecipes).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getStoredSeedVersion', () => {
    it('returns 0 when no version marker exists', () => {
      expect(getStoredSeedVersion('savedRecipes')).toBe(0);
    });

    it('returns 0 when the marker is garbage', () => {
      window.localStorage.setItem(__internal.VERSION_STORAGE_KEY('savedRecipes'), 'not-a-number');
      expect(getStoredSeedVersion('savedRecipes')).toBe(0);
    });

    it('returns the stored integer when valid', () => {
      window.localStorage.setItem(__internal.VERSION_STORAGE_KEY('savedRecipes'), '5');
      expect(getStoredSeedVersion('savedRecipes')).toBe(5);
    });
  });

  describe('setStoredSeedVersion', () => {
    it('writes the current registry version under the rial_ prefix', () => {
      setStoredSeedVersion('savedRecipes');
      const raw = window.localStorage.getItem('rial_seedVersion_savedRecipes');
      expect(raw).toBe(String(SEED_VERSIONS.savedRecipes));
    });

    it('overwrites a stale value', () => {
      window.localStorage.setItem('rial_seedVersion_savedRecipes', '1');
      setStoredSeedVersion('savedRecipes');
      expect(getStoredSeedVersion('savedRecipes')).toBe(SEED_VERSIONS.savedRecipes);
    });
  });

  describe('shouldReseed', () => {
    it('returns true on cold start (no data key at all)', () => {
      expect(shouldReseed('savedRecipes', 'savedRecipes')).toBe(true);
    });

    it('returns true when data exists but version marker is missing (pre-versioning era)', () => {
      window.localStorage.setItem('savedRecipes', JSON.stringify([{ id: 'old' }]));
      // No rial_seedVersion_savedRecipes marker — user predates versioning.
      expect(shouldReseed('savedRecipes', 'savedRecipes')).toBe(true);
    });

    it('returns true when stored version is lower than the current one', () => {
      window.localStorage.setItem('savedRecipes', JSON.stringify([{ id: 'old' }]));
      window.localStorage.setItem('rial_seedVersion_savedRecipes', '1');
      // Current SEED_VERSIONS.savedRecipes is 2 → 1 < 2 → must reseed.
      expect(shouldReseed('savedRecipes', 'savedRecipes')).toBe(true);
    });

    it('returns false when stored version equals current', () => {
      window.localStorage.setItem('savedRecipes', JSON.stringify([{ id: 'x' }]));
      setStoredSeedVersion('savedRecipes');
      expect(shouldReseed('savedRecipes', 'savedRecipes')).toBe(false);
    });

    it('returns false when stored version exceeds current (future-compat)', () => {
      window.localStorage.setItem('savedRecipes', JSON.stringify([{ id: 'x' }]));
      window.localStorage.setItem(
        'rial_seedVersion_savedRecipes',
        String(SEED_VERSIONS.savedRecipes + 10),
      );
      expect(shouldReseed('savedRecipes', 'savedRecipes')).toBe(false);
    });
  });

  describe('clearSeed', () => {
    it('removes both the data key and its version marker', () => {
      window.localStorage.setItem('savedRecipes', JSON.stringify([{ id: 'x' }]));
      setStoredSeedVersion('savedRecipes');

      clearSeed('savedRecipes', 'savedRecipes');

      expect(window.localStorage.getItem('savedRecipes')).toBeNull();
      expect(window.localStorage.getItem('rial_seedVersion_savedRecipes')).toBeNull();
    });

    it('is a no-op when nothing is stored (safe to call repeatedly)', () => {
      expect(() => clearSeed('savedRecipes', 'savedRecipes')).not.toThrow();
    });
  });
});
