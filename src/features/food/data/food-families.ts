/**
 * FoodFamily seed — derived from the flat INGREDIENT_DICTIONARY.
 *
 * Source of truth for clustering is the `VARIANT_MAP` below: each legacy
 * `Ingredient.id` maps to `{familyId, variantType}`. Every id in
 * `INGREDIENT_DICTIONARY` must appear in `VARIANT_MAP` — the integrity test
 * in `food-families.test.ts` asserts this.
 *
 * Families are built by grouping ingredients that share a `familyId`. Each
 * group's `canonicalVariantId` is the member with `variantType: 'canonical'`
 * (exactly one per family, also asserted). Family metadata (display name,
 * aliases, richer description override) lives in `FAMILY_META`; for singleton
 * families the display name + description are reused from the canonical
 * variant so we don't duplicate copy.
 *
 * P2.5 scope — taxonomic refinement:
 * - `variantType: 'cut'` removed. Cuts (pechuga vs muslo, filete vs molida)
 *   are distinct culinary products, NOT variants of a shared umbrella. They
 *   now each live as their own family (`fam_chicken_breast` / `fam_beef_ground`
 *   / `fam_beef_steak` / `fam_egg_whole` / `fam_egg_whites`).
 * - `fam_rice`, `fam_bread` split into `_white`/`_brown` and `_white`/
 *   `_wholewheat` respectively (refined vs whole grain — different fiber /
 *   glycemic index profile, bought in different aisles).
 * - `fam_almond` / `fam_peanut` keep their id for the whole-nut product; the
 *   butter variants promote to their own `fam_*_butter` families (distinct
 *   subcategory `mantecas-pastas`).
 * - New subcategory level (L2) between `category` (L1) and `family` (L3).
 *   See `FAMILY_SUBCATEGORY` below.
 * - New family `fam_yogurt` (canonical = `dai_plain_yogurt`) — closes the
 *   "natural yogurt" gap so "Griego → Natural → Kéfir" is a real
 *   intra-subcategory swap path.
 *
 * Resolver helpers live in `../utils/food-family-resolver.ts`; the dictionary
 * UI consumes both.
 */
import type {
  FoodFamily,
  QualityTagSlug,
  VariantBrand,
  VariantType,
} from '../../../types/food-family';
import type { FoodTag, IngredientCategory, Macros } from '../../../types/food';
import { INGREDIENT_DICTIONARY } from './ingredients';
import { getFamilyImage } from './family-images';
import { FAMILY_CONTENT } from './family-content.generated';

/**
 * Legacy ingredient id → {familyId, variantType}.
 *
 * Post-P2.5 multi-variant families (same-product axis):
 * - `fam_chicken_breast` (raw / cooked — same cut, preparation)
 * - `fam_tuna` (fresh / canned — same fish, packaging)
 * - `fam_milk` (whole / skim — same product, fat content)
 * - `fam_greek_yogurt` (full / 0% — same product, quality)
 * - `fam_coffee` (black / with milk — same brew, addition)
 * - `fam_wine` (red / white — same wine family, grape regional)
 * - `fam_cola` (regular / zero — same drink, quality)
 * - `fam_beer` (lager / IPA — same beer, regional style)
 *
 * Post-P2.5 singletons where the former umbrella was split into distinct
 * products: `fam_chicken_breast` (was part of `fam_chicken`, renamed),
 * `fam_beef_ground` + `fam_beef_steak` (split from `fam_beef`), `fam_egg_whole`
 * + `fam_egg_whites` (split from `fam_egg`), `fam_rice_white` + `fam_rice_brown`
 * (split from `fam_rice`), `fam_bread_white` + `fam_bread_wholewheat` (split
 * from `fam_bread`), `fam_almond_butter` + `fam_peanut_butter` (split from
 * `fam_almond` / `fam_peanut`), `fam_yogurt` (new — closes natural-yogurt gap).
 */
