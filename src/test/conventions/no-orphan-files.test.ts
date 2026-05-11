/**
 * Convention test: no orphan files under src/.
 *
 * Sprint E [1.5.217] — Frente 4b. Builds an import graph over src/ and
 * verifies every .ts/.tsx file is reachable from an entry point. Orphans
 * are files imported by nobody — either dead code or wired with a typo.
 *
 * Decision (owner): empty allowlist from day 1. Pre-existing orphans must
 * be eliminated in this same sprint. Any new orphan in a future PR fails
 * CI immediately and forces an explicit decision (delete or document as
 * entry point).
 *
 * Detection scope: src/**\/*.{ts,tsx} excluding .d.ts files.
 * Entry points (legitimately not imported by other src/ files):
 *   - main.tsx                        — app bootstrap
 *   - *.test.ts(x)                     — test files
 *   - *.stories.ts(x)                  — Storybook (future)
 *   - test/setup*.ts                  — Vitest setup
 *   - types/index.ts                  — barrel autorizado (ADR-NO-BARRELS exception)
 *   - vite-env.d.ts                   — Vite type augmentation
 *
 * The resolver handles:
 *   - Relative imports (./, ../)
 *   - Path aliases: @/, @features/, @components/, @hooks/, @i18n/
 *   - Implicit extensions (.ts, .tsx, /index.ts, /index.tsx)
 *   - Side-effect imports (import './foo')
 *   - Dynamic imports (import('./foo'))
 *
 * False-positive risks (kept as known limitations):
 *   - String-based imports (e.g., React.lazy(() => import(name))) — these are
 *     rare in this codebase but if added, the file must either be referenced
 *     by a static import elsewhere or be marked as an entry point.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname, normalize } from 'node:path';
import { describe, it } from 'vitest';

const ROOT = join(import.meta.dirname, '../..');
const SRC = ROOT;

// ─── Entry-point classification ──────────────────────────────────────────────

const ENTRY_FILES = new Set<string>([
  'main.tsx',
  'vite-env.d.ts',
]);

function isEntryPoint(relPath: string): boolean {
  // Normalize to forward slashes for cross-platform matching
  const rel = relPath.replace(/\\/g, '/');

  if (ENTRY_FILES.has(rel)) return true;
  if (/\.test\.tsx?$/.test(rel)) return true;
  if (/\.stories\.tsx?$/.test(rel)) return true;
  if (rel.startsWith('test/setup')) return true;
  if (rel === 'types/index.ts') return true; // barrel autorizado
  // Lazy chunks declared statically in vite.config.ts manualChunks
  // (data-ingredients, data-seeds). These are imported via dynamic
  // import() and may not match the static graph traversal.
  if (/^features\/(food|planner|social|wellness)\/data\/(seed-|ingredients)/.test(rel)) return true;

  return false;
}

// ─── File collection ─────────────────────────────────────────────────────────

function collectFiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    if (entry === 'node_modules') continue;

    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      collectFiles(full, results);
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

// ─── Import extraction ───────────────────────────────────────────────────────

/** Match all import / export-from / dynamic-import specifiers in a file. */
function extractImportPaths(content: string): string[] {
  const out: string[] = [];

  // static: import ... from '...'
  for (const m of content.matchAll(/(?:^|\s)(?:import|export)\s+(?:[\s\S]*?\sfrom\s)?['"]([^'"]+)['"]/g)) {
    out.push(m[1]);
  }
  // side-effect: import '...'
  for (const m of content.matchAll(/(?:^|\s)import\s+['"]([^'"]+)['"]/g)) {
    out.push(m[1]);
  }
  // dynamic: import('...')
  for (const m of content.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    out.push(m[1]);
  }
  return out;
}

// ─── Path resolution ─────────────────────────────────────────────────────────

const ALIASES: Array<[string, string]> = [
  ['@features/', join(SRC, 'features') + '/'],
  ['@components/', join(SRC, 'components') + '/'],
  ['@hooks/', join(SRC, 'hooks') + '/'],
  ['@i18n/', join(SRC, 'i18n') + '/'],
  ['@/', SRC + '/'],
];

function resolveImport(spec: string, fromFile: string): string | null {
  // External package
  if (!spec.startsWith('.') && !spec.startsWith('@/') && !spec.startsWith('@features/') &&
      !spec.startsWith('@components/') && !spec.startsWith('@hooks/') && !spec.startsWith('@i18n/')) {
    return null;
  }

  let base: string;
  if (spec.startsWith('.')) {
    base = join(dirname(fromFile), spec);
  } else {
    const hit = ALIASES.find(([alias]) => spec.startsWith(alias));
    if (!hit) return null;
    base = spec.replace(hit[0], hit[1]);
  }

  // Try direct, then with extensions, then as a directory with index
  const candidates = [
    base,
    base + '.tsx',
    base + '.ts',
    join(base, 'index.tsx'),
    join(base, 'index.ts'),
  ];

  for (const candidate of candidates) {
    try {
      const st = statSync(candidate);
      if (st.isFile()) return normalize(candidate);
    } catch {
      // not found, keep trying
    }
  }

  return null;
}

// ─── Test ────────────────────────────────────────────────────────────────────

describe('no-orphan-files convention', () => {
  const allFiles = collectFiles(SRC);

  // Build the set of files referenced by at least one import in some other file.
  const referenced = new Set<string>();
  for (const file of allFiles) {
    const content = readFileSync(file, 'utf8');
    for (const spec of extractImportPaths(content)) {
      const resolved = resolveImport(spec, file);
      if (resolved) referenced.add(resolved);
    }
  }

  it('every src/ .ts(x) file is reachable from an entry point or imported elsewhere', () => {
    const orphans: string[] = [];

    for (const file of allFiles) {
      const rel = relative(SRC, file).replace(/\\/g, '/');
      if (isEntryPoint(rel)) continue;
      if (!referenced.has(normalize(file))) {
        orphans.push(rel);
      }
    }

    if (orphans.length > 0) {
      throw new Error(
        `Found ${orphans.length} orphan file(s) — not imported by any other src/ file.\n` +
        `Either delete them or add to ENTRY_FILES if they are legitimate entry points:\n` +
        orphans.map(o => `  • ${o}`).join('\n'),
      );
    }
  });
});
