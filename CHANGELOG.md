# RIAL App - Changelog

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