const VARIANT_MAP: Record<string, { familyId: string; variantType: VariantType }> = {
  // Proteins — multi-variant
  pro_chicken_breast_raw:    { familyId: 'fam_chicken_breast', variantType: 'canonical' },
  pro_chicken_breast_cooked: { familyId: 'fam_chicken_breast', variantType: 'preparation' },
  // P2.6 chicken cuts — sibling families bajo `subcategory: 'aves'`. Cortes
  // distintos que el usuario español busca por separado en la bandeja del
  // super (Mercadona/Lidl/Carrefour), con macros propios:
  // muslo +40% grasa vs pechuga, ala +30% grasa vs muslo, pollo entero asado
  // el único producto habitualmente consumido ya cocinado (no raw canonical).
  pro_chicken_thigh_raw:        { familyId: 'fam_chicken_thigh',     variantType: 'canonical' },
  pro_chicken_thigh_cooked:     { familyId: 'fam_chicken_thigh',     variantType: 'preparation' },
  pro_chicken_drumstick_raw:    { familyId: 'fam_chicken_drumstick', variantType: 'canonical' },
  pro_chicken_drumstick_cooked: { familyId: 'fam_chicken_drumstick', variantType: 'preparation' },
  pro_chicken_wing_raw:         { familyId: 'fam_chicken_wing',      variantType: 'canonical' },
  pro_chicken_wing_cooked:      { familyId: 'fam_chicken_wing',      variantType: 'preparation' },
  pro_chicken_whole_roasted:    { familyId: 'fam_chicken_whole',     variantType: 'canonical' },
  pro_tuna_fresh:            { familyId: 'fam_tuna',           variantType: 'canonical' },
  pro_tuna_canned:           { familyId: 'fam_tuna',           variantType: 'preparation' },
  // Proteins — split products (P2.5 — formerly `fam_beef` / `fam_egg`)
  pro_beef_ground_90:        { familyId: 'fam_beef_ground',    variantType: 'canonical' },
  pro_beef_steak:            { familyId: 'fam_beef_steak',     variantType: 'canonical' },
  pro_eggs:                  { familyId: 'fam_egg_whole',      variantType: 'canonical' },
  pro_egg_whites:            { familyId: 'fam_egg_whites',     variantType: 'canonical' },
  // Proteins — singletons
  pro_turkey_breast:         { familyId: 'fam_turkey_breast',  variantType: 'canonical' },
  pro_pork_loin:             { familyId: 'fam_pork_loin',      variantType: 'canonical' },
  pro_salmon:                { familyId: 'fam_salmon',         variantType: 'canonical' },
  pro_cod:                   { familyId: 'fam_cod',            variantType: 'canonical' },
  pro_sea_bass:              { familyId: 'fam_sea_bass',       variantType: 'canonical' },
  pro_shrimp:                { familyId: 'fam_shrimp',         variantType: 'canonical' },
  pro_squid:                 { familyId: 'fam_squid',          variantType: 'canonical' },
  pro_sardines:              { familyId: 'fam_sardines',       variantType: 'canonical' },
  pro_tofu:                  { familyId: 'fam_tofu',           variantType: 'canonical' },
  pro_tempeh:                { familyId: 'fam_tempeh',         variantType: 'canonical' },
  pro_seitan:                { familyId: 'fam_seitan',         variantType: 'canonical' },
  pro_jamon_serrano:         { familyId: 'fam_jamon_serrano',  variantType: 'canonical' },
  pro_lamb:                  { familyId: 'fam_lamb',           variantType: 'canonical' },
  pro_rabbit:                { familyId: 'fam_rabbit',         variantType: 'canonical' },

  // Vegetables — all singletons
  veg_spinach:         { familyId: 'fam_spinach',         variantType: 'canonical' },
  veg_broccoli:        { familyId: 'fam_broccoli',        variantType: 'canonical' },
  veg_cauliflower:     { familyId: 'fam_cauliflower',     variantType: 'canonical' },
  veg_carrot:          { familyId: 'fam_carrot',          variantType: 'canonical' },
  veg_zucchini:        { familyId: 'fam_zucchini',        variantType: 'canonical' },
  veg_bell_pepper_red: { familyId: 'fam_bell_pepper_red', variantType: 'canonical' },
  veg_tomato:          { familyId: 'fam_tomato',          variantType: 'canonical' },
  veg_onion:           { familyId: 'fam_onion',           variantType: 'canonical' },
  veg_garlic:          { familyId: 'fam_garlic',          variantType: 'canonical' },
  veg_eggplant:        { familyId: 'fam_eggplant',        variantType: 'canonical' },
  veg_green_beans:     { familyId: 'fam_green_beans',     variantType: 'canonical' },
  veg_asparagus:       { familyId: 'fam_asparagus',       variantType: 'canonical' },
  veg_mushroom:        { familyId: 'fam_mushroom',        variantType: 'canonical' },
  veg_avocado:         { familyId: 'fam_avocado',         variantType: 'canonical' },
  veg_lettuce:         { familyId: 'fam_lettuce',         variantType: 'canonical' },
  veg_arugula:         { familyId: 'fam_arugula',         variantType: 'canonical' },
  veg_cucumber:        { familyId: 'fam_cucumber',        variantType: 'canonical' },
  veg_kale:            { familyId: 'fam_kale',            variantType: 'canonical' },
  veg_sweet_potato:    { familyId: 'fam_sweet_potato',    variantType: 'canonical' },
  veg_potato:          { familyId: 'fam_potato',          variantType: 'canonical' },
  veg_pumpkin:         { familyId: 'fam_pumpkin',         variantType: 'canonical' },
  veg_chard:           { familyId: 'fam_chard',           variantType: 'canonical' },
  veg_leek:            { familyId: 'fam_leek',            variantType: 'canonical' },
  veg_corn:            { familyId: 'fam_corn',            variantType: 'canonical' },
  veg_peas:            { familyId: 'fam_peas',            variantType: 'canonical' },
  veg_beetroot:        { familyId: 'fam_beetroot',        variantType: 'canonical' },
  veg_artichoke:       { familyId: 'fam_artichoke',       variantType: 'canonical' },
  veg_celery:          { familyId: 'fam_celery',          variantType: 'canonical' },

  // Fruits — all singletons
  fru_banana:     { familyId: 'fam_banana',     variantType: 'canonical' },
  fru_apple:      { familyId: 'fam_apple',      variantType: 'canonical' },
  fru_orange:     { familyId: 'fam_orange',     variantType: 'canonical' },
  fru_strawberry: { familyId: 'fam_strawberry', variantType: 'canonical' },
  fru_blueberry:  { familyId: 'fam_blueberry',  variantType: 'canonical' },
  fru_mango:      { familyId: 'fam_mango',      variantType: 'canonical' },
  fru_pineapple:  { familyId: 'fam_pineapple',  variantType: 'canonical' },
  fru_kiwi:       { familyId: 'fam_kiwi',       variantType: 'canonical' },
  fru_watermelon: { familyId: 'fam_watermelon', variantType: 'canonical' },
  fru_pear:       { familyId: 'fam_pear',       variantType: 'canonical' },
  fru_raspberry:  { familyId: 'fam_raspberry',  variantType: 'canonical' },
  fru_grape:      { familyId: 'fam_grape',      variantType: 'canonical' },
  fru_date:       { familyId: 'fam_date',       variantType: 'canonical' },
  fru_lemon:      { familyId: 'fam_lemon',      variantType: 'canonical' },

  // Grains — split products (P2.5 — formerly `fam_rice` / `fam_bread`) + singletons
  gra_white_rice:         { familyId: 'fam_rice_white',       variantType: 'canonical' },
  gra_brown_rice:         { familyId: 'fam_rice_brown',       variantType: 'canonical' },
  gra_whole_wheat_bread:  { familyId: 'fam_bread_wholewheat', variantType: 'canonical' },
  gra_white_bread:        { familyId: 'fam_bread_white',      variantType: 'canonical' },
  gra_quinoa:             { familyId: 'fam_quinoa',           variantType: 'canonical' },
  gra_oats:               { familyId: 'fam_oats',             variantType: 'canonical' },
  gra_pasta:              { familyId: 'fam_pasta',            variantType: 'canonical' },
  gra_couscous:           { familyId: 'fam_couscous',         variantType: 'canonical' },
  gra_buckwheat:          { familyId: 'fam_buckwheat',        variantType: 'canonical' },
  gra_tortilla_wrap:      { familyId: 'fam_tortilla_wrap',    variantType: 'canonical' },

  // Legumes — all singletons
  leg_lentils:      { familyId: 'fam_lentils',      variantType: 'canonical' },
  leg_chickpeas:    { familyId: 'fam_chickpeas',    variantType: 'canonical' },
  leg_black_beans:  { familyId: 'fam_black_beans',  variantType: 'canonical' },
  leg_white_beans:  { familyId: 'fam_white_beans',  variantType: 'canonical' },
  leg_edamame:      { familyId: 'fam_edamame',      variantType: 'canonical' },
  leg_soy_textured: { familyId: 'fam_soy_textured', variantType: 'canonical' },

  // Dairy — multi-variant (milk, greek yogurt) + new yogurt family (P2.5) + singletons
  dai_whole_milk:     { familyId: 'fam_milk',           variantType: 'canonical' },
  dai_skim_milk:      { familyId: 'fam_milk',           variantType: 'quality' },
  dai_greek_yogurt:   { familyId: 'fam_greek_yogurt',   variantType: 'canonical' },
  dai_greek_yogurt_0: { familyId: 'fam_greek_yogurt',   variantType: 'quality' },
  dai_plain_yogurt:   { familyId: 'fam_yogurt',         variantType: 'canonical' },
  dai_cottage_cheese: { familyId: 'fam_cottage_cheese', variantType: 'canonical' },
  dai_fresh_cheese:   { familyId: 'fam_fresh_cheese',   variantType: 'canonical' },
  dai_cured_cheese:   { familyId: 'fam_cured_cheese',   variantType: 'canonical' },
  dai_mozzarella:     { familyId: 'fam_mozzarella',     variantType: 'canonical' },
  dai_parmesan:       { familyId: 'fam_parmesan',       variantType: 'canonical' },
  dai_butter:         { familyId: 'fam_butter',         variantType: 'canonical' },
  dai_kefir:          { familyId: 'fam_kefir',          variantType: 'canonical' },

  // Oils — all singletons
  oil_olive:   { familyId: 'fam_olive_oil',   variantType: 'canonical' },
  oil_coconut: { familyId: 'fam_coconut_oil', variantType: 'canonical' },
  oil_avocado: { familyId: 'fam_avocado_oil', variantType: 'canonical' },
  oil_sesame:  { familyId: 'fam_sesame_oil',  variantType: 'canonical' },
  oil_ghee:    { familyId: 'fam_ghee',        variantType: 'canonical' },

  // Nuts & seeds — split products (P2.5 — butter is a distinct product/subcategory)
  nut_almonds:       { familyId: 'fam_almond',         variantType: 'canonical' },
  nut_almond_butter: { familyId: 'fam_almond_butter',  variantType: 'canonical' },
  nut_peanuts:       { familyId: 'fam_peanut',         variantType: 'canonical' },
  nut_peanut_butter: { familyId: 'fam_peanut_butter',  variantType: 'canonical' },
  nut_walnuts:       { familyId: 'fam_walnuts',        variantType: 'canonical' },
  nut_cashews:       { familyId: 'fam_cashews',        variantType: 'canonical' },
  nut_pistachios:    { familyId: 'fam_pistachios',     variantType: 'canonical' },
  nut_tahini:        { familyId: 'fam_tahini',         variantType: 'canonical' },
  seed_chia:         { familyId: 'fam_chia',           variantType: 'canonical' },
  seed_flax:         { familyId: 'fam_flax',           variantType: 'canonical' },
  seed_pumpkin:      { familyId: 'fam_pumpkin_seed',   variantType: 'canonical' },
  seed_sunflower:    { familyId: 'fam_sunflower_seed', variantType: 'canonical' },

  // Pantry — all singletons
  pan_honey:               { familyId: 'fam_honey',               variantType: 'canonical' },
  pan_sugar:               { familyId: 'fam_sugar',               variantType: 'canonical' },
  pan_cocoa_powder:        { familyId: 'fam_cocoa_powder',        variantType: 'canonical' },
  pan_tomato_sauce:        { familyId: 'fam_tomato_sauce',        variantType: 'canonical' },
  pan_soy_sauce:           { familyId: 'fam_soy_sauce',           variantType: 'canonical' },
  pan_apple_cider_vinegar: { familyId: 'fam_apple_cider_vinegar', variantType: 'canonical' },
  pan_mustard:             { familyId: 'fam_mustard',             variantType: 'canonical' },
  pan_mayonnaise:          { familyId: 'fam_mayonnaise',          variantType: 'canonical' },
  pan_hummus:              { familyId: 'fam_hummus',               variantType: 'canonical' },
  pan_dark_chocolate:      { familyId: 'fam_dark_chocolate',      variantType: 'canonical' },

  // Prepared / plant-based — all singletons
  pre_almond_milk:   { familyId: 'fam_almond_milk',   variantType: 'canonical' },
  pre_oat_milk:      { familyId: 'fam_oat_milk',      variantType: 'canonical' },
  pre_protein_bar:   { familyId: 'fam_protein_bar',   variantType: 'canonical' },
  pre_granola:       { familyId: 'fam_granola',       variantType: 'canonical' },
  pre_coconut_water: { familyId: 'fam_coconut_water', variantType: 'canonical' },

  // Supplements — all singletons
  sup_whey_protein:  { familyId: 'fam_whey_protein',  variantType: 'canonical' },
  sup_vegan_protein: { familyId: 'fam_vegan_protein', variantType: 'canonical' },
  sup_creatine:      { familyId: 'fam_creatine',      variantType: 'canonical' },

  // Beverages — multi-variant (beer, cola, coffee, wine) + singletons
  bev_lager:            { familyId: 'fam_beer',             variantType: 'canonical' },
  bev_ipa:              { familyId: 'fam_beer',             variantType: 'regional' },
  bev_coca_cola:        { familyId: 'fam_cola',             variantType: 'canonical' },
  bev_coca_cola_zero:   { familyId: 'fam_cola',             variantType: 'quality' },
  bev_coffee_black:     { familyId: 'fam_coffee',           variantType: 'canonical' },
  bev_coffee_milk:      { familyId: 'fam_coffee',           variantType: 'preparation' },
  bev_red_wine:         { familyId: 'fam_wine',             variantType: 'canonical' },
  bev_white_wine:       { familyId: 'fam_wine',             variantType: 'regional' },
  bev_orange_juice:     { familyId: 'fam_orange_juice',     variantType: 'canonical' },
  bev_sparkling_water:  { familyId: 'fam_sparkling_water',  variantType: 'canonical' },
  bev_energy_drink:     { familyId: 'fam_energy_drink',     variantType: 'canonical' },
  bev_sports_drink:     { familyId: 'fam_sports_drink',     variantType: 'canonical' },

  // P12 [1.5.70] — Expansion de básicos España
  pro_hake:             { familyId: 'fam_hake',              variantType: 'canonical' },
  pro_trout:            { familyId: 'fam_trout',             variantType: 'canonical' },
  pro_anchovy:          { familyId: 'fam_anchovy',           variantType: 'canonical' },
  pro_sea_bream:        { familyId: 'fam_sea_bream',         variantType: 'canonical' },
  pro_mussels:          { familyId: 'fam_mussels',           variantType: 'canonical' },
  pro_clams:            { familyId: 'fam_clams',             variantType: 'canonical' },
  pro_octopus:          { familyId: 'fam_octopus',           variantType: 'canonical' },
  pro_ham_cooked:       { familyId: 'fam_ham_cooked',        variantType: 'canonical' },
  veg_bell_pepper_green:  { familyId: 'fam_bell_pepper_green',  variantType: 'canonical' },
  veg_bell_pepper_yellow: { familyId: 'fam_bell_pepper_yellow', variantType: 'canonical' },
  veg_radish:           { familyId: 'fam_radish',            variantType: 'canonical' },
  veg_spring_onion:     { familyId: 'fam_spring_onion',      variantType: 'canonical' },
  veg_endive:           { familyId: 'fam_endive',            variantType: 'canonical' },
  fru_tangerine:        { familyId: 'fam_tangerine',         variantType: 'canonical' },
  fru_peach:            { familyId: 'fam_peach',             variantType: 'canonical' },
  fru_plum:             { familyId: 'fam_plum',              variantType: 'canonical' },
  fru_cherry:           { familyId: 'fam_cherry',            variantType: 'canonical' },
  fru_raisin:           { familyId: 'fam_raisin',            variantType: 'canonical' },
  fru_pomegranate:      { familyId: 'fam_pomegranate',       variantType: 'canonical' },
  gra_barley:           { familyId: 'fam_barley',            variantType: 'canonical' },
  gra_rye:              { familyId: 'fam_rye',               variantType: 'canonical' },
  gra_bulgur:           { familyId: 'fam_bulgur',            variantType: 'canonical' },
  leg_kidney_beans:     { familyId: 'fam_kidney_beans',      variantType: 'canonical' },
  leg_pinto_beans:      { familyId: 'fam_pinto_beans',       variantType: 'canonical' },
  leg_fava_beans:       { familyId: 'fam_fava_beans',        variantType: 'canonical' },
  dai_skyr:             { familyId: 'fam_skyr',              variantType: 'canonical' },
  dai_ricotta:          { familyId: 'fam_ricotta',           variantType: 'canonical' },
  dai_manchego:         { familyId: 'fam_manchego',          variantType: 'canonical' },
  nut_hazelnut:         { familyId: 'fam_hazelnut',          variantType: 'canonical' },
  nut_sesame_seed:      { familyId: 'fam_sesame_seed',       variantType: 'canonical' },
  oil_sunflower:        { familyId: 'fam_sunflower_oil',     variantType: 'canonical' },
  pan_ketchup:          { familyId: 'fam_ketchup',           variantType: 'canonical' },
  pan_wine_vinegar:     { familyId: 'fam_wine_vinegar',      variantType: 'canonical' },
  pan_balsamic_vinegar: { familyId: 'fam_balsamic_vinegar',  variantType: 'canonical' },
  pan_pesto:            { familyId: 'fam_pesto',             variantType: 'canonical' },
  pan_jam:              { familyId: 'fam_jam',               variantType: 'canonical' },
  pan_salt:             { familyId: 'fam_salt',              variantType: 'canonical' },
  pan_black_pepper:     { familyId: 'fam_black_pepper',      variantType: 'canonical' },
  pan_paprika:          { familyId: 'fam_paprika',           variantType: 'canonical' },
  bev_water:            { familyId: 'fam_water',             variantType: 'canonical' },
  bev_green_tea:        { familyId: 'fam_green_tea',         variantType: 'canonical' },
  bev_black_tea:        { familyId: 'fam_black_tea',         variantType: 'canonical' },
  bev_gazpacho:         { familyId: 'fam_gazpacho',          variantType: 'canonical' },
};

