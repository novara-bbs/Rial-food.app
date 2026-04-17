# Yazio

**Categoría:** Directo tracking
**ICP primario:** Adulto DACH 25–50 que busca perder peso con estructura y ayuno intermitente, percepción de "calidad alemana" en UI.
**Geografías clave:** Alemania (home), Austria, Suiza, Países Bajos, Francia, Italia, Polonia, España. Top-5 Health & Fitness en múltiples países EU; creciendo fuerte globalmente 2024-2025.
**Pricing (2026):** Free / Pro $9.99/mes o $39.99/año (promociones frecuentes ~$29.99/año). El ayuno intermitente está en free tier — diferenciador clave vs Zero+ o Fastic.
**Tracción conocida:** 80M+ descargas acumuladas reportadas. #1 en Health & Fitness en Alemania varios meses 2024-25. Ascenso global top mover 2025.
**Última revisión:** 2026-04-17

## Hard metrics (2026-04-17)

| Métrica | Valor | Fuente |
|---|---|---|
| Rating Google Play | 4.6★ (300k+ reviews) | https://play.google.com/store/apps/details?id=com.yazio.android |
| Rating App Store US | (source needed — no devuelto por search) | https://apps.apple.com/us/app/ai-calorie-tracker-by-yazio/id946099227 |
| Google Excellence App | Sí (Play Store badge) | https://play.google.com/store/apps/details?id=com.yazio.android |
| Usuarios claimed | 95M–100M worldwide | https://www.yazio.com/en/android-app + Play Store listing |
| Descargas Google Play | 10M+ | https://play.google.com/store/apps/details?id=com.yazio.android |
| Pricing Pro | $9.99/mo · $39.99/yr · ~$29.99/yr promos | App Store listing |
| Revenue 2025 | (source needed — no público vía Apptopia) | https://apptopia.com/google-play/app/com.yazio.android.pro/about |
| Growth 12m | Top mover global 2025; ranks top-5 múltiples mercados EU | https://sensortower.com/blog/state-of-mobile-health-and-fitness-in-2025 |

## Pantallas principales (qué estudiar)

### 1. Onboarding de 3 pasos — time-to-first-value 90s
- **Qué hace bien**: goal (lose/maintain/gain) → body stats → diet preference. Tres pantallas. Sin tutorial video, sin newsletter-gate, sin login obligatorio para probar. El usuario está viendo su macro target en <2 minutos.
- **Mapeo a RIAL**: `src/features/profile/components/Onboarding.tsx`.
- **Acción sugerida**: **copiar** el shrink de steps. RIAL cuando rediseñe onboarding debe apuntar a ≤5 pantallas sin login obligatorio. Cada pantalla extra cuesta ~15% drop-off (benchmark Lifesum/MFP).

### 2. Home con progress ring único + ayuno timer inline
- **Qué hace bien**: un solo ring grande (kcal consumidas/target) domina el viewport. Macros en fila debajo, no compitiendo. Si tienes un protocolo de ayuno activo, un timer compacto debajo del ring muestra countdown.
- **Mapeo a RIAL**: `src/features/home/screens/Home.tsx` + `NutritionHero`.
- **Acción sugerida**: **copiar** la jerarquía "un ring domina + secundarios debajo". Hoy RIAL tiene `NutritionHero` + `ProgressPreviewCard` + elements dispersos. Consolidar post-Q6 en single hero-ring + breakdown secundario.

### 3. Recipe cards con hero image grande + macros overlay
- **Qué hace bien**: cada receta ocupa ~60% viewport con foto, macros superpuestos abajo con gradient sutil. Sensación premium vs listados densos de MFP/Cronometer.
- **Mapeo a RIAL**: `src/components/patterns/RecipeCard.tsx` + `src/features/recipes/screens/Cocina.tsx`.
- **Acción sugerida**: **copiar** — RIAL ya va en esa dirección con `HeroGallery` (Fase 1 `58aa9c7`). Yazio valida la decisión; ahora toca pulir tipografía y spacing al nivel alemán.

### 4. Free fasting timer con historial
- **Qué hace bien**: timer funcional con 5+ protocolos (16:8, 14:10, 20:4, 5:2, OMAD). Historial con gráfica de adherencia semanal. Es el Trojan horse para captar usuarios de Zero/Fastic.
- **Mapeo a RIAL**: `src/features/wellness/screens/FastingTimer.tsx`.
- **Acción sugerida**: **copiar** — RIAL tiene `FastingTimer` pero UI pobre vs Yazio. En Q15+ pulir al nivel de onboarding/3-pasos. Mantener en free tier por narrativa: "tracking + ayuno en una app, sin doble paywall".

### 5. Weekly progress report con insights
- **Qué hace bien**: cada domingo genera automáticamente un resumen — tendencia peso 7d, adherencia macros %, 3 alimentos más consumidos, sugerencia para la siguiente semana. Reengagement orgánico sin push spam.
- **Mapeo a RIAL**: `src/features/wellness/screens/WeeklyCheckIn.tsx` + `src/features/wellness/screens/Progress.tsx`.
- **Acción sugerida**: **copiar** + **enriquecer** — RIAL tiene `WeeklyCheckIn` pero es form-based (usuario rellena). Yazio es auto-generated. Añadir un `WeeklyInsightsCard` que corra el domingo con datos de la semana pasada.

