/**
 * FilterSheet invariants — ADR-014.
 *
 * Three regressions we want to fail loudly on:
 *
 *   E. Multiple FilterSheet mounts in the same screen — there should never
 *      be more than one advanced filter panel per screen (a second one
 *      means a designer is layering two distinct filter scopes that should
 *      have been collapsed into a single sheet with grouped sections).
 *
 *   F. FilterSheet imported without FilterButton — the sheet has no trigger
 *      affordance from the screen body, so the user can't open it. Either
 *      delete the import or wire a `<FilterButton>`.
 *
 *   G. FilterSheet imported without ActiveFilterStrip ([1.5.97]) — every
 *      advanced-filter flow needs visible feedback of what's currently
 *      applied. Without the strip, users don't see persisted filters when
 *      they return to the screen, and they reimplement inline pills
 *      (the anti-pattern Cocina shipped briefly in [1.5.95] and corrected
 *      in [1.5.97]).
 *
 * All checks are cheap text-pattern heuristics over the source file.
 * Allowlists track documented exceptions.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/** Files where multiple FilterSheets in one screen are intentional. */
const MULTI_SHEET_ALLOWLIST = new Set<string>([
  // (empty — add with comment if a screen genuinely hosts two filter scopes)
]);

/** Files allowed to import FilterSheet without FilterButton (e.g. headless usage). */
const NO_TRIGGER_ALLOWLIST = new Set<string>([
  // (empty — every screen using FilterSheet must also render a FilterButton)
]);

/** Files allowed to import FilterSheet without ActiveFilterStrip (e.g. screens
 *  with intentionally invisible applied-filter feedback). */
const NO_STRIP_ALLOWLIST = new Set<string>([
  // (empty — every screen using FilterSheet must also render an ActiveFilterStrip)
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile() && /\.tsx$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const repoRoot = path.resolve(__dirname, '../../..');
const screensDir = path.join(repoRoot, 'src', 'features');

function relativePosixPath(absolute: string): string {
  return path.relative(repoRoot, absolute).split(path.sep).join('/');
}

const screenFiles = walk(screensDir).filter(f => f.includes(`${path.sep}screens${path.sep}`));

describe('ADR-014 — FilterSheet invariants', () => {
  it('Invariant E — at most one <FilterSheet> per screen', () => {
    const violators: { file: string; count: number }[] = [];
    for (const file of screenFiles) {
      const rel = relativePosixPath(file);
      if (MULTI_SHEET_ALLOWLIST.has(rel)) continue;
      const src = fs.readFileSync(file, 'utf8');
      // Count opening FilterSheet tags. Match `<FilterSheet ` or `<FilterSheet\n`
      // (not `<FilterSheetSomething…`).
      const matches = src.match(/<FilterSheet[\s>]/g);
      const count = matches ? matches.length : 0;
      if (count > 1) violators.push({ file: rel, count });
    }
    expect(violators).toEqual([]);
  });

  it('Invariant F — screens importing FilterSheet must also import FilterButton', () => {
    const violators: string[] = [];
    for (const file of screenFiles) {
      const rel = relativePosixPath(file);
      if (NO_TRIGGER_ALLOWLIST.has(rel)) continue;
      const src = fs.readFileSync(file, 'utf8');
      const importsSheet = /from ['"][^'"]*patterns\/FilterSheet['"]/.test(src);
      if (!importsSheet) continue;
      const importsButton = /from ['"][^'"]*patterns\/FilterButton['"]/.test(src);
      if (!importsButton) violators.push(rel);
    }
    expect(violators).toEqual([]);
  });

  it('Invariant G — screens importing FilterSheet must also import ActiveFilterStrip', () => {
    const violators: string[] = [];
    for (const file of screenFiles) {
      const rel = relativePosixPath(file);
      if (NO_STRIP_ALLOWLIST.has(rel)) continue;
      const src = fs.readFileSync(file, 'utf8');
      const importsSheet = /from ['"][^'"]*patterns\/FilterSheet['"]/.test(src);
      if (!importsSheet) continue;
      const importsStrip = /from ['"][^'"]*patterns\/ActiveFilterStrip['"]/.test(src);
      if (!importsStrip) violators.push(rel);
    }
    expect(violators).toEqual([]);
  });
});
