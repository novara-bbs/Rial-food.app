# Recetario Fitness — Product Bible

> Documento maestro para inversores, equipo de producto y ejecución técnica (Codex).
> Última actualización: marzo 2026.

---

## 1. Resumen ejecutivo

Recetario Fitness es un sistema semanal personal que resuelve una fricción real y fragmentada: convertir un objetivo físico en una semana ejecutable de comidas, compra y repetición. Hoy ese flujo vive repartido entre 3-5 apps distintas (tracker + Pinterest + lista de compra + notas + WhatsApp). Este producto lo unifica.

La tesis no es "otra app de recetas" ni "otro tracker de calorías". Es un sistema local-first, fitness-first y tracker-light que convierte:

```
objetivo → recetas → plan semanal → compra derivada → memoria de lo que funcionó → repetición
```

en un loop legible y accionable desde una sola interfaz.

### Lectura por audiencia

**Para un inversor:** El producto ataca la intersección de cuatro categorías validadas (fitness planning, meal planner + grocery, nutrition light, recipe organizer) donde no hay un ganador claro. Samsung Food valida la amplitud del mercado. MacroFactor valida willingness-to-pay del nicho fitness (200K usuarios de pago en 2024, 400K totales en 2025). MyFitnessPal valida la expectativa mainstream. Mealime valida que la simplicidad operativa genera adopción masiva (7M+ usuarios). El SOM inicial apunta a decenas de miles en el segmento fitness-pragmático que cocina y planifica. La expansión futura incluye creator commerce verticalizado (recetas, libros, video-recetas vendibles dentro del sistema) como segunda línea de ingresos, validada por la convergencia entre Patreon, Whop, Stan y Samsung Food Creators.

**Para un usuario:** "Abres la app, eliges si estás en volumen, definición o mantenimiento, planificas tu semana con recetas que entienden tu objetivo, generas la lista de compra para ti y tu pareja, y al final de la semana revisas qué funcionó. Sin vivir dentro de un contador de calorías."

**Para un director de producto:** El producto gana si hace incontestable el loop semanal `objetivo → plan → compra → progreso`. No gana si dispersa recursos en comunidad abierta, AI como promesa central o backend social antes de cerrar ese loop. Las 12 superficies actuales ya cubren el core; lo que falta es endurecer la ejecución, añadir las superficies que faltan (onboarding, food log, batch cooking) e integrar las mejoras visuales de los prototipos V3.

---

## 2. Posicionamiento competitivo

### 2.1 Dónde competimos

El producto no compite como:
- Red social de recetas (Samsung Food community-first)
- Contador de calorías puro (MyFitnessPal logging-first)
- Family OS generalista (Cozi, OurHome)
- Wearable companion (WHOOP, Oura)
- AI como identidad central

Compite por resolver mejor este tramo de trabajo: `objetivo → plan → compra → repetición`.

### 2.2 Por qué ganamos frente a cada competidor

| Competidor | Su fortaleza | Su debilidad | Nuestra ventaja |
|---|---|---|---|
| MacroFactor | Claridad de objetivo, coaching computacional, 200K pagando | Cero recetas, cero planner, cero compra | Resolvemos receta + planner + compra sin perder framing fitness |
| MyFitnessPal | Distribución masiva, 2.3M ratings | Stack fragmentado, logging-first, bloat | Semana ejecutable sin depender de logging infinito |
| Samsung Food | Anchura total: save + plan + shop + community | Pierde foco, UX ancha, demasiados frentes | Foco, claridad y disciplina del loop semanal |
| Mealime | Simplicidad extrema, 7M usuarios | Sin objetivos fitness, sin progreso, sin household | Anclamos planner y compra en objetivo físico real |
| Plan to Eat | Mejor import y biblioteca personal | Sin fitness framing, sin progreso, sin household | Import + biblioteca + planner + fitness en un sistema |
| WHOOP/Oura | Memory loops, feedback semanal, hardware | No hay recetas ni planner ni compra | Tomamos el loop de memoria sin depender de hardware |
| Feast/Kitchen Stories | Visual trust, editorial premium | Discovery sin ejecución real, sin planner | Tono editorial + ejecución operativa real |
| Bring!/AnyList | Compra colaborativa excelente | Sin vínculo con objetivo ni con planner nutricional | Compra derivada del plan, con contexto fitness y household |

### 2.3 ICP Ladder (orden de adquisición)

| Prioridad | ICP | Job central | Lo que busca realmente | Stack que reemplazamos |
|---|---|---|---|---|
| 1 | Fitness pragmática | Convertir bulk/cut/maintain en semana ejecutable | Claridad, planner, compra y continuidad útil | MacroFactor + Pinterest + AnyList + notas |
| 2 | Recipe accumulator | Guardar y reutilizar recetas sin caos | Save-first, archivo confiable, origen preservado | Pinterest + Notion + capturas |
| 3 | Couple/household operator | Coordinar porciones y compra compartida | Household clarity, leftovers, compra útil | AnyList + Bring! + WhatsApp |
| 4 | Future creator/expert | Convertir criterio en sistema publicable | Editorial trust, shelf personal, publicación futura | YouTube + Instagram + Stan/Patreon |

---

## 3. Inventario completo de secciones

Cada sección del producto se justifica contra tres preguntas:
1. **¿Por qué existe?** — Qué problema resuelve y qué valida el mercado.
2. **¿Qué hace?** — Funcionalidad real actual.
3. **¿Cómo se integra?** — Triggers de entrada y salida hacia otras secciones.

### 3.1 Home (/)

**Por qué existe:** Es la promesa del producto en una sola pantalla. Apple Fitness, MacroFactor y Feast demuestran que si la home no transmite criterio y siguiente acción, el usuario no explora más. Samsung Food enseña que la home puede ser ancha sin perder dirección si hay un CTA claro.

**Qué hace:**
- Muestra la promesa de marca ("Tu cocina tiene memoria")
- Featured recipes con lectura editorial
- MetricStrip con stats del usuario (recetas guardadas, semanas planificadas, etc.)
- MacroBar con resumen nutricional
- SystemFlowNav como navegación del loop principal (objetivos → planificador → compra → progreso)
- Entradas rápidas a recetas, planificador y perfil

**Cómo se integra:**
- **Salida →** Recetas (discovery), Planificador (ejecución directa), Perfil (configuración)
- **Lectura pasiva ←** config/constants.ts, lib/data/recipes.ts
- **No toca storage** — es completamente derivada

