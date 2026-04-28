/**
 * Convention test: no feature screen or component > 600 lines.
 *
 * Sprint 32 [1.5.146] — locks the refactor gains so CreateRecipe (and similar
 * files) cannot silently grow back. Excludes pure-data files and i18n locales.
 *
 * Allowlist: pre-existing files above 600 lines that are deferred splits
 * (documented in state.md Next sprint candidates). Add new entries only with
 * an explicit ADR or plan reference.
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = join(import.meta.dirname, '../../features');
const LINE_LIMIT = 600;

/**
 * Files allowed to exceed LINE_LIMIT.
 * Each entry must cite why it is deferred and its current size.
 */
const ALLOWLIST: Record<string, { reason: string; approxLines: number }> = {
  // BarcodeScanner — fullscreen camera + ML flow; requires camera lifecycle split
  'food/components/BarcodeScanner.tsx': { reason: 'deferred split — camera lifecycle', approxLines: 823 },
  // AddMeal — tightly coupled to navigation; requires dedicated planning sprint
  'food/screens/AddMeal.tsx': { reason: 'deferred split — navigation coupling', approxLines: 714 },
  // RecipeDetail — composer of 7 tab components; 692 lines is acceptable
  'recipes/screens/RecipeDetail.tsx': { reason: 'composer only; 7 extracted components', approxLines: 692 },
};

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

  it('CreateRecipe.tsx is under 600 lines (regression guard)', () => {
    const file = join(ROOT, 'recipes/screens/CreateRecipe.tsx');
    const lines = readFileSync(file, 'utf8').split('\n').length;
    expect(lines, `CreateRecipe.tsx grew back to ${lines} lines — split subcomponents further`).toBeLessThanOrEqual(LINE_LIMIT);
  });
});
