# UX patterns — qué copiar, qué evitar, dónde diferenciarnos

> Extracto de patrones reutilizables observados en las 18 fichas de [`deep-dives/`](deep-dives/). Cada patrón viene con: qué es, quién lo ejecuta bien/mal, la decisión RIAL y (si aplica) el archivo del repo que lo implementa.
> Última revisión: **2026-04-17**. Actualizar cuando un competidor publique un patrón nuevo digno de absorberse.

Leyenda de decisión RIAL:

- 🟢 **Copiar / adoptar** — merece entrar al roadmap.
- 🟡 **Adaptar con fricción** — útil pero hay que ajustar para el contexto RIAL (ES, real-food, free tier generoso).
- 🔴 **Evitar deliberadamente** — señal de dark pattern o "breadth trap".
- ⚪ **Ya hecho** — RIAL ya lo implementa; solo referencia para no regresionar.

---

## 1. Onboarding + personalización

### 1.1 🟢 Yazio — onboarding corto con justificación científica

**Qué hace:** 4–5 preguntas (goal, peso actual, peso objetivo, altura, sexo/edad) + bloque corto "así calculamos tu objetivo: TDEE Mifflin-St Jeor × factor actividad – 500 kcal/día". Transparencia del cálculo **antes** de pedir email.

**Por qué funciona:** usuario entiende el número inmediato, no lo percibe como arbitrario. Conversión a registered user sube vs onboardings opacos.

**Decisión RIAL:** ⚪ ya hecho en Onboarding — el flujo es similar. Revisar copy para explicitar la fórmula usada.

### 1.2 🟡 Noom — onboarding largo (20+ questions) como gancho psicológico

**Qué hace:** 25–35 preguntas (hábitos, historial dietas, motivación emocional) construyendo perfil profundo. El largo es el feature: genera commitment bias ("ya he invertido tiempo, debo probar").

**Por qué funciona:** Noom convierte >10% post-onboarding largo. Pero también genera rage-quit medio-onboarding (well-documented en reviews).

**Decisión RIAL:** 🟡 tomar la idea de "preguntas que hacen pensar al usuario en su relación con la comida" pero no escalar a 30. RIAL puede añadir 3–5 preguntas emocionales opcionales (post-core) para segmentar Real Feel default tag set. No como paywall emocional.

### 1.3 🔴 Cal AI — onboarding "toma una foto de tu comida para empezar"

**Qué hace:** pide foto primer segundo de la app antes de explicar nada. Fuerza al usuario a producir valor inmediato.

**Por qué superficialmente funciona:** engagement instantáneo.
**Por qué falla:** usuario llega a cenar y le pide foto de un plato ya empezado; friction real. Retention drop 7d muy alto según reviews App Store.

**Decisión RIAL:** 🔴 evitar. Mantener Onboarding actual (perfil → daily target → home). El valor en día 1 está en "mirar tu daily target y pensar qué comer", no en producir un log.

---

## 2. Discovery / feed

### 2.1 🟢 Yummly (Whirlpool) — feed visual-first con ingredients already-have

**Qué hace:** home feed de recetas con filtro "recipes using what you have" (requiere pantry). Foto grande + tiempo + nivel. Scroll infinito.

**Por qué funciona:** reduce "what should I cook?" fatigue. Pantry-aware matching es el hook.

**Decisión RIAL:** 🟢 en roadmap Q15+. RIAL ya tiene `pantryItems` en localStorage; falta el matcher "recetas con ≥70% ingredientes en despensa". Implementar en Cocina tab filtro "Con lo que tengo".
**Implementado en:** `src/features/recipes/screens/Cocina.tsx` tiene filtros base pero no matcher pantry.

### 2.2 🟢 MyRealFood — Real Score visible en todo

**Qué hace:** cada alimento y receta lleva un **Real Score** (A/B/C/D/E estilo Nutri-Score pero adaptado NOVA). Visible en card, detail, search results, tracker.

