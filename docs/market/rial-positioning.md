# RIAL — posicionamiento, ICP y gaps defensibles

> Síntesis estratégica a partir de `competitors-index.md` + `feature-matrix.md` + `ux-patterns.md` + archivo histórico `docs/archive/RIALFOOD-MARKET-RESEARCH-2026.md`.
> Última revisión: **2026-04-17**. Actualizar cada vez que cambie el ICP o el roadmap — esta es la referencia de producto para decisiones "¿lo hacemos o no?".

## 1. Posicionamiento en una línea

> **RIAL es la app española de comida real que une tracker-light + recetas propias + planner semanal + AI Coach en una sola experiencia, con cultura gastronómica mediterránea y sin las tácticas agresivas de paywall de MyFitnessPal/Noom.**

Tres ejes que definen la promesa:

1. **"Real food, real feel"** — calidad de alimento (NOVA-aware) + métrica subjetiva de bienestar (Real Feel) sobre el conteo calórico. Frente a MFP (obsesión caloría) y Noom (obsesión psicológica), RIAL prioriza lo que el usuario siente comiendo comida identificable.
2. **All-in-one sin breadth trap** — un único flujo cocinar → planificar → trackear → revisar — donde las piezas se hablan entre ellas. Samsung Food y Yummly demuestran cómo la amplitud sin integración mata retention; RIAL integra deliberadamente pocas piezas pero profundas.
3. **Nativamente español (+ i18n EN como segunda lengua)** — no es un MFP traducido. Cocina mediterránea, recetas ES auténticas, cultural fit inmediato para España + LatAm hispanohablante.

## 2. ICP primarios — Clara / Marcos / Ana

Canónicos en `src/features/profile/data/demo-personas.ts`. Cada ICP tiene 60 días de fixture data para probar correlaciones y onboarding.

### 2.1 Clara — Cut / recomposición corporal

| Atributo | Valor |
|---|---|
| Goal interno | `cut` |
| Activity | `actActive` (4–5 entrenamientos/sem) |
| Target | Reducir grasa sin perder músculo, ~-2kg en 3 meses |
| Motivación | Se ve bien pero quiere verse mejor; bodas/verano/evento |
| Comportamiento esperado | Log diario, trackeo estricto semanas 1–4, relajación después |
| Feature magnet | Macro tracker + peso + Real Feel + recetas saciantes alta proteína |
| Risk de churn | Frustración meseta semanas 5–6; Progress tab tiene que mostrar victoria no calórica (energía, bienestar) |

**Competitors nativamente Clara:** MyFitnessPal (demasiado clínico), MacroFactor (demasiado nerd), Lifesum (cerca pero UI menos personal).
**Lo que RIAL le aporta y nadie más:** Real Feel + recetas mediterráneas saciantes validadas por proteína / kcal ratio, sin guilt-shaming.

### 2.2 Marcos — Muscle / bulk

| Atributo | Valor |
|---|---|
| Goal interno | `muscle` |
| Activity | `actVeryActive` (6+ entrenamientos/sem, compound lifts) |
| Target | +0.3–0.5kg/sem, volumen muscular |
| Motivación | Powerlifter / bodybuilder natural, progreso numérico |
| Comportamiento esperado | Log hipervigilante, batch cooking semanal, macros precisos |
| Feature magnet | Macro preciso + proteína/kg target + batch cooking planner + weight trend scientific |
| Risk de churn | Si percibe que la app no es "serious enough" (Noom / Lifesum lo pierden aquí) |

**Competitors nativamente Marcos:** MacroFactor (dominante) + MFP Premium (fallback histórico).
**Lo que RIAL le aporta:** TDEE adaptativo (pendiente Q6+), batch cooking logic con leftover reuse, recetas volumen calórico fácil (pasta + proteína + aceite), creator-led content fitness ES.

### 2.3 Ana — Health / mantenimiento

| Atributo | Valor |
|---|---|
| Goal interno | `health` |
| Activity | `actActive` |
| Target | Mantener peso, mejorar energía, familia come sano |
| Motivación | Madre / caregiver; busca reducir procesados en casa |
| Comportamiento esperado | Usa recetas + planner más que tracker; ocasional log |
| Feature magnet | Recetas kid-friendly + shopping list auto + planner familiar + pantry |
| Risk de churn | Logging friction → abandona si cada comida requiere input |

