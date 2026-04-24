# RIAL Design System

Canonical reference for tokens, themes, and conventions. Source of truth: `src/index.css`.

> **Why this file exists.** Every screen, every agent, every PR must speak the same visual language. When you need to know "what color?", "what size?", "which radius?" — look here first, then reach for the primitive (see `docs/PRIMITIVES.md`).

---

## 1. Foundational tokens

All tokens are declared in `src/index.css` under `@theme` and resolved by Tailwind v4 at build time. Consume them through Tailwind utilities (`text-body`, `rounded-sm`, `shadow-elev-2`, `bg-primary`). Never hardcode values.

### 1.1 Fonts

| Token | Value | Purpose |
|---|---|---|
| `font-headline` | Bricolage Grotesque variable (opsz 12..96, wght 200..800) | Screen titles, hero metrics, uppercase caps |
| `font-body` | Inter 400/500/600/700 | Primary reading, form fields, menu items |
| `font-label` / `font-mono` | JetBrains Mono 400/500/600/700 | Numeric readouts, micro-labels, uppercase caps. Both utilities alias to the same family — see § "Why two mono tokens" below. |
| `font-serif` | Fraunces variable (opsz 9..144, italic axis, wght 300..900) | Editorial heroes, verified-recipe detail, long-form moments — opt-in via `<Heading variant="editorial">` or raw `font-serif` utility (R2.5 verified-recipe titles) |

All four families are loaded via Google Fonts in `src/index.css:1–2`. No self-host, no preload — the critical-path hit is ~160 KB across Bricolage + Inter + JetBrains Mono, conditional fetch for Fraunces only when a `font-serif` class actually renders (editorial recipe hero). If you use `text-xs` inside a `<span className="font-label">` it renders JetBrains Mono — that is intentional. `font-serif` (Fraunces) is loaded but **not** applied by default — reach for it through `<Heading variant="editorial">` (ADR-012 primitive) or the raw `font-serif` Tailwind utility for verified-recipe titles (R2.5). One token, two consumers.

**Why two mono tokens?** Pre-`[1.5.84]` the repo declared only `--font-label`, so the semantic utility `font-label` rendered JetBrains Mono correctly — but the ~30 call-sites using the generic Tailwind `font-mono` utility (FastingTimer hero, Profile stats, Onboarding targets, CookTimer, KPI tiles, Discover/Community chips, etc.) fell through to the platform default mono (SF Mono on Mac, Consolas on Windows, Cascadia on newer Windows, Menlo on older iOS). `[1.5.84]` declares `--font-mono` as a sibling token pointing at the same JetBrains Mono stack, so both utilities bind to the brand mono. `font-label` remains the semantic-preferred utility (conveys intent: "this is a data label"); `font-mono` is accepted for existing call-sites and for monospace-alignment cases (OTP inputs, cook-timer countdowns).

**Regla semántica (ADR-011, 2026-04-19).** Todo `className` que combine `text-{xl,2xl,3xl,4xl}` + `font-bold` **debe** incluir `font-headline` en el mismo string — sin él, el texto cae en Inter bold por default y los titulares pierden la firma visual de Space Grotesk. Para titulares canónicos de pantalla prefiere `text-headline` (32 px) o `text-display` (40 px) sobre los tamaños Tailwind directos. Excepciones: `font-mono` (JetBrains Mono numérico) es válido en hero tiles de métricas. La regla se aplica via ESLint `no-restricted-syntax` + convention test `src/test/conventions/typography-semantic.test.ts` (BASELINE = 0 post-`[1.5.53]`).

### 1.2 Typography scale (ADR-002)

Semantic names with fixed pixel values. Use `text-{token}` utilities.

| Token | Resolved | Use for |
|---|---|---|
| `text-micro` | 10px | Caps labels inside `font-label`, legal text |
| `text-caption` | 11px | Footnotes, captions |
| `text-label` | 12px | Form labels, chips, metadata |
| `text-body-sm` | 13px | Secondary body |
| `text-body` | 14px | **Default body.** Screen content, paragraphs |
| `text-body-lg` | 16px | iOS input minimum, prominent body |
| `text-title-sm` | 18px | Card titles |
| `text-title` | 24px | Section headlines |
| `text-headline` | 32px | Screen titles |
| `text-display` | 40px | Hero metrics |

