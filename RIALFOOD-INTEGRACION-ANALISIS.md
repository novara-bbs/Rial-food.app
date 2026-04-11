# RialFood — Análisis de Integración: Local vs Google AI Studio

> Actualizado 12/03/2026
> Compara el código local real (v0-rialfood) con 228 pantallas de Google AI Studio (V1+V2+V3)
> Incluye análisis de mercado, consumer journey, conflictos y plan de integración seguro

---

## 1. EL PROBLEMA CENTRAL

El proyecto local (`v0-rialfood`) tiene una base de código funcional, bien documentada y con una estrategia de producto madura. Las pantallas de Google AI Studio tienen diseño visual ambicioso y features aspiracionales. Pero viven en mundos diferentes:

| Aspecto | Local (código real) | Google AI Studio (HTML mockups) |
|---|---|---|
| **Ejecutable** | Sí — Next.js 15 funcional | No — solo HTML estático |
| **Datos** | localStorage con schema versionado | Sin datos, todo hardcodeado |
| **Arquitectura** | 13 rutas, 50+ componentes, 10+ libs | 228 pantallas sueltas sin routing |
| **Estrategia** | Documentada: MARKET-RESEARCH, PRODUCT-MASTER, BRAND-SYSTEM | Sin estrategia — solo exploración visual |
| **Design system** | HSL tokens, Source Sans + Fraunces, shadcn/ui v4 | 5 paletas diferentes, 4 tipografías |
| **ICP definido** | Fitness pragmática (bulk/cut/maintain) | Sin ICP — mezcla fitness, wellness, biohacker, editorial |

**Conclusión: el local manda.** Google AI Studio es un catálogo de ideas visuales. La integración debe ser "qué ideas visuales de V3 mejoran el producto local" — no al revés.

---

## 2. QUÉ DICE EL MARKET RESEARCH (ya en el proyecto local)

El MARKET-RESEARCH.md del proyecto es contundente:

**Tesis:** El producto gana resolviendo `objetivo → plan → compra → repetición`, no siendo una red social ni un wearable dashboard.

**Wedge:** `fitness-first execution` — usuarios que quieren bulk, cut o maintain con meal prep y compra derivada.

**Lo que NO copiar del mercado:**
- Red social abierta (Samsung Food trap)
- Logging infinito (MyFitnessPal trap)
- Wearable dashboard (WHOOP/Oura trap)
- AI como promesa central

**Battlefield real:**
- MacroFactor = referencia de claridad y framing
- Samsung Food = referencia de anchura y riesgo
- MyFitnessPal = referencia de expectativa mainstream
- Mealime = referencia de simplicidad
- WHOOP/Oura = referencia de memory loops

### Implicación directa para la integración

Muchas features de V3 **contradicen la estrategia del proyecto local**:

| Feature V3 | Market Research dice... | Veredicto |
|---|---|---|
| Community Hub con feed social | "no competir por red social abierta" | ❌ NO ahora |
| Leaderboards y challenges | "no abrir gamificación social" | ❌ NO ahora |
| Bio-Sync con wearables | "no convertir en wearable dashboard" | ❌ NO ahora |
| Real Feel™ emoji logging | "tracker-light continuity" | ⚠️ Parcial — encaja si es ligero |
| Real Match™ scanner | "no vender AI como promesa central" | ⚠️ Fase 2 como mínimo |
| Pro Athlete Mirroring | "no copiar breadth de Samsung Food" | ❌ Fase 3+ |
| Fasting protocols | "no wearable/clinical" | ❌ Fuera del wedge |
| Kitchen Lab mode | Nicho — no ICP principal | ❌ Descartado |
| Creator profiles con LVL | "creator subordinado al core" | ⚠️ Fase futura |
| Batch cooking lab | "meal prep y repetición semanal" | ✅ SÍ — encaja con wedge |
| Leftover Logic™ | "leftovers ya existen en planner" | ✅ SÍ — refuerza lo que hay |
| Smart Shopping con swaps | "compra derivada legible" | ✅ SÍ — mejora existente |
| Family planner con perfiles | "household execution" | ✅ SÍ — evolución natural |
| Nutrient dictionary | "profundidad nutricional opcional" | ⚠️ Progressive disclosure |
| Smart substitutions | "reducir fricción de decisión" | ✅ Encaja en planner |
| Recipe detail editorial | "editorial trust + visual trust" | ✅ SÍ — mejora existente |

