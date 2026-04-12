/**
 * Tests for grocery utility functions.
 */
import { describe, it, expect } from 'vitest';
import {
  detectCategory,
  aggregateShoppingItems,
  groupShoppingItems,
  markPantryItems,
  formatShoppingListForShare,
  AISLE_CATEGORIES,
  type GroceryItem,
} from './grocery';

// ─── detectCategory ───────────────────────────────────────────────────────────

describe('detectCategory', () => {
  it('detects meat and fish', () => {
    expect(detectCategory('Pechuga de pollo')).toBe(AISLE_CATEGORIES.meat);
    expect(detectCategory('Salmon fillet')).toBe(AISLE_CATEGORIES.meat);
    expect(detectCategory('Atún en lata')).toBe(AISLE_CATEGORIES.meat);
  });

  it('detects dairy', () => {
    expect(detectCategory('Leche entera')).toBe(AISLE_CATEGORIES.dairy);
    expect(detectCategory('Yogur griego')).toBe(AISLE_CATEGORIES.dairy);
    expect(detectCategory('Queso manchego')).toBe(AISLE_CATEGORIES.dairy);
    expect(detectCategory('Huevo campero')).toBe(AISLE_CATEGORIES.dairy);
  });

  it('detects grains', () => {
    expect(detectCategory('Arroz integral')).toBe(AISLE_CATEGORIES.grains);
    expect(detectCategory('Pasta de trigo')).toBe(AISLE_CATEGORIES.grains);
    expect(detectCategory('Avena instantánea')).toBe(AISLE_CATEGORIES.grains);
    expect(detectCategory('Pan de centeno')).toBe(AISLE_CATEGORIES.grains);
  });

  it('detects vegetables', () => {
    expect(detectCategory('Espinacas baby')).toBe(AISLE_CATEGORIES.vegetables);
    expect(detectCategory('Brócoli fresco')).toBe(AISLE_CATEGORIES.vegetables);
    expect(detectCategory('Zanahoria grande')).toBe(AISLE_CATEGORIES.vegetables);
    expect(detectCategory('Ajo picado')).toBe(AISLE_CATEGORIES.vegetables);
  });

  it('detects fruits', () => {
    expect(detectCategory('Manzana roja')).toBe(AISLE_CATEGORIES.fruits);
    expect(detectCategory('Plátano de Canarias')).toBe(AISLE_CATEGORIES.fruits);
    expect(detectCategory('Aguacate maduro')).toBe(AISLE_CATEGORIES.fruits);
    expect(detectCategory('Fruta del bosque')).toBe(AISLE_CATEGORIES.fruits);
  });

  it('detects pantry items', () => {
    expect(detectCategory('Aceite de oliva virgen')).toBe(AISLE_CATEGORIES.pantry);
    expect(detectCategory('Almendra cruda')).toBe(AISLE_CATEGORIES.pantry);
    expect(detectCategory('Proteína de suero')).toBe(AISLE_CATEGORIES.pantry);
    expect(detectCategory('Lentejas rojas')).toBe(AISLE_CATEGORIES.pantry);
  });

  it('detects spices', () => {
    expect(detectCategory('Pimienta negra')).toBe(AISLE_CATEGORIES.spices);
    expect(detectCategory('Cúrcuma molida')).toBe(AISLE_CATEGORIES.spices);
    expect(detectCategory('Pimentón ahumado')).toBe(AISLE_CATEGORIES.spices);
  });

  it('detects frozen', () => {
    // keyword is 'congelado' (not 'congeladas') — singular form triggers match
    expect(detectCategory('Edamame congelado')).toBe(AISLE_CATEGORIES.frozen);
    expect(detectCategory('frozen pizza')).toBe(AISLE_CATEGORIES.frozen);
  });

  it('detects beverages', () => {
    expect(detectCategory('Agua mineral')).toBe(AISLE_CATEGORIES.beverages);
    // Note: first-match-wins — 'naranja' → fruits, 'proteína' → pantry
    // Use inputs that don't overlap with earlier categories:
    expect(detectCategory('Café molido')).toBe(AISLE_CATEGORIES.beverages);
    expect(detectCategory('Té verde')).toBe(AISLE_CATEGORIES.beverages);
    expect(detectCategory('Smoothie natural')).toBe(AISLE_CATEGORIES.beverages);
  });

  it('returns "Otros" for unknown items', () => {
    expect(detectCategory('Plastilina')).toBe(AISLE_CATEGORIES.other);
    expect(detectCategory('Papel higiénico')).toBe(AISLE_CATEGORIES.other);
    expect(detectCategory('')).toBe(AISLE_CATEGORIES.other);
  });

  it('is case-insensitive', () => {
    expect(detectCategory('POLLO')).toBe(AISLE_CATEGORIES.meat);
    expect(detectCategory('ARROZ')).toBe(AISLE_CATEGORIES.grains);
    expect(detectCategory('Leche')).toBe(AISLE_CATEGORIES.dairy);
  });
});

