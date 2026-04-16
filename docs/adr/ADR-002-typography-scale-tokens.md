# ADR-002 — Typography scale is tokenized

- Status: Accepted
- Date: 2026-04-17
- Supersedes: —
- Related: ADR-001, ADR-007

## Context

Q16 audit counted **445** arbitrary `text-[Npx]` occurrences in 85 files. Sizes observed ranged from `text-[7px]` to `text-[28px]` with no pattern — agents picked whichever visual pixel looked right in the moment. The side effects:

- Labels bounce between 9, 10, 11, and 12 px across screens that render the same semantic token.
- Theme switches shift optical weight because JetBrains Mono renders differently at non-standard sizes.
- Accessibility scoring drops when body copy falls below 14 px (WCAG 1.4.4) on mobile.
- Visual consistency across `Profile`, `Home`, `Progress`, and `Settings` is impossible without a reference scale.

Tailwind v4 ships native support for custom typography tokens via `@theme`. The repo already uses this block in `src/index.css` for color, radius, and font tokens — adding the typography scale costs ~15 declarations and unlocks the lint ban.

## Decision

A closed, semantic typography scale of 10 levels lives in `src/index.css` under `@theme inline`:

```
--text-micro      10 px   metric labels (JetBrains Mono)
--text-caption    11 px   timestamps, dense tables
--text-label      12 px   form labels, tab labels
--text-body-sm    13 px   secondary body
--text-body       14 px   primary mobile body (minimum legible)
--text-body-lg    16 px   desktop body, long-form
--text-title-sm   18 px   card titles
--text-title      24 px   section titles
--text-headline   32 px   screen headlines
--text-display    40 px   hero metrics
```

Arbitrary Tailwind sizes (`text-[Npx]`, `text-[Nrem]`, `text-[Nem]`) are banned via `no-restricted-syntax` in `eslint.config.mjs`. The rule covers both string literals in `className` and template-literal chunks (`cn()` compositions). A Q16 migration allowlist downgrades the rule to `warn` for pre-existing offender files — new files error immediately.

Convention test `src/test/conventions/design-tokens.test.ts` asserts every level exists in `@theme`, so renaming or deleting a token without migrating callers fails CI.

## Consequences

- Designers extend the scale by PR to `src/index.css` + `docs/DESIGN-SYSTEM.md`; agents do not invent sizes inline.
- The scale is small enough to hold in memory (10 tokens) but covers every observed use case in `src/`.
- Q16 migration will codemod `text-[Npx]` → nearest token; the allowlist tracks progress.
- A legitimate outlier (SVG-sized text, chart axis) uses `style={{ fontSize: ... }}` rather than Tailwind arbitrary values — this sidesteps the lint rule deliberately and signals "not a UI text size."
- New Tailwind defaults (`text-xs`, `text-sm`, `text-base`) are not banned but are discouraged; prefer semantic names because they map 1:1 to the audit's observed needs.
