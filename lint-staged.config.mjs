/**
 * lint-staged configuration — Sprint 33 [1.5.147].
 *
 * On every commit:
 *  - TypeScript/TSX files → ESLint (design-system guardrails + react-hooks).
 *    Exits non-zero on errors; warnings are non-blocking (381 pre-existing,
 *    all in the typographyMigrationAllowlist).
 *  - i18n locale files → check ES↔EN symmetry (always runs on full tree).
 *
 * Full `npm run lint` with stricter rules still runs in CI.
 */
export default {
  '*.{ts,tsx}': ['eslint'],
  'src/i18n/locales/**/*.ts': () => 'npm run check:i18n',
};