**Madurez:** Real hoy. Personalidad de marca ya propagada.

**Vista inversor:** Primera impresión del producto. Si no transmite "esto entiende mi semana", el usuario no pasa de aquí.

**Vista usuario:** "Entro y sé qué puedo hacer: ver recetas, planificar mi semana o revisar mi progreso."

**Vista director:** El KPI aquí es % de usuarios que navegan desde home a planner o recetas en su primera sesión.

---

### 3.2 Recetas (/recetas)

**Por qué existe:** Es la puerta de entrada al sistema. Feast y Kitchen Stories demuestran que la confianza editorial en la receta es prerequisito para que el usuario entregue su semana al producto. Samsung Food demuestra que save + plan + shop empieza por el catálogo.

**Qué hace:**
- RecipesBrowser con filtros por objetivo (alta proteína, rápidas, meal-prep, déficit, etc.)
- RecipeCard con preview nutricional, dificultad y tiempo
- NextStepCallout empujando hacia el planner
- PlannerSelectionBanner mostrando selección activa de la semana
- Lectura del organizer editorial (lib/recipe-organizer.ts) que clasifica por intención real

**Cómo se integra:**
- **Entrada ←** Home (discovery), Favoritos (acceso rápido)
- **Salida →** Detalle de receta (/recetas/[slug]), Favoritos (guardar), Planificador (añadir al plan)
- **Storage:** Lectura de favoritos, lectura de plannerSelection
- **Libs:** lib/data/recipes.ts, lib/recipe-organizer.ts, lib/entry-flow.ts

**Madurez:** Real hoy. Catálogo base mock.

**Vista inversor:** Volumen de catálogo es métrica de vanidad en fase temprana. Lo que importa es conversion rate receta → planner.

**Vista usuario:** "Busco recetas que encajen con mi objetivo y las añado a mi semana."

**Vista director:** El organizer editorial no es decorativo; es lo que convierte browsing en acción. Sin él, somos Pinterest sin ejecución.

---

### 3.3 Detalle de receta (/recetas/[slug])

**Por qué existe:** Kitchen Stories, Feast y Samsung Food demuestran que el detalle de receta es donde se gana o pierde la confianza editorial. El usuario necesita entender qué cocina, cuánto aporta nutricionalmente y cómo encaja en su semana.

**Qué hace:**
- Vista completa de receta: ingredientes, pasos, nutrición, dificultad, tiempo
- RecipeActions: guardar en favoritos, valorar, marcar "lo hice", enviar al planner
- PlannerImpactPreview: muestra el impacto de añadir esta receta a la semana activa (calorías, proteína, slots libres)
- MadeItSection: social proof ligero de quién la ha cocinado
- AuthorChip, DifficultyBadge, MacroGrid
- SystemFlowNav para continuar el loop

**Cómo se integra:**
- **Entrada ←** Catálogo, Favoritos, Mi Recetario, búsqueda directa
- **Salida →** Planificador (añadir), Favoritos (guardar), Progreso (marcar "lo hice")
- **Storage:** favorites, userRatings, madeRecipes, plannerSelection + lectura de mealPlan, goalProfile, householdSettings, preferences
- **Libs:** lib/entry-flow.ts (PlannerImpactPreview), lib/weekly-execution.ts (estado del loop)

**Madurez:** Real hoy.

**Vista inversor:** El PlannerImpactPreview es diferenciador — ningún competidor directo muestra el impacto semanal antes de añadir una receta.

**Vista usuario:** "Veo la receta, veo cuánto aporta a mi semana, y la añado al martes."

**Vista director:** Es el punto de conversión más importante del producto. Si el CTA "añadir al plan" no está claro, el loop se rompe aquí.

---

### 3.4 Importar (/importar)

**Por qué existe:** El segundo ICP (recipe accumulator) necesita capturar recetas de Instagram, TikTok, blogs y YouTube sin fricción. Pinterest valida save-first como comportamiento masivo. Notion Web Clipper valida captura rápida. Kitchen Stories ha lanzado Recipe Importer.

**Qué hace:**
- Campo para pegar URL o texto libre
- Parsing heurístico local (lib/recipe-import.ts): extrae título, ingredientes, pasos, nutrición estimada, dificultad, intents sugeridos, señales de meal-prep/batch cooking
- Preview editable del borrador antes de guardar
- Estado operativo del borrador: draft, needs-review, ready
- Checklist de completitud

**Cómo se integra:**
- **Entrada ←** Cualquier punto del producto (acción global), Home (CTA)
- **Salida →** Borradores (/borradores) para revisión, Nueva Receta (/nueva-receta) para completar
- **Storage:** recipeImportDraft (borrador activo), recipeImportInbox (cola de pendientes)
- **Libs:** lib/recipe-import.ts, lib/wellness.ts (para sugerencias de colección)

**Madurez:** Real hoy. Parsing local heurístico funcional.

**Vista inversor:** Reduce fricción de entrada. Cada receta importada es un activo personal que retiene al usuario.

**Vista usuario:** "Veo una receta en TikTok, pego el enlace y me aparece estructurada en mi app."

**Vista director:** La barrera de calidad es "import en menos de 30 segundos con resultado usable". No prometer parsing mágico antes de tenerlo.

---

### 3.5 Borradores (/borradores)

**Por qué existe:** El flujo save-first necesita un buffer antes de la biblioteca personal. El usuario importa rápido y remata después. Es la diferencia entre captura impulsiva y archivo de calidad.

**Qué hace:**
- Lista de borradores importados filtrable por estado (capturado, revisión, listo)
- Acciones: continuar editando, convertir en receta completa, descartar
- Vista rápida de macros estimadas y completitud

**Cómo se integra:**
- **Entrada ←** Importar (post-captura)
- **Salida →** Nueva Receta (completar borrador), Mi Recetario (post-conversión)
- **Storage:** recipeImportInbox, recipeImportDraft
- **Libs:** lib/draft-inbox.ts, lib/wellness.ts

**Madurez:** Real hoy.

**Vista inversor:** Reduce abandono del flujo de import. Sin borradores, las recetas se pierden.

**Vista usuario:** "Tengo 5 recetas que pegué esta semana, ahora remato las 2 mejores."

**Vista director:** KPI: % de borradores que se convierten en recetas completas en los primeros 7 días.

---

### 3.6 Nueva Receta (/nueva-receta)

**Por qué existe:** El usuario necesita crear recetas propias o completar borradores importados. Plan to Eat y Kitchen Stories validan que el flujo de creación debe ser guiado pero no pesado.

