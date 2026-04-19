# RIAL App - Changelog

## [1.5.48] - 2026-04-19

### refactor(audit-wave-2) — S3 Diccionario: shared helper extraction (pseudo-ingredient)

Tercera tanda (Wave 2 — factory-handler pattern completion + shared helper extraction) del cluster Diccionario del S3 del plan `revisa-todas-las-capturas-ancient-micali.md`. Cierra el deferral explícito de `[1.5.47]` Notes ("Extracción factory-handler del cluster AddMeal → Wave 2") con el hallazgo de que **el factory-handler pattern ya estaba completo** (`AddMeal` consume `foodHistory`/`favoriteIds`/`toggleFavorite`/`openScannerOnAddMeal` vía `useAppState()`, sin `useLocalStorageState` inline; `meal-handlers.ts` expone `createHandleLogMeal`/`createHandleRepeatYesterday`/`createHandleLogMealNow` como factories puras). Lo que sí tenía drift real era la **duplicación de builders "external-food → Ingredient"**: `AddMeal.apiResultToIngredient` + `BarcodeScanner.productToIngredient` eran dos helpers 80% idénticos que se ensamblaban por separado y divergían en detalles sutiles (description empty vs. brand, fallback servingSizes solo en una de las dos).

**Changed**
- `src/features/food/utils/pseudo-ingredient.ts` — **nuevo**. Extrae los 2 builders a un único módulo con skeleton compartido `pseudoIngredientBase(id, name, description, servingSizes, macros)` que fija los defaults invariantes (`category: 'prepared'`, `baseAmount: 100`, `baseUnit: 'g'`, `micros`/`tags`/`allergens` vacíos, `nameEn = name`, `descriptionEn = description`). Exporta `offResultToIngredient(food: OFFResult): Ingredient` (para resultados OFF, sin brand, servingSizes literal) + `scannedProductToIngredient(product: ScannedProduct): Ingredient` (para barcodes escaneados, brand→description, fallback a `DEFAULT_GRAM_SERVING_SIZES` si el producto no trae servings) + `DEFAULT_GRAM_SERVING_SIZES: ServingSize[]` constante (`100g` default + `50g`/`150g`/`200g` stepped) + `ScannedProduct` interface (movida desde BarcodeScanner para que la util sea fuente única).
- `src/features/food/utils/pseudo-ingredient.test.ts` — **nuevo, 10 asserts en 3 describe**. (1) `DEFAULT_GRAM_SERVING_SIZES` lockea el default-100g + los 4 stepped sizes. (2) `offResultToIngredient` lockea mapeo `id/title/macros/servingSizes` + `description` vacío + scaffolding `micros`/`tags`/`allergens` empty. (3) `scannedProductToIngredient` lockea `id = scanned_{barcode}` prefix + `brand → description` + fallback a `DEFAULT_GRAM_SERVING_SIZES` cuando `servingSizes` está undefined o array vacío + handle de caller-provided servings + brand empty → description empty.
- `src/features/food/screens/AddMeal.tsx` — **delete inline `apiResultToIngredient`** (~26 líneas). Reemplazado por `import { offResultToIngredient } from '../utils/pseudo-ingredient'`. Call-site único en `handleTapPlus` pasa a `setPortionTarget(offResultToIngredient(food as OFFResult))`.
- `src/features/food/components/BarcodeScanner.tsx` — **delete inline `productToIngredient` + `ScannedProduct` interface** (~40 líneas). Reemplazados por `import { scannedProductToIngredient, type ScannedProduct } from '../utils/pseudo-ingredient'`. `ScannedProduct` se re-exporta desde BarcodeScanner (`export type { ScannedProduct }`) para que cualquier call-site externo que lo consumiera por su tipado mantenga su import estable. Imports de `Ingredient` y `ServingSize` eliminados (ya no se usan directamente). `pseudoIngredient` useMemo pasa a llamar `scannedProductToIngredient(product)`.

**Notes**
- **Deferrals que siguen vivos tras Wave 2** (scope explícito: orthogonal sweeps, no Wave 3). (1) history-fallback servingSizes normalization en AddMeal — sigue invasive, requiere decidir si las entradas fallback (`_historyEntry` sin match en dictionary/recipes) deberían soportar re-ajuste de porción o quedarse con los macros congelados. (2) Literales en `meal-handlers.ts` data-layer (`'Planeado'`, `'Comida'`, `'Ingrediente'`, `'Otros'`, `'Comidas Planeadas'`) — la mayoría terminan en `mealPlan[day][].time/type` y `shoppingList[].name/category`, sí son user-visible pero requieren decidir si se persiste la clave canónica (i18n at-render) o el label traducido (locked at-write) — decisión de arquitectura data-layer, no Wave 2 polish. (3) Defensive `t.addMealScreen?.foo || 'fallback ES'` chains en AddMeal — las 8 ocurrencias siguen vivas porque el tipo de `t.addMealScreen` las permite como optional; limpiar requeriría tightening del tipo de locale, no simple reemplazo.
- **Rollback path.** Revert de este commit restaura los dos builders inline idénticos a pre-Wave-2. Cero impacto funcional (cambio es pura redirección de import + sitio de definición; la función resultante se ejerce exactamente igual en los 2 call-sites).
- **Baselines.** tsc 0, lint 0 errors (573 warnings, todos pre-existentes — ninguno nuevo introducido por la extracción), tests **705 → 715** (+10 del nuevo `pseudo-ingredient.test.ts`), i18n **1576 simétrico** (sin cambios), bundle main **778.5 KB raw / 243.8 KB gzip** (sin cambio — la extracción es move-code, no delta funcional; las 71 líneas eliminadas de los 2 consumers se compensan con las ~120 líneas del nuevo util), size:check PASS.

## [1.5.47] - 2026-04-19

### refactor(audit-wave-1) — S3 Diccionario: design-drift purge + WAI-ARIA hardening + Wave 0 deferrals

Segunda tanda (Wave 1 — design drift purge + HIG 44×44 + React.memo + i18n dual + WAI-ARIA canónico) del cluster Diccionario del S3 del plan `revisa-todas-las-capturas-ancient-micali.md`. Mirror de la metodología 4-wave (`docs/AUDIT-TAB-2026-04-18.md`). Cierra 3 deferrals declarados en Wave 0 (`[1.5.45]` Notes §Scope) + 2 a11y gaps adicionales descubiertos al leer los archivos en frío. Cero regresión visual — sólo un delta semántico (`MealSlotSelector` ahora anuncia "radiogroup" en vez de 4 botones sueltos a screen readers).

**Changed**
- `src/features/food/screens/AddMeal.tsx` — **memoize `displayFoods`** (Wave 0 deferral, §1 de las notes). La variable `const displayFoods: any[]` se re-construía en cada render (concat `[...unifiedLocalResults, ...apiResults]` o branch-selección sobre `recentFoods` / `favoriteFoods` / `dictionary` / `savedRecipes`). Rerenders disparados por state ortogonal (totales multi-queue, toggles de favorito, tick del reloj, etc.) asignaban nuevas referencias al array, invalidando cualquier memoización downstream y forzando a los children a recomputar sus cards. Fix: `useMemo(() => { … }, [isSearching, unifiedLocalResults, apiResults, browseMode, recentFoods, favoriteFoods, activeTab, dictionary, savedRecipes])`. Perf puramente; cero cambio de comportamiento visible.
- `src/features/food/components/BarcodeScanner.tsx` — **extrae `startScanner` helper** (Wave 0 deferral, §3 de las notes). El método `useEffect` tenía la lógica de boot del html5-qrcode inline (~30 líneas) + `handleScanAnother` duplicaba la misma secuencia con un `setTimeout`. Refactor: extraída como `const startScanner = async () => {…}` constante a nivel de componente (orden de declaración: `lookupBarcode` → `startScanner` → `useEffect` → `handleManualSubmit` → `handleScanAnother`). El `useEffect` pasa a llamarla con teardown en cleanup; `handleScanAnother` la reutiliza tras el `setTimeout(100)`. **Además unifica telemetría**: el `catch` retry path —que antes era `catch {}` silencioso— ahora loggea `logger.warn('Camera not available', { error })` consistente con el boot path, y sets `errorMsg` para que el usuario vea el fallo si el segundo intento falla. Anotación explícita del mount-only effect (no eslint-disable plugin — el proyecto no tiene `react-hooks` registrado en eslint config, así que basta con el comentario de intent).
- `src/features/food/components/MealSlotSelector.tsx` — **convierte 4 `<button>` sueltos a WAI-ARIA radiogroup** (paralelo al fix de `PortionSelector` en Wave 0). Outer wrap: `<div role="radiogroup" aria-label={ariaLabel ?? t.mealSlot.selectorLabel}>`. Cada slot button: `role="radio" aria-checked={isOn}`. Screen readers ahora anuncian "grupo de radio, 4 opciones, Desayuno seleccionada" en vez de listar 4 botones desconectados. Props: añadido `ariaLabel?: string` opcional para call-sites que quieran labelear el grupo con contexto específico (p.ej. "Franja para esta receta"). Cero cambio visual. Default ariaLabel cubre el caso común con una key nueva `t.mealSlot.selectorLabel` (ES `"Franja de comida"` / EN `"Meal slot"`).
- `src/features/food/screens/FoodDictionary.tsx` — **i18n macros + a11y allergen chips**. Dos cambios:
  - **Row de macros**: los literales `"kcal · pro · carbs · fat"` en la descripción de cada ingredient card estaban hardcodeados en español ultra-abreviado. Migrados a `{t.common.kcal} · {t.portionSelector.protein} · {t.portionSelector.carbs} · {t.portionSelector.fats}` reusando las keys que ya tenían ES/EN values (`Pro` / `Pro`, `Carbs` / `Carbs`, `Grasas` / `Fats`). El usuario de habla inglesa ya no ve "grasas" mezclado.
  - **Allergen filter chips** ("Gluten / Lácteos / Huevos / …"): (1) outer `<div>` con `id="allergen-filter-label"` + wrapper `<div role="group" aria-labelledby="allergen-filter-label">` para que screen readers agrupen semánticamente el cluster; (2) cada chip gana `aria-pressed={active}` (no es radio — es multi-select, patrón canónico toggle group); (3) el `<X />` del chip activo tiene ahora `aria-hidden="true"` (decorativo); (4) los literales de nombre del alérgeno (antes raw `{a}` del enum `'gluten'` / `'dairy'` / …) reemplazados por `t.foodDictionary.allergenLabels[a]` con 12 entries × 2 locales (Gluten, Lácteos/Dairy, Huevos/Eggs, Frutos secos/Tree nuts, Cacahuete/Peanuts, Soja/Soy, Pescado/Fish, Marisco/Shellfish, Sésamo/Sesame, Apio/Celery, Mostaza/Mustard, Sulfitos/Sulfites).
- `src/i18n/locales/es.ts` + `en.ts` — añadidas 13 claves simétricas: `mealSlot.selectorLabel` (×1) + `foodDictionary.allergenLabels.*` (×12). Total 1563 → **1576**.

**Notes**
- **Deferrals persistentes para Wave 2–3.** history-fallback servingSizes normalization en AddMeal (invasivo — toca cálculo de porciones legacy), FoodDictionary micronutrient highlights i18n (11 labels `"Vit C"` / `"Hierro"` / `"Calcio"` etc. — deferred hasta consolidar con la nomenclatura química de `Recipe.nutritionFacts`), literales en `meal-handlers.ts` data-layer (no user-visible, requiere sweep ortogonal). Extracción factory-handler del cluster AddMeal → Wave 2.
- **Rollback path.** Revert del commit restaura los 3 deferrals de Wave 0 + los 2 a11y gaps. Cada cambio es independiente: la memoización no afecta comportamiento, el extract de `startScanner` es refactor sin cambio de contrato (su única señal externa es el nuevo `logger.warn` en el retry path), `MealSlotSelector` mantiene la misma API pública (`{value, onChange, ariaLabel?}` — el prop nuevo es opcional), y los dos fixes de `FoodDictionary` son aditivos (atributos ARIA + i18n lookup en vez de literal).
- **Budget.** tsc 0, lint 0 errors, tests **705/705** (sin nuevos tests — Wave 1 son refactors sobre lógica existente; tests de regresión vendrán cuando extraigamos helpers reales en Wave 2), i18n **1563 → 1576** simétrico (+13), bundle main **778.5 KB raw / 243.8 KB gzip** (Δ +0.5 KB raw vs Wave 0 baseline — dentro de ruido, causado por la memoization wrapper + los 13 strings i18n nuevos).

## [1.5.45] - 2026-04-19

### fix(audit-wave-0) — S3 Diccionario: bug sweep + a11y hardening

Primera tanda (Wave 0 — bug sweep + dead-code purge) del cluster Diccionario del S3 del plan re-planificado `revisa-todas-las-capturas-ancient-micali.md`. Mirror de la metodología 4-wave aplicada en `docs/AUDIT-TAB-2026-04-18.md` (Hoy/Cocina/Explora). 7 fixes concentrados en `FoodDictionary` + `AddMeal` + `BarcodeScanner` + `PortionSelector` — 4 bugs funcionales + 3 a11y gaps. Refactor patrón + migraciones drift quedan para Wave 1 en un PR aparte.

**Fixed**
- `src/features/food/screens/FoodDictionary.tsx` — **dead nav payload purgado**. Los 2 call-sites `navigateTo('add-meal', { prefillIngredient: item.id })` y `navigateTo('create-recipe', { prefillIngredient: item.id })` pasaban un segundo argumento que el router nunca plumbea (`NavigationContext.navigateTo` acepta solo `(screen: string)`). TypeScript lo aceptaba porque el `Props` interface local tenía un phantom `data?: unknown` slot heredado de drafts iniciales. Bug silencioso: el usuario esperaba pre-selección del ingrediente al abrir AddMeal/CreateRecipe, nunca ocurría. Fix: (a) corregir el `Props.navigateTo` al signature real `(screen: string) => void`, (b) eliminar el segundo argumento de las 2 llamadas, (c) comentario explícito en el tipo para evitar re-introducción. El pre-fill real requerirá un patrón tipo `openScannerOnAddMeal` en AppStateContext — scope para un sprint de features, no Wave 0.
- `src/features/food/screens/AddMeal.tsx` — **debounce race condition**. El `useEffect` de OFF search ejecutaba `if (searchQuery.length < 3) { setApiResults([]); return; }` **antes** de limpiar el timer inflight. Si el usuario escribía `"pizz"` (triggea debounce 500ms) y backspaceaba rápido a `"pi"` (<3 chars, early-return), el timer programado para `"pizz"` seguía vivo y disparaba `searchOpenFoodFacts('pizz')` después de que el usuario ya no quería esos resultados — provocaba flashes de resultados obsoletos. Fix: `clearTimeout(searchTimerRef.current)` movido al top del body del effect, antes de cualquier early-return, y preservado el cleanup callback.
- `src/features/food/screens/AddMeal.tsx` — **map key collision entre fuentes**. La grilla unificada de resultados renderizaba `{food.id}` directo sobre un array mixto `[...localIngredients, ...apiResults]`. Un ingrediente local `id="123"` y un OFF product `id="123"` producían el mismo React key → warning en dev + potencial state bleed entre rows. Fix: `const keyPrefix = food.isApiResult ? 'off' : 'loc'` + `key={\`${keyPrefix}-${food.id}\`}`. Cero change UX, elimina la colisión en el peor caso estadístico.
- `src/features/food/components/BarcodeScanner.tsx` — **silent catch perdía telemetría**. El `try/catch` de `fetchOFFProduct(barcode)` hacía `catch {} setState('not-found')` — indistinguible para telemetría entre (a) barcode desconocido legítimo, (b) offline, (c) OFF 500. Fix: `catch (error) { logger.warn('BarcodeScanner OFF lookup failed', { barcode, error }); setState('not-found'); }`. UX idéntica (el sheet ofrece "crear custom" como escape en ambos casos), pero Sentry ahora correlaciona root-cause.

**Accessibility**
- `src/features/food/screens/AddMeal.tsx` — multi-queue banner (`"+N alimentos añadidos • Deshacer"`) envuelto en `<div role="status" aria-live="polite">` para que screen readers anuncien la confirmación + la affordance de deshacer al añadir items rápidos. Sin este role se renderiza como plain text → el usuario con lector de pantalla no se entera de que hay un botón "Deshacer" disponible durante la ventana de 5s.
- `src/features/food/components/BarcodeScanner.tsx` — `errorMsg` (casos: "Formato no soportado" / "Permiso denegado") envuelto en `<p role="alert">`. Los errors del scanner son transitorios y críticos para el flow; `alert` fuerza a screen readers a interrumpir y leer inmediatamente vs `polite` que esperaría fin de locución actual.
- `src/features/food/components/PortionSelector.tsx` — **mode toggle** (porción / peso) convertido de `<div className="flex">` con 2 `<button>` a un `<div role="radiogroup" aria-label={t.portionSelector.modeGroupLabel}>` con 2 `<button role="radio" aria-checked={mode === 'serving'}>` / `aria-checked={mode === 'weight'}>`. Patrón WAI-ARIA canónico para selección exclusiva binaria. Añadida i18n key `portionSelector.modeGroupLabel` × ES (`"Modo de medida"`) / EN (`"Measurement mode"`). Cero cambio visual.

**Notes**
- **Scope de Wave 0.** Bug sweep + dead-code purge + a11y gaps que no requieren refactor de markup. Deferrals conscientes: memoize `displayFoods` (perf, no bug — Wave 1), history-fallback servingSizes normalization en AddMeal (invasivo — Wave 1-2), startScanner helper extraction (refactor patrón — Wave 1), literales en `meal-handlers.ts` (i18n data-layer — Wave 1-2), defensive `?.||` fallbacks (polish — Wave 1).
- **Rollback path.** Revert del commit restaura los 4 bugs + los 3 a11y gaps. Los 7 fixes son independientes entre sí; cherry-pick selectivo es viable si surge una regresión aislada.
- **Budget.** tsc 0, lint 0 errors, tests **705/705** (sin nuevos — Wave 0 son fixes sobre lógica existente; tests de regresión vendrán cuando extraigamos helpers en Wave 2), i18n **1562 → 1563** simétrico (+1 `modeGroupLabel` × 2 locales), bundle main **778.0 KB raw / 243.6 KB gzip** (delta ~0 KB — cambios surgical en el chunk `food`).

## [1.5.44] - 2026-04-19

### feat(ui) — PR 9 Bevel: `<OnboardingScaffold>` + `<RadioCardGroup>` + `<SelectList>` primitives + Onboarding 6-step migration

S5 del plan re-planificado `revisa-todas-las-capturas-ancient-micali.md`. Extrae los 3 primitivos canónicos del onboarding propuestos en `docs/market/bevel-design-playbook.md` §4.11 (derivados de Bevel IMG_0951–0972) y migra los 6 steps de `Onboarding.tsx` a ellos. **Refactor markup-only: cero cambio de UX** — verificado preview step-by-step (los 6 steps renderizan idénticos pre/post, RadioCardGroup active state idéntica a la markup a mano anterior).

**Added**
- `src/components/OnboardingScaffold.tsx` — wrapper per-step. Props: `title` (renderizado como `<h3>`), `subtitle?` (ReactNode), `heroSlot?` (ReactNode, típicamente lucide icon arriba del título), `children` (zona interactiva), `variant?: 'default' | 'centered'`, `className?`. Emite `data-variant={variant}` para introspección. Variant `centered`: título más grande (`text-2xl text-primary`) + heroSlot centrado (used by step 6 `¡TODO LISTO!` con PartyPopper). Variant `default`: título compacto (`text-lg text-tertiary`) + layout top-aligned. **No `footerNote` slot** — cada step provee su hint inline como children (los 3 estilos de hint del flujo legacy —italic `adjustLater`, non-italic `skip`, centered `paletteHint`— no son unificables sin romper zero-UX-change).
- `src/components/RadioCardGroup.tsx` — selector exclusivo binary/ternary/N-ary. WAI-ARIA semantics: outer `<div role="radiogroup">` + cada card `<button type="button" role="radio" aria-checked={selected}>`. Props: `options: ReadonlyArray<RadioCardOption<Id>>`, `value: Id | ''`, `onChange: (id: Id) => void`, `ariaLabel?`, `className?`. Exporta `interface RadioCardOption<Id extends string = string>` con `{id, label, icon?, iconClassName?, desc?}`. Active state: `border-primary bg-primary/10 ring-1 ring-primary/40` + trailing `<Check />` + icono y label tintados a `text-primary`. Inactive: `border-outline-variant/20 bg-surface-container-low`. HIG-sized tap area via `p-4 rounded-sm`. Emite `data-selected={selected}` por card.
- `src/components/SelectList.tsx` — card list navegacional sin selection state (patrón IMG_0958 "¿Qué dispositivo ponible usas?"). Props: `items: ReadonlyArray<SelectListItem<Id>>`, `onSelect: (id: Id) => void`, `ariaLabel?`, `className?`. Exporta `interface SelectListItem<Id extends string = string>` con `{id, label, desc?, icon?, iconClassName?}`. Estructura `<ul> > <li> > <button type="button">` con trailing `<ChevronRight />` siempre renderizado (affordance nav consistente). `min-h-14` tap area. Explicitly NOT a radiogroup — se diferencia de `RadioCardGroup` en anatomy-level para evitar confusión semántica.
- `src/test/conventions/onboarding-primitives.test.ts` — convention test con static file-read pattern (mirror `bottom-sheet.test.ts` + `constant-tile.test.ts` + `home-hero.test.ts`). 5 describe blocks: (1) módulo surface (exports default + tipos option re-exportados); (2) OnboardingScaffold anatomy (`<h3>` title, variant branch, `data-variant`, subtitle/heroSlot slots, token-purity — no hex no dark:); (3) RadioCardGroup a11y + anatomy (role=radiogroup + role=radio + aria-checked, `<button type="button">`, p-4 HIG, data-selected, active tokens, token-purity); (4) SelectList anatomy (ul/li/button, ChevronRight siempre, min-h-14, NOT a radiogroup — ausencia de `role="radiogroup"` / `role="radio"` / `aria-checked`, token-purity); (5) Onboarding.tsx consumer sanity (imports 3 primitivos, ≥6 `<OnboardingScaffold>` mounts, ≥1 `<RadioCardGroup>` mount, `variant="centered"` en el ready step).

**Changed**
- `src/features/profile/components/Onboarding.tsx` — los 6 steps migrados a `<OnboardingScaffold>`:
  - Step 1 (`¿Cuál es tu objetivo?`): `<RadioCardGroup options={goalOptions} value={data.goal} onChange={(id) => setData(d => ({...d, goal: id}))} />`. 5 cards con icon + label (Dumbbell/Flame/Scale/Apple/Users). Reemplaza la markup a mano de 30 líneas con iteración manual + clases activas.
  - Step 2 (`Sobre ti`): scaffold + form (`nombre/peso/altura/edad/sexo`) + `<RadioCardGroup options={activityOptions} />` para nivel de actividad. Sexo binario HOMBRE/MUJER **NO migrado** — es side-by-side pills (patrón distinto a RadioCardGroup stacked cards). Activity list introduce delta de 8px por card (legacy `py-3` → scaffold `p-4`) — aceptado como unificación de layout consistente con §4.11.
  - Step 3 (`Tu plan nutricional` / "Basado en tus datos:"): scaffold con `subtitle` para el lead + SectionCard (macros) + binary trains sí/no (pills, no migrated) + italic hint "Puedes ajustar todo después." inline.
  - Step 4 (`Restricciones alimentarias`): scaffold + pill multi-select (patrón distinto a RadioCardGroup, intencional) + "Saltar" hint inline.
  - Step 5 (`Tu entorno` / "Elige la paleta visual que mejor va contigo"): scaffold con `subtitle` + custom 2×2 swatch grid **NO migrado a RadioCardGroup** (swatch previews con 3D mock son demasiado especializados — raw radiogroup markup preservado) + centered paletteHint inline.
  - Step 6 (`¡Todo listo!`): scaffold `variant="centered"` + `heroSlot={<PartyPopper className="w-14 h-14 text-primary mx-auto" />}` + `subtitle={readyMessage}` + SectionCard con kcal diarias (clase `w-full` añadida para preservar ancho en centered variant).
- `src/test/conventions/primitives-export.test.ts` — añadidos imports + assert block `exports the onboarding primitives (PR 9, §4.11)` lockeando `OnboardingScaffold` + `RadioCardGroup` + `SelectList` como default exports.
- `docs/PRIMITIVES.md` — 3 nuevas rows en §1 (table of primitives) + 3 nuevos minimal examples en §2 siguiendo la convención existente del doc. `RadioCardGroup` documenta cuándo usarlo vs checkboxes / pills / SelectList. `SelectList` aclara la distinción "navigation trigger" vs "exclusive selection".

