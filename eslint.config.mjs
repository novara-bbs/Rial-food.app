import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';

// --- Design-System guardrails ------------------------------------------------
// These regex-based `no-restricted-syntax` rules enforce the rules in
// docs/DESIGN-SYSTEM.md + ADR-002/003/005. They target JSX className string
// literals via esquery's Literal[value=/…/] matcher.
//
// Note: we do NOT use eslint-plugin-tailwindcss. That plugin targets Tailwind
// v3 and has known incompatibilities with v4 @theme-based tokens. Our custom
// regex-based rules cover the drift patterns we actually care about.

/** Ban arbitrary `text-[Npx]` — use the typography scale (ADR-002). */
const noArbitraryTextSize = {
  selector: "Literal[value=/text-\\[\\d+(\\.\\d+)?(px|rem|em)\\]/]",
  message:
    'Do not use arbitrary text sizes (text-[Npx]). Use typography tokens: text-micro, text-caption, text-label, text-body, text-body-sm, text-body-lg, text-title-sm, text-title, text-headline, text-display. See docs/DESIGN-SYSTEM.md § 1.2.',
};

/** Ban hand-rolled SectionCard shape — use the <SectionCard> primitive (ADR-001). */
const noSectionCardDup = {
  selector:
    "Literal[value=/bg-surface-container-low[^\"']*\\bborder-outline-variant\\/20[^\"']*\\brounded-sm/]",
  message:
    'Do not duplicate the SectionCard shape. Use <SectionCard> from src/components/SectionCard.tsx. See docs/PRIMITIVES.md.',
};

/** Ban Template-literal variant of the SectionCard shape (same intent). */
const noSectionCardDupTpl = {
  selector:
    "TemplateElement[value.raw=/bg-surface-container-low[^`]*\\bborder-outline-variant\\/20[^`]*\\brounded-sm/]",
  message:
    'Do not duplicate the SectionCard shape. Use <SectionCard> from src/components/SectionCard.tsx. See docs/PRIMITIVES.md.',
};

/** Ban Tailwind `dark:` prefix — themes are class-based (ADR-005). */
const noDarkPrefix = {
  selector:
    "Literal[value=/(^|\\s)dark:(bg-|text-|border-|ring-|shadow-|from-|to-|via-|hover:|focus:|fill-|stroke-|divide-|placeholder-)/]",
  message:
    'Do not use the dark: Tailwind prefix. RIAL themes are class-based (theme-*). See ADR-005 and docs/DESIGN-SYSTEM.md § 2.',
};

/** Same ban inside template literals. */
const noDarkPrefixTpl = {
  selector:
    "TemplateElement[value.raw=/(^|\\s)dark:(bg-|text-|border-|ring-|shadow-|from-|to-|via-|hover:|focus:|fill-|stroke-|divide-|placeholder-)/]",
  message:
    'Do not use the dark: Tailwind prefix. RIAL themes are class-based (theme-*). See ADR-005.',
};

/** Ban arbitrary text size inside template literals too. */
const noArbitraryTextSizeTpl = {
  selector:
    "TemplateElement[value.raw=/text-\\[\\d+(\\.\\d+)?(px|rem|em)\\]/]",
  message:
    'Do not use arbitrary text sizes (text-[Npx]). Use typography tokens. See docs/DESIGN-SYSTEM.md § 1.2.',
};

/**
 * Ban Tailwind default shadow utilities outside the shadcn/ui allowlist
 * (ADR-010 § 2026-04-19 addendum). Use `shadow-elev-{0,1,2,3}` instead.
 *
 * Mapping: sm → elev-1, md → elev-2, lg/xl/2xl → elev-3, none → elev-0.
 * Excluded: `src/components/ui/**` (shadcn primitives) + `src/App.tsx`
 * (dev-only demo ribbon).
 */
const noTailwindShadow = {
  selector:
    "Literal[value=/(^|\\s)shadow-(sm|md|lg|xl|2xl)\\b/]",
  message:
    'Do not use Tailwind default shadows. Use the elevation scale: shadow-elev-{0,1,2,3} (sm→1, md→2, lg/xl/2xl→3). See ADR-010 and docs/DESIGN-SYSTEM.md § 1.4.',
};

const noTailwindShadowTpl = {
  selector:
    "TemplateElement[value.raw=/(^|\\s)shadow-(sm|md|lg|xl|2xl)\\b/]",
  message:
    'Do not use Tailwind default shadows. Use the elevation scale: shadow-elev-{0,1,2,3}. See ADR-010.',
};

/**
 * Require `font-headline` whenever `text-{xl|2xl|3xl|4xl}` is paired with
 * `font-bold` (ADR-011 § 2026-04-19 typography semantic rule). Prevents
 * headlines from falling back to Inter when Space Grotesk is intended.
 *
 * Matches: literal contains both text-Xl + font-bold AND does NOT contain
 * font-headline. (Positive lookaheads for text-* and font-bold, negative
 * lookahead for font-headline, all non-greedy inside the same string.)
 */
const noHeadlineWithoutFont = {
  selector:
    "Literal[value=/^(?=[^\"'`]*text-(xl|2xl|3xl|4xl)\\b)(?=[^\"'`]*font-bold\\b)(?![^\"'`]*font-(headline|mono)\\b).+/]",
  message:
    'Headlines (text-{xl,2xl,3xl,4xl} + font-bold) must include font-headline (or font-mono for numerical displays). For canonical headlines prefer text-headline or text-display. See ADR-011 and docs/DESIGN-SYSTEM.md § 1.1.',
};