---

## 3. QUÉ YA EXISTE EN LOCAL QUE NO EXISTE EN V3

Esto es crítico: V3 tiene pantallas bonitas pero le faltan cosas que el local ya resuelve.

| Capacidad | Local | V3 |
|---|---|---|
| **Schema versionado con migración** | ✅ `client-storage.ts` | ❌ |
| **Flujo import → borrador → wizard → receta** | ✅ Completo con estados | ❌ Solo mockup visual |
| **Organizer editorial por intención** | ✅ `recipe-organizer.ts` | ❌ |
| **Planner household-aware con leftovers** | ✅ `planner-utils.ts` + `household-execution.ts` | ❌ Solo diseño visual |
| **Grocery con trazabilidad por receta** | ✅ `grocery-utils.ts` con fresh/repeat/leftover | ❌ |
| **Goal targets derivados de perfil** | ✅ `goal-targets.ts` | ❌ |
| **Weekly execution state canónico** | ✅ `weekly-execution.ts` con flowStatus, checklist | ❌ |
| **Progress utils con micro-recomendaciones** | ✅ `progress-utils.ts` | ❌ |
| **Product events tracking (future-ready)** | ✅ `product-events.ts` | ❌ |
| **Surface state patterns** | ✅ SystemStatusPanel, ExecutionChecklist, WeeklyMemory | ❌ |
| **Entry flow con PlannerImpactPreview** | ✅ `entry-flow.ts` | ❌ |
| **Brand system documentado** | ✅ BRAND-SYSTEM.md con tests de personalidad | ❌ |
| **Tipos future-ready** (Visibility, Ownership, FutureOwnershipRef) | ✅ | ❌ |

**V3 es visual. Local es sistema.** Hay que integrar visual sobre sistema, no reemplazar sistema con visual.

---

## 4. QUÉ TIENE V3 QUE REALMENTE MEJORA EL LOCAL

### ✅ Mejoras visuales claras (adoptar ya)

**4.1 Recipe Detail Hero** — `rial_final_recipe_review`
- El local tiene detalle funcional pero visualmente plano
- V3 tiene: hero image con gradiente multi-capa, score circle, typography editorial premium
- **Integración:** Rediseñar `app/recetas/[slug]/page.tsx` manteniendo toda la lógica de RecipeActions, PlannerImpactPreview y MadeItSection, pero con hero visual V3

**4.2 Food Log Sticky Header** — `rial_detailed_food_log`
- El local no tiene un diario visual dedicado
- V3 tiene: sticky header con calorías persistentes, categorías horizontales (B/L/D/S)
- **Integración:** Crear `app/diario/page.tsx` como **nueva ruta** — no reemplaza progreso, lo complementa. Se alimenta del storage existente.

**4.3 Shopping Progress Circle** — `rial_shopping_unified`
- El local tiene lista de compra funcional con progress bar
- V3 tiene: círculo visual de progreso (18/28 items), Smart Swap suggestions
- **Integración:** Evolucionar `app/lista-compra/page.tsx` — el Progress component existente se puede mejorar visualmente sin tocar `grocery-utils.ts`

**4.4 Onboarding Flow** — `welcome_to_rial` → `define_your_path` → `goal_alignment`
- El local no tiene onboarding
- V3 tiene: flujo multi-paso con selección de identidad (4 roles)
- **Integración:** Crear `app/onboarding/page.tsx` como nueva ruta. Al completar, escribe en `goalProfile` y `householdSettings` usando los mismos helpers de `wellness.ts`

