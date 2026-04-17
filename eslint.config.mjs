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

const designSystemRules = [
  noArbitraryTextSize,
  noArbitraryTextSizeTpl,
  noSectionCardDup,
  noSectionCardDupTpl,
  noDarkPrefix,
  noDarkPrefixTpl,
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
  'src/App.tsx',
  'src/components/CreateModal.tsx',
  'src/components/DayGridCalendar.tsx',
  'src/components/GlobalHeader.tsx',
  'src/components/patterns/FilterRow.tsx',
  // RecipeCard migrated 2026-04-17: hero badges → text-micro, tap-targets 28→36 px, grid title → text-sm.
  'src/components/ui/badge.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/textarea.tsx',
  'src/features/ai/screens/AICoach.tsx',
  'src/features/auth/screens/Login.tsx',
  'src/features/auth/screens/Signup.tsx',
  'src/features/dev/components/DemoSeedCard.tsx',
  'src/features/food/components/BarcodeScanner.tsx',
  'src/features/food/components/PortionSelector.tsx',
  'src/features/food/screens/AddMeal.tsx',
  'src/features/food/screens/FoodDictionary.tsx',
  // Hoy tab cleaned in Wave 1 of tab audit (2026-04-18). TodaysMeals retains
  // two intentional SectionCard-shape occurrences (list container + meal item)
  // that don't fit the primitive; remove when we add a <ListCard> variant.
  'src/features/home/components/TodaysMeals.tsx',
  // Discovery migrated 2026-04-17: PageShell + text-micro for CollectionBanner count.
  'src/features/home/screens/More.tsx',
  'src/features/legal/screens/PrivacyPolicy.tsx',
  'src/features/legal/screens/TermsOfService.tsx',
  'src/features/planner/components/BatchCookingSuggestions.tsx',
  'src/features/planner/screens/Pantry.tsx',
  'src/features/planner/screens/Planner.tsx',
  'src/features/planner/screens/ShoppingList.tsx',
  'src/features/profile/components/Onboarding.tsx',
  'src/features/profile/components/settings/SettingsAppearance.tsx',
  'src/features/profile/components/settings/SettingsNutrition.tsx',
  'src/features/profile/components/settings/SettingsProfile.tsx',
  'src/features/profile/components/settings/SettingsSystem.tsx',
  'src/features/profile/screens/Profile.tsx',
  'src/features/profile/screens/RialPlus.tsx',
  'src/features/profile/screens/Settings.tsx',
  // Cocina tab cleaned in Wave 2 of tab audit (2026-04-18). All recipes/*
  // screens and components migrated to tokens + SectionCard + HIG taps.
  // Explora tab cleaned in Wave 3 of tab audit (2026-04-18). Files below
  // retain only SectionCard-shape drift (no text-[Npx], no dark:). Q16
  // codemod will migrate them to <SectionCard>.
  'src/features/social/screens/ChallengeDetail.tsx',
  'src/features/social/screens/Challenges.tsx',
  'src/features/social/screens/CreatorProfile.tsx',
  'src/features/social/screens/CreatorVerification.tsx',
  'src/features/social/screens/Discover.tsx',
  'src/features/social/screens/PostDetail.tsx',
  'src/features/wellness/components/BodyCalendar.tsx',
  'src/features/wellness/components/BodySnapshotCard.tsx',
  'src/features/wellness/components/BodyTimeline.tsx',
  'src/features/wellness/components/ConsistencyCalendar.tsx',
  'src/features/wellness/components/DataSourceCaption.tsx',
  'src/features/wellness/components/InlineReflection.tsx',
  'src/features/wellness/components/LatestReflectionCard.tsx',
  'src/features/wellness/components/LogSnapshotModal.tsx',
  'src/features/wellness/components/RealFeelInline.tsx',
  'src/features/wellness/components/RitmoSection.tsx',
  'src/features/wellness/components/SnapshotDetailModal.tsx',
  'src/features/wellness/components/WeeklyScoreCard.tsx',
  'src/features/wellness/components/WeightTrendCard.tsx',
  'src/features/wellness/screens/DailyCheckIn.tsx',
  'src/features/wellness/screens/FastingTimer.tsx',
  'src/features/wellness/screens/Progress.tsx',
  'src/features/wellness/screens/RealFeelDiary.tsx',
  'src/features/wellness/screens/WeeklyCheckIn.tsx',
  // WeeklyReview.tsx removed upstream — reflection form absorbed into Progress.tsx InlineReflection component.
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
  // The primitive that intentionally owns the banned shape.
  {
    files: ['src/components/SectionCard.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        noArbitraryTextSize,
        noArbitraryTextSizeTpl,
        noDarkPrefix,
        noDarkPrefixTpl,
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
);
