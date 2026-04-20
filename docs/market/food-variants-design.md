# Food Variants — Design proposal

> **Status:** P0-P2 + P2.5 + P2.6 shipped · **Owner:** @novara-bbs · **Author:** dev-agent 2026-04-19 PM · **Last revised:** 2026-04-20 (P2.6 seed expansion + drill-down UX at scale)
> **Scope:** FoodDictionary data model + AddMeal picker + RecipeDetail swap + BarcodeScanner integration + CreateRecipe
> **Relation to roadmap:** sibling of Q19 meal-taxonomy. Not part of S3 audit waves. Needs its own multi-phase sprint.

> **P2.5 refinement (2026-04-20).** Owner feedback reclassified "products are families, variants are attributes": `variantType: 'cut'` dropped (pechuga vs muslo are distinct products bajo una subfamilia `aves`, not variants of the same chicken); multi-axis variants introduced via `qualityTags?` orthogonal to `variantType` singular; new **3-tier taxonomy** `category → subcategory → family → variant` with `FoodFamily.subcategory?: string` (48 slugs); clasificación regla "si lo compras aparte, es un producto separado". See CHANGELOG `[1.5.56]` for write set + §2.2 below for the mapping of owner vocabulary ↔ code identifiers.

> **P2.6 seed + UX escalable (2026-04-20).** Owner directives: *"llena el seed con más productos de la categoria familia, tipos de pollo los que hay en base a partes que se venden en el super"* + *"variantes por ejemplo en lidl u otro super que veas online mete los seed"* + *"con que me ponga que hay variantes a nivel general me vale no me digas cuantas"* + *"razona que todo sea escalable a cuando estemos escaneando datos de 100 marcas o supermercados diferentes"*. Write set: +7 USDA chicken cuts (muslo/contramuslo/ala/pollo entero raw+cooked), +4 families bajo `subcategory: 'aves'`, +8 real retail brand variants (Hacendado/Oikos/Sveltesse/BonÀrea/Carrefour Bio/Lidl Mister Choc) via new top-level `SEED_BRAND_ENTRIES`, 2 resolver helpers (`groupVariantsByType` + `topVariantsByFamily`) + 9 unit tests, generic badge (dot + "VARIANTES" uppercase) replacing numeric count, drill-down grouped por `variantType` con `INITIAL_LIMIT = 5` + "Ver más" toggle per-group. See CHANGELOG `[1.5.57]` + §10 below for the rationale + brand seed table + scale math.

---

## 1. Problem

El diccionario hoy (`src/features/food/data/ingredients.ts`, ~276 entradas planas) confunde dos ejes que los usuarios no distinguen bien:

- **Alimento canónico** ("pollo", "aguacate", "yogur griego")
- **Variantes** del mismo alimento: cortes (pechuga/muslo), estados (crudo/cocido), calidades (corral/grass-fed/orgánico), regiones ("tikka"), y — lo más pesado — **marcas** cuando el usuario escanea un producto.

Síntomas:

1. **El directorio no escala.** Si añadimos 6 variantes de pollo + 3 marcas de yogur + 4 tipos de aguacate, una lista plana de ~200 entradas se convierte en ~1000+ rows planas. MFP ya cayó ahí (buscar "chicken breast" devuelve 2000+ resultados indistinguibles).
2. **Las recetas se acoplan a la variante concreta.** Hoy `RecipeIngredient.ingredientId` apunta a `pro_chicken_breast_cooked` — si el usuario prefiere corral, no hay forma de "swapear la variante" sin forkear la receta.
3. **El escaneo de marca no tiene hogar.** `BarcodeScanner` devuelve un `OFFResult` ephemeral que no se parenta a ningún canónico. Hoy se cuelga plano en `userFoods`, sin agruparse.
4. **No hay perfil de preferencias por alimento.** Si Clara siempre compra yogur Hacendado y Marcos compra griego entero, cada vez que abren una receta con "yogur" ven los macros genéricos — no hay nada que les diga "tu yogur de siempre tiene 20 kcal menos".

Precedente competitivo (ver `docs/market/deep-dives/myfitnesspal.md` + `docs/market/ux-patterns.md`):

- **MFP**: generic + branded duplicates en flat list, sin familia. Pain point documentado.
- **Yazio / Lifesum / MyRealFood / Cronometer**: modelo plano similar.
- **Yuka**: solo marcas, sin canónico.
- **Paprika / Mealime**: recipe-centric, sin árbol de alimentos.
- **Nadie** resuelve `familia → variantes → marcas` cohesivo. Es un diferenciador real para RIAL.

## 2. Propuesta: `FoodFamily` + `FoodVariant`

Separación limpia entre "paraguas" (familia) y "instancia concreta con macros" (variante).

### 2.1 Data model