/**
 * Family display metadata. For multi-variant families we pin a concept-level
 * name + umbrella description. For singletons we omit the entry — the build
 * step below falls back to the canonical variant's name/description so we
 * don't duplicate copy. Aliases still live here for singletons when we want
 * richer fuzzy matching than the canonical's `name`/`nameEn` alone.
 */
interface FamilyMetaOverride {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  aliases?: string[];
}

const FAMILY_META: Record<string, FamilyMetaOverride> = {
  // P2.5 renamed: formerly `fam_chicken` (umbrella). Only contains breast
  // variants; id now reflects reality. Future cuts (muslo/ala/entero) will
  // live as siblings under `subcategory: 'aves'`.
  fam_chicken_breast: {
    name: 'Pechuga de Pollo', nameEn: 'Chicken Breast',
    description: 'Corte magro de ave de corral, base proteica versátil. La referencia canónica es la pechuga cruda (USDA).',
    descriptionEn: 'Lean poultry cut, a versatile protein staple. Canonical reference is raw breast (USDA).',
    aliases: ['pechuga', 'pollo', 'chicken', 'chicken breast', 'ave', 'poultry'],
  },
  // P2.6 — cortes reales del pollo vendidos por separado en el super. Cada uno
  // familia propia (no variante) porque se compran en bandeja distinta con
  // macros propios: muslo más grasa y sabor, ala mini-porción finger-food,
  // pollo entero asado el producto rotisserie de supermercado / domingo.
  fam_chicken_thigh: {
    name: 'Muslo de Pollo', nameEn: 'Chicken Thigh',
    description: 'Corte jugoso del cuarto trasero del pollo, con hueso y piel. Más sabor y grasa que la pechuga; tolera bien cocciones largas.',
    descriptionEn: 'Juicy cut from the chicken hind quarter, with bone and skin. More flavor and fat than breast; tolerates long cooking.',
    aliases: ['muslo', 'muslo de pollo', 'thigh', 'chicken thigh'],
  },
  fam_chicken_drumstick: {
    name: 'Contramuslo de Pollo', nameEn: 'Chicken Drumstick',
    description: 'Jamoncito de pollo, parte inferior del cuarto trasero. Formato práctico de 1 unidad; carne oscura sabrosa.',
    descriptionEn: 'Chicken leg, lower half of the hind quarter. Practical single-unit format; flavorful dark meat.',
    aliases: ['contramuslo', 'jamoncito', 'drumstick'],
  },
  fam_chicken_wing: {
    name: 'Ala de Pollo', nameEn: 'Chicken Wing',
    description: 'Alita con piel — snack clásico a la plancha, frito o al horno. Porción pequeña (~40 g cruda).',
    descriptionEn: 'Chicken wing with skin — classic pan, fried or baked snack. Small portion (~40 g raw).',
    aliases: ['ala', 'alas', 'alita', 'alitas', 'wing', 'wings'],
  },
  fam_chicken_whole: {
    name: 'Pollo Entero', nameEn: 'Whole Chicken',
    description: 'Pollo entero asado con piel. Producto rotisserie del super o asado casero; la referencia canónica asume ya cocinado.',
    descriptionEn: 'Whole roasted chicken with skin. Supermarket rotisserie or home-roasted; canonical reference assumes already cooked.',
    aliases: ['pollo entero', 'pollo asado', 'whole chicken', 'rotisserie chicken', 'roasted chicken'],
  },
  fam_tuna: {
    name: 'Atún', nameEn: 'Tuna',
    description: 'Pescado azul rico en omega-3. La referencia canónica es fresco.',
    descriptionEn: 'Oily fish rich in omega-3. Canonical reference is fresh tuna.',
    aliases: ['atún', 'tuna', 'bonito'],
  },
  // P2.5 split: was `fam_beef` umbrella. Molida is the "picada para
  // boloñesa/hamburguesa" product — distinct culinary use from a steak.
  fam_beef_ground: {
    name: 'Ternera Molida', nameEn: 'Ground Beef',
    description: 'Carne picada 90/10. Base versátil para boloñesas, hamburguesas caseras, rellenos.',
    descriptionEn: 'Ground beef 90/10. Versatile base for bolognese, homemade burgers, fillings.',
    aliases: ['carne picada', 'carne molida', 'ground beef', 'mince', 'picada'],
  },
  // P2.5 split: was `fam_beef` umbrella. Filete/solomillo/entrecot — corte
  // entero para plancha o parrilla. Perfil proteico distinto de molida
  // (+35% protein, menos grasa).
  fam_beef_steak: {
    name: 'Filete de Ternera', nameEn: 'Beef Steak',
    description: 'Corte magro entero de vacuno, plancha o parrilla. Más proteína que la molida y menos grasa.',
    descriptionEn: 'Lean whole cut of beef, pan or grill. Higher protein than ground, less fat.',
    aliases: ['filete', 'solomillo', 'entrecot', 'steak', 'sirloin', 'bistec'],
  },
  // P2.5 split: was `fam_egg` umbrella. Huevo entero con yema + clara.
  fam_egg_whole: {
    name: 'Huevo Entero', nameEn: 'Whole Egg',
    description: 'Proteína completa con todos los aminoácidos esenciales. Yema rica en colina, vitamina D y B12.',
    descriptionEn: 'Complete protein with all essential amino acids. Yolk rich in choline, vitamin D and B12.',
    aliases: ['huevo', 'huevo entero', 'egg', 'whole egg', 'huevos'],
  },
  // P2.5 split: was `fam_egg` umbrella. Clara sin yema — se vende en brick
  // pasteurizada aparte. −64% kcal, −98% grasa vs huevo entero: producto
  // diferente para objetivos de proteína limpia.
  fam_egg_whites: {
    name: 'Clara de Huevo', nameEn: 'Egg White',
    description: 'Clara pasteurizada sin yema. Proteína casi pura, muy baja en grasa. Ideal en objetivos de definición.',
    descriptionEn: 'Pasteurized egg white, no yolk. Nearly pure protein, very low fat. Ideal for cutting.',
    aliases: ['clara', 'claras', 'egg white', 'egg whites', 'albumina', 'clara de huevo'],
  },
  // P2.5 split: was `fam_rice` umbrella. Arroz blanco refinado (grano corto
  // o largo sin salvado). Cocción rápida, IG alto.
  fam_rice_white: {
    name: 'Arroz Blanco', nameEn: 'White Rice',
    description: 'Cereal refinado sin salvado, base en cocinas de todo el mundo. Cocción rápida e IG alto.',
    descriptionEn: 'Refined grain without bran, staple in cuisines worldwide. Fast cooking, high GI.',
    aliases: ['arroz', 'arroz blanco', 'white rice', 'long grain', 'redondo'],
  },
  // P2.5 split: was `fam_rice` umbrella. Arroz integral con salvado entero.
  // ~3× fibra que el blanco, IG más bajo, digestión más lenta.
  fam_rice_brown: {
    name: 'Arroz Integral', nameEn: 'Brown Rice',
    description: 'Cereal entero con salvado. Más fibra (~3×) y mejor perfil glucémico que el arroz blanco.',
    descriptionEn: 'Whole grain with bran. More fiber (~3×) and better glycemic profile than white rice.',
    aliases: ['integral', 'arroz integral', 'brown rice', 'whole grain rice'],
  },
  // P2.5 split: was `fam_bread` umbrella. Pan de harina refinada.
  fam_bread_white: {
    name: 'Pan Blanco', nameEn: 'White Bread',
    description: 'Pan de harina refinada. Miga suave, IG alto, fibra baja.',
    descriptionEn: 'Bread from refined flour. Soft crumb, high GI, low fiber.',
    aliases: ['pan blanco', 'pan', 'white bread', 'refinado'],
  },
  // P2.5 split: was `fam_bread` umbrella. Pan de harina integral con salvado.
  fam_bread_wholewheat: {
    name: 'Pan Integral', nameEn: 'Whole Wheat Bread',
    description: 'Pan de harina integral con salvado. ~4× fibra que el pan blanco, saciedad superior.',
    descriptionEn: 'Whole wheat bread with bran. ~4× fiber vs white bread, superior satiety.',
    aliases: ['pan integral', 'whole wheat bread', 'integral'],
  },
  fam_milk: {
    name: 'Leche', nameEn: 'Milk',
    description: 'Leche de vaca. La referencia canónica es leche entera por ser el perfil nutricional más completo.',
    descriptionEn: 'Cow\'s milk. Canonical reference is whole milk for the most complete nutritional profile.',
    aliases: ['leche', 'milk'],
  },
  fam_greek_yogurt: {
    name: 'Yogur Griego', nameEn: 'Greek Yogurt',
    description: 'Yogur colado, rico en proteína. La referencia canónica es griego natural entero.',
    descriptionEn: 'Strained yogurt, high in protein. Canonical reference is full-fat plain Greek.',
    aliases: ['yogur griego', 'greek yogurt', 'yogurt griego'],
  },
  // P2.5 new: yogur natural no colado. Cubre el gap de "si un día no tengo
  // griego" (Natural → Griego es un family-swap, no variant-swap).
  fam_yogurt: {
    name: 'Yogur Natural', nameEn: 'Plain Yogurt',
    description: 'Yogur natural no colado. Base cremosa con menor proteína y más lactosa que el griego.',
    descriptionEn: 'Unstrained plain yogurt. Creamier base with lower protein and more lactose than Greek.',
    aliases: ['yogur', 'yogur natural', 'yogurt', 'plain yogurt', 'natural yogurt'],
  },
  fam_coffee: {
    name: 'Café', nameEn: 'Coffee',
    description: 'Infusión de grano tostado. La referencia canónica es café solo sin azúcar.',
    descriptionEn: 'Brewed roasted coffee. Canonical reference is black coffee, unsweetened.',
    aliases: ['café', 'coffee', 'cafe'],
  },
  fam_wine: {
    name: 'Vino', nameEn: 'Wine',
    description: 'Vino fermentado. La referencia canónica es tinto por ser el más consumido en España.',
    descriptionEn: 'Fermented wine. Canonical reference is red wine, the most common in Spain.',
    aliases: ['vino', 'wine'],
  },
  fam_cola: {
    name: 'Refresco de Cola', nameEn: 'Cola Drink',
    description: 'Refresco carbonatado de cola. La referencia canónica es la versión con azúcar.',
    descriptionEn: 'Carbonated cola soft drink. Canonical reference is the sugared version.',
    aliases: ['cola', 'coca-cola', 'refresco'],
  },
  fam_beer: {
    name: 'Cerveza', nameEn: 'Beer',
    description: 'Bebida fermentada de cebada. La referencia canónica es lager.',
    descriptionEn: 'Fermented barley drink. Canonical reference is lager.',
    aliases: ['cerveza', 'beer'],
  },
  // P2.5: keeps id (whole nut). Butter split to `fam_peanut_butter`.
  fam_peanut: {
    name: 'Cacahuete', nameEn: 'Peanut',
    description: 'Legumbre rica en proteína y grasa monoinsaturada. Snack entero o ingrediente crujiente.',
    descriptionEn: 'Legume rich in protein and monounsaturated fat. Whole snack or crunchy ingredient.',
    aliases: ['cacahuete', 'maní', 'peanut', 'peanuts'],
  },
  // P2.5 split: from `fam_peanut`. Crema untable con uso culinario distinto
  // del cacahuete entero — vive bajo subcategoría `mantecas-pastas`.
  fam_peanut_butter: {
    name: 'Crema de Cacahuete', nameEn: 'Peanut Butter',
    description: 'Crema untable de cacahuete. Uso culinario distinto del fruto entero (snack, untable, salsas).',
    descriptionEn: 'Peanut butter spread. Different culinary use from whole peanut (snack, spread, sauces).',
    aliases: ['peanut butter', 'crema de cacahuete', 'mantequilla de cacahuete'],
  },
  // P2.5: keeps id (whole nut). Butter split to `fam_almond_butter`.
  fam_almond: {
    name: 'Almendra', nameEn: 'Almond',
    description: 'Fruto seco rico en vitamina E y grasas saludables. Snack entero o ingrediente crujiente.',
    descriptionEn: 'Tree nut rich in vitamin E and healthy fats. Whole snack or crunchy ingredient.',
    aliases: ['almendra', 'almond', 'almonds'],
  },
  // P2.5 split: from `fam_almond`. Crema untable bajo subcategoría
  // `mantecas-pastas`.
  fam_almond_butter: {
    name: 'Crema de Almendras', nameEn: 'Almond Butter',
    description: 'Crema untable de almendras. Uso culinario distinto del fruto entero.',
    descriptionEn: 'Almond butter spread. Different culinary use from whole nut.',
    aliases: ['almond butter', 'crema de almendras', 'mantequilla de almendra'],
  },

  // P12 [1.5.70] — Expansion de básicos España
  fam_hake: {
    name: 'Merluza', nameEn: 'Hake',
    description: 'Pescado blanco muy popular en España. Magro, digestivo, alto en selenio.',
    descriptionEn: 'White fish hugely popular in Spain. Lean, easily digested, high in selenium.',
    aliases: ['merluza', 'hake', 'pescado blanco'],
  },
  fam_trout: {
    name: 'Trucha', nameEn: 'Trout',
    description: 'Pescado azul de agua dulce, fuente de omega-3.',
    descriptionEn: 'Freshwater oily fish, rich in omega-3.',
    aliases: ['trucha', 'trout'],
  },
  fam_anchovy: {
    name: 'Boquerones', nameEn: 'Anchovies',
    description: 'Pescado azul pequeño, tapa clásica española. Muy alto en omega-3 y calcio.',
    descriptionEn: 'Small oily fish, Spanish tapa classic. Very high in omega-3 and calcium.',
    aliases: ['boqueron', 'boquerones', 'anchoa', 'anchoas', 'anchovy', 'anchovies'],
  },
  fam_sea_bream: {
    name: 'Dorada', nameEn: 'Sea Bream',
    description: 'Pescado mediterráneo semigraso, carne blanca delicada.',
    descriptionEn: 'Mediterranean semi-oily fish with delicate white flesh.',
    aliases: ['dorada', 'sea bream', 'gilt-head bream'],
  },
  fam_mussels: {
    name: 'Mejillones', nameEn: 'Mussels',
    description: 'Marisco económico y muy nutritivo, alto en hierro y B12.',
    descriptionEn: 'Affordable shellfish, high in iron and B12.',
    aliases: ['mejillones', 'mejillon', 'mussels'],
  },
  fam_clams: {
    name: 'Almejas', nameEn: 'Clams',
    description: 'Marisco bivalvo, altísimo en hierro y B12.',
    descriptionEn: 'Bivalve shellfish, very high in iron and B12.',
    aliases: ['almeja', 'almejas', 'clams'],
  },
  fam_octopus: {
    name: 'Pulpo', nameEn: 'Octopus',
    description: 'Cefalópodo muy magro, fuente de proteína completa.',
    descriptionEn: 'Very lean cephalopod, complete protein source.',
    aliases: ['pulpo', 'octopus'],
  },
  fam_ham_cooked: {
    name: 'Jamón Cocido', nameEn: 'Cooked Ham',
    description: 'Embutido de cerdo cocido, menor sal que el serrano.',
    descriptionEn: 'Cooked pork cold cut, less salt than cured ham.',
    aliases: ['jamon cocido', 'jamon york', 'cooked ham'],
  },
  fam_bell_pepper_green: {
    name: 'Pimiento Verde', nameEn: 'Green Bell Pepper',
    description: 'Pimiento menos maduro que el rojo, sabor más amargo, alto en vitamina C.',
    descriptionEn: 'Less ripe bell pepper than red, more bitter, very high in vitamin C.',
    aliases: ['pimiento verde', 'green bell pepper', 'green pepper'],
  },
  fam_bell_pepper_yellow: {
    name: 'Pimiento Amarillo', nameEn: 'Yellow Bell Pepper',
    description: 'Maduración intermedia, dulce, altísimo en vitamina C.',
    descriptionEn: 'Intermediate ripeness, sweet, very high in vitamin C.',
    aliases: ['pimiento amarillo', 'yellow bell pepper', 'yellow pepper'],
  },
  fam_radish: {
    name: 'Rábano', nameEn: 'Radish',
    description: 'Raíz crujiente de sabor picante suave, muy baja en calorías.',
    descriptionEn: 'Crunchy root with mild spicy flavor, very low calorie.',
    aliases: ['rabano', 'rabanito', 'radish', 'radishes'],
  },
  fam_spring_onion: {
    name: 'Cebolleta', nameEn: 'Spring Onion',
    description: 'Cebolla joven con tallo verde, sabor más suave.',
    descriptionEn: 'Young onion with green stalk, milder flavor.',
    aliases: ['cebolleta', 'cebolla tierna', 'spring onion', 'scallion'],
  },
  fam_endive: {
    name: 'Endivia', nameEn: 'Endive',
    description: 'Hoja amarga crujiente, ideal en ensalada con queso.',
    descriptionEn: 'Crunchy bitter leaf, ideal in salad with cheese.',
    aliases: ['endivia', 'endibia', 'endive'],
  },
  fam_tangerine: {
    name: 'Mandarina', nameEn: 'Tangerine',
    description: 'Cítrico de invierno español, fácil de pelar, rico en vitamina C.',
    descriptionEn: 'Winter Spanish citrus, easy to peel, rich in vitamin C.',
    aliases: ['mandarina', 'clementina', 'tangerine', 'clementine', 'mandarin'],
  },
  fam_peach: {
    name: 'Melocotón', nameEn: 'Peach',
    description: 'Fruta de hueso de verano, jugosa, fuente de vitamina A.',
    descriptionEn: 'Summer stone fruit, juicy, source of vitamin A.',
    aliases: ['melocoton', 'durazno', 'peach'],
  },
  fam_plum: {
    name: 'Ciruela', nameEn: 'Plum',
    description: 'Fruta de hueso dulce con antioxidantes y fibra.',
    descriptionEn: 'Sweet stone fruit with antioxidants and fiber.',
    aliases: ['ciruela', 'plum', 'plums'],
  },
  fam_cherry: {
    name: 'Cereza', nameEn: 'Cherry',
    description: 'Fruta de hueso con antocianinas, efecto antiinflamatorio.',
    descriptionEn: 'Stone fruit with anthocyanins, anti-inflammatory effect.',
    aliases: ['cereza', 'cerezas', 'cherry', 'cherries'],
  },
  fam_raisin: {
    name: 'Pasas', nameEn: 'Raisins',
    description: 'Uva deshidratada, muy concentrada en azúcar y hierro.',
    descriptionEn: 'Dried grape, very concentrated in sugar and iron.',
    aliases: ['pasa', 'pasas', 'uva pasa', 'raisin', 'raisins'],
  },
  fam_pomegranate: {
    name: 'Granada', nameEn: 'Pomegranate',
    description: 'Fruta de otoño con granos jugosos, muy antioxidante.',
    descriptionEn: 'Autumn fruit with juicy arils, very antioxidant-rich.',
    aliases: ['granada', 'pomegranate'],
  },
  fam_barley: {
    name: 'Cebada', nameEn: 'Barley',
    description: 'Cereal milenario, muy alto en fibra beta-glucano.',
    descriptionEn: 'Ancient grain, very high in beta-glucan fiber.',
    aliases: ['cebada', 'barley'],
  },
  fam_rye: {
    name: 'Centeno', nameEn: 'Rye',
    description: 'Cereal rústico común en pan del norte de Europa, alto en fibra.',
    descriptionEn: 'Rustic grain common in northern European breads, high in fiber.',
    aliases: ['centeno', 'rye'],
  },
  fam_bulgur: {
    name: 'Bulgur', nameEn: 'Bulgur',
    description: 'Trigo partido precocido, base del tabulé, cocina rápida.',
    descriptionEn: 'Cracked pre-cooked wheat, base of tabbouleh, cooks fast.',
    aliases: ['bulgur', 'bulgar'],
  },
  fam_kidney_beans: {
    name: 'Alubia Roja', nameEn: 'Kidney Beans',
    description: 'Alubia roja grande, clásica en chili y guisos, alta en fibra y folato.',
    descriptionEn: 'Large red bean, classic in chili and stews, high in fiber and folate.',
    aliases: ['alubia roja', 'judia roja', 'frijol rojo', 'kidney beans', 'red beans'],
  },
  fam_pinto_beans: {
    name: 'Alubia Pinta', nameEn: 'Pinto Beans',
    description: 'Alubia moteada popular en cocina española, guisos tradicionales.',
    descriptionEn: 'Mottled bean popular in Spanish cuisine, traditional stews.',
    aliases: ['alubia pinta', 'judia pinta', 'pinto beans'],
  },
  fam_fava_beans: {
    name: 'Habas', nameEn: 'Fava Beans',
    description: 'Legumbre verde grande, típica de la primavera mediterránea.',
    descriptionEn: 'Large green legume, typical of Mediterranean spring.',
    aliases: ['haba', 'habas', 'fava', 'fava beans', 'broad beans'],
  },
  fam_skyr: {
    name: 'Skyr', nameEn: 'Skyr',
    description: 'Lácteo islandés denso en proteína, similar al yogur griego pero más concentrado.',
    descriptionEn: 'Icelandic dairy dense in protein, similar to Greek yogurt but more concentrated.',
    aliases: ['skyr'],
  },
  fam_ricotta: {
    name: 'Ricotta', nameEn: 'Ricotta',
    description: 'Queso fresco italiano de suero, textura granulada suave.',
    descriptionEn: 'Italian fresh whey cheese, soft granular texture.',
    aliases: ['ricotta', 'ricota'],
  },
  fam_manchego: {
    name: 'Queso Manchego', nameEn: 'Manchego Cheese',
    description: 'Queso curado de oveja DOP español, sabor intenso y mantecoso.',
    descriptionEn: 'Spanish DOP cured sheep cheese, intense buttery flavor.',
    aliases: ['manchego', 'queso manchego', 'manchego cheese'],
  },
  fam_hazelnut: {
    name: 'Avellana', nameEn: 'Hazelnut',
    description: 'Fruto seco alto en vitamina E y manganeso.',
    descriptionEn: 'Nut high in vitamin E and manganese.',
    aliases: ['avellana', 'avellanas', 'hazelnut', 'hazelnuts'],
  },
  fam_sesame_seed: {
    name: 'Semilla de Sésamo', nameEn: 'Sesame Seed',
    description: 'Semilla pequeña alta en calcio, base del tahini.',
    descriptionEn: 'Small seed high in calcium, base of tahini.',
    aliases: ['semilla de sesamo', 'ajonjoli', 'sesame seed', 'sesame seeds'],
  },
  fam_sunflower_oil: {
    name: 'Aceite de Girasol', nameEn: 'Sunflower Oil',
    description: 'Aceite neutro común en España, alto en vitamina E.',
    descriptionEn: 'Common neutral oil in Spain, high in vitamin E.',
    aliases: ['aceite de girasol', 'sunflower oil'],
  },
  fam_ketchup: {
    name: 'Ketchup', nameEn: 'Ketchup',
    description: 'Salsa de tomate con azúcar y vinagre, omnipresente en fast food.',
    descriptionEn: 'Tomato sauce with sugar and vinegar, ubiquitous in fast food.',
    aliases: ['ketchup', 'catchup'],
  },
  fam_wine_vinegar: {
    name: 'Vinagre de Vino', nameEn: 'Wine Vinegar',
    description: 'Vinagre fermentado de vino tinto o blanco, base del aliño español.',
    descriptionEn: 'Vinegar fermented from red or white wine, base of Spanish dressing.',
    aliases: ['vinagre de vino', 'vinagre tinto', 'wine vinegar'],
  },
  fam_balsamic_vinegar: {
    name: 'Vinagre Balsámico', nameEn: 'Balsamic Vinegar',
    description: 'Vinagre italiano agridulce, base de ensaladas y reducciones.',
    descriptionEn: 'Italian sweet-sour vinegar, base of salads and reductions.',
    aliases: ['vinagre balsamico', 'balsamico', 'balsamic', 'balsamic vinegar'],
  },
  fam_pesto: {
    name: 'Pesto', nameEn: 'Pesto',
    description: 'Salsa italiana cruda de albahaca, piñones, ajo, queso y aceite.',
    descriptionEn: 'Italian raw sauce of basil, pine nuts, garlic, cheese and oil.',
    aliases: ['pesto', 'salsa pesto'],
  },
  fam_jam: {
    name: 'Mermelada', nameEn: 'Jam',
    description: 'Conserva de fruta con azúcar, clásica del desayuno.',
    descriptionEn: 'Fruit preserve with sugar, breakfast classic.',
    aliases: ['mermelada', 'jam', 'jelly', 'preserve'],
  },
  fam_salt: {
    name: 'Sal', nameEn: 'Salt',
    description: 'Cloruro sódico. Condimento esencial, uso moderado recomendado.',
    descriptionEn: 'Sodium chloride. Essential seasoning, moderate use recommended.',
    aliases: ['sal', 'salt'],
  },
  fam_black_pepper: {
    name: 'Pimienta Negra', nameEn: 'Black Pepper',
    description: 'Especia universal, potente en piperina.',
    descriptionEn: 'Universal spice, potent in piperine.',
    aliases: ['pimienta', 'pimienta negra', 'black pepper', 'pepper'],
  },
  fam_paprika: {
    name: 'Pimentón', nameEn: 'Paprika',
    description: 'Especia española DOP La Vera, dulce o ahumado, base del chorizo.',
    descriptionEn: 'Spanish DOP La Vera spice, sweet or smoky, base of chorizo.',
    aliases: ['pimenton', 'paprika'],
  },
  fam_water: {
    name: 'Agua', nameEn: 'Water',
    description: 'H₂O. Esencial para la hidratación.',
    descriptionEn: 'H₂O. Essential for hydration.',
    aliases: ['agua', 'water'],
  },
  fam_green_tea: {
    name: 'Té Verde', nameEn: 'Green Tea',
    description: 'Infusión sin oxidar de Camellia sinensis, alta en catequinas antioxidantes.',
    descriptionEn: 'Unoxidized Camellia sinensis infusion, high in antioxidant catechins.',
    aliases: ['te verde', 'green tea', 'matcha'],
  },
  fam_black_tea: {
    name: 'Té Negro', nameEn: 'Black Tea',
    description: 'Infusión oxidada, sabor robusto, cafeína superior al té verde.',
    descriptionEn: 'Oxidized infusion, bold flavor, higher caffeine than green tea.',
    aliases: ['te negro', 'black tea'],
  },
  fam_gazpacho: {
    name: 'Gazpacho', nameEn: 'Gazpacho',
    description: 'Sopa fría andaluza de tomate, pepino y pimiento. Hidratante en verano.',
    descriptionEn: 'Andalusian cold tomato-cucumber-pepper soup. Hydrating in summer.',
    aliases: ['gazpacho', 'salmorejo'],
  },
};