## Qué hace bien
- **Ayuno intermitente en free tier** — 16:8, 14:10, 20:4, 5:2, OMAD, todos gratis con timer visual + historial. Es el principal gancho que empuja usuarios de Zero/Fastic hacia Yazio porque consolidan tracking + fasting sin pagar dos subscripciones.
- **UI extraordinariamente pulida** — tipografía consistente, spacing generoso, microanimaciones discretas. Sensación premium a nivel Apple-native que MFP/Cronometer no alcanzan.
- **Recetas built-in con macro breakdown** — biblioteca amplia (~1500+ recetas propias) con fotos buenas y macros pre-calculados. Filtros por dieta (keto, low-carb, veggie, etc.).
- **Barcode scanner rápido en free** — a diferencia de MFP, Yazio mantiene barcode gratuito (con ads). Menos fricción de adopción.
- **Weekly progress reports** — resumen semanal con tendencias peso + comidas más frecuentes + adherencia al plan. Reengagement orgánico.

## Qué hace mal / gaps
- **Recipe library estática** — no hay mecanismo de creación de recetas por usuario con todo el pulido de las oficiales. Si quieres tu receta propia queda visualmente inferior.
- **Planner débil** — hay recomendación diaria pero no un calendar semanal drag-and-drop. Para ICP que planifica familia completa, Yazio se queda corto.
- **Coverage US/LatAm inferior a MFP/Fitia** — DB de productos europeos es buena; marcas US o productos LatAm tienen lagunas.

## Patrones UX destacables
- **Free fasting timer con historial** — Yazio usa el timer como Trojan horse: ganas usuarios que vinieron solo por fasting y luego descubren tracking. Modelo Zero-by-MFP pero integrado no standalone.
- **Recipe cards con hero image grande + macros overlay** — cada receta card usa ~60% del viewport en foto, macros superpuestos abajo. Visualmente superior al listado denso de MFP.
- **Plan de 3 pasos en onboarding** — goal (lose/maintain/gain) → body stats → diet preference. Tres screens, no veinte. Time-to-first-value ~90 segundos.
- **Progress ring único día** — un solo ring grande muestra kcal consumidas/target. Detalles macros debajo, no compitiendo por atención.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | Completo, pulido |
| Recetas propias (creación manual) | parcial | CRUD existe pero UX inferior a recetas oficiales |
| Multi-media recetas (fotos + video) | parcial | Foto por receta oficial (no user), sin video |
| Import recetas URL | ✗ | No nativo |
| Barcode scanner | ✓ | Free tier, rápido |
| Photo recognition comida | parcial | Añadido 2024 en Pro (source needed para calidad) |
| Planner semanal (MealSlot) | parcial | Sugerencia diaria, no calendar |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | ✓ | Free tier, 5+ protocolos |
| AI Coach contextual | ✗ | No coach conversacional; recomendaciones rule-based |
| Social / creator content | ✗ | No |
| Progreso fotos (Body snapshot) | parcial | Peso + medidas; fotos limitado |
| Pantry / despensa | ✗ | No |
| Shopping list auto | parcial | Desde recetas Pro |
| Wellness (Real Feel / mood) | ✗ | No |
| Wearable integration | ✓ | Apple Health, Google Fit, Fitbit, Garmin |

## Lecciones aplicables a RIAL
1. **Copiar:** el modelo de UI de recipe cards (hero image grande, macros overlay minimalista). RIAL ya va en esa dirección con HeroGallery (Fase 1 `58aa9c7`); Yazio valida la decisión. También el free fasting timer con historial — RIAL tiene FastingTimer pero con UI pobre vs Yazio; en Q15+ merece pulido al nivel de onboarding/3-pasos de Yazio.
2. **Evitar:** dejar la creación de recetas del usuario como ciudadano de segunda. RIAL ya invirtió en CreateRecipe + PhotoUploader (Fase 2 `dd22be8`) — los user-generated recipes deben poder alcanzar la calidad visual de las seed, no quedarse en "feo pero funcional" como Yazio.
3. **Diferenciarnos en:** planner semanal drag-and-drop (Yazio no lo tiene); batch cooking (Yazio no lo tiene); AI coach conversacional (Yazio es rule-based); Real Feel (Yazio solo objetivo); cocina ES+LatAm (Yazio tiene cobertura DACH/EU principalmente).

## Fuentes
- App Store listing: https://apps.apple.com/us/app/yazio-calorie-counter/id946099227
- Play Store listing: https://play.google.com/store/apps/details?id=com.yazio.android
- Yazio corporate info (Erfurt, DE): https://www.yazio.com/en/company
- Yazio intermittent fasting integration: https://www.yazio.com/en/intermittent-fasting
- App Store rankings DE 2025: Sensor Tower / data.ai public summaries (source needed for exact snapshot)