**Notes**
- **Scope del refactor: markup-only.** Cero cambio de copy, cero cambio de validación, cero cambio de flujo de navegación. Cada RadioCardGroup replica 1:1 la anatomy previa (icon tint, label uppercase tracking-wider, active border-primary, trailing Check). El único delta aceptado: activity list gana 8px de altura por card (py-3 → p-4) por unificación al scaffold. No es una regresión UX — es la unificación que el playbook §4.11 pide explícitamente.
- **Consumer futuro de SelectList.** No tiene consumer en PR 9; ships como stable primitive en anticipación de step-types Q6+ (HealthKit / Google Fit grant, wearable device selection, permissions granting) derivados de Bevel IMG_0958.
- **Decisión: step 5 swatch picker NO migrado.** Los swatches son previews 3D con mock UI (4 tipografías + 4 background ramps en miniature) — demasiado especializados para RadioCardGroup. Mantenemos raw radiogroup markup. Justificación: `<RadioCardGroup>` es para cards label-first (con icon opcional), no para visual cards preview-heavy. Si aparece un segundo picker tipo-swatch podríamos extraer `<VisualCardGroup>` aparte — por ahora YAGNI.
- **Decisión: sexo binario + trains binary NO migrados.** Pills side-by-side son un pattern distinto de RadioCardGroup stacked-cards. Si aparece un 3er+ binary pill-selector consideraremos un primitive aparte (`<BinaryToggle>`) pero hoy YAGNI.
- **Rollback path.** Revert del commit (single atomic) restaura la markup a mano. Los 3 primitivos quedarían huérfanos hasta que otro consumer los reutilice — aceptable porque son exportables.
- **Budget.** tsc 0, lint 0 errors, tests **679 → 679+N** (añade el assert block de primitives-export + los ~20 asserts de onboarding-primitives), i18n **1562** simétrico (sin nuevas keys — scaffold reutiliza las keys del step), bundle: cambios markup-only sobre un component lazy-loaded (Onboarding) — delta esperado ~0 KB (los 3 primitivos son usados solo en el Onboarding chunk).
- **Preview verification.** Los 6 steps verificados paso a paso via `preview_screenshot`: step 1 (RadioCardGroup goal, active-state idéntica), step 2 (scaffold + form + activity RadioCardGroup con ACTIVO preselected), step 3 (scaffold con subtitle + SectionCard macros + binary pills), step 4 (pills + hint inline), step 5 (custom swatch grid preservado), step 6 (centered variant con PartyPopper). Zero regresión visual.

## [1.5.43] - 2026-04-19

### feat(home) — PR 8 Bevel: `<NutritionHeroRing>` semi-ring 270° + 3-col macros (Option A, flag-gated)

Primera implementación del Home hero según el benchmark cross-competitor `docs/market/home-patterns-benchmark.md` §6.1. Gate-levantado por §6.2 GREEN criteria (convergence ≥3/5 + macros layout decidido + ≥3 anti-patterns catalogados). Roll-out conservador: nuevo shape detrás de `featureFlags.homeRingGrid` con default `false` — el shape legado (equation-hero + `ProgressPreviewCard`) sigue siendo el default para todos los usuarios existentes. Rollback = poner el flag en `false` (o no setear el env var).

**Added**
- `src/lib/featureFlags.ts` — nuevo módulo single-source-of-truth para flags gated por UI/comportamiento. Exporta `featureFlags: { homeRingGrid: boolean }` congelado vía `Object.freeze()`. Lectura del env `import.meta.env.VITE_FEATURE_HOME_RING_GRID` via helper `readEnvFlag()` tolerante a SSR/vitest (`try/catch` around `import.meta`). Acepta `true` | `'true'` | `'1'`; default `false` cuando el env está unset o es cualquier otra cosa. La arquitectura de 1 flag / 1 shape permite añadir flags futuros sin refactor (ADR-style).
- `src/features/home/components/NutritionHeroRing.tsx` — nuevo component (~228 líneas) que renderiza el shape Option A del benchmark §4.4:
  - **Semi-ring 270° open-at-bottom** vía SVG handwritten (zero bundle impact — no recharts import). Progress fills clockwise desde 7:30 (θ=225°) hacia 4:30 (θ=495°). Track = muted full 270° arc. Stroke 12px + `strokeLinecap="round"`.
  - Exporta 2 helpers pure-functions: `describeSemiRingArc(cx, cy, r, progress)` retorna path SVG para el progress arc (o `null` cuando progress ≤ 0) + `describeSemiRingTrack(cx, cy, r)` para el backdrop full-270°. Ambos con coordinate convention clockwise-from-top: `x = cx + r·sin(θ)`, `y = cy − r·cos(θ)`. `large-arc-flag = 1` cuando sweep > 180°.
  - **Number hero centered inside the ring** — remaining kcal como el métrico hero glanceable (convergencia Yazio/Lifesum/MFP, 3/5 hacen remaining el número primario). `text-display` + `text-primary` + `tabular-nums` + `leading-none`.
  - **Running-sum caption** — `Objetivo − Alimentos + Ejercicio` bajo el hero (preserva el patrón educativo MyFitnessPal, §3.4 del benchmark). Mismos 3 dt/dd items que el legacy hero.
  - **3-col macros row** bajo el ring — carbs / protein / fats como dot + bar + absolute (`consumed / target g`). Patrón Yazio §4.4 vertical-budget (3 donuts descartados por densidad vertical). Colores via theme tokens: carbs → `bg-tertiary`, protein → `bg-brand-secondary`, fats → `bg-error`. **Sin hex codes, sin `dark:` prefix** — todo via CSS custom properties del theme system.
  - a11y: contenedor `role="img"` + `aria-label={ringAria}` con el remaining interpolado vía `t.home.ringAriaLabel.replace('{remaining}', String(remaining))`. SVG interno con `aria-hidden="true"` (el label del contenedor ya cubre).
  - API idéntica a `NutritionHero` (`dailyMacros`, `mode?`, `exerciseCalories?`) — el caller `Home.tsx` no branchea; el routing vive adentro de `NutritionHero.tsx`. `mode` se acepta pero se ignora (el shape unificado elimina la distinción `simple` vs `detailed`).
- `src/test/conventions/home-hero.test.ts` — convention test con 28 asserts en 6 describe blocks (static file-read pattern, mismo patrón que `bottom-sheet.test.ts` + `constant-tile.test.ts`): (1) featureFlags shape — flag existe como boolean, default `false`, declarado via `Object.freeze()`, lee el env var correcto; (2) `describeSemiRingArc` geometry — retorna `null` cuando progress ≤ 0, capea en 1, usa SVG `A` command con rx=ry=r, `large-arc-flag` flip en 180° boundary, sweep-flag clockwise, punto de inicio `(39.08, 140.91)` para cx=90 cy=90 r=72 (θ=225°); (3) `describeSemiRingTrack` — full 270° con endpoint `(140.91, 140.91)` (θ=495°); (4) `NutritionHero` flag routing — importa featureFlags, importa NutritionHeroRing, branch `if (featureFlags.homeRingGrid)`, legacy equation-hero captions preservadas, `useI18n()` antes del early-return (rules-of-hooks); (5) `NutritionHeroRing` anatomy — no recharts import, data-testids presentes (`hero-ring-svg` + `hero-ring-progress` + macro columns), number hero centrado, running-sum caption, aria via ringAriaLabel, **no hex codes + no `dark:` prefix** (token-only); (6) Home.tsx — importa featureFlags, wrappea `ProgressPreviewCard` en `!featureFlags.homeRingGrid` guard, preserva la signature de props (weightHistory + unitSystem + targetWeight). + i18n symmetry assert para `ringAriaLabel` con placeholder `{remaining}` en ambos locales.

**Changed**
- `src/features/home/components/NutritionHero.tsx` — añadido import de `featureFlags` + `NutritionHeroRing`. Nuevo branch al inicio del component (después de `useI18n()` para respetar rules-of-hooks): si `featureFlags.homeRingGrid` es true, retorna `<NutritionHeroRing {...props} />`; si no, cae al shape legado (equation-hero + grid de 4 macros). El legacy body queda **literalmente untouched** — la diff del component es el import + 5 líneas del early-return. Rollback path = flag a false → 0 cambios visibles para el usuario.
- `src/features/home/screens/Home.tsx` — importado `featureFlags`. `<ProgressPreviewCard>` ahora wrappeado en `{!featureFlags.homeRingGrid && (…)}` — cuando el flag está on, la card desaparece (el weight preview vive ahora en la Progress tab; evitamos duplicación semántica con el ring hero). Cuando el flag está off (default), la card sigue visible arriba del hero → cero regresión para usuarios existentes. El resto del Home queda idéntico.
- `src/i18n/locales/es.ts` + `src/i18n/locales/en.ts` — nueva key `t.home.ringAriaLabel` para el a11y label del ring. ES: `'{remaining} kcal restantes en el día'`. EN: `'{remaining} kcal remaining today'`. Placeholder `{remaining}` interpolado en runtime. Total i18n 1561 → **1562** keys simétricas.

**Notes**
- **Por qué handwritten SVG en lugar de `<RadialBar>` de recharts.** Recharts ya está en el bundle (vendor-recharts 331.5 KB / 99.8 KB gzip) pero `RadialBar` habría requerido `<ResponsiveContainer>` + `<PolarAngleAxis>` + `<RadialBarChart>` wrappers — cada import adiciona al main chunk via tree-shaking incompleto de recharts. Un SVG de 2 `<path>` + matemática pura en 30 líneas da control total sobre ángulos, stroke y colors-via-token, y **no toca main chunk** (confirmed via `size:check`: main entry **777.8 KB raw / 243.4 KB gzip** antes y después de PR 8, delta 0 KB).
- **Por qué flag-off es el default.** El benchmark convergence es 3/5 (semi-ring/ring family, gate GREEN §6.2), pero es la transformación más invasiva del roadmap (pantalla más visitada de la app). Una tanda de dogfood interno con el flag on antes de flip-universal permite calibrar UX edge cases (empty state day-1, over-target negatives, etc.) sin exponer a usuarios reales.
- **Rollback path.** (1) Flip `featureFlags.homeRingGrid` a `false` via código o remove el env var — 0 cambios de DB, 0 migraciones. (2) Si necesitamos rollback más agresivo, revert del commit entero vuelve al shape anterior porque `NutritionHero.tsx` y `Home.tsx` fueron cambios puramente additivos.
- **a11y.** El ring-hero es un SVG informativo (no interactivo). El container tiene `role="img" + aria-label={ringAriaLabel}` con el remaining kcal interpolado → screen readers leen "1850 kcal restantes en el día" en lugar del rendering de la SVG internal. Los macros bars son progress indicators visuales puros; el texto `consumed / target g` bajo cada uno da la info redundante para lectores.
- **Preview verification.** Flag-off default verificado: legacy equation-hero visible (RESTANTE 1850 / OBJETIVO / − ALIMENTOS / + EJERCICIO), `ProgressPreviewCard "TU PROGRESO"` visible arriba del hero → cero regresión visual para el shape que ships hoy. Flag-on contract locked por las 28 assertions de `home-hero.test.ts` (static file-read pattern verifica el routing + anatomy + token-purity).
- **Budget.** tsc 0, lint 0, tests **651 → 679** (+28 nuevos en `home-hero.test.ts`), i18n **1561 → 1562** (+1 `ringAriaLabel`), bundle main 777.8 KB raw / 243.4 KB gzip (unchanged), Home chunk 49.8 KB / 11.1 KB. `size:check` PASS.
- **Siguientes pasos del plan.** PR 8 completa S4 del plan `revisa-todas-las-capturas-ancient-micali.md`. Siguientes sprints paralelos per plan: **S3** (audit tranche Diccionario/Despensa/More/Settings/Profile/legal — puede correr en paralelo) + **S5** (PR 9 Onboarding primitives `<OnboardingScaffold>` + `<RadioCardGroup>` + `<SelectList>`). Internal dogfood del flag `homeRingGrid=true` puede correr en una feature branch o vía env override en un entorno de preview antes del flip universal.

## [1.5.42] - 2026-04-19

### feat(ui) — S1.3 Bevel: MEDIUM migrations (BarcodeScanner split + ImportRecipeURL/DailyCheckIn dual presentation)

Segunda tanda de ejecución del plan Bevel (S1.3). A diferencia de S1.2 (0-risk, reemplazo 1:1), estos 3 surfaces tienen conditional presentation — uno se split en camera + sheet, dos adquieren una prop `presentation?: 'sheet' | 'route'` forward-compat.

**Changed**
- `src/features/food/components/BarcodeScanner.tsx` — split en dos superficies co-existentes. Host outer `fixed inset-0 z-[100]` → `z-40` (BottomSheet renderiza en `z-50` vía radix Portal). Camera viewport + manual-input input **permanecen montados siempre** bajo el sheet (patrón camera-hot IMG_1015: back-chevron no teardowns la cámara). Post-scan result panel — antes un overlay inline que reemplazaba el viewport — ahora se renderiza como `<BottomSheet size="focus" headerLayout="back-title-action" onBack={handleSheetBack}>`. `sheetOpen` deriva de `showCustomForm || state === 'found' || state === 'not-found'`. `sheetTitle` varía por state (product.name / notFound / customFoodTitle). `handleSheetBack` sale de custom-form inline si está activo, o triggea `handleScanAnother` (reinit cámara) para found/not-found. X close en el header gana `aria-label`, `w-11 h-11` (sub-HIG 10→11 carry-along fix), y `focus-visible` ring. Custom-form: Cancel button removido (back-chevron lo reemplaza). Cleanup redundancia: h3 del product.name dentro del found-card removido (duplicaba título del sheet).
- `src/features/recipes/screens/ImportRecipeURL.tsx` — nueva prop `presentation?: 'sheet' | 'route'` (default `'route'`, backwards-compatible con el call-site actual en `App.tsx:156`). Body extraído a `const body = (<>...</>)`. Cuando `presentation === 'sheet'`: wrap en `<BottomSheet size="focus" headerLayout="back-title-action" onBack={onBack}>` con `title={t.importUrl.title}`. Cuando `'route'`: wrap en el existente `PageShell maxWidth="narrow" + PageHeader` — zero regression. Criterio framework: C5 (form con >3 secciones: URL input + modo toggle + review ingredientes + slots + macros + steps) → route es el default; sheet es forward-compat para el contexto Cocina/Explora donde el import vive "dentro" de la lista de recetas y el back-chevron vuelve directo al recetario.
- `src/features/wellness/screens/DailyCheckIn.tsx` — misma forma dual (`presentation?: 'sheet' | 'route'`, default `'route'`). Body extraído, wrap condicional. Criterio framework: 4 secciones semánticas (estado general 2×2 grid + sliders sleep/stress + symptoms chips) — route default; el sheet path existe para el rail de Hoy donde el daily check-in se ofrece como acción rápida que debería volver al Home al cerrar.

**Notes**
- **Forward-compat prop, no wiring.** Los call-sites de `sheet` no se conectan en este PR. Las únicas invocaciones hoy en `src/` son `App.tsx:146` (`daily-check-in` route) y `App.tsx:156` (`import-url` route) — ambas siguen usando default `'route'`. Plumbing de sheet invocation queda para un follow-up cuando se añada el entry-point inline desde Cocina/Explora (ImportRecipeURL) y desde el rail de Hoy (DailyCheckIn).
- **BarcodeScanner z-index audit.** Se confirmó via grep que `z-[100]` vivía solo en 2 surfaces del repo (Onboarding + BarcodeScanner) — mutuamente exclusivos (Onboarding es gate first-run, BarcodeScanner requiere user authenticated con app inicializada). Bajar el scanner host a `z-40` no introduce contention; el sheet en `z-50` renderiza encima limpio.
- **Verificación preview.** Manual barcode `8410032002002` (un código inexistente) disparó el state `not-found`. Sheet abrió con `data-size="focus"` + `data-header-layout="back-title-action"` ✓, `border-top-left-radius: 24px` ✓, `max-height: 337.45px` ✓ (≈ 92 % de 366.79px viewport ✓), `z-index: 50` ✓ sobre host `z-40`. Back-chevron (aria-label="Atrás") cierra el sheet; post-close el `#barcode-reader` div sigue montado (camera-hot ✓). `ImportRecipeURL` route default navegó limpio via "Importar URL" en Cocina → renderiza PageHeader "IMPORTAR RECETA" + URL/TEXTO toggle + input con placeholder intacto.
- **Budget.** Tests 651 → 651 (sin cambios — no nuevos asserts; el comportamiento existente sigue cubierto). i18n 1561 → 1561 (zero keys nuevos; todo el texto viene de namespaces ya poblados). Bundle main 777.7 KB raw / 243.4 KB gzip — dentro de budget. `size:check` PASS.
- **Siguientes pasos del plan.** S1.3 cierra S1 (cerrar bucle Bevel). Próximo sprint per plan file: S2 (competitor Home synthesis — docs-only, research gate antes de PR 8) corre en paralelo con S3 (audit tranche Diccionario/Despensa/More/Settings/Profile/legal).

## [1.5.41] - 2026-04-19

### feat(ui) — S1.2 Bevel: HIGH migrations dogfood ADR-009 V3 (SnapshotDetailModal + GdprConsent)

Primera ejecución del decision framework de 5 criterios formalizado en ADR-009 V3 (`[1.5.39]`). Dos migraciones 0-risk que validan el framework sobre surfaces reales antes de escalar a los MEDIUM candidates de S1.3.

**Changed**
- `src/features/wellness/components/SnapshotDetailModal.tsx` — radix `Dialog max-w-md max-h-[90vh]` → `<BottomSheet size="focus" headerLayout="title-centered">`. Framework criterio: C5 no aplica (1 sección); C3 no aplica (es detail-view, no confirmación); ninguno de C1/C2/C4 aplica → BottomSheet. `size="focus"` porque incluye acciones de edit/delete (work-on-something). Edit + Delete pasan al `footer` del sheet como `grid-cols-2` sticky; ambos botones adquieren `min-h-11` + `focus-visible` ring (antes solo `py-2.5`). Inline 2-tap confirm pattern de Eliminar preservado.
- `src/components/GdprConsent.tsx` — manual `fixed inset-0 z-[200]` overlay → `<BottomSheet size="compact" headerLayout="title-centered" hideCloseButton hideHandle>`. Framework criterio: C3 no aplica (es gate, no confirmación bidireccional); C4 no aplica (es 1 step, no wizard) → BottomSheet. `hideCloseButton` + `hideHandle` + `onOpenChange={() => {}}` hacen el sheet no-dismisible hasta que Accept dispare el cierre vía `onAccept` del parent (mandatorio por ley EU / App Store privacy nutrition label). Accept migra a `footer` con `min-h-11` + `focus-visible` ring. Body centrado (icon badge agrandado a 14×14), copy y links de privacidad/términos preservados.

**Notes**
- **Por qué este par primero.** Ambos son 0-risk: SnapshotDetailModal ya era `max-h-[90vh]` (≈ 92vh = `focus`); GdprConsent ya era sheet-shaped en mobile (`items-end sm:items-center`). El framework los clasificó HIGH en ADR-009 V3 §4.4.b. Si un caso difícil rompe el framework, queremos descubrirlo acá — no en los 3 MEDIUM candidates de S1.3 que tienen plumbing dual sheet/route.
- **Verificación preview.** Seeded consent-not-accepted state, verificado en viewport 363×366: GdprConsent rinde `max-h-[88vh] = 322.78px` ✓, `border-top-left-radius: 24px` ✓, overlay `oklab(0 0 0 / 0.25)` ✓. Tras `handleAccept`, sheet se dismisa limpio. Navegado a Progress → Cuerpo → Historial → tap snapshot `11 abr 2026`: SnapshotDetailModal rinde `max-h-[92vh] = 337.44px` ✓, `data-size="focus"` + `data-header-layout="title-centered"` ✓. Tap en Eliminar arma confirm (text `¿Confirmar?` + `bg-error`); segundo tap dispara delete + cierre. Edit path abre `LogSnapshotModal` anidado limpio.
- **Budget.** Sin cambios en tests (651), i18n (1561), ni bundle. Cambios de markup-only reemplazando Dialog/overlay con el primitive ya existente.
- **No migrado en este PR.** Los 3 MEDIUM candidates (`BarcodeScanner` split, `ImportRecipeURL` dual, `DailyCheckIn` dual) caen en S1.3 porque requieren plumbing de call-sites + nueva prop `presentation?: 'sheet' | 'route'`. No son 0-risk.

## [1.5.40] - 2026-04-19

### feat(wellness) — PR 6c Bevel: WeeklyInsight goalType hardening + BeforeAfterCompare auto-seed/scroll/log-CTA/goal-aware delta color

Refinamiento de las PRs A (`cb674b9` WeeklyInsightsCard) y B (`d9d7b77` BeforeAfterCompare) tras un re-review. Cinco issues reales en ~40 líneas netas — 2 bugs + 3 polish — blindados con 5 asserts de convention test (+1 semántico en `week-insights.test.ts`, +4 en `BeforeAfterCompare.test.ts` sobre el helper puro extraído).

**Changed**
- `src/features/wellness/utils/week-insights.ts` — **A1 fix**: `trendMatchesGoal()` devolvía `Math.abs(deltaKg) >= 0.1` en el branch de `goalType` desconocido, lo que podía elevar un drift +0.5 kg (interpretación ambigua) a tone `positive` renderizando "Buena semana, Marcos" sobre un movimiento que el usuario podría leer como negativo. Ahora retorna `false` — la adherencia ≥ 70 es la única vía a `positive` cuando el `goalType` falta. Docstring actualizado.
- `src/features/wellness/components/BeforeAfterCompare.tsx` — reescritura via Write tool con 4 mejoras:
  - **B13 fix** (goal-aware delta color): el delta kg/lb se pinta ahora con `deltaColorClass(delta, goalType)` — export puro para testability. `loss` + caída = `text-primary` (deseado); `gain` + subida = `text-primary`; `maintain` = siempre neutro; delta 0 = neutro. Antes todo delta negativo era `text-primary` automáticamente, lo que para un ICP en bulk (`goalType='gain'`) mostraba su pérdida de peso en verde — señal errónea.
  - **B8** (auto-seed pair): al montar con ≥2 fotos, el estado inicial ya trae `{before: photos[0], after: photos[N-1]}`. Viewing branch es 1 tap (toggle Comparar) en vez de 3 (Comparar → pick before → pick after). `useEffect` re-seed si el par queda inválido (snapshot borrado entre renders).
  - **B4** (scrollable picker): container del grid de thumbs añade `max-h-[60vh] overflow-y-auto scrollbar-thin`. Con 15+ snapshots el picker dejaba de ser operable sin scroll global de screen; ahora el scroll vive dentro del sheet.
  - **B7** (empty-state CTA): si el caller pasa `onLogSnapshot`, la branch `not-enough` renderiza un botón pill "Registrar foto" con `Camera` icon que deeplink al `LogSnapshotModal`. Mobile HIG (44×44) via `min-h-11`, `rounded-full`, `text-micro font-bold uppercase tracking-widest`. Sin caller, el branch queda igual a PR 6b.
  - Props nuevos: `onLogSnapshot?: () => void`, `goalType?: CompareGoalType`, `copy.notEnoughCta?: string`.
  - Export nuevo: `type CompareGoalType = 'loss' | 'gain' | 'maintain'` + pure helper `deltaColorClass(delta, goalType?)`.
  - Refactor: 3 branches comparten un `exitButton` JSX inline (DRY).
- `src/features/wellness/components/BodyTimeline.tsx` — prop passthrough de `goalType` + `onLogSnapshot` + `copy.notEnoughCta` hacia `<BeforeAfterCompare>`. Import extendido con `CompareGoalType`.
- `src/features/wellness/screens/Progress.tsx` — el consumer de `<BodyTimeline>` (history sub-tab) pasa `goalType={(userProfile as any)?.goalType}` y `onLogSnapshot={() => openWithDate()}`. `openWithDate` ya estaba destructurado de `useLogSnapshot()` para el share-progress handler.
- `src/i18n/locales/es.ts` + `src/i18n/locales/en.ts` — +1 key × 2 locales: `compareNotEnoughCta` ("Registrar foto" / "Log photo"). Total 1560 → **1561** simétricas.
- `src/features/wellness/utils/week-insights.test.ts` — +1 assert: "does NOT upgrade to positive on ambiguous drift when goalType is undefined (A1 fallback)" — lockea la regresión con `emaWeekDelta = +0.5`, adherence 50/40, goalType omitido → `tone: 'neutral'`.
- `src/features/wellness/components/BeforeAfterCompare.test.ts` — +4 asserts sobre `deltaColorClass`: zero delta = neutral (cualquier goal), maintainer = neutral (cualquier delta), loss-seeker: caída = primary / subida = brand-secondary, gain-seeker: subida = primary / caída = brand-secondary.