/**
 * Family → subcategory slug (L2 between L1 `category` and L3 `family`).
 *
 * Kebab-case slugs. Labels resolve via `t.foodDictionary.subcategoryLabels.{slug}`
 * in ES + EN — integrity enforced by `food-families.test.ts`.
 *
 * Families NOT listed here render flat under their category (used for small /
 * homogeneous categories like `oils`, `legumes`, `supplements` where a
 * subcategory level would over-index).
 */
/**
 * P7 `[1.5.62]` — species tag within multi-species subcategories.
 *
 * Populate ONLY for families that share a species with ≥1 sibling family in
 * the same subcategory (e.g. `fam_chicken_*` all share `'chicken'` inside
 * `subcategory: 'aves'`). The Dictionary then renders an `<h5>Pollo</h5>`
 * subheader above those families (see `groupFamiliesBySpecies` +
 * `FoodDictionary` render).
 *
 * Do NOT populate when the subcategory is already species-level (e.g.
 * `vacuno` = beef, `cerdo` = pork, `huevo` = egg). An `<h5>Beef</h5>` inside
 * `<h4>Vacuno</h4>` is tautological and hurts readability.
 *
 * Labels resolve via `t.foodDictionary.speciesLabels.{slug}` in ES + EN.
 * Integrity enforced by `food-families.test.ts`.
 */
