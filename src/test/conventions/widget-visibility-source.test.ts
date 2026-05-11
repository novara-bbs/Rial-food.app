/**
 * Convention test: no new code introduces raw 'simple' / 'advanced' string
 * literals as tier values outside the migration/type allowlist.
 *
 * Sprint E [1.5.219] Phase 6 — Frente 4 hardening.
 *
 * Background:
 *   Before Sprint E, tier values were scattered as raw strings throughout
 *   feature code. The new preferences schema names them as the `DetailTier`
 *   union (`'simple' | 'standard' | 'advanced'`) and the `DETAIL_TIERS`
 *   constant. Widget visibility must go through `getVisibleWidgets()` and
 *   `getTierForSection()` — never through ad-hoc string comparisons.
 *
 * Rule:
 *   A file outside the allowlist may not contain a tier literal that is used
 *   as a value comparison (e.g. `=== 'simple'`, `=== 'advanced'`,
 *   `? 'simple' :`, `? 'advanced' :`, `mode: 'simple'`, `mode: 'advanced'`).
 *   Type definitions (e.g. `: 'simple' | 'advanced'`) and i18n translations
 *   are excluded via per-file allowlist entries.
 *
 * Allowlist maintenance:
 *   Each entry represents a legacy consumer that has not yet been migrated.
 *   Prune entries as each component migrates to `DetailTier`. Target: empty.
 *
 * Note on detection:
 *   The regex intentionally catches value-usage patterns (=== / ? / :/ ,
 *   assignment, object property) while excluding TypeScript type annotations
 *   (`: 'simple' | 'advanced'`) which are legitimate for backward-compat props
 *   during the migration window. This is imperfect but Good Enough™ —
 *   reviewing violations manually is fast for this codebase size.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = join(import.meta.dirname, '../..');

// ─── Allowlist ────────────────────────────────────────────────────────────────

/**
 * Files allowed to contain tier literals as values. Each entry must cite
 * the reason and be pruned when the migration is complete.
 *
 * Sprint E [1.5.219] baseline:
 *   - types/preferences.ts: type declarations (DetailTier = 'simple' | ...)
 *   - lib/widget-visibility.ts: DEFAULT_TIER constant + WIDGET_MATRIX
 *   - contexts/state/usePreferencesState.ts: migration function
 *   - i18n locale files: translation string values
 *   - NutritionHero.tsx: legacy mode prop — migrates in next sprint
 *   - NutritionHeroRing.tsx: legacy mode prop — migrates in next sprint
 *   - demo-seed.ts: seed data with mode: 'simple' — migrates with NutritionHero
 *   - Home.tsx: derives isSimpleMode from tier ('simple' literal in comparison)
 *   - HomeQuickStats.tsx: tier === 'simple' early return (uses DetailTier)
 *   - WidgetVisibilityPanel.tsx: renders tier labels (reads from DETAIL_TIERS)
 *   - SettingsProfile.tsx: tier selector
 */
const ALLOWLIST = new Set([
  'types/preferences.ts',
  'types/user.ts',              // @deprecated mode field declaration
  'lib/widget-visibility.ts',
  'contexts/state/usePreferencesState.ts',
  // i18n locale files contain translation strings
  'i18n/locales/es/preferences.ts',
  'i18n/locales/en/preferences.ts',
  'i18n/locales/es/settings.ts',
  'i18n/locales/en/settings.ts',
  // Legacy consumers (migrate in future sprints):
  'features/home/components/NutritionHero.tsx',
  'features/home/components/NutritionHeroRing.tsx',
  'features/dev/data/demo-seed.ts',
  // New preference-aware components (use DETAIL_TIERS const, not raw literals):
  'features/home/screens/Home.tsx',
  'features/home/components/HomeQuickStats.tsx',
  'features/profile/components/settings/WidgetVisibilityPanel.tsx',
  'features/profile/components/settings/SettingsProfile.tsx',
]);

// ─── Patterns to detect ───────────────────────────────────────────────────────

/**
 * Value-usage patterns for 'simple' and 'advanced'.
 * Matches: === 'simple', === 'advanced', ? 'simple' :, , 'advanced',
 *          mode: 'simple', setTier(..., 'simple'), etc.
 *
 * Does NOT match:
 *   - `: 'simple' | 'advanced'` TypeScript type annotations (starts with colon-space)
 *   - `// comment` lines
 */
const VALUE_PATTERNS: RegExp[] = [
  /===\s*['"]simple['"]/,
  /===\s*['"]advanced['"]/,
  /['"]simple['"]\s*===/,
  /['"]advanced['"]\s*===/,
  /\?\s*['"]simple['"]\s*:/,
  /\?\s*['"]advanced['"]\s*:/,
  /:\s*['"]simple['"][,\s}]/,  // object property value: { mode: 'simple' }
  /:\s*['"]advanced['"][,\s}]/, // object property value: { mode: 'advanced' }
];

// ─── Scanner ──────────────────────────────────────────────────────────────────

function collectSourceFiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Skip i18n directory except for specific files in allowlist — too broad
      collectSourceFiles(full, results);
    } else if ((entry.endsWith('.ts') || entry.endsWith('.tsx')) && !entry.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

function isLineAComment(line: string): boolean {
  return /^\s*(\/\/|\/\*|\*)/.test(line);
}

// ─── Test ─────────────────────────────────────────────────────────────────────

describe('widget-visibility-source convention', () => {
  it('no file outside the allowlist uses raw tier string literals as values', () => {
    const violations: string[] = [];
    const files = collectSourceFiles(SRC);

    for (const file of files) {
      const rel = relative(SRC, file).replace(/\\/g, '/');

      // Skip test files — they may use tier literals in fixtures/assertions.
      if (rel.includes('.test.') || rel.startsWith('test/')) continue;
      // Skip allowlisted files.
      if (ALLOWLIST.has(rel)) continue;

      const lines = readFileSync(file, 'utf-8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comment-only lines.
        if (isLineAComment(line)) continue;
        for (const pattern of VALUE_PATTERNS) {
          if (pattern.test(line)) {
            violations.push(
              `${rel}:${i + 1}: raw tier literal — use DetailTier + DETAIL_TIERS.\n  → ${line.trim()}`,
            );
            break;
          }
        }
      }
    }

    expect(violations, violations.join('\n')).toHaveLength(0);
  });

  it('allowlist has no stale entries (all listed files exist)', () => {
    const missing: string[] = [];
    for (const relPath of ALLOWLIST) {
      const file = join(SRC, relPath);
      try {
        statSync(file);
      } catch {
        missing.push(`${relPath}: file not found — remove from allowlist`);
      }
    }
    expect(missing, missing.join('\n')).toHaveLength(0);
  });
});
