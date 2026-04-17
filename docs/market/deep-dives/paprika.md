# Paprika Recipe Manager

**Categoría:** Directo recetas (recipe manager + planner ligero)
**ICP primario:** Cocinero entusiasta 30–60, ya tiene recetas propias + pins Pinterest + copy-paste de blogs. Quiere organizar, importar web, planificar básico. Anti-subscription fatigue. Perfil "power user cocina casera".
**Geografías clave:** US (home), Canadá, UK, Australia. Comunidad global iOS/macOS/Windows/Android (cross-platform real).
**Pricing (2026):** One-time purchase — $4.99 iOS, $4.99 Android, $29.99 desktop (macOS/Windows). Sin subscripción. Paprika 3 es la versión actual 2026. Precedente crítico para decisión MealSlot Q19 de RIAL.
**Tracción conocida:** Estimadas varias millones de compras acumuladas (source needed cifra exacta). Desarrollada por Hindmost Ltd, empresa pequeña independiente. Longevidad de la app (desde 2011) es diferenciador.
**Última revisión:** 2026-04-17

## Hard metrics (2026-04-17)

| Métrica | Valor | Fuente |
|---|---|---|
| Rating App Store US | Alta (numerosas 5★ reviews, top recipe manager rankings) | https://apps.apple.com/us/app/paprika-recipe-manager-3/id1303222868 |
| Rating Google Play | Alta | https://play.google.com/store/apps/details?id=com.hindsightlabs.paprika.android.v3 |
| Modelo negocio | One-time purchase (sin subscripción) | https://www.paprikaapp.com/purchase |
| Pricing iOS/Android | $4.99 lifetime | App Store listing |
| Pricing desktop | $29.99 macOS/Windows | https://www.paprikaapp.com/purchase |
| Cross-platform | iOS + Android + macOS + Windows con sync | https://www.paprikaapp.com/ |
| Longevidad | 2011 → 2026 (15 años, versión 3 actual) | https://www.paprikaapp.com/ |
| Lealtad community | Usuarios long-term desde 2015+ (reviews) | https://apps.apple.com/us/app/paprika-recipe-manager-3/id1303222868 |
| Users/MAU claim | No público (empresa privada Hindsight Labs) | — |

> **Contexto RIAL**: Paprika es **precedente directo** del patrón `Recipe.suitableFor: MealSlot[]` (Q19). La decisión de adoptar multi-slot en RIAL se validó contra la comunidad recipe-manager donde Paprika es referencia 15 años.

## Pantallas principales (qué estudiar)

### 1. Web clipper / share-sheet importer
- **Qué hace bien**: browser extension (desktop) + share sheet (mobile) que importa receta en 1 tap. Funciona en 95%+ de recipe blogs (cobertura legendaria). Reduce fricción adquisición a cero.
- **Mapeo a RIAL**: `src/features/recipes/screens/ImportRecipeURL.tsx` + Capacitor Share extension (futura).
- **Acción sugerida**: **copiar** — RIAL tiene `ImportRecipeURL` manual pero no share-sheet nativo. En Q6+ añadir Capacitor Share extension iOS/Android para que "compartir" desde cualquier app → RIAL parsea URL. Es el feature que convierte RIAL de "app que visito" a "app donde aterriza todo lo que veo".

### 2. Recipe scaling inline
- **Qué hace bien**: slider de "porciones" en la receta abierta recalcula ingredientes en tiempo real. No hay que editar, se ajusta dinámicamente.
- **Mapeo a RIAL**: `src/features/recipes/screens/RecipeDetail.tsx`.
- **Acción sugerida**: **copiar** — feature barata (2-3h). Añadir slider "¿Para cuántos comensales?" que multiplique cantidades de ingredientes. ICP Ana (household) lo pide directamente; ICP Clara lo usa para meal-prep.

### 3. Multi-slot recipe placement (suitableFor[])
- **Qué hace bien**: misma receta puede aparecer en breakfast O lunch O dinner sin forzar mealType único. Decisión de slot al planificar, no al guardar. Filosofía "recipe vs meal" separada.
- **Mapeo a RIAL**: `src/features/recipes/utils/meal-slot.ts` + `Recipe.suitableFor: MealSlot[]` (committed Q19 en `5dab667`).
- **Acción sugerida**: **validado** — RIAL ya lo adoptó. Paprika confirma que la decisión es robusta 15 años. Ver `priority-review.md` implicación 5. No recalibrar hasta Q20+.

### 4. Meal planning calendar drag-drop
- **Qué hace bien**: calendar semanal donde arrastras recetas a días. Simple pero funcional. Es el patrón que inspiró el Planner de RIAL.
- **Mapeo a RIAL**: `src/features/planner/screens/Planner.tsx`.
- **Acción sugerida**: **mantener + mejorar** — RIAL ya tiene Planner con drag-drop básico. Paprika valida el patrón. En Q12+ añadir batch-cooking logic encima (el hueco diferenciador vs Paprika).

