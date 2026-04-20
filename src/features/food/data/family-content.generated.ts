/**
 * P8 `[1.5.65]` — educational content pack per FoodFamily.
 *
 * This file is designed to be **bootstrapped by `scripts/generate-family-content.mjs`**
 * (Gemini-powered generator) and then **progressively admin-reviewed**. Until the
 * script runs in full, the file ships with a hand-crafted seed for 8 high-traffic
 * families (pollo, salmón, yogur griego, aguacate, brócoli, quinoa, avena, huevo)
 * as reference patterns demonstrating the tone + depth expected.
 *
 * Families without an entry here fall back to their short `description` at render
 * time — `FoodDetail` handles the partial-content case gracefully. There's no
 * build-time requirement for 100% coverage; the i18n symmetry check does apply to
 * any entry that exists (ES ↔ EN).
 *
 * Content format:
 * - `longDescription.es/en` — 120-180 palabras. Origen, perfil nutricional,
 *   producción/cultivo, dato curioso. Tono científico pero accesible.
 * - `culinaryUses` — 5-8 slugs de `CulinaryUseSlug`. Ordenados por frecuencia
 *   de uso real (el primer slot es el uso más canónico).
 * - `substitutes` — 3-5 sustitutos con razón. `familyId` debe existir en
 *   FOOD_FAMILIES (el test `family-content.test.ts` lo valida). Priorizar
 *   sustitutos accesibles en retail español.
 *
 * Admin review workflow:
 * 1. Run `npm run generate:family-content` (requires `VITE_GEMINI_API_KEY`).
 * 2. Inspect the diff of this file.
 * 3. Spot-check tone, factual accuracy, substitute relevance.
 * 4. Commit. No schema version bump needed — fields are optional.
 */
import type { CulinaryUseSlug, SubstituteRef } from '../../../types/food-family';

export interface FamilyContentEntry {
  longDescription: { es: string; en: string };
  culinaryUses: CulinaryUseSlug[];
  substitutes: SubstituteRef[];
}

