# MyFitnessPal

**Categoría:** Directo tracking
**ICP primario:** Adulto 25–45 que quiere perder peso o mantener, cómodo con calorías como unidad mental, bilingüe por defecto.
**Geografías clave:** US (home), UK, Canadá, Australia, Europa occidental, creciendo en LatAm vía localización.
**Pricing (2026):** Free (con ads + features limitadas) / Premium $19.99/mes o $79.99/año / Premium+ $24.99/mes o $99.99/año (Premium+ añade AI meal plans + advanced insights).
**Tracción conocida:** 200M+ descargas acumuladas, 14M+ foods en DB verificada + user-submitted; líder histórico del sector desde 2005. Marzo 2026 adquiere Cal AI (valoración no pública).
**Última revisión:** 2026-04-17

## Hard metrics (2026-04-17)

| Métrica | Valor | Fuente |
|---|---|---|
| Rating App Store US | 4.7★ | https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718 |
| Rating Google Play | 4.4★ | https://play.google.com/store/apps/details?id=com.myfitnesspal.android |
| Community members | 200M+ | https://www.similarweb.com/app/google-play/com.myfitnesspal.android/statistics/ |
| Downloads iOS (último mes) | ~900k | https://app.sensortower.com/overview/341232718?country=US |
| Downloads Play (último mes) | ~530k | https://www.similarweb.com/app/google-play/com.myfitnesspal.android/statistics/ |
| Food database | 18M entries (verificadas + user-submitted) | Listing App Store |
| M&A marzo 2026 | Adquirió Cal AI (~$30M ARR pre-M&A) | (source needed URL press release) |
| Pricing Premium | $19.99/mes · $79.99/año | App Store listing 2026 |
| Pricing Premium+ | $24.99/mes · $99.99/año | App Store listing 2026 |

## Pantallas principales (qué estudiar)

### 1. Diary con suma running del día siempre visible
- **Qué hace bien**: arriba del diario, persistente, muestra kcal consumidas / objetivo / ejercicio / restantes. Retroalimentación visible en cada acción sin tener que volver a home. Es el invariante de retención de MFP desde 2010.
- **Mapeo a RIAL**: `src/features/home/screens/Home.tsx` + `NutritionHero`.
- **Acción sugerida**: **mantener** — RIAL ya lo hace vía `NutritionHero`. MFP valida que funciona. No tocar sin A/B test.

### 2. Barcode scanner con histórico porciones
- **Qué hace bien**: al escanear un producto ya registrado, pre-selecciona la última porción usada. Reduce fricción de logging diario.
- **Mapeo a RIAL**: `src/features/food/components/BarcodeScanner.tsx`.
- **Acción sugerida**: **copiar** al activar barcode en Q6+ — RIAL debe persistir "última porción por EAN" en localStorage (o Supabase post-sync) y pre-rellenar al re-scan. Cheap, high-retention. Documentar en handler factory.

### 3. Recipe importer via URL
- **Qué hace bien**: pega URL, parsea ingredientes + macros. Robusto en sitios US populares (AllRecipes, Food Network, NYT Cooking). Dominio madurado por 10+ años.
- **Mapeo a RIAL**: `src/features/recipes/screens/ImportRecipeURL.tsx`.
- **Acción sugerida**: **mantener paridad** — RIAL ya tiene `ImportRecipeURL`. MFP confirma el pattern. En Q6 activar Edge function `og-fetch` que auto-popula `videoUrl` desde TikTok/Instagram/YouTube (ver state.md risks).

### 4. Quick-add calorías
- **Qué hace bien**: campo numérico puro, sin buscar alimento. Para restaurantes sin info, comidas improvisadas, o días "no tengo ganas de loggear". Reduce logging fatigue y evita "no loggeo hoy = abandono app".
- **Mapeo a RIAL**: `src/features/food/screens/AddMeal.tsx`.
- **Acción sugerida**: **copiar** — hoy RIAL exige buscar alimento o receta. Añadir un tab "Rápido" en AddMeal con campos kcal/P/C/F libres. Captura el día perezoso sin perder la data.

### 5. Paywall Premium vs Premium+ (anti-patrón)
- **Qué hace bien (comercialmente)**: dos tiers Premium permiten up-sell incremental.
- **Qué hace mal (producto)**: confusión brutal. Users no entienden qué va dónde. Barcode scanner en paywall 2024 → backlash + churn. Cal AI integrada post-M&A irá a Premium+, estratificando más.
- **Mapeo a RIAL**: `src/features/profile/screens/RialPlus.tsx`.
- **Acción sugerida**: **evitar** explícitamente en ADR-008 pricing. RIAL debe seguir modelo Bevel (free-generous + single paid), no MFP (free + P + P+). Barcode SIEMPRE gratis. Ver `priority-review.md` implicación 3.