**Por qué funciona:** educa al usuario sin fricción. Cambia "¿cuántas calorías tiene?" por "¿qué tan real es?".

**Decisión RIAL:** 🟢 parcialmente — RIAL tiene concepto "Real Feel" pero no score de receta. Añadir `realScore: 'A'|'B'|'C'|'D'|'E'` a Recipe (Q21+) basado en heurística NOVA + densidad nutricional. Sin necesidad de base de datos propia NOVA (reusar NutriScore de OpenFoodFacts vía barcode).

### 2.3 🟡 Lifesum — "Today's Plate" card con progreso visual inmediato

**Qué hace:** home tiene una card central "Your plate today" con barras macros + CTA único "Log food". La decisión visual es Foregrounds cuántos macros te quedan, no cuántos has comido.

**Por qué funciona:** framing positivo ("te queda proteína por comer") vs negativo ("has comido mucho").

**Decisión RIAL:** 🟡 — RIAL Home tiene NutritionHero (post Q16 walkthrough) pero sigue orientado a "consumidas vs target". Evaluar variante "te quedan X kcal / Yg proteína" como opción ICP-adaptive para Clara/Marcos.
**Implementado en:** `src/features/home/components/NutritionHero.tsx`.

### 2.4 🔴 Samsung Food — home saturado con tabs y recommendations

**Qué hace:** home con 5+ tabs (descubre, tú, shopping, smart cooking, cookbooks) + secciones rotativas. Cada tab tiene 4–6 sub-secciones.

**Por qué falla:** paralysis by choice; retention 30d muy bajo (reviews + Whirlpool reporta a su matriz baja monetización).

**Decisión RIAL:** 🔴 evitar. Mantener Hoy / Cocina / Explora / Progreso como 4 tabs; cada una con ≤3 sub-secciones visibles en hero.

---

## 3. Log / add meal flow

### 3.1 🟢 MyFitnessPal — Quick Add + recent foods + meal templates

**Qué hace:** el flujo de agregar comida tiene 4 entry points: barcode, search, recent (últimos 30 días), meal templates (grupos guardados "desayuno habitual"). Recent es el 60% de usage según MFP blog.

**Por qué funciona:** log es el principal drop-off de tracker apps. Recent reduce tiempo medio de log de 45s → 8s.

**Decisión RIAL:** 🟢 — RIAL tiene AddMeal con búsqueda + barcode; **falta "Recent" prominente** y **meal templates** (ej. "desayuno de Clara — pan + aguacate + huevo" guardable). Roadmap Q15+.
**Implementado en:** `src/features/food/screens/AddMeal.tsx`.

### 3.2 🟡 Cal AI — one-tap photo → macros auto

**Qué hace:** foto del plato → AI estima macros. El usuario solo confirma o edita.

**Por qué funciona superficialmente:** low friction.
**Por qué hay que adaptar:** precisión variable (±30% es común en Cal AI reviews). Usuarios rígidos (Marcos) no tolera error; usuarios casuales (Clara) lo agradecen.

**Decisión RIAL:** 🟡 — post-adquisición MFP, RIAL no debe entrar en la carrera AI photo. Pero una versión "photo → OCR de ingredientes + auto-compose de macros" es factible con Gemini Vision. Pospuesto hasta que el core loop esté solid (Q6 + Q15).

### 3.3 🔴 Noom — log obligatorio para desbloquear lessons

**Qué hace:** las lecciones CBT (core value prop Noom) requieren log completado del día. Gate learning behind logging.

**Por qué falla:** guilt loop. Usuario que no logea un día pierde el contenido de ese día → mayor abandono.

**Decisión RIAL:** 🔴 evitar. Weekly reflection y Progress tab son **accesibles siempre**, independientemente de logs del día. Cuanto más se logea, mejor señal Real Feel, pero el valor no está detrás del log.

---

## 4. Planner semanal