**Notes**
- **Por qué este PR en vez de bundled en A/B.** Las dos PRs originales fueron shipped en ciclos separados (recap + fotopair). El re-review post-ship surfaced 5 gaps que no son breaking, pero que refinan ambos features al mismo tiempo — el alcance sigue acotado (Progress Body/History sub-tab + WeeklyInsights sintetizador) así que empaquetarlos en una sola PR mantiene el reviewer gasto bajo.
- **`goalType` como `any`.** `UserProfile` no declara formalmente `goalType` (tiene `goal: 'cut'|'bulk'|'maintain'` que es un vocabulario parcial orthogonal). Usar `(userProfile as any)?.goalType` es deliberado — normalizar los dos vocabularios es un refactor futuro y PR 6c solo consume la propiedad cuando existe (default `'loss'` dentro del componente). El día que se unifique, solo cambia la línea del consumer.
- **Por qué `deltaColorClass` como helper exportado.** Testability barata (4 asserts puras sobre strings) y reutilización futura si otro componente necesita la misma semántica (e.g. summary card, share snippet). No es utility prematura — el color se calcula en 1 callsite hoy y el helper reduce cognitive load en viewing branch de 3 líneas a 1.
- **Preview verification.** Seeded `userProfile.goalType='gain'`, navegué a Progress → Cuerpo → Historial → Comparar. El delta `-1.4 kg` (caída, indeseada para un gainer) pintó correctamente `text-brand-secondary` (antes de PR 6c pintaba `text-primary`). Console limpio de errores nuevos (solo las advertencias pre-existentes de RecipeCard nested-buttons, sin cambios).
- **Budget.** Tests 645 → **651** (+6 total: +1 week-insights + 4 deltaColorClass + 1 del actionSlot-min-width de PR 6.5). i18n 1560 → **1561**. Bundle ±0.1 KB vs PR 7.

## [1.5.39] - 2026-04-19

### docs(design) — popup/sheet/modal inventory + decision framework (ADR-009 V3)

Pase de documentación disparado por la pregunta del owner: "¿dónde más afectan estos pop-ups de casi toda la pantalla? p.ej. el diario diario, ventanas de métricas". Auditoría exhaustiva de todas las surfaces que ocupan total o parcialmente la pantalla en RIAL — radix `Dialog`-based modals, manual `fixed inset-0` overlays, y full-screen routes — y formalización de un framework de decisión que un reviewer puede aplicar en 5 pasos para elegir entre `<BottomSheet>`, `<ConfirmDialog>`, route + `<PageShell>`, o full-screen overlay.

**Changed**
- `docs/market/bevel-design-playbook.md` — nuevas sub-secciones §4.4.b (migration matrix de 18 surfaces clasificadas HIGH/MEDIUM/LOW/STAY con rationale individual) + §4.4.c (decision framework con 5 criterios en orden + sub-decisiones `size` / `headerLayout` / `hideHandle`).
- `docs/adr/ADR-009-bottom-sheet-anatomy.md` — V3 addendum con la versión "reviewer rule" del framework (tabla compacta de 5 criterios + resumen de migration priorities + regla explícita para request-changes ante `Dialog` / `fixed inset-0` sin rationale).
- `docs/NEW-SCREEN-CHECKLIST.md` — §6c reescrita como decision tree de 5 checks secuenciales, con referencias cruzadas al playbook y ADR-009 V3.

**Notes**
- **Por qué no es un PR de código**. El owner pidió "razona y revisa las ventanas de bevel vs rial y mejora la documentación" — la auditoría identifica 2 HIGH + 3 MEDIUM migraciones candidatas, pero convertirlas en PRs de código se ejecuta selectivamente por beneficio UX, no blanket. La doc deja claras las prioridades para el próximo sprint sin pre-commit a scope.
- **HIGH candidates** identificados: `SnapshotDetailModal` (Dialog centered → `focus + title-centered`) y `GdprConsent` (manual overlay z-[200] → `compact + title-centered`). Ambos son 0-risk (`max-h-[90vh]` ya ≈ 92vh; GdprConsent ya es sheet-shaped en mobile).
- **MEDIUM candidates**: `BarcodeScanner` result panel (split camera viewport + sheet), `ImportRecipeURL` (conditional sheet/route según entry point), `DailyCheckIn` (idem).
- **STAY justified** explicitados 13 surfaces con razón por surface: `MediaLightbox` (pinch-zoom canvas), `CookMode` (WakeLock immersive), `StoryViewer` (auto-advance convention), `ConfirmDialog`, GlobalHeader demo-gate, Profile logout, `Onboarding` (first-run sin context), `CreateRecipe` / `CreatePost` / `CreateStory` / `AddMeal` (forms > 3 secciones), `WeeklyCheckIn`, `Progress` (bottom-nav tab), `RealFeelDiary` ("diario diario" — es módulo, no acción puntual; Bevel IMG_0973 confirma diary-as-tab).
- **Criterio 5 formalizado** ("form con > 3 secciones semánticas → route"): racionaliza por qué `CreateRecipe` con 5 secciones (nombre/macros/ingredientes/instrucciones/fotos) no debería wrap-earse en sheet — el scroll dual (sheet scroll + sección scroll) introduce fricción que un full-screen route no tiene.

## [1.5.38] - 2026-04-18

### refactor(ui) — PR 6.5 Bevel: RecipePicker `size="focus"` + LogSnapshotModal `cancel-action` layout

PR 6.5 del roadmap Bevel. Migración **selectiva** (no blanket) de dos consumers que encajan con los patterns canónicos del V2 addendum de ADR-009. Criterio aplicado: `compact` (88vh) para pickers/listas cortas; `focus` (92vh) para forms multi-field + búsquedas con lista larga + keyboard-first. Los otros 3 consumers (`PortionSheet`, `PublishRecipeSheet`, `CreateModal`) se quedan `compact` por semántica (pickers cortos, no "trabajar en algo").

Durante la auditoría se descubrió un bug latente en la primitiva: el wrapper de `actionSlot` tenía `w-11 h-11` (fijo 44×44), lo que **clipeaba text buttons** como "Guardar" / "Siguiente" que el V2 specifica para el header `cancel-action`. Fix incluido en la misma PR — `min-w-11 h-11` preserva el mínimo HIG pero deja que el contenido se auto-dimensione.

**Changed**
- `src/components/ui/bottom-sheet.tsx` — actionSlot wrapper: `w-11 h-11 -mr-2 …` → `min-w-11 h-11 -mr-2 …`. Fix de 1 línea que desbloquea text-button actionSlots sin tocar el layout del icon-button fallback (ChefHat/Globe siguen encajando porque los iconos son w-5 h-5 < 44×44, el wrapper crece a 44×44 por `min-w-11`).
- `src/features/social/components/RecipePicker.tsx` — añadido `size="focus"`. Header sigue `title-centered` (pick-and-close, no multi-step). La +4vh deja ver un ítem más en la lista sin scroll adicional, lo que en un picker de recetas es el beneficio más directo.
- `src/features/wellness/components/LogSnapshotModal.tsx` — añadido `size="focus"` + `headerLayout="cancel-action"`. El footer con Cancelar+Guardar se **elimina** y ambas acciones pasan al header: Cancel como text button izq (native radix Close) y Guardar como text-button actionSlot der que dispara `handleSave`. El patrón IMG_1004/1005/0988 de Bevel es literalmente este — review-then-commit form con acción principal en el top-right. Gana ~56px de contenido útil (el footer con safe-area padding ya no consume altura) y elimina la duplicación visual del close-X + Cancelar footer. `Check` import de lucide-react removido (ya no hay icono decorativo en el CTA).
- `src/test/conventions/bottom-sheet.test.ts` — nuevo describe block "actionSlot fits text buttons" con 1 assertion que lockea `min-w-11 h-11 …-mr-2 …justify-end …shrink-0` en el wrapper. Previene regresión a `w-11 h-11` fijo.

**Notes**
- **Por qué sólo 2 migraciones.** Los otros 3 consumers tienen contenido que no justifica `focus`: `PortionSheet` es un picker corto (serving + slider), `PublishRecipeSheet` tiene 1 textarea + preview, `CreateModal` es un action grid 2×3 sin input. El beneficio de +4vh es marginal y `cancel-action` no encaja semánticamente (pick-and-close vs multi-step commit).
- **Por qué RecipePicker mantiene `title-centered`.** IMG_1004 lleva "Cancelar" izq + "Siguiente" der porque seleccionar un alimento en Bevel es el primer paso de un flujo multi-step (pick food → configure portion → save). Nuestro `RecipePicker` es click-to-pick (seleccionar cierra el sheet), así que `cancel-action` con actionSlot vacío sería asimétrico. Mantener el close-X + ChefHat icon es coherente con el flujo real.
- **Por qué LogSnapshotModal migra completo.** Es el uso canónico de `focus` — 4 inputs visibles + 2 collapsibles (photo + measurements con 4 campos), review-data pattern IMG_0988, scroll necesario con el teclado abierto. La eliminación del footer cancel-save resuelve la duplicación con el header close-X (ambos cerraban sin guardar) y empuja la primary action al top-right estilo iOS native.
- **No migraciones full-screen → sheet en esta PR.** Los candidatos del ADR V2 addendum (`AddMeal` search tab, `CreateRecipe` desde CreateModal, `BarcodeScanner` preview post-scan, `ImportRecipeURL` wizard) son pantallas full-screen hoy, no sheets — migrarlas es un refactor de ~200–400 LOC cada uno y merecen PRs separadas (PR 6.5b/c/d/e futuras). Esta PR solo cubre los consumers que ya son BottomSheets.

## [1.5.37] - 2026-04-18

### feat(wellness) — PR 7 Bevel: `<ConstantTile>` biometric primitive + Progress Body > Summary grid

PR 7 del roadmap Bevel (`docs/market/bevel-design-playbook.md` §4.10). Los biometrics tiles de Bevel (IMG_0976/0993/0994) siguen una convención propia distinta de `StatTile`: giran alrededor de **6 estados canónicos** que reflejan la realidad de una métrica biométrica — puede no ser relevante para el user (no tracked), puede estar tracked pero sin data todavía (solo onboarding), o puede tener data con/sin tendencia. Por eso se ship como primitive nuevo en vez de extender `StatTile` — el contrato es fundamentalmente distinto. El grid Progress → Body → Summary renderiza las 6 constantes (peso, IMC, grasa corporal, cintura, caderas, pecho) debajo de `RitmoSection`, cerrando el gap del dashboard biométrico a paridad Bevel.

**Added**
- `src/components/ConstantTile.tsx` — primitive con 6 estados canónicos (`loading`, `empty-no-template`, `empty-no-data`, `value-stable`, `value-trending-up`, `value-trending-down`). Anatomy §4.10: `aspect-[1.2/1]`, `rounded-sm`, `bg-surface-container-low`, top-row icon 16px + label uppercase 11px `tracking-widest`, hero `text-title-sm` bold, sub-row con trend icon + copy. Color map: up `text-brand-secondary` (positivo/cálido), down `text-primary` (matches weight-loss semantic del producto), stable `text-on-surface-variant` (muted). Defaults de copy override-ables via `copy` prop (`noData`, `noRange`, `noTrends`, `stable`). Emite `data-state={state}` para introspection. Renderiza como `<button>` interactivo con focus-ring cuando `onClick` se provee, `<div>` accessible estático en el resto.
- `src/test/conventions/constant-tile.test.ts` — static file-read convention test (match del pattern `bottom-sheet.test.ts`). ~26 assertions across 7 describe blocks: module surface (default export + `ConstantTileState` type exhaustivo), las 6 branches explícitas, default copy distinction (empty-no-template → "Sin rango" vs empty-no-data → "Sin tendencias"), anatomy invariants (`aspect-[1.2/1]`, `rounded-sm`, `bg-surface-container-low`, icon 16px, `text-micro uppercase tracking-widest`, `text-title-sm`, `animate-pulse` skeleton), trend semantics (3 color mappings), y interactive surface (ADR-003 HIG compliance — `focus-visible:ring-1`).
- `src/features/wellness/utils/body-constants.ts` — aggregator `computeBodyConstants(snapshots, heightCm, unitSystem)` que resuelve los 6 specs. Ventana de 14 días para trend reference, DST-safe via `T12:00:00` anchor. Thresholds per-dimensión: peso 0.5 kg, BMI 0.2, grasa 0.5 pp, cintura/caderas/pecho 1 cm. Unit-aware: peso + delta pasan por `bodyWeightFromKg` / `getBodyWeightUnit`. Template distinction: `empty-no-template` cuando el user nunca registró esa dimensión (grid placeholder educativo), `empty-no-data` cuando tracked pero sin samples todavía.
- `src/features/wellness/components/BodyConstantsGrid.tsx` — grid 2-col puramente presentational sobre `computeBodyConstants`. Icon map: `Scale` (peso), `Calculator` (IMC), `Percent` (grasa), `Ruler` (cintura/caderas/pecho).
- i18n +11 keys × 2 locales simétricas bajo `t.progress.constants.*` (`sectionTitle`, `weight`, `bmi`, `bodyFat`, `waist`, `hips`, `chest`, `noData`, `noRange`, `noTrends`, `stable`).

**Changed**
- `src/features/wellness/screens/Progress.tsx` — Body → Summary sub-tab mounts `<BodyConstantsGrid>` dentro de `<SectionCard title="Constantes">` debajo de `<RitmoSection>`. `heightCm` viene de `userProfile.height` (que está en cm). El grid es silencioso cuando el user es nuevo — todos los tiles en `empty-no-template` con copy "No hay datos / Sin rango", respetando la convención Bevel de "nunca CTA agresivo en sub-sheets / sub-secciones, solo informative-neutral".
- `docs/PRIMITIVES.md` — añadido `ConstantTile` a la tabla de primitives + minimal examples con las 3 variantes principales (value+trend, empty-no-template, empty-no-data) + tabla de los 6 canonical states con hero/sub/color mapping.

**Notes**
- **Por qué primitive nuevo vs extender `StatTile`.** El contrato es fundamentalmente distinto. `StatTile` asume que siempre tienes un valor para mostrar — la métrica siempre existe y siempre tiene data. `ConstantTile` está construido alrededor de los 6 estados canónicos que emergen de la realidad biométrica: el user puede no trackear una dimensión (template missing), puede trackearla sin data todavía (onboarding), o puede tener data con/sin tendencia de 14 días. Meterlo en `StatTile` como props opcionales rompería el contrato simple del tile métrico y añadiría ramificación cognitiva. Ambos primitives coexisten sin overlap.
- **Por qué 14 días para la window.** Match con el span típico que la gente considera "tendencia reciente" y alineado con `pickReference` que busca el sample más cercano a 14 días (no forzado a exactamente 14) — el delta es robusto a registros irregulares. Thresholds per-dimensión evitan que micro-variaciones (ruido normal del peso matutino) disparen `value-trending-*` cuando realmente es estable.
- **Por qué BMI distinto de los demás.** BMI es derivado (`kg / (heightM × heightM)`), no directamente registrado, así que `hasBmiTemplate` requiere AMBOS `hasAnyWeight` + `heightCm > 0`. Si el user completó onboarding sin altura (edge case) el tile IMC queda en `empty-no-template` y no se calcula. El threshold 0.2 BMI corresponde a ~0.6 kg de variación a 1.75 m — match con el threshold de peso.
- **No migraciones de consumers en esta PR.** `StatTile` sigue con sus call-sites intactos. El grid Bevel-style sólo se monta en Progress Body Summary; Home y otros dashboards se defieren a PR 8+ cuando se consolide el hero ring-grid.

## [1.5.36] - 2026-04-18

### feat(wellness) — PR 6b: Before/after photo compare inside BodyTimeline

Market-gap close-out. MacroFactor, Yazio y Cronometer llevan tiempo shipando un comparador side-by-side de fotos de progreso; RIAL ya almacenaba `BodySnapshot.photoUrl` desde Q10/Q11 pero no tenía ninguna UI para poner dos juntas con delta de peso + días transcurridos. Esta PR cierra el hueco como **vista hermana** dentro de `<BodyTimeline>` (Progress → Body → History) — sin nueva ruta, sin nuevo modal, sin cambios en el shell. Share routing reutiliza el canonical `handleShareProgress({ snapshot, referenceSnapshot })` de `AppStateContext` sin nueva plumbing.

**Added**
- `src/features/wellness/components/BeforeAfterCompare.tsx` — nuevo primitive de wellness local (no primitive global, por ahora). Tres branches de estado: `not-enough` (<2 fotos), `picker` (before XOR after todavía vacío; grid 3-col de thumbnails con pressed/disabled state) y `viewing` (side-by-side 2-col con delta de peso en la unidad del user + días transcurridos + botones Swap/Reset/Share). Transiente — la "pareja elegida" es UI state, no se persiste. HIG 44×44 en toda la tap surface (min-h-11 en botones + tap targets de 44×44 para la X de exit).
- `src/features/wellness/components/BeforeAfterCompare.test.ts` — 6 assertions de `daysBetweenISO` (mismo día → 0, consecutivos → 1, semana → 7, direction-agnostic, month boundary, y **DST boundary** via midday anchor — el spring-forward de España 2026-03-29 no debe hacer que 2 días se cuenten como 1 o 3).
- `src/features/wellness/components/BodyTimeline.tsx` — pill-chip "Comparar" (aparece sólo con ≥2 fotos, `aria-pressed` toggle) junto a los filter chips. Cuando `compareMode=true` el body renderea `<BeforeAfterCompare>`; el resto del contenido (filter chips + modal de detalle) se mantiene estable — cambiar de modo no desmonta el SnapshotDetailModal.
- `src/features/wellness/screens/Progress.tsx` — nueva función `shareComparePair(before, after)` que delega a `handleShareProgress` con `referenceSnapshot=before` y `snapshot=after`. La propagación del handler al timeline se hace vía el nuevo prop `onShareCompare`. Fallback automático: si el consumer no provee `onShareCompare` pero sí `onShare`, BodyTimeline degrada a `onShare(after)` (Q17-style graceful degradation — nunca romper la UX del compartir).
- i18n +11 keys × 2 locales simétricas (`compareCta`, `compareTitle`, `compareExit`, `compareNotEnough`, `compareSelectBefore`, `compareSelectAfter`, `compareBeforeLabel`, `compareAfterLabel`, `compareDaysPattern` con template `{{n}} días`, `compareSwap`, `compareReset`).

**Notes**
- **Por qué no es un primitive global.** `BeforeAfterCompare` es semánticamente wellness-local — la entidad `BodySnapshot`, las unidades de peso (`bodyWeightFromKg` / `getBodyWeightUnit`), y el contexto "fotos de evolución corporal" no generalizan fuera del dominio Progress. Meterlo en `src/components/` sería sobreingeniería. Si otra feature (recetas antes/después de cocinar? challenges before/after?) lo reclamara, se extraería a primitive con props genéricos.
- **Por qué state transient, no persistido.** La pareja before/after es una decisión momentánea del user para "contar una historia". Persistirla en localStorage añadiría sync complexity (SyncKey entry) sin beneficio — cada sesión el user quiere elegir qué mostrar. El peso y las fotos sí se persisten, obviamente, pero son propiedades del snapshot, no de la comparación.
- **DST-safe date math.** `daysBetweenISO` usa anchor `T12:00:00` (midday) en vez de `T00:00:00` (midnight). Midnight anchors son vulnerables a DST: la transición spring-forward hace que un día sea de 23h, que el cálculo `(b − a) / 86_400_000` redondee 1.96 días → 2 pero también 1.04 días → 1, consistente sólo en un sentido. Midday absorbe la variación — el error máximo queda acotado a ±0.5h, muy por debajo del umbral de redondeo a días.
- **Share UX.** El share pair llega al feed con `referenceSnapshot=before` — el `handleShareProgress` ya computa delta peso vs reference + `sinceDate` para el post card. Esto significa que el feed pre-existente renderea automáticamente posts before/after sin cambios adicionales en `PostCard`. Cero plumbing nuevo en la capa social.

## [1.5.35] - 2026-04-18

### feat(ui) — PR 6 Bevel: `<BottomSheet>` V2 — focus size variant + 3 header layouts

PR 6 del roadmap Bevel (`docs/market/bevel-design-playbook.md` §4.4.a). Extensión no-breaking del primitive `<BottomSheet>` (ADR-009 V1 shipped en PR 2) para soportar la **segunda tipología de sheet** que emerge tras re-auditar las 64 capturas Bevel en 2026-04-18. El user explícitamente señaló el patrón "sheet al 90%, redondeado al final" — las focus sheets (IMG_0988, 1004, 1005, 1011, 1015, 1016, 1019) que la V1 no cubría. Sin migraciones de consumers en esta PR — extensión pura del primitive + guardrail de convención. Las migraciones selectivas por beneficio UX se defieren a PR 6.5+.

**Added**
- `src/components/ui/bottom-sheet.tsx` — nuevos props:
  - `size?: 'compact' | 'focus'` (default `compact`). `compact` mantiene `max-h-[88vh]` de V1 (status bar + dynamic island visibles); `focus` sube a `max-h-[92vh]` (solo ~40 px de status-bar band visibles) para forms / búsquedas con lista larga / keyboard-first / detail-edit.
  - `headerLayout?: 'title-centered' | 'cancel-action' | 'back-title-action'` (default `title-centered`). Selecciona cuál default renderiza en el slot izquierdo del header sticky: X icon (V1), "Cancelar" text button (IMG_1004/1005/0988), o back chevron (IMG_1015/1016/1019).
  - `hideHandle?: boolean` (default `false`). Oculta el swipe-handle pill en keyboard-first focus sheets (IMG_1011) o navigation-stack focus sheets (IMG_1016), donde el affordance "dismissable por swipe" es semánticamente incorrecto.
  - `leftSlot?: ReactNode` — escape hatch para casos fuera de los 3 header layouts (IMG_1015 tri-column: trash destructive left + title + add right).
  - `cancelLabel?: string` / `backLabel?: string` / `onBack?: () => void` — overrides i18n + handlers para los defaults `cancel-action` / `back-title-action`.
- `src/components/ui/bottom-sheet.tsx` — exports `BottomSheetSize` y `BottomSheetHeaderLayout` types para consumers que quieran tipar props propagados.
- `src/components/ui/bottom-sheet.tsx` — atributos `data-size={size}` + `data-header-layout={headerLayout}` en el `SheetPrimitive.Content` para permitir que consumers / tests / Playwright introspeccionen la variante sin acceder a refs.

**Changed**
- `src/test/conventions/bottom-sheet.test.ts` — expandido de 10 → 25 assertions. V1 defaults siguen lockeados intactos (no regression). 15 assertions nuevas cubren los tipos exactos de `size` / `headerLayout`, los defaults de cada uno, la presencia de `max-h-[92vh]`, `data-size` + `data-header-layout`, el gate `!hideHandle` sobre el render del handle pill, y el nullish coalescing de `leftSlot` sobre el header-layout default.
- `docs/PRIMITIVES.md` — sección `BottomSheet (ADR-009)` ampliada con 3 ejemplos (compact V1, focus+cancel-action, focus+back-title-action+hideHandle), tabla comparativa de size variants, y tabla de los 3 header layouts con referencias IMG_XXXX.
- `docs/adr/ADR-009-bottom-sheet-anatomy.md` — sección "V2 addendum" añadida al final del ADR. Documenta la motivación (re-audit 64 capturas reveló 2 tipologías), la tabla comparativa compact vs focus, el API añadido, los 3 canonical header layouts con rationale de por qué NO colapsar los 3 en un solo slot, el casos de uso de `hideHandle`, el `leftSlot` escape hatch, y los consumers candidatos a migración selectiva (AddMeal / CreateRecipe / BarcodeScanner / ImportRecipeURL) en PR 6.5+.

**Notes**
- **No-breaking por diseño.** Los 5 consumers V1 (`PortionSheet`, `PublishRecipeSheet`, `LogSnapshotModal`, `RecipePicker`, `CreateModal`) renderean idénticamente sin modificaciones — los nuevos props tienen defaults (`size='compact'`, `headerLayout='title-centered'`, `hideHandle=false`) que preservan el comportamiento V1 exacto. `npx tsc --noEmit` pasa sin errores en toda la surface de consumers.
- **Por qué 3 header layouts y no "un slot flex".** Los tres comunican **intenciones distintas** para UX y screen readers: X = "cerrar"; "Cancelar" = "descartar cambios en este flow"; back chevron = "volver al paso anterior". Colapsar los 3 en un único `leftSlot` obligaría a cada consumer a reimplementar semántica + accesibilidad desde cero, con drift predecible. Mantenerlos nombrados en el API es guardrail preventivo.
- **Focus variant ≠ full-screen.** `max-h-[92vh]` preserva ~40 px del status bar visible — el user sigue viendo la hora, la barra de batería y el dynamic island. Es la diferencia visual que separa un "bottom sheet grande" (contexto preservado) de un "full-screen takeover" (app feels hijacked). Bevel nunca cruza esa línea; RIAL tampoco debe cruzarla sin intención explícita.
- **Dos features mejoran gradualmente.** `hideHandle` + `leftSlot` son del tipo "props que pocos consumers usarán pero cuando las necesitas no hay sustituto razonable" — mejor exponerlas ahora (convention-tested) que esperar a que un consumer las reimplemente mal.
- **PR 6.5+ (deferido).** Las migraciones de consumers a `size="focus"` son selectivas por beneficio UX concreto, no blanket. Se evalúan caso a caso: `AddMeal` search → `focus + cancel-action` (IMG_1004 exacto); `BarcodeScanner` preview-tras-escanear → `focus + back-title-action` (IMG_1015 exacto); `CreateRecipe` desde `CreateModal` → `focus + cancel-action`; `ImportRecipeURL` wizard → `focus + cancel-action`.

