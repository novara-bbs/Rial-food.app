/**
 * Grocery utilities — smart shopping list management
 * Adapted from v0-rialfood patterns
 */

export interface GroceryItem {
  id: number;
  name: string;
  category: string;
  checked: boolean;
  quantity?: number;
  unit?: string;
  source?: string[]; // recipe names this item belongs to
}

// ─── Aisle categories ──────────────────────────────────────────────────────

export const AISLE_CATEGORIES = {
  vegetables: 'Verduras y Vegetales',
  fruits: 'Frutas',
  meat: 'Carne y Pescado',
  dairy: 'Lácteos y Huevos',
  grains: 'Cereales y Pan',
  pantry: 'Despensa',
  spices: 'Especias y Salsas',
  frozen: 'Congelados',
  beverages: 'Bebidas',
  other: 'Otros',
  planned: 'Comidas Planeadas',
} as const;

export type AisleCategory = (typeof AISLE_CATEGORIES)[keyof typeof AISLE_CATEGORIES];

// Store walk order (typical supermarket layout)
const AISLE_ORDER: string[] = [
  AISLE_CATEGORIES.vegetables,
  AISLE_CATEGORIES.fruits,
  AISLE_CATEGORIES.meat,
  AISLE_CATEGORIES.dairy,
  AISLE_CATEGORIES.grains,
  AISLE_CATEGORIES.frozen,
  AISLE_CATEGORIES.pantry,
  AISLE_CATEGORIES.spices,
  AISLE_CATEGORIES.beverages,
  AISLE_CATEGORIES.other,
  AISLE_CATEGORIES.planned,
];

// ─── Ingredient → Aisle auto-categorization ───────────────────────────────

const CATEGORY_KEYWORDS: Array<{ keywords: string[]; category: AisleCategory }> = [
  { keywords: ['pollo', 'chicken', 'salmon', 'salmón', 'carne', 'meat', 'atún', 'tuna', 'bisonte', 'pavo', 'turkey', 'cerdo', 'pork', 'ternera', 'beef', 'pescado', 'fish', 'bacalao', 'gambas', 'shrimp'], category: AISLE_CATEGORIES.meat },
  { keywords: ['leche', 'milk', 'yogur', 'yogurt', 'queso', 'cheese', 'huevo', 'egg', 'mantequilla', 'butter', 'kefir', 'crema', 'cream', 'nata'], category: AISLE_CATEGORIES.dairy },
  { keywords: ['arroz', 'rice', 'quinoa', 'avena', 'oats', 'pan', 'bread', 'pasta', 'harina', 'flour', 'trigo', 'wheat', 'maíz', 'corn', 'cebada', 'barley'], category: AISLE_CATEGORIES.grains },
  { keywords: ['espinaca', 'spinach', 'brócoli', 'broccoli', 'zanahoria', 'carrot', 'cebolla', 'onion', 'ajo', 'garlic', 'tomate', 'tomato', 'lechuga', 'lettuce', 'pimiento', 'pepper', 'calabacín', 'zucchini', 'col', 'kale', 'remolacha', 'beet', 'pepino', 'cucumber', 'apio', 'celery'], category: AISLE_CATEGORIES.vegetables },
  { keywords: ['manzana', 'apple', 'plátano', 'banana', 'naranja', 'orange', 'fresa', 'strawberry', 'aguacate', 'avocado', 'limón', 'lemon', 'uva', 'grape', 'mango', 'arándano', 'blueberry', 'fruta', 'fruit'], category: AISLE_CATEGORIES.fruits },
  { keywords: ['aceite', 'oil', 'vinagre', 'vinegar', 'soja', 'soy', 'miel', 'honey', 'sal', 'salt', 'azúcar', 'sugar', 'cacao', 'cocoa', 'proteína', 'protein', 'suero', 'whey', 'almendra', 'almond', 'nuez', 'walnut', 'semilla', 'seed', 'legumbre', 'bean', 'garbanzo', 'chickpea', 'lenteja', 'lentil'], category: AISLE_CATEGORIES.pantry },
  { keywords: ['pimienta', 'pepper', 'comino', 'cumin', 'cúrcuma', 'turmeric', 'curry', 'orégano', 'oregano', 'romero', 'rosemary', 'tomillo', 'thyme', 'jengibre', 'ginger', 'canela', 'cinnamon', 'pimentón', 'paprika'], category: AISLE_CATEGORIES.spices },
  { keywords: ['congelado', 'frozen', 'edamame'], category: AISLE_CATEGORIES.frozen },
  { keywords: ['agua', 'water', 'zumo', 'juice', 'batido', 'smoothie', 'té', 'tea', 'café', 'coffee'], category: AISLE_CATEGORIES.beverages },
];

export function detectCategory(ingredientName: string): AisleCategory {
  const lower = ingredientName.toLowerCase();
  for (const { keywords, category } of CATEGORY_KEYWORDS) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return AISLE_CATEGORIES.other;
}

// ─── Aggregation ──────────────────────────────────────────────────────────

/**
 * Deduplicates items by name (case-insensitive) and aggregates quantities.
 * Items from the same name are merged — quantities summed, sources combined.
 */
export function aggregateShoppingItems(items: GroceryItem[]): GroceryItem[] {
  const merged = new Map<string, GroceryItem>();

  for (const item of items) {
    const key = item.name.toLowerCase().trim();
    const existing = merged.get(key);

    if (existing) {
      // Merge: un-check if any source is unchecked, combine sources
      if (!item.checked) existing.checked = false;
      if (item.quantity && existing.quantity) {
        existing.quantity += item.quantity;
      }
      if (item.source) {
        existing.source = [...new Set([...(existing.source || []), ...item.source])];
      }
    } else {
      merged.set(key, { ...item });
    }
  }

  return Array.from(merged.values());
}

/**
 * Groups items by aisle category, sorted by store walk order.
 */
export function groupShoppingItems(items: GroceryItem[]): Array<{ category: string; items: GroceryItem[] }> {
  const groups = new Map<string, GroceryItem[]>();

  for (const item of items) {
    const cat = item.category || AISLE_CATEGORIES.other;
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(item);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      const iA = AISLE_ORDER.indexOf(a);
      const iB = AISLE_ORDER.indexOf(b);
      return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
    })
    .map(([category, items]) => ({ category, items }));
}

/**
 * Formats a WhatsApp-ready text export of the shopping list.
 */
export function formatShoppingListForShare(items: GroceryItem[]): string {
  const groups = groupShoppingItems(aggregateShoppingItems(items));
  const lines: string[] = ['🛒 *Lista de Compras RIAL*\n'];

  for (const group of groups) {
    const unchecked = group.items.filter(i => !i.checked);
    if (!unchecked.length) continue;
    lines.push(`\n*${group.category.toUpperCase()}*`);
    for (const item of unchecked) {
      const qty = item.quantity ? ` (${item.quantity}${item.unit || ''})` : '';
      lines.push(`• ${item.name}${qty}`);
    }
  }

  return lines.join('\n');
}