```ts
// NUEVO — la "umbrella" / canónico / concepto
export interface FoodFamily {
  id: string;                      // 'fam_chicken_breast', 'fam_avocado', 'fam_greek_yogurt'
  name: string;                    // 'Pechuga de pollo'
  nameEn: string;                  // 'Chicken breast'
  description: string;
  descriptionEn: string;
  category: IngredientCategory;

  /** P2.5 — subfamilia (nivel intermedio entre `category` y `family`).
   *  Slug kebab-case (`'aves'`, `'queso-curado'`, `'cruciferas'`). Opcional:
   *  `undefined` = render plano bajo `category` (oils/legumes/supplements).
   *  Label se resuelve en runtime vía `t.foodDictionary.subcategoryLabels[slug]`. */
  subcategory?: string;

  /** Variante por defecto — lo que la receta "ve" si no hay pin.
   *  Normalmente la referencia USDA genérica (macros promedio). */
  canonicalVariantId: string;

  /** Todas las variantes de esta familia. */
  variantIds: string[];

  /** Aliases para búsqueda fuzzy: 'pollo', 'chicken', 'ave'. */
  aliases?: string[];

  /** Tags de familia — heredados por variantes salvo override. */
  tags: FoodTag[];
}

// REFACTOR — el actual `Ingredient` se renombra a `FoodVariant` + gana `familyId`
export interface FoodVariant {
  id: string;                      // 'var_chicken_breast_raw', 'var_chicken_free_range', 'var_chicken_hacendado'
  familyId: string;                // REQUIRED — backlink a la familia
  name: string;
  nameEn: string;

  /** Tipo semántico — eje DISCRIMINANTE en la lista de variantes.
   *  P2.5 drop: `'cut'` se eliminó — los cortes (pechuga/muslo/ala) son
   *  FAMILIAS propias bajo la misma `subcategory`, no variantes. */
  variantType:
    | 'canonical'                  // USDA genérica — la "media", default
    | 'preparation'                // crudo / cocido / asado / plancha
    | 'quality'                    // 0% / entero / sin azúcar / con vs sin lactosa
    | 'regional'                   // lager vs IPA, tinto vs blanco, basmati vs jazmín
    | 'brand'                      // Hacendado, La Piara, producto OFF escaneado
    | 'user';                      // custom creado por el usuario

  /** P2.5 — ejes ORTOGONALES al `variantType` primario.
   *  Un mismo variant puede llevar `variantType: 'brand'` (eje primario: es una
   *  marca concreta) Y `qualityTags: ['free-range', 'organic']` (ejes
   *  secundarios: además es corral y ecológico). Renderizado como chips bajo
   *  el nombre en `<VariantRow>`. Labels vía `t.foodDictionary.qualityTagLabels[slug]`.
   *  9 slugs canónicos: `organic | free-range | grass-fed | light | sugar-free |
   *  lactose-free | gluten-free | high-protein | no-additives`. */
  qualityTags?: string[];

  /** Metadata de marca — solo para variantType 'brand' o 'user' escaneado. */
  brand?: {
    name: string;                  // 'Hacendado', 'Mercadona'
    barcode?: string;              // habilita scan→find-under-family en el futuro
    scanned?: boolean;             // true si entró vía BarcodeScanner
  };

  // Igual que el Ingredient actual:
  baseAmount: number;
  baseUnit: string;
  servingSizes: ServingSize[];
  macros: Macros;
  micros: Micronutrients;
  allergens: Allergen[];
  tags?: FoodTag[];                // override opcional de tags de familia

  /** Provenance — distingue seed / user / OFF / Edamam. */
  source: 'seed' | 'user' | 'off' | 'edamam';
  sourceId?: string;               // código OFF, id Edamam, etc.
  createdAt?: number;              // epoch ms — solo user variants
}

// RecipeIngredient evoluciona a family-first con variant pin opcional
export interface RecipeIngredient {
  id: string;
  familyId: string;                // NUEVO canónico — lo que la receta "quiere"
  variantId?: string;              // NUEVO opcional — si el autor/usuario pinnó una variante concreta
  /** @deprecated usar familyId + variantId. Mantenido para hydration pre-migración. */
  ingredientId?: string;

  amount: number;
  unit: string;

  // Populated at runtime:
  family?: FoodFamily;
  variant?: FoodVariant;           // resolved: variantId || family.canonicalVariantId
}
```

### 2.2 Taxonomía 3-tier (P2.5)

Post-P2.5 el modelo opera con 4 niveles conceptuales — cambia el vocabulario de UI, los tipos TypeScript siguen igual (`FoodFamily` + `FoodVariant`) por continuidad de código.

```
category           (existente: proteins / vegetables / dairy / ...)
  └─ subcategory   (NUEVO: aves / vacuno / crucíferos / queso-curado / ...)
       └─ family   (existente: un producto culinario distinto con su canonical)
            └─ variant  (existente: brand / quality / regional / preparation / user)
```

| Nivel | Usuario dice | Código usa | Ejemplo | Label UI |
|---|---|---|---|---|
| L1 | Familia | `IngredientCategory` | Proteínas · Lácteos · Granos | "Proteínas" |
| L2 | Subfamilia | `FoodFamily.subcategory?` | aves · yogur · arroz | "Aves" |
| L3 | Producto | `FoodFamily` | Pechuga de pollo · Yogur griego · Arroz basmati | "Pechuga de Pollo" |
| L4 | Variante | `FoodVariant` | Pechuga de corral Lidl | chips / drill-down |

**Doctrina clasificatoria P2.5:**

1. **Los productos culinarios son familias, no variantes.** Criterio operativo: *si lo puedes comprar aparte en el supermercado, es un producto separado.* Pechuga ≠ muslo ≠ ala → 3 familias bajo `aves`. Molida ≠ filete → 2 familias bajo `vacuno`. Huevo entero ≠ clara → 2 familias bajo `huevo` (las claras se venden en brick separado). Arroz blanco ≠ integral → 2 familias bajo `arroz` (fibra 3×, IG distinto). Cacahuetes ≠ crema de cacahuete → 2 familias en subcategorías distintas (`frutos-secos` vs `mantecas-pastas`).

2. **Las variantes son el mismo producto con atributos.** Ejes válidos: `preparation` (crudo↔cocido, fresco↔conserva), `quality` (0%↔entero, con↔sin azúcar), `regional` (tinto↔blanco, lager↔IPA), `brand` (Hacendado, Lidl), `user` (custom).

3. **Multi-axis: `variantType` + `qualityTags`.** Una misma variante puede llevar `variantType: 'brand'` (eje primario: es Lidl) Y `qualityTags: ['free-range', 'organic']` (ejes secundarios: además es corral y ecológico). Los chips renderan bajo el nombre en `<VariantRow>`.

