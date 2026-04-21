/**
 * P8 `[1.5.65]` — FAMILY_IMAGES map: familyId → emoji (or `svg:<id>`).
 *
 * Design decision (AskUserQuestion 2026-04-21): emoji-only curated catalog.
 * - Zero network, 100% offline, consistent across platforms.
 * - Coverage target: 100% of seed FoodFamilies. Unmapped ids fall back to the
 *   generic plate emoji via `getFamilyImage()`.
 * - Duplicates are fine: all chicken cuts share 🍗 because the family name
 *   carries the distinction (pechuga / muslo / contramuslo / ala / entero).
 *   The emoji anchors the *species*, not the *cut*.
 *
 * When an emoji genuinely doesn't exist for a family (tempeh, seitan, tofu,
 * seitán, nutritional yeast), we pick the closest thematic emoji; a future
 * sprint (P16) can upgrade to real photography in a CDN.
 *
 * Validation: `family-images.test.ts` asserts every seed family has a mapping
 * and the value is a non-empty string. The test also flags duplicates inside
 * the same subcategory if they would lead to visual ambiguity (not enforced;
 * diagnostic only).
 */

/**
 * Fallback emoji for unmapped families. Generic plate covers the "food" concept
 * without committing to a food type.
 */
export const FALLBACK_FAMILY_IMAGE = '🍽️';

