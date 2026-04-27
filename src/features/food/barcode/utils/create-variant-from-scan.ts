/**
 * Utility: build a brand FoodVariant from a scanned product + a family match.
 *
 * Extracted from BarcodeScanner.tsx (Phase 3.3, ADR-015).
 * Pure function — no side effects, no React.
 */
import { getCanonicalVariant } from '../../utils/food-family-resolver';
import type { FoodVariant, FoodFamily } from '../../../../types/food-family';
import type { ScannedProduct } from '../../utils/pseudo-ingredient';

export function createVariantFromScan(
  product: ScannedProduct,
  family: FoodFamily,
): FoodVariant {
  const canonical = getCanonicalVariant(family.id);
  const barcode =
    product.barcode && !product.barcode.startsWith('custom_')
      ? product.barcode
      : undefined;
  const id = barcode ? `off_${barcode}` : `user_${Date.now()}`;
  return {
    id,
    familyId: family.id,
    name: product.name,
    nameEn: product.name,
    variantType: 'brand',
    brand: { name: product.brand || 'Marca desconocida', barcode, scanned: true },
    baseAmount: canonical?.baseAmount ?? 100,
    baseUnit: canonical?.baseUnit ?? 'g',
    servingSizes: product.servingSizes?.length
      ? product.servingSizes
      : (canonical?.servingSizes ?? []),
    macros: {
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fats: product.fats,
      saturatedFat: product.saturatedFat,
      sugar: product.sugar,
    },
    micros: canonical?.micros ?? { vitamins: {}, minerals: {}, others: {} },
    allergens: canonical?.allergens ?? [],
    tags: canonical?.tags ?? [],
    source: 'off',
  };
}
