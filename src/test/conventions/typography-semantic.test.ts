/**
 * Typography semantic rule — ADR-011 (NEUTRAL brand default + design system polish).
 *
 * Every `text-{xl,2xl,3xl,4xl}` paired with `font-bold` must also include
 * `font-headline` so Bricolage Grotesque renders ([1.5.84] brand font). Without
 * it, the class falls back to Inter bold — which produces visually indistinct
 * headlines across screens.
 *
 * `font-mono` is an accepted alternative (JetBrains Mono by design) for
 * numeric/monospace hero tiles — skipped.
 *
 * Baseline = 0 after the 2026-04-19 codemod. Complements the ESLint
 * `no-restricted-syntax` rule by also catching split-across-multiple-attr
 * patterns the AST selector can't see (e.g. dynamic class composition).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const HEADLINE_SIZE_PATTERN = /text-(?:xl|2xl|3xl|4xl)\b/;
const FONT_BOLD_PATTERN = /\bfont-bold\b/;
const FONT_HEADLINE_PATTERN = /\bfont-headline\b/;
const FONT_MONO_PATTERN = /\bfont-mono\b/;

/**
 * Matches any string literal (className value) that looks like Tailwind
 * utility classes. Captures the content between the quotes.
 *
 * We inspect template-literal quasis separately via the `g` flag.
 */
const CLASS_STRING_PATTERN = /["'`]([^"'`\n]{4,})["'`]/g;

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
    .filter(f => !f.includes(path.join('components', 'ui')));

  const violations: string[] = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const matches = text.matchAll(CLASS_STRING_PATTERN);
    for (const m of matches) {
      const value = m[1];
      if (!HEADLINE_SIZE_PATTERN.test(value)) continue;
      if (!FONT_BOLD_PATTERN.test(value)) continue;
      if (FONT_HEADLINE_PATTERN.test(value)) continue;
      if (FONT_MONO_PATTERN.test(value)) continue;
      violations.push(`${path.relative(process.cwd(), file)}: "${value.slice(0, 80)}…"`);
    }
  }
  return violations;
}

describe('Typography semantic rule (ADR-011 § 1.1)', () => {
  it('no text-{xl..4xl} + font-bold without font-headline', () => {
    const violations = findViolations();
    if (violations.length > 0) {
      // eslint-disable-next-line no-console -- surfaced to CI logs
      console.error(
        `\nTypography regression: ${violations.length} headline(s) missing font-headline:\n  - ${violations.join('\n  - ')}\n` +
          'Add `font-headline` so Bricolage Grotesque renders. For canonical headlines prefer `text-headline` or `text-display`. See docs/DESIGN-SYSTEM.md § 1.1.',
      );
    }
    expect(violations).toEqual([]);
  });
});