## [1.5.34] - 2026-04-18

### feat(wellness) — 7d EMA trend line on WeightTrendCard + Progress Body sub-tabs

PR 5 del roadmap Bevel (`.claude/plans/revisa-todas-las-capturas-ancient-micali.md`). **Scope pivot vs plan:** originalmente previsto como Home hero ring-grid consolidation detrás de feature flag (IMG_0974), pivotado en ejecución a weight-trend EMA overlay + Progress Body sub-tabs. La Home ring-grid queda deferida a PR 6 (requiere infraestructura `src/lib/featureFlags.ts` previa). El usuario tenía trabajo pre-existente en la utilidad `weight-trend.ts` que al re-leer reveló intención clara de añadir suavizado EMA con semántica MacroFactor/Yazio — se consolida ese trabajo + se reescribe el consumer (`WeightTrendCard`) + se re-estructura el Body tab de Progress con sub-tabs Summary/History/Calendar.

**Added**
- `src/features/wellness/utils/weight-trend.ts` — `EMA_ALPHA_7D = 1 − 2^(−1/7) ≈ 0.0943` (half-life 7 días, así `(1−α)^7 = 0.5`). `calcEmaSeries(values, alpha?)` devuelve una serie EMA anclada en el primer valor. `WeightTrend` extendido con `emaSeries: number[]`, `currentEma: number | null`, `emaWeekDelta: number | null` (delta EMA-vs-EMA de hace 7 días — honest smoothed weekly trend en lugar de raw punto-a-punto).
- `src/test/conventions/weight-ema.test.ts` — 8 assertions que lockean el contrato EMA: serie vacía → `[]`, single sample → value-itself, input monótono → EMA monótono, varianza reducida vs raw, step 70→72 alcanza ~71 tras 7 samples (half-life midpoint), `(1 − EMA_ALPHA_7D)^7 ≈ 0.5`, `calcWeightTrend([])` con EMA fields nulos, y delta positivo en serie creciente de 14 días.

**Changed**
- `src/features/wellness/components/WeightTrendCard.tsx` — rewrite completo. **API simplificada**: `{snapshots, targetKg, unitSystem, onLog, t}` (antes: `weights`, `currentWeight`, `firstWeight`, `weekDelta`, `isEditingWeight`, `onStartEdit`, `onCancelEdit`, `onSaveEdit`, `weightInput`, `onWeightInputChange`). El card ahora llama internamente a `calcWeightTrend(snapshots, targetKg ?? null)` y consume los nuevos campos EMA. **Chart 3-layer SVG**: (1) path raw faded `opacity 0.22` + (2) círculos raw `opacity 0.5` — reconocen el ruido diario — + (3) path EMA `stroke 2.5 primary` como la línea visualmente dominante. Header action badge usa `emaWeekDelta` (delta suavizado semanal, no delta raw punto-a-punto). Stats grid pasa a 3 cols: **Tendencia 7d** (currentEma en primary) / **Hoy** (raw current en tertiary) / **Cambio** (delta total first→current). Botón único "Registrar peso" delega a `onLog()` (sin inline edit — el flujo global es el LogSnapshotModal).
- `src/features/wellness/screens/Progress.tsx` — **Body tab re-estructurado con sub-tabs** (`summary` / `history` / `calendar`) vía `SegmentedTabs`. Summary conserva `WeightTrendCard` + `RitmoSection` + `LatestReflectionCard`. History monta `BodyTimeline` (vista cronológica de `BodySnapshot`). Calendar monta `BodyCalendar` (heat-map temporal de snapshots). Eliminadas las referencias legacy a `bodyWeightFromKg`/`bodyWeightToKg`/`getBodyWeightUnit` desde el screen (ahora encapsuladas en el card). El handler de weight logging delega al global via `useLogSnapshot().open()` (pub-sub a `GlobalLogSnapshotModal` ya mounted en App root). `handleShareProgress` cableado al toast con copia `p?.shared` ("Progreso compartido" / "Progress shared").
- `src/i18n/locales/{es,en}.ts` — 7 keys nuevas por locale bajo `progress`: `trend7d` ("Tendencia 7d" / "7d trend"), `weightRawLabel` ("Hoy" / "Today"), `trendHint` ("Línea suave = tendencia 7d · puntos = registros" / "Smooth line = 7d trend · dots = daily readings"), `bodySummary` ("Resumen" / "Summary"), `bodyHistory` ("Historial" / "History"), `bodyCalendar` ("Calendario" / "Calendar"), `shared` ("Progreso compartido" / "Progress shared"). Total i18n 1523 → 1530 simétrico.

**Notes**
- **Semántica "trend line" vs raw line.** MacroFactor y Yazio llevan años iterando sobre esta decisión de diseño de información: el peso diario es ruidoso (hidratación, ciclo, timing de comidas) y el usuario que mira un spike de +0.8 kg de un día a otro saca conclusiones erróneas. La EMA half-life-7 suaviza esa volatilidad sin ocultar la señal: la línea EMA es la "verdad" subyacente, los puntos raw son "qué dice la báscula hoy". Esta doble-capa es copiable para futuros widgets de nutrición (kcal/día, macros/día) en Q15+.
- **Half-life 7 ≠ ventana 7.** Un "rolling average de 7 días" pesa igual a los 7 puntos y descarta el resto; un EMA con half-life 7 pesa más recientemente pero nunca descarta histórico (decay geométrico). `α ≈ 0.094` satisface `(1−α)^7 = 0.5` — tras 7 días pasados, la contribución de un sample cae al 50%. `calcEmaSeries` acepta `alpha` parametrizable para futuros widgets con half-lives distintos (p.ej. 14d para macros, 30d para body-fat %).
- **Convention lock.** `weight-ema.test.ts` falla ante cualquier cambio silencioso de `EMA_ALPHA_7D`, la condición inicial, o la monotonía/varianza de la salida. Motivación: el chart re-renderea historia visible — un cambio de alpha rewritearia la historia del usuario sin que nadie lo note en un code review.
- **Delta EMA vs delta raw.** `weekDelta` legacy comparaba raw current vs raw de hace 7 días → muy sensible a qué día el usuario pesó. Nuevo `emaWeekDelta` compara EMA current vs EMA de hace 7 días — el delta representa la tendencia subyacente, no la última lectura. El usuario ve "−0.3 kg esta semana" y refleja su progreso real, no si casualmente pesó post-carbs el lunes.
- **Sub-tabs en Body.** Progress Body tab estaba consolidando timeline + calendar + summary en un scroll largo. Split en 3 sub-tabs (HIG-compliant `role="tablist"` vía `SegmentedTabs`) reduce carga cognitiva por vista y respeta el patrón Bevel de "una sub-decisión a la vez". Summary es la vista default (landing más frecuente).
- **Delegación al global LogSnapshotModal.** Progress.tsx ya no tiene inline weight edit — cualquier "Registrar peso" button (WeightTrendCard, empty calendar cells, etc.) dispara `useLogSnapshot().open()`, que el `GlobalLogSnapshotModal` montado en App root captura vía `useSyncExternalStore`. Mismo sheet (`<BottomSheet>` ADR-009) que ya se usa desde Home → ProgressPreviewCard. Consistencia 100%.
- **Home hero consolidation (deferido).** Requiere `src/lib/featureFlags.ts` + refactor NutritionHero/ProgressPreviewCard. Scope propio en PR 6.

## [1.5.33] - 2026-04-18

### feat(ui) — PR 4 Bevel sheet migrations: CreateModal + LogSnapshotModal + RecipePicker + ShareSheet dead-code purge

PR 4 del roadmap Bevel (`.claude/plans/revisa-todas-las-capturas-ancient-micali.md`). Completa la adopción de `<BottomSheet>` en las superficies real-bottom-sheet que quedaban con markup hand-rolled o `Dialog`-wrapped, y purga dead code descubierto durante el audit. **Scope pivot vs plan:** los 5 targets originales (`PhotoUploader`/`LogSnapshotModal`/`AddMeal`/`ImportRecipeURL`/`BarcodeScanner`) resultaron ser no-sheets tras audit — solo `LogSnapshotModal` es un sheet real. Se migraron los 3 sheets reales descubiertos en el audit + deleción de 1 dead file. Home hero consolidation deferida a PR 5 (requiere crear `src/lib/featureFlags.ts` primero).

**Changed**
- `src/features/wellness/components/LogSnapshotModal.tsx` — migrado de radix `Dialog` + `DialogContent className="max-w-md max-h-[90vh]"` + `DialogHeader` manual a `<BottomSheet>` con slot `footer` que contiene los botones Cancelar/Guardar sticky. Fix sub-HIG en el botón de eliminar foto (`w-7 h-7` → `w-11 h-11`). Convert `text-sm` → `text-body-sm` tokens. Añade `min-h-11` a los botones Cámara/Galería. Esta es la migración de mayor impacto visible: `LogSnapshotModal` se mounta globalmente como `GlobalLogSnapshotModal` en App root y es invocado desde Home → ProgressPreviewCard + Progress → Body + empty calendar cells via `useLogSnapshot()`.
- `src/features/social/components/RecipePicker.tsx` — migrado de sheet raw-div (`fixed inset-0 bg-background/80 rounded-t-lg max-h-[70vh]` + slide-in animation manual) a `<BottomSheet>` con `actionSlot={<ChefHat/>}`. **API migrada de conditional-mount a controlled-open**: `{recipes, onSelect, onClose}` → `{open, onOpenChange, recipes, onSelect}` para que radix maneje animaciones de exit. El search + lista filtrada sin cambio.
- `src/features/social/screens/CreatePost.tsx` — actualiza consumer: `{showRecipePicker && <RecipePicker ... onClose={...} />}` → `<RecipePicker open={showRecipePicker} onOpenChange={setShowRecipePicker} ... />`.
- `src/features/social/screens/CreateStory.tsx` — mismo cambio consumer.
- `src/components/CreateModal.tsx` — migrado de radix `Dialog` + `DialogContent rounded-t-sm md:rounded-sm` (centered modal, not a real sheet) a `<BottomSheet>`. API pública (`{isOpen, onClose, onSelect}`) preservada para no romper el call-site único en `App.tsx` — internamente mapea `onOpenChange={(open) => { if (!open) onClose(); }}`. Añade `min-h-11` a los 6 action buttons (log-meal, create-recipe, import-url, log-tolerance, post-update, scan-barcode). Este es el sheet que aparece al pulsar el `+` del `BottomNav` — superficie de altísima visibilidad.

**Removed**
- `src/features/social/components/ShareSheet.tsx` — eliminado (68 líneas). `Grep` confirmó cero imports/consumers en todo `src/` (ni siquiera el propio feature social) — dead code desde feature inception, jamás se wireó al `PostDetail` ni al `StoryViewer`. Decisión: deleción directa siguiendo precedente Q14/Q18 (no dejar componentes huérfanos por si acaso).

**Notes**
- **Verificación en preview (pre-preflight)** — 3 migraciones validadas con `preview_inspect` sobre flows reales:
  - `CreateModal`: click `nav button[aria-label="Crear"]` → content reporta `border-top-left-radius: 24px`, `max-height: 322.8px` sobre viewport 366.8px (≈88vh ✓), overlay `background-color: oklab(0 0 0 / 0.25)` ✓, content `y=44` dejando status bar visible ✓.
  - `LogSnapshotModal`: click `Registrar peso` desde ProgressPreviewCard (Home) → mismos 24px + 88vh + overlay 25%, footer Cancelar/Guardar sticky ✓, body scrollable con collapsibles Foto/Medidas ✓.
  - `RecipePicker`: FAB → Publicar actualización → CreatePost → `Adjuntar receta` → mismos defaults + `actionSlot` ChefHat top-right + search + lista filtrada ✓.
  - `preview_console_logs --level error` → 0 errors durante las 3 aperturas.
- **Scope pivot documentado.** El plan original listaba 5 targets (`PhotoUploader`, `LogSnapshotModal`, `AddMeal`, `ImportRecipeURL`, `BarcodeScanner`). Audit reveló:
  - `PhotoUploader` es un Dialog picker inline que abre `fileInput` nativo, no una sheet.
  - `AddMeal` no contiene ninguna sheet propia (las tabs `Buscar`/`Mis alimentos` son inline).
  - `ImportRecipeURL` es un flow inline step-by-step, no sheet.
  - `BarcodeScanner` es un full-screen overlay (cámara), no una sheet. Arquitectura distinta.
  - `LogSnapshotModal` **sí** es sheet real — migrado.
  - Descubiertos 3 nuevos reales: `CreateModal` (disfrazado de Dialog center-modal pero UX-wise era sheet), `RecipePicker` (sheet hand-rolled sin primitive), `ShareSheet` (dead).
- **No tocado.** Tests (todos verdes), convention guardrails (ADR-009 locked en `bottom-sheet.test.ts`), primitives, tokens, i18n (0 keys nuevas — los labels los aporta el consumer vía `title` prop).
- **Siguiente en la roadmap.** PR 5 = Home hero consolidation (Bevel IMG_0974 ring pattern) detrás de feature-flag — requiere crear `src/lib/featureFlags.ts` primero, scope propio.

## [1.5.32] - 2026-04-18

### feat(theme) — 4 palettes × 3 modes (VOLT/OCEAN/EMBER/NEUTRAL × auto/light/dark) + Bevel-inspired NEUTRAL palette

PR 3 del roadmap Bevel (`.claude/plans/revisa-todas-las-capturas-ancient-micali.md`). Rediseña el sistema de themes: separa la decisión **paleta** (VOLT · OCEAN · EMBER · NEUTRAL) de la decisión **modo** (`auto` / `light` / `dark`). Añade `NEUTRAL` como paleta nueva Bevel-style (warm neutrals, emerald accent), preserva VOLT/OCEAN/EMBER con sus pares light/dark. Modo `auto` resuelve vía `matchMedia('(prefers-color-scheme: dark)')` y reacciona en runtime al cambio del sistema.

**Added**
- `src/contexts/ThemeContext.tsx` — rewrite: `Palette = 'volt' | 'ocean' | 'ember' | 'neutral'`, `ColorMode = 'auto' | 'light' | 'dark'`, `ResolvedMode = 'light' | 'dark'`. Exports `PALETTES`, `COLOR_MODES`, helpers puros `resolveMode(mode, systemMode)` y `themeClassName(palette, resolvedMode)` para testear sin React. `ThemeProvider` lee `rial-theme-v2` (`{palette, mode}`), migra legacy `rial-theme` una vez (`dark→{volt,dark}`, `light→{volt,light}`, `blue-*→ocean-*`, `orange-*→ember-*`), suscribe a `prefers-color-scheme` y swapea la clase en `<html>` al cambiar. Default nuevos usuarios: `{palette:'neutral', mode:'auto'}`.
- `src/index.css` — nuevos bloques `.theme-neutral-dark` (bg `#0a0a0b`, surface `#18181b`, primary `#fafafa`, brand-secondary emerald `#10b981`, error `#ef4444`) y `.theme-neutral-light` (bg `#fafaf9`, surface `#ffffff`, primary `#09090b`, brand-secondary emerald `#059669`, error `#dc2626`, outline-variant `#f1f1f3` casi invisible para el look borderless Bevel).
- `src/test/conventions/theme-palettes.test.ts` — 14 assertions que lockean las 8 clases CSS, el `:root + .theme-volt-dark` combined selector (initial-paint fallback), la lista canónica de `PALETTES`/`COLOR_MODES`, el passthrough de `resolveMode` con/sin auto, y que `themeClassName` produce exactamente las 8 clases esperadas.

**Changed**
- `src/index.css` — rename de 5 clases heredadas a la familia `theme-{palette}-{mode}`: `:root` → `:root, .theme-volt-dark` (combined selector); `.theme-light` → `.theme-volt-light`; `.theme-blue-dark` → `.theme-ocean-dark`; `.theme-blue-light` → `.theme-ocean-light`; `.theme-orange-dark` → `.theme-ember-dark`; `.theme-orange-light` → `.theme-ember-light`. Los tokens internos quedan intactos — solo cambia el selector.
- `src/index.css` — polish basado en teoría del color + posicionamiento competitivo: EMBER light `--brand-secondary` `#b45309` (amber-700 muddy) → `#d97706` (amber-600 clean); EMBER dark `--tertiary` `#ffffff` → `#fafaf9` (coherencia warm dentro de la paleta). Macros locked a `#f87171` / `#fbbf24` / `#38bdf8` en las 4 paletas (food-is-food consistency).
- `src/App.tsx` — consume `themeClassName` (aplicado como `className` al shell root) y `resolvedMode` (alimenta `<AuthScreens>` como `'light'|'dark'`). El acceso `theme.includes('dark')` queda obsoleto.
- `src/features/profile/components/settings/SettingsAppearance.tsx` — rewrite del picker: 2 secciones. (1) **Paleta** — grid 2×2 con NEUTRAL primero, luego VOLT/OCEAN/EMBER. Cada tile renderiza preview en `resolvedMode` actual, `role="radio"` + `aria-checked`, `min-h-[120px]`. (2) **Apariencia** — segmented control 3 chips (Auto con icono `Monitor` · Light con `Sun` · Dark con `Moon`), `min-h-11` HIG-compliant, hint "Sigue la configuración del sistema" bajo el chip Auto.
- `src/features/profile/components/Onboarding.tsx` — step 5 rewrite: sustituye el grid 3×2 VOLT/OCEAN/EMBER × Day/Night por un picker 4-tile (NEUTRAL/VOLT/OCEAN/EMBER). Modo queda en `auto` por defecto — el user lo puede cambiar desde Settings. Elimina dependency en el type `Theme` legacy (ya no existe).
- `src/i18n/locales/{es,en}.ts` — 13 keys nuevas por locale bajo `settings`: `palette`, `paletteVolt`/`Ocean`/`Ember`/`Neutral`, cuatro `*Desc` con narrativa por ICP, `modeAuto`/`Light`/`Dark`, `modeAutoHint`. Total i18n 1499 → 1523 keys simétricas.

**Notes**
- **Pivote arquitectónico vs plan original.** El plan apuntaba a consolidar 6 → 3 paletas con `@media (prefers-color-scheme)` a nivel CSS. Decisión del owner (2026-04-17): mantener **4 paletas** (VOLT se preserva) y añadir **eje de modo manual** (`auto` / `light` / `dark`) para que el user pueda forzar modo contra el sistema. Esto descarta el approach CSS-only y lo implementa en JS (clase runtime + matchMedia listener).
- **Migración legacy.** Usuarios con `rial-theme = 'blue-dark'` aterrizan en `{palette:'ocean', mode:'dark'}` en el primer mount post-update. La clave legacy se elimina tras la migración. Testeado en preview: reload con `rial-theme='orange-dark'` → DOM class `theme-ember-dark` aplicada + `rial-theme-v2` escrito + legacy key eliminada.
- **Diferenciación competitiva por paleta.** VOLT `#dcfd05` (atleta performance — hueco vs WHOOP rojo y Strava naranja). OCEAN sky blue saturado (ritmo analítico — distinguible de MFP/Cronometer medical blue). EMBER `#ea580c` vivid (creativo cocina — "apetitoso" vs Paprika/Yummly "book-style"). NEUTRAL warm neutrals + emerald (adulto wellness — hueco sin competencia en fitness, dominado por blue/green). Documentado en `docs/market/bevel-design-playbook.md` §4.1.a.
- **Convention guardrail.** `theme-palettes.test.ts` falla si cualquiera de las 8 clases desaparece o si `PALETTES`/`COLOR_MODES` mutan sin ADR.
- **No tocado.** ADR-005 (theme by class, no `dark:` prefix) sigue vigente. El bloque `:root` sigue como initial-paint fallback (ahora combined selector con `.theme-volt-dark` para coincidir con el default runtime).

## [1.5.31] - 2026-04-17

### feat(ui) — `<BottomSheet>` primitive (ADR-009) + 2 consumer migrations (PortionSheet + PublishRecipeSheet)

PR 2 del roadmap Bevel (`.claude/plans/revisa-todas-las-capturas-ancient-micali.md`). Materializa ADR-009: un único primitive `<BottomSheet>` que centraliza la anatomía Bevel-style de sheets bottom-anchored (`max-h-[88vh]`, `rounded-t-3xl`, handle pill, overlay 25%, sticky header con close + title + action slot, scrollable body, footer con safe-area-inset). Reemplaza dos sheets hand-rolled con markup inconsistente.

**Added**
- `src/components/ui/bottom-sheet.tsx` — primitive wrapping `radix-ui Dialog` directamente (mismo primitive que shadcn `Sheet`, stacking nativo). Props: `open`, `onOpenChange`, `title`, `description?`, `actionSlot?`, `footer?`, `hideCloseButton?`, `contentClassName?`. Close button HIG 44×44. Handle pill `h-1 w-8 bg-outline-variant/60`. Overlay `bg-black/25` (no 50% — preserva contexto detrás). Safe-area-inset en footer.
- `src/test/conventions/bottom-sheet.test.ts` — convention test (static file regex) que bloquea regresiones de ADR-009: export default, `max-h-[88vh]`, `rounded-t-3xl`, handle pill con tokens correctos, overlay 25% no 50%, close HIG 44×44, Portal+Overlay+Content radix, `SheetPrimitive.Title`+`.Description` para a11y, `env(safe-area-inset-bottom)`.

**Changed**
- `src/features/food/components/PortionSheet.tsx` — migrado de sheet hand-rolled (`fixed inset-0` + `bg-black/60` + `rounded-t-2xl` + handle propio + sticky footer manual) a `<BottomSheet>`. API pública (`ingredient`, `onConfirm`, `onClose`, `unitSystem`) sin cambios — drop-in replacement en `AddMeal.tsx:561`. CTA "Log it" como `footer` slot.
- `src/features/social/components/PublishRecipeSheet.tsx` — migrado de sheet hand-rolled (`fixed inset-0 bg-background/80 backdrop-blur-sm` + `rounded-t-lg`) a `<BottomSheet>`. `<Globe>` en `actionSlot`, `<Send>` CTA como `footer`. `aria-label` añadido al textarea (estaba ausente). API pública (`recipe`, `onClose`) sin cambios — drop-in replacement en `RecipeDetail.tsx:843`.
- `src/test/conventions/primitives-export.test.ts` — añade `BottomSheet` al grupo "dialog primitives" per PRIMITIVES §4 step 5.
- `docs/PRIMITIVES.md` — §1 table: `Sheet` marcado como "(shadcn, legacy)" y reservado para left/right/top drawers; nueva row `BottomSheet` apuntando a `src/components/ui/bottom-sheet.tsx` para "Bottom-anchored secondary surfaces (pickers, edit detail, filter groups)". §2 añade ejemplo mínimo con `actionSlot` + `footer` y callout con los defaults de ADR-009.

**Notes**
- **Piloto pivot.** El plan original apuntaba a `RecipeDaySelectorSheet` + `MealSlotMultiSelect` como piloto — inspección reveló que no son sheets reales (ambos son componentes inline: chip groups / inline cards). Pivotamos a los dos sheets hand-rolled reales más activos: `PortionSheet` (flujo AddMeal) y `PublishRecipeSheet` (flujo share-to-feed desde RecipeDetail). Cobertura UX mayor sin cambiar la intención del PR.
- **Dead code.** `src/components/social/ShareSheet.tsx` es un sheet hand-rolled real sin callsites. Se deja intacto para un dead-code sweep separado.
- **Legacy `Sheet`.** `src/components/ui/sheet.tsx` permanece como ruta para left/right/top drawers. Nuevo código de bottom-sheet debe usar `<BottomSheet>`.
- **Roadmap palette (PR 3 addendum).** El usuario confirmó que el color Bevel se implantará como **paleta 1 con variantes light y dark**, y que las 6 themes actuales (volt / blue / orange × dark / light) se consolidarán a **3 paletas con dark/light automático según `prefers-color-scheme`**. PR 3 debe shippear el par `.theme-light` + `.theme-dark` de paleta 1 desde día 1 para que la futura consolidación encuentre la base lista. Documentado en `docs/market/bevel-design-playbook.md` §4.1 + §5 roadmap.

## [1.5.30] - 2026-04-17

### docs(design) — Bevel design playbook + ADR-008 (pricing) + ADR-009 (bottom-sheet anatomy)

Foundations-only PR (zero code). Consolida 64 capturas Bevel (IMG_0951–IMG_1019) en un playbook accionable con matriz **Copy / Adapt / Skip**, formaliza dos decisiones arquitectónicas (pricing model + sheet anatomy) y alinea `.theme-light` hacia un "color 1" Bevel-style. Plan: `.claude/plans/revisa-todas-las-capturas-ancient-micali.md`.

