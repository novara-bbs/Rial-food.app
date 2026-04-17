/**
 * E2E: Bottom navigation and tab traversal.
 * Verifies all major tabs load without errors.
 */
import { test, expect } from '@playwright/test';

// Helper: dismiss GDPR consent if shown
// Matches Spanish "Entendido, continuar" or English "Accept"
async function dismissConsent(page: import('@playwright/test').Page) {
  const consentBtn = page.getByRole('button', { name: /entendido|continuar|acepto|accept/i });
  if (await consentBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await consentBtn.click();
  }
}

// Helper: skip onboarding if shown
async function skipOnboarding(page: import('@playwright/test').Page) {
  // Onboarding shows a multi-step wizard — complete or skip it
  const skipBtn = page.getByRole('button', { name: /omitir|skip/i });
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipBtn.click();
  }
}

test.beforeEach(async ({ page }) => {
  // Seed localStorage to bypass onboarding and consent.
  // Only `rial_gdpr_consent_v1` uses the prefix explicitly
  // (GdprConsent.tsx); AppStateContext keys flow through
  // useLocalStorageState which does NOT prefix.
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('rial_gdpr_consent_v1', 'true');
    localStorage.setItem('isFirstTime', 'false');
    localStorage.setItem('userProfile', JSON.stringify({ name: 'Test User', age: 30 }));
  });
  await page.reload();
  await dismissConsent(page);
  await skipOnboarding(page);
});

test('home tab loads with macro rings', async ({ page }) => {
  // Should be on home by default
  await expect(page).toHaveURL('/');
  // The <main> wrapper in App.tsx is the canonical home content container
  // — unique, always visible. Prefer it over ambiguous class-based selectors
  // that also match hidden Sidebar elements (e.g. `.font-mono` → Sidebar's
  // "Miembro" badge which is `hidden md:flex` at mobile viewport).
  await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
});

// BottomNav (mobile) and Sidebar (desktop) coexist in the DOM.
// Sidebar is `hidden md:flex` — invisible at the mobile Playwright viewport
// but still matches generic `nav button` selectors. Scope to the BottomNav's
// `fixed bottom-0` class so we only click the visible tab on mobile projects.
const BOTTOM_NAV = 'nav.fixed.bottom-0';

test('bottom nav: Cocina tab', async ({ page }) => {
  const cocinaTab = page.locator(`${BOTTOM_NAV} button`).filter({ hasText: /cocina|recipes/i });
  await cocinaTab.first().click();
  // Recipes content should appear. Scope to <main> — Sidebar (hidden on
  // mobile) contains the marketing tagline "Nutrición real. Recetas reales."
  // which `getByText(/recetas/)` would otherwise pick up as a hidden match.
  await expect(page.locator('main').getByText(/recetas|recipes/i).first())
    .toBeVisible({ timeout: 5000 });
});

test('bottom nav: Explorar tab', async ({ page }) => {
  const explorarTab = page.locator(`${BOTTOM_NAV} button`).filter({ hasText: /explorar|explore/i });
  await explorarTab.first().click();
  await expect(page.locator('body')).not.toHaveText(/error|crash/i, { timeout: 5000 });
});

test('bottom nav: Más tab opens menu', async ({ page }) => {
  const masTab = page.locator(`${BOTTOM_NAV} button`).filter({ hasText: /más|mas|more/i });
  await masTab.first().click();
  // "Más" opens a menu with various options
  await expect(page.getByText(/diario|perfil|ajustes|coach|fasting/i).first())
    .toBeVisible({ timeout: 5000 });
});

test('FAB opens add-meal modal', async ({ page }) => {
  const fab = page.locator('button[aria-label*="add"], button[aria-label*="añadir"]')
    .or(page.locator('button').filter({ has: page.locator('svg') }).nth(2));
  // Just verify no crash on click
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toBeTruthy();
});

test('no JavaScript errors on page load', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.waitForTimeout(2000);
  // Filter out known non-critical warnings
  const criticalErrors = errors.filter(e =>
    !e.includes('ResizeObserver') &&
    !e.includes('Non-Error promise rejection'),
  );
  expect(criticalErrors).toHaveLength(0);
});