**Competitors nativamente Ana:** Mealime (cerca pero sin tracker) + Ollie (family-first, US-only) + MyRealFood (real-food identity ES).
**Lo que RIAL le aporta:** híbrido planner + tracker opcional (Real Feel no-log fallback), integración pantry → shopping list, escalado familiar (pendiente roadmap).

## 3. ICP que RIAL NO persigue v1

Aceptar que **tres ICPs = foco máximo**. NO estamos construyendo para:

- **Quantified-self extremo** (Cronometer/Oura user) — micronutrientes 80+ ni integración CGM. Demasiado nicho, requiere precisión científica que RIAL no aporta v1.
- **Dieters medicalizados GLP-1** (Noom Med user) — medicalización + prescripción de fármaco no es RIAL. Brand issue.
- **Pure meal-prep families US-style** (Ollie user) — diferente cultura gastronómica, pantry photo scan, integraciones Walmart/Kroger. Pospuesto a Ana global v2.
- **Running/workout-first** (Strava/Peloton user) — fitness es contexto, no core. RIAL integra wearables (Apple Health) pero no es tracker workout.

## 3.1 Priorización competitiva (2026-04-17)

De las 35 apps en `competitors-index.md`, scorecard 6-ejes en [`priority-review.md`](priority-review.md) selecciona **8 competidores** que concentran el foco del roadmap 2026:

1. **MyRealFood** — amenaza #1 en ES (real-food identity compartida).
2. **Yazio** — líder europeo 95M+ usuarios (benchmark freemium).
3. **Fitia** — crecimiento +16% Jan 2026 en LatAm (decide Q8 vs Q10 entry).
4. **Lifesum** — contra-ejemplo (Trustpilot 1.7★ pese a 65M users).
5. **MyFitnessPal** — benchmark histórico + Cal AI integrado marzo 2026.
6. **MacroFactor** — algoritmo TDEE adaptativo (moat pendiente Q10+).
7. **Paprika** — precedente MealSlot multi-valued (valida Q19).
8. **Bevel** — modelo pricing free-generous + single premium (north-star post-Q6).

Cada ficha top lleva **Hard metrics** + **Pantallas principales con mapeo a `src/`** para que las decisiones de copiar/evitar/ignorar sean ejecutables, no abstractas.

## 4. Gaps defensibles (moat)

Del análisis de 35 apps indexadas, RIAL tiene 5 moats que son viables + defendibles en horizonte 18 meses:

### 4.1 Moat #1 — Real Food + Real Feel narrativa combinada

**Nadie más los une.** MyRealFood hace real-food en ES; Daylio hace mood tracker. RIAL combina calidad ingrediente + mood post-ingesta + tolerance logs → aparece el "gráfico de cómo me siento en función de lo que como" que ninguna app muestra.

**Defensibilidad:** medio-alta. Conceptualmente copiable (Noom podría añadirlo), pero RIAL llega primero con dataset ICP-ES y nombre acuñado. First-mover advantage.

### 4.2 Moat #2 — Cocina española / mediterránea como base de datos

Cobertura alimentos típicos ES (bonito, sobrasada, pulpo a la gallega, lentejas pardinas, queso manchego) y raciones reales (no "1 cup of X"). Sin esta cobertura, tracker no-ES se siente foráneo.

**Defensibilidad:** alta. Curación manual durante 6–12 meses es barrera real. MFP tiene la data pero no la curación ES; Lifesum usa fuentes genéricas nórdicas; Fitia es auténtico LatAm pero no ES.

### 4.3 Moat #3 — Planner semanal con MealSlot multi-valued

Q19 (meal-taxonomy) introdujo `suitableFor: MealSlot[]` — precedente único Paprika/PlateJoy entre 19 competidores analizados. La separación "apta para" (propiedad receta) vs "slot de consumo" (decisión al planificar) es literalmente única en RIAL entre apps ES.

**Defensibilidad:** media. Una vez que usuario tiene 20 recetas clasificadas, migrar es fricción. Copiable pero requiere pivoteo de data model en competencia.

### 4.4 Moat #4 — AI Coach contextualizado al usuario + cultural fit

Pendiente Q6+. La ventaja: AI Coach inyecta **perfil usuario + plan semanal + últimas entradas Real Feel + preferencias dietéticas + idioma**. Hoy (pre-Q6) no lo hace — es chatbot genérico con prompt Gemini. Post-Q6 debe ser coach contextualizado.

**Defensibilidad:** baja una vez otros lo hagan. Simple (AI coach Avo™) ya camina esa línea; la ventana para RIAL es el cultural fit ES. No competidor ES tiene AI coach sofisticado.