export const FAMILY_SPECIES: Record<string, string> = {
  // Aves (poultry) — multi-species subcategory. Chicken has 5 families
  // (breast / thigh / drumstick / wing / whole) → the owner explicitly asked
  // for a "Pollo" super-grouper. Turkey has 1 family today so it falls
  // through to the flat render per the ≥2-family rule.
  fam_chicken_breast:    'chicken',
  fam_chicken_thigh:     'chicken',
  fam_chicken_drumstick: 'chicken',
  fam_chicken_wing:      'chicken',
  fam_chicken_whole:     'chicken',
  fam_turkey_breast:     'turkey',
};

const FAMILY_SUBCATEGORY: Record<string, string> = {
  // Proteins → aves / vacuno / cerdo / pescado-azul / pescado-blanco / marisco / huevo / vegetal / caza / embutidos
  fam_chicken_breast:    'aves',
  fam_chicken_thigh:     'aves',
  fam_chicken_drumstick: 'aves',
  fam_chicken_wing:      'aves',
  fam_chicken_whole:     'aves',
  fam_turkey_breast:     'aves',
  fam_beef_ground:    'vacuno',
  fam_beef_steak:     'vacuno',
  fam_pork_loin:      'cerdo',
  fam_jamon_serrano:  'embutidos',
  fam_lamb:           'caza',
  fam_rabbit:         'caza',
  fam_tuna:           'pescado-azul',
  fam_salmon:         'pescado-azul',
  fam_sardines:       'pescado-azul',
  fam_cod:            'pescado-blanco',
  fam_sea_bass:       'pescado-blanco',
  fam_shrimp:         'marisco',
  fam_squid:          'marisco',
  fam_tofu:           'vegetal',
  fam_tempeh:         'vegetal',
  fam_seitan:         'vegetal',
  fam_egg_whole:      'huevo',
  fam_egg_whites:     'huevo',

  // Vegetables → cruciferas / hojas / raices-tuberculos / solanaceas / alliums / cucurbitaceas / otras
  fam_broccoli:        'cruciferas',
  fam_cauliflower:     'cruciferas',
  fam_kale:            'cruciferas',
  fam_spinach:         'hojas',
  fam_lettuce:         'hojas',
  fam_arugula:         'hojas',
  fam_chard:           'hojas',
  fam_carrot:          'raices-tuberculos',
  fam_potato:          'raices-tuberculos',
  fam_sweet_potato:    'raices-tuberculos',
  fam_beetroot:        'raices-tuberculos',
  fam_tomato:          'solanaceas',
  fam_eggplant:        'solanaceas',
  fam_bell_pepper_red: 'solanaceas',
  fam_onion:           'alliums',
  fam_garlic:          'alliums',
  fam_leek:            'alliums',
  fam_zucchini:        'cucurbitaceas',
  fam_pumpkin:         'cucurbitaceas',
  fam_cucumber:        'cucurbitaceas',
  fam_asparagus:       'otras',
  fam_mushroom:        'otras',
  fam_green_beans:     'otras',
  fam_artichoke:       'otras',
  fam_celery:          'otras',
  fam_avocado:         'otras',
  fam_corn:            'otras',
  fam_peas:            'otras',

  // Fruits → tropicales / bayas / citricos / pomo / hueso / vid / melon
  fam_banana:     'tropicales',
  fam_mango:      'tropicales',
  fam_pineapple:  'tropicales',
  fam_kiwi:       'tropicales',
  fam_strawberry: 'bayas',
  fam_blueberry:  'bayas',
  fam_raspberry:  'bayas',
  fam_orange:     'citricos',
  fam_lemon:      'citricos',
  fam_apple:      'pomo',
  fam_pear:       'pomo',
  fam_date:       'hueso',
  fam_grape:      'vid',
  fam_watermelon: 'melon',

  // Grains → arroz / pan / pseudocereales / pasta-trigo
  fam_rice_white:        'arroz',
  fam_rice_brown:        'arroz',
  fam_bread_white:       'pan',
  fam_bread_wholewheat:  'pan',
  fam_quinoa:            'pseudocereales',
  fam_buckwheat:         'pseudocereales',
  fam_oats:              'pseudocereales',
  fam_pasta:             'pasta-trigo',
  fam_couscous:          'pasta-trigo',
  fam_tortilla_wrap:     'pasta-trigo',

  // Dairy → leche / yogur / queso-fresco / queso-curado / grasas-lacteas
  fam_milk:           'leche',
  fam_kefir:          'yogur',
  fam_yogurt:         'yogur',
  fam_greek_yogurt:   'yogur',
  fam_cottage_cheese: 'queso-fresco',
  fam_fresh_cheese:   'queso-fresco',
  fam_mozzarella:     'queso-fresco',
  fam_cured_cheese:   'queso-curado',
  fam_parmesan:       'queso-curado',
  fam_butter:         'grasas-lacteas',

  // Nuts & seeds → frutos-secos / semillas / mantecas-pastas
  fam_almond:         'frutos-secos',
  fam_almond_butter:  'mantecas-pastas',
  fam_peanut:         'frutos-secos',
  fam_peanut_butter:  'mantecas-pastas',
  fam_walnuts:        'frutos-secos',
  fam_cashews:        'frutos-secos',
  fam_pistachios:     'frutos-secos',
  fam_chia:           'semillas',
  fam_flax:           'semillas',
  fam_pumpkin_seed:   'semillas',
  fam_sunflower_seed: 'semillas',
  fam_tahini:         'mantecas-pastas',

  // Pantry → endulzantes / chocolate-cacao / salsas / condimentos
  fam_honey:               'endulzantes',
  fam_sugar:               'endulzantes',
  fam_cocoa_powder:        'chocolate-cacao',
  fam_dark_chocolate:      'chocolate-cacao',
  fam_tomato_sauce:        'salsas',
  fam_soy_sauce:           'salsas',
  fam_mayonnaise:          'salsas',
  fam_hummus:              'salsas',
  fam_mustard:             'condimentos',
  fam_apple_cider_vinegar: 'condimentos',

  // Prepared → bebidas-vegetales / snacks
  fam_almond_milk:   'bebidas-vegetales',
  fam_oat_milk:      'bebidas-vegetales',
  fam_coconut_water: 'bebidas-vegetales',
  fam_protein_bar:   'snacks',
  fam_granola:       'snacks',

  // Beverages → cerveza / vino / refresco / cafe-te / zumos / aguas / energeticas
  fam_beer:            'cerveza',
  fam_wine:            'vino',
  fam_cola:            'refresco',
  fam_coffee:          'cafe-te',
  fam_orange_juice:    'zumos',
  fam_sparkling_water: 'aguas',
  fam_energy_drink:    'energeticas',
  fam_sports_drink:    'energeticas',

  // P12 [1.5.70] — Expansion de básicos España
  fam_hake:                'pescado-blanco',
  fam_trout:               'pescado-azul',
  fam_anchovy:             'pescado-azul',
  fam_sea_bream:           'pescado-blanco',
  fam_mussels:             'marisco',
  fam_clams:               'marisco',
  fam_octopus:             'marisco',
  fam_ham_cooked:          'embutidos',
  fam_bell_pepper_green:   'solanaceas',
  fam_bell_pepper_yellow:  'solanaceas',
  fam_radish:              'raices-tuberculos',
  fam_spring_onion:        'alliums',
  fam_endive:              'hojas',
  fam_tangerine:            'citricos',
  fam_peach:                'hueso',
  fam_plum:                 'hueso',
  fam_cherry:               'hueso',
  fam_raisin:               'vid',
  fam_pomegranate:          'tropicales',
  fam_barley:               'pseudocereales', // cereal integral / whole grain → already use pseudocereales group for non-wheat grains
  fam_rye:                  'pan',
  fam_bulgur:               'pasta-trigo',
  // Legumes stays flat (no subcategory) — kidney/pinto/fava join the flat list
  fam_skyr:                 'yogur',
  fam_ricotta:              'queso-fresco',
  fam_manchego:             'queso-curado',
  fam_hazelnut:             'frutos-secos',
  fam_sesame_seed:          'semillas',
  // Oils stays flat (sunflower_oil joins the flat list)
  fam_ketchup:              'salsas',
  fam_wine_vinegar:         'condimentos',
  fam_balsamic_vinegar:     'condimentos',
  fam_pesto:                'salsas',
  fam_jam:                  'endulzantes',
  fam_salt:                 'condimentos',
  fam_black_pepper:         'condimentos',
  fam_paprika:              'condimentos',
  fam_water:                'aguas',
  fam_green_tea:            'cafe-te',
  fam_black_tea:            'cafe-te',
  fam_gazpacho:             'zumos', // sopa líquida — clasifica como zumo por categoría de bebidas líquidas

  // Oils + Legumes + Supplements: NO subcategory — render plano
};

