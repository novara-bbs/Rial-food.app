/**
 * Tests for Open Food Facts serving parser.
 * Network calls are not tested (mocked / unit-only).
 */
import { describe, it, expect } from 'vitest';
import { parseOFFServings } from './open-food-facts';

describe('parseOFFServings', () => {
  // ─── Always includes 100g fallback ─────────────────────────────────────────

  it('always includes a 100g serving', () => {
    const result = parseOFFServings({});
    const has100g = result.some(s => s.id === '100g');
    expect(has100g).toBe(true);
  });

  it('marks 100g as default when no other serving is found', () => {
    const result = parseOFFServings({});
    const fallback = result.find(s => s.id === '100g');
    expect(fallback?.isDefault).toBe(true);
  });

  // ─── serving_size: plain grams ─────────────────────────────────────────────

  it('parses "30g" serving_size', () => {
    const result = parseOFFServings({ serving_size: '30g' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving).toBeDefined();
    expect(serving?.grams).toBe(30);
    expect(serving?.isDefault).toBe(true);
  });

  it('parses "40 gr" serving_size (with space)', () => {
    const result = parseOFFServings({ serving_size: '40 gr' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving?.grams).toBe(40);
  });

  it('parses "100 ml" serving_size', () => {
    const result = parseOFFServings({ serving_size: '100 ml' });
    // 100g/ml is intentionally excluded (same as default 100g size)
    const serving = result.find(s => s.id === 'serving');
    expect(serving).toBeUndefined();
  });

  it('parses "250ml" serving_size', () => {
    const result = parseOFFServings({ serving_size: '250ml' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving?.grams).toBe(250);
    expect(serving?.name).toContain('250ml');
  });

  it('converts "33cl" to ml', () => {
    const result = parseOFFServings({ serving_size: '33cl' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving?.grams).toBe(330);
  });

  it('converts "1l" to ml', () => {
    const result = parseOFFServings({ serving_size: '1l' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving?.grams).toBe(1000);
  });

  // ─── serving_size: "name (Xg)" pattern ────────────────────────────────────

  it('parses "1 can (330ml)" pattern', () => {
    const result = parseOFFServings({ serving_size: '1 can (330ml)' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving).toBeDefined();
    expect(serving?.grams).toBe(330);
    expect(serving?.name).toContain('can');
    expect(serving?.isDefault).toBe(true);
  });

  it('parses "1 biscuit (12.5g)" pattern', () => {
    const result = parseOFFServings({ serving_size: '1 biscuit (12.5g)' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving?.grams).toBe(12.5);
  });

  it('parses "1 portion (40 g)" pattern', () => {
    const result = parseOFFServings({ serving_size: '1 portion (40 g)' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving?.grams).toBe(40);
  });

  // ─── serving_quantity fallback ─────────────────────────────────────────────

  it('uses serving_quantity if serving_size not parseable', () => {
    const result = parseOFFServings({ serving_quantity: 35 });
    const serving = result.find(s => s.id === 'serving');
    expect(serving?.grams).toBe(35);
    expect(serving?.isDefault).toBe(true);
  });

  it('ignores serving_quantity of 100 (same as 100g default)', () => {
    const result = parseOFFServings({ serving_quantity: 100 });
    const serving = result.find(s => s.id === 'serving');
    expect(serving).toBeUndefined();
  });

  it('ignores serving_quantity of 0', () => {
    const result = parseOFFServings({ serving_quantity: 0 });
    const serving = result.find(s => s.id === 'serving');
    expect(serving).toBeUndefined();
  });

  it('prefers serving_size over serving_quantity', () => {
    const result = parseOFFServings({ serving_size: '30g', serving_quantity: 45 });
    const servings = result.filter(s => s.id === 'serving');
    expect(servings).toHaveLength(1);
    expect(servings[0].grams).toBe(30);
  });

  // ─── product_quantity ──────────────────────────────────────────────────────

  it('adds package serving from product_quantity', () => {
    const result = parseOFFServings({ product_quantity: '500' });
    const pkg = result.find(s => s.id === 'package');
    expect(pkg).toBeDefined();
    expect(pkg?.grams).toBe(500);
  });

  it('converts kg to grams in product_quantity', () => {
    const result = parseOFFServings({ product_quantity: '1kg' });
    const pkg = result.find(s => s.id === 'package');
    expect(pkg?.grams).toBe(1000);
  });

  it('converts L to ml in product_quantity', () => {
    const result = parseOFFServings({ product_quantity: '1l' });
    const pkg = result.find(s => s.id === 'package');
    expect(pkg?.grams).toBe(1000);
  });

  it('skips package if same grams as serving', () => {
    const result = parseOFFServings({ serving_size: '500g', product_quantity: '500' });
    const pkg = result.find(s => s.id === 'package');
    expect(pkg).toBeUndefined();
  });

  it('marks package as default if no serving was found', () => {
    const result = parseOFFServings({ product_quantity: '250' });
    const pkg = result.find(s => s.id === 'package');
    expect(pkg?.isDefault).toBe(true);
  });

  // ─── Combined scenarios ────────────────────────────────────────────────────

  it('returns serving + package + 100g for full product data', () => {
    const result = parseOFFServings({
      serving_size: '30g',
      product_quantity: '750',
    });
    const ids = result.map(s => s.id);
    expect(ids).toContain('serving');
    expect(ids).toContain('package');
    expect(ids).toContain('100g');
  });

  it('returns only 100g for empty product', () => {
    const result = parseOFFServings({});
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('100g');
  });

  it('includes both nameEn and name fields', () => {
    const result = parseOFFServings({ serving_size: '25g' });
    const serving = result.find(s => s.id === 'serving');
    expect(serving?.name).toBeTruthy();
    expect(serving?.nameEn).toBeTruthy();
  });
});
