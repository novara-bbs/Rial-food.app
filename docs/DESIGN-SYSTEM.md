# RIAL Design System

Canonical reference for tokens, themes, and conventions. Source of truth: `src/index.css`.

> **Why this file exists.** Every screen, every agent, every PR must speak the same visual language. When you need to know "what color?", "what size?", "which radius?" — look here first, then reach for the primitive (see `docs/PRIMITIVES.md`).

---

## 1. Foundational tokens

All tokens are declared in `src/index.css` under `@theme` and resolved by Tailwind v4 at build time. Consume them through Tailwind utilities (`text-body`, `rounded-sm`, `shadow-elev-2`, `bg-primary`). Never hardcode values.

### 1.1 Fonts

| Token | Value | Purpose |
|---|---|---|
| `font-headline` | Space Grotesk 400/500/600/700 | Screen titles, hero metrics, uppercase caps |
| `font-body` | Inter 400/500/600/700 | Primary reading, form fields, menu items |
| `font-label` | JetBrains Mono 400/500/600/700 | Numeric readouts, micro-labels, uppercase caps |

Loaded via Google Fonts in `src/index.css:1`. If you use `text-xs` inside a `<span className="font-label">` it renders JetBrains Mono — that is intentional.

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

Tailwind defaults (`shadow`, `shadow-md`, etc.) remain available but prefer elevation tokens for semantic consistency.

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

## 2. Themes (ADR-005)

**4 palettes × 2 modes = 8 theme classes**, resolved at runtime from `{palette, mode}` state (see `src/contexts/ThemeContext.tsx`):

| Palette | Dark class | Light class | Identity |
|---|---|---|---|
| `volt` | `.theme-volt-dark` (default `:root`) | `.theme-volt-light` | Zinc 950 / Volt green `#dcfd05` — performance athlete |
| `ocean` | `.theme-ocean-dark` | `.theme-ocean-light` | Slate 950 / Sky blue — analytical, disciplined |
| `ember` | `.theme-ember-dark` | `.theme-ember-light` | Stone 950 / Ember orange — warm creative |
| `neutral` | `.theme-neutral-dark` | `.theme-neutral-light` | Warm neutrals Bevel-style — adult wellness, emerald accent |

Plus a separate **mode axis** with 3 values exposed in the UI: `auto` (follows `prefers-color-scheme`), `light` (force day), `dark` (force night). `auto` is the default for new users.

State is persisted under `rial-theme-v2` as `{palette, mode}`. Legacy `rial-theme` values (`dark`, `light`, `blue-dark`, etc.) are migrated once on load. `ThemeContext` subscribes to `matchMedia('(prefers-color-scheme: dark)')` and swaps the class on `<html>` at runtime.

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
