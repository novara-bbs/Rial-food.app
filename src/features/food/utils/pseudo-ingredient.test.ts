import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GRAM_SERVING_SIZES,
  offResultToIngredient,
  scannedProductToIngredient,
  type ScannedProduct,
} from './pseudo-ingredient';
import type { OFFResult } from '../api/open-food-facts';
import type { ServingSize } from '../../../types';

const OFF_SAMPLE: OFFResult = {
  id: 'off-123',
  title: 'Greek Yogurt',
  cal: 59,
  pro: 10,
  carbs: 3.6,
  fats: 0.4,
  fiber: 0,
  sugar: 3.6,
  saturatedFat: 0.1,
  servingSizes: [
    { id: 'pot', name: '1 pote (150g)', nameEn: '1 pot (150g)', grams: 150, isDefault: true },
  ],
  isApiResult: true,
};

const PRODUCT_SAMPLE: ScannedProduct = {
  name: 'Hummus Clásico',
  brand: 'Mercadona',
  calories: 220,
  protein: 7,
  carbs: 14,
  fats: 15,
  fiber: 4,
  barcode: '8410032002002',
};

describe('DEFAULT_GRAM_SERVING_SIZES', () => {
  it('anchors on 100g as the default', () => {
    const def = DEFAULT_GRAM_SERVING_SIZES.find(s => s.isDefault);
    expect(def?.id).toBe('100g');
    expect(def?.grams).toBe(100);
  });

  it('covers 50/100/150/200g stepped sizes', () => {
    const grams = DEFAULT_GRAM_SERVING_SIZES.map(s => s.grams).sort((a, b) => a - b);
    expect(grams).toEqual([50, 100, 150, 200]);
  });
});

describe('offResultToIngredient', () => {
  it('maps id, title, macros + preserves servingSizes', () => {
    const ing = offResultToIngredient(OFF_SAMPLE);
    expect(ing.id).toBe('off-123');
    expect(ing.name).toBe('Greek Yogurt');
    expect(ing.nameEn).toBe('Greek Yogurt');
    expect(ing.category).toBe('prepared');
    expect(ing.baseAmount).toBe(100);
    expect(ing.baseUnit).toBe('g');
    expect(ing.servingSizes).toEqual(OFF_SAMPLE.servingSizes);
    expect(ing.macros.calories).toBe(59);
    expect(ing.macros.protein).toBe(10);
    expect(ing.macros.fiber).toBe(0);
    expect(ing.macros.saturatedFat).toBe(0.1);
  });

  it('leaves description empty (OFF has no brand→description mapping)', () => {
    const ing = offResultToIngredient(OFF_SAMPLE);
    expect(ing.description).toBe('');
    expect(ing.descriptionEn).toBe('');
  });

  it('emits empty micros / tags / allergens scaffolding', () => {
    const ing = offResultToIngredient(OFF_SAMPLE);
    expect(ing.micros).toEqual({ vitamins: {}, minerals: {}, others: {} });
    expect(ing.tags).toEqual([]);
    expect(ing.allergens).toEqual([]);
  });
});

describe('scannedProductToIngredient', () => {
  it('prefixes id with scanned_, maps brand → description', () => {
    const ing = scannedProductToIngredient(PRODUCT_SAMPLE);
    expect(ing.id).toBe('scanned_8410032002002');
    expect(ing.name).toBe('Hummus Clásico');
    expect(ing.description).toBe('Mercadona');
    expect(ing.descriptionEn).toBe('Mercadona');
    expect(ing.macros.calories).toBe(220);
    expect(ing.macros.fiber).toBe(4);
  });

  it('falls back to DEFAULT_GRAM_SERVING_SIZES when product has none', () => {
    const ing = scannedProductToIngredient(PRODUCT_SAMPLE);
    expect(ing.servingSizes).toBe(DEFAULT_GRAM_SERVING_SIZES);
  });

  it('preserves caller-provided servingSizes when present', () => {
    const custom: ServingSize[] = [
      { id: 'can', name: '1 lata (200g)', nameEn: '1 can (200g)', grams: 200, isDefault: true },
    ];
    const ing = scannedProductToIngredient({ ...PRODUCT_SAMPLE, servingSizes: custom });
    expect(ing.servingSizes).toEqual(custom);
  });

  it('treats an empty servingSizes array as missing (fallback applies)', () => {
    const ing = scannedProductToIngredient({ ...PRODUCT_SAMPLE, servingSizes: [] });
    expect(ing.servingSizes).toBe(DEFAULT_GRAM_SERVING_SIZES);
  });

  it('handles a product with no brand by emitting empty description', () => {
    const ing = scannedProductToIngredient({ ...PRODUCT_SAMPLE, brand: '' });
    expect(ing.description).toBe('');
    expect(ing.descriptionEn).toBe('');
  });
});