/**
 * P2.6 — Brand variants seed.
 *
 * Retail brand products seeded directly as `variantType: 'brand'`. They do NOT
 * have a counterpart in `INGREDIENT_DICTIONARY` (no USDA canonical of their
 * own — they piggy-back on the family's canonical servingSizes / micros /
 * allergens via `brandVariantFrom` in `food-variants.ts`). Ids follow the
 * deterministic pattern `brand_{familyId}_{slug}` so user pins stay stable
 * across deploys and future OFF barcodes can escalate the same id to
 * `source: 'off'` without breaking references.
 *
 * Macros are approximations of public retail labels (Mercadona / Lidl /
 * Carrefour / BonÀrea). Tolerance ±5% — tests lock `brand.name` +
 * `variantType === 'brand'`, not absolute values. When P5 integrates Open
 * Food Facts, each seed can be upgraded to `source: 'off'` with exact macros
 * + `brand.barcode` — the id stays put.
 *
 * TODO — P5 barcode dedup. BarcodeScanner must match scanned OFF products
 * against SEED_BRAND_ENTRIES by `{brand.name + familyId}` before creating a
 * new variant, to avoid duplicating e.g. "Hacendado Greek Yogurt" once per
 * scan. See `docs/market/food-variants-design.md` §5.1.
 */
