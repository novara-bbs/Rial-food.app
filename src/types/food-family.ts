/**
 * FoodFamily + FoodVariant — the "primary food + variants" model.
 *
 * A `FoodFamily` is the umbrella / canonical concept ("Pollo", "Aguacate",
 * "Yogur griego"). It has exactly one `canonicalVariantId` — the variant used
 * by default when the UI or a recipe needs macros but no explicit pin.
 *
 * A `FoodVariant` is the concrete entity carrying macros + micros + serving
 * sizes. Variants live under their family via `familyId`. `variantType`
 * categorises the difference (cut / preparation / quality / regional / brand /
 * user / canonical) and the dictionary UI groups the family's variants by this
 * axis.
 *
 * This file is forward-looking: the seed in `src/features/food/data/` still
 * exposes the legacy flat `Ingredient[]` via a compat re-export. Consumers
 * that should eventually drill into variants (FoodDictionary, AddMeal,
 * BarcodeScanner, RecipeDetail) migrate phase-by-phase — see
 * `docs/market/food-variants-design.md`.
 */
import type {
  Allergen,
  FoodTag,
  IngredientCategory,
  Macros,
  Micronutrients,
  ServingSize,
} from './food';

/**
 * Semantic axis of variation between sibling variants under a family.
 *
 * - `canonical` — the USDA / standard reference. Exactly one per family.
 *   Recipes render against this unless explicitly pinned.
 * - `cut` — different anatomical part (breast / thigh / wing).
 * - `preparation` — same part, different state (raw / cooked / grilled).
 * - `quality` — provenance or grade (free-range / grass-fed / organic).
 * - `regional` — preparation tied to a cuisine ("tikka", "al ajillo").
 * - `brand` — concrete retail product with a brand + optional barcode.
 *   Almost always arrives through a barcode scan (OFF lookup).
 * - `user` — a fully custom variant created by the user (e.g. a home-cooked
 *   recipe's macro breakdown they reuse as a shortcut).
 */
export type VariantType =
  | 'canonical'
  | 'cut'
  | 'preparation'
  | 'quality'
  | 'regional'
  | 'brand'
  | 'user';

export const VARIANT_TYPES: readonly VariantType[] = [
  'canonical',
  'cut',
  'preparation',
  'quality',
  'regional',
  'brand',
  'user',
] as const;

/**
 * Where a variant's data came from. Drives provenance badges and deduplication
 * decisions (e.g. `off` variants are candidates for promotion to `seed` once
 * enough users scan the same barcode; that is a Q6 backend concern).
 */
export type FoodSource = 'seed' | 'user' | 'off' | 'edamam';

export const FOOD_SOURCES: readonly FoodSource[] = ['seed', 'user', 'off', 'edamam'] as const;

/** Metadata captured when a variant represents a concrete retail product. */
export interface VariantBrand {
  name: string;
  /** Barcode (typically EAN-13 / GS1 GTIN). Enables scan-to-find under family. */
  barcode?: string;
  /** `true` if this variant was created via the BarcodeScanner. */
  scanned?: boolean;
}

/**
 * The umbrella / canonical concept. 1 family → N variants. Every family has
 * exactly one `canonicalVariantId` — the variant that acts as the "reference"
 * macros for the family.
 */
export interface FoodFamily {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: IngredientCategory;

  /**
   * Variant rendered as the family's "primary" face. Typically the USDA /
   * standard-reference entry for the food (e.g. raw cut for meats, natural
   * unsweetened for yoghurts). Must be a member of `variantIds`.
   */
  canonicalVariantId: string;

  /** All variants that belong to this family. Ordered by UI preference. */
  variantIds: string[];

  /** Fuzzy-search aliases ('pollo', 'chicken', 'ave'). */
  aliases?: string[];

  /** Tags inherited by variants unless a variant overrides them. */
  tags: FoodTag[];
}

/**
 * The concrete, macros-bearing entity. Variants replace flat `Ingredient`
 * entries as the source of truth for nutrition; the legacy `Ingredient`
 * shape is preserved as a compat projection during the migration phases.
 */
export interface FoodVariant {
  id: string;
  /** Backlink to the family. Required. */
  familyId: string;

  name: string;
  nameEn: string;
  /**
   * Short explainer that differentiates this variant from the canonical
   * (e.g. "Sin piel y horneada 20 min a 180°C"). Rendered under the variant
   * name in the dictionary drill-down. Optional — the type conveys most of
   * the semantics.
   */
  description?: string;
  descriptionEn?: string;

  variantType: VariantType;

  /** Populated when `variantType === 'brand'` (or a user-scanned product). */
  brand?: VariantBrand;

  baseAmount: number; // always 100 (parity with Ingredient)
  baseUnit: string; // 'g' or 'ml'
  servingSizes: ServingSize[];
  macros: Macros;
  micros: Micronutrients;

  /** Override of the family's tags. When absent, inherit from family. */
  tags?: FoodTag[];
  /** Variant-specific allergens. Always explicit (never inherited). */
  allergens: Allergen[];

  source: FoodSource;
  /** Upstream id (OFF barcode, Edamam id, etc.). Useful for dedup + refresh. */
  sourceId?: string;
  /** epoch ms — only populated for user-created variants. */
  createdAt?: number;
}

/**
 * A macro delta computed from a variant against its family's canonical
 * reference. Signed values in the variant's native units. `null` when no
 * canonical is available (should not happen for well-formed families).
 */
export interface MacroDelta {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}
