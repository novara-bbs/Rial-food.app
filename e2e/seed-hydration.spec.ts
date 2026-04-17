/**
 * E2E: Seed versioning — existing users receive bumped seeds on upgrade.
 *
 * Reproduces the 2026-04-17 bug: users who visited a prior deploy had the
 * old (5-recipe) `savedRecipes` array pinned in localStorage, and subsequent
 * deploys with a 46-recipe seed never reached them because the old
 * `if (!localStorage.getItem('savedRecipes'))` presence guard skipped the
 * lazy import entirely. Now each seed key carries a version marker at
 * `rial_seedVersion_<key>`; a lower stored version triggers a re-hydration
 * via the key's merge strategy.
 *
 * See `src/lib/seedVersion.ts` for the registry and `AppStateContext.tsx`
 * for the merge strategies (`preserve-user`, `preserve-if-nonempty`,
 * `replace`).
 */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Visit first so we can set localStorage for the app's origin.
  await page.goto('/');
});

test('stale seed version triggers re-hydration without losing user-owned recipes', async ({ page }) => {
  // Arrange: simulate a user from the pre-versioning era who has
  //   (a) one user-created recipe (publishedBy: 'self') — must survive,
  //   (b) one stale seed recipe — should be replaced by fresh seed,
  //   (c) a stored version = 1 (lower than current = 2) — triggers reseed.
  await page.evaluate(() => {
    localStorage.setItem('rial_gdpr_consent_v1', 'true');
    localStorage.setItem('isFirstTime', 'false');
    localStorage.setItem('userProfile', JSON.stringify({ name: 'Test User', age: 30 }));
    localStorage.setItem(
      'savedRecipes',
      JSON.stringify([
        { id: 'user-1', title: 'My custom recipe', publishedBy: 'self' },
        { id: 'old-seed-1', title: 'Stale seed item', publishedBy: 'rial' },
      ]),
    );
    localStorage.setItem('rial_seedVersion_savedRecipes', '1');
  });
  await page.reload();

  // Wait for the lazy seed chunk to land + state to flush to localStorage.
  // The effect runs on mount, import() resolves, React batches the setter,
  // useLocalStorageState writes back. 3s is generous for CI.
  await page.waitForFunction(
    () => {
      const raw = localStorage.getItem('savedRecipes');
      if (!raw) return false;
      const arr = JSON.parse(raw);
      // Success = far more than the 2 we planted (46-recipe seed lands).
      return Array.isArray(arr) && arr.length > 30;
    },
    { timeout: 10_000 },
  );

  const snapshot = await page.evaluate(() => {
    const arr = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    const storedVersion = localStorage.getItem('rial_seedVersion_savedRecipes');
    return {
      total: arr.length,
      userStillPresent: arr.some((r: any) => r.id === 'user-1'),
      staleSeedGone: !arr.some((r: any) => r.id === 'old-seed-1'),
      storedVersion,
    };
  });

  // Seed lands (46 recipes in v2).
  expect(snapshot.total).toBeGreaterThan(30);
  // User-created recipe survives the merge.
  expect(snapshot.userStillPresent).toBe(true);
  // Stale orphan seed is cleaned out.
  expect(snapshot.staleSeedGone).toBe(true);
  // Version marker is bumped to current (2 at time of writing).
  expect(Number(snapshot.storedVersion)).toBeGreaterThanOrEqual(2);
});

test('cold start: no prior data → seed populates all keys + stamps versions', async ({ page }) => {
  // Arrange: a brand-new device. Just the consent/profile bypass.
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('rial_gdpr_consent_v1', 'true');
    localStorage.setItem('isFirstTime', 'false');
    localStorage.setItem('userProfile', JSON.stringify({ name: 'Test User', age: 30 }));
  });
  await page.reload();

  await page.waitForFunction(
    () => {
      const raw = localStorage.getItem('savedRecipes');
      return raw ? JSON.parse(raw).length > 30 : false;
    },
    { timeout: 10_000 },
  );

  const versions = await page.evaluate(() => ({
    savedRecipes: localStorage.getItem('rial_seedVersion_savedRecipes'),
    communityPosts: localStorage.getItem('rial_seedVersion_communityPosts'),
    communityStories: localStorage.getItem('rial_seedVersion_communityStories'),
    weightHistory: localStorage.getItem('rial_seedVersion_weightHistory'),
  }));

  // Every key that seeded should have left a version marker behind —
  // without it we'd regress into the same bug on the next deploy.
  expect(versions.savedRecipes).not.toBeNull();
  expect(versions.communityPosts).not.toBeNull();
  expect(versions.communityStories).not.toBeNull();
  expect(versions.weightHistory).not.toBeNull();
});

test('up-to-date version: no reseed, user data untouched', async ({ page }) => {
  // Arrange: user is already at current version — do not overwrite their data.
  await page.evaluate(() => {
    localStorage.setItem('rial_gdpr_consent_v1', 'true');
    localStorage.setItem('isFirstTime', 'false');
    localStorage.setItem('userProfile', JSON.stringify({ name: 'Test User', age: 30 }));
    localStorage.setItem(
      'savedRecipes',
      JSON.stringify([{ id: 'only-one', title: 'Solo mine', publishedBy: 'self' }]),
    );
    // Write a version marker high enough to cover the current registry.
    // 999 is "future-compat" and will remain >= anything we ever ship.
    localStorage.setItem('rial_seedVersion_savedRecipes', '999');
  });
  await page.reload();

  // Wait a moment to let any (unintended) effect fire.
  await page.waitForTimeout(1500);

  const snapshot = await page.evaluate(() => {
    const arr = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    return { count: arr.length, first: arr[0]?.id };
  });

  // Still exactly 1, still the user's. No seed reinflated us.
  expect(snapshot.count).toBe(1);
  expect(snapshot.first).toBe('only-one');
});
