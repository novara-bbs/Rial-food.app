/**
 * Z-index tokens — Wave 2 Cocina audit.
 *
 * Centralises stacking layers so modal-on-modal flows in RecipeDetail
 * (CookMode + PublishRecipeSheet + ConfirmDialog ×2 + RecipeDaySelectorSheet)
 * stack deterministically instead of fighting `z-40` / `z-50` literals.
 *
 * Convention: higher-number layer sits on top. Gap of 10 between tiers so
 * an intermediate backdrop or tooltip can slot in without a decimal.
 *
 * Use via Tailwind arbitrary values: `className={\`... \${Z.DIALOG_TW}\`}`
 * or inline style: `style={{ zIndex: Z.DIALOG }}` — we keep both because some
 * sites embed primitives (Radix Dialog) whose className surfaces are limited.
 */

export const Z = {
  /** Pinned bottom nav / app shell chrome. */
  SHELL: 30,
  /** Side sheets (RecipeDaySelectorSheet, PublishRecipeSheet). */
  SHEET: 40,
  /** Standard dialogs (ConfirmDialog, DemoGate). */
  DIALOG: 50,
  /** Fullscreen modes (CookMode) — sit above sheets. */
  FULLSCREEN: 60,
  /** Toasts + transient system feedback — top of stack. */
  TOAST: 70,
} as const;

/** Tailwind utility shorthands for arbitrary z-index values. */
export const Z_TW = {
  SHELL: 'z-[30]',
  SHEET: 'z-[40]',
  DIALOG: 'z-[50]',
  FULLSCREEN: 'z-[60]',
  TOAST: 'z-[70]',
} as const;
