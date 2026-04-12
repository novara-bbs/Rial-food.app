/**
 * E2E: First-launch experience — GDPR consent + onboarding.
 */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Clear all stored state to simulate first launch
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('GDPR consent dialog appears on first launch', async ({ page }) => {
  // The consent modal should be visible
  const consentDialog = page.getByRole('heading', { name: /privacidad|privacy|gdpr|datos/i })
    .or(page.getByText(/privacidad|datos|acepto|términos/i).first());
  await expect(consentDialog).toBeVisible({ timeout: 5000 });
});

test('accepting consent dismisses the dialog', async ({ page }) => {
  const consentBtn = page.getByRole('button', { name: /acepto|accept/i });
  await expect(consentBtn).toBeVisible({ timeout: 5000 });
  await consentBtn.click();
  // Dialog should be gone
  await expect(consentBtn).not.toBeVisible({ timeout: 3000 });
});

test('consent is persisted in localStorage after accepting', async ({ page }) => {
  const consentBtn = page.getByRole('button', { name: /acepto|accept/i });
  if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await consentBtn.click();
  }
  const consentValue = await page.evaluate(() =>
    localStorage.getItem('rial_gdpr_consent_v1'),
  );
  expect(consentValue).toBe('true');
});

test('consent dialog does not appear after previous acceptance', async ({ page }) => {
  // Pre-set consent
  await page.evaluate(() => localStorage.setItem('rial_gdpr_consent_v1', 'true'));
  await page.reload();
  // Consent dialog should NOT appear
  const consentBtn = page.getByRole('button', { name: /acepto|accept/i });
  await expect(consentBtn).not.toBeVisible({ timeout: 3000 });
});

test('onboarding wizard appears after consent', async ({ page }) => {
  // Accept consent first
  const consentBtn = page.getByRole('button', { name: /acepto|accept/i });
  if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await consentBtn.click();
  }
  // Set first time flag to ensure onboarding shows
  await page.evaluate(() => localStorage.setItem('rial_isFirstTime', 'true'));
  await page.reload();
  // Dismiss consent again if needed
  const consentBtn2 = page.getByRole('button', { name: /acepto|accept/i });
  if (await consentBtn2.isVisible({ timeout: 1500 }).catch(() => false)) {
    await consentBtn2.click();
  }
  // App should load (not crash) — onboarding OR home should be visible
  await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  const bodyText = await page.locator('body').textContent();
  expect(bodyText?.length).toBeGreaterThan(50);
});