### 4.1 🟢 Paprika + PlateJoy — separación "apta para" vs "slot consumo"

**Qué hace:** una receta tiene `suitableFor: [breakfast, lunch]` (propiedad de la receta), distinto del slot donde el usuario la planifica (decisión al drag-drop).

**Por qué funciona:** matchea el mental model real — "las tortitas pueden ser desayuno o cena tardía" sin tener que duplicar receta.

**Decisión RIAL:** ⚪ ya hecho Q19 (`MealSlot[]` + `suitableFor[]`). **Único entre 19 competidores analizados junto a Paprika/PlateJoy.**
**Implementado en:** `src/types/recipe.ts` + `src/features/recipes/utils/meal-slot.ts`.

### 4.2 🟢 Mealime — <30 min recipes as default filter

**Qué hace:** planner default filter "quick (≤30 min)". Usuario puede desactivar pero default favorece velocidad.

**Por qué funciona:** matchea el problema real "no tengo tiempo hoy". Reduce cognitive load planificación.

**Decisión RIAL:** 🟢 parcial — Q19 promovió "Rápido" de franja a `collections` (eje tiempo ortogonal). Falta exponer chip "≤20 min" prominente en Cocina + Planner.

### 4.3 🟡 Eat This Much — auto-plan semana entero con restricciones

**Qué hace:** IA genera plan 7 días ajustado a macros + presupuesto + restricciones dietéticas. Usuario revisa y ajusta.

**Por qué funciona:** cero decision fatigue. Especialmente para Ana (family planner).
**Por qué hay que adaptar:** auto-plan sin cultural context da resultados "Chipotle bowl, smoothie, stir-fry" — no mediterráneo.

**Decisión RIAL:** 🟡 — en Q20+ añadir "Plan sugerido de la semana" (Gemini con contexto: user profile + ICP + cocina ES + recetas guardadas del usuario). No reemplazar planner manual, añadirlo como CTA alternativo.

### 4.4 🔴 Plan to Eat — drag & drop calendar desktop-first

**Qué hace:** drag & drop recetas a calendar view 7 días — pero UX está diseñado para desktop, móvil es inferior.

**Por qué falla en mobile:** drag a cell pequeña es accidentado; tap targets por debajo HIG 44px.

**Decisión RIAL:** 🔴 evitar drag & drop como primary input en móvil. Mantener `RecipeDaySelectorSheet` actual (sheet bottom-up con día × slot) que es tap-based.
**Implementado en:** `src/features/recipes/components/RecipeDaySelectorSheet.tsx`.

---

## 5. Recetas — creación, import, multi-media

### 5.1 🟢 Yummly / NYT Cooking — hero carrusel + time/difficulty inline

**Qué hace:** recipe detail tiene foto hero grande (carrusel si hay ≥2), tiempo cocción + dificultad inline debajo del title, ingredients scroll hacia abajo.

**Por qué funciona:** info jerárquica — primero visual, luego logística, luego instrucciones.

**Decisión RIAL:** ⚪ ya hecho Fase 1 multi-media (`58aa9c7`). HeroGallery + MediaLightbox + VideoSection cubren el patrón.
**Implementado en:** `src/features/recipes/components/{HeroGallery,MediaLightbox,VideoSection}.tsx`.

### 5.2 🟢 Paprika — import URL con parser heurístico

**Qué hace:** pega URL → parser extrae title, ingredientes, pasos, tiempo. Funciona con >1000 sitios (lista pública).

**Por qué funciona:** cierra el flujo "vi una receta en una web → quiero guardarla en mi book" sin reescribir.

**Decisión RIAL:** 🟢 parcial — `ImportRecipeURL.tsx` tiene un parser básico + `inferSuitableFor(title)`. Falta: detectar `og:video` + auto-populate `videoUrl` desde TikTok/IG/YouTube embeds. Pospuesto Q6 (requiere Edge function `og-fetch`).
**Implementado en:** `src/features/recipes/screens/ImportRecipeURL.tsx`.