**Qué hace:**
- RecipeForm con wizard guiado (FormWizard)
- Campos: nombre, descripción, ingredientes, pasos, macros, servings, dificultad, tags
- Si viene de un borrador, precarga datos del import
- Macros aproximadas calculadas automáticamente
- Sugerencias de colección editorial

**Cómo se integra:**
- **Entrada ←** Borradores (completar), Mi Recetario (crear nueva), acción global
- **Salida →** Mi Recetario (receta guardada), Planificador (uso inmediato)
- **Storage:** userRecipes (destino), recipeImportDraft (origen si viene de borrador)
- **Libs:** lib/recipe-import.ts, lib/wellness.ts

**Madurez:** Real hoy.

**Vista inversor:** Cada receta propia creada es contenido generado por el usuario que aumenta retención.

**Vista usuario:** "Creo mi receta de avena proteica y me aparece en mi recetario para planificar."

**Vista director:** La experiencia de creación debe ser más rápida que Notion y más estructurada que las notas del móvil.

---

### 3.7 Mi Recetario (/mis-recetas)

**Por qué existe:** La biblioteca personal es lo que diferencia "guardar en Pinterest y olvidar" de "tener un sistema reutilizable". Plan to Eat y Kitchen Stories validan que ownership + reuse es lo que retiene al usuario de recetas.

**Qué hace:**
- MiDiario: vista de recetas propias y importadas
- Filtros por origen (manual, importada, link, video)
- MacroBar con visión nutricional
- NextStepCallout empujando hacia planner
- PlannerImpactPreview para ver cómo encaja cada receta en la semana
- Lectura de goalProfile, householdSettings y preferencias para contextualizar

**Cómo se integra:**
- **Entrada ←** Nueva Receta (post-creación), Importar (post-conversión), Favoritos
- **Salida →** Detalle de receta, Planificador (reutilización), Compra (derivada)
- **Storage:** userRecipes + lectura de goalProfile, householdSettings, preferences, plannerSelection, mealPlan
- **Libs:** lib/wellness.ts, lib/entry-flow.ts, lib/weekly-execution.ts

**Madurez:** Parcialmente definido. Funcional pero necesita refuerzo de ownership y reuse.

**Vista inversor:** El tamaño de la biblioteca personal es el mejor predictor de retención a largo plazo.

**Vista usuario:** "Aquí están todas mis recetas, las que creé y las que importé. Las que más uso las mando al plan."

**Vista director:** La evolución futura es RecipeBook (libros personales con secciones). Pero primero mi recetario debe sentirse como biblioteca de verdad, no como lista suelta.

---

### 3.8 Planificador (/planificador)

**Por qué existe:** Es el corazón del producto. Mealime valida que un planner simple genera adopción masiva. Runna valida que una semana visual operativa es el patrón ganador en fitness. Samsung Food valida que el planner conectado a grocery es expectativa mínima.

**Qué hace:**
- Vista semanal con slots por comida (desayuno, comida, cena, snacks)
- SelectionList de recetas del catálogo y recetario personal mezcladas
- MacroGrid con cobertura nutricional contra targets activos
- SystemStatusPanel: estado del loop semanal (flowStatus, highlights, flags, next action)
- ExecutionChecklistPanel: checklist priorizada de tareas operativas
- Servings, repeat y leftovers household-aware
- Lectura de goalProfile para adaptar sugerencias

**Cómo se integra:**
- **Entrada ←** Detalle de receta (añadir), Catálogo, Favoritos, Mi Recetario
- **Salida →** Lista de Compra (derivación automática), Progreso (cierre de semana)
- **Storage:** mealPlan, plannerSelection + lectura de userRecipes, preferences, goalProfile, householdSettings
- **Libs:** lib/planner-utils.ts (building, scoring, leftovers), lib/goal-targets.ts (coverage), lib/weekly-execution.ts (master snapshot), lib/household-execution.ts (porciones), lib/entry-flow.ts

**Madurez:** Real hoy, en hardening activo.

**Vista inversor:** El planner es donde se demuestra la propuesta de valor. Si no es mejor que una hoja de Excel, el producto no existe.

**Vista usuario:** "Veo mi semana, sé qué toca cada día, cuánta proteína cubro y qué me falta comprar."

**Vista director:** KPIs: % de slots rellenados por semana, % de semanas que generan lista de compra, % de usuarios que repiten planificación la semana siguiente.

---

### 3.9 Lista de Compra (/lista-compra)

**Por qué existe:** La compra es la prueba final de que la semana planificada era real. Bring! y AnyList validan que una lista compartible y agrupada es expectativa mínima. Cookidoo valida que la compra derivada del planner es el puente que más usuarios convierten.

**Qué hace:**
- Lista derivada automáticamente del mealPlan
- Agrupación por categorías útiles (proteínas, verduras, lácteos, despensa, etc.)
- Progreso de compra con checkboxes
- Cantidades escaladas por porciones reales y household
- Carriles de prioridad: start-week (fresco), continuity (reposición), flex (opcional)
- SystemStatusPanel con estado del loop
- ExecutionChecklistPanel con tareas operativas
- WeeklyMemoryPanel con patrones de lo que funcionó
- Share/print para enviar al grupo de WhatsApp o imprimir
- Enlace directo al origen de fricción en planner cuando un ítem apunta a una comida concreta

**Cómo se integra:**
- **Entrada ←** Planificador (derivación automática)
- **Salida →** Progreso (ejecución informa revisión), Planificador (vuelta para ajustar si algo falta)
- **Storage:** mealPlan (lectura), shoppingChecked + lectura de householdSettings, weeklyCheckIns
- **Libs:** lib/grocery-utils.ts (aggregation, categories, focus buckets, share), lib/household-execution.ts, lib/weekly-execution.ts, lib/progress-utils.ts

**Madurez:** Real hoy, en hardening activo.

**Vista inversor:** La compra es el momento de mayor utilidad percibida. Un usuario que genera lista de compra tiene 3x más probabilidad de repetir la semana siguiente (benchmark de Mealime Pro).

**Vista usuario:** "Abro la app en el supermercado, tengo todo lo que necesito agrupado por sección."

**Vista director:** El share de la lista es feature de retención indirecta: el segundo miembro del hogar ve el producto sin instalarlo.

---

### 3.10 Favoritos (/favoritos)

