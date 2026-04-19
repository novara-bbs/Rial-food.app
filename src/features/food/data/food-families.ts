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
 * variant so we don't duplicate copy in P1. Multi-variant families get a
 * curated umbrella entry so "Pollo" reads as a concept, not as "Pechuga raw".
 *
 * P1 scope: this is data-only. Resolver helpers live in
 * `../utils/food-family-resolver.ts`; the dictionary UI consumes both in P2.
 */
import type { FoodFamily, VariantType } from '../../../types/food-family';
import type { FoodTag, IngredientCategory } from '../../../types/food';
import { INGREDIENT_DICTIONARY } from './ingredients';

/**
 * Legacy ingredient id → {familyId, variantType}.
 *
 * Clustering rules applied:
 * - Multi-variant pairs (14): chicken (raw/cooked), beef (ground/steak),
 *   tuna (fresh/canned), yogurt (full-fat/0%), milk (whole/skim), rice
 *   (white/brown), bread (whole/white), coffee (black/milk), wine (red/white),
 *   cola (reg/zero), beer (lager/ipa), peanut (whole/butter), almond
 *   (whole/butter), egg (whole/whites).
 * - Everything else is a singleton family with `variantType: 'canonical'`.
 */
const VARIANT_MAP: Record<string, { familyId: string; variantType: VariantType }> = {
  // Proteins — multi-variant
  pro_chicken_breast_raw:    { familyId: 'fam_chicken',        variantType: 'canonical' },
  pro_chicken_breast_cooked: { familyId: 'fam_chicken',        variantType: 'preparation' },
  pro_beef_ground_90:        { familyId: 'fam_beef',           variantType: 'canonical' },
  pro_beef_steak:            { familyId: 'fam_beef',           variantType: 'cut' },
  pro_tuna_fresh:            { familyId: 'fam_tuna',           variantType: 'canonical' },
  pro_tuna_canned:           { familyId: 'fam_tuna',           variantType: 'preparation' },
  pro_eggs:                  { familyId: 'fam_egg',            variantType: 'canonical' },
  pro_egg_whites:            { familyId: 'fam_egg',            variantType: 'cut' },
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

  // Grains — multi-variant (rice, bread) + singletons
  gra_white_rice:         { familyId: 'fam_rice',           variantType: 'canonical' },
  gra_brown_rice:         { familyId: 'fam_rice',           variantType: 'quality' },
  gra_whole_wheat_bread:  { familyId: 'fam_bread',          variantType: 'canonical' },
  gra_white_bread:        { familyId: 'fam_bread',          variantType: 'quality' },
  gra_quinoa:             { familyId: 'fam_quinoa',         variantType: 'canonical' },
  gra_oats:               { familyId: 'fam_oats',           variantType: 'canonical' },
  gra_pasta:              { familyId: 'fam_pasta',          variantType: 'canonical' },
  gra_couscous:           { familyId: 'fam_couscous',       variantType: 'canonical' },
  gra_buckwheat:          { familyId: 'fam_buckwheat',      variantType: 'canonical' },
  gra_tortilla_wrap:      { familyId: 'fam_tortilla_wrap',  variantType: 'canonical' },

  // Legumes — all singletons
  leg_lentils:      { familyId: 'fam_lentils',      variantType: 'canonical' },
  leg_chickpeas:    { familyId: 'fam_chickpeas',    variantType: 'canonical' },
  leg_black_beans:  { familyId: 'fam_black_beans',  variantType: 'canonical' },
  leg_white_beans:  { familyId: 'fam_white_beans',  variantType: 'canonical' },
  leg_edamame:      { familyId: 'fam_edamame',      variantType: 'canonical' },
  leg_soy_textured: { familyId: 'fam_soy_textured', variantType: 'canonical' },

  // Dairy — multi-variant (milk, greek yogurt) + singletons
  dai_whole_milk:     { familyId: 'fam_milk',          variantType: 'canonical' },
  dai_skim_milk:      { familyId: 'fam_milk',          variantType: 'quality' },
  dai_greek_yogurt:   { familyId: 'fam_greek_yogurt',  variantType: 'canonical' },
  dai_greek_yogurt_0: { familyId: 'fam_greek_yogurt',  variantType: 'quality' },
  dai_cottage_cheese: { familyId: 'fam_cottage_cheese', variantType: 'canonical' },
  dai_fresh_cheese:   { familyId: 'fam_fresh_cheese',  variantType: 'canonical' },
  dai_cured_cheese:   { familyId: 'fam_cured_cheese',  variantType: 'canonical' },
  dai_mozzarella:     { familyId: 'fam_mozzarella',    variantType: 'canonical' },
  dai_parmesan:       { familyId: 'fam_parmesan',      variantType: 'canonical' },
  dai_butter:         { familyId: 'fam_butter',        variantType: 'canonical' },
  dai_kefir:          { familyId: 'fam_kefir',         variantType: 'canonical' },

  // Oils — all singletons
  oil_olive:   { familyId: 'fam_olive_oil',   variantType: 'canonical' },
  oil_coconut: { familyId: 'fam_coconut_oil', variantType: 'canonical' },
  oil_avocado: { familyId: 'fam_avocado_oil', variantType: 'canonical' },
  oil_sesame:  { familyId: 'fam_sesame_oil',  variantType: 'canonical' },
  oil_ghee:    { familyId: 'fam_ghee',        variantType: 'canonical' },

  // Nuts & seeds — multi-variant (peanut, almond) + singletons
  nut_almonds:       { familyId: 'fam_almond',     variantType: 'canonical' },
  nut_almond_butter: { familyId: 'fam_almond',     variantType: 'preparation' },
  nut_peanuts:       { familyId: 'fam_peanut',     variantType: 'canonical' },
  nut_peanut_butter: { familyId: 'fam_peanut',     variantType: 'preparation' },
  nut_walnuts:       { familyId: 'fam_walnuts',    variantType: 'canonical' },
  nut_cashews:       { familyId: 'fam_cashews',    variantType: 'canonical' },
  nut_pistachios:    { familyId: 'fam_pistachios', variantType: 'canonical' },
  nut_tahini:        { familyId: 'fam_tahini',     variantType: 'canonical' },
  seed_chia:         { familyId: 'fam_chia',       variantType: 'canonical' },
  seed_flax:         { familyId: 'fam_flax',       variantType: 'canonical' },
  seed_pumpkin:      { familyId: 'fam_pumpkin_seed', variantType: 'canonical' },
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
  pan_hummus:              { familyId: 'fam_hummus',              variantType: 'canonical' },
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
};

