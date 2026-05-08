/**
 * Convention test: no feature screen or component > 550 lines.
 *
 * Sprint 32 [1.5.146] — initial 600 LoC limit locked the CreateRecipe gains.
 * Sprint A [1.5.212] — tightened to 550 after splitting the 5 remaining
 * monsters (RecipeDetail 708→502, Home 640→416, NutritionDetail 512→186,
 * Progress 560→325, AppStateContext 644→286). Allowlist intentionally empty
 * — any new file > 550 LoC fails CI immediately and forces an ADR or split.
 *
 * Excludes pure-data files and i18n locales.
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = join(import.meta.dirname, '../../features');
const LINE_LIMIT = 550;

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

/** Recursively collect .tsx files, skipping data/ and i18n/ dirs. */
function collectTsx(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry !== 'data' && entry !== 'i18n') collectTsx(full, results);
    } else if (entry.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

describe('screen-size convention', () => {
  const files = collectTsx(ROOT);

  it('no feature file exceeds 600 lines unless explicitly allowlisted', () => {
    const violations: string[] = [];

    for (const file of files) {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (ALLOWLIST[rel]) continue;

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
      const full = join(ROOT, rel);
      expect(statSync(full, { throwIfNoEntry: false })?.isFile(), `Allowlisted file not found: ${rel}`).toBe(true);
    }
  });

  it('CreateRecipe.tsx is under 550 lines (regression guard)', () => {
    const file = join(ROOT, 'recipes/screens/CreateRecipe.tsx');
    const lines = readFileSync(file, 'utf8').split('\n').length;
    expect(lines, `CreateRecipe.tsx grew back to ${lines} lines — split subcomponents further`).toBeLessThanOrEqual(LINE_LIMIT);
  });

  it('AddMeal.tsx is under 550 lines (regression guard)', () => {
    const file = join(ROOT, 'food/screens/AddMeal.tsx');
    const lines = readFileSync(file, 'utf8').split('\n').length;
    expect(lines, `AddMeal.tsx grew back to ${lines} lines — split subcomponents further`).toBeLessThanOrEqual(LINE_LIMIT);
  });

  // Sprint A [1.5.212] regression guards — per-file ceilings tighter than
  // LINE_LIMIT so the splits cannot silently regress halfway.
  it.each(SPRINT_A_GUARDS)(
    '$rel is under $max lines (Sprint A guard: $reason)',
    ({ rel, max }) => {
      const file = join(ROOT, rel);
      const lines = readFileSync(file, 'utf8').split('\n').length;
      expect(lines, `${rel} grew to ${lines} lines (max ${max}) — Sprint A split must hold`).toBeLessThanOrEqual(max);
    },
  );
});
