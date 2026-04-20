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
 * Note: `'cut'` was intentionally removed in P2.5 — anatomical parts
 * (pechuga vs muslo vs clara) are **productos distintos**, not variantes
 * of the same product. Cuts live as separate families under the same
 * subcategory (e.g. `fam_chicken_breast` + `fam_chicken_thigh` under
 * `subcategory: 'aves'`). See `docs/market/food-variants-design.md`.
 *
 * - `canonical` — the USDA / standard reference. Exactly one per family.
 *   Recipes render against this unless explicitly pinned.
 * - `preparation` — same product, different state (raw / cooked / grilled;
 *   fresh / canned).
 * - `quality` — provenance or grade attribute of the same product
 *   (full-fat / 0% fat; refined / whole-grain of the same cereal; with /
 *   without sugar).
 * - `regional` — preparation tied to a cuisine or style ("tikka",
 *   "al ajillo", lager vs IPA, tinto vs blanco).
 * - `brand` — concrete retail product with a brand + optional barcode.
 *   Almost always arrives through a barcode scan (OFF lookup).
 * - `user` — a fully custom variant created by the user (e.g. a home-cooked
 *   recipe's macro breakdown they reuse as a shortcut).
 *
 * Orthogonal attributes (organic / free-range / light / sugar-free / etc.)
 * live in {@link FoodVariant.qualityTags}, NOT here — a same variant can
 * carry both `variantType: 'brand'` AND `qualityTags: ['free-range',
 * 'organic']` simultaneously.
 */
export type VariantType =
  | 'canonical'
  | 'preparation'
  | 'quality'
  | 'regional'
  | 'brand'
  | 'user';

export const VARIANT_TYPES: readonly VariantType[] = [
  'canonical',
  'preparation',
  'quality',
  'regional',
  'brand',
  'user',
] as const;

/**
 * Orthogonal variant attributes — independent of {@link VariantType}.
 *
 * A variant can carry ≥0 of these in addition to its primary `variantType`.
 * Rendered as chips below the variant name in the Dictionary drill-down.
 * Distinct from `variantType` because these are **filter-able cross-axes**
 * (the user wants "organic yogurt across all brands", not "only brand
 * variants"), while `variantType` is the **discriminating axis in the
 * variant list** (what differentiates this variant from the canonical).
 *
 * Labels resolved via `t.foodDictionary.qualityTagLabels.{slug}`.
 */
export type QualityTagSlug =
  | 'organic'
  | 'free-range'
  | 'grass-fed'
  | 'light'
  | 'sugar-free'
  | 'lactose-free'
  | 'gluten-free'
  | 'high-protein'
  | 'no-additives';

export const QUALITY_TAG_SLUGS: readonly QualityTagSlug[] = [
  'organic',
  'free-range',
  'grass-fed',
  'light',
  'sugar-free',
  'lactose-free',
  'gluten-free',
  'high-protein',
  'no-additives',
] as const;

/**
 * P8 `[1.5.65]` — culinary use slugs for the enriched FoodDetail view.
 *
 * Each FoodFamily can declare 5-8 culinary contexts where it fits ("En ensaladas",
 * "A la plancha", "Post-entreno", …). Renders as filter-friendly chips on the
 * FoodDetail screen and feeds the (future) recipe recommender.
 *
 * Labels resolved via `t.foodDictionary.culinaryUseLabels.{slug}` in ES + EN.
 */
export type CulinaryUseSlug =
  | 'raw-salads'
  | 'grilling'
  | 'baking'
  | 'roasting'
  | 'stir-fry'
  | 'stews-soups'
  | 'smoothies'
  | 'breakfast'
  | 'snack'
  | 'dessert'
  | 'spread'
  | 'dressing'
  | 'batch-cooking'
  | 'meal-prep'
  | 'post-workout'
  | 'pre-workout';

export const CULINARY_USE_SLUGS: readonly CulinaryUseSlug[] = [
  'raw-salads',
  'grilling',
  'baking',
  'roasting',
  'stir-fry',
  'stews-soups',
  'smoothies',
  'breakfast',
  'snack',
  'dessert',
  'spread',
  'dressing',
  'batch-cooking',
  'meal-prep',
  'post-workout',
  'pre-workout',
] as const;

/**
 * P8 `[1.5.65]` — rationale slug explaining why a sustitute is suggested.
 * Rendered inline ("Macros parecidos", "Más barato", …). Cerrar el set
 * evita string drift en el contenido generado por LLM.
 *
 * Labels resolved via `t.foodDictionary.substituteReasons.{slug}`.
 */
export type SubstituteReason =
  | 'similar-macros'
  | 'similar-flavor'
  | 'cheaper'
  | 'higher-protein'
  | 'lower-cal'
  | 'lactose-free'
  | 'gluten-free'
  | 'plant-based';

export const SUBSTITUTE_REASONS: readonly SubstituteReason[] = [
  'similar-macros',
  'similar-flavor',
  'cheaper',
  'higher-protein',
  'lower-cal',
  'lactose-free',
  'gluten-free',
  'plant-based',
] as const;

/** P8 — single substitute reference on a FoodFamily. */
export interface SubstituteRef {
  /** Target FoodFamily id. Must exist in FOOD_FAMILIES (guarded by test). */
  familyId: string;
  reason: SubstituteReason;
}

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
 * The umbrella / canonical concept — i.e. a **producto culinario** (in the
 * owner's vocabulary). 1 family → N variants. Every family has exactly one
 * `canonicalVariantId` — the variant that acts as the "reference" macros
 * for the family.
 *
 * Rule of thumb: if you would buy it in a separate aisle of the supermarket,
 * it is its own family. Pechuga de pollo, muslo de pollo, clara de huevo,
 * arroz integral and arroz basmati are each distinct families — NOT variants
 * of a shared umbrella.
 */
export interface FoodFamily {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: IngredientCategory;

  /**
   * Optional grouping between `category` (L1, `IngredientCategory`) and
   * `family` (L3, this interface). Slug in kebab-case (`'aves'`,
   * `'queso-curado'`, `'cruciferas'`). When undefined, the family renders
   * flat under its category (used for small / homogeneous categories such
   * as `oils`, `legumes`, `supplements`).
   *
   * The set of valid slugs is defined by the `FAMILY_SUBCATEGORY` map in
   * `src/features/food/data/food-families.ts` and must have symmetric i18n
   * labels under `t.foodDictionary.subcategoryLabels[slug]` in ES + EN.
   * Integrity is enforced by `food-families.test.ts`.
   */
  subcategory?: string;

  /**
   * P7 `[1.5.62]` — optional species tag inside a subcategory. Kebab-case slug
   * (`'chicken'`, `'turkey'`, `'beef'`, `'salmon'`, …). When ≥2 families in the
   * same subcategory share the same species, the Dictionary renders a species
   * subheader `<h5>` above those families (USDA 4-tier poultry pattern:
   * Kind → Class → Style → Type; retail Carrefour Carnicería→Pollo/Pavo). When
   * only 1 family carries a given species, rendering stays flat.
   *
   * Populated via `FAMILY_SPECIES` in `food-families.ts`. Labels resolved via
   * `t.foodDictionary.speciesLabels[slug]` in ES + EN. Purely a render-time
   * concern — no persistence / migration impact.
   */
  species?: string;

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

  /**
   * P8 `[1.5.65]` — visual identity of the family. Emoji recommended (widest
   * Unicode coverage + zero bundle cost); string id reserved for custom SVG
   * when emoji doesn't fit (e.g. `'svg:tempeh'` → loads from assets at render
   * time). Populated via `FAMILY_IMAGES` map in `family-images.ts`; falls back
   * to the generic plate emoji when missing.
   */
  image?: string;

  /**
   * P8 `[1.5.65]` — educational description (120-180 words) covering origin,
   * nutritional profile, production method and a curious fact. Bilingual:
   * `es` mandatory when present, `en` mandatory when present. Bootstrapped via
   * `scripts/generate-family-content.mjs` (Gemini) and committed for admin
   * review in `family-content.generated.ts`. Rendered in `FoodDetail` but
   * optional everywhere — families without a long description fall back to
   * the short `description`.
   */
  longDescription?: { es: string; en: string };

  /**
   * P8 `[1.5.65]` — 5-8 culinary contexts where this food fits well.
   * Chosen from {@link CULINARY_USE_SLUGS}. Rendered as chips on FoodDetail.
   * Feeds the (future) recipe recommender.
   */
  culinaryUses?: CulinaryUseSlug[];

  /**
   * P8 `[1.5.65]` — 3-5 curated substitutes for this family. Rendered as
   * "¿Sin yogur griego? Prueba…" on FoodDetail, each row tap-able to open the
   * target family's detail. `familyId` must exist in FOOD_FAMILIES.
   */
  substitutes?: SubstituteRef[];
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

  /**
   * Orthogonal attributes independent of `variantType`. A variant can carry
   * multiple tags simultaneously (e.g. `variantType: 'brand'` +
   * `qualityTags: ['free-range', 'organic']` = branded free-range organic
   * product). Rendered as secondary chips under the variant name; usable as
   * cross-variant filters ("organic yogurts across all brands"). See
   * {@link QUALITY_TAG_SLUGS} for the closed set.
   */
  qualityTags?: QualityTagSlug[];

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
