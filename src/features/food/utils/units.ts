/**
 * Unit system utilities — converts between metric (g/ml) and imperial (oz/fl oz).
 * Internal storage is ALWAYS grams. Conversion happens on display only.
 */

export type UnitSystem = 'metric' | 'imperial';

// ─── Conversion constants ───────────────────────────────────────────────────

const GRAMS_PER_OZ = 28.3495;
const ML_PER_FL_OZ = 29.5735;

// ─── Display helpers ────────────────────────────────────────────────────────

/** Format grams/ml for display based on user's unit system */
export function formatWeight(
  grams: number,
  unitSystem: UnitSystem,
  baseUnit: string = 'g',
): string {
  if (unitSystem === 'imperial') {
    if (baseUnit === 'ml') {
      const flOz = grams / ML_PER_FL_OZ;
      return flOz >= 10
        ? `${Math.round(flOz)} fl oz`
        : `${+flOz.toFixed(1)} fl oz`;
    }
    const oz = grams / GRAMS_PER_OZ;
    if (oz >= 16) {
      const lb = oz / 16;
      return lb >= 10
        ? `${Math.round(lb)} lb`
        : `${+lb.toFixed(1)} lb`;
    }
    return oz >= 10
      ? `${Math.round(oz)} oz`
      : `${+oz.toFixed(1)} oz`;
  }
  // Metric — show as-is
  const unit = baseUnit === 'ml' ? 'ml' : 'g';
  return `${grams}${unit}`;
}

/** Get the display unit label for the current system */
export function getWeightUnit(unitSystem: UnitSystem, baseUnit: string = 'g'): string {
  if (unitSystem === 'imperial') {
    return baseUnit === 'ml' ? 'fl oz' : 'oz';
  }
  return baseUnit === 'ml' ? 'ml' : 'g';
}

/** Convert display value (what user types) back to internal grams */
export function toGrams(
  displayValue: number,
  unitSystem: UnitSystem,
  baseUnit: string = 'g',
): number {
  if (unitSystem === 'imperial') {
    return baseUnit === 'ml'
      ? +(displayValue * ML_PER_FL_OZ).toFixed(1)
      : +(displayValue * GRAMS_PER_OZ).toFixed(1);
  }
  return displayValue;
}

/** Convert grams to display value (for showing in input fields) */
export function fromGrams(
  grams: number,
  unitSystem: UnitSystem,
  baseUnit: string = 'g',
): number {
  if (unitSystem === 'imperial') {
    return baseUnit === 'ml'
      ? +(grams / ML_PER_FL_OZ).toFixed(1)
      : +(grams / GRAMS_PER_OZ).toFixed(1);
  }
  return grams;
}

/** Quick weight presets for the Peso mode (in display units) */
export function getQuickWeights(unitSystem: UnitSystem, baseUnit: string = 'g'): number[] {
  if (unitSystem === 'imperial') {
    return baseUnit === 'ml'
      ? [2, 4, 8, 12, 16]     // fl oz — common US liquid measurements
      : [1, 2, 4, 6, 8];      // oz — common US food weights
  }
  return [50, 100, 150, 200, 250]; // grams — metric default
}

/** Weight step for the ±stepper button (in display units) */
export function getWeightStep(unitSystem: UnitSystem): number {
  return unitSystem === 'imperial' ? 1 : 10; // ±1 oz or ±10g
}

// ─── Body weight / height conversions ──────────────────────────────────────
// Internal storage is ALWAYS metric (kg / cm). Conversion happens on display.

const KG_PER_LB = 0.453592;
const CM_PER_INCH = 2.54;

/** Format body weight for display: "72.5 kg" or "159.8 lb" */
export function formatBodyWeight(kg: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'imperial') {
    return `${+(kg / KG_PER_LB).toFixed(1)} lb`;
  }
  return `${+kg.toFixed(1)} kg`;
}

/** Convert display value → kg for storage */
export function bodyWeightToKg(displayValue: number, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') return +(displayValue * KG_PER_LB).toFixed(2);
  return displayValue;
}

/** Convert stored kg → display value */
export function bodyWeightFromKg(kg: number, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') return +(kg / KG_PER_LB).toFixed(1);
  return kg;
}

/** Convert display height → cm for storage */
export function heightToCm(displayValue: number, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') return +(displayValue * CM_PER_INCH).toFixed(1);
  return displayValue;
}

/** Convert stored cm → display value */
export function heightFromCm(cm: number, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') return +(cm / CM_PER_INCH).toFixed(1);
  return cm;
}

/** Unit label for body weight: "kg" | "lb" */
export function getBodyWeightUnit(unitSystem: UnitSystem): string {
  return unitSystem === 'imperial' ? 'lb' : 'kg';
}

/** Unit label for height: "cm" | "in" */
export function getHeightUnit(unitSystem: UnitSystem): string {
  return unitSystem === 'imperial' ? 'in' : 'cm';
}
