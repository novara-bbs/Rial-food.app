# Food Variants — Design proposal

> **Status:** proposal · **Owner:** @novara-bbs · **Author:** dev-agent 2026-04-19 PM
> **Scope:** FoodDictionary data model + AddMeal picker + RecipeDetail swap + BarcodeScanner integration + CreateRecipe
> **Relation to roadmap:** sibling of Q19 meal-taxonomy. Not part of S3 audit waves. Needs its own multi-phase sprint.

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

  /** Tipo semántico — el UI agrupa variantes por este eje. */
  variantType:
    | 'canonical'                  // USDA genérica — la "media", default
    | 'cut'                        // pechuga / muslo / ala
    | 'preparation'                // crudo / cocido / asado / plancha
    | 'quality'                    // corral / grass-fed / orgánico / sin antibióticos
    | 'regional'                   // tikka / grass-fed beef / corral
    | 'brand'                      // Hacendado, La Piara, producto OFF escaneado
    | 'user';                      // custom creado por el usuario

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

### 2.2 Relaciones

- **1 `FoodFamily` → N `FoodVariant`.**
- Cada familia tiene **exactamente 1** `canonicalVariantId` — típicamente la referencia USDA genérica.
- Macros de la receta por defecto = macros de `canonicalVariant`. Sin forks, sin duplicación.
- Override **por-receta**: el autor de la receta puede pinnear `variantId` concreto (e.g., "específicamente pollo de corral" si la receta lo requiere culinariamente).
- Override **por-usuario**: `userProfile.variantPreferences: Record<familyId, variantId>` — "siempre que veas pollo, úsame pollo de corral en mis macros". Aplica en runtime, no modifica la receta publicada.

### 2.3 Prioridad de resolución

Cuando la UI necesita renderizar los macros de una receta, resuelve cada `RecipeIngredient` así:

```
1. Si RecipeIngredient.variantId → usa esa variante (pin explícito del autor).
2. Else si userProfile.variantPreferences[familyId] → usa esa variante (preferencia personal).
3. Else → usa family.canonicalVariantId.
```

## 3. Bootstrap del catálogo (migración del seed actual)

One-shot + lazy.

1. **Clusterar los ~276 flat entries por prefijo + nombre canónico.**
   - `pro_chicken_*` → `fam_chicken_breast`
   - `pro_beef_*` → `fam_beef` (subdivididos por corte)
   - `dai_yogurt_*` → `fam_greek_yogurt` / `fam_natural_yogurt`
   - Ingredientes singleton (un solo entry, sin hermanos) → familia con 1 variante canonical
2. **Convertir cada Ingredient en FoodVariant + añadir `familyId`.**
3. **Elegir `canonicalVariantId` por cluster.**
   - Heurística: la variante cuyos macros son la media del cluster, preferencia `*_raw` para carnes (referencia USDA), `_natural` para lácteos.
4. **Codemod-assisted** via `scripts/migrate-ingredients-to-families.mjs` — genera un diff sobre `ingredients.ts` + un nuevo `families.ts`. Reviewer valida clusters antes de commitear.

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

## 9. Referencias

- Plan activo: `.claude/plans/revisa-todas-las-capturas-ancient-micali.md` (S3 Diccionario cluster)
- Deep-dive fuente: `docs/market/deep-dives/myfitnesspal.md` (generic + branded pain)
- Tipos actuales: `src/types/food.ts`, `src/types/recipe.ts`
- Seed actual: `src/features/food/data/ingredients.ts` (276 entries)
- OFF scan flow: `src/features/food/components/BarcodeScanner.tsx`, `src/features/food/api/open-food-facts.ts`
- Swap precedente (dislike/intolerance): `src/features/recipes/utils/substitutions.ts` — primer mecanismo del app que swapea ingredientes; el sistema de variantes lo extiende.
- Q19 meal-taxonomy (patrón dual-schema + hydration): CHANGELOG `[1.5.25]`, state.md sección "2026-04-17 Q19"