export interface SeedBrandEntry {
  id: string;
  familyId: string;
  brand: VariantBrand;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  macros: Macros;
  qualityTags?: QualityTagSlug[];
}

export const SEED_BRAND_ENTRIES: readonly SeedBrandEntry[] = [
  // Yogur griego — referencia canónica `dai_greek_yogurt` (97 kcal full-fat
  // natural; Oikos es la alternativa más rica en proteína del retail español).
  {
    id: 'brand_fam_greek_yogurt_hacendado',
    familyId: 'fam_greek_yogurt',
    brand: { name: 'Hacendado' },
    name: 'Yogur Griego Natural (Hacendado)',
    nameEn: 'Greek Yogurt, Plain (Hacendado)',
    macros: { calories: 97, protein: 3.8, carbs: 3.8, fats: 8, saturatedFat: 5.5 },
  },
  {
    id: 'brand_fam_greek_yogurt_oikos',
    familyId: 'fam_greek_yogurt',
    brand: { name: 'Danone Oikos' },
    name: 'Oikos Natural (Danone)',
    nameEn: 'Oikos Plain (Danone)',
    macros: { calories: 112, protein: 7, carbs: 4.5, fats: 7, saturatedFat: 4.7 },
  },
  // Yogur natural — referencia `dai_plain_yogurt` (nuevo P2.5).
  // Sveltesse 0% es el arquetipo "light" + "sin azúcar" del retail.
  {
    id: 'brand_fam_yogurt_hacendado',
    familyId: 'fam_yogurt',
    brand: { name: 'Hacendado' },
    name: 'Yogur Natural Azucarado (Hacendado)',
    nameEn: 'Plain Sweetened Yogurt (Hacendado)',
    macros: { calories: 80, protein: 3.2, carbs: 12, fats: 2.5, saturatedFat: 1.6, sugar: 11 },
  },
  {
    id: 'brand_fam_yogurt_sveltesse',
    familyId: 'fam_yogurt',
    brand: { name: 'Nestlé Sveltesse' },
    name: 'Sveltesse 0% Natural (Nestlé)',
    nameEn: 'Sveltesse 0% Plain (Nestlé)',
    macros: { calories: 38, protein: 4.6, carbs: 4.5, fats: 0.1, saturatedFat: 0.1 },
    qualityTags: ['light', 'sugar-free'],
  },
  // Pechuga de pollo — BonÀrea (pollo de corral catalán) + Carrefour Bio
  // (ecológico + corral). Demuestran qualityTags multi-axis sobre el mismo
  // producto.
  {
    id: 'brand_fam_chicken_breast_bonarea',
    familyId: 'fam_chicken_breast',
    brand: { name: 'BonÀrea' },
    name: 'Pechuga de Pollo de Corral (BonÀrea)',
    nameEn: 'Free-Range Chicken Breast (BonÀrea)',
    macros: { calories: 120, protein: 23, carbs: 0, fats: 2.5, saturatedFat: 0.7 },
    qualityTags: ['free-range'],
  },
  {
    id: 'brand_fam_chicken_breast_carrefour_bio',
    familyId: 'fam_chicken_breast',
    brand: { name: 'Carrefour Bio' },
    name: 'Pechuga de Pollo Eco (Carrefour Bio)',
    nameEn: 'Organic Chicken Breast (Carrefour Bio)',
    macros: { calories: 120, protein: 22, carbs: 0, fats: 2.6, saturatedFat: 0.7 },
    qualityTags: ['organic', 'free-range'],
  },
  // Crema de cacahuete — Hacendado 100% (sin azúcar ni aditivos) vs Lidl
  // Mister Choc (versión standard con azúcar y aceite añadido).
  {
    id: 'brand_fam_peanut_butter_hacendado',
    familyId: 'fam_peanut_butter',
    brand: { name: 'Hacendado' },
    name: 'Crema de Cacahuete 100% (Hacendado)',
    nameEn: '100% Peanut Butter (Hacendado)',
    macros: { calories: 612, protein: 28, carbs: 16, fats: 48, saturatedFat: 8, sugar: 5 },
    qualityTags: ['sugar-free', 'no-additives'],
  },
  {
    id: 'brand_fam_peanut_butter_mister_choc',
    familyId: 'fam_peanut_butter',
    brand: { name: 'Lidl Mister Choc' },
    name: 'Crema de Cacahuete (Mister Choc, Lidl)',
    nameEn: 'Peanut Butter (Mister Choc, Lidl)',
    macros: { calories: 598, protein: 22, carbs: 15, fats: 49, saturatedFat: 9, sugar: 8 },
  },
];

