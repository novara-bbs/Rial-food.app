# ADR-005 — Themes activate by class, not `dark:` prefix

- Status: Accepted
- Date: 2026-04-17
- Supersedes: —
- Related: ADR-006

## Context

RIAL ships 6 themes: VOLT, OCEAN, EMBER × (dark, light). Each is activated by a class on `<html>`: `theme-volt-dark`, `theme-ocean-light`, etc. The `@theme inline` block in `src/index.css` defines base tokens; each theme class overrides the tokens that change.

Tailwind's default `dark:` prefix collapses this into a single dark mode. A component written as `class="bg-white dark:bg-black"` works for exactly one dark theme and fails for the other two — OCEAN dark and EMBER dark both resolve to the same Tailwind `dark:` branch because Tailwind has no concept of "which dark." The class also ignores theme-specific accents (VOLT's electric green, OCEAN's blue, EMBER's red) because `dark:` cannot carry them.

Q16 audit found 12 leaked `dark:` usages (Profile, Sparkline, BottomNav) — each one renders correctly in exactly 1 of 6 themes.

## Decision

Components must read from semantic tokens (`bg-surface-container-low`, `text-on-surface`, `border-outline-variant`). The `dark:` prefix is banned via `no-restricted-syntax` in `eslint.config.mjs`:

```
selector: "Literal[value=/(^|\\s)dark:(bg-|text-|border-|ring-|shadow-|...)/]"
```

The Q16 migration allowlist covers the 12 existing usages (downgraded to `warn`). New files fail CI if they introduce a `dark:` class.

Theme switching is handled by `src/contexts/ThemeContext.tsx`, which sets the class on `<html>` and persists to `localStorage`. Components never read `theme` directly — they only consume tokens.

## Consequences

- Every new component works in all 6 themes without per-theme code paths.
- Adding a 7th theme (e.g., high-contrast, brand partner) requires a new `.theme-*` block in `src/index.css` and nothing else — components don't change.
- Accents, surfaces, and outlines carry the theme signature automatically.
- Edge cases (illustrations, third-party embeds) that cannot use tokens document the exemption inline.
- Tailwind dark mode docs still show `dark:` everywhere; the lint rule is the authoritative override and must be documented for onboarding.