### 5.3 🟡 Cookpad — video como citizen de primera clase

**Qué hace:** recetas pueden tener video 60s incrustado en cada paso. Pasos con audio opcional.

**Por qué funciona:** video por paso reduce abandono a media receta.
**Por qué hay que adaptar:** almacenamiento + bandwidth costoso. Cookpad lo absorbe a escala, RIAL aún no.

**Decisión RIAL:** 🟡 — Fase 1 multi-media permite video global por receta (YouTube iframe o link externo). Video por paso es post Q6 Storage bucket.

### 5.4 🔴 MyFitnessPal Recipes — paywall recipe import

**Qué hace:** parser URL recetas está en Premium ($9.99/mo).

**Por qué falla:** el usuario free ve el botón, lo clickea, paywall. Breaker de intent.

**Decisión RIAL:** 🔴 evitar. Import URL es core feature, no paywalleable. La alternativa premium es "AI auto-plan semana con receta importada".

---

## 6. Progreso + Wellness

### 6.1 🟢 MacroFactor — weight trend con expected vs actual

**Qué hace:** Progress muestra línea de peso real + línea expected basada en TDEE semanal ajustado. Diferencia visual entre "estás progresando" vs "estás meseta".

**Por qué funciona:** usuario deja de mirar números diarios (que fluctúan por agua) y mira trayectoria.

**Decisión RIAL:** 🟢 — RIAL tiene `WeightTrendCard` pero no "expected line". Añadir post-Q15 cuando TDEE adaptativo esté wired.
**Implementado en:** `src/features/wellness/components/WeightTrendCard.tsx`.

### 6.2 🟢 Whoop — recovery + strain como dashboard único

**Qué hace:** home Whoop es una tarjeta "recovery score" (0-100) + strain actual + sleep — todo en un glance.

**Por qué funciona:** reduce 10 metrics a 2 números accionables.

**Decisión RIAL:** 🟡 no replicar (RIAL no mide recovery biológico). Pero **aplicar el principio** al Home RIAL: un solo número "Real Feel del día" destacado + macros secundario. Considerar para Q15 ICP-adaptive widgets.

### 6.3 🟢 Daylio — mood logging con 3 taps

**Qué hace:** emoji scale 1–5 + tags predefinidos (energetic, anxious, calm) + note opcional. Log completo en 5s.

**Por qué funciona:** fricción mínima → uso diario real.

**Decisión RIAL:** ⚪ ya hecho en RealFeelDiary. Log toma ~8s actualmente — validar que no suba. Tags predefinidos bien. Fuente validada: Q14 audit.
**Implementado en:** `src/features/wellness/screens/RealFeelDiary.tsx`.

### 6.4 🔴 Noom — psicología coaching gatekept

**Qué hace:** lecciones CBT son Premium+. User free ve título y bloqueo.

**Por qué falla:** el hook (value prop) está detrás del paywall; retention free es terrible.

**Decisión RIAL:** 🔴 evitar. AI Coach debe dar valor real en free tier (respuestas breves, hints sobre Real Feel). Premium desbloquea "AI Coach + historial conversación + plan personalizado", no "AI Coach existe".

---

## 7. Paywall / pricing

### 7.1 🟢 MacroFactor — "try for free 7 days, cancel anytime"

**Qué hace:** reverse trial — user usa todo Premium 7 días, luego se bloquea. Mostrar el valor antes de pedir.

**Por qué funciona:** conversion 15-20% post-trial según blogs industria.

**Decisión RIAL:** 🟢 — adoptar reverse trial cuando RevenueCat esté stable. Hoy RIAL free + Pro sin trial. Q17+.

### 7.2 🟡 Cal AI — $2.49/mo low-friction pricing

**Qué hace:** pricing por debajo del "de acuerdo, $3 por eso está bien". Low price, high volume.