**4.5 Planner con Batch Cooking Badge** — `rial_family_planner_unified`
- El local tiene planner con slots, leftovers y household
- V3 tiene: badge visual de batch cooking, carrusel de perfiles familiares
- **Integración:** Evolucionar `app/planificador/page.tsx` — añadir badges visuales sobre la lógica existente de `planner-utils.ts`

### ⚠️ Mejoras que encajan pero requieren cuidado

**4.6 Real Feel™ (versión mínima)**
- NO como sistema de 40 pantallas
- SÍ como: un emoji picker post-comida (🚀/😐/📉) que se guarda como tag en `weeklyCheckIns`
- **Integración:** Añadir campo `realFeel?: '🚀'|'😐'|'📉'` al tipo `WeeklyCheckIn` en `types.ts`. No crear sistema separado.

**4.7 Leftover Logic™ (versión visual)**
- Ya existe la lógica en `planner-utils.ts` (repeat, leftovers)
- V3 aporta: conectores visuales entre días mostrando transformaciones
- **Integración:** Componente visual `leftover-connector.tsx` que lee los datos que `planner-utils` ya calcula

**4.8 Batch Cooking Session**
- No existe en local
- Encaja con wedge: meal prep es core del ICP fitness pragmática
- **Integración:** Crear `app/batch/page.tsx` como nueva ruta con timer local. Se conecta a `mealPlan` existente.

### ❌ Features que NO deben integrarse ahora

| Feature | Por qué no |
|---|---|
| Community Hub/Feed | PRODUCT-MASTER: "no escalar social antes de consolidar core" |
| Leaderboards / Challenges | BRAND-SYSTEM: "no gamificación que rompa tono editorial-atlético" |
| Bio-Sync / Wearables | PRODUCT-MASTER: "no wearable dashboard" |
| Pro Athlete Mirroring | MARKET-RESEARCH: "no breadth de Samsung Food" |
| Creator Profiles con LVL | PROJECT-STATE: "creator subordinado al core" |
| Real Match™ Scanner | "no AI como promesa central" |
| Fasting Protocols | Fuera del wedge fitness-first |
| Kitchen Lab | Nicho, no ICP principal |
| Bio-Age Calculator | Clinical, no tracker-light |
| Receipt Scanner | Requiere backend/API, no local-first |

---

## 5. ANÁLISIS DE CONSUMER JOURNEY

### Cómo usaría un usuario real el producto unificado

**Semana 1: Onboarding**
1. Abre la app → `/onboarding` (NUEVO de V3)
2. Elige: "Fitness Enthusiast" + "Volumen"
3. Se guardan `goalProfile` + `householdSettings` (lógica local existente)
4. Llega a `/` (Home) → ve su objetivo + siguientes pasos

**Día a día: El loop semanal**
1. `/recetas` → explora catálogo con filtro por intención (ya funciona en local)
2. `/recetas/pollo-teriyaki` → hero editorial mejorado (visual V3) + PlannerImpactPreview (lógica local)
3. Guarda en planner → `/planificador` con badge de batch cooking (visual V3) + leftovers connectors (visual V3 sobre lógica local)
4. Domingo: `/batch` (NUEVO de V3) → timer de session batch cooking
5. Lunes: `/lista-compra` con círculo de progreso (visual V3) + Smart Swap card (NUEVO)
6. Cada comida: `/diario` (NUEVO de V3) con sticky header + emoji Real Feel
7. Fin de semana: `/progreso` con check-in semanal + micro-recomendaciones (ya funciona)

### Qué tiene sentido y qué no

**SÍ tiene sentido:**
- El onboarding → da personalización inmediata y usa `goalProfile` existente
- El diario con Real Feel → es tracker-light, no clinifica la experiencia
- Batch cooking session → es el core del meal prep fitness
- Leftover connectors visuales → hacen visible algo que ya se calcula
- Shopping con Smart Swap → reduce fricción en tienda

