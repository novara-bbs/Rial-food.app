import { Ingredient } from '../types';

export const INGREDIENT_DICTIONARY: Ingredient[] = [
  {
    id: 'ing_1',
    name: 'Pechuga de Pollo (Cruda)',
    description: 'Fuente de proteína magra, excelente para desarrollar músculo.',
    category: 'Meat & Seafood',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: [
      { name: '1 pechuga', amount: 150, unit: 'g' },
      { name: '4 oz', amount: 113, unit: 'g' }
    ],
    macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    micros: { vitamins: {}, minerals: { iron: 1, potassium: 256, sodium: 74 }, others: {} }
  },
  {
    id: 'ing_2',
    name: 'Salmón Salvaje',
    description: 'Rico en ácidos grasos Omega-3 y proteína de alta calidad.',
    category: 'Meat & Seafood',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 208, protein: 20, carbs: 0, fats: 13 },
    micros: { vitamins: { vitaminD: 10 }, minerals: { iron: 0.3, potassium: 363, sodium: 59 }, others: {} }
  },
  {
    id: 'ing_3',
    name: 'Quinoa (Cocida)',
    description: 'Proteína completa de origen vegetal y carbohidrato complejo.',
    category: 'Grains',
    baseAmount: 100,
    baseUnit: 'g',
    servingSizes: [
      { name: '1 taza', amount: 185, unit: 'g' },
      { name: '0.5 taza', amount: 92.5, unit: 'g' }
    ],
    macros: { calories: 120, protein: 4.4, carbs: 21.3, fats: 1.9 },
    micros: { vitamins: {}, minerals: { iron: 1.5, potassium: 172 }, others: { fiber: 2.8 } }
  },
  {
    id: 'ing_4',
    name: 'Aguacate',
    description: 'Grasas monoinsaturadas saludables y fibra.',
    category: 'Produce',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 160, protein: 2, carbs: 8.5, fats: 14.7 },
    micros: { vitamins: { vitaminC: 10 }, minerals: { potassium: 485 }, others: { fiber: 6.7 } }
  },
  {
    id: 'ing_5',
    name: 'Aceite de Oliva (Virgen Extra)',
    description: 'Grasa saludable para el corazón, excelente para aderezos y cocinar.',
    category: 'Oils & Fats',
    baseAmount: 15, // 1 tbsp roughly
    baseUnit: 'ml',
    macros: { calories: 119, protein: 0, carbs: 0, fats: 13.5 },
    micros: { vitamins: { vitaminA: 0, vitaminC: 0 }, minerals: {}, others: {} }
  },
  {
    id: 'ing_6',
    name: 'Brócoli (Crudo)',
    description: 'Vegetal crucífero alto en vitaminas y fibra.',
    category: 'Produce',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4 },
    micros: { vitamins: { vitaminC: 89 }, minerals: { iron: 0.7, potassium: 316 }, others: { fiber: 2.6 } }
  },
  {
    id: 'ing_7',
    name: 'Batata (Horneada)',
    description: 'Excelente fuente de carbohidratos complejos y Vitamina A.',
    category: 'Produce',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 90, protein: 2, carbs: 20.7, fats: 0.2 },
    micros: { vitamins: { vitaminA: 961, vitaminC: 19.6 }, minerals: { potassium: 475 }, others: { fiber: 3.3 } }
  },
  {
    id: 'ing_8',
    name: 'Aislado de Proteína de Suero',
    description: 'Proteína de rápida absorción para la recuperación post-entrenamiento.',
    category: 'Supplements',
    baseAmount: 30, // 1 scoop
    baseUnit: 'g',
    macros: { calories: 110, protein: 25, carbs: 1, fats: 0.5 },
    micros: { vitamins: {}, minerals: { calcium: 100, sodium: 50 }, others: {} }
  },
  {
    id: 'ing_9',
    name: 'Almendras (Crudas)',
    description: 'Fruto seco denso en nutrientes, alto en grasas saludables y Vitamina E.',
    category: 'Nuts & Seeds',
    baseAmount: 30, // 1 oz
    baseUnit: 'g',
    macros: { calories: 164, protein: 6, carbs: 6, fats: 14 },
    micros: { vitamins: {}, minerals: { calcium: 76, iron: 1.1, potassium: 208 }, others: { fiber: 3.5 } }
  },
  {
    id: 'ing_10',
    name: 'Yogur Griego (Desnatado)',
    description: 'Opción láctea alta en proteína, excelente para la salud intestinal.',
    category: 'Dairy',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
    micros: { vitamins: {}, minerals: { calcium: 110, potassium: 141, sodium: 36 }, others: {} }
  },
  {
    id: 'ing_11',
    name: 'Pechuga de Pollo (Cocida)',
    description: 'Fuente de proteína magra, cocida.',
    category: 'Meat & Seafood',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    micros: { vitamins: {}, minerals: { iron: 1, potassium: 256, sodium: 74 }, others: {} }
  },
  {
    id: 'ing_12',
    name: 'Brócoli (Al Vapor)',
    description: 'Vegetal crucífero al vapor.',
    category: 'Produce',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 35, protein: 2.4, carbs: 7, fats: 0.4 },
    micros: { vitamins: { vitaminC: 90 }, minerals: { iron: 0.7, potassium: 316 }, others: { fiber: 2.6 } }
  },
  {
    id: 'ing_13',
    name: 'Arroz Blanco (Cocido)',
    description: 'Fuente de carbohidratos simples.',
    category: 'Grains',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
    micros: { vitamins: {}, minerals: { iron: 0.2, potassium: 35, sodium: 1 }, others: {} }
  },
  {
    id: 'ing_14',
    name: 'Arroz Integral (Cocido)',
    description: 'Fuente de carbohidratos de grano entero.',
    category: 'Grains',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 110, protein: 2.6, carbs: 23, fats: 0.9 },
    micros: { vitamins: {}, minerals: { iron: 0.4, potassium: 43, sodium: 1 }, others: { fiber: 1.8 } }
  },
  {
    id: 'ing_15',
    name: 'Huevos (Grandes)',
    description: 'Proteína de alta calidad y grasas saludables.',
    category: 'Dairy',
    baseAmount: 50, // 1 large egg
    baseUnit: 'g',
    macros: { calories: 72, protein: 6, carbs: 0.4, fats: 4.8 },
    micros: { vitamins: { vitaminA: 260, vitaminD: 44 }, minerals: { calcium: 28, iron: 0.9, potassium: 69 }, others: {} }
  },
  {
    id: 'ing_16',
    name: 'Espinaca (Fresca)',
    description: 'Hoja verde densa en nutrientes.',
    category: 'Produce',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
    micros: { vitamins: { vitaminA: 469, vitaminC: 28 }, minerals: { calcium: 99, iron: 2.7, potassium: 558 }, others: { fiber: 2.2 } }
  },
  {
    id: 'ing_17',
    name: 'Carne de Res (Molida, 90/10)',
    description: 'Carne molida magra.',
    category: 'Meat & Seafood',
    baseAmount: 100,
    baseUnit: 'g',
    macros: { calories: 176, protein: 19, carbs: 0, fats: 10 },
    micros: { vitamins: {}, minerals: { iron: 2.1, potassium: 270, sodium: 60 }, others: {} }
  }
];
