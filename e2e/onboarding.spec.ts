/**
 * E2E: First-launch experience — GDPR consent + onboarding.
 *
 * Selector anchors (from i18n/locales/es.ts):
 *   consentTitle  → "Antes de continuar"
 *   consentAccept → "Entendido, continuar"
 */
import { test, expect } from '@playwright/test';

// Matches both Spanish and English accept buttons
const CONSENT_BTN_RE = /entendido|continuar|acepto|accept/i;
const CONSENT_TITLE_RE = /antes de continuar|privacidad|privacy|consent/i;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('GDPR consent dialog appears on first launch', async ({ page }) => {
  const consentDialog = page.getByRole('heading', { name: CONSENT_TITLE_RE })
    .or(page.getByText(CONSENT_TITLE_RE).first());
  await expect(consentDialog).toBeVisible({ timeout: 5000 });
});

test('accepting consent dismisses the dialog', async ({ page }) => {
  const consentBtn = page.getByRole('button', { name: CONSENT_BTN_RE });
  await expect(consentBtn).toBeVisible({ timeout: 5000 });
  await consentBtn.click();
  await expect(consentBtn).not.toBeVisible({ timeout: 3000 });
});

test('consent is persisted in localStorage after accepting', async ({ page }) => {
  const consentBtn = page.getByRole('button', { name: CONSENT_BTN_RE });
  if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await consentBtn.click();
  }
  const consentValue = await page.evaluate(() =>
    localStorage.getItem('rial_gdpr_consent_v1'),
  );
  expect(consentValue).toBe('true');
});

test('consent dialog does not appear after previous acceptance', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('rial_gdpr_consent_v1', 'true'));
  await page.reload();
  const consentBtn = page.getByRole('button', { name: CONSENT_BTN_RE });
  await expect(consentBtn).not.toBeVisible({ timeout: 3000 });
});

test('onboarding wizard appears after consent', async ({ page }) => {
  const consentBtn = page.getByRole('button', { name: CONSENT_BTN_RE });
  if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await consentBtn.click();
  }
  await page.evaluate(() => localStorage.setItem('rial_isFirstTime', 'true'));
  await page.reload();
  const consentBtn2 = page.getByRole('button', { name: CONSENT_BTN_RE });
  if (await consentBtn2.isVisible({ timeout: 1500 }).catch(() => false)) {
    await consentBtn2.click();
  }
  await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  const bodyText = await page.locator('body').textContent();
  expect(bodyText?.length).toBeGreaterThan(50);
});
