/**
 * rda — Reference Daily Allowance tables for vitamins and minerals.
 *
 * Sourced from EU NRV (Nutrient Reference Values, EFSA) and US DRI / NIH ODS
 * for nutrients without an EU value (chromium, biotin, etc.).
 *
 * Used by:
 *   - `NutritionDetail.tsx` Vitaminas / Minerales tabs (display + % RDA chip)
 *   - Future micronutrient backfill aggregation
 *
 * Extracting this out of the screen file:
 *   - keeps screen files focused on layout/composition
 *   - makes the data testable and importable by other surfaces
 *   - matches feature-first convention (`src/features/<domain>/data/`)
 *
 * Each entry: `{ rda: number, unit: 'mg' | 'mcg' }`.
 *
 * Salt → sodium conversion factor: 1g salt (NaCl) ≈ 400 mg sodium.
 */

/** Reference Daily Allowance (EU NRV / EFSA, US DRI fallback). */
export const VITAMIN_RDAS = {
  vitaminA:        { rda: 900, unit: 'mcg' },  // µg RAE
  vitaminD:        { rda: 20,  unit: 'mcg' },  // 800 IU
  vitaminE:        { rda: 15,  unit: 'mg'  },  // α-tocopherol
  vitaminK:        { rda: 120, unit: 'mcg' },
  vitaminC:        { rda: 90,  unit: 'mg'  },
  thiamin:         { rda: 1.2, unit: 'mg'  },  // B1
  riboflavin:      { rda: 1.3, unit: 'mg'  },  // B2
  niacin:          { rda: 16,  unit: 'mg'  },  // B3
  pantothenicAcid: { rda: 5,   unit: 'mg'  },  // B5
  vitaminB6:       { rda: 1.7, unit: 'mg'  },
  biotin:          { rda: 30,  unit: 'mcg' },  // B7
  folate:          { rda: 400, unit: 'mcg' },  // B9
  vitaminB12:      { rda: 2.4, unit: 'mcg' },
} as const;

export type VitaminKey = keyof typeof VITAMIN_RDAS;

export const MINERAL_RDAS = {
  calcium:    { rda: 1000, unit: 'mg' },
  phosphorus: { rda: 700,  unit: 'mg' },
  magnesium:  { rda: 420,  unit: 'mg' },
  sodium:     { rda: 2300, unit: 'mg' },
  potassium:  { rda: 3500, unit: 'mg' },
  chloride:   { rda: 2300, unit: 'mg' },
  iron:       { rda: 18,   unit: 'mg' },
  zinc:       { rda: 11,   unit: 'mg' },
  iodine:     { rda: 150,  unit: 'mcg' },
  selenium:   { rda: 55,   unit: 'mcg' },
  copper:     { rda: 0.9,  unit: 'mg' },
  manganese:  { rda: 2.3,  unit: 'mg' },
  chromium:   { rda: 35,   unit: 'mcg' },
  molybdenum: { rda: 45,   unit: 'mcg' },
} as const;

export type MineralKey = keyof typeof MINERAL_RDAS;

/**
 * Conversion factor: 1g of salt (NaCl, sodium chloride) ≈ 400 mg of sodium.
 * (Salt is ~40% sodium by mass: Na atomic weight 23, Cl 35.5 → 23/58.5 ≈ 0.394.)
 *
 * Used to estimate sodium intake from dietary salt totals when individual
 * sodium values aren't tracked at meal level.
 */
export const SALT_TO_SODIUM_MG_FACTOR = 400;

/**
 * Default fiber intake target (g/day) — WHO recommendation for adults.
 * Used as a fallback when the user's profile doesn't provide an explicit
 * fiber target.
 */
export const DEFAULT_FIBER_TARGET_G = 30;