### 5. Grocery list manual-edit-friendly
- **Qué hace bien**: lista generada del plan editable, reordenable, marcable, sin constraints algorítmicos. No fuerza categorización ni agrupación.
- **Mapeo a RIAL**: `src/features/planner/screens/ShoppingList.tsx`.
- **Acción sugerida**: **mantener paridad** — RIAL ya tiene shopping list desde planner. Verificar que es libremente editable (no-readonly). Paprika avisa: over-engineering de auto-categorización puede estorbar al usuario.

## Qué hace bien
- **One-time pricing contracorriente** — $4.99 mobile lifetime. En mar de subscripciones mensuales, Paprika retiene base fiel anti-subscription. Modelo sostenible demostrado en 15 años.
- **Web importer best-in-class** — pega URL de cualquier blog/site y Paprika extrae título, ingredientes, pasos, foto. Cobertura masiva (funciona en 95%+ de recipe blogs según comunidad). Históricamente el gold standard.
- **Scaling ingredients** — si receta es para 4 personas y tú cocinas para 6, recalcula cantidades automáticamente. Útil para ICP household.
- **Meal planning visual drag-drop** — calendar semanal donde arrastras recetas a días. Simple pero funcional. El patrón que inspiró parte del Planner de RIAL.
- **Sync entre devices via account** — lifetime purchase + cloud sync opcional. Funciona en iOS + Android + macOS + Windows con mismo account.
- **Apta para múltiples franjas (slots) implícitas** — Paprika permite que una receta aparezca en breakfast O lunch O dinner sin forzar mealType único. Precedente directo para decisión Q19 de RIAL (`Recipe.suitableFor: MealSlot[]`).

## Qué hace mal / gaps
- **Zero nutrition tracking** — Paprika es recipe manager, no tracker. Usuario que quiere macros tiene que combinar con otra app.
- **Zero wellness / mood / photo-recog** — scope deliberadamente estrecho.
- **UI funcional pero envejecida** — cross-platform significa menor común denominador; UX iOS se ve anticuada vs apps iOS-native recientes.
- **Planner básico** — hay calendar, pero sin auto-planning, sin constraints, sin batch cooking logic.

## Patrones UX destacables
- **Web clipper** — extension de navegador (desktop) + share sheet (mobile) que importa recetas en 1 tap. Reduce fricción adquisición a zero.
- **Recipe scaling inline** — slider de "porciones" en la receta abierta recalcula ingredientes en tiempo real. No hay que editar, se ajusta dinámicamente.
- **Multi-slot recipe placement** — misma receta puede tener `mealType: null` (= apta para cualquier franja). Usuario decide slot al planificar, no al guardar. Filosofía "recipe vs meal" separada. Precedente Q19 RIAL.
- **Grocery list manual-edit-friendly** — la lista generada del plan se puede editar/reordenar/marcar sin fricción. No hay constraints algorítmicos.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✗ | Deliberadamente no |
| Recetas propias (creación manual) | ✓ | Core feature |
| Multi-media recetas (fotos + video) | parcial | Foto única, sin video |
| Import recetas URL | ✓ | Best-in-class |
| Barcode scanner | ✗ | No |
| Photo recognition comida | ✗ | No |
| Planner semanal (MealSlot) | ✓ | Drag-drop simple, multi-slot friendly |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | ✗ | No |
| AI Coach contextual | ✗ | No |
| Social / creator content | ✗ | No |
| Progreso fotos (Body snapshot) | ✗ | No |
| Pantry / despensa | parcial | Basic pantry/shopping integration |
| Shopping list auto | ✓ | Desde planner |
| Wellness (Real Feel / mood) | ✗ | No |
| Wearable integration | ✗ | No |

## Lecciones aplicables a RIAL
1. **Copiar:** el web clipper / share-sheet importer. RIAL tiene `ImportRecipeURL` pero cobertura variable; Paprika demuestra que un parser robusto + share sheet nativo (Capacitor) es un patrón ganador. También el recipe scaling inline (slider porciones recalcula ingredientes) — feature barato de añadir a RecipeDetail. Y el multi-slot recipe placement — RIAL Q19 ya adoptó el patrón `suitableFor: MealSlot[]` influido por Paprika + PlateJoy; validado por líder del sector recipe managers.
2. **Evitar:** UI cross-platform lowest-common-denominator. Paprika paga coste de verse anticuada en iOS por compatibilidad macOS/Windows. RIAL vía Capacitor puede mantener mobile-first premium sin ese compromiso.
3. **Diferenciarnos en:** tracking macros (Paprika no); wellness (no); social (no); AI Coach (no); batch cooking (no); ayuno (no); photo recognition (no); barcode (no); real-food identity (no). RIAL = "Paprika + tracker + wellness + creator" en un producto. Paprika además de competidor es "allied pattern library" — copiamos patterns sin canibalizar su propuesta de valor.

## Fuentes
- App Store listing: https://apps.apple.com/us/app/paprika-recipe-manager-3/id1303222647
- Play Store listing: https://play.google.com/store/apps/details?id=com.hindmost.paprika3
- Paprika website + cross-platform: https://www.paprikaapp.com/
- Paprika pricing (lifetime): https://www.paprikaapp.com/purchase
- Recipe manager ranking mentions: https://www.nytimes.com/wirecutter/reviews/best-recipe-apps/