export const FAMILY_CONTENT: Record<string, FamilyContentEntry> = {
  fam_chicken_breast: {
    longDescription: {
      es: 'La pechuga de pollo es la parte magra por excelencia del ave: alta densidad proteica (≈31 g por cada 100 g) con muy poca grasa saturada, lo que la convierte en pilar de casi cualquier dieta orientada a recomposición corporal o ganancia de masa muscular. Se consume cocida (plancha, horno, vapor, hervida) porque cruda es insípida y presenta riesgo microbiológico. Culturalmente dominante en cocinas anglosajonas y mediterráneas desde la industrialización avícola de los años 50, que abarató su precio por debajo del vacuno o el cerdo. Dato curioso: su baja cantidad de mioglobina es la razón de su tono pálido comparado con el muslo o el contramuslo, que son más jugosos por su mayor contenido de grasa intramuscular.',
      en: 'Chicken breast is poultry’s leanest cut — roughly 31 g of protein per 100 g with very little saturated fat, which is why it anchors most body-recomposition and muscle-gain protocols. It is always cooked (grilled, baked, steamed, boiled) because raw it is bland and presents microbiological risk. Culturally dominant in Anglo and Mediterranean diets since the 1950s poultry industrialization that brought its price below beef and pork. Fun fact: its low myoglobin content is why it is paler than thigh or drumstick — darker cuts are juicier thanks to their higher intramuscular fat.',
    },
    culinaryUses: ['grilling', 'roasting', 'stir-fry', 'meal-prep', 'post-workout', 'batch-cooking'],
    substitutes: [
      { familyId: 'fam_turkey_breast', reason: 'similar-macros' },
      { familyId: 'fam_tuna', reason: 'higher-protein' },
      { familyId: 'fam_tofu', reason: 'plant-based' },
      { familyId: 'fam_cod', reason: 'lower-cal' },
    ],
  },

  fam_salmon: {
    longDescription: {
      es: 'El salmón es un pescado azul rico en ácidos grasos omega-3 (EPA y DHA), los de mayor valor cardiovascular y cerebral documentado. Aporta unas 208 kcal por cada 100 g, con ≈20 g de proteína completa y ≈13 g de grasa de alta calidad. La mayor parte del salmón de consumo habitual en Europa es de acuicultura noruega o escocesa; el salvaje (Alaska, Pacífico) tiene un perfil nutricional similar pero con mayor variabilidad estacional. Se consume fresco, ahumado, curado (gravlax) o en conserva. Dato curioso: su color anaranjado-rosado proviene de astaxantina, un pigmento carotenoide que en piscifactoría se añade al pienso para imitar la dieta salvaje del pez.',
      en: 'Salmon is an oily fish rich in omega-3 fatty acids (EPA and DHA), the most cardiovascular- and brain-active forms documented. About 208 kcal per 100 g, with ≈20 g of complete protein and ≈13 g of high-quality fat. Most salmon sold in Europe is farmed (Norway, Scotland); wild salmon (Alaska, Pacific) has a similar nutritional profile with seasonal variability. Eaten fresh, smoked, cured (gravlax) or canned. Fun fact: the orange-pink color comes from astaxanthin, a carotenoid pigment added to farmed salmon feed to mimic the wild diet.',
    },
    culinaryUses: ['grilling', 'baking', 'raw-salads', 'meal-prep', 'post-workout'],
    substitutes: [
      { familyId: 'fam_sardines', reason: 'similar-macros' },
      { familyId: 'fam_tuna', reason: 'higher-protein' },
      { familyId: 'fam_cod', reason: 'lower-cal' },
    ],
  },

  fam_greek_yogurt: {
    longDescription: {
      es: 'El yogur griego se elabora colando el suero del yogur tradicional, lo que concentra la proteína (≈10 g por cada 100 g, el doble que un yogur natural) y reduce ligeramente la lactosa. Textura densa y cremosa, ligeramente ácida. Originario de los Balcanes y Grecia — donde es consumo diario con miel y nueces — ha ganado mercado global desde 2008 asociado a dietas altas en proteína. Dato curioso: el yogur griego auténtico requiere una proporción de 4:1 de leche por yogur final; el proceso de colado genera "suero de yogur" como subproducto, tradicionalmente usado como fertilizante o pienso animal.',
      en: 'Greek yogurt is made by straining the whey from regular yogurt, which concentrates the protein (≈10 g per 100 g, double that of plain yogurt) and slightly reduces lactose. Dense, creamy texture, mildly tangy. Originating in the Balkans and Greece — where it is daily fare with honey and walnuts — it has gained global market share since 2008 tied to high-protein diets. Fun fact: authentic Greek yogurt requires a 4:1 ratio of milk to finished yogurt; the straining process yields "yogurt whey" as a byproduct, traditionally used as fertilizer or animal feed.',
    },
    culinaryUses: ['breakfast', 'snack', 'smoothies', 'post-workout', 'dressing', 'dessert'],
    substitutes: [
      { familyId: 'fam_cottage_cheese', reason: 'similar-macros' },
      { familyId: 'fam_kefir', reason: 'similar-flavor' },
      { familyId: 'fam_fresh_cheese', reason: 'higher-protein' },
      { familyId: 'fam_yogurt', reason: 'cheaper' },
    ],
  },

  fam_avocado: {
    longDescription: {
      es: 'El aguacate es una fruta originaria de Mesoamérica (domesticado en México hace ≈5000 años) pero consumido hoy como si fuera un vegetal graso. Aporta ≈160 kcal por 100 g — la gran mayoría en forma de ácido oleico, la misma grasa monoinsaturada del aceite de oliva. Muy rico en fibra (≈7 g) y potasio (485 mg, más que un plátano). La variedad Hass domina el comercio internacional por su piel gruesa que resiste el transporte. Dato curioso: el aguacate es una baya gigante de una sola semilla, y el árbol tarda 4-6 años en dar fruto; por su alto consumo hídrico el cultivo masivo en Michoacán (México) y Chile ha generado tensiones ecológicas significativas.',
      en: 'Avocado is a fruit native to Mesoamerica (domesticated in Mexico ≈5000 years ago) but eaten today as a fatty vegetable. About 160 kcal per 100 g — most as oleic acid, the same monounsaturated fat as olive oil. Very high in fiber (≈7 g) and potassium (485 mg, more than a banana). The Hass variety dominates international trade thanks to its thick skin that survives transport. Fun fact: the avocado is a giant one-seeded berry, and the tree takes 4-6 years to bear fruit; its massive water footprint in Michoacán (Mexico) and Chile has caused significant ecological tensions.',
    },
    culinaryUses: ['raw-salads', 'spread', 'breakfast', 'snack', 'dressing'],
    substitutes: [
      { familyId: 'fam_hummus', reason: 'similar-flavor' },
      { familyId: 'fam_almond_butter', reason: 'similar-macros' },
      { familyId: 'fam_peanut_butter', reason: 'plant-based' },
    ],
  },

  fam_broccoli: {
    longDescription: {
      es: 'El brócoli es una crucífera emparentada con la col, la coliflor y la col de Bruselas, todas derivadas de la misma especie silvestre (Brassica oleracea) domesticada por selección humana en cuencas mediterráneas. Aporta 34 kcal por 100 g, con ≈2,8 g de proteína y ≈2,6 g de fibra; es una de las hortalizas más densas nutricionalmente, destacando por su aporte de vitamina C (89 mg, el 100 % de la recomendación diaria) y sulforafano, compuesto con actividad antioxidante estudiada. Se consume crudo en ensaladas, salteado al wok, al vapor (método que mejor preserva el sulforafano) o asado. Dato curioso: el tallo es igual de comestible que los floretes y aporta más fibra por gramo.',
      en: 'Broccoli is a brassica cousin of cabbage, cauliflower and Brussels sprouts — all derived from the same wild species (Brassica oleracea) domesticated by human selection in Mediterranean basins. About 34 kcal per 100 g, with ≈2.8 g protein and ≈2.6 g fiber; one of the most nutrient-dense vegetables, notably vitamin C (89 mg, 100 % of daily reference) and sulforaphane, an antioxidant compound under active research. Eaten raw in salads, stir-fried, steamed (the method that best preserves sulforaphane) or roasted. Fun fact: the stem is as edible as the florets and delivers more fiber per gram.',
    },
    culinaryUses: ['stir-fry', 'roasting', 'raw-salads', 'stews-soups', 'meal-prep'],
    substitutes: [
      { familyId: 'fam_cauliflower', reason: 'similar-flavor' },
      { familyId: 'fam_kale', reason: 'similar-macros' },
      { familyId: 'fam_green_beans', reason: 'lower-cal' },
    ],
  },

  fam_quinoa: {
    longDescription: {
      es: 'La quinoa es una semilla de una planta herbácea (Chenopodium quinoa) nativa de los Andes, cultivada hace más de 5000 años por civilizaciones pre-incaicas. Se consume como cereal pero botánicamente es un pseudocereal — sin gluten, con proteína completa (≈14 g por 100 g seca) que incluye los nueve aminoácidos esenciales, rareza entre vegetales. Aporta 368 kcal por 100 g cruda, ≈64 g de carbohidratos complejos y 7 g de fibra. Dato curioso: las saponinas de la cáscara son amargas y potencialmente tóxicas, por lo que casi toda la quinoa comercial viene pre-enjuagada; si no, hay que lavarla hasta que el agua salga transparente antes de cocinarla.',
      en: 'Quinoa is a seed from a herbaceous plant (Chenopodium quinoa) native to the Andes, cultivated over 5000 years ago by pre-Inca civilizations. Used like a grain, but botanically a pseudocereal — gluten-free, with complete protein (≈14 g per 100 g dry) including all nine essential amino acids, a rarity among plants. About 368 kcal per 100 g raw, with ≈64 g complex carbs and 7 g fiber. Fun fact: the hull contains bitter, mildly toxic saponins, so almost all commercial quinoa ships pre-rinsed; otherwise you must wash it until the water runs clear before cooking.',
    },
    culinaryUses: ['meal-prep', 'batch-cooking', 'raw-salads', 'stews-soups', 'breakfast'],
    substitutes: [
      { familyId: 'fam_buckwheat', reason: 'gluten-free' },
      { familyId: 'fam_rice_brown', reason: 'cheaper' },
      { familyId: 'fam_couscous', reason: 'similar-macros' },
    ],
  },

  fam_oats: {
    longDescription: {
      es: 'La avena es un cereal de clima templado (Avena sativa) cultivado en Europa y Norteamérica desde la Edad del Bronce. Aporta 389 kcal por 100 g secos, ≈17 g de proteína, ≈66 g de carbohidratos y ≈11 g de fibra soluble — principalmente beta-glucano, un polisacárido con evidencia sólida de reducción del colesterol LDL cuando se consume ≥3 g al día. Es naturalmente sin gluten pero suele contaminarse con trigo en el procesamiento; los celíacos deben buscar versiones certificadas. Dato curioso: el concepto de "avena instantánea" nació en los años 60 para uso militar; hoy domina el mercado pero tiene un índice glucémico más alto que el copo tradicional porque la pre-cocción rompe el almidón.',
      en: 'Oats are a temperate-climate grain (Avena sativa) grown in Europe and North America since the Bronze Age. About 389 kcal per 100 g dry, ≈17 g protein, ≈66 g carbs and ≈11 g soluble fiber — mostly beta-glucan, a polysaccharide with solid evidence for LDL cholesterol reduction when ≥3 g/day is consumed. Naturally gluten-free but often cross-contaminated with wheat during processing; celiacs must seek certified versions. Fun fact: "instant oats" were invented in the 1960s for military use; today they dominate the market but carry a higher glycemic index than rolled oats because pre-cooking breaks down the starch.',
    },
    culinaryUses: ['breakfast', 'baking', 'batch-cooking', 'smoothies', 'snack', 'pre-workout'],
    substitutes: [
      { familyId: 'fam_quinoa', reason: 'gluten-free' },
      { familyId: 'fam_buckwheat', reason: 'similar-macros' },
      { familyId: 'fam_granola', reason: 'similar-flavor' },
    ],
  },

  fam_egg_whole: {
    longDescription: {
      es: 'El huevo es uno de los alimentos más densos nutricionalmente que existen. Aporta ≈155 kcal por 100 g (unos 2 huevos medianos), con 13 g de proteína completa y 11 g de grasa — mayoritariamente insaturada, repartida entre la yema (donde viven también todas las vitaminas liposolubles, colina y luteína). La clara es proteína casi pura (albumen). La rehabilitación del huevo tras décadas de demonización por colesterol arrancó con metaestudios de 2015-2020 que no encontraron asociación con enfermedad cardiovascular en sujetos sanos. Dato curioso: el color de la cáscara (blanco vs moreno) depende solo de la genética de la gallina, no tiene impacto nutricional alguno.',
      en: 'The egg is one of the most nutrient-dense foods in existence. About 155 kcal per 100 g (roughly 2 medium eggs), with 13 g of complete protein and 11 g of fat — mostly unsaturated, concentrated in the yolk (where all fat-soluble vitamins, choline and lutein also live). The white is nearly pure protein (albumen). The rehabilitation of the egg after decades of cholesterol demonization began with 2015-2020 meta-studies that found no association with cardiovascular disease in healthy subjects. Fun fact: shell color (white vs brown) depends only on the hen’s genetics — no nutritional impact whatsoever.',
    },
    culinaryUses: ['breakfast', 'baking', 'meal-prep', 'post-workout', 'snack'],
    substitutes: [
      { familyId: 'fam_egg_whites', reason: 'lower-cal' },
      { familyId: 'fam_tofu', reason: 'plant-based' },
      { familyId: 'fam_greek_yogurt', reason: 'similar-macros' },
    ],
  },
};

/**
 * Lookup helper. Returns the content entry or `undefined` when the family has
 * no curated content yet. FoodDetail handles the undefined case gracefully.
 */
export function getFamilyContent(familyId: string): FamilyContentEntry | undefined {
  return FAMILY_CONTENT[familyId];
}