**Por qué funciona:** atrae usuarios que nunca pagarían $10/mo. Escala por volumen.
**Por qué adaptar:** margen muy estrecho. Solo funciona con unit economics bajos (sin humanos, sin storage pesado).

**Decisión RIAL:** 🟡 — considerar un tier "Lite" €2.99/mo (solo AI Coach contextual + recetas ilimitadas, sin analytics ni planner avanzado). Segmentación de pricing.

### 7.3 🔴 Noom — opaque pricing

**Qué hace:** no muestra precios hasta completar onboarding de 10 min + email. Entonces pitch de $59/mes con descuento.

**Por qué falla:** reviews App Store con ratings 1* específicas por esto. Legal presión creciente en EU + reviews.

**Decisión RIAL:** 🔴 evitar absolutamente. Pricing visible en landing + SettingsPro desde primer día.

### 7.4 🔴 MyFitnessPal — barcode paywall

**Qué hace:** barcode scanner detrás de Premium $9.99/mo.

**Por qué falla:** user expectativa es que barcode es gratis (MFP lo dio gratis durante 10 años). Decisión generated backlash 2024-25.

**Decisión RIAL:** 🔴 evitar. Barcode es MVP mínimo free. `rial-positioning.md` §4.5 lo documenta como moat.

---

## 8. Social / comunidad

### 8.1 🟢 MyRealFood — comunidad receta-centric

**Qué hace:** feed de recetas reales posted by users, filtrable por Real Score, comunidad concentrada en "qué cenaste real hoy".

**Por qué funciona:** tema claramente delimitado → UGC alta calidad. Evita drift a generic fitness influencer content.

**Decisión RIAL:** 🟢 — RIAL tiene feed social (`src/features/social/`). Roadmap Q22+: filtros por Real Score + creadores curados. No abrir UGC completa sin moderation infra.

### 8.2 🟡 Fitia — nutricionistas verificados

**Qué hace:** badge "nutricionista verificado" en creadores + content reviewed. Autoridad explícita.

**Por qué funciona:** trust signal. Especialmente importante en LatAm donde influencers pueden sesgar.

**Decisión RIAL:** 🟡 — roadmap post-GTM. Requiere proceso verificación manual, no escala sin operaciones.

### 8.3 🔴 Samsung Food + Cookpad — feed sin curación

**Qué hace:** UGC masivo sin filtro calidad — cualquiera postea, cualquier cosa.

**Por qué falla para RIAL:** RIAL promete "real food" — UGC masivo diluye el promise. MyRealFood curates; Cookpad no.

**Decisión RIAL:** 🔴 evitar. Social layer de RIAL requiere curaduría editorial mínima.

---

## 9. Accesibilidad + mobile HIG

### 9.1 🟢 Apple Fitness+ — HIG-compliant tap targets 44×44

**Qué hace:** todos los botones + controles pasan HIG minimum 44×44. Mobile-first rigor.

**Decisión RIAL:** ⚪ ya hecho Q15.5 + Q16 walkthrough — 4 sub-HIG tap targets fixed. ESLint `no-restricted-syntax` bloquea nuevos regresiones. Reviewer-rial checklist incluye HIG check.

### 9.2 🔴 Plan to Eat — drag UX no-mobile

**Qué hace:** drag targets 28×28, falla en móvil 60% casos según reviews.

**Decisión RIAL:** 🔴 evitar drag en primary input. `RecipeDaySelectorSheet` es tap-based. ADR-002 + Q16 previenen regresión.

### 9.3 🟢 WCAG AA contrast baseline

**Qué hace:** MFP + Lifesum + Yazio cumplen WCAG AA contrast 4.5:1 en texto normal.

**Decisión RIAL:** 🟡 cumplido excepto `theme-orange-light` (on-surface-variant 4.4:1). Q17 debe cerrar esto. Tracked en `docs/ai/state.md` risks.

---

## 10. Anti-patterns transversales — "breadth trap" + "AI overreach"