/** brand-id → SeedBrandEntry lookup, used by the variants builder. */
const BRAND_ENTRY_BY_ID = new Map<string, SeedBrandEntry>(
  SEED_BRAND_ENTRIES.map(e => [e.id, e]),
);

/**
 * Build `FOOD_FAMILIES` by grouping `INGREDIENT_DICTIONARY` via `VARIANT_MAP`.
 * The builder runs at module-load (pure, deterministic). Result is cached as
 * a readonly const array.
 */
function buildFamilies(): FoodFamily[] {
  const groups = new Map<string, {
    category: IngredientCategory;
    tags: Set<FoodTag>;
    canonicalVariantId: string | null;
    variantIds: string[];
    canonicalIngredient: typeof INGREDIENT_DICTIONARY[number] | null;
  }>();

  for (const ing of INGREDIENT_DICTIONARY) {
    const entry = VARIANT_MAP[ing.id];
    if (!entry) continue; // unmapped ids surface via the integrity test
    const { familyId, variantType } = entry;
    let g = groups.get(familyId);
    if (!g) {
      g = {
        category: ing.category,
        tags: new Set(),
        canonicalVariantId: null,
        variantIds: [],
        canonicalIngredient: null,
      };
      groups.set(familyId, g);
    }
    g.variantIds.push(ing.id);
    for (const t of ing.tags) g.tags.add(t);
    if (variantType === 'canonical') {
      g.canonicalVariantId = ing.id;
      g.canonicalIngredient = ing;
    }
  }

  // P2.6 — brand variants declared in `SEED_BRAND_ENTRIES` don't have an
  // ingredient counterpart, so they never flow through the loop above. Fold
  // their ids into the matching family's `variantIds` so the resolver's
  // `getVariantsOfFamily` surfaces them in the drill-down. The brand ids land
  // AFTER the derived variants (canonical first, then preparation/quality,
  // then brand), which matches the section order `FamilyCard` will render.
  const brandIdsByFamily = new Map<string, string[]>();
  for (const entry of SEED_BRAND_ENTRIES) {
    const bucket = brandIdsByFamily.get(entry.familyId) ?? [];
    bucket.push(entry.id);
    brandIdsByFamily.set(entry.familyId, bucket);
  }

  const families: FoodFamily[] = [];
  for (const [familyId, g] of groups) {
    const meta = FAMILY_META[familyId];
    const canonical = g.canonicalIngredient;
    if (!canonical || !g.canonicalVariantId) {
      throw new Error(`food-families: family ${familyId} has no canonical variant`);
    }
    const subcategory = FAMILY_SUBCATEGORY[familyId];
    const species = FAMILY_SPECIES[familyId];
    const brandIds = brandIdsByFamily.get(familyId) ?? [];
    // P8 — enriched content (optional, progressive): image is always populated
    // via `getFamilyImage` (falls back to a generic plate); long-description /
    // culinary-uses / substitutes come from `FAMILY_CONTENT` and are only set
    // when the family has curated content.
    const image = getFamilyImage(familyId);
    const content = FAMILY_CONTENT[familyId];
    families.push({
      id: familyId,
      name: meta?.name ?? canonical.name,
      nameEn: meta?.nameEn ?? canonical.nameEn,
      description: meta?.description ?? canonical.description,
      descriptionEn: meta?.descriptionEn ?? canonical.descriptionEn,
      category: g.category,
      ...(subcategory ? { subcategory } : {}),
      ...(species ? { species } : {}),
      canonicalVariantId: g.canonicalVariantId,
      variantIds: [
        g.canonicalVariantId,
        ...g.variantIds.filter(id => id !== g.canonicalVariantId),
        ...brandIds,
      ],
      aliases: meta?.aliases,
      tags: Array.from(g.tags),
      image,
      ...(content ? {
        longDescription: content.longDescription,
        culinaryUses: content.culinaryUses,
        substitutes: content.substitutes,
      } : {}),
    });
  }
  return families;
}

/**
 * Brand-variant lookup for the food-variants builder. Exposed (not inlined in
 * `buildFamilies`) because materializing a `FoodVariant` requires access to
 * the canonical variant's full shape — which lives in `food-variants.ts` to
 * avoid a circular dep.
 */
export function getBrandEntry(id: string): SeedBrandEntry | undefined {
  return BRAND_ENTRY_BY_ID.get(id);
}

export const FOOD_FAMILIES: readonly FoodFamily[] = Object.freeze(buildFamilies());

/** Legacy id → family/variant lookup. Exported for the resolver + tests. */
export const VARIANT_ID_TO_FAMILY: Readonly<Record<string, { familyId: string; variantType: VariantType }>> =
  Object.freeze({ ...VARIANT_MAP });
