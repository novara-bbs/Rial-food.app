/**
 * Convention test: R7 — ingredient-parser utility.
 *
 * Locks:
 *  (a) "200g pasta" — compact unit, high confidence.
 *  (b) "2 huevos"   — number + name (no unit).
 *  (c) "100ml leche" — volume unit.
 *  (d) "1 taza harina" — cup unit.
 *  (e) "1/2 cebolla" — fraction without unit.
 *  (f) "1/2 taza avena" — fraction with unit.
 *  (g) "pizca de sal" — name-only, low confidence.
 *  (h) "blabla random text" — no number, low confidence.
 *  (i) Empty string → confidence 0.
 *  (j) parseBulkIngredients splits multi-line text.
 *  (k) parseBulkIngredients skips empty lines.
 *  (l) raw field equals trimmed input.
 *  (m) toApproxGrams converts g / kg / ml / l correctly.
 *  (n) toApproxGrams falls back to defaultGrams for unknown units.
 */
import { describe, it, expect } from 'vitest';
import {
  parseIngredientLine,
  parseBulkIngredients,
  toApproxGrams,
} from '../../features/recipes/utils/ingredient-parser';

// ── (a) Compact unit ──────────────────────────────────────────────────────
describe('parseIngredientLine — compact unit', () => {
  it('(a) parses "200g pasta" — quantity, unit, name, high confidence', () => {
    const r = parseIngredientLine('200g pasta');
    expect(r.quantity).toBe(200);
    expect(r.unit).toMatch(/^g/);
    expect(r.name).toBe('pasta');
    expect(r.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('(a) parses "300 g de arroz" — with space and article', () => {
    const r = parseIngredientLine('300 g de arroz');
    expect(r.quantity).toBe(300);
    expect(r.name).toBe('arroz');
    expect(r.confidence).toBeGreaterThanOrEqual(0.8);
  });
});

// ── (b) Number + name ─────────────────────────────────────────────────────
describe('parseIngredientLine — number only', () => {
  it('(b) parses "2 huevos"', () => {
    const r = parseIngredientLine('2 huevos');
    expect(r.quantity).toBe(2);
    expect(r.name).toBe('huevos');
    expect(r.confidence).toBeGreaterThanOrEqual(0.6);
    expect(r.unit).toBeUndefined();
  });
});

// ── (c) Volume unit ───────────────────────────────────────────────────────
describe('parseIngredientLine — volume unit', () => {
  it('(c) parses "100ml leche"', () => {
    const r = parseIngredientLine('100ml leche');
    expect(r.quantity).toBe(100);
    expect(r.unit).toMatch(/ml/);
    expect(r.name).toBe('leche');
    expect(r.confidence).toBeGreaterThanOrEqual(0.8);
  });
});

// ── (d) Cup unit ──────────────────────────────────────────────────────────
describe('parseIngredientLine — cup unit', () => {
  it('(d) parses "1 taza harina"', () => {
    const r = parseIngredientLine('1 taza harina');
    expect(r.quantity).toBe(1);
    expect(r.unit).toMatch(/taza/);
    expect(r.name).toBe('harina');
    expect(r.confidence).toBeGreaterThanOrEqual(0.8);
  });
});

// ── (e) Fraction without unit ─────────────────────────────────────────────
describe('parseIngredientLine — fraction no unit', () => {
  it('(e) parses "1/2 cebolla"', () => {
    const r = parseIngredientLine('1/2 cebolla');
    expect(r.quantity).toBeCloseTo(0.5);
    expect(r.name).toBe('cebolla');
    expect(r.confidence).toBeGreaterThanOrEqual(0.6);
    expect(r.unit).toBeUndefined();
  });
});

// ── (f) Fraction with unit ────────────────────────────────────────────────
describe('parseIngredientLine — fraction with unit', () => {
  it('(f) parses "1/2 taza avena"', () => {
    const r = parseIngredientLine('1/2 taza avena');
    expect(r.quantity).toBeCloseTo(0.5);
    expect(r.unit).toMatch(/taza/);
    expect(r.name).toBe('avena');
    expect(r.confidence).toBeGreaterThanOrEqual(0.6);
  });
});

// ── (g) Name only — low confidence ────────────────────────────────────────
describe('parseIngredientLine — name only', () => {
  it('(g) "pizca de sal" returns low confidence', () => {
    const r = parseIngredientLine('pizca de sal');
    expect(r.confidence).toBeLessThan(0.6);
    expect(r.name).toBe('pizca de sal');
    expect(r.quantity).toBeUndefined();
  });
});

// ── (h) Random text — low confidence ──────────────────────────────────────
describe('parseIngredientLine — unparseable', () => {
  it('(h) "blabla random text" → low confidence', () => {
    const r = parseIngredientLine('blabla random text');
    expect(r.confidence).toBeLessThan(0.6);
  });
});

// ── (i) Empty string ──────────────────────────────────────────────────────
describe('parseIngredientLine — empty', () => {
  it('(i) empty string → confidence 0', () => {
    const r = parseIngredientLine('');
    expect(r.confidence).toBe(0);
  });
});

// ── (j-l) parseBulkIngredients ────────────────────────────────────────────
describe('parseBulkIngredients', () => {
  it('(j) splits multi-line text into parsed items', () => {
    const results = parseBulkIngredients('200g pasta\n2 huevos\n100ml leche');
    expect(results).toHaveLength(3);
    expect(results[0].quantity).toBe(200);
    expect(results[1].quantity).toBe(2);
    expect(results[2].quantity).toBe(100);
  });

  it('(k) skips empty lines', () => {
    const results = parseBulkIngredients('200g pasta\n\n100ml leche\n');
    expect(results).toHaveLength(2);
  });

  it('(l) raw field equals trimmed input', () => {
    const results = parseBulkIngredients('  300g arroz  ');
    expect(results[0].raw).toBe('300g arroz');
  });
});

// ── (m-n) toApproxGrams ───────────────────────────────────────────────────
describe('toApproxGrams', () => {
  it('(m) g → same value', () => {
    expect(toApproxGrams(250, 'g', 100)).toBe(250);
  });

  it('(m) kg → × 1000', () => {
    expect(toApproxGrams(1.5, 'kg', 100)).toBe(1500);
  });

  it('(m) ml → same value (density 1)', () => {
    expect(toApproxGrams(200, 'ml', 100)).toBe(200);
  });

  it('(m) l → × 1000', () => {
    expect(toApproxGrams(0.5, 'l', 100)).toBe(500);
  });

  it('(n) unknown unit falls back to defaultGrams', () => {
    expect(toApproxGrams(2, 'piezas', 120)).toBe(120);
  });

  it('(n) undefined quantity falls back to defaultGrams', () => {
    expect(toApproxGrams(undefined, 'g', 80)).toBe(80);
  });
});
