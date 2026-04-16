/**
 * SectionCard drift monitor — ADR-001.
 *
 * Counts occurrences of the hand-rolled SectionCard shape across src/**.
 * This is NOT a strict gate (Q16 migration removes them one by one) — it
 * locks the count at the Wave-3 baseline and fails on any INCREASE.
 *
 * When Q16 migrates files, the baseline drops. Update `BASELINE` in a PR
 * together with the migration. Adding new occurrences → test fails → CI red.
 *
 * Complements the ESLint rule (which blocks new occurrences outside the
 * allowlist). This test covers the allowlist too — so drift can't grow
 * inside already-flagged files either.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Baseline recorded at Wave 3 close was 134. Q15.5 walkthrough pilot
 * (NutritionHero redesign + WeeklyCheckIn/WeeklyReview migrations)
 * dropped it to 84. Q16 codemod sprint drops it further; it may never
 * rise. When it reaches 0, delete this test file.
 */
const BASELINE = 84;

const SHAPE = /bg-surface-container-low[^"'`]*\bborder-outline-variant\/20[^"'`]*\brounded-sm/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|mjs|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function countShapeOccurrences(): { count: number; files: string[] } {
  const srcRoot = path.resolve(process.cwd(), 'src');
  const files = walk(srcRoot)
    // Primitive intentionally owns the shape
    .filter(f => !f.endsWith(path.join('components', 'SectionCard.tsx')))
    // Convention tests reference the shape as a fixture
    .filter(f => !f.includes(path.join('test', 'conventions')));

  let count = 0;
  const hits: string[] = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    // Count occurrences per file (not just 1 per file)
    const global = new RegExp(SHAPE.source, 'g');
    let local = 0;
    while (global.exec(text) !== null) {
      local++;
      count++;
    }
    if (local > 0) hits.push(`${path.relative(process.cwd(), file)}  (${local})`);
  }
  return { count, files: hits };
}

describe('SectionCard drift monitor (ADR-001)', () => {
  it(`has ≤ ${BASELINE} hand-rolled occurrences (Q16 must not regress)`, () => {
    const { count, files } = countShapeOccurrences();
    if (count > BASELINE) {
      console.error(
        `\nSectionCard shape regressed: found ${count}, baseline ${BASELINE}. ` +
          `Files:\n  - ${files.join('\n  - ')}\n` +
          'Replace the duplicated shape with <SectionCard>. See docs/PRIMITIVES.md.',
      );
    }
    expect(count).toBeLessThanOrEqual(BASELINE);
  });

  it('baseline metadata is present (prevents accidental deletion before Q16)', () => {
    expect(typeof BASELINE).toBe('number');
    expect(BASELINE).toBeGreaterThan(0);
  });
});
