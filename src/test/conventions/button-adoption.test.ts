/**
 * Button primitive adoption — Sprint 30 baseline.
 *
 * The shadcn-derived `<Button>` (`src/components/ui/button.tsx`) is the only
 * sanctioned way to render a primary / secondary / brand / outline / ghost
 * CTA. Raw `<button className="bg-primary ...">` bypasses the variant system
 * and breaks consistency: every brand tweak (focus ring, hover, disabled
 * opacity, font weight) would have to be replicated in N call sites instead
 * of edited in one place.
 *
 * This test counts raw `<button>` with `bg-primary | bg-brand-secondary |
 * bg-secondary` inside `src/features/` and locks the count to the post-S30
 * baseline (41 across 32 files — see allowlist below). Spec:
 *
 *   - A file's count may DECREASE → please also lower its allowlist entry
 *     (or remove the entry if it reaches 0). Keeps the baseline honest.
 *   - A file's count may NOT INCREASE beyond its allowlist entry.
 *   - A new file is implicitly capped at 0 (must be added to allowlist
 *     with documented reason if a raw branded button is justified).
 *
 * Migration target: every entry below should hit 0 over the next few sprints.
 *
 * Static file-walk pattern — mirrors `safe-area.test.ts`, `bottom-sheet.test.ts`.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FEATURES_DIR = path.resolve(ROOT, 'src/features');

/**
 * Allowlist of files that currently render raw `<button>` with branded
 * background. Generated from `node scripts/count-raw-buttons.mjs` at the
 * end of Sprint 30. Each entry MUST have a justification — either
 * "Q1 2026 baseline" (= migrate later) or a permanent reason (e.g. inline
 * compact editor that can't fit HIG-44 sizing).
 */
const RAW_BUTTON_ALLOWLIST: Record<string, { count: number; reason: string }> = {
  // High-density screens — split into subcomponents in dedicated sprints.
  'home/screens/Home.tsx': { count: 3, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'recipes/components/CookMode.tsx': { count: 3, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'recipes/components/detail/RecipeHero.tsx': { count: 3, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'food/screens/AddMeal.tsx': { count: 2, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'recipes/components/detail/RecipeServingsControls.tsx': { count: 2, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'recipes/screens/ImportRecipeURL.tsx': { count: 2, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  // Single-button hotspots.
  'ai/screens/AICoach.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'dev/components/DemoSeedCard.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'home/components/RealScoreBadge.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  // Inline edit-confirm circle — w-8 h-8, smaller than HIG-44 by design (sits
  // beside a tiny inline number input). Permanent allowlist entry.
  'home/components/TodaysMeals.tsx': { count: 1, reason: 'inline edit-confirm circle (w-8 h-8) — too small for HIG-44 Button (permanent)' },
  'legal/components/GdprConsent.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'planner/screens/Pantry.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'planner/screens/Planner.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'planner/screens/ShoppingList.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'profile/components/Onboarding.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'profile/components/settings/SettingsProfile.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'profile/components/settings/SettingsSystem.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'profile/screens/RialPlus.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'recipes/components/MiseEnPlaceScreen.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'recipes/components/StickyCookCTA.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'recipes/screens/Cocina.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'social/components/PostCard.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'social/components/PublishRecipeSheet.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'social/screens/CreatePost.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'social/screens/CreateStory.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'social/screens/CreatorVerification.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'social/screens/Discover.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'social/screens/PostDetail.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'wellness/components/BeforeAfterCompare.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'wellness/components/InlineReflection.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'wellness/components/RealFeelInline.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
  'wellness/screens/FastingTimer.tsx': { count: 1, reason: 'Q1 2026 baseline — migrate in subsequent sprint' },
};

const RAW_BUTTON_REGEX = /<button[^>]*\bbg-(primary|brand-secondary|secondary)\b/g;

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && /\.(tsx)$/.test(entry.name) && !entry.name.endsWith('.test.tsx')) {
      yield full;
    }
  }
}

describe('Button primitive adoption — raw branded button cap', () => {
  it('caps every file at-or-below its allowlisted raw-button count (no new drift)', () => {
    const offenders: string[] = [];

    for (const file of walk(FEATURES_DIR)) {
      const src = fs.readFileSync(file, 'utf8');
      const matches = src.match(RAW_BUTTON_REGEX);
      const count = matches ? matches.length : 0;
      if (count === 0) continue;

      const relative = path.relative(FEATURES_DIR, file).split(path.sep).join('/');
      const allowed = RAW_BUTTON_ALLOWLIST[relative]?.count ?? 0;

      if (count > allowed) {
        offenders.push(`${relative}: ${count} raw branded <button> (allowlisted: ${allowed})`);
      }
    }

    if (offenders.length > 0) {
      const guidance = [
        '',
        'Raw branded `<button className="bg-primary|secondary|brand-secondary ...">`',
        'detected. Migrate to `<Button variant="default|secondary|brand">` from',
        '`@/components/ui/button` — that primitive owns the focus ring, hover,',
        'disabled state, and font tokens consistently.',
        '',
        'If the raw button is intentional (e.g. non-HIG sizing for an inline',
        'editor), add a documented entry to RAW_BUTTON_ALLOWLIST in',
        'src/test/conventions/button-adoption.test.ts.',
        '',
        'Offenders:',
        ...offenders.map(o => `  - ${o}`),
      ].join('\n');
      throw new Error(guidance);
    }
  });

  it('Auth screens use the Button primitive for primary CTAs', () => {
    const authDir = path.resolve(FEATURES_DIR, 'auth/screens');
    for (const file of ['Login.tsx', 'Signup.tsx', 'ForgotPassword.tsx']) {
      const src = fs.readFileSync(path.join(authDir, file), 'utf8');
      expect(src, `${file} missing Button import`).toMatch(
        /from\s+['"]@\/components\/ui\/button['"]/,
      );
      expect(src, `${file} should use <Button> for the primary CTA`).toMatch(
        /<Button[^>]*type=["']submit["']/,
      );
    }
  });

  it('keeps the allowlist honest — entries must match current counts (lower as you migrate)', () => {
    const stale: string[] = [];
    for (const [relative, entry] of Object.entries(RAW_BUTTON_ALLOWLIST)) {
      const full = path.join(FEATURES_DIR, relative);
      if (!fs.existsSync(full)) {
        stale.push(`${relative}: file no longer exists — remove from allowlist`);
        continue;
      }
      const src = fs.readFileSync(full, 'utf8');
      const count = (src.match(RAW_BUTTON_REGEX) ?? []).length;
      if (count !== entry.count) {
        stale.push(`${relative}: allowlist says count=${entry.count} but file now has ${count} (lower the entry, or remove if 0)`);
      }
    }
    if (stale.length > 0) {
      throw new Error(
        ['Allowlist drift — please update entries to reflect current counts:', ...stale.map(s => `  - ${s}`)].join('\n'),
      );
    }
  });
});
