/**
 * Convention test: no new reads of `userProfile?.mode` or `userProfile.mode`
 * outside the explicit migration allowlist.
 *
 * Sprint E [1.5.219] Phase 6 — Frente 4 hardening.
 *
 * Background:
 *   `UserProfile.mode: 'simple' | 'advanced'` is @deprecated since [1.5.218].
 *   The replacement is `UserPreferences.sectionTiers` read via
 *   `useAppState().preferences`. The migration bridge in AppStateContext reads
 *   `userProfile?.mode` once to seed the new schema and then never touches it
 *   again.
 *
 * Rule:
 *   No file outside the allowlist may contain the text pattern
 *   `userProfile?.mode` or `userProfile.mode`. New reads of the deprecated
 *   field are banned — new code MUST use `useAppState().preferences` instead.
 *
 * Allowlist maintenance:
 *   Each entry below should be removed as the corresponding consumer migrates
 *   to the preferences schema. The goal is to reach an empty allowlist within
 *   2-3 sprints.
 *
 * Exclusions:
 *   - *.test.* files (tests may reference the deprecated field in fixtures)
 *   - src/types/user.ts (the field declaration + @deprecated tag itself)
 *   - Comments and JSDoc strings are not excluded — the grep is plain text.
 *     Keep @deprecated comments pointing here, not duplicating the field name.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = join(import.meta.dirname, '../..');

// ─── Allowlist ────────────────────────────────────────────────────────────────

/**
 * Files still permitted to reference `userProfile?.mode` or `userProfile.mode`.
 * Paths are relative to `src/`. Prune one entry per sprint as each consumer
 * migrates. Reaching an empty allowlist is the end state.
 *
 * Current allowlist (Sprint E [1.5.219]):
 *   - AppStateContext.tsx: passes userProfile?.mode as the profileMode arg to
 *     the migration hook (the one legitimate bridge between old and new schema)
 *   - usePreferencesState.ts: the migration function itself (comment references)
 */
const ALLOWLIST = new Set([
  'contexts/AppStateContext.tsx',
  'contexts/state/usePreferencesState.ts',
]);

// ─── Patterns to detect ───────────────────────────────────────────────────────

/** Matches `userProfile?.mode` and `userProfile.mode` (the field access on the profile object). */
const DEPRECATED_PATTERNS = [
  /userProfile\?\.mode\b/,
  /userProfile\.mode\b/,
];

// ─── Scanner ──────────────────────────────────────────────────────────────────

function collectSourceFiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      collectSourceFiles(full, results);
    } else if ((entry.endsWith('.ts') || entry.endsWith('.tsx')) && !entry.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

// ─── Test ─────────────────────────────────────────────────────────────────────

describe('preferences-deprecation convention', () => {
  it('no file outside the allowlist reads userProfile.mode', () => {
    const violations: string[] = [];
    const files = collectSourceFiles(SRC);

    for (const file of files) {
      const rel = relative(SRC, file).replace(/\\/g, '/');

      // Skip test files — they may use deprecated fields in fixtures.
      if (rel.includes('.test.') || rel.includes('/test/') || rel.startsWith('test/')) continue;
      // Skip the field declaration itself.
      if (rel === 'types/user.ts') continue;
      // Skip allowlisted files.
      if (ALLOWLIST.has(rel)) continue;

      const content = readFileSync(file, 'utf-8');
      for (const pattern of DEPRECATED_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${rel}: contains deprecated userProfile.mode access — use useAppState().preferences instead`);
          break; // one violation per file is enough
        }
      }
    }

    expect(violations, violations.join('\n')).toHaveLength(0);
  });

  it('allowlist has no stale entries (all listed files actually contain the pattern)', () => {
    // This guard prevents the allowlist from growing unnoticed with phantom entries.
    const stale: string[] = [];
    for (const relPath of ALLOWLIST) {
      const file = join(SRC, relPath);
      let content: string;
      try {
        content = readFileSync(file, 'utf-8');
      } catch {
        stale.push(`${relPath}: file not found`);
        continue;
      }
      const found = DEPRECATED_PATTERNS.some(p => p.test(content));
      if (!found) {
        stale.push(`${relPath}: no deprecated pattern found — remove from allowlist`);
      }
    }
    expect(stale, `Stale allowlist entries:\n${stale.join('\n')}`).toHaveLength(0);
  });
});