4. **`variantType: 'cut'` eliminado.** 7 → 6 literales. Fue un atajo semántico mal planteado: los cortes no son atributos del mismo producto, son productos distintos.

5. **Subcategory opcional.** Categorías con <6 productos u homogéneas (oils / legumes / supplements) no la usan — render plano. Las pobladas (proteins / vegetables / dairy / grains / nuts / beverages) sí.

**48 subcategorías canónicas (post P2.5):**

| Category | Subcategorías |
|---|---|
| proteins (10) | aves · vacuno · cerdo · pescado-azul · pescado-blanco · marisco · huevo · vegetal · caza · embutidos |
| vegetables (7) | cruciferas · hojas · raices-tuberculos · solanaceas · alliums · cucurbitaceas · otras |
| fruits (7) | tropicales · bayas · citricos · pomo · hueso · vid · melon |
| grains (4) | arroz · pan · pseudocereales · pasta-trigo |
| dairy (5) | leche · yogur · queso-fresco · queso-curado · grasas-lacteas |
| nuts (3) | frutos-secos · semillas · mantecas-pastas |
| pantry (4) | endulzantes · chocolate-cacao · salsas · condimentos |
| prepared (2) | bebidas-vegetales · snacks |
| beverages (7) | cerveza · vino · refresco · cafe-te · zumos · aguas · energeticas |
| oils / legumes / supplements | ∅ (render plano) |

### 2.3 Relaciones

- **1 `FoodFamily` → N `FoodVariant`.**
- Cada familia tiene **exactamente 1** `canonicalVariantId` — típicamente la referencia USDA genérica.
- Macros de la receta por defecto = macros de `canonicalVariant`. Sin forks, sin duplicación.
- Override **por-receta**: el autor de la receta puede pinnear `variantId` concreto (e.g., "específicamente pollo de corral" si la receta lo requiere culinariamente).
- Override **por-usuario**: `userProfile.variantPreferences: Record<familyId, variantId>` — "siempre que veas pollo, úsame pollo de corral en mis macros". Aplica en runtime, no modifica la receta publicada.

### 2.4 Prioridad de resolución

Cuando la UI necesita renderizar los macros de una receta, resuelve cada `RecipeIngredient` así:

```
1. Si RecipeIngredient.variantId → usa esa variante (pin explícito del autor).
2. Else si userProfile.variantPreferences[familyId] → usa esa variante (preferencia personal).
3. Else → usa family.canonicalVariantId.
```

## 3. Bootstrap del catálogo (post P2.5)

**P0-P2 (shipped `[1.5.54]`):** derivación in-memory — `FOOD_FAMILIES` + `FOOD_VARIANTS` se generan en module-load desde `INGREDIENT_DICTIONARY` + `VARIANT_MAP` en `src/features/food/data/food-families.ts`. Zero duplicación de macros: `ingredients.ts` sigue siendo single source of truth.

**P2.5 (shipped `[1.5.56]`):** refactor taxonómico — 126 → 133 familias tras 6 splits + 1 rename + 1 familia nueva (yogur natural). `VARIANT_MAP` reparenta legacy umbrellas; `FAMILY_SUBCATEGORY` declarado como const top-level; `buildFamilies()` lee `FAMILY_SUBCATEGORY[familyId]` para poblar `family.subcategory`.

### 3.1 Reglas de clasificación aplicadas en P2.5

Para cada cluster identificado por prefijo de ingrediente:

1. **¿Son el mismo producto culinario con atributos variables?** → 1 familia, N variantes.
   Ejemplo: `pro_chicken_breast_raw` + `pro_chicken_breast_cooked` → `fam_chicken_breast` (variantType `canonical` + `preparation`).

2. **¿Son productos culinarios distintos que compras aparte?** → N familias separadas bajo la misma subcategoría.
   Ejemplo: `pro_beef_ground_90` + `pro_beef_steak` → `fam_beef_ground` + `fam_beef_steak` bajo `subcategory: 'vacuno'`.

3. **Test operativo del owner:** *¿lo comprarías en estantes distintos del súper?* Si sí → productos separados. Si no → variantes.
   - Refresco cola normal + zero = misma estantería → variantes (`quality`).
   - Arroz blanco + integral = estanterías distintas → productos separados.
   - Almendra entera + crema de almendras = pasillos distintos → productos separados (distintas subcategorías incluso).

### 3.2 Cambios de data aplicados en P2.5

| Acción | Familia antes | Familia(s) después | Razón |
|---|---|---|---|
| Rename | `fam_chicken` (solo contenía pechuga) | `fam_chicken_breast` | Id mentía sobre el contenido. Habilita `fam_chicken_thigh`/`_wing`/`_whole` en P8 bajo `aves`. |
| Split | `fam_beef` | `fam_beef_ground` + `fam_beef_steak` | Molida vs filete — Δ proteína +35%, productos culinarios distintos. |
| Split | `fam_egg` | `fam_egg_whole` + `fam_egg_whites` | Clara se compra en brick aparte — Δ kcal −64%, Δ fat −98%. |
| Split | `fam_rice` | `fam_rice_white` + `fam_rice_brown` | Fibra ~3×, IG distinto, estanterías distintas. |
| Split | `fam_bread` | `fam_bread_white` + `fam_bread_wholewheat` | Harina refinada vs entera — fibra ~4×. |
| Split | `fam_almond` | `fam_almond` (entera) + `fam_almond_butter` | Snack crujiente vs untable — subcategorías distintas (`frutos-secos` vs `mantecas-pastas`). |
| Split | `fam_peanut` | `fam_peanut` (entero) + `fam_peanut_butter` | Idem almendra. |
| Add | — | `fam_yogurt` (canonical `dai_plain_yogurt`) | Gap pre-P2.5: yogur natural no-griego no existía como entidad. Habilita swap L2 "griego → natural" (§5 matriz). |