**NO tiene sentido (aún):**
- Community feed → el usuario fitness pragmático no abre la app para scrollear un feed social
- Leaderboards → el ICP no busca competir con otros, busca ejecutar su semana
- Bio-Sync → requiere hardware y backend, rompe local-first
- 5 pantallas de Real Match scanner → el usuario quiere cocinar, no escanear códigos de barras
- LVL badges → gamificación que contradice "tono editorial-atlético"

---

## 6. CONFLICTOS DE DESIGN SYSTEM

### El problema de las 5 paletas de V3

V3 usa 5 filosofías de diseño diferentes. El local tiene UNA. No se pueden mezclar.

| V3 tiene | Local tiene | Decisión |
|---|---|---|
| Lime #ddff00 sobre dark | HSL warm oat (#FAF8F3) light-first | **Local gana** — warm oat es más premium y legible |
| Space Grotesk bold | Source Sans 3 + Fraunces serif | **Local gana** — ya tiene serif editorial |
| Glassmorphism + shadows | 1px borders, zero shadows | **Local gana** — más limpio, más rápido |
| Cyan #25aff4 para datos | Info blue HSL 205 70% 44% | **Compatible** — son similares |
| Orange #ec5b13 para alertas | Primary HSL 16 74% 43% | **Compatible** — terracota local es similar |

### Decisión de tipografía

| V3 propone | Local tiene | Decisión |
|---|---|---|
| Newsreader (V2 PRD) | Fraunces | **Investigar** — ambas son serif editoriales premium. Fraunces ya está integrada. Si Newsreader es claramente mejor, migrar. Si no, mantener Fraunces. |
| Satoshi (V2 PRD) | Source Sans 3 | **Mantener Source Sans 3** — es la sans del sistema actual, funciona bien |
| Space Grotesk (V3 data) | JetBrains Mono | **Mantener JetBrains Mono** — ya se usa para datos numéricos |

### Tokens que SÍ conviene adoptar de V3

```css
/* Añadir al globals.css existente como tokens funcionales */
--real-feel-boost: 145 52% 35%;     /* reutilizar --success */
--real-feel-neutral: 32 88% 47%;    /* reutilizar --warning */
--real-feel-crash: 0 72% 50%;       /* reutilizar --destructive */
--batch-cooking: 16 74% 43%;        /* reutilizar --primary (terracota) */
```

No se necesitan tokens nuevos — los colores funcionales del local ya cubren los roles de V3.

---

## 7. PLAN DE INTEGRACIÓN SEGURO

### Principio: "Visual upgrade, zero logic regression"

Cada cambio visual debe:
1. Mantener 100% de los tests existentes (`npm run verify`)
2. No tocar ningún `lib/*.ts` excepto para añadir campos opcionales a tipos
3. No eliminar ningún componente — solo mejorar o crear nuevos
4. Pasar los Surface Personality Tests de BRAND-SYSTEM.md

### Fase 1: Visual Hardening (sin nuevas rutas)

**Sprint 1.1 — Recipe Detail Hero** (1 día)
- Archivo: `app/recetas/[slug]/page.tsx`
- Cambio: Hero image con gradiente + score visual
- Mantiene: RecipeActions, PlannerImpactPreview, MadeItSection, MacroGrid
- Test: `npm run verify` pasa, PlannerImpactPreview sigue funcional

**Sprint 1.2 — Shopping Visual Upgrade** (1 día)
- Archivo: `app/lista-compra/page.tsx`
- Cambio: Progress circle en vez de progress bar, Smart Swap cards
- Mantiene: grocery-utils.ts intacto, household execution intacta
- Test: `npm run verify` pasa, share/print sigue funcional

**Sprint 1.3 — Planner Badges** (1 día)
- Archivo: `app/planificador/page.tsx`
- Cambio: Batch cooking badges, leftover connectors visuales
- Mantiene: planner-utils.ts intacto, ExecutionChecklistPanel intacto
- Test: `npm run verify` pasa, slots, repeat, leftovers siguen funcionales

### Fase 2: Nuevas Rutas Ligeras

