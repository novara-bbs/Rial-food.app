/**
 * Recipe verified tier + cookedAt[] — R2 plan v2 contract.
 *
 * Locks the R2.1 data-model foundation that R2.2–R2.6 + R3 + R7 consume.
 * Silent removal of any of these invariants would cascade into:
 *   - the editorial RecipeDetail branch (R2.3) rendering for the wrong set
 *   - the Cocina "Verificadas" / "Ya cocinadas" filter chips (R2.4, R3)
 *   - the creator-publish path (R7.3, `verified: 'creator'`)
 *   - the seed migration that propagates hero markers to existing users (v4 → v5)
 */
import { describe, it, expect } from 'vitest';
import type { Recipe } from '../../types/recipe';
import { SEED_RECIPES } from '../../features/food/data/seed-recipes';
import { SEED_VERSIONS } from '../../lib/seedVersion';
import featureFlags from '../../lib/featureFlags';

describe('Recipe.verified — editorial tier marker', () => {
  it('accepts the 3 canonical literals at the type level', () => {
    const rial: Pick<Recipe, 'verified'> = { verified: 'rial' };
    const creator: Pick<Recipe, 'verified'> = { verified: 'creator' };
    const none: Pick<Recipe, 'verified'> = { verified: null };
    expect(rial.verified).toBe('rial');
    expect(creator.verified).toBe('creator');
    expect(none.verified).toBeNull();
  });

  it('treats absent `verified` as the default (user-saved / generic) tier', () => {
    const r: Pick<Recipe, 'verified'> = {};
    expect(r.verified).toBeUndefined();
  });
});

describe('Recipe.cookedAt — NYT Mark-as-Cooked timeline', () => {
  it('accepts an array of ISO strings', () => {
    const r: Pick<Recipe, 'cookedAt'> = {
      cookedAt: ['2026-04-20T12:00:00.000Z', '2026-04-22T20:15:00.000Z'],
    };
    expect(r.cookedAt).toHaveLength(2);
    expect(r.cookedAt?.[0]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('treats absent or empty as "never cooked"', () => {
    const absent: Pick<Recipe, 'cookedAt'> = {};
    const empty: Pick<Recipe, 'cookedAt'> = { cookedAt: [] };
    // Both shapes MUST read identically at the call site via `?.length`.
    expect(absent.cookedAt?.length ?? 0).toBe(0);
    expect(empty.cookedAt?.length ?? 0).toBe(0);
  });
});

describe('SEED_RECIPES — R2.1 hero marking', () => {
  const verifiedEntries = SEED_RECIPES.filter(
    (r: any) => r.verified === 'rial',
  );

  it('marks exactly 8 chef-published heroes with verified: "rial"', () => {
    // If this number changes, the R2.2–R2.3 preview shots + the
    // "Verificadas" filter baseline in R2.4 must be re-recorded.
    expect(verifiedEntries).toHaveLength(8);
  });

  it('only marks chef-published recipes, never "self" (user-owned)', () => {
    // R7.3 is the only code path that may write `verified: 'creator'`;
    // R2 seed marking must never leak into user-owned entries.
    for (const r of verifiedEntries) {
      expect(r.publishedBy).not.toBe('self');
    }
  });

  it('covers multiple meal slots (breakfast + lunch/dinner at minimum)', () => {
    const slots = new Set<string>();
    for (const r of verifiedEntries) {
      for (const s of r.suitableFor ?? []) slots.add(s);
    }
    expect(slots.has('breakfast')).toBe(true);
    expect(slots.has('lunch') || slots.has('dinner')).toBe(true);
  });

  it('leaves the remaining seed recipes without a verified marker', () => {
    const unmarked = SEED_RECIPES.filter((r: any) => r.verified == null);
    // Invariant: marking is opt-in per-recipe, not a default for the whole seed.
    expect(unmarked.length).toBeGreaterThan(verifiedEntries.length);
  });
});

describe('featureFlags.verifiedRecipePolish — R2.3 consumer gate', () => {
  it('exists on the frozen flag object', () => {
    expect(featureFlags).toHaveProperty('verifiedRecipePolish');
    expect(typeof featureFlags.verifiedRecipePolish).toBe('boolean');
  });

  it('defaults to false in test / CI (no env var set)', () => {
    // This locks the rollout posture: shipping R2.1 data must not flip
    // the editorial UI on for existing users until R2.3 consumers land.
    expect(featureFlags.verifiedRecipePolish).toBe(false);
  });
});

describe('SEED_VERSIONS.savedRecipes — v5 bump for verified tier', () => {
  it('is at least v5 so existing v4 users re-hydrate the hero markers', () => {
    // The strategy in AppStateContext is `preserve-user` — user-owned
    // recipes stay untouched, the rest get replaced with the marked seed.
    // Decreasing this breaks the migration and must never happen.
    expect(SEED_VERSIONS.savedRecipes).toBeGreaterThanOrEqual(5);
  });
});