### 3.3 Familias multi-variant post-P2.5 (8 confirmadas, ninguna requiere split adicional)

| Familia | Variantes | Eje | Razón |
|---|---|---|---|
| `fam_chicken_breast` | raw / cooked | preparation | Mismo corte, densificación por cocción |
| `fam_tuna` | fresh / canned | preparation | Mismo pez, packaging distinto |
| `fam_milk` | whole / skim | quality | Eje grasa clásico |
| `fam_greek_yogurt` | full / 0% | quality | Misma leche colada, sin grasa |
| `fam_coffee` | black / with_milk | preparation | Adición al mismo café base |
| `fam_wine` | red / white | regional | Tipo de uva, no "producto distinto" |
| `fam_cola` | regular / zero | quality | Con/sin azúcar, misma marca |
| `fam_beer` | lager / ipa | regional | Estilo, misma categoría culinaria |

### 3.4 Matriz de swap (3 niveles, habilitada por la taxonomía 3-tier)

| Nivel | Scope | Ejemplo | Δ macros threshold | UI default (P4) |
|---|---|---|---|---|
| **1. Variant-swap** | Intra-family | Griego Hacendado → Griego Danone | <10% cada macro | Chip-selector inline; 1 tap; sin warning |
| **2. Family-swap** | Intra-subcategory | Griego → Natural (ambos bajo `yogur`) | cualquier | Sección colapsada "Otros productos similares"; muestra Δ por macro |
| **3. Cross-subcategory** | Diferente subcategoría | Yogur → Leche (`yogur` vs `leche`) | N/A | NO aparece en swap default; "Custom swap" fork-ea la receta |

**Implicación:** el tier L2 (`subcategory`) es lo que habilita el **Nivel 2**. Sin él, un swap griego→natural sería indistinguible de griego→leche.

### 3.5 Bootstrap original (P0-P2, referencia histórica)

Derivación in-memory implementada así (pre-P2.5, sigue vigente post-P2.5 pero ahora lee `FAMILY_SUBCATEGORY` y maneja `qualityTags`):

1. **Clusterar los ~139 flat entries por `VARIANT_MAP[ingredientId]`.** El map asigna cada ingredient al `familyId` canónico + su `variantType`.
2. **Convertir cada `Ingredient` en `FoodVariant` on-the-fly** con `familyId` + `variantType` inyectados.
3. **Elegir `canonicalVariantId` por cluster.** Marcado explícitamente en `VARIANT_MAP` via `variantType: 'canonical'`. Heurística: `*_raw` para carnes (ref USDA), entero para lácteos, blanco para granos (excepto donde el split P2.5 ya separó).
4. **Zero codemod** — la derivación es declarativa en `VARIANT_MAP` + `FAMILY_META` + `FAMILY_SUBCATEGORY`. Editar un mapping es editar data, no migrar código.

## 4. UI (7 superficies)

### 4.1 `FoodDictionary` — family list + variant drill-down

- Lista muestra **1 row por familia**. Badge `(5 variantes)` cuando >1.
- Tap family → expande **dentro del mismo card** (como hoy) en `<VariantList>` agrupado por `variantType`:
  - Canonical (1 fila, destacada)
  - Cortes — pechuga, muslo, ala
  - Preparación — crudo, cocido, plancha
  - Calidad — corral, orgánico
  - Marcas — Hacendado, La Piara (con badge `📱 escaneada`)
  - Tuyas — user variants
- Cada variante muestra **delta de macros vs canonical**: `+15 kcal · −0.5g pro · +1.2g grasa` (en verde/rojo según dirección relativa al objetivo del usuario).

### 4.2 `AddMeal` — búsqueda con families

- Búsqueda cruza `family.name` + `family.aliases` + `variant.name` + `variant.brand.name`.
- Resultados: **1 row por familia**, chip `5 variantes` si >1.
- Tap → `<VariantPickerSheet>` (`<BottomSheet size="focus" headerLayout="back-title-action">`). Preselecciona `canonicalVariant` o `userProfile.variantPreferences[familyId]` si existe.
- Botón "Elegir genérico" (cierra con canonical) vs scroll/tap para variante concreta.

### 4.3 `PortionSelector` — sin cambios

Ya opera per-variante. La variante resuelta se le pasa como `ingredient` prop.

### 4.4 `RecipeDetail` — variant swap per-row

- Cada ingredient row muestra `family.name` + variante actual:
  - "Pollo • **genérico**" (italic cuando es el fallback)
  - "Pollo • **pollo de corral (Hacendado)**" (bold cuando es pin)
- Tap row → abre `<VariantSwapSheet>` con la misma lista de variantes que FoodDictionary, pero scoped a esa familia + CTA "Guardar solo para esta receta" vs "Usar siempre para mis recetas" (→ escribe a `variantPreferences`).
- Los macros totales de la receta se recalculan on-the-fly.

### 4.5 `BarcodeScanner` — OFF → variant under family

Flow actual (post S1.3):
1. Scan barcode `8410032002002`.
2. OFF lookup → `{ productName: "Aguacate Hacendado", brand: "Hacendado", macros }`.
3. Sheet: `<FoundSheet>` muestra el producto.

Flow nuevo:
1–2 igual.
3. App busca **familia match** vía fuzzy sobre `family.name + family.aliases + family.nameEn`.
4. Sheet:
   - **Match alto** → "Encontrado: Aguacate Hacendado. ¿Guardar como variante de **Aguacate**?" (pre-checked). User confirma.
   - **Match medio (ambiguo)** → "¿A qué familia pertenece?" + lista top-3 candidatas + "Crear familia nueva".
   - **No match** → "Aguacate Hacendado no coincide con ningún alimento. ¿Crear **nueva familia** con esta variante?" (single-variant family — se puede promover luego).