### 4.5 Moat #5 — Freemium generoso con barcode libre

MyFitnessPal puso barcode tras paywall $19.99/mo — error de ejecución que RIAL puede capitalizar. Barcode gratis en RIAL free + i18n ES + recetas reales = propuesta freemium percibida como "más generosa que MFP y más casual que Cronometer".

**Defensibilidad:** baja estructural pero efectiva en GTM. MFP puede revertir en cualquier momento; la ventana es 2026–2027.

## 5. Gaps NO defensibles (no invertir)

- **Photo recognition comida.** Cal AI ya fue adquirida por MFP → será parte del stack dominante global. RIAL puede añadirlo pero como feature, no como identity.
- **Integración CGM / lab results.** Requiere partnerships (Dexcom, Levels) y validación clínica. Fuera de alcance 2026.
- **Wearable propio.** Whoop / Oura ya juegan en otra liga. RIAL integra, no compite.
- **Recipe sharing masivo / creator monetization**. Cookpad tiene 60M; TikTok tiene la discovery. RIAL puede hacer creator-led content pero no competir en UGC masivo.

## 6. MVP competitivo mínimo (ya cumplido a 2026-04-17)

**Para estar en top-10 Health & Fitness España,** una app debe tener estos 6 features. Todos están en RIAL v1.5.25:

| Feature | Estado RIAL | Notas |
|---|---|---|
| Barcode scanner | ✓ | OpenFoodFacts, funcional en `BarcodeScanner.tsx` |
| Food log con búsqueda rápida | ✓ | AddMeal con fuzzy match Q1 |
| Macros visibles (P/C/G) | ✓ | Hero NutritionHero post-audit Q16 |
| Daily calorie target | ✓ | Calculado de perfil en Onboarding |
| Gráfico progreso peso 7d+ | ✓ | Progress tab + ProgressPreviewCard Home |
| Onboarding personalizado | ✓ | Goal + altura + peso + actividad + dieta |

**Features top-5 adicionales (RIAL cumple):**
- ✓ Recetas propias (`Cocina` tab) — lead en experiencia
- ✓ Recetas multi-media fotos + video (Fase 1 + Fase 2 2026-04-17)
- ✓ Import recetas URL (`ImportRecipeURL.tsx`)
- ✓ Planner semanal con MealSlot (Q19)
- ✓ Ayuno intermitente (FastingTimer)
- ✓ AI Coach (proxy Gemini, pendiente contextualización Q6)
- ✓ Real Feel diary / wellness logs
- ✓ Body snapshot + photos

**Features gap a cerrar antes de push GTM serio:**
- ❌ Sync cross-device (Q6 — Supabase)
- ❌ TDEE adaptativo (pendiente — requiere data mínima usuario)
- ❌ Photo recognition comida (pendiente — requiere modelo)
- ❌ AI Coach contextualizado (Q6+)

## 7. Cambios mayores abril 2026 y respuesta RIAL

### 7.1 MyFitnessPal adquiere Cal AI (marzo 2026)

**Lo que cambia:** photo-to-macros queda consolidado con el líder histórico. La narrativa "AI-first scan" ya no es diferenciador puro — será commodity en MFP Premium.

**Respuesta RIAL:**
1. **No** replicar Cal AI; sería correr detrás.
2. **Sí** mantener MVP mínimo (barcode + log rápido + foto manual) pero posicionar el diferenciador lejos de "AI fotografía". Narrativa: "RIAL no necesita que le saques fotos para que te entienda".
3. AI Coach contextual + Real Feel + planner se convierten en el frente competitivo; photo recog es feature of parity.

### 7.2 Wearables convergen con nutrición (Whoop Healthspan + Oura Dexcom Stelo)

**Lo que cambia:** Whoop y Oura pasan de tracker a plataforma biomarkers + CGM + coach. Capturan el user-job "optimización total del cuerpo".

**Respuesta RIAL:**
1. **No** construir wearable propio ni CGM propio.
2. **Sí** integrar Apple Health / Samsung Health / Google Fit para datos pasivos (peso, pasos, sueño). Q6+ obligatorio.
3. Narrativa: RIAL es complementario al wearable, no competencia. "Oura mide, RIAL traduce qué comer".

### 7.3 Simple (Serie B $35M, Kevin Hart VC)

**Lo que cambia:** más capital entra a AI-coach-first nutrition. Esperar más apps empujando AI coach como core.