**Added**
- `docs/market/bevel-design-playbook.md` — playbook accionable con catálogo de 50 capturas agrupadas en 10 tipologías (A onboarding … J sync), matriz Copy/Adapt/Skip (22 patrones), 9 principios destilados (sistema visual, tipografía, information design, bottom sheets, empty states, pills, pricing, FAB mega-menu, lo que NO copiamos), roadmap 4 PRs, baselines esperadas post-ejecución.
- `docs/adr/ADR-008-pricing-model.md` — **"Free-generous core + single premium tier"** formalizado. Free = tracking + recetas + planner + wellness + wearable básico + sync. Pro = AI Coach cross-módulo + AI meal planner + photo recognition + import auto URL + wearable insights + share cards + temas premium. Trial 14 días con timeline visual Bevel-style. Precio exacto diferido a Q6+. Descarta explícitamente el modelo MFP (Premium + Premium+) y el tier lifetime.
- `docs/adr/ADR-009-bottom-sheet-anatomy.md` — anatomía formal de sheets: `max-h-[88vh]`, `rounded-t-3xl`, handle pill 4×32 px, overlay `bg-black/25` (no 50%), sticky header con X + title + action slot, scrollable content, stacking nativo radix. API sketch del `<BottomSheet>` primitive. Migration path progresiva (sheet shadcn legacy permanece). Test de convención a añadir en PR 2.

**Changed**
- `docs/DESIGN-SYSTEM.md` — §6 References añade ADR-008 + ADR-009 + playbook. Nuevo §7 "Light-mode reference: Bevel" con subsecciones 7.1–7.5: superficies (target `--background` `#fafaf9` + borderless cards en light), bottom-sheet anatomy (remite a ADR-009), empty states (variant `info` sin CTA para sub-sheets), information design (patrón jerárquico módulo), y lista explícita de lo que NO es Bevel-style (JetBrains Mono macros, VOLT/OCEAN/EMBER, recipes, CGM).
- `docs/NEW-SCREEN-CHECKLIST.md` — nueva sección §6c "Bottom sheets follow ADR-009" con 3 items de gate (primitive `<BottomSheet>` o anatomy manual, status bar visible, contenido scrollable interno).

**Notes**
- **Out of scope:** cero cambios en `src/`, `supabase/`, tests, CI, i18n, pipeline. Es 100% documentación — TypeScript / lint / tests / build sin diff respecto a `[1.5.29]`.
- **Roadmap encadenable:** `[1.5.30]` (docs) → `[1.5.31]` (BottomSheet primitive + 2 consumers piloto) → `[1.5.32]` (`.theme-light` Bevel-tune: `--background: #fafaf9` + borderless) → `[1.5.33]` (migration 5 consumers + Home hero consolidation flaggable). Cada PR auto-contenido y revertible.
- **Open items ADR-009:** detents iOS-style (3 alturas 33/66/88 vh) diferidos — requiere `vaul` o gesture state que radix no expone. Keyboard-aware padding validación en PR 2 durante migration piloto.
- **Gobernanza:** trabajar directamente en `main`. Push a `rial-food/main` tras aprobación explícita del usuario ("continua").

## [1.5.29] - 2026-04-17

### fix(demo-seed) — Clear demo now drops seed-version markers and uses unprefixed keys

Follow-up to 1.5.22. `createHandleClearDemoSeed` was leaving `rial_seedVersion_<key>` markers intact, so after clicking "Clear demo" and reloading, `shouldReseed` saw `stored === current` and skipped re-hydration — the user was left with empty seeded slots (e.g. Cocina showed 0 recipes) until they manually wiped localStorage. Same handler also used a stale `rial_` prefix on every `localStorage` op, so the explicit removals were no-ops and the direct-write `rial_weeklyCheckIns` / `rial_demoSeedVersion` keys were orphans that nothing read.

**Fix.** `createHandleClearDemoSeed` now iterates `ALL_SEED_KEYS` and calls `clearSeed(key, key)` from `src/lib/seedVersion.ts` — removes both the data key and its version marker. `createHandleLoadDemoSeed` writes `weeklyCheckIns` unprefixed (matching `useLocalStorageState`). Orphan `demoSeedVersion` write and the unused `DEMO_SEED_KEYS` / `DEMO_SEED_VERSION` / `version` bundle field in `demo-seed.ts` are dropped.

**Changed**
- `src/features/dev/handlers/demo-seed-handlers.ts` — imports `ALL_SEED_KEYS` + `clearSeed`; clear loop now removes version markers; load writes `weeklyCheckIns` not `rial_weeklyCheckIns`; drops orphan `rial_demoSeedVersion` write.
- `src/features/dev/data/demo-seed.ts` — removes unused `DEMO_SEED_KEYS` export, `DEMO_SEED_VERSION` constant, and `version: number` on `DemoSeedBundle`.

**Notes**
- Behavior change is observable only via the dev-only DemoSeedCard flow in Settings.
- Tests `src/features/dev/handlers/demo-seed-handlers.test.ts` land in the companion commit (7 regression tests locking the fix).

## [1.5.28] - 2026-04-17

### docs(market) — Priorización competitiva + análisis de pantallas + datos duros (`priority-review.md` + 8 fichas top enriquecidas)

Segunda capa sobre `[1.5.27]`. La baseline 1.5.27 dejó 18 fichas deep-dive **equiparables** — todas con el mismo peso. El equipo pidió pasar de "catálogo" a "material ejecutable": (1) qué 8 apps merecen revisión profunda y por qué, (2) qué pantallas concretas estudiar de cada una, (3) a qué ruta de `src/features/.../screens/*.tsx` aplicar la lección, y (4) datos duros (rating + growth + users + revenue) con fuente y fecha. Plan: `.claude/plans/mejora-toda-la-secci-n-generic-church.md` (v2).

**Added**
- `docs/market/priority-review.md` — scorecard 6 ejes × 20 apps (rating combinado App+Play, growth 12m, users/MAU, overlap ICP Clara/Marcos/Ana, amenaza geográfica ES/LatAm, UX transferibles). Tie-breaker documentado (Clara). **Top 8 seleccionado**: MyRealFood (24), Yazio (26), Fitia (28), Lifesum (19, contra-ejemplo), MyFitnessPal (23), MacroFactor (23), Paprika (20), Bevel (16+?). Descartados del Top 8 explicados en 1 línea. **5 implicaciones accionables para RIAL** con archivo objetivo concreto:
  1. MyRealFood → Real Score equivalente en `src/features/food/components/BarcodeScanner.tsx` antes de Q8.
  2. Fitia → decidir entrada LatAm Q8 vs Q10; `src/features/food/data/seed-recipes.ts` regional.
  3. Bevel → modelo pricing free-generous + single premium como north-star post-Q6 + ADR-008 en `src/features/profile/screens/RialPlus.tsx`.
  4. MacroFactor → TDEE adaptativo como Pro feature Q10+ en `src/features/profile/utils/calorie-calc.ts`.
  5. Paprika → valida MealSlot multi-valued (Q19 `5dab667`); cerrar debate hasta Q20+.

