/**
 * MacroDelta unit tests — lock the formatter semantics for the compact
 * "+45 kcal · +8.5g pro · ±0 carb · −0.3g fat" render.
 *
 * We test the file shape (default export) and the formatter branches via
 * static file reads, consistent with the sibling convention tests under
 * `src/test/conventions/`. Component rendering with i18n is intentionally
 * out of scope — that's covered implicitly by the FoodDictionary smoke.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const FILE = resolve(__dirname, 'MacroDelta.tsx');
const source = readFileSync(FILE, 'utf8');

describe('MacroDelta.tsx', () => {
  it('has a default export', () => {
    expect(source).toMatch(/export default function MacroDelta/);
  });

  it('uses U+2212 minus sign for negative deltas (not ASCII hyphen)', () => {
    // U+2212 is the typographic minus sign — visually balanced with "+"
    expect(source).toMatch(/`−\$\{Math\.abs\(value\)\}/);
  });

  it('renders ±0 for zero delta', () => {
    expect(source).toMatch(/`±0\$\{unit\}`/);
  });

  it('prefixes positive delta with +', () => {
    expect(source).toMatch(/`\+\$\{value\}\$\{unit\}`/);
  });

  it('returns null for null delta (no data to show)', () => {
    expect(source).toMatch(/if \(!delta\) return null;/);
  });

  it('renders the 4 macro parts joined by · separator', () => {
    expect(source).toMatch(/parts\.join\(' · '\)/);
  });

  it('uses token classes (no text-[Npx], no shadow-{sm,md,lg}, no dark:)', () => {
    expect(source).not.toMatch(/text-\[\d+px\]/);
    expect(source).not.toMatch(/\bshadow-(sm|md|lg)\b/);
    expect(source).not.toMatch(/\bdark:/);
  });
});
