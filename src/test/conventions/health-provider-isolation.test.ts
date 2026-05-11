/**
 * Convention test: native health plugin packages may only be imported inside
 * `src/lib/health/providers/`.
 *
 * Sprint E [1.5.219] Phase 6 — Frente 4 hardening.
 *
 * Background:
 *   The health provider pattern (ADR-017) isolates all native plugin calls
 *   behind the `HealthProvider` interface in `src/lib/health/providers/`.
 *   Feature code must only interact with the registry (`src/lib/health/registry.ts`)
 *   — never with the plugin packages directly.
 *
 *   If a plugin import escapes into feature code:
 *     1. The bundle breaks in web builds (plugin not installed).
 *     2. The abstraction layer collapses (plugin migrations become expensive).
 *     3. The bundler cannot tree-shake provider stubs.
 *
 * Rule:
 *   Any source file outside `src/lib/health/providers/` that contains a
 *   string matching one of the BANNED_PATTERNS fails CI immediately.
 *
 * Note: The stub provider files in `src/lib/health/providers/` contain
 * these package names only in comment strings (not real imports). The test
 * checks for the import statement pattern, not bare package name occurrence,
 * so comment-only references in providers are not flagged.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC = join(import.meta.dirname, '../..');

// ─── Banned import patterns ───────────────────────────────────────────────────

/**
 * Match an actual import statement (static or dynamic) of the plugin packages.
 * Comments like `// await import('@perfood/capacitor-healthkit')` are
 * intentionally excluded by requiring `import(` or `from '` before the package.
 */
const BANNED_PATTERNS: RegExp[] = [
  /\bfrom\s+['"]@perfood\/capacitor-healthkit['"]/,
  /\bimport\s*\(\s*['"]\s*@perfood\/capacitor-healthkit\s*['"]/,
  /\bfrom\s+['"]capacitor-health-connect['"]/,
  /\bimport\s*\(\s*['"]\s*capacitor-health-connect\s*['"]/,
  /\bfrom\s+['"]@capacitor-community\/health-kit['"]/,
  /\bimport\s*\(\s*['"]\s*@capacitor-community\/health-kit\s*['"]/,
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

describe('health-provider-isolation convention', () => {
  it('no file outside src/lib/health/providers/ imports native health plugin packages', () => {
    const violations: string[] = [];
    const files = collectSourceFiles(SRC);

    for (const file of files) {
      const normalized = file.replace(/\\/g, '/');

      // Only files OUTSIDE the providers directory are checked.
      if (normalized.includes('/lib/health/providers/')) continue;

      // Skip test files — they may reference package names in mocks.
      const rel = relative(SRC, file).replace(/\\/g, '/');
      if (rel.includes('.test.') || rel.startsWith('test/')) continue;

      const content = readFileSync(file, 'utf-8');
      for (const pattern of BANNED_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(
            `${rel}: imports a native health plugin directly.\n` +
            `  Use src/lib/health/registry.ts instead.\n` +
            `  Pattern: ${pattern}`,
          );
          break;
        }
      }
    }

    expect(violations, violations.join('\n\n')).toHaveLength(0);
  });

  it('provider directory exists and contains at least the three expected stubs', () => {
    // Guards against accidental deletion of the providers directory.
    const providerFiles = readdirSync(join(SRC, 'lib/health/providers'))
      .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));

    const requiredProviders = ['manual.ts', 'apple-health.ts', 'google-fit.ts'];
    for (const required of requiredProviders) {
      expect(providerFiles, `Missing provider file: ${required}`).toContain(required);
    }
  });
});
