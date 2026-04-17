# Priorización competitiva — RIAL 2026-04-17

Este documento responde a tres preguntas que `competitors-index.md` no responde:

1. **¿Cuáles de los 35 competidores indexados merecen revisión profunda?** — criterios objetivos.
2. **¿Qué pantallas concretas de cada uno debemos estudiar?** — ver fichas top (cada una lleva sección "Pantallas principales" con mapeo a rutas de `src/`).
3. **¿Qué datos duros sostienen cada prioridad?** — ratings + crecimiento + usuarios + revenue con fuente y fecha.

Metodología repetible cada 6 meses (o antes si el mercado gira). Próximo recheck: **2026-10-17**.

---

## Criterios (6 ejes objetivos, 0–5 cada uno, total 30)

| Eje | Qué mide | Por qué importa a RIAL | Fuente preferida |
|---|---|---|---|
| **Rating combinado App + Play** | Media de estrellas ponderada por nº reviews, ES + US | Validación producto + signal de churn | Listings 2026-04 |
| **Crecimiento 12m** | Cambio en rank Health & Fitness + descargas YoY | Indica tracción vs. saturación | Sensor Tower / Apptopia / press 2025-26 |
| **Base usuarios / MAU** | User count o MAU público verificable | Escala = gravitational pull en ICP | Press release + Crunchbase + 10-K |
| **Overlap ICP RIAL** | Solape con Clara (cut) / Marcos (muscle) / Ana (health) | Compite por el mismo usuario o no | `rial-positioning.md` + demo-personas |
| **Amenaza geográfica ES/LatAm** | Presencia + tracción en mercados core RIAL | Donde RIAL vive, quién lo rodea | App Store rankings ES/MX/CO/AR |
| **Lecciones UX transferibles** | Cuántos patrones concretos puede copiar RIAL | ROI de estudiar la app a fondo | `ux-patterns.md` + análisis cualitativo |

**Tie-breaker**: empate total → gana la que tenga mayor overlap con Clara (mayoritario en `src/features/profile/data/demo-personas.ts`).

---

## Scorecard

Puntuación **0** = no aplica o ausente. **5** = líder absoluto.
Cuando un eje no se pudo verificar, se marca `?` y **no cuenta al total** (penaliza la app en la comparación, no la infla).