**Ban:** `text-[Npx]` arbitrary values are forbidden by ESLint. If the scale lacks a size you need, propose an extension in a PR — don't bypass. Tailwind's default `text-xs`/`sm`/`base`/`lg`/`xl` remain available for cases where the semantic token doesn't fit.

### 1.3 Radius (ADR-007)

Base token + multiplicative scale. Resolved values preserve Tailwind v4 defaults, so existing utilities keep their visuals. Changing `--radius` rescales the whole system proportionally.

| Token | Resolved | Class |
|---|---|---|
| `--radius-xs` | 2px | `rounded-xs` |
| `--radius-sm` | 4px | `rounded-sm` ← **primitive default** |
| `--radius-md` | 6px | `rounded-md` |
| `--radius-lg` | 8px | `rounded-lg` |
| `--radius-xl` | 12px | `rounded-xl` |
| `--radius-2xl` | 16px | `rounded-2xl` |

**Rule:** primitives default to `rounded-sm`. Larger radii are reserved for specific surfaces (dialogs, hero cards) documented per component.

### 1.4 Shadow / elevation

| Token | Purpose |
|---|---|
| `shadow-elev-0` | No elevation — inline on surface |
| `shadow-elev-1` | Hover hint — subtle lift |
| `shadow-elev-2` | Floating surface — cards over content |
| `shadow-elev-3` | Dialogs, popovers, command palettes |

**Regla (ADR-010 § 2026-04-19 addendum).** Los utilities Tailwind default `shadow-{sm,md,lg,xl,2xl}` están **prohibidos** fuera del allowlist shadcn. Usa la escala semántica `shadow-elev-{0,1,2,3}`. Migration table:

| Tailwind utility | Target elev token | Rationale |
|---|---|---|
| `shadow-sm` | `shadow-elev-1` | Mismo nivel perceptual (`0 1 2 rgb/0.05`) |
| `shadow-md` | `shadow-elev-2` | Tokens matchean (`0 4 6 -1 rgb/0.1`) |
| `shadow-lg` | `shadow-elev-3` | Match (`0 10 15 -3 rgb/0.1`) |
| `shadow-xl` | `shadow-elev-3` | Cap — RIAL no necesita el nivel xl |
| `shadow-2xl` | `shadow-elev-3` | Idem cap |
| `shadow-none` | `shadow-elev-0` | Explicitar intención |

**Allowlist (excluidos del ban):** `src/components/ui/**/*.{ts,tsx}` (shadcn primitives retain Tailwind shadows aligned with upstream — dialog / popover / sheet / select / tabs / card / slider) + `src/App.tsx` (dev-only demo-mode ribbon). Los colored shadow tints `shadow-{color}/N` (`shadow-primary/25`, etc.) son overlays decorativos, **no** parte del scale de elevación — permanecen fuera de scope.

La regla se aplica via ESLint `no-restricted-syntax` + convention test `src/test/conventions/shadow-elevation.test.ts` (BASELINE = 0 post-`[1.5.53]`).

**Elevation en primitives (ADR-010):** `SectionCard` aplica `shadow-elev-1` por default para diferenciar tarjetas del background en modos light. En modos dark el shadow es imperceptible (`rgb(0 0 0 / 0.05)` sobre casi-negro ≈ 0 delta); en modos light aporta depth mínima sin crear skeuomorfismo, complementaria al border `outline-variant/20` y al tint delta `bg ↔ surface-container-low`. Nuevos primitives deben considerar este patrón "belt-and-suspenders" (border + tint + shadow muy sutil) antes de introducir elevación propia.

### 1.5 Color tokens

All color is theme-aware. The single class `theme-{name}` on `<html>` swaps an entire palette. Never use literal hex in components.

**Surface layers (ordered dark → light):**
`bg-background` → `bg-surface` → `bg-surface-container-low` → `bg-surface-container` → `bg-surface-container-high` → `bg-surface-container-highest`.

