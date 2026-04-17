/**
 * Shared surface class strings that match the SectionCard visual token set.
 *
 * The strings intentionally use the same tokens as `<SectionCard>` (ADR-001)
 * so form controls sit on the same surface elevation as cards without
 * duplicating the literal across the codebase. ESLint exempts this file from
 * the SectionCard-shape rule — see `eslint.config.mjs`.
 */

/**
 * Surface used by form controls (`<input>`, `<select>`, `<textarea>`) that
 * need the same elevation as a `<SectionCard>`. Combine with per-control
 * padding / text / focus styles via `cn()`.
 *
 * @example
 *   <input
 *     className={cn(INPUT_SURFACE_CLASSES, 'py-2 px-3 text-on-surface text-body-sm')}
 *   />
 */
export const INPUT_SURFACE_CLASSES =
  'bg-surface-container-low border border-outline-variant/20 rounded-sm';