// ─── aggregateShoppingItems ───────────────────────────────────────────────────

const makeItem = (overrides: Partial<GroceryItem> & { name: string }): GroceryItem => ({
  id: Math.random(),
  category: AISLE_CATEGORIES.other,
  checked: false,
  ...overrides,
});

describe('aggregateShoppingItems', () => {
  it('returns unique items unchanged', () => {
    const items = [
      makeItem({ name: 'Leche', quantity: 2 }),
      makeItem({ name: 'Arroz', quantity: 500 }),
    ];
    const result = aggregateShoppingItems(items);
    expect(result).toHaveLength(2);
  });

  it('merges duplicate items and sums quantities', () => {
    const items = [
      makeItem({ name: 'Leche', quantity: 1 }),
      makeItem({ name: 'Leche', quantity: 2 }),
    ];
    const result = aggregateShoppingItems(items);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
  });

  it('is case-insensitive when merging', () => {
    const items = [
      makeItem({ name: 'Espinacas', quantity: 100 }),
      makeItem({ name: 'espinacas', quantity: 200 }),
      makeItem({ name: 'ESPINACAS', quantity: 50 }),
    ];
    const result = aggregateShoppingItems(items);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(350);
  });

  it('marks merged item as unchecked if any source is unchecked', () => {
    const items = [
      makeItem({ name: 'Leche', checked: true }),
      makeItem({ name: 'Leche', checked: false }),
    ];
    const result = aggregateShoppingItems(items);
    expect(result[0].checked).toBe(false);
  });

  it('keeps checked=true if all sources are checked', () => {
    const items = [
      makeItem({ name: 'Leche', checked: true }),
      makeItem({ name: 'Leche', checked: true }),
    ];
    const result = aggregateShoppingItems(items);
    expect(result[0].checked).toBe(true);
  });

  it('combines source arrays without duplicates', () => {
    const items = [
      makeItem({ name: 'Aceite', source: ['Receta A', 'Receta B'] }),
      makeItem({ name: 'Aceite', source: ['Receta B', 'Receta C'] }),
    ];
    const result = aggregateShoppingItems(items);
    expect(result[0].source).toEqual(['Receta A', 'Receta B', 'Receta C']);
  });

  it('handles items without quantity', () => {
    const items = [
      makeItem({ name: 'Sal' }),
      makeItem({ name: 'Sal' }),
    ];
    const result = aggregateShoppingItems(items);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBeUndefined();
  });

  it('handles empty array', () => {
    expect(aggregateShoppingItems([])).toEqual([]);
  });

  it('trims whitespace before comparing', () => {
    const items = [
      makeItem({ name: '  Leche  ', quantity: 1 }),
      makeItem({ name: 'Leche', quantity: 1 }),
    ];
    const result = aggregateShoppingItems(items);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(2);
  });
});

// ─── groupShoppingItems ───────────────────────────────────────────────────────