const noHeadlineWithoutFontTpl = {
  selector:
    "TemplateElement[value.raw=/^(?=[^`]*text-(xl|2xl|3xl|4xl)\\b)(?=[^`]*font-bold\\b)(?![^`]*font-(headline|mono)\\b).+/]",
  message:
    'Headlines (text-{xl,2xl,3xl,4xl} + font-bold) must include font-headline (or font-mono). See ADR-011.',
};

const designSystemRules = [
  noArbitraryTextSize,
  noArbitraryTextSizeTpl,
  noSectionCardDup,
  noSectionCardDupTpl,
  noDarkPrefix,
  noDarkPrefixTpl,
  noTailwindShadow,
  noTailwindShadowTpl,
  noHeadlineWithoutFont,
  noHeadlineWithoutFontTpl,
];

/**
 * Q16 migration allowlist — files that carry pre-existing drift from the
 * DESIGN-AUDIT-2026-04-16 era. For these files the guardrails are downgraded
 * to `warn` so `release:preflight` can pass while Q16 migrates them one by
 * one. Any NEW file that introduces a banned pattern still errors.
 *
 * **Do not add new entries.** Removing entries as files are migrated is the
 * only allowed direction. When this array is empty, delete it and the
 * override block below.
 */
const q16MigrationAllowlist = [
  // shadcn/ui primitives retain Tailwind `dark:` prefixes (library convention).
  'src/components/ui/badge.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/textarea.tsx',
  // SectionCard-shape drift remaining post-Q16 B1 (text-[Npx] codemod).
  // B2 will migrate these with `<SectionCard>` primitive extensions.
];

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.claude/',
      // Capacitor build artifacts (gitignored; regenerated by `npx cap copy`)
      'android/app/src/main/assets/public/',
      'ios/App/App/public/',
      // Test & CI artifacts
      'coverage/',
      'playwright-report/',
      'test-results/',
      // Tooling reports
      'lint-report.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn', // warn to surface type debt; fix incrementally
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-restricted-syntax': ['error', ...designSystemRules],
    },
  },
  // Primitives that intentionally own the tile-surface shape.
  // SectionCard is the canonical container (ADR-001); ConstantTile is the
  // biometric tile primitive (ADR-009 V2 §4.10) — both use the same
  // surface/border/radius tokens by design.
  {
    files: [
      'src/components/SectionCard.tsx',
      'src/components/ConstantTile.tsx',
      'src/components/ui/surface.ts',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        noArbitraryTextSize,
        noArbitraryTextSizeTpl,
        noDarkPrefix,
        noDarkPrefixTpl,
        noTailwindShadow,
        noTailwindShadowTpl,
        noHeadlineWithoutFont,
        noHeadlineWithoutFontTpl,
      ],
    },
  },
  // Test/convention files may reference the banned shapes as fixtures.
  {
    files: ['src/test/conventions/**/*.{ts,tsx}', 'scripts/**/*.{mjs,js}'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Q16 migration allowlist — downgrade to `warn` so preflight passes while
  // migrations happen. New files outside this list still `error`.
  {
    files: q16MigrationAllowlist,
    rules: {
      'no-restricted-syntax': ['warn', ...designSystemRules],
    },
  },
  // Shadow allowlist (ADR-010 § 2026-04-19 addendum): App.tsx owns the
  // dev-only demo-mode ribbon — opt out of the Tailwind shadow ban only.
  {
    files: ['src/App.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        noArbitraryTextSize,
        noArbitraryTextSizeTpl,
        noSectionCardDup,
        noSectionCardDupTpl,
        noDarkPrefix,
        noDarkPrefixTpl,
        noHeadlineWithoutFont,
        noHeadlineWithoutFontTpl,
      ],
    },
  },
  // Shadow + dark: allowlist for shadcn/ui primitives. They ship with
  // `shadow-sm|lg` and `dark:` prefixes aligned with upstream convention.
  // Downgraded to `warn` like the Q16 allowlist so preflight stays green
  // while migrations happen. surface.ts is covered by the primitives-
  // exception block above (it already opts out of the SectionCard-dup ban
  // and inherits the base shadow ban — it contains zero Tailwind shadows).
  {
    files: [
      'src/components/ui/badge.tsx',
      'src/components/ui/button.tsx',
      'src/components/ui/input.tsx',
      'src/components/ui/select.tsx',
      'src/components/ui/tabs.tsx',
      'src/components/ui/textarea.tsx',
      'src/components/ui/card.tsx',
      'src/components/ui/dialog.tsx',
      'src/components/ui/popover.tsx',
      'src/components/ui/bottom-sheet.tsx',
      'src/components/ui/sheet.tsx',
      'src/components/ui/alert-dialog.tsx',
      'src/components/ui/slider.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'warn',
        noArbitraryTextSize,
        noArbitraryTextSizeTpl,
        noSectionCardDup,
        noSectionCardDupTpl,
        noDarkPrefix,
        noDarkPrefixTpl,
        noHeadlineWithoutFont,
        noHeadlineWithoutFontTpl,
      ],
    },
  },
);
