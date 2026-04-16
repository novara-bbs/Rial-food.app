import type { FoodHistoryEntry } from '../../food/handlers/meal-handlers';

/**
 * 20 recent foods for Clara's "Recientes" list. Shape mirrors what real usage
 * would produce — a spread of usage counts, macros, and `lastUsed` timestamps.
 */
export function buildDemoFoodHistory(): FoodHistoryEntry[] {
  const now = Date.now();
  const h = (hours: number) => now - hours * 3_600_000;

  return [
    { foodId: 'pollo-plancha', title: 'Pollo a la plancha', lastUsed: h(6), useCount: 18, lastMacros: { cal: 165, pro: 31, carbs: 0, fats: 4 }, lastPortionDescription: '100 g', lastGrams: 100, source: 'dictionary' },
    { foodId: 'arroz-basmati', title: 'Arroz basmati cocido', lastUsed: h(6), useCount: 14, lastMacros: { cal: 130, pro: 3, carbs: 28, fats: 0 }, lastPortionDescription: '100 g', lastGrams: 100, source: 'dictionary' },
    { foodId: 'huevos', title: 'Huevos', lastUsed: h(12), useCount: 22, lastMacros: { cal: 155, pro: 13, carbs: 1, fats: 11 }, lastPortionDescription: '2 unidades', source: 'dictionary' },
    { foodId: 'avena', title: 'Avena', lastUsed: h(24), useCount: 20, lastMacros: { cal: 389, pro: 17, carbs: 66, fats: 7 }, lastPortionDescription: '80 g', lastGrams: 80, source: 'dictionary' },
    { foodId: 'yogur-griego', title: 'Yogur griego natural', lastUsed: h(25), useCount: 16, lastMacros: { cal: 59, pro: 10, carbs: 4, fats: 0 }, lastPortionDescription: '200 g', lastGrams: 200, source: 'dictionary' },
    { foodId: 'platano', title: 'Plátano', lastUsed: h(26), useCount: 11, lastMacros: { cal: 89, pro: 1, carbs: 23, fats: 0 }, lastPortionDescription: '1 unidad', source: 'dictionary' },
    { foodId: 'salmon', title: 'Salmón', lastUsed: h(36), useCount: 8, lastMacros: { cal: 208, pro: 20, carbs: 0, fats: 13 }, lastPortionDescription: '120 g', lastGrams: 120, source: 'dictionary' },
    { foodId: 'brocoli', title: 'Brócoli', lastUsed: h(36), useCount: 10, lastMacros: { cal: 34, pro: 3, carbs: 7, fats: 0 }, lastPortionDescription: '150 g', lastGrams: 150, source: 'dictionary' },
    { foodId: 'espinacas', title: 'Espinacas', lastUsed: h(14), useCount: 9, lastMacros: { cal: 23, pro: 3, carbs: 4, fats: 0 }, lastPortionDescription: '100 g', lastGrams: 100, source: 'dictionary' },
    { foodId: 'quinoa', title: 'Quinoa cocida', lastUsed: h(6), useCount: 7, lastMacros: { cal: 120, pro: 4, carbs: 21, fats: 2 }, lastPortionDescription: '100 g', lastGrams: 100, source: 'dictionary' },
    { foodId: 'almendras', title: 'Almendras', lastUsed: h(48), useCount: 12, lastMacros: { cal: 579, pro: 21, carbs: 22, fats: 50 }, lastPortionDescription: '30 g', lastGrams: 30, source: 'dictionary' },
    { foodId: 'aceite-oliva', title: 'Aceite de oliva virgen extra', lastUsed: h(6), useCount: 25, lastMacros: { cal: 884, pro: 0, carbs: 0, fats: 100 }, lastPortionDescription: '10 ml', source: 'dictionary' },
    { foodId: 'tomate', title: 'Tomate', lastUsed: h(24), useCount: 13, lastMacros: { cal: 18, pro: 1, carbs: 4, fats: 0 }, lastPortionDescription: '1 unidad', source: 'dictionary' },
    { foodId: 'lentejas', title: 'Lentejas cocidas', lastUsed: h(72), useCount: 6, lastMacros: { cal: 116, pro: 9, carbs: 20, fats: 0 }, lastPortionDescription: '150 g', lastGrams: 150, source: 'dictionary' },
    { foodId: 'pan-integral', title: 'Pan integral', lastUsed: h(12), useCount: 11, lastMacros: { cal: 247, pro: 13, carbs: 41, fats: 3 }, lastPortionDescription: '40 g', lastGrams: 40, source: 'dictionary' },
    { foodId: 'queso-fresco', title: 'Queso fresco batido 0%', lastUsed: h(60), useCount: 5, lastMacros: { cal: 52, pro: 10, carbs: 4, fats: 0 }, lastPortionDescription: '100 g', lastGrams: 100, source: 'dictionary' },
    { foodId: 'arandanos', title: 'Arándanos', lastUsed: h(3), useCount: 9, lastMacros: { cal: 57, pro: 1, carbs: 14, fats: 0 }, lastPortionDescription: '80 g', lastGrams: 80, source: 'dictionary' },
    { foodId: 'ternera-magra', title: 'Ternera magra', lastUsed: h(96), useCount: 4, lastMacros: { cal: 158, pro: 26, carbs: 0, fats: 5 }, lastPortionDescription: '130 g', lastGrams: 130, source: 'dictionary' },
    { foodId: 'manzana', title: 'Manzana', lastUsed: h(10), useCount: 15, lastMacros: { cal: 52, pro: 0, carbs: 14, fats: 0 }, lastPortionDescription: '1 unidad', source: 'dictionary' },
    { foodId: 'batido-proteina', title: 'Batido de proteína whey', lastUsed: h(30), useCount: 12, lastMacros: { cal: 120, pro: 24, carbs: 3, fats: 1 }, lastPortionDescription: '1 scoop + agua', source: 'api' },
  ];
}