describe('groupShoppingItems', () => {
  it('groups items by category', () => {
    const items = [
      makeItem({ name: 'Leche', category: AISLE_CATEGORIES.dairy }),
      makeItem({ name: 'Arroz', category: AISLE_CATEGORIES.grains }),
      makeItem({ name: 'Queso', category: AISLE_CATEGORIES.dairy }),
    ];
    const groups = groupShoppingItems(items);
    expect(groups).toHaveLength(2);
    const dairyGroup = groups.find(g => g.category === AISLE_CATEGORIES.dairy);
    expect(dairyGroup?.items).toHaveLength(2);
  });

  it('sorts groups by supermarket aisle order', () => {
    const items = [
      makeItem({ name: 'Leche', category: AISLE_CATEGORIES.dairy }),
      makeItem({ name: 'Pollo', category: AISLE_CATEGORIES.meat }),
      makeItem({ name: 'Espinacas', category: AISLE_CATEGORIES.vegetables }),
    ];
    const groups = groupShoppingItems(items);
    const order = groups.map(g => g.category);
    // Vegetables < Meat < Dairy in aisle order
    expect(order.indexOf(AISLE_CATEGORIES.vegetables))
      .toBeLessThan(order.indexOf(AISLE_CATEGORIES.meat));
    expect(order.indexOf(AISLE_CATEGORIES.meat))
      .toBeLessThan(order.indexOf(AISLE_CATEGORIES.dairy));
  });

  it('handles empty input', () => {
    expect(groupShoppingItems([])).toEqual([]);
  });

  it('handles unknown categories (placed at end)', () => {
    const items = [
      makeItem({ name: 'Leche', category: AISLE_CATEGORIES.dairy }),
      makeItem({ name: 'Weird item', category: 'Unknown Aisle' }),
    ];
    const groups = groupShoppingItems(items);
    const lastGroup = groups[groups.length - 1];
    expect(lastGroup.category).toBe('Unknown Aisle');
  });
});

// ─── markPantryItems ──────────────────────────────────────────────────────────

describe('markPantryItems', () => {
  const pantry = [
    { id: 1, name: 'Aceite de oliva', category: 'Despensa', quantity: '1L', addedAt: '2026-01-01' },
    { id: 2, name: 'Sal', category: 'Despensa', quantity: 'lleno', addedAt: '2026-01-01' },
  ];

  it('marks items present in pantry', () => {
    const items = [makeItem({ name: 'Aceite de oliva virgen' })];
    const result = markPantryItems(items, pantry);
    expect(result[0].inPantry).toBe(true);
  });

  it('marks items not in pantry as false', () => {
    const items = [makeItem({ name: 'Brócoli' })];
    const result = markPantryItems(items, pantry);
    expect(result[0].inPantry).toBe(false);
  });

  it('handles empty pantry', () => {
    const items = [makeItem({ name: 'Leche' })];
    const result = markPantryItems(items, []);
    expect(result[0].inPantry).toBe(false);
  });

  it('handles empty shopping list', () => {
    expect(markPantryItems([], pantry)).toEqual([]);
  });
});

// ─── formatShoppingListForShare ───────────────────────────────────────────────

describe('formatShoppingListForShare', () => {
  it('returns formatted string starting with RIAL header', () => {
    const items = [
      makeItem({ name: 'Espinacas', category: AISLE_CATEGORIES.vegetables }),
      makeItem({ name: 'Leche', category: AISLE_CATEGORIES.dairy }),
    ];
    const result = formatShoppingListForShare(items);
    expect(result).toContain('Lista de Compras RIAL');
    expect(result).toContain('Espinacas');
    expect(result).toContain('Leche');
  });

  it('excludes already-checked items', () => {
    const items = [
      makeItem({ name: 'Arroz', category: AISLE_CATEGORIES.grains, checked: false }),
      makeItem({ name: 'Pasta', category: AISLE_CATEGORIES.grains, checked: true }),
    ];
    const result = formatShoppingListForShare(items);
    expect(result).toContain('Arroz');
    expect(result).not.toContain('Pasta');
  });

  it('includes quantity when present', () => {
    const items = [
      makeItem({ name: 'Avena', category: AISLE_CATEGORIES.grains, quantity: 500, unit: 'g' }),
    ];
    const result = formatShoppingListForShare(items);
    expect(result).toContain('500g');
  });
});
