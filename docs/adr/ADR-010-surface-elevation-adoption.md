# ADR-010 — Surface elevation adopted in `SectionCard` primitive

- Status: Accepted
- Date: 2026-04-19
- Supersedes: —
- Related: ADR-001, ADR-005

## Context

Post-`[1.5.46]` audit of the 8 palette × mode combinations exposed a recurring complaint on monochromatic palettes: sections and cards don't differentiate from the background. NEUTRAL LIGHT was the worst offender — `--background #fafaf9` vs `--surface-container-low #f5f5f4` produced only ~3 % perceptual delta; the hairline border at 20 % opacity was not enough to recover the hierarchy. VOLT LIGHT (warm-neutral Stone after the de-greening) hit the same ceiling for the same structural reason.

The `--shadow-elev-*` token scale (`elev-1` = `0 1px 2px 0 rgb(0 0 0 / 0.05)`, `elev-2`, `elev-3`) has existed in `src/index.css` since Q15.5 but had only one consumer outside its own documentation (`BottomSheet` uses `shadow-elev-3`). `SectionCard`, the primitive that covers ~70 % of the screen area in Home / Progress / Profile / Planner, rendered with 0 elevation.

Cross-competitor research (2026-04-19): Linear, Notion, Stripe, shadcn/ui and Bevel all apply a minimal elevation cue on their equivalent "card" primitive. The 2025 consensus is **border + subtle tint + shadow muy sutil** as a "belt-and-suspenders" pattern: each cue alone is weak, together they differentiate hierarchy reliably across themes. Material 3 tonal elevation (which replaces shadow with a tint shift) is considered over-engineered for 2025 — the industry has reverted to the traditional warm-neutral + border + shadow combination.

## Decision

`SectionCard` applies `shadow-elev-1` by default in its base class string.

```tsx
// src/components/SectionCard.tsx
'bg-surface-container-low border border-outline-variant/20 rounded-sm shadow-elev-1'
```

Rationale:

- The shadow is imperceptible in dark modes — `rgb(0 0 0 / 0.05)` over a near-black background resolves to ~0 visual delta. Zero regression on VOLT DARK, OCEAN DARK, EMBER DARK, NEUTRAL DARK.
- In light modes the shadow is barely above threshold — enough to insinuate the lift without crossing into skeuomorphism. VOLT LIGHT and NEUTRAL LIGHT are the primary beneficiaries.
- The default shape in `SectionCard` is the single source of truth. The 72 tracked consumers (see `src/test/conventions/sectioncard-usage.test.ts`) all re-paint automatically — no per-call-site migration needed.
- Variant `padding="none"` / `spacing="none"` retain the shadow; the shadow lives on the primitive's container branch and is orthogonal to padding/spacing.
- `variant="none"` — not currently exported — if ever introduced, must explicitly opt out of the shadow.
- A convention test (`SectionCard primitive shape`) locks the primitive's default class string to include `shadow-elev-1`. Removing the shadow inadvertently fails CI.

## Consequences

- 8 palettes × (1 primitive consumer) re-paint automatically on the next build. No data migration, no i18n work, no per-consumer refactor.
- `INPUT_SURFACE_CLASSES` (form inputs) and `BUTTON_CARD_SURFACE_CLASSES` (clickable button-cards in `surface.ts`) are NOT touched — inputs should not lift; button-cards already ship a hover shadow under `focus-visible:shadow-elev-2`.
- Existing hand-rolled replicas of the SectionCard shape (72 tracked in Q16 drift baseline) still use the legacy shape without the shadow. They'll gain the shadow only after migration to `<SectionCard>`. This is consistent with the Q16 drift-reduction sprint, not a regression.
- Tailwind v4 bundles `shadow-elev-1` into every css chunk that consumes `bg-surface-container-low` already — expected bundle delta ≤ 200 bytes on the main entry.
- Future elevation decisions (e.g., `variant="elevated"` with `shadow-elev-2` for modals-over-sheets) are additive. Do not promote `shadow-elev-2` to the default without re-running the 8-palette audit — over-shadowing reads skeuomorphic.

## Notes

The cue-stacking "belt-and-suspenders" approach is deliberate: border-only (Bevel) reads borderless at 20 % opacity in warm-neutral palettes; shadow-only (Stripe) fails on dark modes; tint-only (Notion) requires ≥ 5 % delta which is expensive to tune across 8 palettes. The combination is the cheapest way to get readable hierarchy in all 8 modes with a single primitive change.
