import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';

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
 * headlines from falling back to Inter when Bricolage Grotesque is intended
 * (`--font-headline` token, [1.5.84]; previously Space Grotesk).
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

/**
 * Prefer the <Heading> primitive (ADR-012). Raw <h1..h4> JSX elements in
 * features, patterns, and top-level components should be composed via
 * `<Heading level="h1|h2|h3|h4" variant="default|editorial|overline">` from
 * `@/components/ui/Typography`. The primitive renders the canonical
 * `font-headline + text-* + uppercase + tracking + text-tertiary` stack, so
 * changing the RIAL headline look is a 1-line edit.
 *
 * Typography.tsx itself renders a dynamic `<Tag>` variable (not a literal
 * `h1..h4`), so this selector does not match there.
 */
const preferHeadingPrimitive = {
  selector:
    "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^h[1-4]$/]",
  message:
    'Use <Heading level="h1|h2|h3|h4" variant?> from @/components/ui/Typography instead of raw <h1..h4>. See ADR-012.',
};

/**
 * Prefer semantic typography tokens (ADR-012). Class strings combining a
 * Tailwind default size (text-{xs..4xl}) with a font-weight
 * (font-{medium|semibold|bold|black}) should be expressed via the
 * <Heading>/<Text> primitives or the semantic scale
 * (text-{body-sm,body,body-lg,title-sm,title,headline,display}).
 *
 * The existing `noHeadlineWithoutFont` rule already bans the worst case
 * (text-{xl..4xl} + font-bold without font-headline). This rule extends the
 * nudge to the rest of the weight+size combinations so feature code stops
 * hand-rolling headings.
 */
const preferSemanticTextToken = {
  selector:
    "Literal[value=/^(?=[^\"'`]*\\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl)\\b)(?=[^\"'`]*\\bfont-(medium|semibold|bold|black)\\b).+/]",
  message:
    'Prefer the typography primitive. Use <Heading> or <Text> from @/components/ui/Typography, or a semantic token (text-{body,body-sm,body-lg,title-sm,title,headline,display}). See ADR-012.',
};

const preferSemanticTextTokenTpl = {
  selector:
    "TemplateElement[value.raw=/^(?=[^`]*\\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl)\\b)(?=[^`]*\\bfont-(medium|semibold|bold|black)\\b).+/]",
  message:
    'Prefer the typography primitive. Use <Heading>/<Text> or a semantic token (text-{body,title,headline,display}). See ADR-012.',
};

/**
 * Ban chip token drift — chip-shaped surfaces (`rounded-full`) must use the
 * chip typography token (`text-nano` 9px). `text-caption` (11px) and
 * `text-micro` (10px on chips) are legacy patterns that escaped the chip
 * rework on 2026-05-01. See `chip-primitives.test.ts` for the positive lock.
 */
const noChipTokenDrift = {
  // Match rounded-full + horizontal padding (chip signature, excludes avatars)
  // + text-caption (legacy chip token; chips must use text-nano).
  selector:
    "Literal[value=/^(?=[^\"'`]*\\brounded-full\\b)(?=[^\"'`]*\\bpx-(1\\.5|2|2\\.5|3|3\\.5|4)\\b)(?=[^\"'`]*\\btext-caption\\b).+/]",
  message:
    'Chip-shaped surfaces (rounded-full + px-N) must use text-pico (8px), not text-caption. See chip-primitives.test.ts and ADR-013.',
};

const noChipTokenDriftTpl = {
  selector:
    "TemplateElement[value.raw=/^(?=[^`]*\\brounded-full\\b)(?=[^`]*\\bpx-(1\\.5|2|2\\.5|3|3\\.5|4)\\b)(?=[^`]*\\btext-caption\\b).+/]",
  message:
    'Chip-shaped surfaces (rounded-full + px-N) must use text-pico (8px), not text-caption. See ADR-013.',
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
  preferHeadingPrimitive,
  preferSemanticTextToken,
  preferSemanticTextTokenTpl,
  noChipTokenDrift,
  noChipTokenDriftTpl,
];

/**
 * ADR-012 typography-migration allowlist. Files that carry pre-existing
 * `<h1..h4>` inline and/or `text-{xs..4xl} + font-*` drift from before the
 * `<Heading>`/`<Text>` primitive landed. For these files the two new rules
 * (preferHeadingPrimitive, preferSemanticTextToken) are downgraded to `warn`
 * so release:preflight passes while Fase C migrates them lote-by-lote.
 *
 * Any NEW file that introduces the pattern still errors. The list is
 * regenerated by `node scripts/list-typography-drift.mjs` — shrinking, never
 * growing.
 *
 * Permanent exceptions documented in ADR-012: auth screens + onboarding
 * composition + shadcn/ui primitives. Everything else is Fase C target.
 */