**Text on surfaces:**
`text-on-surface` (primary) · `text-on-surface-variant` (secondary) · `text-tertiary` (headlines).

**Brand & state:**
`primary` / `on-primary` (main action), `brand-secondary` / `on-brand-secondary` (accent), `error` / `on-error`, `outline` / `outline-variant` (borders).

**Nutrient (theme-independent):**
`macro-protein` · `macro-carbs` · `macro-fats`.

**Overlay (for dark full-screen overlays — CookMode, Stories):**
`on-overlay` · `on-overlay-muted` · `overlay-border`.

**shadcn bridge tokens** (`foreground`, `card`, `popover`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar*`) are wired to the above — use them only when extending shadcn primitives.

---

## 2. Themes (ADR-005 + ADR-011)

RIAL ships **4 palettes × 2 modes = 8 theme classes**, resolved at runtime from `{palette, mode}` state (see `src/contexts/ThemeContext.tsx`). Since **ADR-011 (2026-04-19)**, **NEUTRAL es la paleta de marca canónica** — la identidad RIAL por default (monocromática cálida + acento Emerald). Las otras 3 (`volt` · `ocean` · `ember`) son **personalidades alternativas** igualmente soportadas, pero no son la voz de marca. `DEFAULT_STATE.palette = 'neutral'` en `ThemeContext`; el picker (Onboarding step 5 + SettingsAppearance) renderiza un badge `t.settings.paletteRecommended` sobre la tile NEUTRAL.

| Palette | Dark class | Light class | Identity |
|---|---|---|---|
| **`neutral` (marca)** | `.theme-neutral-dark` | `.theme-neutral-light` | Warm Stone + Emerald 600 (LIGHT) / 500 (DARK) — identidad RIAL canónica, adult wellness |
| `volt` | `.theme-volt-dark` (default `:root`) | `.theme-volt-light` | Dark: Zinc 950 / Volt green `#dcfd05`. Light: warm-neutral Stone `#faf9f6` / Lime 600 `#65a30d` — performance athlete, electric |
| `ocean` | `.theme-ocean-dark` | `.theme-ocean-light` | Slate 950 / Sky blue — analytical, disciplined |
| `ember` | `.theme-ember-dark` | `.theme-ember-light` | Stone 950 / Ember orange — warm creative |

**NEUTRAL token key values (locked via `theme-palettes.test.ts`):**

| Token | LIGHT | DARK |
|---|---|---|
| `--background` | `#fafaf9` Stone 50 warm | `#0a0a0b` warm near-black |
| `--primary` | `#09090b` near-black | `#fafafa` warm off-white |
| `--brand-secondary` | `#059669` Emerald 600 | `#10b981` Emerald 500 |
| `--surface-container-low` | `#f1f0ec` warm Stone 100 | `#1c1c1f` (+4 pts vs surface) |
| `--surface-container-lowest` | — | `#0f0f11` (new, ADR-011) |
| `--on-surface-variant` | `#44403c` Stone 700 (AAA 8.9:1) | `#a1a1aa` Zinc 400 |
| `--chart-text` | `#78716c` Stone 500 warm | `#71717a` Zinc 500 |

Plus a separate **mode axis** with 3 values exposed in the UI: `auto` (follows `prefers-color-scheme`), `light` (force day), `dark` (force night). `auto` is the default for new users.

State is persisted under `rial-theme-v2` as `{palette, mode}`. Legacy `rial-theme` values (`dark`, `light`, `blue-dark`, etc.) are migrated once on load. `ThemeContext` subscribes to `matchMedia('(prefers-color-scheme: dark)')` and swaps the class on `<html>` at runtime.

**VOLT LIGHT background (2026-04-19):** `#faf9f6` (warm-neutral Stone). La identidad VOLT viaja por `primary: Lime 600 #65a30d` + `brand-secondary: Lime 500 #84cc16`, no por tint de background. Un intento previo con warm-lime `#fafff0` leía "infantil / campo" y se revirtió — el patrón 2025 en apps premium (Linear, Notion, Bevel, Stripe) es **warm-neutral bg + green accent** porque el contraste warm/cool potencia el verde sin fatigar al ojo en uso prolongado.

**Rule (ADR-005):** never use Tailwind's `dark:` prefix. It only toggles two palettes and breaks the other 6 classes. Theme-specific overrides go in `@layer base .theme-*` in `src/index.css`.

---

## 3. Do / Don't

### Typography
| ✅ Do | ❌ Don't |
|---|---|
| `<span className="text-body">` | `<span className="text-[14px]">` |
| `<span className="font-label text-micro uppercase">` | `<span className="text-[10px] uppercase">` |
| Extend the scale in a PR if a real gap exists | Use arbitrary values "just this once" |

### Surfaces
| ✅ Do | ❌ Don't |
|---|---|
| `<SectionCard title="...">` | Manual `bg-surface-container-low border border-outline-variant/20 rounded-sm p-5` |
| `<StatTile label="..." value={...} />` | Manual metric box with `text-xl font-black` inside a div |
| `rounded-sm` on primitives | `rounded-[6px]` arbitrary |

### Color
| ✅ Do | ❌ Don't |
|---|---|
| `text-primary` | `text-[#dcfd05]` |
| `bg-surface-container-low` | `bg-zinc-900` (theme-locked) |
| Add a theme variable for a new surface role | Hard-code hex |

### Tap targets (ADR-003)
| ✅ Do | ❌ Don't |
|---|---|
| `<Button size="default">` (44×44) | `<Button size="sm">` for primary CTAs |
| `w-11 h-11` for custom clickables | `w-8 h-8` click targets |

### i18n (ADR-004)
| ✅ Do | ❌ Don't |
|---|---|
| `{t.profile.goal}` | `"Objetivo"` hardcoded |
| Add key in both `es.ts` and `en.ts` | Add only in `es.ts` |

---

## 3b. Typography primitives — single source of truth (ADR-012)

RIAL works **CMS-style** for headings and body text: one file controls the look of every
H1..H4 and every token-sized text block. You don't edit call-sites to change brand
typography — you edit the primitive and the change propagates everywhere.

### The primitives

| Primitive | File | What it does |
|---|---|---|
| `Heading` | `src/components/ui/Typography.tsx` | Renders `<h1..h4>` with three variants: `default` (Bricolage Grotesque caps, canonical RIAL voice), `editorial` (Fraunces serif, opt-in hero), `overline` (small-caps sub-header regardless of level). |
| `Text` | `src/components/ui/Typography.tsx` | Renders token-sized paragraph/inline text — `variant` selects `body-lg / body / body-sm / caption / label / micro`, `as` picks the tag (`p`, `span`, `div`, etc.). |

### Change the whole brand voice in 1 edit

To switch H2 from uppercase Bricolage Grotesque to mixed-case Fraunces across the entire app:

1. Open `src/components/ui/Typography.tsx`.
2. Find `HEADING_STYLES.h2.default`.
3. Swap the class string. Save.
4. Every screen that uses `<Heading level="h2">` repaints with the new voice.

To change the editorial hero face from Fraunces to e.g. Playfair:

1. Open `src/index.css`.
2. Update `@import url(...)` to load Playfair instead of Fraunces.
3. Update `--font-serif` under `@theme` to `"Playfair Display", serif`.
4. Every `<Heading variant="editorial">` and every raw `font-serif` utility (R2.5 verified-recipe titles) repaints together.

### Rule

- New screens must use `<Heading>` and `<Text>` instead of ad-hoc `className` strings
  that combine `font-*` + `text-*` + `font-bold` + `uppercase` + `tracking-*`.
- Raw `<h1..h4>` with hand-rolled Tailwind typography is allowed **only** when the
  variant truly doesn't fit (bespoke hero, auth greeting) and the file is on the
  `typographyMigrationAllowlist` in `eslint.config.mjs`. The allowlist shrinks every
  sprint — don't grow it.

This is enforced by:
- ESLint `no-restricted-syntax` targeting JSXOpeningElement nodes for `h1..h4` with
  ad-hoc typography strings outside the allowlist.
- `src/test/conventions/typography-primitives.test.tsx` locking the canonical class
  strings for each `{level, variant}` cell.

---

## 3c. Filter composition — one axis, one primitive (ADR-013)

The filter layer has six primitives. Pick by the **axis the user is choosing on**, not by visual similarity:

```
                       What is the user choosing?
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
    Navigation                 Reduction                 Ordering
  (between sets)            (within a set)           (same set, reordered)
        │                         │                         │
   ┌────┴────┐              ┌─────┼─────┐                   │
   │         │              │     │     │                   │
  1-of-N   Card-          1-of-N  0..N Free-text            │
  required scoped        optional      search               │
   │         │              │     │     │                   │
 TabNav  Segmented-      ChipRow  ChipRow  SearchInput  SortControl
          Tabs           single   multi
                         (variant:pill/icon/emoji)
                         (tone:default/danger)
```

Plus one rail for editorial curation: **`CollectionsCarousel`** — curated taxonomies (R3 registry: `verified / quick / highProtein / vegan / lowCarb / batch`) with counts. Not a filter primitive; lives above the chip-row and hides once the user commits to one.

**Dedup invariant**: a dimension (e.g. `quick`) lives in *exactly one* primitive. If it's a curated collection in `CollectionsCarousel`, it is **not** also a chip in `ChipRow`. Two different surfaces with the same handler is the single most common bug this layer produces (Cocina `[1.5.86]` root cause).

**Enforced by**:
- `src/test/conventions/filter-system.test.ts` — invariant A (no inline chip reimplementation in `features/**`) + invariant B (no branded native `<select>` in `features/**/screens/*`).
- `src/test/conventions/primitives-export.test.ts` — locks `ChipRow`, `SortControl`, `TabNav`, `SearchInput`, `FilterRow` (shim) exports.

**Anti-pattern — do NOT do this**:

```tsx
// ✗ FilterRow pill as tabs → primitive misuse (no role=tablist, no underline)
<FilterRow variant="pill" chips={[{id:'forYou'},{id:'following'},{id:'trending'}]} />

// ✗ Same dimension on carousel AND chip-row → duplicate axis, diverging state
<CollectionsCarousel collections={[{id:'quick'}, …]} />
<ChipRow options={[{id:'quick'}, …]} />

// ✗ Inline <select> with brand font → bypasses SortControl
<select className="font-label uppercase tracking-widest …">…</select>

// ✗ Inline chip with canonical chip styles → bypasses ChipRow
<button className="shrink-0 rounded-full px-4 py-2 font-headline uppercase tracking-widest …">
```

**Canonical — do this**:

```tsx
// Source navigation
<TabNav tabs={[…]} active={mode} onChange={setMode} />

// Optional facet
<ChipRow mode="single" variant="pill" options={…} active={active} onChange={setActive} />

// Multi-select with "excluded" semantics
<ChipRow mode="multi" variant="pill" tone="danger" options={allergens}
  active={Array.from(excluded)} onChange={(ids) => setExcluded(new Set(ids))} />

// Ordering
<SortControl options={…} active={sortMode} onChange={setSortMode} />
```

`FilterRow` is a `@deprecated` shim that delegates to `ChipRow`. New code imports `ChipRow` directly.

---

## 4. How to extend

### Adding a new token
1. Is it truly a new concept, or can an existing token cover it? Prefer reuse.
2. If new: add under `@theme` in `src/index.css`. Name it semantically, not visually (`--text-body-lg`, not `--text-16`).
3. Document it in this file's section 1.
4. If it's a design decision (new rule), add an ADR under `docs/adr/`.
5. Design-system owner reviews the PR.

### Adding a new theme
1. Copy an existing `.theme-*` block in `src/index.css`.
2. Override only the variables that change (`--background`, `--primary`, etc. — keep shadcn bridge as-is).
3. Verify WCAG AA contrast on `on-*` pairs with a tool like https://webaim.org/resources/contrastchecker/.
4. Ship behind a feature flag if experimental.

### Extending the typography scale
Forbidden without ADR amendment. If you need a 20px size between `text-title-sm` (18px) and `text-title` (24px), open an ADR-002 amendment PR.

### Adding a new primitive
See `docs/PRIMITIVES.md` § "Adding a primitive".

---

## 5. Verification

Before shipping a PR that touches tokens or theme files:

```bash
npm run check:i18n          # ES/EN key symmetry (Wave 3)
npm run release:preflight   # tsc + lint + test + build + size
```

Smoke visual: open `src/App.tsx` in dev, cycle through the 8 theme classes (4 palettes × 2 modes) either via the Settings → Apariencia picker or by writing to `localStorage.rial-theme-v2`. Check the modified surface in each, and check `mode: 'auto'` honors the OS `prefers-color-scheme` change.

---

## 6. References

- ADR-001: Primitives are mandatory
- ADR-002: Typography scale tokens
- ADR-003: 44×44 HIG tap targets
- ADR-004: i18n ES/EN symmetric
- ADR-005: Theme by class, not `dark:`
- ADR-006: shadcn new-york + unified radix
- ADR-007: Radius multiplicative scale
- ADR-008: Pricing model — free-generous core + single premium tier
- ADR-009: Bottom-sheet anatomy
- ADR-012: Typography & layout primitives (`<Heading>`, `<Text>`)
- ADR-013: Filter system primitives (`ChipRow`, `SortControl`)
- `docs/DESIGN-AUDIT-2026-04-16.md` — origin audit that produced these rules
- `docs/market/bevel-design-playbook.md` — Bevel competitor analysis + copy/adapt/skip matrix (source of §7)

---

## 7. Light-mode reference: Bevel

`.theme-light` aspires to a Bevel-style "warm-neutral Apple-designed" look. Full rationale + capture catalog + 4-PR roadmap in `docs/market/bevel-design-playbook.md`. Summary of guidelines:

### 7.1 Surfaces in light mode

| Token | Current (pre-Bevel tune) | Target (Bevel tune) | Status |
|---|---|---|---|
| `--background` | `#ffffff` | `#fafaf9` (stone-50, warm) | Pending PR 3 |
| `--surface` | `#ffffff` | `#ffffff` (unchanged) | — |
| `--outline-variant` | visible `#e5e5e5` | nearly invisible `#f1f1f3` | Pending PR 3 |
| `--primary` | `#09090b` | `#09090b` (unchanged) | — |
| Card elevation | `border border-outline-variant/20` + shadow | **borderless**, `shadow-elev-2` only | Pending PR 3 |

Dark themes (`theme-volt-dark`, `theme-blue-dark`, `theme-orange-dark`) and the other light themes (`theme-blue-light`, `theme-orange-light`) keep their personality — Bevel-tune applies **only** to `.theme-light`.

### 7.2 Bottom-sheet anatomy

All new bottom sheets follow **ADR-009**:

- Max height `88vh` → status bar + dynamic island visible behind.
- Overlay `bg-black/25` (not 50%).
- Handle pill (4×32 px) centered at top.
- Sticky header with X + title + action slot.
- `rounded-t-3xl` top corners.
- Prefer `<BottomSheet>` primitive over raw `<Sheet side="bottom">`.

### 7.3 Empty states

Sub-sheet empty states follow the informative variant (skeleton + icon + title + description, **no CTA**) — see Bevel IMG_0990. Top-level empty states (first-time Home, user-created lists) retain actionable CTAs.

### 7.4 Information design

Screen module hierarchy follows Bevel transversal pattern:

```
[Header: título + periodo]
[Hero: UN elemento dominante]
[Grid 2×N de sub-metrics]
[ListRow educativa]
[Cross-link a módulo relacionado]
[Tendencias scrollable opcional]
```

Applied in Home ICP-adaptive hero consolidation (Q15 candidate — feature-flagged).

### 7.5 What is NOT Bevel-style

- JetBrains Mono labels for macros — RIAL-specific differentiator, kept.
- VOLT / OCEAN / EMBER color themes — Bevel is monochrome; RIAL keeps theme diversity.
- Recipe UX — Paprika/Yummly are better references (see `docs/market/ux-patterns.md`).
- CGM/glucose module — out of ICP scope 2026.
