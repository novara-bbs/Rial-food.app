# ADR-001 — Primitives are mandatory

- Status: Accepted
- Date: 2026-04-17
- Supersedes: —
- Related: ADR-002, ADR-007

## Context

The Q16 design audit (`docs/DESIGN-AUDIT-2026-04-16.md`) counted **134** hand-rolled duplications of the SectionCard shape (`bg-surface-container-low border border-outline-variant/20 rounded-sm p-5`) across 49 files, plus ad-hoc variants of StatTile, SegmentedTabs, PageShell, and modal chrome. Each duplication drifts on its own schedule: some have wrong radius, some wrong border opacity, some skip the padding scale, some omit the focus ring. The net effect is visual incoherence across screens built by different agents in different sprints.

The repository already ships canonical primitives in `src/components/` and `src/components/ui/` (shadcn new-york, unified `radix-ui`). They are correct, accessible, theme-safe, and documented. Their main failure mode is that agents bypass them and inline the shape.

## Decision

Every screen, section, tile, tab group, metric, empty state, and modal must be expressed through the canonical primitive. The canonical list lives in `docs/PRIMITIVES.md` and is enforced by:

1. `no-restricted-syntax` ESLint rule that bans the literal SectionCard shape outside `src/components/SectionCard.tsx`.
2. Convention test `src/test/conventions/primitives-export.test.ts` that fails if any canonical primitive's import path or default export breaks.
3. Convention test `src/test/conventions/sectioncard-usage.test.ts` that locks the drift count at the Q16 baseline (134) and fails on any increase.

New work must reach for the primitive first. Inlining the shape is a CI failure, not a stylistic preference.

## Consequences

- Screens written by unfamiliar agents ship consistent visuals because the primitive owns the shape.
- Changes to the shape (radius, border, padding) propagate by editing one file.
- The Q16 migration drops the baseline incrementally; the test never allows regression.
- Adding a new primitive requires a PR that updates `PRIMITIVES.md` and `primitives-export.test.ts` — this is the intended friction.
- A legitimate one-off surface (marketing, embed, canvas) that cannot reuse a primitive must document the exemption inline with an ESLint disable + justification; reviewers treat those disables as design-system events.