const typographyMigrationAllowlist = [
  'src/App.tsx',
  'src/components/ConfirmDialog.tsx',
  // DayGridCalendar moved to patterns/ in [1.5.112]
  'src/components/patterns/DayGridCalendar.tsx',
  'src/components/EmptyState.tsx',
  'src/components/ErrorBoundary.tsx',
  // GdprConsent moved to features/legal/ in [1.5.112]
  'src/features/legal/components/GdprConsent.tsx',
  'src/components/GlobalHeader.tsx',
  // OnboardingScaffold moved to features/profile/ in [1.5.112]
  'src/features/profile/components/OnboardingScaffold.tsx',
  // RadioCardGroup moved to components/ui/ in [1.5.112]
  'src/components/ui/RadioCardGroup.tsx',
  'src/components/SectionCard.tsx',
  'src/components/SelectList.tsx',
  'src/components/Sidebar.tsx',
  // FilterRow.tsx deleted [1.5.101] — shim removed, all call-sites on ChipRow
  'src/components/patterns/RecipeCard.tsx',
  // TabNav removed [1.5.99]: text-xs font-bold → text-micro font-semibold normal-case
  'src/components/ui/button.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/tabs.tsx',
  // AICoach.tsx migrated [1.5.101]: text-2xl/xl font-bold → <Heading>, text-lg → text-body-lg
  // ForgotPassword.tsx migrated [1.5.101]: <h2> → <Heading>, text-xs → text-label
  // Login.tsx migrated [1.5.101]: <h1> → <Heading>, text-3xl → text-headline, text-xs → text-label
  // Signup.tsx migrated [1.5.101]: same as Login + password hint/legal note font-label → font-headline
  // DemoSeedCard.tsx migrated [1.5.101]: <h2> → <Heading level="h4">
  // Sprint 31 migrations (S31) [1.5.145]: headings → <Heading>, overlines → <Text>
  // FamilyCard.tsx, VariantPickerSheet.tsx, FoodDetail.tsx, FoodDictionary.tsx — fully migrated
  // PrivacyPolicy.tsx, TermsOfService.tsx — headings done; retain for residual inline labels
  // SettingsAppearance.tsx, SettingsNutrition.tsx, SettingsSystem.tsx — headings done; retain for button label text-sm+bold
  // SettingsProfile.tsx — headings done; retain for button label text-xs+bold + avatar initials span
  // ShoppingList.tsx — headings done; retain for inline counter text-sm+bold
  // More.tsx — fully clean (removed from allowlist)
  'src/features/legal/screens/PrivacyPolicy.tsx',
  'src/features/legal/screens/TermsOfService.tsx',
  'src/features/planner/screens/ShoppingList.tsx',
  'src/features/profile/components/settings/SettingsAppearance.tsx',
  'src/features/profile/components/settings/SettingsNutrition.tsx',
  'src/features/profile/components/settings/SettingsProfile.tsx',
  'src/features/profile/components/settings/SettingsSystem.tsx',
  'src/features/food/components/BarcodeScanner.tsx',
  'src/features/food/components/PortionSelector.tsx',
  'src/features/food/components/PortionSheet.tsx',
  'src/features/home/components/ActivityRow.tsx',
  'src/features/home/components/InsightRow.tsx',
  'src/features/home/components/MealGapSuggestion.tsx',
  'src/features/home/components/NutritionHero.tsx',
  'src/features/home/components/NutritionHeroRing.tsx',
  'src/features/home/components/ProgressPreviewCard.tsx',
  'src/features/home/components/TodaysMeals.tsx',
  'src/features/home/components/WeeklyMiniDash.tsx',
  'src/features/home/screens/Discovery.tsx',
  'src/features/home/screens/Home.tsx',
  'src/features/planner/components/BatchCookingSuggestions.tsx',
  'src/features/planner/screens/Pantry.tsx',
  'src/features/planner/screens/Planner.tsx',
  'src/features/profile/components/KcalBreakdownCard.tsx',
  'src/features/profile/components/Onboarding.tsx',
  'src/features/profile/screens/Profile.tsx',
  'src/features/profile/screens/RialPlus.tsx',
  'src/features/profile/screens/Settings.tsx',
  'src/features/recipes/components/AuthorAttributionCard.tsx',
  'src/features/recipes/components/CollectionsCarousel.tsx',
  'src/features/recipes/components/CookMode.tsx',
  'src/features/recipes/components/CookTimer.tsx',
  'src/features/recipes/components/MiseEnPlaceScreen.tsx',
  'src/features/recipes/components/RecipeNutritionBar.tsx',
  'src/features/recipes/components/RecipeSubstitutionPicker.tsx',
  'src/features/recipes/components/RelatedRecipesCarousel.tsx',
  'src/features/recipes/components/StickyCookCTA.tsx',
  'src/features/recipes/components/TimeTileComposite.tsx',
  'src/features/recipes/components/VideoSection.tsx',
  'src/features/recipes/screens/Cocina.tsx',
  'src/features/recipes/screens/ImportRecipeURL.tsx',
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
  reactHooks.configs['recommended-latest'],
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
      // NOTE: eslint-plugin-react-hooks v4.x is NOT compatible with ESLint v9
      // flat config — importing + registering it crashes ESLint internally
      // (source-code-traverser.js). Use v5+ for flat config support.
      // For now: no react-hooks plugin registration. Keep eslint-disable-next-line
      // comments for react-hooks rules REMOVED from all files to avoid
      // "Definition for rule not found" errors in CI.
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
  // ADR-012 typography-migration allowlist — downgrade to `warn` for files
  // carrying pre-existing <h1..h4> inline or text+font-* drift from before
  // the <Heading>/<Text> primitive landed. New files outside this list still
  // `error`. The list shrinks as Fase C migrates files lote by lote.
  {
    files: typographyMigrationAllowlist,
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