**Changed**
- `docs/market/deep-dives/myrealfood.md` — header **Hard metrics** (Instagram Carlos Ríos 1.5M, 2M+ usuarios, 160k+ recetas, 4★+ ambos stores) + sección **Pantallas principales** (×5): Home Real Score semanal (copiar a `Home.tsx` + NutritionHero), Barcode NOVA (copiar a `BarcodeScanner.tsx` — **implicación accionable #1**), Social feed UGC (evitar fragmentar en `src/features/social/screens/Community.tsx`), Recipe library NOVA filter (copiar a `Cocina.tsx`), Weekly meal-prep generator (copiar a `Planner.tsx`).
- `docs/market/deep-dives/yazio.md` — Hard metrics (4.6★ Play 300k reviews, Google Excellence App, 95M-100M users, 10M+ downloads, $9.99/mo Pro) + Pantallas (×5): Onboarding 3-step (copiar a `Onboarding.tsx`), Home ring + fasting inline (copiar a `Home.tsx`), Recipe cards hero-image (paridad `RecipeCard.tsx`), Free fasting timer (mantener `FastingTimer.tsx`), Weekly progress report (copiar a `Progress.tsx`).
- `docs/market/deep-dives/fitia.md` — Hard metrics (4.9★ ambos stores, 10M+ users, 1M+ MAU, +16.11% Jan 2026, $3.5M rev 2024, launched LATAM+ES 2019) + Pantallas (×5): Country selector onboarding (evaluar ICP LatAm en `Onboarding.tsx`), Plan auto-generated editable (copiar a `Planner.tsx` — **implicación #2**), Macros breakdown regional (copiar `AddMeal.tsx` seed LatAm), Family Plan multi-profile (defer a Q15+), Grocery delivery integrations (ignorar V1).
- `docs/market/deep-dives/lifesum.md` — Hard metrics + warning (Trustpilot 1.7★ + reviews reverse-trial) + Pantallas (×5): Unified `+ Track` input (copiar al activar photo-recog en `AddMeal.tsx`), Life Score consolidado (validar `WeeklyScoreCard` cubre dimensiones), Diet plan como lente global (copiar parcial a Q10+), Reverse trial paywall (**evitar** en ADR-008 pricing), Recetas filtradas por plan (copiar a `Cocina.tsx`).
- `docs/market/deep-dives/myfitnesspal.md` — Hard metrics (4.7★ iOS / 4.4★ Play, 200M community, 900k iOS + 530k Play DL/mo, 18M foods DB, Cal AI M&A marzo 2026, $19.99 Premium / $24.99 Premium+) + Pantallas (×5): Diary con suma running (mantener `NutritionHero`), Barcode con histórico porciones (copiar a `BarcodeScanner.tsx` en Q6+), Recipe importer URL (mantener `ImportRecipeURL.tsx`), Quick-add calorías (copiar a `AddMeal.tsx`), Premium vs Premium+ (**evitar** en ADR-008).
- `docs/market/deep-dives/macrofactor.md` — Hard metrics (82k paid customers Sep 2022, ~100k DL/mo, ~$2M rev/mo, bootstrapped $0 VC, $11.99/mo · ~$72/año, 3× precisión claim) + Pantallas (×5): Weekly TDEE adjustment transparente (copiar Q10+ a `calorie-calc.ts` + `Progress.tsx` — **implicación #4**), Weight trend suavizado (copiar EMA a `WeightTrendCard.tsx`), Quick-add macros no kcal (opción en `AddMeal.tsx`), Zero-shame design (toggle Pro en `SettingsNutrition.tsx`), Contenido educativo integrado (copiar Q15+ a `Discovery.tsx` / `Explore.tsx`).
- `docs/market/deep-dives/paprika.md` — Hard metrics ($4.99 lifetime iOS+Android, $29.99 desktop, desde 2011 v3 actual, cross-platform) + Pantallas (×5): Web clipper / share-sheet (copiar Q6+ Capacitor Share), Recipe scaling inline (copiar 2-3h a `RecipeDetail.tsx`), Multi-slot recipe placement (**validado** Q19), Meal planning drag-drop (mantener + mejorar `Planner.tsx`), Grocery list manual-friendly (paridad `ShoppingList.tsx`).
- `docs/market/deep-dives/bevel.md` — Hard metrics + warning (launched mid-2025, Apple Watch Spotlight + New & Noteworthy, core gratis dic 2025, Bevel Intelligence $9.99/mo · $79.99/año, múltiples source-needed por recencia) + Pantallas (×5): Home Dashboard 5 rings (copiar post-Q6 a `Home.tsx` — **implicación #3**), AI Coach cross-módulo (copiar cross-context a `AICoach.tsx` + `gemini-proxy`), Pricing free-generous + single premium (copiar a `RialPlus.tsx` + ADR-008), Module deep-link pattern (**evitar** convertir Progress/Pantry en apps-dentro-de-app), Glucose/CGM integration (**ignorar** V1, monitorear ZOE/Levels 2027).

**Cross-refs**
- `docs/market/README.md` — nueva entrada en tabla "Pregunta → Archivo" apuntando a `priority-review.md` ("¿Cuáles merecen revisión profunda y por qué?"); nodo `priority-review.md` añadido al árbol de estructura; plantilla ficha actualizada para reflejar secciones **Hard metrics** + **Pantallas principales** solo en Top 8.
- `docs/market/rial-positioning.md` — nueva sección `§3.1 Priorización competitiva (2026-04-17)` antes de §4 Moats, listando los 8 competidores prioritarios con la razón estratégica (1 línea por app).
- `docs/market/feature-matrix.md` — nota superior ahora remite a `priority-review.md` para decisiones de producto; matriz feature-a-feature queda como referencia 18-app no-priorizada.

**Notes**
- **Anti-objetivo cumplido:** cero datos inventados. Cada fila de Hard metrics lleva URL + fecha; cuando no se pudo verificar (muchos casos en Bevel por recencia, o revenue de apps privadas), queda `(source needed)` explícito. Preferible honesto-incompleto que falso-completo.
- **Out of scope:** cero cambios en `src/`, `supabase/`, tests, CI, i18n, pipeline. Es 100% documentación — TypeScript / lint / tests / build sin diff respecto a `[1.5.27]`.
- **Ejecutabilidad:** cada una de las 8 fichas responde ahora a 3 preguntas mecánicas: "¿qué pantalla estudiar?", "¿a qué archivo de `src/` aplica?", "¿copiar/evitar/ignorar?". Esto convierte `docs/market/` de catálogo pasivo a input directo del roadmap.
- **Maintenance gate:** próximo recheck priorización en 2026-10-17 (6 meses) o antes si un competidor cambia de tier (Cal AI absorbido, Simple levanta Serie C, etc.). Hard metrics re-snapshot cuando pricing / rankings cambien.

## [1.5.27] - 2026-04-17

### docs(market) — Competitive baseline `docs/market/` (índice + matriz + posicionamiento + 18 fichas deep-dive)

Capa **viva** de inteligencia de mercado separada de `docs/archive/` (snapshots históricos Q1 2026, cold-storage). El análisis competitivo previo estaba fragmentado en 5 docs archivados + menciones sueltas en `state.md`; competidores clave citados por el equipo (Lifesum, Yazio, Fitia, Fastic, Cal AI, Yuka) quedaban sin ficha propia. Esta entrada cierra el gap con estructura modular cargable por demanda — ningún archivo en `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` / `.cursor/rules/` / `.windsurf/rules/` la auto-importa (evita saturar prompts en el 90% de sesiones que no tocan competidores). Plan: `.claude/plans/mejora-toda-la-secci-n-generic-church.md`.

**Added**
- `docs/market/README.md` — índice carpeta, cómo leer, plantilla ficha, reglas de mantenimiento (re-snapshot rankings cada 3 meses, fichas 6 meses o ad-hoc en eventos de mercado), mapa de cambios mayores abril 2026 (MFP × Cal AI, Whoop Healthspan + Oura Dexcom Stelo, Simple Serie B $35M).
- `docs/market/competitors-index.md` — **46 apps** clasificadas por Tier (A directos con ficha / B indirectos entrada corta / C adyacentes monitoreo) × categoría funcional (tracking, planner, ayuno, coaching, all-in-one) + geografía primaria + modelo de negocio + movers 12 meses.
- `docs/market/feature-matrix.md` — matriz 16 features RIAL × 18 apps Tier A + RIAL (leyenda ✓/⦿/✗/—). Ranking agregado por paridad con RIAL identificando Lifesum + Yazio + Fitia + MyRealFood + MFP + Bevel como threats más altos.
- `docs/market/ux-patterns.md` — patrones UX clasificados 🟢 copiar / 🟡 adaptar / 🔴 evitar / ⚪ ya hecho, con fuente (app) y archivo repo donde aplica. 13 secciones (onboarding, discovery, log flow, planner, recetas, progreso+wellness, paywall, social, a11y/HIG, anti-patterns) + 12 patrones pendientes priorizados por sprint.
- `docs/market/rial-positioning.md` — posicionamiento en 1 línea + 3 ICP canónicos (Clara cut / Marcos muscle / Ana health, alineados con `src/features/profile/data/demo-personas.ts`) + 5 moats defensibles + 5 gaps no defensibles + MVP competitivo mínimo (RIAL cumple los 6 requisitos top-10 ES) + hoja de ruta + pricing propuesto + riesgos estratégicos + métricas de éxito north-star.
- `docs/market/app-store-rankings.md` — snapshot rankings 2026-04-17 (ES + US + DE + UK + LatAm) iOS + Android, Top Free + Top Grossing. Metodología explícita, movers 12 meses, implicaciones estratégicas por mercado, fuentes de re-snapshot.
- `docs/market/deep-dives/*.md` (×18) — fichas con plantilla fija: header categoría/ICP/geo/pricing/tracción + Qué hace bien + Gaps + Patrones UX + Comparación con RIAL (16 filas fijas consistentes con `feature-matrix.md`) + Lecciones aplicables + Fuentes. Apps: MyFitnessPal, Cal AI, Lifesum, Yazio, Fitia, Cronometer, MacroFactor, MyRealFood, Noom, Fastic, Zero (by MFP), Yuka, Mealime, Eat This Much, Paprika, PlateJoy, Whoop, Bevel.

**Changed**
- `docs/ai/project.md` — añade línea "Competitive baseline" en sección Key docs apuntando a `docs/market/` (no auto-cargado).
- `docs/ai/state.md` — añade entrada en "Active repository conventions" con punteros al índice + matriz + posicionamiento. Mantiene el principio de carga por demanda.
- `docs/archive/README.md` — nota superior redirige a `docs/market/` para análisis vivo; los archivos de archive quedan marcados explícitamente como snapshots históricos Q1 2026 no mantenidos.

**Notes**
- **Anti-objetivo cumplido:** ninguna ficha inventa datos. Cifras verificadas con fuente pública 2024-2026; lo no verificable queda marcado `(source needed)` en vez de dato falso.
- **Out of scope deliberado:** cero cambios en `src/`, cero cambios en tests, cero movimientos de pipeline CI. Es 100% documentación — TypeScript / lint / tests / build sin diff respecto a `[1.5.26]`.
- **Maintenance gate:** re-snapshot rankings en 2026-07-17 (cada 3 meses); fichas deep-dive en 2026-10-17 (6 meses) o antes si el competidor cambia pricing, es adquirido, hace rebrand o cambia equipo. Propietario: quien abra el siguiente sprint de mercado.
- **Descubribilidad para agentes:** ninguna sesión RIAL auto-carga `docs/market/` — debe mencionarla un prompt sobre competidor / UX benchmark / rankings / posicionamiento. Razón: volumen alto (4000+ líneas) que saturaría prompts en el 90% de tareas de desarrollo puro.

## [1.5.26] - 2026-04-17

### feat(recipes) — Fase 2 multi-media (PhotoUploader + compresión client-side)

Segunda capa del sprint multi-media: el uploader que cierra el gap entre "Fase 1 display-only" y las recetas que los creadores quieren publicar con varias fotos del plato. Hoy `CreateRecipe` ya guarda `photos[]` en el payload, y `RecipeDetail` las renderiza vía la `HeroGallery` introducida en Fase 1. La decisión de storage (bucket Supabase vs data URLs) sigue **diferida a Q6**: por ahora las fotos comprimidas persisten en `localStorage → IDB` (la migración lazy de `src/lib/storage.ts:migrateLocalStorageToIDB` ya cubre la cuota). Plan: `.claude/plans/revisa-el-recepi-card-crystalline-moore.md` (addendum Fase 2).

**Added**
- `src/lib/imageCompress.ts` — módulo canónico de compresión. API posicional idéntica al legacy (`compressImage(file, maxWidth, quality)`) para no romper a los tres llamadores existentes (`LogSnapshotModal`, `SettingsProfile`, social `ImagePicker`). Expone `RECIPE_PHOTO_OPTIONS = { maxWidth: 1200, quality: 0.82 }` (defaults más conservadores que los 800/0.6 del feed social porque el hero de receta se amplía a pantalla completa) y `estimateBase64Bytes(dataUrl)` para checks de cuota antes de persistir.
- `src/lib/imageCompress.test.ts` — 6 asserts (defaults, padding de base64, estimación de 200KB realista).
- `src/lib/platform.ts` — `pickImage(source)` helper complementario a `openExternalVideo`. Dynamic import de `@capacitor/camera` en native (`CameraResultType.DataUrl`, `CameraSource.Camera | Photos`, quality 90 antes de la compresión canónica). Web retorna `null` (no hay plugin Camera en browser) y el caller activa el fallback `<input type="file">`. Cualquier error del plugin (incluye cancelación del usuario en iOS) se traga silenciosamente.
- `src/features/recipes/components/PhotoUploader.tsx` — grid 3-col con thumbnails 1:1 + celda "+" mientras `photos.length < max`. Badge "Portada" en `photos[0]`. X button 44×44 (ADR-003). Native abre action-sheet shadcn Dialog (Cámara / Galería); web dispara file input oculto con `multiple`. Compresión automática vía `RECIPE_PHOTO_OPTIONS`. Cap de `10 MB` por archivo antes de compresión (toast `photoTooLarge`). Haptic `light` al elegir source.
- 11 claves i18n simétricas ES ↔ EN bajo `createRecipe`: `photosSectionLabel`, `addPhoto`, `removePhoto`, `photosCount`, `coverBadge`, `pickSourceHint`, `pickFromCamera`, `pickFromGallery`, `compressingPhoto`, `photoTooLarge`, `photoError`.

**Changed**
- `src/features/recipes/screens/CreateRecipe.tsx` — añade `photos: string[]` al form state (hidrata desde `initialRecipe?.photos ?? []` para preservar en edit-mode). El placeholder estático `<Camera />` en el paso 1 se reemplaza por `<PhotoUploader photos={photos} onChange={setPhotos} max={6} />`. `handleSave` ahora usa `photos[0]` como `img` cuando hay fotos (backward-compat con el hero legacy) y propaga `photos: photos.length > 0 ? photos : undefined`.
- `src/features/social/utils/image-utils.ts` — ahora re-exporta `compressImage` desde el módulo canónico `src/lib/imageCompress.ts`. Los tres llamadores existentes (LogSnapshotModal, SettingsProfile, ImagePicker) siguen compilando sin cambios.

**Notes**
- **Decisión de storage**: 6 fotos × ~200 KB = ~1.2 MB por receta en `savedRecipes` (data URLs base64). Excede el row-limit típico de Supabase `user_data` (~1 MB JSON). El sync layer sigue **excluyendo savedRecipes con data URLs del push a Supabase hasta Q6**; la persistencia local sobrevive vía `migrateLocalStorageToIDB` (IDB ~GBs). Fase 3 (Q6) migrará `photos[]` a un bucket Supabase Storage + URLs firmadas, y añadirá el threshold de sanitización al `SyncKey`.
- **Out of scope Fase 2**: reorder drag+drop, upload de video local, galería por-step (`RecipeStep.photoUrl` sigue single), og:image extraction en ImportRecipeURL (requiere nueva Edge function `og-fetch`, queda para Fase 3 = Q6).
- **Capacitor**: `@capacitor/camera` ^8.0.2 ya estaba instalado desde sprint-q5 para el flujo de avatar/BodySnapshot. El lazy import respeta el patrón de `triggerHaptic`/`shareContent` — no añade bytes al bundle web.

## [1.5.25] - 2026-04-17

### feat(q19-meal-taxonomy) — Recipe.mealType (single) → Recipe.suitableFor: MealSlot[] (multi-valued)

Refactor de modelo y UX que resuelve el caso de uso real "¿comida o cena?": una receta puede encajar en varias franjas simultáneamente, y las versátiles (sin asignación) encajan en todas. Precedente Paprika/PlateJoy. Mantiene las 4 franjas canónicas (Breakfast/Lunch/Dinner/Snack) como vocabulario; cambia cómo una receta se asocia a ellas. Cierra de paso una regresión silenciosa pre-Q19 donde las recetas creadas o importadas por el usuario nunca recibían `mealType` y quedaban invisibles en los filtros de franja (solo "Todo" y "Rápido"). Plan: `.claude/plans/analiza-si-tiene-sentido-floating-kurzweil.md`.

**Changed**
- `src/types/recipe.ts` — `Recipe.mealType?: string` → `@deprecated`, promovido `Recipe.suitableFor?: MealSlot[]`. `MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'` canónico aquí; re-export desde `src/types/index.ts` para eliminar la dependencia cruzada feature→feature (antes vivía en `MealSlotSelector.tsx`).
- `src/lib/schemas.ts` — zod dual: `suitableFor: z.array(z.enum([...])).optional()` + legacy `mealType: z.string().optional()` retenido para hidratación de storage pre-Q19.
- `src/features/food/data/seed-recipes.ts` — 46 recetas migradas a `suitableFor[]`. Los mains versátiles (bowls, pasta, ensaladas) llevan `['lunch','dinner']`; specifics mantienen un solo slot. `src/lib/seedVersion.ts` bump `savedRecipes` 3 → 4 para re-hidratar usuarios existentes con estrategia `preserve-user` (no pisa recetas propias).
- `src/features/recipes/screens/Cocina.tsx` + `src/features/home/screens/Discovery.tsx` — filtros pasan de `r.mealType === active` a `recipeFitsSlot(r, active)`. "Rápido" sale del eje primario de franjas y se promueve a `collections` (eje ortogonal tiempo ≤ 20 min, junto a Proteína/Batch/Vegetal). Sin toggle grid↔carrusel: Cocina sigue grid (biblioteca), Discovery sigue carrusel (editorial).
- `src/features/recipes/components/RecipeDaySelectorSheet.tsx` + `src/features/recipes/handlers/recipe-handlers.ts` — default slot pasa de `recipe.mealType` a `defaultSlotFor(recipe)` (primer entry de `suitableFor`, fallback `'lunch'`).
- `src/i18n/locales/es.ts` + `src/i18n/locales/en.ts` — namespace canónico `t.mealSlot.{breakfast,lunch,dinner,snack}`. Eliminados duplicados (`t.discovery.catLunch: 'Almuerzo'` → `'Comida'`; `t.discovery.catSnack: 'Snacks'` → `'Snack'`; `t.plan.mealTypeSnack: 'MERIENDA'` → `'SNACK'`). Un solo vocabulario visible. +13 claves, 1475 → 1488 simétricas ES ↔ EN.

**Added**
- `src/features/recipes/utils/meal-slot.ts` — helpers canónicos:
  - `getRecipeSlots(recipe)` normaliza nuevo `suitableFor` + legacy `mealType` (ES + EN, case-insensitive, acepta `desayuno`/`almuerzo`/`comida`/`cena`/`merienda`/`snack`). Retorna `undefined` cuando la receta es versátil (semánticamente distinto de `[]`).
  - `recipeFitsSlot(recipe, slot)` → `true` para versátiles.
  - `defaultSlotFor(recipe)` → primer entry o `'lunch'`.
- `src/features/food/components/MealSlotMultiSelect.tsx` — nuevo picker multi-check (variante de `MealSlotSelector`). HIG-compliant (`min-h-11`), `role="group"`, `aria-pressed`. 4 píldoras icono + label (Sun/UtensilsCrossed/Moon/Apple).
- `src/features/recipes/screens/CreateRecipe.tsx` — nuevo state `suitableFor: MealSlot[]`, picker integrado entre difficulty/servings y Source/Video. Hidrata desde `getRecipeSlots(initialRecipe) ?? []` para que edit-mode honre el `mealType` legacy sin pérdida de datos. Default en receta nueva: `[]` (versátil, encaja en todas las franjas).
- `src/features/recipes/screens/ImportRecipeURL.tsx` — `inferSuitableFor(title)` heurística ES/EN: `pancake|avena|tostada|yogur` → breakfast; `barrita|galleta|snack|merienda` → snack; `sopa|bowl|pasta|arroz` → lunch+dinner. Pre-selecciona chips editables tras parseo; si el usuario no toca, se guarda la inferencia.
- `src/features/recipes/utils/meal-slot.test.ts` — **27 assertions** cubriendo suitableFor precedence, legacy ES/EN normalization, case-insensitivity, versátil fallback, `defaultSlotFor`. Suite total: 515 → **542**.
- Migración eager idempotente en `src/contexts/AppStateContext.tsx` — una useEffect post-mount detecta recetas con `mealType` legacy pero sin `suitableFor`, las normaliza vía `getRecipeSlots`, dropea el campo legacy. Early-return cuando no hay nada que migrar; seguro en cualquier orden respecto al reseed.
- 2 claves i18n en `createRecipe`: `suitableForLabel` ("Apta para" / "Suitable for") + `suitableForHelp` ("Deja vacío si encaja en cualquier franja" / "Leave empty if it fits any slot").

**Fixed**
- Recetas creadas o importadas por el usuario no aparecían en filtros de franja (regresión silenciosa pre-Q19: `CreateRecipe` y `ImportRecipeURL` nunca asignaban `mealType`, y los filtros comparaban con `===`).
- `CreateRecipe` edit-mode de una receta con `mealType` legacy: el picker mostraba vacío y al re-guardar se perdía el slot. Ahora hidrata vía `getRecipeSlots(initialRecipe)`.

**Notes**
- **Compatibilidad**: storage pre-Q19 se lee transparentemente vía `getRecipeSlots`. Ningún consumer accede `.mealType` directamente (audit en close-out: 0 accesos en `Home.tsx`, `TodaysMeals`, `AddMeal.tsx`, `Planner.tsx`). Las únicas referencias supervivientes son el parser legacy en `meal-slot.ts` y las claves i18n `t.plan.mealType*` (labels, no leen del modelo).
- **Out of scope (Q16 codemod sprint)**: deprecación de `Recipe.tag: string` ad-hoc (GUARDADO/VEGANO/EXPRESS/BATCH/MI RECETA/IMPORTADA/POSTRE/SNACK/DESAYUNO/PLANEADO/SOBRAS). Bug latente conocido: `Discovery.tsx:126` filtra por `r.tag === 'VEGANO'` mientras `CreateRecipe` escribe a `tags[].includes('vegan')` — recetas de usuario vegano no aparecen en el filtro Vegano. Se documenta pero no se arregla en este sprint (requiere introducir `origin?: 'user' | 'imported' | 'seed'` + `FoodTag = 'batch-cooking'` + migración de 40+ sitios).
- **Out of scope (Q20+)**: timeline sin slots (MacroFactor-style) y slots configurables/renombrables por usuario. No se tocó el modelo de `mealPlan: Record<number, Meal[]>` — sigue soportando N meals arbitrarios por día.

## [1.5.24] - 2026-04-17

### feat(recipes) — Fase 1 multi-media (hero carousel + lightbox + video híbrido)

Primera capa display-only de multi-foto y video en recetas. Consume `photos?: string[]` + `videoUrl?: string` que ya existían en `Recipe` pero nunca se renderizaban. **Sin uploader**: esta fase desbloquea el UX (creadores ven varias fotos, importadores enlazan Reels/TikToks) sin comprometer la decisión de storage, que queda para Q6 Supabase. Estrategia de video híbrida: YouTube inline (iframe `youtube-nocookie.com`), TikTok / Instagram / Vimeo → poster + link-out vía `@capacitor/browser` (iOS Universal Links / Android App Links abren la app nativa si está instalada; web fallback a `window.open` con `noopener,noreferrer`). Mismo patrón que Yummly, NYT Cooking, Paprika. Plan: `.claude/plans/revisa-el-recepi-card-crystalline-moore.md`.

**Added**
- `src/types/recipe.ts` — `VideoPlatform` (`'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'other'`) + `ParsedVideo` (con `canEmbed: boolean`, `watchUrl`, `embedUrl`, `posterUrl?`).
- `src/features/recipes/utils/videoEmbed.ts` — `parseVideoSource(url)` centraliza la detección de plataforma via `URL` API (sin regex frágil). YouTube → `embedUrl` + `posterUrl` (`i.ytimg.com/vi/{id}/hqdefault.jpg`) + `canEmbed: true`. Resto → `canEmbed: false`. `platformLabel(platform)` para i18n-friendly placeholders.
- `src/features/recipes/utils/videoEmbed.test.ts` — matriz de 12+ casos (YouTube canonical / `youtu.be` / Shorts, TikTok, Instagram reel/post, Vimeo, `other`, inputs inválidos, con/sin protocolo).
- `src/features/recipes/components/HeroGallery.tsx` — carrusel CSS-only (`scroll-snap-x mandatory`, sin deps). Single-photo case renderiza `<img>` directa (ahorro paint en el ~80% de recetas que siguen con una sola imagen). Multi-photo: counter pill + dot navigation + `aria-roledescription="carousel"`. Lazy-load para `idx > 0`.
- `src/features/recipes/components/MediaLightbox.tsx` — modal fullscreen basado en shadcn Dialog. Swipe horizontal + `ArrowLeft`/`ArrowRight`. Pinch-zoom diferido a V2.
- `src/features/recipes/components/VideoSection.tsx` — strategy split. YouTube → iframe sandboxed. Otros → card con poster + `PlayCircle` + label "Ver en {platform}" → `openExternalVideo(watchUrl)`.
- `src/lib/platform.ts` — `openExternalVideo(url)`: native usa `@capacitor/browser` (dynamic import, `presentationStyle: 'popover'`), web usa `window.open(url, '_blank', 'noopener,noreferrer')`.
- 7 claves i18n simétricas ES/EN bajo `recipeDetail`: `gallery`, `photoOf`, `openLightbox`, `closeLightbox`, `watchOn`, `watchOnSubtitle`, `unsupportedVideo`.

**Changed**
- `src/features/recipes/screens/RecipeDetail.tsx` — reemplaza `<img>` hero por `<HeroGallery>` (lightbox on tap via `setLightboxIdx`); reemplaza regex YouTube/TikTok + iframe duplicado (38 líneas) por `<VideoSection videoUrl={data.videoUrl} posterFallback={data.img || data.image} />`; monta `<MediaLightbox>` al cierre del árbol. `galleryPhotos` cae a `[data.img || data.image]` cuando `photos?` está ausente (receta legacy renderiza idéntico).
- `src/components/patterns/RecipeCard.tsx` — extiende `RecipeCardRecipe` con `photos?: string[]`. Afordancia visual en variants `carousel` + `hero`: dots centrados arriba (primero activo, resto `w-1`) cuando `photos.length ≥ 2`. Variant `grid` no los pinta (scroll performance en Cocina). `pointer-events-none` para no interceptar clicks.
- `src/features/food/data/seed-recipes.ts` — 4 recetas demo con `photos[]`; 2 con `videoUrl` (1 YouTube real público, 1 TikTok): `id: 1` (ChefMarta, salmón, 3 photos + YouTube), `tortitas-avena` (FitCarlos, 2 photos + TikTok), `my-tostada-aguacate` (self, 2 photos), `my-bowl-mediterraneo` (self, 3 photos).
- `src/lib/seedVersion.ts` — `SEED_VERSIONS.savedRecipes` bump 3 → **4** (regla de oro: cambio semántico de seed obliga bump para que usuarios existentes re-hidraten vía `shouldReseed`).

**Notes**
- **Out of scope (Fase 2+)**: uploader de fotos (`pickImage()` con `@capacitor/camera`), compresión canvas, migración data-URL → IDB, captura automática de `og:image` en `ImportRecipeURL`, video local MP4.
- **Out of scope (Fase 3 = Q6)**: Supabase Storage bucket, signed URLs, push de `photos[]` al backend (hoy no se sube nada — sólo se referencia URLs externas o seed).
- **Storage impact hoy = 0**. El merge strategy de `savedRecipes` sigue siendo `preserve-user`, así que el bump no sobreescribe recetas propias; sólo completa los slots de seed que aún no estaban en localStorage.
- Afordancia visual en RecipeCard sigue el patrón Instagram/TikTok (dots arriba) para evitar colisión con el info-block bottom. Max 6 dots renderizados (galerías mayores quedan acotadas visualmente pero navegables dentro del lightbox).
- YouTube iframe usa `youtube-nocookie.com` + `sandbox="allow-scripts allow-same-origin allow-presentation"` (mismo patrón que el viejo bloque regex que sustituye, sin regresión de CSP).

## [1.5.23] - 2026-04-17

### fix(ui/cocina-explora) — normaliza shells, RecipeCard tokens y tap-targets HIG

Cohesion pass entre **Cocina** (grid biblioteca) y **Explora/Discovery** (carrusel editorial). Decisión de producto: mantener la asimetría grid vs lanes (patrón industria — Yummly, NYT Cooking, Spotify, Apple Music, Instagram, TikTok), **no** añadir toggle grid/carrusel en Cocina (choice paralysis sin payoff). Sí normalizar la ejecución: shells, typography y tap-targets del `RecipeCard` compartido. Plan: `.claude/plans/quiero-que-analices-concretamente-effervescent-deer.md`.

**Changed**
- `src/components/patterns/RecipeCard.tsx` — 4 fixes:
  - `TITLE.grid` sube de `text-xs` + `mb-1` a `text-sm` + `mb-1.5` (alineado con `carousel`). La densidad sigue diferenciada por el **ancho** de la celda, no por la tipografía.
  - `infoPad` + `infoBottom` unificados entre `grid` y `carousel` (`px-1.5 py-0.5` / `bottom-3 left-3 right-3`). Elimina 2 ternarios.
  - Botones Save / Share / Delete a **36×36 px** (ADR-003, mínimo HIG para acción inline en card). Antes eran 28/24 px sub-HIG. Iconos a `w-4 h-4`.
  - 4 literales `text-[9px]` / `text-[10px]` en variant `hero` y protein badge → `text-micro` (ADR-002). `RecipeCard` sale del Q16 allowlist ESLint.
- `src/features/recipes/screens/Cocina.tsx` — `<PageShell maxWidth="wide" spacing="sm">` envuelve el tab `recipes` (elimina drift `px-6 max-w-5xl mx-auto space-y-4` hand-rolled contra ADR-001). `FilterRow` de mealTypes gana chip **"Rápido"** (Zap) — paridad con Discovery. Collection pills pierde redundancia `quick` (4 pills en vez de 5). Filtro combinado reescrito: `activeMealType === 'quick'` aplica `totalTime ≤ 20` en lugar de filtrar por `mealType`.
- `src/features/home/screens/Discovery.tsx` — `<PageShell maxWidth="wide" noPadding className="space-y-0">` (preserva bleed full-width de cada `Swimlane`). `text-[10px]` del counter en `CollectionBanner` → `text-micro`. Discovery sale del Q16 allowlist ESLint.
- `eslint.config.mjs` — `RecipeCard.tsx` y `Discovery.tsx` removidos de `q16MigrationAllowlist` (cumplen guardrails como errores, ya no como warnings).

**Notes**
- No hay cambios de i18n (`t.discovery.catQuick` ya existía simétrico ES/EN); 1475 keys alineadas.
- No hay cambios de handlers, SyncKey, migrations, ni seeds. Zero-risk en datos.
- TypeScript 0 errors; lint 0 errors; 515/515 tests; i18n 1475 ✓; build + size budgets green (main +1.7 KB raw / +0.4 KB gzip por imports de `PageShell`).
- Q16 baseline progress: 2 archivos menos en el allowlist; 4 `text-[Npx]` menos en drift total; 3 tap-targets sub-HIG corregidos.

## [1.5.22] - 2026-04-17

### fix(seed-hydration) — existing users now receive bumped seed content

Fixes a persistence bug where users who had visited a prior deploy stayed pinned on stale seed data forever. Concretely: Cocina showed ~5 recipes on the Vercel deploy while `npm run dev` (fresh localStorage) showed 46. Same pattern affected 10 other seed keys.

**Root cause.** `AppStateContext.tsx` guarded each seed hydration with `if (!localStorage.getItem(<key>))`. After the first visit the key existed, so subsequent deploys with bumped seed content never re-hydrated — the lazy chunk import was skipped entirely.

**Fix.** New `src/lib/seedVersion.ts` util with a per-key `SEED_VERSIONS` registry and a `rial_seedVersion_<key>` marker in localStorage. Each seed `useEffect` now calls `shouldReseed(key, dataKey)` (true on cold start OR when stored version < current) and stamps the current version via `setStoredSeedVersion(key)` after a successful import. Three merge strategies chosen per key: `preserve-user` (savedRecipes keeps `publishedBy: 'self'` + `tag: 'IMPORTADA'`), `preserve-if-nonempty` (transactional logs and meal plan), `replace` (demo-only content like communityPosts / communityStories, to be replaced by backend at Q6).

**Added**
- `src/lib/seedVersion.ts` — `SEED_VERSIONS` registry, `shouldReseed`, `getStoredSeedVersion`, `setStoredSeedVersion`, `clearSeed`, `ALL_SEED_KEYS`.
- `src/lib/seedVersion.test.ts` — 14 unit tests covering registry validation, cold start, pre-versioning era, stale version, equal version, future-compat, garbage markers, clear idempotency.
- `e2e/seed-hydration.spec.ts` — Playwright test covering stale-version re-hydration preserving user-owned recipes, cold-start seeding with version stamping, and up-to-date no-op.
- `.catch((err) => console.warn(...))` on all 10 dynamic seed imports — chunk failures now surface in DevTools instead of disappearing silently.

**Changed**
- `src/contexts/AppStateContext.tsx` — 10 seed `useEffect`s refactored from presence-only guard to versioned `shouldReseed()` + strategy-specific merge + `setStoredSeedVersion()` + `.catch()`. Large inline comment block documents the three strategies.
- `SEED_VERSIONS.savedRecipes = 2` — reflects the 46-recipe sprint-q18 overhaul. Users pinned to the old 5-recipe array will re-hydrate on next mount, preserving any recipes they created (`publishedBy: 'self'`) or imported (`tag: 'IMPORTADA'`).
- `SEED_VERSIONS.communityPosts = 2` — reflects sprint-q18 post expansion (6 posts with progress types).

**Notes**
- User-reported scenario is now self-healing: their marker is absent → stored version resolves to 0 → 0 < 2 triggers reseed on next load. No manual reset required.
- `DemoSeedCard` (existing) + its `createHandleClearDemoSeed` handler in `src/features/dev/handlers/demo-seed-handlers.ts` still exists as an escape hatch; note that handler has a pre-existing localStorage prefix mismatch (it calls `removeItem('rial_${key}')` but `useLocalStorageState` writes keys unprefixed). Flagged as follow-up, out of scope for this fix.
- Testing baseline: TypeScript 0 errors, lint 0 errors, 515/515 unit tests passing (+14), build + size budgets green.

## [1.5.21] - 2026-04-18

### refactor(audit-tab) — Hoy / Cocina / Explora tab audit (5 waves)

Full tab-by-tab audit on the three primary surfaces. Plan: `.claude/plans/replicated-orbiting-coral.md`. Doc: `docs/AUDIT-TAB-2026-04-18.md`. Diccionario, Despensa, More, Progress stay out of scope for the next audit tranche.

**Added**
- `docs/AUDIT-TAB-2026-04-18.md` — executive + per-wave report.
- `src/features/social/handlers/creator-handlers.ts` — `createHandleFollowCreator` factory (registered in `AppStateContext`).
- `src/features/social/handlers/challenge-handlers.ts` — `createHandleJoinChallenge` / `LeaveChallenge` / `CheckInChallenge` factories.
- `src/lib/z-index.ts` — shared z-index constants (Wave 2).
- `t.common.close` i18n key (ES+EN).
- Empty-state + CTA on `ProgressPreviewCard` when `weightHistory.length === 0`.
- `MealSlotSelector` wired inside `RecipeDaySelectorSheet` (Wave 2).
- `Cocina` `defaultTab` prop so Home's "Plan" CTA lands on Plan tab.
- `Explore` subtab persistence via `useLocalStorageState('exploreActiveTab', ...)`.
- `PostCard` `hideComments` prop for canonical-view dedup.

**Changed**
- 17 functional bugs fixed across Hoy/Cocina/Explora (scan-barcode no-op, story index, notification badge, import-URL silent fallback, CookMode crash, CookTimer drift, Community follow staleness, hardcoded `'Tú'` / `'Justo ahora'`, TodaysMeals hidden buttons, add-to-plan mealType ignored, PostCard counter cosmetic, Notifications missing click handlers, seed-recipes race, Cocina type cast, CreateRecipe free-form times, PostCard progress-type delegation). Full list in the audit doc.
- Factory-handler pattern applied across Explora screens — `useLocalStorageState` calls removed from Discover / CreatorProfile / Community / Challenges / ChallengeDetail / CreatorVerification. Cross-screen follow / join state now updates reactively.
- `features/home/screens/Discover.tsx` → `features/social/screens/Discover.tsx` (feature-first).
- Stretched-link a11y pattern on `PostCard` (card-level tap + independent recipe CTA without nested buttons).
- HIG tap-target sweep — every interactive across Hoy/Cocina/Explora ≥44×44.
- Drift: `text-[Npx]` 0 in `src/features/social/**`; SectionCard shape baseline 93 → 72; 17 files removed from ESLint Q16 allowlist.
- i18n fallback expressions (`|| 'string'`) eliminated from Guided Setup and all social surfaces; 47 new keys aligned across ES ↔ EN.
- `handleCreatePost` / `handleAddComment` / `handlePublishStory` use `userProfile.name` + `formatRelative()` instead of hardcoded literals.
- Iframe sandbox on RecipeDetail + CreateRecipe video embeds (pre-CSP hardening).
- `handleSaveRecipe` toggle-to-unsave now shows `<ConfirmDialog>`.
- `ProgressPostCard` migrated to `<SectionCard>` primitive.

**Fixed**
- `rial_recipeViewed` Guided Setup step now completes (key was read but never written).
- `StoryRingsRow` tap opens the correct story index.
- Notifications badge renders only when unread exist.
- `ImportRecipeURL` surfaces real parse errors instead of silently showing a fake chicken recipe; timeout + URL validation added.
- `CookMode` survives empty-steps recipes (empty state) and re-acquires WakeLock on `visibilitychange`.
- `CookTimer` drift-free (RAF + `Date.now()` delta).
- `Community` follow state reactive across screens (no more stale memo).
- Seed-recipes race can't clobber user saves (`rial_seedLoaded` flag).
- `Cocina.tsx` `mealPlan` type cast aligned with declared `Record<number, any[]>`.
- `CreateRecipe` prep/cook-time numeric input.
- `PostCard` counters mutate state instead of being cosmetic.
- `Notifications` rows navigate to `targetType`/`targetId` and mark-read.
- `PostCard` detects `type === 'progress'` and delegates to `<ProgressPostCard>`.

**Removed**
- `src/features/social/screens/Creadores.tsx` — orphan, 0 callers.
- `src/features/home/components/WeightQuickLog.tsx` — `@deprecated Q14`, 0 callers.
- `Home.tsx` dead props `onNavigateToExplore` + `onCheckIn(status?)`.
- `ImportRecipeURL` unreachable error branch.

**Metrics**
- Tests: 481 → 501 (+20).
- i18n: 1428 → 1475 keys aligned.
- SectionCard baseline: 93 → 72.
- `text-[Npx]` in `src/features/social/`: ~55 → 0.
- Dead files: −2.
- ESLint allowlist: −17 entries.
- All size budgets passing: main 239 KB gzip / total 764 KB gzip.

Commits on `main` (not yet pushed): `4d83e94` (Wave 0), `ecb73fa` (Wave 1), `7db26c8` (Wave 2), `26ba1bd` (Wave 3), docs commit pending for Wave 4. Push to `rial-food/main` awaits explicit user approval.

## [1.5.20] - 2026-04-17

### merge(rial-food/main) — reconcile Q14/Q15.5/walkthrough with sprint-q/sprint-q18

Parallel-stream reconciliation. `main` already carried three local commits (Q14 audit polish, Q15.5 design-system remediation, walkthrough + Q16 pilot migrations) when `rial-food/main` surfaced two upstream commits from a collaborator: `8b8a5b5` (Progress tab restructure) and `155f08b` (seed data overhaul). Merged on `main` with no feature branch per project convention ("no worktrees or branches going forward").

Decisions at conflict points:
- `src/features/wellness/screens/WeeklyReview.tsx` — accepted upstream deletion; reflection form absorbed into Progress's `InlineReflection` component. My Q16 pilot migration of that file is superseded.
- `src/features/wellness/screens/Progress.tsx` — accepted upstream rewrite (443 lines, score ring + component extraction). My Q14 2-tab version superseded. `BodyTimeline`, `BodyCalendar`, `LogSnapshotModal`, `RitmoSection`, `LatestReflectionCard` remain in the repo as reusable components; may re-integrate in Q15.
- `src/features/wellness/screens/WeeklyCheckIn.tsx` — accepted upstream simplification (history-only browser, 109 lines). My Q16 pilot migration superseded.
- `src/App.tsx` — `weekly-review` route now renders `<Progress>` (upstream) with `navigateTo(previousScreen)` (my back-stack fix from Q14).
- i18n, CHANGELOG, `docs/ai/state.md` — additive merge.

## [1.5.19] - 2026-04-17

### feat(sprint-q18) — seed data overhaul + delete-all safety [upstream `155f08b`]

- New seeds: `src/features/wellness/data/seed-nutrition-history.ts`, `seed-real-feel-logs.ts`, `seed-weekly-checkins.ts`.
- Expanded: `seed-recipes.ts` (18 → 46 recipes), `seed-meal-plan.ts` (1 → 7 days), `seed-posts.ts` (10 → 22 posts).
- `AppStateContext.tsx` — 4 lazy-seeds wired so new users see a fully populated demo app on first launch.
- `SettingsSystem.tsx` — `deleteAllData` preserves `rial_isFirstTime` so the user doesn't re-enter onboarding after a delete.

### feat(sprint-q) — Progress tab restructure [upstream `8b8a5b5`]

- `Progress.tsx` slimmed 837 → 443 lines via component extraction.
- New wellness components: `WeeklyScoreCard`, `ConsistencyCalendar`, `InlineReflection`, `WeightTrendCard`.
- `WeeklyReview.tsx` removed (absorbed into Progress).
- i18n keys added: `weekly.dayHeaders`, `weekly.mealCount`, `weekly.daysLogged`, plus Q17b score-ring labels.
- 5 bug fixes (per upstream commit message).

## [1.5.18] - 2026-04-17

### feat(design-audit) — tab-by-tab walkthrough + Q16 pilot migrations

### feat(design-audit) — tab-by-tab walkthrough + Q16 pilot migrations

Live audit against the Q15.5 design system (`docs/DESIGN-AUDIT-WALKTHROUGH-2026-04-17.md`). Every finding is labelled 🔴 Blocker / 🟡 Drift / 🟢 Polish with file:line + concrete fix.

#### Fixed — 🔴 Blockers (shipped this pass)
- `src/features/home/components/NutritionHero.tsx` — "RESTANTE" label clipped to "RESTANT" on iPhone SE (≤375 px). Root cause: 4 `flex-1` columns with `tracking-widest uppercase` labels of 5/8/9/8 chars. **Redesign**: RESTANTE becomes the primary `text-display` number with META / ALIMENTOS / EJERCICIO collapsed into a right-aligned caption `<dl>`. Also migrates 3 inline SectionCard shapes to `<SectionCard>` and 6 `text-[10px]` to `text-micro`.
- `src/features/recipes/components/CookTimer.tsx` — play/pause and reset buttons were `w-9 h-9` (36 px); now `w-11 h-11` (44 px, HIG-compliant).
- `src/features/food/screens/AddMeal.tsx` — favorite star `w-8 h-8` → `w-11 h-11` and add `+` button `w-10 h-10` → `w-11 h-11`. Both gain `aria-label` (`addedToFavorites` / `addToMeal`) and `aria-hidden` on the icon children.
- `src/features/wellness/screens/WeeklyCheckIn.tsx` — past-week chevron nav `w-9 h-9` → `w-11 h-11`, `aria-label={t.weekly.previousWeek|nextWeek}` added, `aria-hidden` on icons.
- `src/features/home/screens/Home.tsx` — streak button was a `px-3 py-1.5` pill (~28 px tall); now `min-h-11 px-4` (44 px). Also replaces `text-[10px]` with `text-micro`.
- Illegibility: 3 `text-[7px]` instances (RecipeCard ×2, Profile badges ×1) promoted to `text-micro` (10 px floor per ADR-002).

#### Changed — Q16 pilot migrations (SectionCard shape → `<SectionCard>` / `<StatTile>`)
- `src/features/wellness/screens/WeeklyCheckIn.tsx` — 7 inline cards replaced: 3-up current stats grid → `<StatTile size="md">`, nutrition summary card → `<SectionCard padding="md">`, 3-up past-week stats → `<StatTile size="sm">`. 11 `text-[9px]` → `text-micro` in the same sweep.
- `src/features/wellness/screens/WeeklyReview.tsx` — macro adherence 4-up grid + RF avg stat wrapper migrated to `<SectionCard padding="sm">`. 3 `text-[10px]` → `text-micro`.

#### Changed — i18n
- Added 3 keys to `weekly` and `addMealScreen` namespaces, symmetric across `es.ts` + `en.ts`: `weekly.previousWeek`, `weekly.nextWeek`, `addMealScreen.addToMeal`. `check:i18n` now aligns **1406 keys**.

#### Changed — CI guardrails
- `src/test/conventions/sectioncard-usage.test.ts` — baseline dropped from **134 → 84**. 50 occurrences removed since Wave-3 close (NutritionHero, WeeklyCheckIn, WeeklyReview this pass; prior silent drops in Q14 refactors). Lock prevents regression; Q16 continues to drain toward 0.
- ESLint warning count dropped from **1009 → 972** on this repo state (-37 pre-existing offender warnings).

#### Added — docs
- `docs/DESIGN-AUDIT-WALKTHROUGH-2026-04-17.md` — per-tab audit covering Home, Cocina, Explorar, Más, FAB→Food, Wellness, Onboarding with 24 findings + severity tags. Fixes landed this pass annotated inline.

#### Out of scope (documented, deferred to Q16 codemod sprint)
- **text-[Npx]**: 415 occurrences remain (was 445 pre-Q15.5). Distribution: 3× 7px (illegibility — **fixed this pass**), 30× 8px, 155× 9px, 200× 10px, 27× 11px. Top offenders: RecipeDetail (25), CreateRecipe (24), AddMeal (15), Planner (15), SettingsProfile (15).
- **SectionCard shape**: 84 remain. Top offenders: SettingsProfile (11), BarcodeScanner (9), Onboarding (6), ImportRecipeURL (6), RealFeelDiary (6).

---

## [1.5.17] - 2026-04-17

### feat(design-system) — Q15.5 remediation: tokens, primitives, ESLint guardrails, ADRs, i18n symmetry check

Scope derived from `docs/DESIGN-AUDIT-2026-04-16.md` (25+ findings, 6.2/10 global score). Every fix ships with an executable guardrail so the drift cannot regress.

#### Added — foundation tokens
- `src/index.css` — typography scale (10 levels): `--text-micro` (10 px) · `--text-caption` (11 px) · `--text-label` (12 px) · `--text-body-sm` (13 px) · `--text-body` (14 px) · `--text-body-lg` (16 px) · `--text-title-sm` (18 px) · `--text-title` (24 px) · `--text-headline` (32 px) · `--text-display` (40 px).
- `src/index.css` — shadow scale (4 levels): `--shadow-elev-0` through `--shadow-elev-3`.
- `src/index.css` — radius multiplicative scale: `--radius-xs/sm/md/lg/xl/2xl` all anchored on `--radius`.
- `src/index.css` — JetBrains Mono now loaded via the Google Fonts `@import` (fixes the silent fallback to system mono that shipped in every build since the `--font-label` token was introduced).

#### Added — docs
- `docs/DESIGN-SYSTEM.md` — spec: tokens, themes, do/don't tables, extension rules.
- `docs/PRIMITIVES.md` — canonical index of 14 primitives with minimal usage examples and anti-patterns.
- `docs/NEW-SCREEN-CHECKLIST.md` — mandatory 8-section gate for every new screen (scaffolding, primitives, tokens, a11y/HIG, i18n, state/handlers, theme parity, verification).
- `docs/adr/ADR-001-primitives-are-mandatory.md` — every screen composes canonical primitives; inlining the SectionCard shape fails CI.
- `docs/adr/ADR-002-typography-scale-tokens.md` — closed 10-level semantic scale; `text-[Npx]` banned.
- `docs/adr/ADR-003-tap-target-44px-hig.md` — Button default = 44 × 44; `sm` is a documented density exception.
- `docs/adr/ADR-004-i18n-es-en-symmetric.md` — structural key-set parity enforced by `check:i18n`.
- `docs/adr/ADR-005-theme-by-class-not-tailwind-dark.md` — 6 themes activate by class on `<html>`; `dark:` prefix banned.
- `docs/adr/ADR-006-shadcn-new-york-unified-radix.md` — pin `new-york` preset + unified `radix-ui` package.
- `docs/adr/ADR-007-radius-multiplicative-scale.md` — `rounded-*` utilities resolve through `--radius`.

#### Added — CI guardrails
- `eslint.config.mjs` — `no-restricted-syntax` rules for 3 anti-patterns: duplicate SectionCard shape (ADR-001), arbitrary `text-[Npx]` values (ADR-002), and `dark:` prefix classes (ADR-005). Matches both string literals and template-literal chunks in `cn()` compositions.
- `eslint.config.mjs` — Q16 migration allowlist of 86 pre-existing offender files; rules downgraded to `warn` inside the allowlist, `error` everywhere else. Allowlist shrinks as Q16 migrates files.
- `scripts/check-i18n-symmetry.mjs` — Node script using the TypeScript compiler API to parse `src/i18n/locales/es.ts` and `en.ts`, walk the exported object literal, and diff dotted-path key sets. Exits 1 on asymmetry with the missing paths printed. Current state: **1403 keys aligned**.
- `package.json` — `npm run check:i18n` wired into `release:preflight` between `lint:code` and `test`.
- `src/test/conventions/primitives-export.test.ts` — locks the import path and default export of the 14 canonical primitives (PageShell, SectionCard, StatTile, SegmentedTabs, EmptyState, ConfirmDialog, GlobalHeader, BottomNav, PageHeader, Sparkline, DayGridCalendar, Button, Dialog, Sheet).
- `src/test/conventions/design-tokens.test.ts` — parses `src/index.css` and asserts every token in the typography, shadow, radius, and font scales exists; regression-guards JetBrains Mono `@import` and `--font-label` wiring.
- `src/test/conventions/sectioncard-usage.test.ts` — baseline drift monitor; counts the SectionCard anti-pattern across `src/**` and fails on any increase (current baseline: 134). Drops as Q16 migrates; delete when baseline reaches 0.

#### Changed — primitives
- `src/components/ui/button.tsx` — sizes now HIG-compliant: `default` = 44 px (was 36), `sm` = 36 px (documented density exception, was 32), `lg` = 48 px (was 40), `icon` = 44 × 44 (was 36 × 36). Ghost variant regains the DNA classes (`font-headline font-bold uppercase tracking-widest`) it had been missing.
- `src/components/StatTile.tsx`, `src/components/SegmentedTabs.tsx`, `src/components/BottomNav.tsx` — migrated off arbitrary `text-[Npx]` to the new `text-micro` and `text-label` tokens.
- `src/components/BottomNav.tsx` — added `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background` on tab triggers (WCAG 2.4.7).
- `src/components/GlobalHeader.tsx` — demo-gate modal rewritten from a hand-rolled `<div className="fixed inset-0 ...">` to the shadcn `<Dialog>`. 5 hardcoded Spanish strings extracted to `t.globalHeader.demoGate.*` (title, close, codeLabel, codePlaceholder, codeInvalid, unlock).
- `src/features/profile/screens/Profile.tsx` — 2 hand-rolled SectionCard dups migrated to `<SectionCard>`. 1 hardcoded English literal ("Real Feel + meals") moved to `t.profile.realFeelMeals`.

#### Changed — docs
- `docs/CONTRIBUTING.md` — "Adding a New Feature — Checklist" now link-first, pointing to `NEW-SCREEN-CHECKLIST.md` + design-system docs.
- `docs/ai/project.md` — new "Design System" section indexing the spec, primitives, checklist, ADRs, audit origin, and CI guardrails.
- `docs/ai/workflow.md` — verification rules now name `check:i18n`, design-system lint, convention tests, and the new-screen gate as explicit steps.
- `docs/ai/state.md` — quality baseline refreshed (481 tests passing, i18n symmetric, lint 0 errors), Q15.5 marked done, Q16 migration scheduled with exit criteria.

#### Fixed
- **#font-label-fallback** — `src/index.css` declared `--font-label: "JetBrains Mono"` but only imported Inter and Space Grotesk. Every `text-label` rendered in system mono. Now loaded via Google Fonts `@import`.
- **#radius-tokens-missing** — `--radius-xs/sm/md/lg/xl/2xl` tokens did not exist; `rounded-md/lg/xl` silently fell back to Tailwind defaults instead of resolving through `--radius`. All levels now derived from the anchor.
- **#button-sub-hig** — no Button size cleared Apple HIG 44 × 44. `default` is now HIG-compliant out of the box.
- **#ghost-dna-drift** — Button `variant="ghost"` rendered without uppercase/tracking/headline font while every other variant had them. Restored.
- **#pre-existing-lint-errors** — 4 `prefer-const` errors in `src/features/profile/data/demo-personas.ts` (Q14 code) and 1 rule-not-found `react-hooks/exhaustive-deps` directive in `src/features/wellness/components/LogSnapshotModal.tsx`. Cleared as blockers for `release:preflight`.

#### Verification
- `npx tsc --noEmit` → 0 errors.
- `npm run lint:code` → 0 errors, ~1016 warnings (all from Q16 allowlist).
- `npm run check:i18n` → 1403 keys aligned ES ↔ EN.
- `npx vitest run` → 481/481 passing (32 new convention tests).

#### Deferred to Q16
- Mass migration of 445 `text-[Npx]` occurrences in 85 files → nearest typography token.
- Mass migration of 134 SectionCard-shape duplications in 49 files → `<SectionCard>`.
- Fix: `eslint.config.mjs` allowlist shrinks to empty and `sectioncard-usage.test.ts` baseline drops to 0.

## [1.5.16] - 2026-04-16

### chore(agents) — Vibe-coding agility fixes: hook, permissions, state reconciliation

No changes to `src/` or app behavior. Friction-reduction pass for dev-agent workflow.

- `.claude/settings.json`:
  - Removed broken `PostToolUse` hook. Its bash quoting produced `syntax error near unexpected token '('` on every `Write`/`Edit` for weeks. The system-level `<verification_workflow>` already covers the same intent, so the hook added only noise.
  - Cleaned permissions: removed stale/dangerous `Bash(rm -f src/screens/*)` (directory migrated long ago to `src/features/*/screens/`), plus `Bash(head *)` and `Bash(find *)` (agents should use `Read`/`Glob` per system rules).
  - Added explicit `Bash(npx vitest*)`, `Bash(npx tsc*)`, `Bash(npx eslint*)`, `Bash(npm ci)`, `Bash(npm ls *)`, `Bash(git rev-parse*)`, `Bash(git remote*)`.
  - Added `Bash(rm -f src/*)` and `Bash(git clean -f*)` to `deny` list.
- `.claude/commands/rial-help.md` — new `/rial-help` slash command indexing the 4 `/rial-*` commands, release npm scripts, and the 2 subagents (`explore-rial`, `reviewer-rial`). Saves a lookup for any new agent session.
- `docs/ai/state.md` — reconciled stale data: test count `429/429` → `449/449`; Q14 commit line `_(pending)_` → `_(uncommitted in working tree)_`; added "Current risks to watch" bullet noting Q14 work pending commit before Q15.

## [1.5.15] - 2026-04-16

### chore(ci) — Security scanning, performance budgets, and hardened headers

No changes to `src/` or app behavior. CI/CD hardening for enterprise readiness.

#### Security scanning
- `.github/workflows/codeql.yml` — CodeQL analysis for JavaScript/TypeScript on push, PR, and weekly Monday 06:00 UTC. Uses `security-and-quality` query suite. Results surface in GitHub Security tab.

#### Performance monitoring
- `.github/workflows/lighthouse.yml` — Lighthouse CI on PRs (warn-only in v1, does not block merges). Uses `@lhci/cli@0.14` via `npx`.
- `.lighthouserc.json` — desktop preset; assertions: performance ≥ 0.80, accessibility ≥ 0.95, best-practices ≥ 0.90, SEO ≥ 0.85.

#### Bundle-size budget
- `scripts/check-bundle-size.mjs` — enforces per-chunk and total budgets after build. Resolves the true main entry by parsing `dist/index.html` (robust against Vite's `index-*.js` naming collisions with feature chunks whose source file is `index.tsx`):
  - main entry ≤ 900 KB raw / 280 KB gzip (~15% headroom over measured 751/234 baseline)
  - `vendor-recharts` ≤ 400 KB raw / 115 KB gzip
  - total ≤ 3200 KB raw / 900 KB gzip
- Reconciled stale `state.md` baseline: prior claim of 284 KB / 56 KB was one of several `index-*.js` feature chunks, not the true entry.
- `.github/workflows/ci.yml` — new step in `build` job runs `npm run size:check` after Vite build; fails CI if any budget exceeded.
- `npm run release:preflight` now includes `size:check` at the end.

#### Bundle analysis (opt-in)
- `vite.config.ts` — `rollup-plugin-visualizer` loaded dynamically when `ANALYZE=1` is set (graceful fallback if dep missing).
- `npm run analyze` — runs `ANALYZE=1 vite build`, produces `dist/stats.html`.
- devDep added: `rollup-plugin-visualizer ^5.12.0`.

#### Coverage baseline
- `vitest.config.ts` thresholds: lines/functions/branches/statements ≥ 30% (enforced on `vitest --coverage` in CI `check` job).
- Roadmap: Q15 raise to 40%, Q16 raise to 50%.

#### Vercel security headers
- `vercel.json` — global `headers` for `/(.*)`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(self), microphone=(), geolocation=(self), payment=(self)`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (2-year HSTS with preload)
- **CSP intentionally deferred to Q17** — requires audit of Supabase, Sentry, Google GenAI, RevenueCat, recharts sources before blocking.

#### Doc updates
- `docs/ai/state.md` — new "Coverage roadmap" + bundle budget explicit + CSP gap in "Current risks".
- `docs/ai/workflow.md` — verification rules now mention `size:check`, CodeQL, and Lighthouse CI.

#### Verification
- `npx tsc --noEmit`: clean (no source changes).
- `npm run build`: unchanged.
- `npm run size:check`: all budgets within limits (baseline 56 KB gzip vs 65 KB budget).

---

## [1.5.14] - 2026-04-16

### chore(enterprise) — Governance, legal, and repository hygiene

No changes to `src/` or app behavior. Repository compliance scaffolding for enterprise readiness.

#### Legal and governance
- `LICENSE` — Proprietary. Copyright (c) 2026 RIAL FOOD WORLD S.L. All rights reserved. Contact: legal@rialfoodworld.com.
- `SECURITY.md` — private vulnerability reporting to security@rialfoodworld.com. SLA 72h ack / 7d triage / 30d fix critical. Safe harbor clause.
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1. Incident reports to conduct@rialfoodworld.com.
- `CONTRIBUTING.md` (root stub) — redirects to `docs/CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `LICENSE`, `AGENTS.md`, `docs/QUICKSTART.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`.

#### GitHub repo hygiene
- `.github/PULL_REQUEST_TEMPLATE.md` — Summary, Sprint tag (sprint-qN/enterprise/agents/ci/fix/docs), Changes, Test plan checklist, i18n dual ES/EN, Docs updated, Release impact.
- `.github/ISSUE_TEMPLATE/bug_report.md` — repro, expected, actual, env (web/iOS/Android), logs, impact.
- `.github/ISSUE_TEMPLATE/feature_request.md` — user story, ICP target (Cut/Muscle/Health-seeker/N/A), acceptance, i18n impact, sprint.
- `.github/ISSUE_TEMPLATE/task.md` — objetivo, sprint, dependencias, definición de hecho, estimación XS/S/M/L.
- `.github/ISSUE_TEMPLATE/config.yml` — `blank_issues_enabled: false`; private security link + CoC contact.
- `.github/CODEOWNERS` — `@novara-bbs` default + paths críticos (`/AGENTS.md`, `/docs/ai/`, `/.claude/`, `/.github/`, `/vercel.json`, `/supabase/`, `/src/contexts/`, `/src/lib/`, `/src/features/ai/`, `/src/features/auth/`, `/src/features/wellness/`, `/src/features/food/`, `/src/i18n/`).
- `.github/dependabot.yml` — npm weekly (Monday 07:00 Europe/Madrid, max 5 PRs) with groups: `capacitor`, `testing`, `types`, `eslint`. React major upgrades ignored. github-actions weekly (max 3 PRs).

#### Format and editor hygiene
- `.prettierrc` — semi, singleQuote, trailingComma es5, printWidth 100, tabWidth 2, arrowParens always, endOfLine lf.
- `.prettierignore` — dist/, coverage/, node_modules/, android/, ios/, public/, *.md, package-lock.json, .claude/worktrees/.
- `.editorconfig` — utf-8, lf, space 2, insert_final_newline, trim_trailing_whitespace (exception for .md).

#### Policy decisions
- No husky / lint-staged / commitlint — validation remains in CI only, to avoid friction for AI agents during iteration.
- Proprietary license rule added to `AGENTS.md`: do not publish snippets of `src/`, `supabase/functions/`, or internal docs publicly without written consent.

#### Cross-doc updates
- `README.md` — License section rewritten with full proprietary notice + legal contact.
- `AGENTS.md` — proprietary-license rule added to "Universal working rules".
- `docs/ai/state.md` — new "Repository compliance (2026-04-16)" section.

#### Verification
- `npx tsc --noEmit`: clean (no source changes).
- `npm run test -- --run`: 429/429 unchanged.
- `npm run build`: bundle 284 KB raw / 56 KB gzip unchanged.

---

## [1.5.12] - 2026-04-16

### Q14 — Progress audit polish, multi-ICP seed, connection fixes

#### Root cause
Post-Q13 audit surfaced three residual issues: (1) **Profile streak asymmetry** — `Profile.tsx:21` still used the deprecated `calculateStreak(realFeelLogs)` instead of the canonical `calcStreaks().mealLog.current`, so users saw different streak numbers in Profile vs. Home/Progress. (2) **Mono-persona seed** — only Clara (Cut ICP) had fixture data; impossible to test how Progress feels for a Muscle Builder in lean bulk or a Health-Seeker with Rich Real Feel correlations. Real Feel entries didn't reach the threshold to trigger correlation insights. (3) **UX friction** — duplicate consistency metrics in LatestReflectionCard vs. summary grid; empty BodyCalendar and Nutrition Consistency calendar showed blank grids without CTAs; back-stack from LatestReflectionCard CTAs always returned to 'more' instead of 'progress'.

#### Connection fix
- `Profile.tsx` now imports `calcStreaks` from `wellness/utils/streaks.ts` (replacing deprecated `calculateStreak`). Receives `nutritionHistory` + `dailyLogHasEntries` props from App.tsx. Streak number in Profile = Home = Progress (100% alignment).

#### Multi-ICP seed data
- `src/features/profile/data/demo-personas.ts` — 3 personas with 60-day fixture data each:
  - **Clara (Cut)**: 68 → 64 kg, target 1700 kcal, 50 Real Feel logs with tag clusters ("proteina alta" → high energy, "hidratacion baja" → low energy) that trigger correlation insights.
  - **Marcos (Muscle builder)**: 78 → 80.5 kg lean bulk, target 2800 kcal, 45 Real Feel logs with training/rest day patterns.
  - **Ana (Health-seeker)**: 65 kg maintain, target 2000 kcal, 60 Real Feel logs with variety/sleep/stress tag clusters that trigger 3+ correlation insights. Signal correlations (energy, digestion, mindset) also fire.
- `src/features/profile/handlers/demo-persona-handlers.ts` — `loadDemoPersona(id)` writes to localStorage + reloads; `clearDemoData()` removes all seed keys.
- Settings → Developer panel (dev-mode only): persona selector buttons + clear button.
- Dynamic import keeps ~15 kB of fixture data out of the main bundle.

#### UX polish
- `DayGridCalendar.tsx` — new `emptyState` prop: rendered below the grid when `data` map is empty.
- `BodyCalendar.tsx` — empty state with Camera icon + CTA "Registrar primer snapshot".
- Progress Consistency calendar — empty state with CTA "Registrar primera comida" → navigates to add-meal.
- `LatestReflectionCard.tsx` — removed duplicate `grid-cols-3` metrics (meals/days/realfeel); kept only workedWell text + avgVitality inline badge + CTAs.
- Back-stack: `WeeklyCheckIn` and `WeeklyReview` now use `navigateTo(previousScreen)` instead of hardcoded 'more', so entering from Progress returns to Progress.

#### Tests
- `src/features/profile/data/demo-personas.test.ts` — 40 tests: shape validation per persona, weight trajectory direction (Clara loses, Marcos gains, Ana maintains ±1 kg), correlation engine integration (Clara triggers tag correlations, Ana triggers ≥3 insights), calcWeekMacros/calcStreaks compatibility.

#### i18n keys added (es + en)
`progress.bodyCalendarEmpty`, `progress.logFirstSnapshot`, `progress.consistencyCalendarEmpty`, `progress.logFirstMeal`, `settings.developer`, `settings.loadDemoPersona`, `settings.clearDemoData`, `settings.demoClara`, `settings.demoMarcos`, `settings.demoAna`, `settings.demoLoaded`, `settings.demoCleared`.

#### Verification
- `tsc --noEmit`: clean
- `npm run lint`: clean
- `npm run test -- --run`: **429/429 passing** (+40 vs. Q13 baseline of 389)
- `npm run build`: main chunk `index-*.js` **284 KB raw / 56 KB gzip** — unchanged vs. baseline (demo data lazy-loaded).

#### Deprecations resolved
- `calculateStreak()` in `gamification.ts` — no longer called from any production code (Profile migrated). Delete scheduled for Q15.

#### Out of scope (deferred)
- ICP-adaptive Progress widgets (reorder sections per active persona) — Q15.
- Before/after photo compare — Q15.
- JPEG photo placeholders in seed (SVG-based for now) — Q15.
- Remove `calculateStreak()` from codebase — Q15.

## [1.5.11] - 2026-04-16

### Q13 — Progress IA consolidation + primitives

#### Root cause
Post-Q12 audit surfaced three structural debts: (1) **duplicated logic** — weekly-macro aggregation existed in 3 places with 3 different week definitions (`calcWeeklyProgress` in Home, inline in Progress, inline in WeeklyReview); streak logic in 2 places (`calculateStreak` in gamification vs. `getLoggingStreak` in useDailyReset); weight sparkline SVG implementations in 2 places. (2) **Orphan surfaces** — `weeklyCheckIns` entries never surfaced in Progress; `GlobalHeader` streak chip and `Profile` streak card were not deep-linked to Progress; two parallel weight-log forms (`WeightQuickLog`/inline vs. `LogSnapshotModal`). (3) **Design-system drift** — calendars, metric tiles, section cards, sparklines and segmented tabs were hand-rolled per screen instead of extracted primitives; Home `InsightRow` still used emoji glyphs instead of lucide icons.

#### Canonical utils (single source of truth)
- `src/features/wellness/utils/week-stats.ts` — `calcWeekMacros(history, target, weekOffset)` Sunday-start ISO bounds, returns `{ avg, adherence, hitDays, daysLogged, weekStart, weekEnd, deltaVsPrev }`.
- `src/features/wellness/utils/streaks.ts` — `calcStreaks({ history, realFeelLogs, todayHasMeals?, todayHasRealFeel?, now? })` returns both `mealLog` and `realFeel` streaks (`{ current, best }`) with a shared yesterday-or-today currency rule.
- `src/features/wellness/utils/weight-trend.ts` — `calcWeightTrend(snapshots, targetKg?)` returns `{ sorted, last30, current, first, weekDelta, targetProgressPct }`.
- 3 new Vitest suites (19 tests) cover edge cases: partial/empty weeks, adherence 0%/100%, delta-vs-previous, yesterday/gap/today boundaries, direction-aware target progress.

#### Reusable primitives (`src/components/`)
- `DayGridCalendar.tsx` — polymorphic month/week-strip calendar with controlled or uncontrolled anchor, `data: Map<string, T>`, `renderCell`, future-cell disabled state, Monday-first default. `BodyCalendar` + Nutrition consistency grid both wrap it.
- `StatTile.tsx` — metric tile with variant/size/valueColor/trend. Renders `<button>` when `onClick` is provided, eliminating `<div onClick>` anti-pattern.
- `Sparkline.tsx` — SVG chart with `values: (number | null)[]` (null = segment gap). Used by `RitmoSection` and (planned) `ProgressPreviewCard`.
- `SectionCard.tsx` — canonical card wrapper (icon + title + caption + action slots).
- `SegmentedTabs.tsx` — tab selector with `role="tablist"`, used by Progress main tabs + Body view toggle.

#### Orphan surfaces resolved
- `LatestReflectionCard` — new component in `features/wellness/components/`; mounted on Progress → Nutrición. Surfaces the most recent `weeklyCheckIns` entry (including demo Rial seed) with deep-links to `WeeklyCheckIn` and `WeeklyReview`.
- `GlobalLogSnapshotModal` — single app-wide instance of `LogSnapshotModal` mounted once at the App root.
- `useLogSnapshot()` hook — `useSyncExternalStore`-based singleton; exposes `{ isOpen, initialDate, openWithDate, close }`. `ProgressPreviewCard` now uses `openWithDate()` instead of an inline form, converging onto one log flow across the app.
- Home header streak chip → wrapped in `<button onClick={onNavigateToProgress}>`.
- Profile streak card → wrapped in `<button onClick={() => navigateTo('progress')}>`.
- Empty cell in Nutrition consistency calendar → `onSelectEmpty={() => navigateTo('add-meal')}` enables retroactive logging.

#### Design-system alignment
- `InsightRecommendation.icon: string` (emoji) replaced with typed `iconKey: 'variety' | 'protein' | 'hydration' | 'streak' | 'notebook'`.
- New `InsightRow` in `features/home/components/` maps `iconKey` to lucide icons (`Leaf`, `Drumstick`, `Droplet`, `Flame`, `NotebookPen`). Home Insights section no longer ships emojis.

#### Deprecations (marked `@deprecated`, scheduled for removal in Q14)
- `calculateStreak()` in `features/profile/utils/gamification.ts` — Profile migrates to `calcStreaks()` next sprint.
- `getLoggingStreak()` in `hooks/useDailyReset.ts`.
- `calcWeeklyProgress()` in `features/home/utils/homeWidgets.ts`. `calcVitality()` stays (already single-source).
- `WeightQuickLog` component in `features/home/components/` (no longer mounted).

#### i18n keys added (es + en)
`progress.latestReflectionTitle`, `progress.latestReflectionEmpty`, `progress.openWeeklyReview`, `progress.openWeeklyCheckIn`, `progress.daysPlanned`, `progress.dataSourceManualReflection`, `progress.dataSourceManualTarget`, `progress.vsPrevWeek`, `progress.meals`, `weeklyReview.dataSourceGlobal`, `header.streakAria`.

#### Verification
- `tsc --noEmit`: clean
- `npm run lint`: clean
- `npm run test -- --run`: **389/389 passing** (+64 vs. Q12 baseline of 325)
- `npm run build`: main chunk `index-*.js` **284 KB raw / 56 KB gzip** — unchanged vs. baseline; duplication removed offset by new primitives.

#### Out of scope (deferred)
- ICP-specific insights in Progress (Q14).
- Before/after photo compare (Q14).
- Supabase sync wiring (dedicated sprint post feature-complete).
- ChallengeDetail migration to `<DayGridCalendar mode="week-strip">` (optional, Q14).

## [1.5.10] - 2026-04-15

### Q11 — Progress UX consolidation (Body + Nutrition)

#### Root cause
Q10 fragmented a single `BodySnapshot` (kg + photo + measurements per day) across 4 separate tabs. This contradicted the data model and user mental model: to see "what I logged on April 15" required visiting 3 tabs. Fixed by consolidating into **2 tabs** with a unified snapshot entry point.

#### New structure
- `Progress.tsx` reduced from 4 tabs → 2: **Cuerpo** (Body) · **Nutrición** (Nutrition)
- **Body tab**: always-visible weight chart + stats strip, then a toggle between two views of the SAME data:
  - **Timeline**: newest-first list of BodySnapshotCard (each card shows photo thumb + kg + measurement chips + note)
  - **Calendario**: monthly grid with mini thumbnails on days with photos, Ruler icon on days with measurements, solid dot on days with weight-only
- Unified CTA **"+ Registrar snapshot"** opens one modal that captures kg (required) + photo (collapsible) + measurements (collapsible) + note + date
- Nutrition tab keeps weekly nutrition summary + streak + monthly meal-log calendar

#### New components
- `BodySnapshotCard.tsx` — compact card with adaptive content (only renders fields the snapshot has)
- `LogSnapshotModal.tsx` — unified entry form with collapsible photo/measurements sections
- `SnapshotDetailModal.tsx` — full snapshot view with Edit (reuses LogSnapshotModal) + Delete (two-tap confirm)
- `BodyTimeline.tsx` — sorted list with filter chips (Todos / Con foto / Con medidas), each chip showing count
- `BodyCalendar.tsx` — navigable monthly grid; tap populated day → detail modal; tap empty day → log modal prefilled with that date
- `seed-body-snapshots.ts` — 30-day fixture with progressively richer snapshots (weight-only → photo → photo+waist → full); dev-only "Cargar datos de ejemplo" button in Progress when history is empty

#### Handler
- `createHandleDeleteSnapshot({ setWeightHistory, setUserProfile })` added to `weight-handlers.ts`
- Wired as `handleDeleteSnapshot(date)` in `AppStateContext`; refreshes `userProfile.weight` if the deleted entry was the latest

#### Photo seed strategy
- SVG gradient placeholders encoded as base64 data URIs (no real bitmap images shipped in bundle)
- Each seed day gets a different hue so timeline feels varied

#### i18n
- 30 new keys per locale under `progress.*` (tabs, timeline, calendar, filters, modal labels, empty states, confirmations)

#### UX details
- Modal uses shadcn `Dialog` (already in repo)
- Delete flow is two-tap (first tap shows `¿Confirmar?`, second tap deletes + closes)
- Edit modal opens on top of Detail, closes both on save
- Timeline filter chips show counts so users know what's hidden before tapping

## [1.5.9] - 2026-04-15

### Q10 — Progress v2: BodySnapshot + tabs + photos + measurements

#### Data model
- New `src/types/wellness.ts`: `BodySnapshot` type with optional `photoUrl` (base64) and `measurements` (`chestCm`, `waistCm`, `hipsCm`, `bodyFatPct`)
- `WeightEntry` kept as backward-compat alias (`type WeightEntry = BodySnapshot`)
- `AppStateContext`: `WeightEntry` inline definition replaced with re-export from `types/wellness`; internal state typed as `BodySnapshot[]`

#### Weight handlers
- `weight-handlers.ts`: extended `LogWeightArgs` with optional `photoUrl` and `measurements`
- Merges with existing snapshot on re-weigh (preserves photo/measurements when weight is updated)
- New `createHandleUpdateSnapshot`: updates photo/measurements on an existing snapshot without changing kg; creates stub entry if date has no snapshot
- `handleUpdateSnapshot` wired into `AppStateContext` and exposed via `useAppState()`

#### Progress.tsx — tabbed interface
- **4 tabs**: Peso | Fotos | Medidas | Nutrición
- **Weight tab**: existing chart, delta, target progress bar, recent entries (with camera icon indicator), log form — unchanged behavior
- **Photos tab**: today's photo add/preview (camera + gallery), vertical timeline of all snapshots with photos (newest first), empty state CTA, remove button per photo
- **Measurements tab**: inline form (chest/waist/hips/body fat %); saves to today's snapshot; delta table vs. earliest measurement entry; history list
- **Nutrition tab**: existing nutrition summary + consistency calendar moved here; calendar shows a small dot on dates with photos
- **Storage guard**: `estimateStorageUsage()` check before photo upload → toast warning at >4 MB

#### i18n
- 28 new keys added to both `es.ts` and `en.ts` under `progress.*` (tabs, photos, measurements, storage warning)

## [1.5.8] - 2026-04-15

### Q9 — Avatar + goals + settings consolidation

#### GlobalHeader avatar
- Replaced hardcoded Unsplash `<img>` with `userProfile.avatar` (base64); falls back to 2-char initials from `userName` if no avatar
- Added `userAvatar?: string | null` prop to `GlobalHeader`; wired from `App.tsx` via `userProfile.avatar`

#### Avatar upload in SettingsProfile
- Profile section header now shows real avatar (or initials circle) instead of hardcoded stock photo
- Clicking the avatar triggers a `<input type="file" accept="image/*">` hidden input; image compressed via `compressImage(400px, 0.7)` and stored to `userProfile.avatar` (base64)
- Camera hover overlay (icon) indicates the avatar is tappable

#### Hydration + movement goals in SettingsNutrition
- New "Objetivos de actividad" card in SettingsNutrition with: hydration target slider (1–20 cups), steps target slider (1k–20k, step 500), active minutes target slider (10–120 min, step 5)
- Card renders only when `setHydration` or `setMovement` are provided (backward-compat)
- Props `hydration`, `setHydration`, `movement`, `setMovement` wired through `Settings.tsx` → App.tsx `settings` case

#### i18n
- Added to both locales: `settings.activityGoals`, `settings.hydrationTarget`, `settings.stepsTarget`, `settings.activeMinTarget`, `settings.uploadAvatar`

#### Onboarding → dailyMacros (verified ✓)
- `App.tsx` onComplete already calls `setDailyMacros((prev) => ({ ...prev, target: result.targets }))` — no change needed

## [1.5.7] - 2026-04-15

### Q8 — Home Progress preview card

#### ProgressPreviewCard
- New `src/features/home/components/ProgressPreviewCard.tsx`: replaces `WeightQuickLog` on Home
- Shows current weight, 7-day delta (vs entry closest to 7 days ago, not just previous), goal progress bar with distance remaining, and mini 7-entry sparkline with a dot on the latest point
- Bottom action row: inline "+ Registrar peso" pill (collapses/expands quick-log form) + "Ver detalles →" deep-link to Progress tab via `onNavigateToProgress`
- Pressing Escape closes the inline form; Enter confirms
- `WeightQuickLog.tsx` preserved (not deleted) — still usable if needed; Home no longer imports it

#### i18n
- Added `home.viewDetails` (ES: "Ver detalles", EN: "View details") in both locale files

## [1.5.6] - 2026-04-15

### Q7 — Weight flow unification

#### Single write path
- New `src/features/wellness/handlers/weight-handlers.ts`: `createHandleLogWeight` factory — all weight writes go through one path; syncs both `weightHistory` (persistent record) and `userProfile.weight` (fast-read cache) atomically. Replaces same-date entries instead of appending.
- New `src/features/wellness/utils/body-data.ts`: `getCurrentWeight(userProfile, weightHistory)` helper — derives current weight from latest history entry, falls back to `userProfile.weight`, then null. Single read path for display code.

#### AppStateContext wire
- `handleLogWeight` added to `AppStateContextType` and wired via `useMemo` factory pattern (mirrors `meal-handlers`); exposed through `useAppState()`.

#### Migrated consumers (all now call `handleLogWeight`)
- `WeightQuickLog.tsx` (Home): removed direct `setWeightHistory` prop call; uses context `handleLogWeight`; `setWeightHistory` prop kept as `@deprecated` for one-sprint compat
- `Progress.tsx`: removed local handler + local `WeightEntry` interface; uses context `handleLogWeight`
- `SettingsProfile.tsx`: on weight biometric update, also calls `handleLogWeight` to seed history entry (previously only updated `userProfile.weight`)
- `App.tsx`: `onComplete` from `Onboarding` now calls `handleLogWeight` to seed initial history entry for new users (previously left `weightHistory` empty on first visit)

#### Onboarding unit labels
- Replaced hardcoded `(kg)` / `(cm)` labels with `getBodyWeightUnit('metric')` / `getHeightUnit('metric')` — unit-aware labels; `onComplete` now passes `initialWeightKg` to App for history seeding

#### Test suite
- New `src/features/wellness/handlers/weight-handlers.test.ts`: 7 tests covering dual-write, same-date replacement, new-date append, note inclusion/omission, custom date, edge values

#### Config
- `vitest.config.ts`: added `.claude/**` to exclude pattern (was picking up worktree node_modules test files)

## [1.5.5] - 2026-04-15

### Q5 — Lighthouse/PWA audit: A11y + manifest dedup

#### A11y — navigation
- `BottomNav.tsx`: added `aria-label` to `<nav>`, `aria-current="page"` to active item, `aria-hidden="true"` to all decorative icons; i18n-referenced `aria-label` for Create FAB (was hardcoded Spanish)
- `Sidebar.tsx`: same fixes — `aria-label` on `<nav>`, `aria-current="page"` on active item, `aria-hidden="true"` on icons
- `GlobalHeader.tsx`: added `aria-label` + changed `type="text"` → `type="search"` on search input

#### A11y — form inputs (WCAG 4.1.2)
- `Login.tsx`, `Signup.tsx`, `ForgotPassword.tsx`: `aria-label` on all email/password/name inputs; eye-toggle buttons now have `aria-label` (show/hide) + icon `aria-hidden`
- `TodaysMeals.tsx`: `aria-label` on inline portion-edit input (was unlabeled)
- `WeightQuickLog.tsx`: `aria-label` on weight number input
- `Pantry.tsx`: `aria-label` on ingredient name + quantity inputs
- `Home.tsx`: `aria-label` on hydration target range slider

#### i18n
- Added `nav.mainNav` (ES: "Navegación principal", EN: "Main navigation")
- Added `home.editPortionGrams` (ES: "Cantidad en gramos", EN: "Amount in grams")
- Added `auth.showPassword` / `auth.hidePassword` in both locales

#### PWA — manifest dedup
- `vite.config.ts`: removed inline `manifest:` block from VitePWA config — `public/manifest.json` is now the single source of truth; avoids duplicate `<link rel="manifest">` in production HTML

## [1.5.4] - 2026-04-15

### Q4 — A11y + i18n cleanup + UX gaps

#### A11y
- `Challenges.tsx`: removed nested `<div onClick>` + `<button>` pattern — cards now use sibling buttons (navigate / join-leave), no nested interactives; added `aria-pressed` to toggle button, `aria-hidden` to decorative icons
- `Creadores.tsx`: same fix — card content area is now a `<button>` for profile navigation; follow/unfollow is a sibling button with `aria-pressed` + `aria-label`
- `SettingsNutrition.tsx`: added `aria-label={t.settings.removeItem}` to icon-only dislike-remove button
- `RecipeDetail.tsx`: added `aria-label={t.recipes.removeIngredient}` to icon-only extra-ingredient remove button
- `Progress.tsx`: added `aria-label` to weight-confirm icon button

#### i18n
- `BatchCookingSuggestions.tsx`: replaced hardcoded `DAY_NAMES_ES` array with `t.cocina.dayAbbr` — day abbreviations now respect locale (ES: Lun-Dom, EN: Mon-Sun)
- Added keys: `cocina.dayAbbr`, `progress.recentEntries`, `settings.removeItem`, `recipes.removeIngredient`, `explore.creators.viewProfile` in both ES + EN

#### UX gaps (left behind from Q3)
- `Progress.tsx`: weight notes are now visible — added "Recent entries" list (last 5, newest first) showing date, weight, and optional note inline; was saved but never displayed

## [1.5.3] - 2026-04-15

### Q1 — Fuzzy ingredient matching (C3 ImportRecipeURL deeper parsing)
- Rewrote `fuzzy-match.ts` with a full preprocessing pipeline: alias map (60+ regional names — papa→patata, palta→aguacate, carne picada→carne de res molida, etc.), prep-word stripping (asado, fresco, cocido, crudo…), measurement prefix stripping ("200g de", "2 tazas de", "3 huevos"), Spanish plural normalization
- Added `matchIngredientTopNFromList(name, list, n, threshold)` — same fuzzy pipeline against any custom list, used by unified search
- Expanded test suite from 18 → 40 tests covering aliases, prep-word stripping, measurement prefixes, and cross-language matching

### Q2 — AddMeal unified search + multi-add
- New `src/features/food/utils/unified-search.ts`: cross-source search merging fuzzy dict results + recipe title search, single ranked array, deduplicates by id
- Added 16-test suite for unified search covering cross-source results, edge cases, empty sources
- `AddMeal.tsx`: replaced tab-scoped simple `.includes()` with `unifiedSearch` — typing now searches ALL sources (dictionary + recipes) regardless of active tab; OFF API search fires for any query ≥ 3 chars; fixed `apiResults` type from `any[]` → `OFFResult[]`

### Q3 — Batch cooking suggestions + weight refinements
- New `BatchCookingSuggestions.tsx`: wires `analyzeBatchCooking()` (previously unconnected) into a collapsible plan-tab card showing shared base ingredients, recipes per session, estimated time saved, and day abbreviations
- `Cocina.tsx` plan tab: renders `<BatchCookingSuggestions>` above the planner when opportunities exist
- `Progress.tsx`: weight log form now includes optional note field (saved to `WeightEntry.note`); added targetWeight progress bar showing % toward goal using `userProfile.targetWeight`
- i18n: batch cooking keys (`batchTitle`, `batchDesc`, `batchTimeSaved`, `batchTip`) + weight note placeholder + target progress label in ES + EN

## [1.5.11] - 2026-04-16

### Progress tab — full restructure (Q16 + Q17 + Q17b)

#### Architecture
- **Progress.tsx** slimmed from 837 lines to 443-line orchestrator — all JSX extracted into 4 focused components
- **4 new components**: `WeeklyScoreCard`, `ConsistencyCalendar`, `InlineReflection`, `WeightTrendCard`
- **WeeklyReview screen deleted** — functionality absorbed into Progress inline reflection
- `App.tsx`: `weekly-review` route now renders `<Progress />` for backwards compatibility

#### User-visible improvements
- **Weekly score ring** (0–100, color-coded) as hero metric in Nutrición tab
- **Tab order changed**: Nutrición first (core use case), then Cuerpo
- **Top meals this week** section shows highest-kcal meals from the week
- **Calendar day-detail**: tap any logged day to see kcal / protein / meal count / vitality
- **Activity row**: hydration (cups), steps, active minutes — inline in Esta Semana card
- **Adherence bars enhanced**: each bar now shows raw avg value + % + delta vs prior week (Nutrition Summary section eliminated as redundant)
- **Streak removed from Esta Semana** — now shows `daysLogged/7` (streak has its own home in Consistency Calendar)
- **Bienestar unified to 1–5 scale** everywhere (was confusingly split: rawAvg/5 in header, avgVitality/100 in section)
- **Home progress link** always visible when data exists (was Sunday-only)

#### Bug fixes
- **B1 — Week-start Sunday bug**: `getDay() * 86_400_000` gave "today" when called on Sunday and was DST-unsafe; replaced with `getWeekStartISO()` using `setDate`
- **B2 — Hardcoded `es-ES` locale**: calendar month label and day-detail date now use locale from `useI18n()`
- **B3 — Hardcoded Spanish day headers**: `['L','M','X','J','V','S','D']` replaced with i18n `t.progress.dayHeaders`
- **B4 — mealsLogged counted RF logs not meals**: reflection save now counts from `history.mealCount` + `dailyLog.length`
- **B5 — Bienestar metric scope mismatch**: `avgVitality` (7 logs × 20) removed; `rawAvg` (1–5, last 14 logs) used everywhere

#### i18n
- Added `dayHeaders`, `mealCount`, `daysLogged` keys to both `es.ts` and `en.ts`


## [1.5.2] - 2026-04-14

### Documentation and agent workflow
- Replaced the old agent-type-only `AGENTS.md` with a universal multi-agent entrypoint for Codex, Claude, Gemini, Cursor, Windsurf, ChatGPT-style workflows, and local model setups
- Added `docs/ai/` as the shared, versioned context layer for project map, workflow, current state, skills, handoffs, AI boundaries, and tool compatibility
- Reduced `CLAUDE.md` to a thin adapter and added `GEMINI.md`, `.gemini/settings.json`, `.cursor/rules/`, and `.windsurf/rules/` so tool-specific context stays aligned without duplicating the repo rules
- Reworked the local Claude skills so they write shared memory back into the repository instead of depending on private home-directory memory as the source of truth

## [1.5.1] - 2026-04-14

### Deployment hardening
- Unified Gemini calls behind the shared client/proxy layer so AI Coach, recipe import, and photo recognition can all use the Supabase `gemini-proxy` in production
- Extended `supabase/functions/gemini-proxy` to accept rich `contents` payloads, including image inputs for Gemini Vision flows
- Updated env and quickstart docs to reflect the production-safe Gemini setup

## [1.5.0] - 2026-04-08

### Infrastructure
- **i18n system**: ES/EN with auto system-language detection, instant runtime switching
- **Extracted `useLocalStorageState` hook** to `src/hooks/useLocalStorageState.ts`
- **Nutrition utilities** (`src/utils/nutrition.ts`): Mifflin-St Jeor TDEE, macro splits by goal, food quality rating
- **Gamification utilities** (`src/utils/gamification.ts`): streak calculation, 14 badges, 6 levels, points system
- **Correlation engine** (`src/utils/correlations.ts`): Pearson coefficient, tag-wellbeing correlations, time patterns, trend detection, smart insights

### Navigation Restructure (spec v6 aligned)
- Bottom nav: **Hoy | Cocina | + FAB | Explorar | Mas**
- **Cocina** with sub-tabs: [Recetas] [Plan] [Lista] + collections filter + recipe counter (X/30)
- **Explorar** with sub-tabs: [Recetas] [Creadores] [Social]
- **Mas** menu: Diario Real Feel, Ayuno, Challenges, AI Coach, Perfil, Ajustes, RIAL+

### New Screens (8)
- `Cocina.tsx` - Unified recipes/plan/list with collections
- `Creadores.tsx` - Creator profiles with verified badges, followers
- `RealFeelDiary.tsx` - Real Score 0-100, Recharts area chart, correlations, timeline
- `FastingTimer.tsx` - SVG circular timer, 4 protocols (16:8/18:6/20:4/OMAD), history
- `ImportRecipeURL.tsx` - URL input, AI extraction simulation, ingredient review (check/warning)

### New Components (4)
- `RealFeelInline.tsx` - Post-meal 5-emoji check-in with tags, auto-dismiss 60s
- `BarcodeScanner.tsx` - html5-qrcode camera + Open Food Facts API + manual fallback
- `EmptyState.tsx` - Reusable empty state component
- Language switcher in Settings (ES/EN with flags)

### Enhanced Screens
- **Home**: i18n, real streak from data, Planificado Hoy with 1-tap log, Training Day toggle, Real Feel inline trigger, Smart Insight cards (protein, hydration, variety, streak)
- **Profile**: Level system, 14 badges grid, streak counter, body data, points progress bar
- **Settings**: Language switcher (ES/EN), i18n labels
- **Onboarding**: 5-step wizard (Goal -> Body data -> TDEE calculation -> Restrictions -> Ready)
- **CreateModal (FAB)**: 6 actions (Registrar, Crear Receta, Importar URL, Tolerancia, Publicar, Barcode)
- **RecipeDetail**: Food quality badge (green/yellow/red with emoji)
- **AddMeal**: Real barcode scanner, food quality emoji, i18n

### Dependencies Added
- `html5-qrcode` - Barcode/QR scanning via device camera

### Files Summary
- **19 new files** created
- **15 existing files** modified
- **2 locale files** (ES + EN, ~300 keys each)
- **3 utility modules** (nutrition, gamification, correlations)