### 10.1 🔴 Breadth trap (Samsung Food + WHOOP Pivot)

**Síntoma:** agregar features para cubrir competencia sin integrarlas al flow. Cada feature existe pero ninguna se encadena a otra.

**Ejemplo:** Samsung Food tiene smart cooking (IoT horno) + recipes + shopping + pantry + fridge scan. Ninguno refuerza al otro; retention 30d bajo.

**Regla RIAL:** toda feature nueva debe explicar en el plan cómo **cierra un loop existente** (no cómo abre uno nuevo). Si no cierra loop, se pospone.

### 10.2 🔴 AI overreach (Cal AI + Simple)

**Síntoma:** AI hace todo, usuario hace nada. Parece mágico pero genera desconfianza cuando falla (y falla).

**Ejemplo:** Cal AI estima macros pero ±30% error — usuario casual no nota, power user sí. MacroFactor evita AI para macros (usa fórmula determinística) y gana trust.

**Regla RIAL:** AI sugiere, usuario decide. Las decisiones críticas (macros log, goal, peso) son inputs explícitos. AI Coach contextual sí; AI que logea tu comida sin tu confirmación, no.

---

## 11. Patrones RIAL-únicos ya implementados (para no perder)

| Patrón | Dónde | Valor |
|---|---|---|
| **MealSlot multi-valued** | `src/types/recipe.ts` + `meal-slot.ts` | Q19 |
| **Real Feel diary** | `src/features/wellness/screens/RealFeelDiary.tsx` | Diferenciador wellness |
| **Weekly reflection inline** | `src/features/wellness/components/InlineReflection.tsx` | Post-merge Q11 |
| **Hero gallery + lightbox + video híbrido** | `src/features/recipes/components/{HeroGallery,MediaLightbox,VideoSection}.tsx` | Fase 1 multi-media |
| **PhotoUploader con compresión** | `src/features/recipes/components/PhotoUploader.tsx` + `src/lib/imageCompress.ts` | Fase 2 |
| **Factory-handler pattern** | `src/features/*/handlers/` + AppStateContext | AUDIT-TAB-2026-04-18 |
| **Seed versioning con merge strategies** | `src/lib/seedVersion.ts` | Q-series |
| **ESLint design-system guardrails** | `eslint.config.mjs` `no-restricted-syntax` | Q15.5 |

---

## 12. Patrones pendientes de adoptar (roadmap priorizado)

| Prioridad | Patrón | Fuente | Sprint propuesto |
|---|---|---|---|
| Alta | Recent foods + meal templates (Add Meal) | MFP §3.1 | Q15 |
| Alta | Expected weight trend line | MacroFactor §6.1 | Q15 |
| Alta | Real Score en recipe cards | MyRealFood §2.2 | Q21 |
| Media | AI Coach contextualizado (inject user context) | Simple + Cronometer Oracle §6.2 analog | Q20+ |
| Media | Reverse trial 7d | MacroFactor §7.1 | Q17+ |
| Media | Pantry-aware recipe matcher | Yummly §2.1 | Q15+ |
| Media | AI auto-plan semana con context ES | Eat This Much §4.3 | Q20+ |
| Baja | Import URL con og:video detection | Paprika §5.2 | Q6 (requiere Edge fn) |
| Baja | Creator badge nutricionista verificado | Fitia §8.2 | Post-GTM |

---

## 13. Referencias cruzadas

- Fichas por competidor: [`deep-dives/`](deep-dives/)
- Clasificación completa: [`competitors-index.md`](competitors-index.md)
- Comparación feature-a-feature: [`feature-matrix.md`](feature-matrix.md)
- Posicionamiento y moats: [`rial-positioning.md`](rial-positioning.md)
- Rankings actuales: [`app-store-rankings.md`](app-store-rankings.md)
- ADRs arquitectura RIAL (patrones repo-internos): [`docs/adr/`](../adr/)
