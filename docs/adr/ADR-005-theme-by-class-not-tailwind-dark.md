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

## Notes

- **2026-04-19 — VOLT LIGHT token re-balance (iteración final).** `.theme-volt-light` removido el warm-lime tint del background: `#fafff0` → `#faf9f6` (warm-neutral Stone 50). Identidad VOLT ahora carga por `--primary: #65a30d` (Lime 600 · mirrors DARK `#dcfd05`) + `--brand-secondary: #84cc16` (Lime 500 accent) + `--on-primary: #09090b` (negro, simétrico con DARK). `--tertiary` pasa de Lime 900 a neutral `#18181b` porque headlines deben leer como texto, no como tinte de marca. `--on-surface-variant: #4a4945` warm Stone 700 (AAA 8.5:1). Outlines y surface-container en warm-Stone scale. Razón: el tint lime leía "infantil / ciclismo", fatigaba en uso prolongado, y chocaba con fotos de comida. Research Linear/Notion/Bevel/Stripe 2025 confirma warm-neutral bg + green accent como patrón dominante para apps premium. Los swatches hardcoded en `SettingsAppearance.tsx` + `Onboarding.tsx` actualizados en paralelo para que el picker anticipe fielmente la paleta aplicada.

- **2026-04-19 — NEUTRAL LIGHT tint delta widened.** `.theme-neutral-light` era monocromático: `--background #fafaf9` vs `--surface-container-low #f5f5f4` eran ~3 % delta perceptual — tarjetas leían como parches del mismo nivel. Escala warm-Stone ensanchada (`--surface-container-low` → `#f1f0ec`, `--surface-container` → `#e5e4df`, `--surface-container-high` → `#d5d4cd`, `--surface-container-highest` → `#a8a59d`) para ~5 % delta. Outlines promovidos de Stone 200 a warm Stone 300 (`--outline: #d6d3cb`, `--outline-variant: #e7e5dc`) para visibilidad al 20 % opacity sin romper el Bevel borderless-feel. Brand accent Emerald 600 intacto.

- **2026-04-19 — OCEAN LIGHT typo fix.** `--surface-container-high: #cbd5e0` era hex inválido (6 chars pero el último `0` es un posible typo de `1`). Reemplazado por `#cbd5e1` (Slate 300 canónico). Zero diseño, puramente corrección.

- **2026-04-19 — NEUTRAL brand default (ADR-011).** `DEFAULT_STATE.palette = 'neutral'` se formaliza como decisión de producto. NEUTRAL pasa de "default técnico silencioso" a "paleta de marca canónica": el picker en Onboarding step 5 + SettingsAppearance muestra un badge `paletteRecommended` sobre la tile NEUTRAL. Las otras 3 paletas (`volt` / `ocean` / `ember`) se mantienen como personalidades alternativas igualmente soportadas, pero no son la voz de marca. Zero cambio técnico — el default ya era neutral; lo que cambia es la narrativa y el copy i18n. Ver ADR-011 para el contexto completo.

- **2026-04-19 — NEUTRAL LIGHT temperature-match polish (ADR-011).** Cuatro valores refinados para coherencia con la escala warm-Stone del resto del bloque: `--on-surface-variant` Neutral 700 `#404040` → Stone 700 `#44403c` (AAA 8.9:1), `--primary-container` Zinc 800 `#27272a` → Stone 800 `#292524`, `--on-primary-container` Neutral 50 `#fafafa` → Stone 50 `#fafaf9`, `--chart-text` Zinc 500 `#71717a` → Stone 500 `#78716c` (consistente con chart-grid warm). Zero cambio de identidad — primary sigue `#09090b`, brand-secondary Emerald 600.

- **2026-04-19 — NEUTRAL DARK depth fix + new lowest token (ADR-011).** `--surface-container-low` era `#18181b` — idéntico a `--surface` — rompiendo la jerarquía de contenedores (cualquier `bg-surface-container-low` sobre `bg-surface` no liftaba). Ajustado a `#1c1c1f` (+4 pts de luminosidad). Añadido `--surface-container-lowest: #0f0f11` (no existía en NEUTRAL DARK pero sí en las otras 3 paletas) para elementos "hundidos" (inputs, insets).