**Por qué existe:** MyFitnessPal "saved meals" y Pinterest boards validan que el acceso rápido a recetas ya validadas reduce fricción del planner. No es archivo; es shortcut.

**Qué hace:**
- Lista de recetas marcadas como favoritas
- RecipeCard con preview
- SendToPlannerButton con CTA directa a slot sugerido
- PlannerSelectionBanner mostrando selección activa
- NextStepCallout empujando hacia planner

**Cómo se integra:**
- **Entrada ←** Detalle de receta (guardar), Catálogo (guardar)
- **Salida →** Planificador (añadir rápido), Detalle de receta (revisar)
- **Storage:** favorites, plannerSelection
- **Libs:** lib/entry-flow.ts

**Madurez:** Real hoy.

**Vista inversor:** Favoritos no retiene por sí solo; retiene porque es la rampa más rápida hacia el planner.

**Vista usuario:** "Mis 10 recetas favoritas, las de siempre, con un toque para mandarlas a la semana."

**Vista director:** Si favoritos se siente como archivo muerto, falla. Debe sentirse como quick-add.

---

### 3.11 Objetivos (/objetivos)

**Por qué existe:** MacroFactor y Apple Fitness demuestran que el framing fitness claro es el primer momento de conexión con el ICP principal. Si el producto no pregunta "¿estás en volumen, definición o mantenimiento?", el usuario fitness no se siente entendido.

**Qué hace:**
- Selección de modo activo: balanced, high-protein, definición, familia, senior-friendly
- Foco del objetivo: adherencia, rendimiento, composición corporal, hogar, bienestar
- Targets derivados automáticamente: calorías, proteína, carbos, grasa
- Contexto household integrado
- WeeklyMemoryPanel con patrones de check-ins anteriores
- Micro-recomendaciones basadas en progreso y memoria

**Cómo se integra:**
- **Entrada ←** Perfil (configuración base), Progreso (ajuste post-revisión)
- **Salida →** Planificador (targets cambian sugerencias y coverage), Progreso (referencia de lectura)
- **Storage:** goalProfile, householdSettings + lectura de preferences, progressSnapshots, weeklyCheckIns
- **Libs:** lib/wellness.ts, lib/goal-targets.ts, lib/progress-utils.ts

**Madurez:** Parcialmente definido. Funcional pero necesita refuerzo de framing y claridad.

**Vista inversor:** Sin goal framing, el producto pierde al ICP #1. Con goal framing claro, gana por diferenciación contra Mealime, Bring! y AnyList que no entienden de fitness.

**Vista usuario:** "Selecciono 'definición', ajusto mis calorías y la app adapta las sugerencias de mi semana."

**Vista director:** No es un formulario largo tipo MacroFactor. Es una configuración rápida que se nota en todo el producto.

---

### 3.12 Progreso (/progreso)

**Por qué existe:** WHOOP y Oura validan que el feedback semanal retiene usuarios. Pero el usuario de recetas no quiere un panel clínico — quiere saber "¿me fue bien esta semana?" y "¿qué repito?". Daylio valida que micro-input + tags + tendencias es el formato que más engagement genera en bienestar personal.

**Qué hace:**
- ProgressSnapshots: peso, energía, adherencia, entrenamientos, cobertura del plan
- WeeklyCheckIns: resumen semanal, wins, blockers, nextFocus
- Señales opcionales: hambre, hinchazón, saciedad, fuerza, facilidad de repetición
- Memoria ligera: "esto me funcionó", "esto no"
- SystemStatusPanel con estado del loop semanal
- ExecutionChecklistPanel con tareas operativas
- WeeklyMemoryPanel con micro-recomendaciones

**Cómo se integra:**
- **Entrada ←** Lista de Compra (post-ejecución), Planificador (cierre de semana)
- **Salida →** Objetivos (ajuste de targets), Planificador (repetir semana exitosa)
- **Storage:** progressSnapshots, weeklyCheckIns + lectura de goalProfile, householdSettings, preferences, mealPlan
- **Libs:** lib/progress-utils.ts (continuity, memory, recommendations), lib/weekly-execution.ts, lib/goal-targets.ts, lib/planner-utils.ts

**Madurez:** Parcialmente definido. Base funcional con señales y memoria, necesita más utilidad semanal.

**Vista inversor:** El progreso cierra el loop. Sin él, el usuario planifica una semana y no vuelve. Con él, tiene razón para abrir la app el domingo.

**Vista usuario:** "El domingo reviso mi semana: qué cociné, qué compré, cómo me sentí, y qué cambio para la próxima."

**Vista director:** El tono debe ser tracker-light. "¿Cómo te fue?" en vez de "Tu adherencia calórica fue del 78.3%".

---

### 3.13 Perfil (/perfil)

**Por qué existe:** Toda app necesita un punto de configuración personal. Pero aquí el perfil no es el centro — es el soporte. Lo que vive aquí son preferencias, no la identidad del producto.

**Qué hace:**
- Nombre de usuario y preferencias de display
- Restricciones alimentarias
- Tema (claro/oscuro/sistema)
- Notificaciones (configuración futura)
- MetricStrip con stats personales (recetas guardadas, semanas planificadas, ratings dados)
- Lectura de goalProfile, householdSettings

**Cómo se integra:**
- **Entrada ←** Home (acceso directo), Navegación global
- **Salida →** Objetivos (configuración avanzada), Mi Recetario (overview)
- **Storage:** preferences + lectura de mealPlan, userRecipes, userRatings, goalProfile, householdSettings

**Madurez:** Real hoy. Funcional y sencillo.

**Vista inversor:** El perfil es el ancla de retención a largo plazo cuando se añada cuenta y sincronización.

**Vista usuario:** "Ajusto mis preferencias y veo un resumen de lo que llevo usando."

**Vista director:** No sobrecargar. Perfil es configuración, no dashboard.

---

## 4. Mapa de triggers e integración entre módulos

El producto funciona como un sistema de activación cruzada, no como pantallas independientes. Cada sección genera triggers hacia otras.

### 4.1 Loop principal (CORE)

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  OBJETIVOS  │───→│ PLANIFICADOR │───→│   COMPRA    │───→│  PROGRESO    │
│  (fase,     │    │  (semana     │    │  (lista     │    │  (revisión   │
│   targets)  │    │   ejecutable)│    │   derivada) │    │   semanal)   │
└──────┬──────┘    └──────┬───────┘    └─────────────┘    └──────┬───────┘
       │                  │                                       │
       └──────────────────┴───────────────────────────────────────┘
                              LOOP SEMANAL
