/**
 * RevenueCat in-app purchases — iOS + Android.
 *
 * Setup:
 *  1. Create a RevenueCat account at https://app.revenuecat.com
 *  2. Connect App Store Connect + Google Play Console
 *  3. Create products:
 *       iOS:     rial_plus_monthly ($4.99), rial_plus_yearly ($29.99)
 *       Android: rial_plus_monthly, rial_plus_yearly
 *  4. Create an Entitlement named "pro" and attach both products to it
 *  5. Add to .env:
 *       VITE_RC_APPLE_API_KEY=appl_xxxx
 *       VITE_RC_GOOGLE_API_KEY=goog_xxxx
 *
 * On web (PWA): RevenueCat is a no-op. isPro is read from localStorage.
 * On native: RevenueCat is the source of truth for subscription state.
 */
import { isNative, isIOS } from './platform';
import { RC_APPLE_API_KEY, RC_GOOGLE_API_KEY } from '../config/env';
import { logger } from './logger';

// ─── Product IDs ──────────────────────────────────────────────────────────────

export const PRODUCT_IDS = {
  monthly: 'rial_plus_monthly',
  yearly: 'rial_plus_yearly',
} as const;

export const ENTITLEMENT_ID = 'pro';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OfferingInfo {
  monthly: {
    id: string;
    priceString: string;
    product: import('@revenuecat/purchases-capacitor').PurchasesStoreProduct;
    pkg: import('@revenuecat/purchases-capacitor').PurchasesPackage;
  } | null;
  yearly: {
    id: string;
    priceString: string;
    product: import('@revenuecat/purchases-capacitor').PurchasesStoreProduct;
    pkg: import('@revenuecat/purchases-capacitor').PurchasesPackage;
  } | null;
}

// ─── Initialization ───────────────────────────────────────────────────────────

let initialized = false;

/**
 * Initialize RevenueCat. Call once at app startup on native platforms.
 * Safe to call multiple times (idempotent).
 */
export async function initializePurchases(userId?: string): Promise<void> {
  if (!isNative || initialized) return;

  const apiKey = isIOS ? RC_APPLE_API_KEY : RC_GOOGLE_API_KEY;
  if (!apiKey) {
    logger.warn('RevenueCat API key not configured');
    return;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.configure({
      apiKey,
      appUserID: userId ?? null,
    });
    initialized = true;
    logger.info('RevenueCat initialized');
  } catch (err) {
    logger.error('RevenueCat init failed', { error: String(err) });
  }
}

// ─── Entitlement check ────────────────────────────────────────────────────────

/**
 * Check if the current user has an active "pro" entitlement.
 * Returns false on web (caller should fall back to localStorage isPro).
 */
export async function checkProEntitlement(): Promise<boolean> {
  if (!isNative || !initialized) return false;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch (err) {
    logger.warn('RevenueCat entitlement check failed', { error: String(err) });
    return false;
  }
}

// ─── Offerings ────────────────────────────────────────────────────────────────

/**
 * Fetch current offerings from RevenueCat.
 * Returns null if not on native or not configured.
 */
export async function getOfferings(): Promise<OfferingInfo | null> {
  if (!isNative || !initialized) return null;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return null;

    const monthly = current.monthly ?? null;
    const annual = current.annual ?? null;

    return {
      monthly: monthly ? {
        id: monthly.product.identifier,
        priceString: monthly.product.priceString,
        product: monthly.product,
        pkg: monthly,
      } : null,
      yearly: annual ? {
        id: annual.product.identifier,
        priceString: annual.product.priceString,
        product: annual.product,
        pkg: annual,
      } : null,
    };
  } catch (err) {
    logger.warn('RevenueCat getOfferings failed', { error: String(err) });
    return null;
  }
}

// ─── Purchase ─────────────────────────────────────────────────────────────────

export type PurchaseResult =
  | { success: true; isPro: boolean }
  | { success: false; cancelled: boolean; error?: string };

/**
 * Initiate a package purchase.
 */
export async function purchasePackage(
  pkg: import('@revenuecat/purchases-capacitor').PurchasesPackage
): Promise<PurchaseResult> {
  if (!isNative || !initialized) {
    return { success: false, cancelled: false, error: 'Not available on web' };
  }
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const isPro = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    return { success: true, isPro };
  } catch (err: unknown) {
    // PurchasesError has a userCancelled property
    const cancelled = (err as { userCancelled?: boolean }).userCancelled === true;
    if (cancelled) return { success: false, cancelled: true };
    logger.warn('Purchase failed', { error: String(err) });
    return { success: false, cancelled: false, error: String(err) };
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

/**
 * Restore previous purchases (required iOS App Store button).
 */
export async function restorePurchases(): Promise<boolean> {
  if (!isNative || !initialized) return false;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.restorePurchases();
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch (err) {
    logger.warn('Restore purchases failed', { error: String(err) });
    return false;
  }
}

// ─── Login / Logout ───────────────────────────────────────────────────────────

/** Link RevenueCat customer to a Supabase user ID. */
export async function loginRevenueCat(userId: string): Promise<void> {
  if (!isNative || !initialized) return;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.logIn({ appUserID: userId });
  } catch (err) {
    logger.warn('RevenueCat login failed', { error: String(err) });
  }
}

/** Unlink RevenueCat customer (on sign-out). */
export async function logoutRevenueCat(): Promise<void> {
  if (!isNative || !initialized) return;
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.logOut();
  } catch (err) {
    logger.warn('RevenueCat logout failed', { error: String(err) });
  }
}