**Sprint 2.1 — Onboarding** (2 días)
- Nueva ruta: `app/onboarding/page.tsx`
- Escribe en: `goalProfile` + `householdSettings` (storage existente)
- Usa: `wellness.ts` defaults, `client-storage.ts` helpers
- NO crea: nuevos tipos de storage

**Sprint 2.2 — Food Log / Diario** (2 días)
- Nueva ruta: `app/diario/page.tsx`
- Lee de: `mealPlan` + `weeklyCheckIns` (storage existente)
- Nuevo campo: `realFeel?: string` en WeeklyCheckIn (campo opcional, no rompe nada)
- Componentes: sticky-totals-header, meal-category-tabs, food-item-card
- NO reemplaza: `/progreso` — lo complementa

**Sprint 2.3 — Batch Cooking** (2 días)
- Nueva ruta: `app/batch/page.tsx`
- Lee de: `mealPlan` (storage existente)
- Nuevo: timer local con estado en memoria (no en localStorage)
- Componentes: batch-timer, batch-progress-card
- NO crea: nuevo modelo de datos — usa recetas del planner

### Fase 3: Mejoras de Sistema (requiere más cuidado)

**Sprint 3.1 — Smart Substitutions** (2 días)
- Nuevo: `lib/substitution-utils.ts`
- Lee de: ingredientes de recetas existentes
- Muestra: sugerencias en detalle de receta y lista de compra
- NO toca: grocery-utils.ts — solo añade componente visual

**Sprint 3.2 — Leftover Logic™ Visual** (1 día)
- Nuevo componente: `leftover-connector.tsx`
- Lee de: `planner-utils.ts` que YA calcula leftovers
- Solo visual — hace visible lo que ya existe

**Sprint 3.3 — Daily Hub Redesign** (2 días)
- Archivo: `app/page.tsx`
- Cambio: Integrar Real Feel del día, timeline de comidas, quick log CTA
- Mantiene: MetricStrip, SystemFlowNav, AppShell
- Nuevo: leer `mealPlan` del día actual + último `weeklyCheckIn`

---

## 8. FEATURES DE V3 MAPEADAS A HORIZONS DEL PRODUCTO LOCAL

El PRODUCT-MASTER del local define horizontes claros. Las features de V3 deben respetar esta secuencia:

### NOW (execution hardening)
- ✅ Recipe detail hero visual → mejora editorial trust
- ✅ Shopping progress circle → mejora grocery execution clarity
- ✅ Planner batch badges → mejora week execution clarity
- ✅ Leftover connectors visuales → mejora lectura de continuidad
- ✅ Onboarding flow → mejora goal framing

### NEXT (expansion of the core)
- ⚠️ Food log / Diario con Real Feel → lightweight memory
- ⚠️ Batch cooking session → meal prep execution
- ⚠️ Smart substitutions → reduce friction de decisión
- ⚠️ Daily Hub redesign → better home personality
- ⚠️ Nutrient dictionary → progressive disclosure de nutrición

### LATER (structural expansion)
- 🔲 RecipeBook local-first (ya definido en docs, no en V3)
- 🔲 Publication-ready contracts (ya definido en tipos)
- 🔲 Creator profiles básicos
- 🔲 Real Match™ como comparador simple (sin scanner)

### FUTURE (hypothesis only)
- ❌ Community hub/feed
- ❌ Leaderboards/challenges
- ❌ Bio-Sync wearables
- ❌ Pro Athlete Mirroring
- ❌ Receipt scanner
- ❌ Kitchen Lab
- ❌ Fasting protocols
- ❌ LVL/EXP gamification

---

## 9. QUÉ FALTA EN V3 QUE EL LOCAL YA TIENE (Y NO SE PUEDE PERDER)

Estas son capacidades del local que son invisibles en las pantallas de V3 pero son esenciales para un producto real:

1. **Entry Flow con PlannerImpactPreview** — cuando el usuario ve una receta, ve el impacto en su semana antes de añadirla. V3 no tiene esto.

2. **Weekly Execution State** — `flowStatus`, `executionChecklist` y `priorityLanes` compartidos entre planner, compra y progreso. V3 no tiene nada de esto.

