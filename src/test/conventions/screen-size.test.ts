/**
 * Convention test: no feature, component, context, or pure-logic file > 550 lines.
 *
 * Sprint 32 [1.5.146] — initial 600 LoC limit locked the CreateRecipe gains.
 * Sprint A  [1.5.212] — tightened to 550 after splitting the 5 monsters
 *   (RecipeDetail 708→502, Home 640→416, NutritionDetail 512→186,
 *    Progress 560→325, AppStateContext 644→286). Allowlist intentionally empty.
 * Sprint E  [1.5.217] — scope expanded beyond src/features:
 *   - All .tsx files in: features/, components/, contexts/
 *   - All .ts  files in: features/ (pure logic + handlers + utils)
 *   - Excluded: data/, i18n/, .test.*, .d.ts files
 *   The extra coverage catches large utils (e.g., food-family-resolver) and
 *   large primitives (e.g., RecipeCard) that the previous scope missed.
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = join(import.meta.dirname, '../..');
const LINE_LIMIT = 550;

/**
 * Directories scanned and the file extensions they cover. The order doesn't
 * matter; the union of all roots forms the scanned set. Tests/data/locales
 * are filtered inside `collect()`.
 */
const SCAN_ROOTS: Array<{ rel: string; exts: readonly string[] }> = [
  { rel: 'features',  exts: ['.ts', '.tsx'] },   // logic + UI
  { rel: 'components', exts: ['.tsx'] },          // UI primitives only
  { rel: 'contexts',  exts: ['.ts', '.tsx'] },   // state composition
];

/**
 * Files allowed to exceed LINE_LIMIT.
 * Each entry must cite why it is deferred and its current size.
 *
 * Cleared in [1.5.212] — Sprint A splits brought RecipeDetail (708→502) and
 * Home (640→416) under the limit. Keep the allowlist empty so any new file
 * over 550 LoC fails CI immediately and forces an explicit decision.
 */
const ALLOWLIST: Record<string, { reason: string; approxLines: number }> = {};

/**
 * Explicit regression guards for the 5 monsters split in Sprint A [1.5.212].
 * These run as separate `it()` blocks so a regression on any single screen
 * surfaces with a targeted error message.
 */
const SPRINT_A_GUARDS: Array<{ rel: string; max: number; reason: string }> = [
  { rel: 'recipes/screens/RecipeDetail.tsx',     max: 550, reason: 'split via useRecipeCalculations + RecipeCreatorAttribution + RecipeCommunityStats' },
  { rel: 'home/screens/Home.tsx',                max: 450, reason: 'split via useHomeData + GuidedSetupSection' },
  { rel: 'home/screens/NutritionDetail.tsx',     max: 250, reason: 'split via 6 tab components in components/nutrition-detail/' },
  { rel: 'wellness/screens/Progress.tsx',        max: 400, reason: 'split via useProgressData + useReflectionForm + BienestarCard + TopMealsCard' },
];

/**
 * Recursively collect files matching one of `exts`, skipping data/, i18n/,
 * and test/stories files. Returns absolute paths.
 */
function collect(dir: string, exts: readonly string[], results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry !== 'data' && entry !== 'i18n') collect(full, exts, results);
    } else if (
      exts.some(ext => entry.endsWith(ext)) &&
      !entry.endsWith('.test.ts') &&
      !entry.endsWith('.test.tsx') &&
      !entry.endsWith('.stories.tsx') &&
      !entry.endsWith('.d.ts')
    ) {
      results.push(full);
    }
  }
  return results;
}

describe('screen-size convention', () => {
  const files: string[] = [];
  for (const { rel, exts } of SCAN_ROOTS) {
    files.push(...collect(join(SRC, rel), exts));
  }

  it(`no file exceeds ${LINE_LIMIT} lines unless explicitly allowlisted`, () => {
    const violations: string[] = [];

    for (const file of files) {
      const rel = relative(SRC, file).replace(/\\/g, '/');
      // Allowlist keys are relative to features/ for backward compat
      const allowlistKey = rel.startsWith('features/') ? rel.slice('features/'.length) : rel;
      if (ALLOWLIST[allowlistKey]) continue;

      const lines = readFileSync(file, 'utf8').split('\n').length;
      if (lines > LINE_LIMIT) {
        violations.push(`${rel} — ${lines} lines (limit ${LINE_LIMIT})`);
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Files exceed ${LINE_LIMIT}-line limit. Split or add to allowlist with justification:\n` +
        violations.map(v => `  • ${v}`).join('\n'),
      );
    }
  });

  it('allowlisted files still exist (stale allowlist guard)', () => {
    for (const rel of Object.keys(ALLOWLIST)) {
      const full = join(SRC, 'features', rel);
      expect(statSync(full, { throwIfNoEntry: false })?.isFile(), `Allowlisted file not found: ${rel}`).toBe(true);
    }
  });

  it('CreateRecipe.tsx is under 550 lines (regression guard)', () => {
    const file = join(SRC, 'features', 'recipes/screens/CreateRecipe.tsx');
    const lines = readFileSync(file, 'utf8').split('\n').length;
    expect(lines, `CreateRecipe.tsx grew back to ${lines} lines — split subcomponents further`).toBeLessThanOrEqual(LINE_LIMIT);
  });

  it('AddMeal.tsx is under 550 lines (regression guard)', () => {
    const file = join(SRC, 'features', 'food/screens/AddMeal.tsx');
    const lines = readFileSync(file, 'utf8').split('\n').length;
    expect(lines, `AddMeal.tsx grew back to ${lines} lines — split subcomponents further`).toBeLessThanOrEqual(LINE_LIMIT);
  });

  // Sprint A [1.5.212] regression guards — per-file ceilings tighter than
  // LINE_LIMIT so the splits cannot silently regress halfway.
  it.each(SPRINT_A_GUARDS)(
    '$rel is under $max lines (Sprint A guard: $reason)',
    ({ rel, max }) => {
      const file = join(SRC, 'features', rel);
      const lines = readFileSync(file, 'utf8').split('\n').length;
      expect(lines, `${rel} grew to ${lines} lines (max ${max}) — Sprint A split must hold`).toBeLessThanOrEqual(max);
    },
  );
});