5. Al confirmar → inserta `FoodVariant` con `variantType='brand'` + `source='off'` + `brand.scanned=true` en `userFoods` (persistido en IDB, sync-gated por Q6).

### 4.6 `CreateRecipe` — ingredient picker v2

- Picker devuelve `{familyId, variantId?}`.
- Default: `familyId` solo (canonical). El autor marca "específicamente" para pinnear variante — indicador visual "📌 pollo de corral" en la row de la receta.
- Indica a usuarios futuros qué parte de la receta admite swap (canonical) vs qué parte está atada culinariamente (pinned).

### 4.7 Settings — variant preferences

Nueva sección en `SettingsNutrition`: "Mis alimentos habituales".
- Grid de familias frecuentes (top-20 por `foodHistory`).
- Tap → elige variante default.
- Escribe a `userProfile.variantPreferences`.
- Preview en tiempo real: "Las recetas con pollo mostrarán ahora tus macros de **pollo de corral**".

## 5. Migración de `RecipeIngredient` legacy

Dual-compat durante 1 release cycle (mismo patrón Q19 meal-taxonomy):

1. Zod schema acepta **ambos shapes**: `ingredientId` (legacy) + `familyId` + `variantId?` (nuevo).
2. Hydration en `AppStateContext` on mount:
   - Walk `savedRecipes[*].recipeIngredients[*]`.
   - Si entrada legacy: buscar variante por `ingredientId` → derivar `familyId` + dejar `variantId=undefined` (usa canonical) o fijarlo si el legacy apuntaba a una variante específica.
   - Drop campo `ingredientId` tras exitoso mapeo.
3. `lib/seedVersion.ts` `savedRecipes` version bump 4 → 5 (`preserve-user` strategy).
4. `SyncKey` type gana `foodFamilies` + `foodVariants` (user-owned), pero el seed de familias no sincroniza (es readonly).

## 6. Sprint plan (7 phases, ~7–10 días)

| Phase | Scope | Ship unit | Test/verify |
|---|---|---|---|
| **P0** Types + schemas | types + zod + convention tests. NO code. NO UI. | 1 commit | `npm run test` verde; `npx tsc --noEmit` 0 |
| **P1** Seed migration | codemod + `families.ts` + `variants.ts`; `ingredients.ts` deprecated re-export | 1-2 commits | visual-diff de macros pre/post en `AddMeal`, `FoodDictionary`, 5 recetas seed |
| **P2** FoodDictionary UI | family list + variant drill-down + delta display | 1 commit | `preview_screenshot` en 2 themes |
| **P3** AddMeal + VariantPickerSheet | search-families + picker sheet | 1 commit | preview flow: buscar "pollo" → ver 1 row → abrir sheet → elegir variante |
| **P4** RecipeDetail swap | per-row variant sheet + per-recipe override | 1 commit | preview: abrir receta → tap ingredient → swap → macros recalc |
| **P5** BarcodeScanner integration | OFF → family match → variant create | 1 commit | preview: escanear `8410032002002` → confirmar familia → variante en userFoods |
| **P6** Preferences + CreateRecipe | variantPreferences + picker v2 | 1-2 commits | preview: settings → preferir corral → receta muestra macros de corral |

**Gate de ship:** Preflight GREEN por phase (tsc + lint + i18n + test + build + size:check). No push entre phases sin "continua" del owner.

**Rollback path:** cada phase es revert-safe. El dual-schema permite coexistencia legacy/new durante la migración.

## 7. Riesgos + open questions

### Riesgos

1. **Explosión combinatoria cuando muchos usuarios escanean el mismo producto.** Sin Q6 (Supabase), cada user tiene su propio `userFoods` local — 1000 users × 50 variantes escaneadas = no se comparte, cada uno re-escanea. **Mitigación**: Q6 añade tabla `shared_variants` con promoción mod-aprobada (seed → canonical tras 100+ scans del mismo barcode).
2. **Family canonical dislocado de la receta cuando la receta exige variante específica.** Receta "Pollo tikka masala" asume pollo marinado; si el user tiene preferencia "pollo de corral crudo", los macros se desvían culinariamente sin que la receta lo avise. **Mitigación**: autor puede pinnear `variantId` en ingredient row → indicador "📌" + los `variantPreferences` del usuario no se aplican sobre pins explícitos.
3. **Migración de 276 seed entries rompe referencias si el codemod fallla.** **Mitigación**: P1 incluye test de regresión que carga las 46 seed recipes pre-migración y verifica que `recipe.macros` computado post-migración es igual a pre-migración (±1% tolerance).
4. **IDB payload grows unbounded con variantes escaneadas.** Ya hay un riesgo documentado con `savedRecipes` + multi-media. Añadir variantes con micros completos (~1–2 KB por variante) × 500 user variants = 1 MB. **Mitigación**: SyncKey gate sigue aplicando — IDB puro hasta Q6.

### Open questions (owner)