**Respuesta RIAL:**
1. **No** escalar AI coach a comando central (requiere infraestructura y model cost que no tenemos).
2. **Sí** inyectar contexto usuario sistemáticamente (hoy AI Coach no lo hace — gap Q6).
3. Diferenciar por cultural fit ES + transparencia sobre qué sabe el coach de mí.

## 8. Hoja de ruta alineada con posicionamiento

Sprints prioritarios post Q19 + Fase 2 multi-media:

| Sprint | Feature crítico | Aporte al moat |
|---|---|---|
| Q6 | Supabase sync cross-device + recipe-photos bucket | Tabla stakes — sin esto no hay GTM real |
| Q15 | ICP-adaptive Progress widgets + before/after photo compare | Profundiza "Real Feel" moat |
| Q16 | Design system codemod sprint | Paridad premium con Lifesum / Noom |
| Q17 | CSP + responsive tablet + WCAG AA | Pre-GTM gate |
| Q20+ | AI Coach contextualizado | Cierra moat #4 antes de que Simple/Alma masifiquen |
| Q21+ | Import URL auto-detect video (TikTok/IG/YT) | Cierra gap "social → plan pipeline" |
| Q22+ | Apple Health / Samsung Health / Google Fit | Posiciona como integrador wearable-neutral |

## 9. Pricing propuesto (alineado con landscape)

| Tier | Precio | Features | Referencia mercado |
|---|---|---|---|
| **Free** | 0 | Tracker completo, barcode, recetas <20, 5 meals/semana planner, Real Feel, body snapshot | Más generoso que MFP Free (MFP limita barcode + recetas) |
| **Pro** | 6.99€/mes · 49.99€/año | Recetas ilimitadas, planner 7d, import URL, AI Coach, analytics Real Feel | Alineado MFP Premium ($9.99/mo), por debajo Cronometer Gold |
| **Family** | 9.99€/mes · 79.99€/año | Multi-profile, household scaling, shopping list compartida | Alineado Fitia Family ($89.99/año) |
| **Pro AI** *(v2)* | 14.99€/mes | Photo recognition, AI plan generation, wearable sync | Alineado Bevel AI coach tier |

Free tier debe **mostrar el loop completo** (plan → cook → log → review) al menos 7 días antes de paywall — reverse-trial model. Paywall en depth features (analytics, AI coach avanzado, import URL) no en core.

## 10. Riesgos estratégicos a monitorizar

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| MFP + Cal AI lanza photo scan gratis | Alta | Medio | Narrativa RIAL no depende de photo scan |
| Yazio llega masivamente a ES con campaña | Media | Alto | Acelerar MyRealFood-tier retention antes que Yazio invierta en ES |
| Bevel escala all-in-one con equity suficiente | Media | Alto | RIAL debe cerrar integración Apple Health / wearables Q22+ |
| Simple copia Real Feel con AI coach inyectado | Media | Medio | First-mover acuñar "Real Feel" como brand ES |
| Noom Med (GLP-1) absorbe segmento Clara | Baja | Medio | Clara no es target Noom medicalizada; RIAL es alternativa "sin fármacos" |
| Google / Apple lanzan native nutrition | Baja | Alto | Evento extremo; plan B sería pivot a creator-content layer |

## 11. Métricas de éxito (north-star + lagging)

**North-star candidate (propongo validar con stakeholders):**
> % usuarios activos semanalmente que completan el loop (plan → cook al menos 1 receta → log al menos 3 días → weekly review).

Este loop es lo que ninguna otra app captura completo. MFP no tiene plan→cook; Mealime no tiene log→review; Noom no tiene recetas propias.

**Lagging metrics:**
- Retention 30d, 90d (targets TBD; industry median H&F 30d retention ~8-15%)
- ARR per paying user (targets ~€50-70 basado en benchmarks Yazio / Lifesum)
- Free → Pro conversion (targets 5-10% basado en benchmarks Lose It / FatSecret)

## 12. Referencias

- Competitors index completo: [`competitors-index.md`](competitors-index.md)
- Matriz feature-a-feature: [`feature-matrix.md`](feature-matrix.md)
- Patrones UX concretos: [`ux-patterns.md`](ux-patterns.md)
- Rankings tiendas: [`app-store-rankings.md`](app-store-rankings.md)
- Fichas deep-dive: [`deep-dives/`](deep-dives/)
- Demo personas canónicas: [`src/features/profile/data/demo-personas.ts`](../../src/features/profile/data/demo-personas.ts)