```

### 4.2 Flujos de alimentación (SUPPLY)

```
┌──────────┐    ┌───────────┐    ┌──────────────┐
│ CATÁLOGO │───→│  DETALLE  │───→│ PLANIFICADOR │
└──────────┘    │  RECETA   │    └──────────────┘
                └─────┬─────┘
                      │
                ┌─────▼─────┐
                │ FAVORITOS │───→ PLANIFICADOR (rápido)
                └───────────┘

┌──────────┐    ┌───────────┐    ┌──────────────┐    ┌───────────────┐
│ IMPORTAR │───→│ BORRADORES│───→│ NUEVA RECETA │───→│ MI RECETARIO  │───→ PLANIFICADOR
└──────────┘    └───────────┘    └──────────────┘    └───────────────┘
```

### 4.3 Tabla de triggers específicos

| Trigger | Origen | Destino | Dato que viaja | Lib responsable |
|---|---|---|---|---|
| Añadir al plan | Detalle, Favoritos, Mi Recetario | Planificador | recipeId + suggestedSlot + impactPreview | lib/entry-flow.ts |
| Derivar compra | Planificador | Lista de Compra | mealPlan completo → ingredientes agregados | lib/grocery-utils.ts |
| Cerrar semana | Lista de Compra | Progreso | shoppingCompletionRate + planData | lib/progress-utils.ts |
| Ajustar targets | Progreso | Objetivos | señales + patrones + recomendaciones | lib/progress-utils.ts |
| Aplicar targets | Objetivos | Planificador | calorieTarget, proteinTarget, macros | lib/goal-targets.ts |
| Import → borrador | Importar | Borradores | RecipeImportDraft | lib/recipe-import.ts |
| Borrador → receta | Borradores | Nueva Receta → Mi Recetario | draft data precargada | lib/recipe-import.ts |
| Escalar porciones | HouseholdSettings | Planificador + Compra | servings multiplicado por household.size | lib/household-execution.ts |
| Estado semanal | Todas las surfaces core | SystemStatusPanel | WeeklyExecutionSnapshot | lib/weekly-execution.ts |
| Guardar favorito | Detalle | Favoritos | recipeId | lib/client-storage.ts |
| Marcar "lo hice" | Detalle | Progreso (implícito) | madeRecipes timestamp | lib/client-storage.ts |

### 4.4 El orquestador: weekly-execution.ts

Este módulo es la pieza más sofisticada del sistema. No tiene equivalente en ningún competidor analizado. Genera un `WeeklyExecutionSnapshot` que integra:

- **flowStatus**: en qué punto del loop está el usuario (sin plan, planificando, comprando, ejecutando, revisando)
- **executionChecklist**: lista priorizada de qué hacer a continuación
- **priorityLanes**: carriles de prioridad (start-week, continuity, flex)
- **highlights**: logros y señales positivas
- **flags**: alertas y bloqueos

Este snapshot es consumido por SystemStatusPanel, ExecutionChecklistPanel y WeeklyMemoryPanel, que aparecen en planificador, compra y progreso, creando coherencia transversal.

---

## 5. Secciones que faltan

Basado en el análisis competitivo, los prototipos V3 y el comportamiento real de usuario en apps similares, estas secciones no existen aún pero deberían existir:

### 5.1 Onboarding guiado (PRIORIDAD ALTA)

**Por qué falta y por qué importa:** Todas las apps exitosas del mercado (MacroFactor, Mealime, Lifesum, Samsung Food) tienen onboarding. Sin él, el usuario aterriza en la home sin contexto. MacroFactor pregunta objetivo y datos básicos en 4 pantallas. Mealime pregunta restricciones alimentarias y tamaño del hogar. El nuestro debe preguntar: objetivo fitness (bulk/cut/maintain), household (solo/pareja/familia) y preferencias alimentarias mínimas.

**Qué debería hacer:**
- 3-4 pantallas máximo
- Configurar goalProfile y householdSettings
- Mostrar el primer "aha moment": "Tu semana de definición con 2200 kcal empieza aquí"
- CTA directo hacia el planner o catálogo

**Impacto:** Sin onboarding, el % de usuarios que configuran objetivos es muy bajo. Con onboarding, el producto se siente personalizado desde el primer segundo.

**Prioridad Codex:** Sprint 1 de integración V3.

### 5.2 Food Log / Diario de comidas (PRIORIDAD MEDIA)

**Por qué falta y por qué importa:** MyFitnessPal valida que el registro de comidas es expectativa básica del ICP fitness. Pero nuestro enfoque no es logging-first — es tracker-light. Los prototipos V3 incluyen `rial_detailed_food_log` (puntuada 9.5/10), que resuelve esto con un enfoque visual y emocional (cómo te sentiste, foto del plato, nota rápida) en vez de un registro calórico frío.

**Qué debería hacer:**
- Registro rápido post-comida: qué comiste (del plan o libre), cómo te sentiste (Real Feel™ con emojis), foto opcional
- Notas rápidas
- Contribución al WeeklyCheckIn automática
- NO debe ser logging pesado de macros — eso es trabajo del planner

**Impacto:** Cierra el gap entre "planifiqué" y "revisé la semana". Hoy ese tramo está vacío.

**Prioridad Codex:** Sprint 2-3.

### 5.3 Batch Cooking / Meal Prep planner (PRIORIDAD MEDIA)

**Por qué falta y por qué importa:** El ICP principal (fitness pragmática) hace meal prep. Es central para bulk y definición. Los prototipos V3 incluyen pantallas de batch cooking (rial_smart_batch_cooking_planner, rial_batch_cooking_workflow). El local ya tiene señales de batch prep en imports y leftovers, pero no hay superficie dedicada.

**Qué debería hacer:**
- Vista de preparación semanal: qué cocinar el domingo para cubrir lunes-miércoles
- Agrupación de recetas por sesión de cocina
- Orden de preparación sugerido
- Enlace directo a compra con ítems de la sesión de batch

**Impacto:** El usuario de meal prep hoy usa notas sueltas o Excel. Si el producto resuelve esto, retiene al ICP #1 por operatividad directa.

**Prioridad Codex:** Sprint 3-4.

### 5.4 Comparación nutricional / Real Match™ (PRIORIDAD BAJA)

**Por qué falta y por qué importa:** Los prototipos V3 incluyen una herramienta de comparación de recetas side-by-side por macros. MacroFactor no tiene esto porque no tiene recetas. Samsung Food no tiene esto porque no está centrado en fitness. Es un diferenciador potencial.

**Qué debería hacer:**
- Seleccionar 2-3 recetas y comparar calorías, proteína, tiempo, dificultad
- Ayudar a decidir "¿cuál pongo en el martes?"
- Integrado en el flujo de selección del planner

**Impacto:** Útil para el ICP principal pero no es bloqueante. Puede entrar como progressive enhancement.

**Prioridad Codex:** Sprint 4+.

### 5.5 Pantalla de resultados / Body Progress (PRIORIDAD BAJA)

**Por qué falta y por qué importa:** WHOOP, Oura y Apple Fitness validan que la visualización de tendencias retiene. Hoy el progreso tiene snapshots pero no hay visualización de tendencias a lo largo del tiempo.

**Qué debería hacer:**
- Gráficas simples de tendencia: peso, energía, adherencia a lo largo de las semanas
- Tono tracker-light: tendencia general, no punto por punto
- Correlación ligera: "Las semanas con meal prep tienen 30% más adherencia"

**Impacto:** Retención a largo plazo. No es bloqueante para L1.

**Prioridad Codex:** Sprint 5+.

---

## 6. Sistemas de producto únicos

El local tiene 6 sistemas de producto interconectados que no existen en ningún competidor analizado. Estos son la ventaja técnica real:

### 6.1 Weekly Execution Engine (lib/weekly-execution.ts)

**Qué es:** Orquestador central que integra datos de todas las libs (planner, grocery, household, goals, progress) en un único `WeeklyExecutionSnapshot`.

**Por qué importa:** Genera coherencia transversal. El planner, la compra y el progreso leen del mismo estado, eliminando contradicciones.

**Ningún competidor tiene esto.** Samsung Food tiene planner y grocery separados sin estado compartido. MacroFactor no tiene planner. Mealime no tiene progreso.

### 6.2 Entry Flow + PlannerImpactPreview (lib/entry-flow.ts)

**Qué es:** Cuando el usuario ve una receta (en catálogo, favoritos o mi recetario), ve en tiempo real cómo esa receta impactaría su semana: calorías que suma, proteína que cubre, slots libres que rellena.

**Por qué importa:** Reduce la barrera de decisión de "¿añado esta receta al plan?" mostrando el impacto antes de la acción.

**Ningún competidor tiene esto.** Es diferenciador real.

### 6.3 Household Execution Layer (lib/household-execution.ts)

**Qué es:** Derivación automática de porciones, leftovers y tensiones operativas basada en el tamaño del hogar (solo/pareja/familia) y la estrategia de leftovers elegida.

**Por qué importa:** Resuelve "cocinar para 2 y comprar para 2" sin que el usuario recalcule mentalmente cada receta.

### 6.4 Goal Target Engine (lib/goal-targets.ts)

**Qué es:** Derivación personalizada de targets calóricos y de macros basada en modo activo (balanced, high-protein, definición, etc.), foco del objetivo y contexto household.

**Por qué importa:** El planner y el progreso leen estos targets para mostrar cobertura, no para dictar logging.

### 6.5 Grocery Focus Buckets (lib/grocery-utils.ts)

**Qué es:** La lista de compra no es plana — está organizada en carriles de prioridad: start-week (lo que compras para empezar), continuity (reposición de básicos), flex (opcional o sustituciones).

**Por qué importa:** El usuario en el supermercado sabe qué comprar primero y qué puede saltar. Bring! y AnyList no tienen esta lógica.

### 6.6 Pattern Components (components/patterns/*)

**Qué es:** 6 componentes reutilizables que crean coherencia UX:
- SystemStatusPanel: estado del loop semanal
- ExecutionChecklistPanel: tareas priorizadas
- WeeklyMemoryPanel: patrones y micro-recomendaciones
- SurfaceStatePanel: estado contextual de cada superficie
- PlannerImpactPreview: impacto semanal de una acción
- AppShell: layout consistente

**Por qué importa:** Estas piezas son la razón de que el planificador, la compra y el progreso se sientan como un sistema coherente en vez de 3 pantallas desconectadas.

---

## 7. Design System

### 7.1 Tokens existentes (globals.css)

El producto ya tiene un sistema de tokens HSL maduro:

| Token | Valor (light) | Uso |
|---|---|---|
| --background | HSL 42 24% 97% | Fondo warm oat |
| --primary | HSL 16 74% 43% | Terracota — acción principal |
| --protein | dedicado | Color de proteína en macros |
| --carbs | dedicado | Color de carbohidratos |
| --fat | dedicado | Color de grasa |
| --success, --warning, --info | dedicados | Estados semánticos |
| --star, --verified | dedicados | Social proof |

Dark mode completo con variante de todos los tokens.

### 7.2 Tipografía

| Variable | Fuente | Uso |
|---|---|---|
| --font-sans | Source Sans 3 | Cuerpo, UI |
| --font-serif | Fraunces | Títulos editoriales, personalidad |
| --font-mono | JetBrains Mono | Datos, macros, métricas |

### 7.3 Identidad visual del producto

Marca: "editorial-atlético". No es fitness-bro, no es wellness-pastel, no es SaaS-genérico.

Reglas de la marca (docs/BRAND-SYSTEM.md):
- Si parece intercambiable con una app fitness genérica, falla
- Si no deja claro "qué resuelvo aquí", falla
- Si no hay una CTA dominante hacia el siguiente paso del loop, falla
- Si parece dashboard médico o panel SaaS, falla
- Si no transmite editorial trust y athletic clarity a la vez, falla

### 7.4 Integración visual de V3

Los prototipos V3 traen mejoras visuales que deben integrarse respetando los tokens existentes:

| Elemento V3 | Cómo integrarlo | Token local equivalente |
|---|---|---|
| Gradientes sutiles | Aplicar como surface-muted layers | --surface-muted |
| Cards con profundidad | Mejorar sombras y border-radius actuales | --radius, --shadow |
| Iconografía emoji (Real Feel™) | Añadir como sistema de feedback en progreso | Nuevo componente |
| Paleta lime (#ddff00) | NO integrar — rompe la identidad terracota | Rechazado |
| Tipografía Display | Ya tenemos Fraunces como serif editorial | Existente |
| Micro-animaciones | Añadir transiciones sutiles en acciones clave | CSS transitions |

---

## 8. Arquitectura técnica para Codex

### 8.1 Stack

- Next.js 15 App Router
- React 19
- TypeScript strict
- Tailwind CSS 4 via @tailwindcss/postcss
- shadcn/ui v4 primitives (repo-owned via components.json)
- localStorage persistence con schema versioning
- CI: `npm run verify`

### 8.2 Estructura de carpetas

```
app/                        # Rutas (server wrappers + metadata)
  page.tsx                  # Home
  recetas/page.tsx          # Catálogo
  recetas/[slug]/page.tsx   # Detalle
  importar/page.tsx         # Import
  borradores/page.tsx       # Drafts
  nueva-receta/page.tsx     # Create
  mis-recetas/page.tsx      # Mi recetario
  planificador/page.tsx     # Planner
  lista-compra/page.tsx     # Grocery
  favoritos/page.tsx        # Favorites
  objetivos/page.tsx        # Goals
  progreso/page.tsx         # Progress
  perfil/page.tsx           # Profile
  globals.css               # Foundation tokens
  layout.tsx                # Root layout + fonts

