# ADR-007 — Radius uses a multiplicative scale

- Status: Accepted
- Date: 2026-04-17
- Supersedes: —
- Related: ADR-001, ADR-002

## Context

Before Wave 0, `src/index.css` declared:

```css
--radius: 0.25rem;
```

That is all. `rounded-md`, `rounded-lg`, `rounded-xl` in Tailwind v4 resolve to `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-xl)` — none of which existed. Tailwind silently fell back to its built-in defaults (`0.375rem`, `0.5rem`, `0.75rem`), which happen to **not** be derived from `--radius`. The result: the repo used 4 independent radius sources — `--radius`, Tailwind defaults, inline `rounded-sm` (= 0.125 rem by Tailwind default, not theme), and ad-hoc `rounded-[Npx]`.

Changing the base radius had no effect because `rounded-md` and up ignored it. A supposed "root design token" was unreachable.

This is the standard shadcn new-york bug when the CLI is run against a Tailwind v4 project; the fix is documented in the shadcn CLI v4 release notes.

## Decision

Radius is a multiplicative scale anchored on `--radius`:

```css
--radius:     0.75rem;                 /* 12 px — anchor */
--radius-xs:  calc(var(--radius) * 0.5);  /*  6 px */
--radius-sm:  calc(var(--radius) * 0.75); /*  9 px */
--radius-md:  calc(var(--radius) * 1);    /* 12 px */
--radius-lg:  calc(var(--radius) * 1.5);  /* 18 px */
--radius-xl:  calc(var(--radius) * 2);    /* 24 px */
--radius-2xl: calc(var(--radius) * 3);    /* 36 px */
```

Every `rounded-*` utility now resolves through `--radius`. Changing one line at the top propagates consistently.

Convention test `src/test/conventions/design-tokens.test.ts` asserts all levels exist, so a future refactor that deletes `--radius-lg` fails CI.

Arbitrary `rounded-[Npx]` is not lint-banned (too many legitimate SVG clip and mask use cases), but is discouraged in favor of the scale in `docs/DESIGN-SYSTEM.md`.

## Consequences

- `rounded-sm/md/lg/xl/2xl` now render the values the design intent expected; callers do not change.
- Brand tuning (e.g., softer vs. sharper app feel) is a one-line change to `--radius`.
- Six themes share the same radius; if a theme needs sharper corners, it overrides `--radius` in its class block.
- Tailwind default fallbacks are never reached for `rounded-*` on the canonical scale.
- New components added with `shadcn add` consume the scale correctly out of the box because the CLI v4 already expects multiplicative radii.
