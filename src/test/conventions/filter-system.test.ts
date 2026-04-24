/**
 * Filter system invariants — ADR-013.
 *
 * Two regressions we want to fail loudly on:
 *
 *   A. Inline chip reimplementations — a <button> in src/features/** that
 *      carries the canonical chip styling (rounded-* + uppercase +
 *      tracking-widest + a brand font) instead of going through ChipRow /
 *      SegmentedTabs / TabNav. This is the FoodDictionary / Community
 *      drift pattern we cleaned up in [1.5.86].
 *
 *   B. Inline branded sort — a native <select> in src/features/**\/screens
 *      with a brand font class, instead of going through SortControl. This
 *      is the Cocina inline <select>+ArrowUpDown pattern we cleaned up in
 *      [1.5.86].
 *
 * Both use cheap text-pattern heuristics over the source file. The
 * allowlist tracks documented exceptions — each line must carry a comment
 * explaining why.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/** Files where an inline branded <button> is a justified exception. */
const INLINE_CHIP_ALLOWLIST = new Set<string>([
  // Standalone "Multi" mode toggle sitting next to SearchInput — binary on/off,
  // not a chip in a chip-row. Kept inline until a ToggleButton primitive exists.
  'src/features/food/screens/AddMeal.tsx',
]);

/** Files where an inline branded <select> is a justified exception. */
const INLINE_SORT_ALLOWLIST = new Set<string>([
  // (empty — migrate or add with a comment)
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function rel(file: string): string {
  return path.relative(process.cwd(), file).replace(/\\/g, '/');
}

/** Detect a <button> whose className carries canonical chip shape.
 *
 *  Chip discriminator = the full combo:
 *    - `shrink-0`            (sits inside a flex-gap overflow-x-auto row)
 *    - `rounded-*`
 *    - `uppercase` + `tracking-widest`
 *    - brand font (`font-headline` or `font-label`)
 *
 *  Requiring `shrink-0` excludes standard CTAs / form submits / nav buttons
 *  that also use branded typography but stand alone (no horizontal chip row).
 */
function hasInlineChipPattern(text: string): boolean {
  const classRegex = /className\s*=\s*(?:\{[^}]*?\}|["'`][^"'`]*["'`])/g;
  const matches = text.match(classRegex) ?? [];
  for (const m of matches) {
    const hasShrink = /\bshrink-0\b/.test(m);
    const hasRounded = /\brounded-(sm|md|lg|full|xl|2xl|3xl|\[)/.test(m);
    const hasUpper = /\buppercase\b/.test(m);
    const hasTracking = /\btracking-widest\b/.test(m);
    const hasBrandFont = /\bfont-(headline|label)\b/.test(m);
    if (!(hasShrink && hasRounded && hasUpper && hasTracking && hasBrandFont)) continue;
    // Confirm this className sits on a <button> (not a <div>/<span>).
    const idx = text.indexOf(m);
    const before = text.slice(Math.max(0, idx - 300), idx);
    if (/<button\b[^>]*$/m.test(before)) return true;
  }
  return false;
}

/** Detect a native <select> with a brand font class in its opening tag. */
function hasInlineSortPattern(text: string): boolean {
  const selectRegex = /<select\b[^>]*>/gs;
  for (const match of text.matchAll(selectRegex)) {
    const tag = match[0];
    if (/\bfont-(headline|label)\b/.test(tag)) return true;
  }
  return false;
}

describe('Filter system invariants (ADR-013)', () => {
  const srcRoot = path.resolve(process.cwd(), 'src');
  const files = walk(srcRoot);

  it('A — no inline chip reimplementation in src/features/**', () => {
    const offenders: string[] = [];
    const allowed = new Set(Array.from(INLINE_CHIP_ALLOWLIST).map(p => p.replace(/\\/g, '/')));
    for (const file of files) {
      const r = rel(file);
      // Scope: only features. Primitives in components/patterns and UI lib are
      // exempt (they define the styles).
      if (!r.includes('src/features/')) continue;
      if (allowed.has(r)) continue;
      const text = fs.readFileSync(file, 'utf8');
      if (hasInlineChipPattern(text)) offenders.push(r);
    }
    if (offenders.length > 0) {
      // eslint-disable-next-line no-console -- surfaced to CI logs
      console.error(
        '\nInline chip reimplementation detected (ADR-013 invariant A):\n  - ' +
          offenders.join('\n  - ') +
          '\n\nRoute through ChipRow / SegmentedTabs / TabNav, or add to ' +
          'INLINE_CHIP_ALLOWLIST with a comment explaining why.',
      );
    }
    expect(offenders).toEqual([]);
  });

  it('B — no branded inline <select> in src/features/**/screens/*', () => {
    const offenders: string[] = [];
    const allowed = new Set(Array.from(INLINE_SORT_ALLOWLIST).map(p => p.replace(/\\/g, '/')));
    for (const file of files) {
      const r = rel(file);
      if (!/src\/features\/.*\/screens\//.test(r)) continue;
      if (allowed.has(r)) continue;
      const text = fs.readFileSync(file, 'utf8');
      if (hasInlineSortPattern(text)) offenders.push(r);
    }
    if (offenders.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        '\nInline branded <select> detected (ADR-013 invariant B):\n  - ' +
          offenders.join('\n  - ') +
          '\n\nRoute through SortControl, or add to INLINE_SORT_ALLOWLIST with a comment.',
      );
    }
    expect(offenders).toEqual([]);
  });
});
