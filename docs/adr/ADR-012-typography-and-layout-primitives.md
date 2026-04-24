# ADR-012 — Typography primitives (`<Heading>` + `<Text>`)

- Status: Accepted
- Date: 2026-04-24
- Supersedes: —
- Related: ADR-001 (primitives mandatory), ADR-002 (typography tokens), ADR-011 (NEUTRAL brand + `font-headline` rule)

## Context

ADRs 001/002/010/011 locked the **token layer** (`--font-headline`, `--text-{micro…display}`, `--shadow-elev-*`) and the **shape layer** (SectionCard, PageShell, shadow ban). Typography arbitraries (`text-[Npx]`) were codemodded to zero and the ESLint rule `noHeadlineWithoutFont` enforces Space Grotesk on Tailwind-default headline sizes.

But the **call-site layer** stayed open. ~160 `<h1>…<h4>` across `src/features/**` and `src/components/**` each re-derive the canonical RIAL headline shape by hand — `font-headline text-2xl font-bold tracking-tighter uppercase text-tertiary` — with local drift in tracking (`tracking-tight`, `tracking-tighter`, `tracking-widest`), weight (`font-bold`, `font-black`), and size family (mixing `text-xl` / `text-2xl` / `text-headline` for the same semantic role). Consequence: a visual update to "how an H2 looks in RIAL" requires touching ~30 files and risks introducing drift by omission.

Separately, `src/components/ui/card.tsx` (shadcn default) coexists with `src/components/SectionCard.tsx` (canonical RIAL card), confusing agents about which to reach for.

R2.2 introduced a serif editorial face (Fraunces, wired as `--font-serif` / `font-serif`) for the recipe hero. Using it via `font-['Fraunces']` arbitraries or hand-rolled `font-serif text-title font-semibold tracking-tight` strings at each call-site would reproduce the same drift at a smaller scale — so ADR-012 also routes the editorial face through the primitive's `variant="editorial"` rather than free-form utilities.

## Decision

1. **Canonical typography primitives.** Introduce `<Heading level variant>` and `<Text variant as>` in `src/components/ui/Typography.tsx`. They are the only sanctioned way to render a headline or a token-sized paragraph in `src/features/**` and `src/components/patterns/**`.

   ```tsx
   <Heading level="h2">Progress</Heading>
   <Heading level="h1" variant="editorial">Silken tofu with miso glaze</Heading>
   <Heading level="h3" variant="overline">Today</Heading>
   <Text variant="body-sm">45 g protein · 320 kcal</Text>
   ```

2. **`level` is semantic, `variant` is visual.** `level` maps to the HTML tag (a11y hierarchy). `variant` swaps the look: `default` (canonical brand headline), `editorial` (serif hero — uses `--font-serif`), `overline` (small-caps label regardless of level). This separation lets a screen have a single `<h1>` while visually showing it as `editorial` without misrepresenting page structure to screen readers.

3. **`--font-serif` token.** Declared in `src/index.css` `@theme` as `"Fraunces", ui-serif, Georgia, serif`. Tailwind v4 auto-exposes `font-serif`. Fraunces is loaded via the existing Google Fonts `@import` with `display=swap`.

4. **shadcn `card.tsx` is deprecated for feature code.** JSDoc deprecation header added. Imports from `@/components/ui/card` outside `src/components/ui/**` are blocked by ESLint in a follow-up B-phase rule. The file is retained so shadcn `dialog`/`sheet` internals stay intact.

5. **Consumption rules (enforced by ESLint Fase B)**:
   - `<h1..h4>` in `src/features/**` or `src/components/patterns/**` = **warn** (allowlist for the ~30 legacy files).
   - `text-{xs…4xl}` + `font-{medium|semibold|bold|black}` in the same zones = **warn** (allowlist for the ~60 legacy files).
   - New code outside the allowlist = error.

## Consequences

### Positive
- Changing "how an H2 looks across RIAL" = 1 edit in `Typography.tsx`. Changing the editorial face = 1 edit in `index.css`. Changing brand font = 1 token edit.
- Preserves the existing guardrails (`text-[Npx]` ban, `noHeadlineWithoutFont`, SectionCard shape). The primitive emits compliant strings.
- Escape hatch for legit divergence (editorial serif, overline) is a `variant` prop, not an arbitrary.

### Negative
- One more level of indirection between call-site and Tailwind class. Mitigated by the `data-heading-level` / `data-heading-variant` attributes (easy inspection in DevTools) and by the lookup-table style (no cva / cx trickery).
- Auth + Onboarding screens remain intentionally outside the primitive (divergent centered composition). Documented exception in `docs/PRIMITIVES.md`.

### Neutral
- Bundle size delta ≈ 0 (gzipped). Fraunces font-face request ≈ 60 KB on first paint; mitigated by `display=swap`.

## Compliance

- Convention test `src/test/conventions/typography-primitives.test.ts` asserts the 4 levels × 3 variants each render the correct tag and include the expected token class.
- ESLint rules (Fase B) quantify drift in CI. Allowlist entries decrease with each sprint of Fase C migration.
- `docs/PRIMITIVES.md` and `docs/NEW-SCREEN-CHECKLIST.md` updated with the primitive signature and mandatory usage.

## Open items

- The allowlist for auth + onboarding is permanent (editorial justification). Any other file escaping to allowlist needs an inline `// eslint-disable … ADR-012` with a one-line reason.
