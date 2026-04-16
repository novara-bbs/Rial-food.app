# ADR-004 — i18n locales are symmetric ES ↔ EN

- Status: Accepted
- Date: 2026-04-17
- Supersedes: —
- Related: —

## Context

RIAL ships in Spanish (ES, primary) and English (EN, secondary). The i18n layer is a custom type-safe provider (`src/i18n/`) — `Translations` is derived from `DeepString<typeof es>` so any key added to `es.ts` is required in `en.ts` at compile time. TypeScript catches structural drift.

However, TypeScript does **not** catch value drift: a key can exist in both locales but the EN value can silently fall back to the ES string, an empty string, or the key path. Q11-Q14 sprints shipped with 7 such asymmetries (observed in production error logs: `t.wellness.logSnapshot.submit` rendered the ES string in EN sessions). Manual review missed them because both locales compile.

The problem is amplified by multi-agent workflows: one agent adds a key to `es.ts`, ships, and a later agent "completes" the EN side without verification.

## Decision

Every user-visible string goes through `useI18n()`. Literal JSX text is forbidden except for:

- Technical strings that must not translate (email addresses, URLs, version numbers).
- Developer-only surfaces (error boundaries logging to Sentry, dev-only panels gated behind `import.meta.env.DEV`).

A Node script `scripts/check-i18n-symmetry.mjs` parses `src/i18n/locales/es.ts` and `en.ts` via the TypeScript compiler API, walks the exported object literal, and asserts both locales expose the identical dotted-path key set. The script is wired into `npm run check:i18n` and into `release:preflight`, so a key added to one locale without the other fails CI before merge.

The script is **structural only** — it does not validate translation quality. Quality review stays a human responsibility, documented in `docs/i18n-dictionary.md`.

## Consequences

- Adding a locale (pt-BR, fr-FR) requires updating the script's locale list and running it once; the same guarantees propagate.
- Adding a key is always a two-file change (`es.ts` + `en.ts`); commits that touch only one locale fail preflight.
- The script has zero runtime dependencies beyond `typescript` (already in `package.json`), so it runs in CI without install overhead.
- Asymmetry diagnostic output prints the missing paths so fixes are one-line edits.
- Developer-only strings that bypass i18n are documented in code review and do not trip the lint (the symmetry check only reads locale files).