1. **Canonical = USDA genérico vs media poblacional.** El owner dijo "normal sea una media de macros". ¿Preferís (a) USDA reference como "norte" (consistente con estándar nutricional) o (b) media aritmética de las variantes seed (más cercano a "la realidad del usuario español medio")? Afecta qué macros ven en el hero de cada receta. **Default propuesto: (a) USDA** — respeta la fuente de verdad y deja el ajuste personal a `variantPreferences`.
2. **¿Profundidad de la taxonomía?** ¿Permitimos `family → subfamily → variant` (e.g., Pollo → Pechuga → Cruda/Cocida/Hacendado) o aplanamos a 2 niveles (Pollo → [Pechuga cruda, Pechuga cocida, Pechuga Hacendado, Muslo crudo, Muslo cocido, …])? **Default propuesto: 2 niveles** — simpler UI, evita un árbol N-ario. Si un día no es suficiente, subfamily es futuro-aditivo.
3. **¿Cuándo promovemos una user variant a seed?** Cuando Marcos escanea "Aguacate Hacendado" tres veces, la experiencia es la misma (variante local). Pero si 1000 usuarios la tienen, debería ser seed compartido. **Default propuesto: defer hasta Q6** — necesita backend. Hasta entonces, cada user vive en su propio mundo de marcas escaneadas.
4. **¿Branded variants pagan premium?** ¿El acceso a la DB de marcas OFF (250K productos) es free o gated tras RIAL+? MFP lo gatea. **Default propuesto: free** — scanning es el loop de retención (ADR-008). El Pro value prop está en AI Coach + recipe generation.
5. **¿User puede editar el canonical?** Si Clara no está de acuerdo con los macros canonical del pollo, ¿puede "overwrite" a nivel de su perfil? Es distinto a `variantPreferences` (ahí pickea una variante existente). **Default propuesto: no** — si quiere macros propios, que cree una user variant (`variantType='user'`) y la marque como preferida.

## 8. Decisión sugerida

El owner pidió revisar esto "porque vas a ver el food dictionary" (durante S3 Wave 1 Diccionario). Dos caminos:

- **Camino A (recomendado)**: cerrar S3 Wave 1–3 Diccionario primero (design drift + HIG + factory pattern + docs) tal como planificado — **sin** embarcarse en el refactor de variantes. El refactor es un sprint propio post-S3. Razón: Wave 1 es ~2 días sobre el data model actual; si arrancamos variantes ahora, Wave 1 se rehace a mitad de camino.
- **Camino B**: pausar S3, arrancar Variantes P0 (types + zod) para tener el tipo antes de Wave 2 (factory-handler pattern), de modo que los handlers ya usen la nueva forma. Riesgo: bloquea Wave 1 por ~1 día sin payoff visible.

**Recomendación:** **Camino A** + abrir un plan dedicado `.claude/plans/food-variants-sprint.md` tras Wave 3 para arrancar P0.

---

## 10. P2.6 addendum — seed expansion + drill-down UX at scale

Post-`[1.5.57]` shipped. Las 3 secciones siguientes documentan los cambios UX + seed introducidos sobre la base P2.5. Se añaden como bloque consolidado en lugar de incrustarse en §2/§4/§5 para no renumerar el resto del documento — la fuente de verdad operativa es el código (`src/features/food/data/food-families.ts::SEED_BRAND_ENTRIES`, `src/features/food/components/FamilyCard.tsx::GROUP_ORDER`, `src/features/food/utils/food-family-resolver.ts::groupVariantsByType`).

### 10.1 Indicador agnóstico de variantes (screenshot-ready)

**Problema detectado post-P2.5.** El header collapsed de `<FamilyCard>` pintaba `<Badge>{count} variantes</Badge>` — con 1 variante el badge ocupa más peso visual del que merece; con 100 brand variants escaneadas de un supermercado grande `"47 variantes"` se convierte en ruido que el usuario no razona. Directiva owner verbatim: *"con que me ponga que hay variantes a nivel general me vale no me digas cuantas"*.

**Nuevo anatomy.** Sustituye el badge numérico por un indicador agnóstico que solo comunica **presencia** del drill-down, no cardinalidad:

```tsx
{variantCount > 0 && (
  <span
    className="mr-2 inline-flex items-center gap-1 text-micro font-label uppercase tracking-widest text-on-surface-variant shrink-0"
    aria-label={t.foodDictionary.variantsIndicatorAria}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
    {t.foodDictionary.variantsIndicatorLabel}
  </span>
)}
```

- **Dot 6×6** `bg-primary` + label **uppercase tracking-widest** — paridad tipográfica con el resto de sub-labels del card (misma jerarquía visual que el row "allergens:" del expanded panel).
- `variantCount` sigue calculándose (filter non-canonical de `variants`) pero se consume solo como branching `> 0` — **nunca se muestra al usuario**.
- `aria-label` dedicado ("Tiene variantes disponibles" / "Has available variants") da contexto completo a screen readers sin redundar con el label visible.
- i18n keys dropped: `variantsCount` + `variantsCountOne` (obsoletas). Added: `variantsIndicatorLabel` + `variantsIndicatorAria` (× 2 locales). Net i18n +4 keys = 1657 → 1659 simétrico.

**Regresión guard.** `src/test/conventions/food-family-card.test.ts` bloquea la reintroducción del count numérico:

```ts
expect(familyCardSrc).not.toMatch(/\bvariantsCountOne\b/);
expect(familyCardSrc).not.toMatch(/variantsCount\b(?!One)/);
```

### 10.2 Drill-down UX at scale (grouped + INITIAL_LIMIT + show-more)

**Problema.** Pre-P2.6 el panel expandido vuelcaba `nonCanonicalVariants.map(v => <VariantRow/>)` plano. Con una familia pobre (1-3 variants) renderizaba bien; con una familia popular post-Q5 telemetry (estimado 50+ brand variants de yogur griego combinando Mercadona + Carrefour + Lidl + Dia + Bonárea + Alcampo) el panel colapsa visualmente — el usuario no sabe qué está mirando, el first paint se alarga, y el scroll se vuelve infinito. El UI del drill-down asumía ≤5 variants por familia.

**Patrón nuevo.** Agrupación por `variantType` + cap por grupo + toggle opt-in:

```ts
/** Rows shown per group before the "Ver más" toggle kicks in. */
const INITIAL_LIMIT = 5;

/**
 * Fixed render order of the variantType groups within the drill-down.
 * `canonical` is omitted — the canonical is the family's primary view,
 * painted outside the drill-down.
 */
const GROUP_ORDER: readonly VariantType[] = [
  'preparation',
  'quality',
  'regional',
  'brand',
  'user',
] as const;
```

