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
  'src/components/patterns/RecipeCard.tsx',
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
  'src/features/food/components/MealSlotSelector.tsx',
  'src/features/food/components/PortionSelector.tsx',
  'src/features/food/screens/AddMeal.tsx',
  'src/features/food/screens/FoodDictionary.tsx',
  'src/features/home/components/ActivityRow.tsx',
  'src/features/home/components/InsightRow.tsx',
  'src/features/home/components/NextMealSuggestion.tsx',
  'src/features/home/components/NutritionHero.tsx',
  'src/features/home/components/ProgressPreviewCard.tsx',
  'src/features/home/components/QuickActions.tsx',
  'src/features/home/components/RealScoreBadge.tsx',
  'src/features/home/components/TodaysMeals.tsx',
  'src/features/home/components/WeeklyMiniDash.tsx',
  'src/features/home/components/WeightQuickLog.tsx',
  'src/features/home/screens/Discover.tsx',
  'src/features/home/screens/Discovery.tsx',
  'src/features/home/screens/Home.tsx',
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
  'src/features/recipes/components/CookMode.tsx',
  'src/features/recipes/components/RecipeNutritionBar.tsx',
  'src/features/recipes/components/RecipeSubstitutionPicker.tsx',
  'src/features/recipes/screens/CreateRecipe.tsx',
  'src/features/recipes/screens/ImportRecipeURL.tsx',
  'src/features/recipes/screens/RecipeDetail.tsx',
  'src/features/social/components/AvatarRing.tsx',
  'src/features/social/components/PostCard.tsx',
  'src/features/social/components/ProgressPostCard.tsx',
  'src/features/social/components/PublishRecipeSheet.tsx',
  'src/features/social/components/RecipePicker.tsx',
  'src/features/social/screens/ChallengeDetail.tsx',
  'src/features/social/screens/Challenges.tsx',
  'src/features/social/screens/Community.tsx',
  'src/features/social/screens/Creadores.tsx',
  'src/features/social/screens/CreatePost.tsx',
  'src/features/social/screens/CreateStory.tsx',
  'src/features/social/screens/CreatorDashboard.tsx',
  'src/features/social/screens/CreatorProfile.tsx',
  'src/features/social/screens/CreatorVerification.tsx',
  'src/features/social/screens/Notifications.tsx',
  'src/features/social/screens/PostDetail.tsx',
  'src/features/social/screens/StoryViewer.tsx',
  'src/features/wellness/components/BodyCalendar.tsx',
  'src/features/wellness/components/BodySnapshotCard.tsx',
  'src/features/wellness/components/BodyTimeline.tsx',
  'src/features/wellness/components/DataSourceCaption.tsx',
  'src/features/wellness/components/LatestReflectionCard.tsx',
  'src/features/wellness/components/LogSnapshotModal.tsx',
  'src/features/wellness/components/RealFeelInline.tsx',
  'src/features/wellness/components/RitmoSection.tsx',
  'src/features/wellness/components/SnapshotDetailModal.tsx',
  'src/features/wellness/screens/DailyCheckIn.tsx',
  'src/features/wellness/screens/FastingTimer.tsx',
  'src/features/wellness/screens/Progress.tsx',
  'src/features/wellness/screens/RealFeelDiary.tsx',
  'src/features/wellness/screens/WeeklyCheckIn.tsx',
  'src/features/wellness/screens/WeeklyReview.tsx',
];

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', '.claude/'] },
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