export const FAMILY_IMAGES: Record<string, string> = {
  // --- Proteins: Aves ---
  fam_chicken_breast:    '🍗',
  fam_chicken_thigh:     '🍗',
  fam_chicken_drumstick: '🍗',
  fam_chicken_wing:      '🍗',
  fam_chicken_whole:     '🍗',
  fam_turkey_breast:     '🦃',

  // --- Proteins: Vacuno ---
  fam_beef_ground:       '🥩',
  fam_beef_steak:        '🥩',

  // --- Proteins: Cerdo / Caza / Embutidos ---
  fam_pork_loin:         '🥩',
  fam_lamb:              '🥩',
  fam_rabbit:            '🐇',
  fam_jamon_serrano:     '🥓',

  // --- Proteins: Pescado azul ---
  fam_salmon:            '🐟',
  fam_tuna:              '🐟',
  fam_sardines:          '🐟',

  // --- Proteins: Pescado blanco ---
  fam_cod:               '🐟',
  fam_sea_bass:          '🐟',

  // --- Proteins: Marisco ---
  fam_shrimp:            '🦐',
  fam_squid:             '🦑',

  // --- Proteins: Huevo ---
  fam_egg_whole:         '🥚',
  fam_egg_whites:        '🥚',

  // --- Proteins: Vegetales ---
  fam_tofu:              '🧆',
  fam_tempeh:            '🧆',
  fam_seitan:            '🧆',

  // --- Vegetales: Crucíferas ---
  fam_broccoli:          '🥦',
  fam_cauliflower:       '🥦',
  fam_kale:              '🥬',
  fam_arugula:           '🥬',

  // --- Vegetales: Hojas ---
  fam_spinach:           '🥬',
  fam_lettuce:           '🥬',
  fam_chard:             '🥬',

  // --- Vegetales: Solanáceas ---
  fam_tomato:            '🍅',
  fam_bell_pepper_red:   '🫑',
  fam_eggplant:          '🍆',

  // --- Vegetales: Alliums ---
  fam_onion:             '🧅',
  fam_garlic:            '🧄',
  fam_leek:              '🧅',

  // --- Vegetales: Cucurbitáceas ---
  fam_pumpkin:           '🎃',
  fam_zucchini:          '🥒',
  fam_cucumber:          '🥒',

  // --- Vegetales: Raíces / Tubérculos ---
  fam_carrot:            '🥕',
  fam_potato:            '🥔',
  fam_sweet_potato:      '🍠',
  fam_beetroot:          '🫘',

  // --- Vegetales: Otras ---
  fam_asparagus:         '🌱',
  fam_artichoke:         '🌿',
  fam_mushroom:          '🍄',
  fam_celery:            '🥬',
  fam_green_beans:       '🫘',
  fam_corn:              '🌽',
  fam_peas:              '🫛',

  // --- Frutas: Cítricos ---
  fam_orange:            '🍊',
  fam_lemon:             '🍋',

  // --- Frutas: Bayas ---
  fam_strawberry:        '🍓',
  fam_blueberry:         '🫐',
  fam_raspberry:         '🍓',

  // --- Frutas: Pomo / Hueso ---
  fam_apple:             '🍎',
  fam_pear:              '🍐',

  // --- Frutas: Tropicales ---
  fam_banana:            '🍌',
  fam_mango:             '🥭',
  fam_pineapple:         '🍍',
  fam_kiwi:              '🥝',
  fam_date:              '🌴',

  // --- Frutas: Vid / Melón ---
  fam_grape:             '🍇',
  fam_watermelon:        '🍉',

  // --- Granos: Arroz ---
  fam_rice_white:        '🍚',
  fam_rice_brown:        '🍚',

  // --- Granos: Pan ---
  fam_bread_white:       '🍞',
  fam_bread_wholewheat:  '🍞',
  fam_tortilla_wrap:     '🌯',

  // --- Granos: Pasta / Trigo ---
  fam_pasta:             '🍝',
  fam_couscous:          '🌾',

  // --- Granos: Pseudocereales ---
  fam_quinoa:            '🌾',
  fam_buckwheat:         '🌾',
  fam_oats:              '🥣',
  fam_granola:           '🥣',

  // --- Lácteos: Leche ---
  fam_milk:              '🥛',

  // --- Lácteos: Yogur ---
  fam_yogurt:            '🥣',
  fam_greek_yogurt:      '🥣',
  fam_kefir:             '🥛',

  // --- Lácteos: Queso fresco / curado ---
  fam_fresh_cheese:      '🧀',
  fam_cottage_cheese:    '🧀',
  fam_mozzarella:        '🧀',
  fam_cured_cheese:      '🧀',
  fam_parmesan:          '🧀',

  // --- Lácteos: Grasas lácteas ---
  fam_butter:            '🧈',

  // --- Frutos secos / Semillas ---
  fam_almond:            '🌰',
  fam_cashews:           '🌰',
  fam_pistachios:        '🌰',
  fam_walnuts:           '🌰',
  fam_peanut:            '🥜',
  fam_sunflower_seed:    '🌻',
  fam_pumpkin_seed:      '🎃',
  fam_chia:              '🌱',
  fam_flax:              '🌱',

  // --- Mantecas / Pastas ---
  fam_peanut_butter:     '🥜',
  fam_almond_butter:     '🌰',
  fam_tahini:            '🌱',
  fam_hummus:            '🫘',

  // --- Aceites / Grasas (flat, sin subcategoría) ---
  // Oils: render plano. No subcategory.
  // (En seed actual no aparece 'fam_olive_oil' como family nombrada; se añade si existe)

  // --- Bebidas vegetales (prepared) ---
  fam_almond_milk:       '🥛',
  fam_oat_milk:           '🥛',

  // --- Despensa: Endulzantes ---
  fam_honey:             '🍯',
  fam_sugar:             '🧂',

  // --- Despensa: Chocolate / Cacao ---
  fam_dark_chocolate:    '🍫',
  fam_cocoa_powder:      '🍫',

  // --- Despensa: Salsas / Condimentos ---
  fam_soy_sauce:         '🧂',
  fam_tomato_sauce:      '🥫',
  fam_mayonnaise:        '🥫',
  fam_mustard:           '🧂',
  fam_apple_cider_vinegar: '🧂',

  // --- Bebidas ---
  fam_coffee:            '☕',
  fam_cola:              '🥤',
  fam_beer:              '🍺',
  fam_wine:              '🍷',
  fam_orange_juice:      '🧃',
  fam_coconut_water:     '🥥',
  fam_sparkling_water:   '💧',
  fam_energy_drink:      '🥤',
  fam_sports_drink:      '🥤',

  // --- Snacks / preparados ---
  fam_protein_bar:       '🍫',

  // --- Frutas (faltantes del primer pase) ---
  fam_avocado:           '🥑',

  // --- Legumbres (category: 'legumes', no subcategory) ---
  fam_lentils:           '🫘',
  fam_chickpeas:         '🫘',
  fam_black_beans:       '🫘',
  fam_white_beans:       '🫘',
  fam_edamame:           '🫛',
  fam_soy_textured:      '🫘',

  // --- Aceites / Grasas (category: 'oils', no subcategory) ---
  fam_olive_oil:         '🫒',
  fam_coconut_oil:       '🥥',
  fam_avocado_oil:       '🥑',
  fam_sesame_oil:        '🌱',
  fam_ghee:              '🧈',

  // --- Suplementos (category: 'supplements', no subcategory) ---
  fam_whey_protein:      '💪',
  fam_vegan_protein:     '🌱',
  fam_creatine:          '💊',

  // P12 [1.5.70] — Expansion de básicos España
  fam_hake:                '🐟',
  fam_trout:               '🐟',
  fam_anchovy:             '🐟',
  fam_sea_bream:           '🐟',
  fam_mussels:             '🦪',
  fam_clams:               '🦪',
  fam_octopus:             '🐙',
  fam_ham_cooked:          '🥩',
  fam_bell_pepper_green:   '🫑',
  fam_bell_pepper_yellow:  '🫑',
  fam_radish:              '🥕',
  fam_spring_onion:        '🧅',
  fam_endive:              '🥬',
  fam_tangerine:            '🍊',
  fam_peach:                '🍑',
  fam_plum:                 '🍑',
  fam_cherry:               '🍒',
  fam_raisin:               '🍇',
  fam_pomegranate:          '🍎',
  fam_barley:               '🌾',
  fam_rye:                  '🌾',
  fam_bulgur:               '🌾',
  fam_kidney_beans:         '🫘',
  fam_pinto_beans:          '🫘',
  fam_fava_beans:           '🫘',
  fam_skyr:                 '🥣',
  fam_ricotta:              '🧀',
  fam_manchego:             '🧀',
  fam_hazelnut:             '🌰',
  fam_sesame_seed:          '🌱',
  fam_sunflower_oil:        '🌻',
  fam_ketchup:              '🍅',
  fam_wine_vinegar:         '🍷',
  fam_balsamic_vinegar:     '🍷',
  fam_pesto:                '🌿',
  fam_jam:                  '🍓',
  fam_salt:                 '🧂',
  fam_black_pepper:         '🌶️',
  fam_paprika:              '🌶️',
  fam_water:                '💧',
  fam_green_tea:            '🍵',
  fam_black_tea:            '🫖',
  fam_gazpacho:             '🍅',
};

/**
 * Returns the emoji/svg reference for a family id, or `FALLBACK_FAMILY_IMAGE`
 * when the id is not mapped. Pure lookup — no locale, no dependency on
 * userProfile.
 */
export function getFamilyImage(familyId: string): string {
  return FAMILY_IMAGES[familyId] ?? FALLBACK_FAMILY_IMAGE;
}