components/
  ui/                       # Primitives (Button, Card, Input, etc.)
  patterns/                 # System patterns (reusable)
    system-status-panel.tsx
    execution-checklist-panel.tsx
    weekly-memory-panel.tsx
    surface-state-panel.tsx
    planner-impact-preview.tsx
    app-shell.tsx
  brand/                    # Brand expressions
  *-page.tsx                # Client page components

lib/
  types.ts                  # 84+ domain types (source of truth)
  types/planner.ts          # Planner-specific types
  client-storage.ts         # 19 storage keys + migration
  weekly-execution.ts       # Master orchestrator
  entry-flow.ts             # Recipe → Planner flow
  planner-utils.ts          # Planner helpers
  grocery-utils.ts          # Grocery aggregation
  household-execution.ts    # Household derivations
  goal-targets.ts           # Target engine
  progress-utils.ts         # Continuity + memory
  wellness.ts               # Defaults + collections
  recipe-import.ts          # Import parsing
  recipe-organizer.ts       # Editorial taxonomy
  product-events.ts         # Event tracking seam
  data/recipes.ts           # Mock catalog

config/
  constants.ts              # App constants, storage keys, schema version
```

### 8.3 Storage Map (19 keys)

| Key | Qué guarda | Quién escribe | Quién lee |
|---|---|---|---|
| rf_app_meta | Schema version, migration state | client-storage.ts | Todos |
| rf_favorites | IDs de recetas favoritas | Detalle, Catálogo | Favoritos, Planner |
| rf_meal_plan | Semana planificada completa | Planificador | Compra, Progreso, Home |
| rf_preferences | Preferencias de usuario | Perfil | Todos |
| rf_user_recipes | Recetas propias del usuario | Nueva Receta | Mi Recetario, Planner |
| rf_user_ratings | Valoraciones del usuario | Detalle | Catálogo, Mi Recetario |
| rf_made_recipes | Recetas marcadas "lo hice" | Detalle | Progreso |
| rf_shopping_checked | Items tachados en compra | Compra | Compra, Progreso |
| rf_selected_recipe_for_planner | Selección temporal | Detalle, Favoritos | Planner |
| rf_goal_profile | Modo, targets, foco | Objetivos | Planner, Progreso, Compra |
| rf_household_settings | Perfil, tamaño, leftovers | Objetivos, Perfil | Planner, Compra |
| rf_progress_snapshots | Snapshots semanales | Progreso | Progreso, Objetivos |
| rf_weekly_check_ins | Check-ins semanales | Progreso | Progreso, Objetivos, Compra |
| rf_recipe_collections | Colecciones editoriales | Sistema | Catálogo, Organizer |
| rf_recipe_import_draft | Borrador activo de import | Importar | Nueva Receta |
| rf_recipe_import_inbox | Cola de borradores | Importar | Borradores |
| rf_recent_searches | Búsquedas recientes | Catálogo | Catálogo |
| rf_achievements | Logros del usuario | Sistema | Perfil |

### 8.4 Contratos future-ready

El sistema ya tiene tipos preparados para expansión sin activar backend:

- `FutureOwnershipRef`: ownership (local/account/publication), visibility (private/team/public)
- `PublicationRef`: slug, publishedAt, visibility
- `CapabilityFlag`: local-first, future-account, future-multi-device, future-publication, future-creator
- `TrackedProductEvent`: cola de eventos para telemetría futura
- `UserProfile`, `Rating`, `Review`, `CookSnap`: seeds para comunidad futura

---

## 9. Prioridades y Roadmap

### 9.1 Horizonte Now (Sprint activo)

**Objetivo:** Hacer incontestable `objetivo → plan → compra → progreso`.

| Tarea | Superficie | Por qué | Referencia competitiva |
|---|---|---|---|
| Endurecer coverage semanal en planner | Planificador | El usuario debe saber de un vistazo si su semana cubre sus targets | Mealime, Runna |
| Mejorar lectura de bloqueo concreto | Planificador | Bajar de "tu semana está incompleta" a "falta cena del jueves" | MacroFactor clarity |
| Refinar compra con prioridad operativa | Compra | El usuario en el supermercado necesita saber qué comprar primero | Bring!, AnyList |
| Propagar personalidad a todas las surfaces | Todas | El core debe sentirse tan propio como la home | Apple Fitness consistency |
| Mejorar framing de objetivo | Objetivos | "Bulk/cut/maintain" debe sentirse natural y directo | MacroFactor framing |

### 9.2 Horizonte Next (Expansión del core)

| Tarea | Por qué | Referencia |
|---|---|---|
| Onboarding guiado (3-4 pantallas) | Sin onboarding el usuario no configura objetivos | Todas las apps exitosas |
| Food log tracker-light | Cierra el gap entre plan y revisión semanal | V3 prototypes, Daylio |
| Memoria semanal más útil | "Esto me funcionó" debe traducirse en ajustes concretos | WHOOP, Oura |
| Batch cooking surface | El ICP #1 hace meal prep y no tiene dónde planificarlo | V3 prototypes |
| Import hardening | Más formatos, mejor parsing, menos fricción | Kitchen Stories importer |

### 9.3 Horizonte Later

| Tarea | Por qué |
|---|---|
| RecipeBook local-first | Organización por libros y secciones del archivo personal |
| Cuenta y ownership multi-device | Persistencia entre dispositivos sin perder la lógica local-first |
| Publicación individual de recetas | Primer paso hacia creator layer |

### 9.4 Horizonte Future (hipótesis, no comprometido)

| Tarea | Requisito previo |
|---|---|
| Creator profiles | Publicación funcional + editorial trust |
| Creator commerce (paid books, collections) | Creator profiles + biblioteca personal madura |
| Small-circle community | Creator commerce útil + moderación |
| Feed social | Solo si hay evidencia clara de valor |

---

## 10. Plan de integración V3 para Codex

### 10.1 Principio rector

**"Visual upgrade, zero logic regression."**

Los prototipos V3 son 190+ pantallas HTML estáticas generadas en Google AI Studio. Tienen ideas visuales excelentes pero CERO lógica de producto. El local tiene 13 libs interconectadas, 84+ tipos, 19 keys de storage y 6 pattern components. La integración debe tomar lo visual de V3 sin romper lo sistémico del local.

### 10.2 Qué tomar de V3

| Feature V3 | Qué integramos | Cómo |
|---|---|---|
| Onboarding screens | Flujo de 3-4 pantallas | Nueva ruta /onboarding con goalProfile + householdSettings |
| Food log visual | Componente de registro post-comida | Nuevo componente en /progreso o nueva ruta |
| Batch cooking planner | Vista de sesiones de preparación | Extensión del planificador o nueva ruta |
| Micro-animaciones | Transiciones sutiles | CSS transitions en acciones de CTA |
| Cards con profundidad | Mejora visual de RecipeCard | Ajuste de sombras y border-radius |
| Emoji mood feedback | Sistema Real Feel™ para check-ins | Extensión de WeeklyCheckIn signals |
| Dark mode refinado | Mejora de contraste en tokens dark | Ajuste de globals.css dark variant |

### 10.3 Qué NO tomar de V3

| Feature V3 | Por qué no |
|---|---|
| Community feed/hub | Fuera de horizonte Now y Next |
| Leaderboards/gamification | Contradice guardrails del producto |
| Bio-Sync/wearable dashboard | Contradice posicionamiento |
| Social profiles avanzados | Antes de publicación individual |
| Paleta lime/cyan | Rompe identidad terracota establecida |
| 5 filosofías de diseño distintas | El local ya tiene identidad editorial-atlético consolidada |

### 10.4 Orden de ejecución para Codex

**Sprint 1: Onboarding + visual polish** (3-4 días)
- Crear /onboarding con 3-4 pantallas
- Conectar a goalProfile y householdSettings
- Mejorar RecipeCard con profundidad V3
- Añadir micro-transiciones en CTAs principales

**Sprint 2: Execution hardening** (3-4 días)
- Refinar coverage semanal en planificador
- Mejorar lectura de bloqueo concreto (slot + item)
- Refinar compra con prioridad operativa
- Mejorar framing de objetivo en /objetivos

**Sprint 3: Food log + memoria** (3-4 días)
- Añadir componente de food log tracker-light
- Integrar Real Feel™ (emoji mood) en check-ins
- Mejorar WeeklyMemoryPanel con más utilidad
- Conectar food log a progreso semanal

**Sprint 4: Batch cooking + import hardening** (3-4 días)
- Vista de batch cooking integrada en planner
- Mejorar parsing de import
- Refinar flujo borradores → receta

**Sprint 5: Visual integration + dark mode** (2-3 días)
- Refinar dark mode con insights de V3
- Pulir componentes con mejoras visuales V3
- Verificar coherencia tipográfica y espaciado
- Ejecutar `npm run verify` final

---

## 11. Métricas clave por superficie

| Superficie | Métrica primaria | Métrica secundaria | Métrica de alarma |
|---|---|---|---|
| Home | % que navega a planner o recetas en sesión 1 | Tiempo medio en home | >60% bounce sin acción |
| Catálogo | % recetas vistas → añadidas al plan | Filtros usados por sesión | <5% conversion a planner |
| Planificador | Slots rellenados por semana | Semanas consecutivas planificadas | <3 slots por semana |
| Compra | % items tachados | Listas compartidas | <50% completion rate |
| Progreso | Check-ins completados por mes | Señales registradas | 0 check-ins en 3 semanas |
| Objetivos | % usuarios con goal configurado | Cambios de modo por trimestre | >50% sin objetivo tras 2 semanas |
| Import | Borradores → recetas completadas (7 días) | Tiempo medio de import | <20% conversion |
| Mi Recetario | Recetas propias reutilizadas en planner | Tamaño de biblioteca | 0 recetas usadas en planner |

---

## 12. Guardrails del producto

Estas son las líneas que NO se cruzan en L1:

1. **No coach clínico** — Ayudamos a planificar, no diagnosticamos
2. **No wearable dashboard** — No dependemos de hardware ni biometría
3. **No social feed como core** — El feed no es la identidad del producto
4. **No targets por miembro todavía** — Household es agregado, no perfiles individuales
5. **No backend ni sync en L1** — Todo local-first
6. **No AI como promesa central** — La promesa es ejecución semanal, no inteligencia artificial
7. **No discovery infinito** — El catálogo alimenta al planner, no lo reemplaza
8. **No logging pesado** — Tracker-light significa que el usuario registra poco y recibe mucho
9. **No generic wellness SaaS** — El tono es editorial-atlético, no corporativo

---

## 13. Resumen para Codex

**Lee esto antes de tocar código:**

1. El proyecto es Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + localStorage
2. Hay 12 rutas funcionales, 13 libs interconectadas, 84+ tipos, 19 keys de storage
3. El orquestador central es `lib/weekly-execution.ts` — no lo rompas
4. Los 6 pattern components crean coherencia UX transversal — mantenlos
5. El sistema de triggers (entry-flow, grocery-utils, progress-utils) es la ventaja técnica
6. Los prototipos V3 son solo HTML estático — toma lo visual, ignora la lógica
7. El design system usa tokens HSL en globals.css — no añadas colores hardcoded
8. Las fuentes son Source Sans 3, Fraunces, JetBrains Mono — no añadas otras
9. CI mínima: `npm run verify` debe pasar siempre
10. Documentación vive en docs/ — actualiza PRODUCT-MAP.md si añades rutas

**Orden de archivos a leer antes de empezar:**
1. `docs/PROJECT-STATE.md` — qué es real hoy
2. `docs/PRODUCT-MAP.md` — mapa funcional
3. `docs/ARCHITECTURE.md` — dónde tocar cada cosa
4. `lib/types.ts` — contratos de dominio
5. `lib/weekly-execution.ts` — orquestador central
6. `config/constants.ts` — constantes y storage keys
7. `app/globals.css` — tokens de diseño