## Qué hace bien
- **Food database más grande del sector** — 14M+ entries. Para casi cualquier marca de supermercado o restaurante en EE. UU. y UK hay una entrada verificada. Network effect de 20 años.
- **Barcode scanner es instantáneo** — la acción más pulida de la app. Reconoce producto en <1s, lo mapea a la entrada verificada, y lo registra con la última porción usada.
- **Integraciones wearable profundas** — Apple Health, Google Fit, Fitbit, Garmin, Oura, Whoop sincronizan calorías quemadas y steps bidireccional.
- **Recipe importer web estable** — pega URL y parsea ingredientes + macros. Funciona bien en sitios de recetas populares US (AllRecipes, Food Network, NYT Cooking).
- **Quick-add calorías** — para cuando no quieres registrar detalle, un campo numérico. Reduce logging fatigue en días perezosos.

## Qué hace mal / gaps
- **Paywall agresivo en features core** — barcode scanner y logs sin anuncios detrás de Premium ($79.99/año) desde 2024. Generó backlash masivo (App Store rating cayó temporalmente), empujó muchos usuarios a Lose It! y Cronometer.
- **UI anticuada** — sigue patrones iOS 2018. Formularios largos, animaciones escasas, theming básico. No ha capitalizado su base masiva con UX premium.
- **Base de datos user-submitted con ruido** — muchas entradas duplicadas o con macros mal calculados. Requiere leer nombres y seleccionar la "verified" (green check).

## Patrones UX destacables
- **Quick-add calorías** — campo numérico puro, sin buscar alimento. Útil para comidas improvisadas o restaurantes sin info nutricional.
- **Diary por comida pero con suma running del día** — arriba del diario siempre visible: kcal consumidas, kcal objetivo, kcal ejercicio, kcal restantes. Retroalimentación persistente.
- **Barcode → histórico porciones** — al escanear un producto que ya registraste, pre-selecciona la última porción usada. Reduce fricción.
- **Weekly nutrition report email** — resumen semanal por email con tendencias. Reengagement automático.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | Gold standard histórico |
| Recetas propias (creación manual) | ✓ | Recipe box con CRUD completo |
| Multi-media recetas (fotos + video) | parcial | Una foto por receta, sin video |
| Import recetas URL | ✓ | Web importer estable |
| Barcode scanner | ✓ | Paywalled desde 2024 |
| Photo recognition comida | ✓ | Via Cal AI post-adquisición 2026 (Premium+) |
| Planner semanal (MealSlot) | ✗ | MFP tiene 4 meals (Breakfast/Lunch/Dinner/Snack) pero no planner visual |
| Batch cooking logic | ✗ | Recetas individuales, no agrupación |
| Ayuno intermitente integrado | ✗ | MFP compró Zero (standalone). No integrado en app principal. |
| AI Coach contextual | parcial | Premium+ tiene AI meal plans, no coach conversacional |
| Social / creator content | parcial | News feed + friends, no creator economy |
| Progreso fotos (Body snapshot) | parcial | Progress photos existen pero sin timeline rich |
| Pantry / despensa | ✗ | No nativo |
| Shopping list auto | parcial | Via recipes; no auto-dedupe pantry |
| Wellness (Real Feel / mood) | ✗ | Puro tracking calórico |
| Wearable integration | ✓ | Mejor del mercado |

## Lecciones aplicables a RIAL
1. **Copiar:** el patrón "suma running del día siempre visible" arriba del diario — RIAL ya lo hace en NutritionHero, pero MFP prueba que funciona para retención. Mantenerlo como invariante. También el "barcode → última porción usada" (si RIAL añade scanner en Q6+, debe pre-rellenar con histórico, no empezar de cero).
2. **Evitar:** el paywall en barcode scanner. Nuestro freemium lo mantiene gratis en v1 — es el feature que convierte casual logger en daily user. Paywallear features core cuando la base crece genera backlash masivo (App Store reviews MFP 2024 lo documenta).
3. **Diferenciarnos en:** real-food identity vs. calorie obsession (MFP es agnóstico al tipo de comida, cuenta todo por macros); cocina ES/LatAm nativa (MFP tiene huecos en productos de supermercado español — Mercadona, Carrefour ES, Hacendado); batch cooking (MFP no agrupa recetas por día-de-cocina); Real Feel subjective wellness (MFP no tiene nada parecido, solo métricas objetivas).

## Fuentes
- App Store listing: https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718
- Play Store listing: https://play.google.com/store/apps/details?id=com.myfitnesspal.android
- Under Armour sold MFP to Francisco Partners (2020): https://www.forbes.com/sites/abrambrown/2020/10/30/under-armour-sells-myfitnesspal/
- MFP acquires Cal AI (March 2026): (source needed — mencionado en `docs/market/competitors-index.md` y `README.md` snapshot 2026-04-17)
- MFP Premium pricing + backlash 2024: https://www.androidpolice.com/myfitnesspal-barcode-scanner-paywall/
- Wearable integrations list (official): https://support.myfitnesspal.com/hc/en-us/articles/360032274171-App-Device-Integrations