/**
 * Family display metadata. For multi-variant families we pin a concept-level
 * name + umbrella description (e.g., "Pollo" as an ave de corral, not "Pechuga
 * cruda"). For singletons we omit the entry — the build step below falls back
 * to the canonical variant's name/description so we don't duplicate copy.
 */
interface FamilyMetaOverride {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  aliases?: string[];
}

const FAMILY_META: Record<string, FamilyMetaOverride> = {
  fam_chicken: {
    name: 'Pollo', nameEn: 'Chicken',
    description: 'Ave de corral magra, base proteica versátil. La referencia canónica es la pechuga cruda (USDA).',
    descriptionEn: 'Lean poultry, a versatile protein staple. Canonical reference is raw breast (USDA).',
    aliases: ['pollo', 'chicken', 'ave', 'poultry'],
  },
  fam_beef: {
    name: 'Carne de Res', nameEn: 'Beef',
    description: 'Carne roja rica en hierro y zinc. La referencia canónica es molida 90/10.',
    descriptionEn: 'Red meat, rich in iron and zinc. Canonical reference is 90/10 ground beef.',
    aliases: ['carne de res', 'vaca', 'ternera', 'beef'],
  },
  fam_tuna: {
    name: 'Atún', nameEn: 'Tuna',
    description: 'Pescado azul rico en omega-3. La referencia canónica es fresco.',
    descriptionEn: 'Oily fish rich in omega-3. Canonical reference is fresh tuna.',
    aliases: ['atún', 'tuna', 'bonito'],
  },
  fam_egg: {
    name: 'Huevo', nameEn: 'Egg',
    description: 'Proteína completa con todos los aminoácidos esenciales. La referencia canónica es el huevo entero.',
    descriptionEn: 'Complete protein with all essential amino acids. Canonical reference is whole egg.',
    aliases: ['huevo', 'egg', 'huevos'],
  },
  fam_rice: {
    name: 'Arroz', nameEn: 'Rice',
    description: 'Cereal base en cocinas de todo el mundo. La referencia canónica es arroz blanco cocido.',
    descriptionEn: 'Staple grain in cuisines worldwide. Canonical reference is cooked white rice.',
    aliases: ['arroz', 'rice'],
  },
  fam_bread: {
    name: 'Pan', nameEn: 'Bread',
    description: 'Pan horneado. La referencia canónica es pan integral por su mayor fibra.',
    descriptionEn: 'Baked bread. Canonical reference is whole wheat bread for higher fiber.',
    aliases: ['pan', 'bread'],
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
  fam_peanut: {
    name: 'Cacahuete', nameEn: 'Peanut',
    description: 'Legumbre rica en proteína y grasa monoinsaturada. La referencia canónica es el cacahuete entero.',
    descriptionEn: 'Legume rich in protein and monounsaturated fat. Canonical reference is whole peanut.',
    aliases: ['cacahuete', 'maní', 'peanut'],
  },
  fam_almond: {
    name: 'Almendra', nameEn: 'Almond',
    description: 'Fruto seco rico en vitamina E y grasas saludables. La referencia canónica es la almendra entera.',
    descriptionEn: 'Tree nut rich in vitamin E and healthy fats. Canonical reference is whole almond.',
    aliases: ['almendra', 'almond'],
  },
};

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

  const families: FoodFamily[] = [];
  for (const [familyId, g] of groups) {
    const meta = FAMILY_META[familyId];
    const canonical = g.canonicalIngredient;
    if (!canonical || !g.canonicalVariantId) {
      throw new Error(`food-families: family ${familyId} has no canonical variant`);
    }
    families.push({
      id: familyId,
      name: meta?.name ?? canonical.name,
      nameEn: meta?.nameEn ?? canonical.nameEn,
      description: meta?.description ?? canonical.description,
      descriptionEn: meta?.descriptionEn ?? canonical.descriptionEn,
      category: g.category,
      canonicalVariantId: g.canonicalVariantId,
      variantIds: [g.canonicalVariantId, ...g.variantIds.filter(id => id !== g.canonicalVariantId)],
      aliases: meta?.aliases,
      tags: Array.from(g.tags),
    });
  }
  return families;
}

export const FOOD_FAMILIES: readonly FoodFamily[] = Object.freeze(buildFamilies());

/** Legacy id → family/variant lookup. Exported for the resolver + tests. */
export const VARIANT_ID_TO_FAMILY: Readonly<Record<string, { familyId: string; variantType: VariantType }>> =
  Object.freeze({ ...VARIANT_MAP });
