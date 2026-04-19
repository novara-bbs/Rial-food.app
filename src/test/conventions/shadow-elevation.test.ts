/**
 * Shadow elevation rule — ADR-010 § 2026-04-19 addendum.
 *
 * `src/**` must use the semantic elevation scale `shadow-elev-{0,1,2,3}` —
 * not Tailwind default utilities `shadow-{sm,md,lg,xl,2xl}`. Baseline = 0
 * after the 2026-04-19 sweep (CHANGELOG `[1.5.53]`).
 *
 * Exclusions (allowlist):
 *   - `src/components/ui/**`  → shadcn/ui primitives retain upstream defaults.
 *   - `src/App.tsx`           → dev-only demo-mode ribbon.
 *
 * Colored shadow tints (`shadow-primary/25`, etc.) are decorative overlays,
 * NOT part of the elevation scale — they pass through.
 *
 * Complements the ESLint `no-restricted-syntax` rule for the same pattern.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const TAILWIND_SHADOW = /(?:^|\s)shadow-(?:sm|md|lg|xl|2xl)\b/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function findViolations(): string[] {
  const srcRoot = path.resolve(process.cwd(), 'src');
  const files = walk(srcRoot)
    .filter(f => !f.includes(path.join('test', 'conventions')))
    .filter(f => !f.includes(path.join('components', 'ui')))
    .filter(f => path.relative(srcRoot, f) !== 'App.tsx');

  const violations: string[] = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    // Scan all quoted string contents (classNames + template literal quasis)
    const quoted = text.match(/["'`][^"'`\n]{4,}["'`]/g) ?? [];
    for (const q of quoted) {
      if (TAILWIND_SHADOW.test(q)) {
        violations.push(`${path.relative(process.cwd(), file)}: ${q.slice(0, 80)}…`);
      }
    }
  }
  return violations;
}

describe('Shadow elevation rule (ADR-010 § 2026-04-19)', () => {
  it('no Tailwind default shadows outside the shadcn/ui allowlist', () => {
    const violations = findViolations();
    if (violations.length > 0) {
      // eslint-disable-next-line no-console -- surfaced to CI logs
      console.error(
        `\nShadow regression: ${violations.length} usage(s) of shadow-{sm,md,lg,xl,2xl}:\n  - ${violations.join('\n  - ')}\n` +
          'Use `shadow-elev-{0,1,2,3}` (sm→1, md→2, lg/xl/2xl→3). See docs/DESIGN-SYSTEM.md § 1.4.',
      );
    }
    expect(violations).toEqual([]);
  });
});
