/**
 * Convention test: Trinario food preferences — R8.3.
 *
 * Locks:
 *  (a) Migration from `foodDislikes: string[]` to `foodPreferences` record is idempotent.
 *  (b) Migration maps each dislike id to 'dislike'.
 *  (c) Toggle semantics: setting the same preference again removes the entry (neutral).
 *  (d) Null pref removes the entry.
 *  (e) Like and dislike can coexist in the same map.
 *  (f) UserProfileSchema validates foodPreferences correctly.
 */
import { describe, it, expect } from 'vitest';
import { UserProfileSchema } from '../../lib/schemas';

// --- Pure helpers mirroring AppStateContext migration + SettingsNutrition setFoodPref ---

function migrateFoodDislikes(
  prev: { foodDislikes?: string[]; foodPreferences?: Record<string, 'like' | 'dislike'> },
): Record<string, 'like' | 'dislike'> {
  if (!prev.foodDislikes?.length) return prev.foodPreferences ?? {};
  if (prev.foodPreferences) return prev.foodPreferences; // already migrated
  const result: Record<string, 'like' | 'dislike'> = {};
  (prev.foodDislikes as string[]).forEach((id: string) => {
    result[id] = 'dislike';
  });
  return result;
}

function setFoodPref(
  current: Record<string, 'like' | 'dislike'>,
  id: string,
  pref: 'like' | 'dislike' | null,
): Record<string, 'like' | 'dislike'> {
  const next = { ...current };
  if (pref === null || next[id] === pref) {
    delete next[id]; // toggle off → neutral
  } else {
    next[id] = pref;
  }
  return next;
}

// --- Migration tests ---

describe('foodDislikes → foodPreferences migration', () => {
  it('(a) is idempotent: second call with existing foodPreferences returns same object', () => {
    const existing: Record<string, 'like' | 'dislike'> = { pollo: 'dislike', salmon: 'like' };
    const result = migrateFoodDislikes({ foodDislikes: ['pollo'], foodPreferences: existing });
    expect(result).toBe(existing); // reference equality — no new object
  });

  it('(b) maps each dislike id to "dislike"', () => {
    const result = migrateFoodDislikes({ foodDislikes: ['pollo', 'cerdo', 'atun'] });
    expect(result).toEqual({ pollo: 'dislike', cerdo: 'dislike', atun: 'dislike' });
  });

  it('(a) no-op when foodDislikes is empty', () => {
    const result = migrateFoodDislikes({ foodDislikes: [] });
    expect(result).toEqual({});
  });

  it('(a) no-op when foodDislikes is absent', () => {
    const result = migrateFoodDislikes({});
    expect(result).toEqual({});
  });
});

// --- Toggle semantics tests ---

describe('setFoodPref toggle semantics', () => {
  it('(c) setting an entry that already has the same pref removes it (neutral)', () => {
    const current: Record<string, 'like' | 'dislike'> = { pollo: 'dislike' };
    const result = setFoodPref(current, 'pollo', 'dislike');
    expect(result.pollo).toBeUndefined();
  });

  it('(d) null pref removes the entry', () => {
    const current: Record<string, 'like' | 'dislike'> = { salmon: 'like' };
    const result = setFoodPref(current, 'salmon', null);
    expect(result.salmon).toBeUndefined();
  });

  it('(d) null on absent key is a no-op', () => {
    const current: Record<string, 'like' | 'dislike'> = {};
    const result = setFoodPref(current, 'absent', null);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('(e) like and dislike coexist in the same map', () => {
    let prefs: Record<string, 'like' | 'dislike'> = {};
    prefs = setFoodPref(prefs, 'pollo', 'like');
    prefs = setFoodPref(prefs, 'cerdo', 'dislike');
    prefs = setFoodPref(prefs, 'salmon', 'like');
    expect(prefs.pollo).toBe('like');
    expect(prefs.cerdo).toBe('dislike');
    expect(prefs.salmon).toBe('like');
    expect(Object.keys(prefs)).toHaveLength(3);
  });

  it('switching from dislike to like overwrites', () => {
    let prefs: Record<string, 'like' | 'dislike'> = { pollo: 'dislike' };
    prefs = setFoodPref(prefs, 'pollo', 'like');
    expect(prefs.pollo).toBe('like');
  });

  it('original map is not mutated', () => {
    const original: Record<string, 'like' | 'dislike'> = { pollo: 'dislike' };
    setFoodPref(original, 'pollo', 'like');
    expect(original.pollo).toBe('dislike'); // spread creates new object
  });
});

// --- Schema validation tests ---

describe('UserProfileSchema foodPreferences field', () => {
  it('(f) accepts valid like/dislike record', () => {
    const result = UserProfileSchema.safeParse({
      name: 'Test',
      foodPreferences: { pollo: 'like', cerdo: 'dislike' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.foodPreferences).toEqual({ pollo: 'like', cerdo: 'dislike' });
    }
  });

  it('(f) rejects invalid pref values', () => {
    const result = UserProfileSchema.safeParse({
      name: 'Test',
      foodPreferences: { pollo: 'maybe' }, // invalid
    });
    expect(result.success).toBe(false);
  });

  it('(f) optional — absent field parses successfully', () => {
    const result = UserProfileSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.foodPreferences).toBeUndefined();
    }
  });
});
