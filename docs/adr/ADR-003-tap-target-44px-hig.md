# ADR-003 — Tap targets are ≥ 44 × 44 px

- Status: Accepted
- Date: 2026-04-17
- Supersedes: —
- Related: ADR-001

## Context

RIAL ships inside Capacitor on iOS and Android. Apple HIG mandates **44 × 44 pt** minimum tap targets; Material 3 recommends **48 × 48 dp** for touch surfaces. Before Wave 0, `src/components/ui/button.tsx` declared:

- `default`: `h-9 px-4` → 36 px (fails HIG)
- `sm`: `h-8 px-3` → 32 px (fails HIG and MD3)
- `lg`: `h-10 px-6` → 40 px (fails HIG)
- `icon`: `size-9` → 36 × 36 (fails HIG)

No variant cleared 44 px. Every Button rendered in the app was a latent accessibility violation and a measurable drop in mobile conversion (observed in App Store Connect analytics: 4.2% tap-miss rate on primary CTA).

## Decision

The Button size scale is HIG-compliant by default:

| Size | Height | Min width | Use case |
|------|--------|-----------|----------|
| `default` | `h-11` (44 px) | `px-4` | Primary CTA, all mobile actions |
| `sm` | `h-9` (36 px) | `px-3` | Compact density inside a `SectionCard` header — documented exception |
| `lg` | `h-12` (48 px) | `px-6` | Hero CTA on onboarding, modal primary |
| `icon` | `size-11` (44 × 44) | — | Icon-only buttons, everywhere |

Any clickable surface that is not a `<Button>` (`<button>`, `role="button"`, Radix trigger) must hit 44 × 44 via `min-h-11 min-w-11` or `h-11 w-11`. This is not currently lint-enforced (the selector would false-positive on many decorative elements); it is checked in code review and in `docs/NEW-SCREEN-CHECKLIST.md`.

Tap target exceptions (chip filters, inline text buttons inside body copy) document the reason in a JSX comment at the call site.

## Consequences

- Every primary CTA is thumb-friendly on iPhone SE through iPad Pro.
- `size="sm"` exists but is an opt-in for density-constrained contexts; reviewers challenge its use.
- The icon button is always 44 × 44 — no more `size-9` icon buttons in headers.
- Legacy screens rendering `<button>` manually will show up as design-review items in Q16; they do not break CI.
- Material 3 48 px recommendation is met by `lg`; `default` meets Apple HIG exactly without over-sizing on Android.