- `groupVariantsByType(variants, canonicalId): Map<VariantType, FoodVariant[]>` (nuevo helper en `food-family-resolver.ts`) excluye el canonical y preserva el orden de entrada dentro de cada bucket.
- Iteración fija por `GROUP_ORDER` — salta buckets vacíos (`if (!groupVariants || groupVariants.length === 0) return null`).
- Cada grupo emite `<div data-variant-group={type}> > <h4>{t.foodDictionary.variantTypes[type]}</h4> > <div>{rows}</div>`, donde `rows` es `groupVariants.slice(0, INITIAL_LIMIT)` por default.
- `expandedGroups: Set<VariantType>` (React state local al card) controla qué grupos están en "Ver más" mode. Toggle individual por grupo — no un "expand all".
- Botón "Ver más" / "Ver menos" (`t.foodDictionary.showMore` / `showLess`) renderiza **solo** cuando `groupVariants.length > INITIAL_LIMIT` (flag `hasMore`).
- HIG-safe: `min-h-11` + focus-visible ring canónico en el toggle button.

**Escalabilidad matemática (la razón operativa del cambio).** First paint per family:

| Escenario | Pre-P2.6 (flat) | Post-P2.6 (grouped + capped) |
|---|---|---|
| Familia pobre (1 variant) | 1 row | 1 row (1 sección) |
| Familia media (10 variants, 2 grupos × 5) | 10 rows | 10 rows (2 secciones, sin toggle) |
| Familia popular (30 variants, 3 grupos × 10) | 30 rows | **15 rows** (3 secciones × 5) + 3 toggles dormidos |
| Familia post-escalado 100 marcas (100+ variants mayoría `brand`) | 100+ rows | **≤25 rows** (5 grupos × 5 max) + toggles dormidos |

**Propiedad invariant:** first-paint = O(5 × |GROUP_ORDER|) = **25 rows máximo**, independiente del tamaño total del drill-down. El usuario opta-in al ruido grupo-a-grupo — el que busca preparación no carga las 50 marcas de yogur; el que busca marca expande solo `brand`. Scanear 50 marcas de yogur no degrada el first paint de otras familias.

**Rendering order rationale.** `preparation → quality → regional → brand → user` coincide con el mental model del owner *"primero la variación de preparación (crudo/cocido) que afecta macros culinariamente, luego la calidad (0%/entero) si escoge por nutrición, luego las marcas que encuentro en el supermercado, y al final mis customs"*. `canonical` se omite porque ya está painted arriba como primary-view (Badge "Primary" + description + tags + allergens + portionSlot + microSlot).

**i18n reuse.** Las 5 section headers reutilizan los labels existentes `t.foodDictionary.variantTypes.{preparation,quality,regional,brand,user}` (shipped en P2/P2.5). Cero nuevos keys de i18n para la UI de grouping — el único delta es `showMore`/`showLess` (× 2 locales).

**Helper reutilizable.** `topVariantsByFamily(familyId, n): FoodVariant[]` (mismo módulo) usa el mismo `order` canónico `brand > quality > regional > preparation > user` para habilitar el patrón de **previews** en superficies que no son `<FamilyCard>`:
- AddMeal result rows (P3+): "3 marcas populares" debajo del row de familia sin expandir el drill-down completo.
- RecipeDetail swap sheet (P4): "Top 5 alternativas" cuando el swap es intra-family.

Hoy el helper ordena por type-priority fija (placeholder); en Q6+ con telemetría real de `scan-count` descending se promueve a popularity-based sin cambiar la firma de la función.

### 10.3 Seed de brand variants (8 entries, retail español real)

**Problema.** El type `VariantBrand { name, barcode?, scanned? }` existía desde P2 pero **cero variants lo usaban en seed**. Sin brand variants reales en seed, el drill-down section "Marcas" no se veía en uso (excepto para `preparation` raw↔cooked), los i18n labels `t.foodDictionary.variantTypes.brand` quedaban muertos, y cuando aterrice P5 (BarcodeScanner → variant) no habría precedente de cómo se pinta una marca.

**Modelo de datos introducido.** Nuevo top-level const en `src/features/food/data/food-families.ts`:

```ts
interface SeedBrandEntry {
  id: string;              // deterministic: `brand_{familyId}_{brand_slug}`
  familyId: string;        // must resolve via getFamily()
  name: string;            // nombre comercial ES
  nameEn: string;          // nombre comercial EN (mayoría idénticos)
  brand: VariantBrand;     // { name } — barcode llega en P5 via OFF
  macros: Macros;          // etiqueta retail aproximada (±5%)
  qualityTags?: string[];  // ejes ortogonales opcionales
}

const SEED_BRAND_ENTRIES: readonly SeedBrandEntry[] = [ /* 8 entries */ ];
```

**Helper `brandVariantFrom(canonical, entry)`** (privado al módulo) construye cada `FoodVariant` heredando `servingSizes`/`micros`/`allergens`/`tags`/`baseAmount`/`baseUnit` del canonical de su familia y sobrescribiendo solo `macros`/`name`/`brand`/`qualityTags`. Garantiza que los brand variants no re-declaran los 10+ campos comunes y mantienen consistencia con su familia.

**Integración en `buildVariants()`.** Brand variants se concatenan **después** de los derivados de `INGREDIENT_DICTIONARY`, con `source: 'seed'` + `sourceId: undefined` (el `sourceId` OFF real llega en P5 cuando el matcher reemplace el seed por scan). El invariant `FOOD_VARIANTS.length === INGREDIENT_DICTIONARY.length` **se rompe intencionalmente** post-P2.6 — pasa a `FOOD_VARIANTS.length === INGREDIENT_DICTIONARY.length + SEED_BRAND_ENTRIES.length` (146 + 8 = 154) con comment explicando por qué. El test que lo lockea se actualizó en consecuencia.

