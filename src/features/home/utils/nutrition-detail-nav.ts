/**
 * nutrition-detail-nav — module-level pending tab for NutritionDetail.
 *
 * Callers set the desired tab before navigating to 'nutrition-detail' and
 * NutritionDetail reads + clears it on mount. Kept in a separate file so
 * NutritionDetail's default export is the only export (fast-refresh rule).
 */

let _pendingTab: string | undefined;

/** Set the tab that NutritionDetail should open on (call before navigating). */
export function setNutritionDetailInitialTab(tab: string): void {
  _pendingTab = tab;
}

/**
 * Consume the pending tab once. Returns the stored tab (or 'summary' as
 * fallback) and clears the stored value so the next open starts fresh.
 */
export function consumeNutritionDetailInitialTab(): string {
  const tab = _pendingTab ?? 'summary';
  _pendingTab = undefined;
  return tab;
}