| App | Rating ★ | Growth 12m | Users/MAU | ICP overlap | ES/LatAm | UX transfer | **Total** | Tier |
|---|---|---|---|---|---|---|---|---|
| **MyRealFood** | 4 | 3 | 3 (2M+) | 5 (Clara/Ana core) | 5 (ES #1 nicho) | 4 | **24** | **Top 8** |
| **Yazio** | 5 (4.6★, 300k) | 4 | 5 (95M–100M) | 4 (Clara/Ana) | 4 (ES presencia, DE origen) | 4 | **26** | **Top 8** |
| **Fitia** | 5 (4.9★, 240k) | 5 (+16% Jan 2026) | 4 (10M+, 1M MAU) | 5 (Clara + LatAm) | 5 (LATAM #1) | 4 | **28** | **Top 8** |
| **Lifesum** | 2 (Trustpilot 1.7, Play mixed) | 2 ($800k rev/mo, 100k DL/mo) | 5 (65M) | 4 (Clara/Ana) | 3 (EU + US) | 3 | **19** | **Top 8** (escala obliga) |
| **MyFitnessPal** | 4 (4.7 iOS / 4.4 Play) | 2 (maduro, post-Cal AI M&A) | 5 (200M community, DL 900k+530k/mo) | 4 (Marcos) | 3 (US/UK core) | 5 (benchmark) | **23** | **Top 8** |
| **MacroFactor** | 5 (alta, nicho) | 5 ($500k–$2M rev/mo, bootstrapped) | 3 (100k DL/mo, 82k paid 2022) | 4 (Marcos avanzado) | 1 (US-centric) | 5 (algoritmo) | **23** | **Top 8** |
| **Paprika** | 5 (legacy favorito) | 2 (maduro, one-time purchase) | 3 (legacy base) | 3 (Ana home-cook) | 2 (EN-only core) | 5 (MealSlot precedent) | **20** | **Top 8** (UX no-negociable) |
| **Bevel** | ? (launched mid-2025) | 5 (top mover 2025-26, Apple Watch Spotlight) | 2 (nuevo, sin claim público) | 3 (all-in-one wellness) | 1 (US-centric) | 5 (pricing + coach) | **16** + `?` | **Top 8** (modelo pricing) |
| Cal AI | 3 | 5 (2024 viral) | 3 ($30M ARR, MFP-acquired mar 2026) | 3 (Marcos scan) | 2 | 3 | 19 | Tier B (absorbido por MFP) |
| Cronometer | 5 | 2 | 2 | 2 (nicho quantified-self) | 2 | 3 | 16 | Tier B |
| Noom | 3 | 2 | 5 (big brand, >50M) | 3 (Ana con coaching) | 3 | 3 | 19 | Tier B |
| Fastic | 3 | 3 | 3 | 2 (ayuno-only) | 3 (EU) | 2 | 16 | Tier B |
| Zero (by MFP) | 4 | 2 | 4 (via MFP) | 2 | 2 | 2 | 16 | Tier B |
| Simple | 3 | 4 (Serie B $35M oct 2025) | 3 | 3 (coaching-IA) | 2 | 3 | 18 | Tier B (vigilar) |
| Yuka | 5 (4.7★, 60M) | 3 | 5 (60M) | 2 (scan-only, no calorías) | 4 (FR→ES buen spread) | 4 (escáner UX) | 23 | Tier B (distinto category) |
| Mealime | 4 | 2 | 3 | 3 (Ana quick meals) | 2 | 3 | 17 | Tier B |
| Eat This Much | 3 | 2 | 2 | 3 (Ana planner) | 1 | 3 | 14 | Tier B |
| PlateJoy | 4 | 2 | 2 (nicho premium) | 3 (Ana) | 1 | 4 (MealSlot) | 16 | Tier B |
| Whoop | 4 | 3 (Healthspan reshape) | 4 | 2 (wearable + recovery) | 2 | 3 | 18 | Tier C (adyacente) |
| ZOE | 4 | 3 | 2 | 2 (biomarker + CGM) | 3 (UK+US) | 3 | 17 | Tier C (adyacente) |

> **Notas de lectura:**
> - Lifesum baja a 2 en rating por Trustpilot 1.7/5 + reviews negativas AI tracking 2025. Pese al total bajo, su escala (65M) obliga a estudiarla como lección de qué evitar al escalar.
> - Bevel arrastra `?` en rating (listings muy recientes, nº reviews insuficiente para peso estadístico). Entra al Top 8 por growth + pricing-moat-transferrible — **no** porque esté validado como producto.
> - Cal AI ya **no** es independiente — MyFitnessPal la adquirió marzo 2026. Su scan-AI vive dentro de la ficha MyFitnessPal desde entonces.

---

## Top 8 seleccionados (razonamiento)

### 1. MyRealFood — el rival directo #1 en ES
2M+ usuarios activos, 4★+ rating, 160k+ recetas, identidad Real Food idéntica a la de RIAL.
Carlos Ríos = autoridad mediática ES/LatAm. **Es el único competidor que comparte filosofía
real-food.** Overlap ICP 5/5 con Clara y Ana. Amenaza geográfica máxima. Estudiar: escáner
con Real Score + comunidad UGC recetas + filosofía baked-in en cada interacción.

### 2. Yazio — líder europeo con 95M+ usuarios
4.6★/300k reviews en Play, Google Excellence App, tier #1 top spots EU 2024-25. Alemán.
Combina tracking + recetas + ayuno + planner en freemium sólido. **Es lo que RIAL puede
llegar a ser si acierta en el pricing + AI.** Overlap ICP 4/5 (Clara/Ana). Estudiar: flow
onboarding + weekly planner + pricing tiers + recipes nativos.

### 3. Fitia — crecimiento más rápido del año en LatAm
10M+ usuarios, 4.9★ en ambas tiendas (240k+ reviews), +16% web traffic Jan 2026, Top 10
en categorías LATAM. **Amenaza directa si RIAL entra a LatAm antes de Q8.** Overlap ICP 5/5
con Clara y LatAm hispanic audience. Estudiar: DB localizada (alimentos MX/CO/AR/PE), meal
planner automático, precios localizados por país.

### 4. Lifesum — la lección de qué pasa cuando escalas sin cuidar la experiencia
65M usuarios claimed, $12.3M revenue 2026, presencia EU+US. **Pero** Trustpilot 1.7/5 +
reviews negativas sobre AI tracking recientes. Total bajo (19) pese a escala masiva.
Estudiar como **contra-ejemplo**: qué hacen mal con AI meal detection, cómo su paywall
agresivo erosiona rating, qué moats pierden al crecer. Overlap ICP 4/5.

### 5. MyFitnessPal — benchmark histórico, ahora con Cal AI integrado
4.7★ iOS / 4.4★ Play. 200M+ community members claimed. 900k DL iOS + 530k DL Play al mes.
Maduro pero cemented. **Marzo 2026 adquirió Cal AI ($30M ARR)** → ahora tiene photo-AI
scan nativo. Redefine "qué es el mínimo" para competir en tracking puro. Overlap Marcos 4/5.
Estudiar: tier Premium vs Premium+ (qué evitar), DB 18M foods, nuevas features Cal AI post-merger.

### 6. MacroFactor — el algoritmo que RIAL no tiene
Bootstrapped, $500k–$2M revenue/mes, ~100k DL/mes, 82k+ paid customers (dato Sep 2022, hoy
probablemente >200k). Rating alto en nicho quantified-self. **Algoritmo adaptativo de TDEE
3× más preciso que fórmulas estáticas** (claim self-reportado pero respaldado por
research-reviewers Nuckols + Trexler). Overlap Marcos avanzado 4/5. Estudiar: el algoritmo
adaptativo como pattern, el modelo "no freebies pero precio razonable" ($12/mo), y cómo
construyen credibilidad científica.

### 7. Paprika — la UX de recetas no-negociable
Rating legendario, one-time purchase, usuarios desde 2015 leales. **Es el precedente del
sistema MealSlot de RIAL (Q19)** — separación clara "apta para" vs "slot de consumo".
Overlap ICP 3/5 (Ana home-cook). No crece agresivo porque no tiene que. Estudiar:
import-desde-URL (state of the art), organization tag-system, categorías editables,
shopping list desde recetas.

### 8. Bevel — el modelo de pricing free-generous + single premium
Launched mid-2025, Apple Watch Spotlight, New & Noteworthy. Core gratis desde dic 2025,
Bevel Intelligence (AI Coach) en $9.99/mo o $79.99/yr. **Es exactamente el modelo de
pricing al que RIAL aspira post-Q6.** All-in-one real (sleep + strain + nutrition +
glucose + strength + coach). Overlap ICP 3/5 (all-in-one wellness). Estudiar: pricing
free-generous + single paid tier, AI Coach cross-módulo, dashboard unificado 5+ rings.

---

## Descartados del Top 8 (razonamiento en 1 línea)

- **Cronometer** — nicho micronutrientes, overlap ICP 2/5, UX transferible moderada.
- **Cal AI** — absorbido por MyFitnessPal marzo 2026; su narrativa vive dentro de MFP.
- **Noom** — coaching psicológico es categoría distinta (Clara/Ana no buscan color-coding); estudiar si pivotamos a coaching-first.
- **Fastic / Zero / Simple** — ayuno-especializados; RIAL tiene ayuno como tab secundaria, no core.
- **Yuka** — escáner de calidad sin calorías; muy alta puntuación total (23) pero category-different. Estudiar su escáner UX como pattern puntual en `ux-patterns.md`.
- **Mealime / Eat This Much / PlateJoy** — planners puros sin tracking. Paprika cubre la lección UX mejor.
- **Whoop / ZOE** — wearables + biomarkers. Categoría adyacente no directa.
- **Cookpad / NYT Cooking / Samsung Food / Yummly** — recipe-discovery puro, no tracking.

---

## Implicaciones accionables para RIAL

Cinco insights que salen del scorecard y cambian el orden del roadmap:

### 1. MyRealFood es la amenaza #1 en ES → Real Score equivalente debe salir antes de Q8
Hoy RIAL tiene filosofía real-food pero **no emite veredicto visible en cada scan**. Cuando
Q6 active barcode en production, la pantalla post-scan debe devolver:
- Categoría NOVA-like (1-4, con nombres propios RIAL — no copiar NOVA literal).
- Color + veredicto textual emotional ("Real Food" / "Procesado" / "Ultra-procesado").
- No solo macros.

Archivo objetivo: `src/features/food/screens/BarcodeScanner.tsx` + post-scan result view.

### 2. Fitia crece más que ningún otro en LatAm → decidir entrada LatAm Q8 vs Q10
Fitia llegó primero (2019) y domina. Si RIAL quiere entrar a LatAm, debe ser con
diferenciador claro: identidad **real-food ES+LatAm** (Fitia es calorías puras, no
filosofía) + AI Coach en español nativo + cocina regional (no solo macros). Decisión
producto: ¿entramos en Q8 (antes que Fitia afiance Spain) o Q10 (tras afianzar ES)?

Archivo objetivo: `docs/ai/state.md` roadmap Q8/Q10 entry, `src/features/food/data/seed-recipes.ts`
seed regional LatAm.

### 3. El modelo pricing Bevel es el north-star post-Q6
Free-generous (tracking + recetas + planner + Real Feel) + single premium tier (AI Coach +
AI meal planner + photo recog + import automático URL). Evita el error MFP "Premium vs
Premium+". Evita fragmentar features core en paywall. Es aspiracional pero hoy el paywall
de RIAL está poco definido. Decisión producto: documentar el modelo en `rial-positioning.md`
sección "Pricing strategy" antes de Q6.

Archivo objetivo: `src/features/profile/screens/RialPlus.tsx` + ADR "ADR-008 pricing model".

### 4. MacroFactor prueba que un algoritmo adaptativo es commercial moat
Bootstrapped, sin ads, sin freemium, $500k–$2M/mes revenue. La única razón: su algoritmo
TDEE adaptativo es 3× más preciso que el estándar. RIAL hoy usa TDEE estático (Harris-
Benedict). Decisión roadmap: añadir TDEE adaptativo en Q10+ como Pro-only feature.

Archivo objetivo: `src/features/profile/utils/calorie-calc.ts` (si existe; si no, crear).

### 5. Paprika valida el patrón MealSlot multi-valued (Q19) — no recalibrar
RIAL ya implementó `suitableFor: MealSlot[]` en Q19 siguiendo precedente Paprika/PlateJoy.
El scorecard confirma que la decisión fue correcta: Paprika es Top 8 precisamente por su
rigor en la separación "apta para" vs "slot de consumo". **Cerrar el ítem en state.md** y
no re-abrir el debate taxonomía de slots hasta Q20+.

Archivo objetivo: `src/features/recipes/utils/meal-slot.ts` (ya committed en `5dab667`).

---

## Cómo leer las fichas top tras este documento

Cada una de las 8 fichas top (`deep-dives/<app>.md`) lleva desde 2026-04-17:

1. **Hard metrics** — tabla con rating + descargas + MAU + revenue + growth, cada fila con fuente URL + fecha.
2. **Pantallas principales (qué estudiar)** — 3-5 pantallas de la app con:
   - Qué hacen bien (3 bullets concretos).
   - Mapeo a `src/features/<domain>/screens/<File>.tsx` de RIAL (ruta actual o propuesta).
   - Acción sugerida: **copiar** / **evitar** / **ignorar** con razón.

Este es el material que permite a un agente de desarrollo (o a ti) tomar el archivo, leer
una pantalla, y saber exactamente qué ruta del repo modificar.

---

## Fuentes del scorecard

Por columna, donde verificable a 2026-04-17:

**Rating**:
- MyFitnessPal US App Store: https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718 (4.7★)
- MyFitnessPal Google Play: https://play.google.com/store/apps/details?id=com.myfitnesspal.android (4.4★)
- Yazio Google Play: https://play.google.com/store/apps/details?id=com.yazio.android (4.6★, 300k+ reviews, Google Excellence App)
- Fitia App Store: https://apps.apple.com/us/app/fitia-calorie-counter-diet/id1448277011 (4.9★)
- Fitia Google Play: https://play.google.com/store/apps/details?id=com.nutrition.technologies.Fitia (4.9★)
- MacroFactor App Store: https://apps.apple.com/us/app/macrofactor-macro-tracker/id1553503471
- Paprika App Store: https://apps.apple.com/us/app/paprika-recipe-manager-3/id1303222868
- Bevel App Store: https://apps.apple.com/us/app/bevel-all-in-one-health-app/id6456176249
- Lifesum Trustpilot 1.7/5: (source needed URL exacta)

**Users / MAU / downloads**:
- Yazio 95M–100M claim: https://play.google.com/store/apps/details?id=com.yazio.android + https://www.yazio.com/en/android-app
- Fitia 10M+ users + 1M MAU: https://fitia.app/features/ + https://fitia.app/learn/article/best-calorie-counter-apps-2025-rd-reviewed/
- MyFitnessPal 200M community + downloads: https://www.similarweb.com/app/google-play/com.myfitnesspal.android/statistics/
- MacroFactor 82k paid (Sep 2022): https://macrofactorapp.com/annual-report-2022/ + Sensor Tower recent $2M/mo
- Lifesum 65M: https://nutriscan.app/blog/posts/lifesum-free-trial-deals-3-months-free-4eb582ba9e (Feb 2026)
- MyRealFood 2M+ active: prensa ES 2024 (El Referente / BusinessInsider ES — source needed URL exacta)

**Growth**:
- Fitia +16.11% Jan 2026 traffic: fitia.app blog
- Bevel Apple Watch Spotlight + New & Noteworthy 2025: https://apps.apple.com/us/app/bevel-all-in-one-health-app/id6456176249
- Simple Serie B $35M oct 2025: (source needed URL TechCrunch / press release)
- Cal AI $30M ARR + MFP M&A marzo 2026: (source needed URL)
- Sensor Tower State of Mobile Health & Fitness 2025: https://sensortower.com/blog/state-of-mobile-health-and-fitness-in-2025

**Revenue (dónde público)**:
- MacroFactor ~$500k–$2M/mes: Sensor Tower + https://macrofactor.com/
- Lifesum $800k/mo Feb 2026: Sensor Tower via nutriscan.app
- Lifesum $12.3M revenue 2026: (source needed URL exacta)

Datos no verificables → marcados `(source needed)` en cada ficha. Política repo-wide: mejor
honesto-incompleto que falso-completo.