3. **Grocery Trazabilidad** — cada item de la lista sabe si es `fresh`, `repeat` o `leftover` y de qué receta viene. V3 solo tiene lista visual.

4. **Surface State Patterns** — `SystemStatusPanel`, `ExecutionChecklistPanel`, `WeeklyMemoryPanel` que dan consistencia entre pantallas. V3 tiene cada pantalla aislada.

5. **Schema Migration** — si el modelo de datos cambia, el local migra sin perder datos del usuario. V3 no tiene persistencia.

6. **Product Events** — `trackProductEvent()` prepara analytics futuro. V3 no tiene instrumentación.

7. **Brand Personality Tests** — "si parece intercambiable con una app fitness genérica, falla". Muchas pantallas de V3 fallarían este test.

---

## 10. RESPUESTA A LA PREGUNTA: ¿TIENE SENTIDO COMO LO USARÍA UN CONSUMIDOR?

### Sí tiene sentido el producto unificado SI:

- El core sigue siendo `objetivo → plan → compra → repetición`
- Las mejoras visuales de V3 hacen el core MÁS legible, no más denso
- Las nuevas rutas (onboarding, diario, batch) alimentan el loop existente
- No se abren features sociales ni wearable antes de cerrar el loop
- El tono sigue siendo "editorial-atlético" y no "biohacker-gaming"

### NO tiene sentido SI:

- Se intenta meter las 190 pantallas de V3 como producto
- Se priorizan community/challenges/leaderboards antes del planner
- Se cambian los tokens de color/tipografía del local por los 5 de V3
- Se introducen Real Match, Bio-Sync o Fasting como features principales
- Se pierde la lógica de `planner-utils`, `grocery-utils`, `weekly-execution` por rediseños visuales

### El usuario real haría esto:

| Semana | Acción principal | Feature local | Mejora visual V3 |
|---|---|---|---|
| 1 | Onboarding + primer plan | goalProfile, wellness.ts | Welcome flow V3 |
| 1 | Explorar recetas | recipe-organizer, RecipeCard | Masonry grid mejorado |
| 1 | Planificar semana | planner-utils, household-execution | Batch badges, family profiles |
| 1 | Generar compra | grocery-utils, share/print | Progress circle, Smart Swap |
| 2+ | Batch cooking domingo | mealPlan existente | Timer session V3 |
| 2+ | Logging diario | weeklyCheckIns | Sticky header, Real Feel emoji |
| 2+ | Revisar semana | progress-utils, micro-recomendaciones | Insights cards mejorados |
| 4+ | Importar receta IG | recipe-import, draft inbox | (sin cambio visual) |
| 4+ | Crear receta propia | RecipeForm, wizard | (sin cambio visual) |

**El producto gana SI el loop funcional no se rompe.** Las mejoras de V3 son pintura sobre una estructura que ya funciona.

---

## 11. RESUMEN EJECUTIVO

### Qué hacer:
1. **Adoptar diseño visual** de 5-6 pantallas best-of-breed de V3
2. **Crear 3 rutas nuevas** que alimenten el loop existente (onboarding, diario, batch)
3. **Respetar al 100%** la arquitectura, tipos, storage y libs del local
4. **No tocar** design tokens fundamentales — los colores y tipografías del local son correctos

### Qué NO hacer:
1. No adoptar community/challenges/leaderboards
2. No cambiar la paleta de colores ni la tipografía
3. No crear sistemas nuevos de datos (Real Match engine, Bio-Sync, etc.)
4. No priorizar features de Fase Future antes de cerrar NOW

### Prioridad clara:
```
1. Visual upgrade de receta, planner y compra (3 días)
2. Onboarding flow (2 días)
3. Diario con Real Feel mínimo (2 días)
4. Batch cooking session (2 días)
5. Daily Hub redesign (2 días)
= Total: ~11 días de trabajo enfocado
```

Esto da un producto que se VE como V3 pero FUNCIONA como el local.