**Ids deterministas.** `brand_{familyId}_{brand_slug}` — e.g., `brand_fam_greek_yogurt_hacendado`. Estables entre deploys: si un usuario pinea "Yogur Griego Natural Hacendado" hoy como variante preferida, sigue resolviendo mañana tras re-seed.

**Las 8 entradas (labels retail españoles reales):**

| id | familyId | brand | name (ES) | qualityTags | macros/100g |
|---|---|---|---|---|---|
| `brand_fam_greek_yogurt_hacendado` | fam_greek_yogurt | Hacendado | Yogur Griego Natural (Hacendado) | — | 97 kcal · 3.8 pro · 3.8 c · 8 fat |
| `brand_fam_greek_yogurt_oikos` | fam_greek_yogurt | Danone Oikos | Oikos Natural (Danone) | — | 112 kcal · 7 pro · 4.5 c · 7 fat |
| `brand_fam_yogurt_hacendado` | fam_yogurt | Hacendado | Yogur Natural Azucarado (Hacendado) | — | 80 kcal · 3.2 pro · 12 c · 2.5 fat |
| `brand_fam_yogurt_sveltesse` | fam_yogurt | Nestlé Sveltesse | Sveltesse 0% Natural (Nestlé) | `['light','sugar-free']` | 38 kcal · 4.6 pro · 4.5 c · 0.1 fat |
| `brand_fam_chicken_breast_bonarea` | fam_chicken_breast | BonÀrea | Pechuga de Pollo de Corral (BonÀrea) | `['free-range']` | 120 kcal · 23 pro · 0 c · 2.5 fat |
| `brand_fam_chicken_breast_carrefour_bio` | fam_chicken_breast | Carrefour Bio | Pechuga de Pollo Eco (Carrefour Bio) | `['organic','free-range']` | 120 kcal · 22 pro · 0 c · 2.6 fat |
| `brand_fam_peanut_butter_hacendado` | fam_peanut_butter | Hacendado | Crema de Cacahuete 100% (Hacendado) | `['sugar-free','no-additives']` | 612 kcal · 28 pro · 16 c · 48 fat |
| `brand_fam_peanut_butter_mister_choc` | fam_peanut_butter | Lidl Mister Choc | Crema de Cacahuete (Mister Choc, Lidl) | — | 598 kcal · 22 pro · 15 c · 49 fat |

**Rationale de selección.** Distribución demostrativa, no exhaustiva:
- **4 familias cubiertas** para exhibir el patrón en 3 subcategorías distintas (`yogur`, `aves`, `mantecas-pastas`) — evita el sesgo de que "brand = solo lácteos".
- **3 casos sin qualityTags** (Hacendado genéricos + Oikos + Mister Choc) — el grupo `brand` vive solo del `variantType` primario.
- **4 casos con qualityTags multi-axis** — Sveltesse (light+sugar-free), BonÀrea (free-range), Carrefour Bio (organic+free-range), Hacendado crema (sugar-free+no-additives). Demuestra chips bajo el nombre en `<VariantRow>` con combinaciones distintas.
- **Delta macros culinariamente significativos** — Sveltesse −54 kcal vs Hacendado yogur natural (eje `light` vs `full`); Oikos +15 kcal / +3.2 g proteína vs Hacendado yogur griego (eje marca premium vs MDD).

**Deferrals explícitos del seed:**

1. **Barcodes no poblados.** `VariantBrand.barcode?` queda `undefined` en los 8 seeds. Cuando P5 integre OFF, el matcher debe consultar `SEED_BRAND_ENTRIES` por `brand.name + familyId` **antes** de crear variant nueva; si encuentra match, actualiza el seed con `barcode + sourceId + source: 'off'` (promoción), no duplica. **TODO en código:** comment en `buildVariants()` marca el hook.
2. **Macros no verificadas vs OFF oficial.** Aproximaciones de etiquetas retail españolas públicas (±5% tolerance). Tests lockean solo `brand.name` + `variantType === 'brand'` + `familyId` resuelve, no valores absolutos. Q6+ con OFF integrado "asciende" los 8 seeds sin breaking change de id.
3. **Ordering por popularidad placeholder.** `topVariantsByFamily` usa orden fijo `brand > quality > ...`. En producción con telemetría debería ser `scan-count` desc. Defer a Q6+.

**Matemática de ship.** FOOD_VARIANTS 146 → **154** (+8). INGREDIENT_DICTIONARY unchanged excepto por los 7 USDA chicken cuts añadidos (139 → 146, no relacionados con brand seed). FOOD_FAMILIES 132 → **136** (+4 bajo `aves`: thigh/drumstick/wing/whole). Bundle delta main +3.1 KB raw / +1.7 KB gzip (779.4 → 782.5 KB raw / 244.1 → 245.8 KB gzip) — razonable por 7 ingredientes + 8 brand entries + 2 helpers + drill-down JSX.

---

## 11. Referencias

- Plan activo: `.claude/plans/revisa-todas-las-capturas-ancient-micali.md` (S3 Diccionario cluster)
- Deep-dive fuente: `docs/market/deep-dives/myfitnesspal.md` (generic + branded pain)
- Tipos actuales: `src/types/food.ts`, `src/types/recipe.ts`
- Seed actual: `src/features/food/data/ingredients.ts` (276 entries)
- OFF scan flow: `src/features/food/components/BarcodeScanner.tsx`, `src/features/food/api/open-food-facts.ts`
- Swap precedente (dislike/intolerance): `src/features/recipes/utils/substitutions.ts` — primer mecanismo del app que swapea ingredientes; el sistema de variantes lo extiende.
- Q19 meal-taxonomy (patrón dual-schema + hydration): CHANGELOG `[1.5.25]`, state.md sección "2026-04-17 Q19"
