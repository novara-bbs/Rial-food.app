# Lifesum Design Playbook

> Accionable. Complemento del deep-dive (`deep-dives/lifesum.md`, descriptivo) y la doctrina transversal (`ux-patterns.md`).
>
> Alcance: extraer prácticas de diseño visibles en 39 capturas Lifesum (IMG_1056–IMG_1095, sin IMG_1093) que merecen **copiar, adaptar o descartar** para RIAL. Lifesum es un **contra-ejemplo parcial**: visuales fuertes, product-of-the-day en App Store, pero Trustpilot 1.7★ por paywall agresivo. Extraer lo bueno (visual, diet plans, Life Score) sin replicar lo malo (reverse trial, onboarding pay-gate, freemium mezquino).
>
> Última revisión: 2026-04-19. Capturas en `docs/market/Competitor Images/Lifesum/`.

---

## 1. Por qué Lifesum como referencia

Lifesum es un competidor **directo** (tracker + recetas + plans) al que vale la pena leer por 5 razones concretas:

- **Fotografía de comida premium**: la biblioteca de recetas pisa en calidad visual a MyFitnessPal, Yazio y Cronometer. Cada card lleva una foto propia, consistente en iluminación/ángulo/paleta. El "look" se siente editorial, no stock.
- **Acento verde lima `#8be25c` + fondo warm cream `#f5f0e8`** como firma de marca. Alto contraste de CTA verde sobre fondo crema. Una sola paleta fuerte, sin fragmentación tonal.
- **Diet plans como lente global** (IMG_1075/1076): el user elige un plan (keto, mediterránea, 16:8, alta proteína) y toda la app se refiltra. Patrón que RIAL no tiene y que resuelve "¿qué como hoy?" mejor que filtros ortogonales.
- **Life Score semanal** (IMG_1073): un solo número 0–150 con semi-donut gradient como hero de Progress. Alternativa a mostrar 8 métricas sueltas. Framing positivo (nombre aspiracional, no "puntuación de fallos").
- **Food rating con score numérico grande** (IMG_1067): receta muestra "9" verde sobre la foto + chips `+ Rico en proteínas` `+ Bajo en azúcar`. Nutri-Score reinterpretado con lenguaje de producto.

Mirarla **ahora** sirve para decidir: (a) qué tomar del sistema visual cream+lime sin pisar las 4 paletas actuales (VOLT/OCEAN/EMBER/NEUTRAL), (b) si el Life Score merece entrar al Progress tab como `RingScore` dedicado, (c) si "Diet plan activo" justifica un cambio de state global.

---

## 2. Matriz Copy / Adapt / Skip

| Patrón Lifesum | Referencia captura | Decisión | Dónde aterriza en RIAL |
|---|---|---|---|
| Onboarding progress bar horizontal fina arriba | 1060 / 1061 / 1062 | **Copy** | `<OnboardingScaffold>` PR 9 — sustituye dots actuales |
| Multi-select con fill verde (non-exclusive) + hint "Esto nos ayuda a personalizar" | 1061 / 1062 | **Copy** | `<MultiSelectCards>` nuevo primitive para onboarding |
| Single-select list con cards en blanco separadas + border hairline + sin chevron | 1060 | **Adapt** | `<SelectList>` primitive (PR 9) — variante sin chevron |
| Line chart con blob antropomorfo del peso-meta (curva "cuerpo" que se estira hacia el objetivo) | 1064 | **Skip** | Decorativo. RIAL usa sparklines sobrias. Evitar antropomorfismo. |
| Fecha-meta personalizada "Vicente, lograrás tu meta para 29 de mayo de 2026" + pill "¡Tú puedes!" | 1064 | **Copy** | `WeightGoalETA` component — computable desde `weightHistory` + `targetKg` |
| Hero ring "Restante / Consumido / Quemado" con 3 números sobre semi-donut | 1065 / 1070 | **Copy** | `<NutritionHero>` restante-first variant (ICP-adaptive) |
| Foto-first onboarding sell "Toma una foto" (photo recognition sell) | 1066 | **Adapt** | Q6+ cuando photo recog esté listo — evitar como gate, ok como demo-prompt |
| Food rating número grande 1–10 sobre foto + chips `+ Rico en proteínas` / `+ Bajo en azúcar` | 1067 | **Adapt** | `<RecipeRating>` en `RecipeCard` (Q21+ tracking NOVA/Real Score — usa 1–10, no estrellas) |
| Paywall post-onboarding con toggle Anual/Mensual + card Anual "50% descuento" + Mensual secundario | 1068 / 1079 | **Copy** | `RialPlus.tsx` layout — timeline temporal Bevel + toggle Lifesum estilo |
| Paywall con "Ten 5 veces más probabilidades de lograr resultados con Premium" + testimonial 5★ | 1079 | **Skip** | Claim estadístico sin fuente; RIAL evita pseudo-science. |
| GDPR consent como sheet inferior sticky full-text + CTAs `Aceptar todo` / `Guardar configuración` | 1069 | **Adapt** | `<GdprConsent>` ya existe — migrar a `<BottomSheet size="compact">` per §4.4.b inventory |
| Home hero "Restante 2814" con semi-ring verde + 3 macros pills debajo | 1070 | **Copy** | `<NutritionHero>` — variant "restante-first" vs "consumido-first" actual |
| Food log cards `Desayuno / Almuerzo / Cena / Tentempié` con emoji + "Recomendado 704–985 kcal" + `+` tap | 1070 / 1071 | **Adapt** | `<TodaysMeals>` — añadir **rango recomendado** por slot (hoy solo target total) |
| Daily trackers (Agua / Verduras / Frutas) con iconos ilustrativos + dots/vasos incrementales | 1072 | **Adapt** | Módulo "Hábitos diarios" en Hoy tab — usar `<HabitTile>` primitive nuevo |
| Life Score ring gradient con scale "DESEQUILIBRADO → BIEN → GENIAL → EXCELENTE → DESEQUILIBRADO" | 1073 | **Copy** | `<LifeScoreRing>` en `Progress.tsx` — sustituye o complementa `WeeklyScoreCard` |
| Streak "Tramo actual / Tramo más largo" dual-stat | 1073 / 1074 | **Copy** | Ya existe parcial en Profile — unificar a `<StreakCard>` |
| "Meta de peso" card con ilustración acuarela + CTA secundario verde-lima | 1074 / 1094 | **Skip** | Ilustración estilo específico de Lifesum (acuarela morada) — no encaja en ninguna de las 4 paletas RIAL. |
| Progreso hacia objetivo con gráfico line + bubble verde "71 kg" anclado al valor | 1074 / 1094 | **Copy** | `<WeightTrendCard>` — añadir annotation-bubble en el punto más reciente |
| Dietas tab como carrusel horizontal por categoría (Equilibrada / Ayuno / Alta en proteínas) | 1075 / 1076 | **Copy** | Nuevo tab "Dietas" o dentro de Cocina como sub-tab (Q15+) |
| Diet plan detail con hero photo + CTA pill blanco translúcido "EMPEZAR PLAN" + carrusel recetas | 1077 / 1080–1083 | **Copy** | `<DietPlanDetail>` route — aplicar patrón cocina Mediterránea ES diferencial |
| Diet plan "Tu foco" con donut macros + listas "Qué hacer / Qué no hacer" + CTA empezar | 1078 | **Copy** | `<DietPlanFocus>` sub-section dentro de detail |
| Recetas tab: search bar + filter icon + chip activa "ESTÁNDAR DE LIFESUM" + "Lo que está de moda" carrusel + secciones por slot | 1084 / 1086 / 1087 | **Copy parcial** | Cocina ya tiene search; añadir **lente Diet Plan activa** como chip top (Q15+) |
| Chip filter removible `CETOGÉNICA ESTRICTA x` + resultados re-grid 2-col | 1085 | **Copy** | `<FilterChips>` pattern — Cocina consumer |
| Recipe card con foto + título + kcal + corazón favorito bottom-right | 1084–1088 | **Adapt** | `<RecipeCard>` ya tiene shape — validar tap-target corazón ≥ 32×32 |
| Gate `Desbloquear todo` como banner naranja bajo el grid de recetas | 1088 | **Adapt** | RIAL solo paywallea features secundarios — banner sí, contenido no |
| Recipe detail con hero grande + "por Lifesum" attribution + porción editable + slot-picker | 1089 / 1090 | **Adapt** | `RecipeDetail.tsx` actual es más rico — tomar solo el **slot-picker inline dropdown** |
| Ficha nutricional oscurecida con gate "¿Quieres ver recetas creadas por nutricionistas?" CTA `VER TODAS LAS RECETAS` | 1089 / 1090 | **Skip** | Dark pattern — oscurece contenido visto previamente. |
| Paywall `ACTUALIZAR` pill naranja permanent en header | 1070–1076 | **Skip** | Ruido visual persistente; usar el hero `<RialPlus>` CTA en More tab. |
| BottomNav con 4 items + FAB verde central `+` elevado | 1070–1076 / 1084–1088 | **Copy** | RIAL ya tiene BottomNav — validar que FAB central esté centrado verticalmente sobre nav |
| FAB verde circular central como "universal + Track" | 1070 / 1072 / 1084 | **Copy** | Ya existe `+` en BottomNav; ver §4.8 para unificar 4 entry points |
| Perfil: "27 años" + "Peso actual / Objetivo / Dieta activa" key-value list | 1091 | **Copy** | `Profile.tsx` existente — añadir "Dieta activa" row cuando Diet Plans aterricen |
| Ajustes: 6 secciones (Cuenta / Diario / Notifications / Salud / Social / Ayuda) con label uppercase | 1092 | **Adapt** | RIAL ya tiene Settings sectionalizado (SettingsProfile/Nutrition/Theme/System) — labels uppercase opcional |
| Progress "Nutrición y sueño" bar + line chart combinado + CTA `PERMITIR SUEÑO` | 1095 | **Adapt** | Futuro — HealthKit sleep integration (Q6+) |
| "Favoritos" como card bajo charts en Progress | 1095 | **Copy** | `<FavoritesCard>` enlace en Progress → `Profile → Favoritos` |
| Testimonial 5★ + quote en paywall | 1068 / 1079 | **Adapt** | ADR-008 lo contempla — citas reales opt-in, no inventadas |
| "AHORRA 50%" pill amber permanente top-left con countdown implícito | 1068–1076 | **Skip** | Urgency dark pattern; ADR-008 lo prohíbe. |
| Reverse trial (Premium 7 días auto) | deep-dive §4 | **Skip** | Documentado como anti-patrón en `ux-patterns.md` §7.3. Trial debe ser opt-in. |
| Foto chef real en diet plan cover (humanos reales, no stock) | 1077 / 1080 / 1082 | **Copy** | `<DietPlanCard>` cover — comprar/encargar foto ES mediterránea real (Q16+) |

---

## 3. Catálogo de capturas (39 de 39)

Agrupadas por flujo. Cada IMG anota layout + tokens + affordances + intent.

### A. Onboarding marketing + social proof (IMG_1056–1059)

- **IMG_1056** — Splash "Esto es el comienzo de tu nueva vida". Hero foto fullbleed woman eating tacos (emotive eating), logo wordmark blanco serif top, H1 bold serif-or-sans blanco 32px "Esto es el comienzo de tu nueva vida" + subtitle 15px, dual-CTA verde-lima full-width `CREAR CUENTA` + outlined blanco `INICIAR SESIÓN`. Status bar natural iOS, dots paginador 2/3 arriba. Intent: **foto-emocional primera impresión** que RIAL debería emular al llegar a splash.
- **IMG_1057** — Card 3D con foto de comida + chat-bubble "¡Buena elección! Esta comida te mantendrá con energía y sin altibajos" + badge verde raylike esquina. H1 "Comer bien mejora tu día" 28px + subtitle 15px. Sin CTA — usa dots paginador + swipe. Pattern: **science-driven microcopy** como hook.
- **IMG_1058** — Foto hero same woman eating taco feliz. H1 "Tienes todo lo necesario para lograrlo" + subtitle. Dots paginador bottom. Sin CTA — swipe-forward.
- **IMG_1059** — Social proof: card "App of the Day" + card "65+ millones usuarios" (fondo verde oscuro + verde-lima). Testimonial Trustpilot-style 5★ "Gracias, Lifesum / Cumple con lo que oferta..." + "65K VALORACIONES 4.6 ★★★★★". CTA verde-lima `SIGUIENTE`. Pattern: **social-proof stack con App Store authority badge** — defensible si honest (RIAL aún no tiene 65M users, no replicar número fabricado).

### B. Onboarding cuestionario (IMG_1060–1062)

- **IMG_1060** — "Además del peso, ¿qué más te importa?" **Single-select list** de 6 cards verticales (Días con más energía / Estabilizar estado ánimo / Sentirme bien conmigo / Tener más estructura / Aprender a cocinar mejor / Sentirme mentalmente equilibrado/a). Cards fondo blanco + border hairline gris + radius 12px + 60px alto + gap 12px. Sin chevron-right. Back-chevron top-left + progress bar horizontal fina 40% fill. Hint gris pequeño bottom "Esto nos ayuda a personalizar tus recomendaciones". **Sin CTA** — tap selecciona y avanza. Pattern: **auto-advance single-select** reduce fricción vs radio + Siguiente.
- **IMG_1061** — "¿Qué es importante para ti?" **Multi-select** 8 cards (Envejecer con salud / Estabilizar niveles energía / Comer bien sin dietas estrictas / Mejorar resultados ejercicio / Encontrar nuevo equilibrio vida / Reducir estrés comida / Lograr equilibrio hormonal / Me siento bastante satisfecho/a). Cards seleccionadas fondo verde-lima `#8be25c`, deseleccionadas blanco. Hint + CTA `SIGUIENTE` verde-lima full-width sticky bottom. Pattern: **multi-select con fill de color** — visualmente más afirmativo que checkboxes.
- **IMG_1062** — "¿Qué te resulta difícil?" Multi-select 7 cards. Misma anatomía que 1061. 1 seleccionada ("Encontrar inspiración" en verde).

### C. Onboarding auth + cálculo meta (IMG_1063–1065)

- **IMG_1063** — "Tu plan a medida ya está listo". Hero foto desayuno (zumo + huevos + tostada) fullbleed top 50%. H1 + subtitle + 4 CTAs auth apilados: `CONTINUAR CON APPLE` (negro), `CONTINUAR CON GOOGLE` (blanco bordeado), `CONTINUAR CON CORREO` (blanco bordeado), `CONTINUAR CON FACEBOOK` (blanco bordeado con logo fb). Footer legal terms. Pattern: **4-way auth** con Apple prioritizado. RIAL hoy tiene Apple + Google + email.
- **IMG_1064** — "Tu peso objetivo / 74 kg" hero 56px bold. Decoración superior: **curva antropomorfa verde** que simula un cuerpo estirándose de Abr→May→Jun con nodo negro actual y nodo verde objetivo. Pill verde pequeño "¡Tú puedes!". Sub: "Tu plan personalizado / Vicente, lograrás tu meta para 29 de mayo de 2026" 17px. CTA verde-lima `CONTINUAR`. Pattern: **fecha-meta nominal** narra el progreso en términos humanos (29 de mayo, no "45 días"). La curva "cuerpo" es decorativa-questionable — la personalización del nombre sí es copiable.
- **IMG_1065** — "Tu objetivo nutricional diario". Hero ring con "Restante 856 / Meta 1712 kcal / Consumido" sobre foto comida fullbleed tapado con tint oscuro. Ring blanco simple stroke. H1 "El cambio es más fácil con objetivos claros" + CTA `CONTINUAR`. Pattern: **ring mockup en context** — teaser del Home real post-paywall.

### D. Onboarding feature-sell + paywall (IMG_1066–1068)

- **IMG_1066** — "Toma una foto — ¡es mágico!" Hero foto salmón-quinoa con overlay rectangle blanco (sugiriendo crop cámara). Label "La cámara reconoce tu comida". Botón shutter circular gris-claro bottom. Pattern: **photo recognition sell as demo** — no es función real aún, es mockup. Ok como sell; dark si después pay-gated.
- **IMG_1067** — "Descubre qué hay en tu plato / Valoración de comidas NUEVO" badge. Hero card foto bowl ensalada con **número grande 9 verde** chip top-left + 2 chips blancos debajo `+ Rico en proteínas` / `+ Bajo en azúcar`. Caption verde educativo "Este es un almuerzo de calidad con proteína excelente que se apoya a tu objetivo de aumentar de peso y está hecho con ingredientes enteros, mínimamente procesados". CTA `CONTINUAR`. Pattern: **food rating 1–10 with rationale chips** — el "9" visible sobre foto es copyable; la justificación verbal con caption es copyable.
- **IMG_1068** — Paywall "Elige tu plan". H1 36px bold + 5★ + quote. 2 cards de plan: **seleccionada** `Plan anual / 4,16 € / mes / 49,99 € el primer año, con facturación anual` badge verde top "50% de descuento" + border verde-lima. **Deseleccionada** `Mensual / 9,99 € / mes` desaturada gris. CTA `CONTINUAR` verde-lima + close-X top-right. Pattern: **2-tier pricing con anual highlighted + monthly ghost state**. ADR-008 RIAL → timeline temporal Bevel + 2 toggles anual/mensual Lifesum = combo.

### E. GDPR consent + Home (IMG_1069–1072)

- **IMG_1069** — GDPR consent como **sticky bottom sheet** ~70vh. Header "Información sobre privacidad" + body text-heavy políticas + toggles "Almacenar información en dispositivo" / "Medir rendimiento publicidad" + footer 2 CTAs `Aceptar todo` (verde-lima) / `Guardar configuración` (outlined). Powered-by Usercentrics brand. Pattern: **two-CTA consent** con bottom-sheet shape — RIAL `<GdprConsent>` debe migrar a `<BottomSheet size="compact">`.
- **IMG_1070** — **Home dashboard**. Header: logo "Lifesum" centrado + icons `person` y `bell` right + pill amber `AHORRA 50%` left. Sub-header: chevron-left "HOY, 17 ABR" chevron-right con calendar-icon centrado. **Hero ring** fondo gradient verde-lima→cream: "Consumido 0 / Restante 2814 / Objetivo 2814 kcal / Quemado 0" en 3 columnas sobre semi-donut. Grid 3 macros `Hidratos 0/352g` / `Proteínas 0/141g` / `Grasas 0/94g` con barra fina hair color-coded. Lista "REGISTRO DE ALIMENTOS" con 4 cards slot (Desayuno / Almuerzo / Cena / Tentempié) emoji + "Recomendado 704–985 kcal" + `+` chip circular gris. BottomNav 5 slots: `Diario` (active) / `Progreso` / `+` FAB verde circular elevado / `Dietas` / `Recetas`. Pattern: **hero gradient ring + macros + slot cards + FAB**.
- **IMG_1071** — Scroll Home. Macros grid condensed top, food log ampliado (4 slot cards visibles), "REGISTRO DE ACTIVIDAD / 0 kcal quemado" card + "SEGUIMIENTOS DIARIOS" label.
- **IMG_1072** — Scroll más: "REGISTRO DE ACTIVIDAD / 0 kcal quemado" + **Daily trackers** 3 cards:
  - `Agua (0 L)` + 8 iconos vaso gris (1 con `+` activo).
  - `Contador de verduras` + 3 iconos brócoli ilustrativos (vacíos/outline).
  - `Contador de frutas` + 3 iconos manzana ilustrativos.
  Cada card con `...` menu overflow. CTA bottom "PROGRESO DIARIO" pill gris. Pattern: **habit trackers con iconos ilustrativos + click para incrementar**. ICP RIAL puede beneficiarse — RIAL hoy tiene `hydration` + `movement` en Settings pero no surfaced en Hoy.

### F. Progreso tab (IMG_1073–1074, 1094, 1095)

- **IMG_1073** — "TU LIFE SCORE SEMANAL" card hero. **Semi-donut gradient verde** con labels perimetrales "DESEQUILIBRADO / BIEN / GENIAL / EXCELENTE / DESEQUILIBRADO" + número central grande "0 /150". Copy "¡Vicente, obtén tu Life Score! / Obtén estadísticas sobre tus hábitos alimenticios y deportivos, y consejos personales para aumentar tu puntuación" + CTA verde-lima outlined `HAZ EL TEST`. Sub-section "TRAMOS" 2 cols: `0 día / Tramo actual` / `0 día / Tramo más largo`. Pattern: **Life Score como hero rolled-up metric** + **streak dual**. Copyable exacto.
- **IMG_1074** — Scroll. "META DE PESO" card con **ilustración acuarela morada de báscula** + "Peso meta: 74 kg / Cada kilo empieza con un gramo, no te olvides de mantenernos informados sobre tu progreso" + CTA verde outlined `ACTUALIZA TU PESO`. `...` overflow. "Progreso hacia el objetivo" chart line con rango 70–72 kg en eje Y + **bubble verde "71 kg"** anclado al nodo más reciente de la línea. Pattern: **bubble annotation** pisa valor sobre curve — copyable al `<WeightTrendCard>`.
- **IMG_1094** — Scroll Progress: "META DE PESO" card condensed + "Progreso hacia el objetivo" chart estirado más visible.
- **IMG_1095** — Continúa Progress: "NUTRICIÓN Y SUEÑO" card con combo-chart (bars amber kcal + line verde kcal/avg) + stats "Calorías prom. 1969 kcal (ejemplo) / Sueño promedio 7h 20m (ejemplo)" + caption + CTA heart `PERMITIR SUEÑO` (HealthKit request). "Favoritos / Alimentos, comidas y recetas" card lineal con chevron. Pattern: **combo-chart nutrition+sleep** requiere HealthKit — defer a Q6+.

### G. Dietas tab (IMG_1075–1083)

- **IMG_1075** — Tab Dietas. Header verde oscuro fullbleed con H1 blanco "Encuentra tu plan" + subtitle + CTA pill blanco `HAZ EL TEST`. Dots paginador 7 dots. Sección "EQUILIBRADA" carrusel horizontal 2 visibles: `Vitalidad / Come como las personas más longevas del mundo` + `Desintoxicación de azúcar / Plan de comidas de 21 días`. Sección "AYUNO" 2 cards visibles: `Ayuno matutino 16:8` + `Ayuno vespertino 16:8`. Pattern: **tab dedicada con carrusel horizontal por categoría**.
- **IMG_1076** — Scroll Dietas: "EQUILIBRADA" → `Alimentación, Pesas y Repeticiones / Nutre tus músculos` + `Balance Hormonal / Plan 21 días`. "AYUNO" repetido. "ALTA EN PROTEÍNAS" 2 cards: `Alimentos para fuerza / Más musculatura` + `Escandinava / Alta en fibras y grasas saludables`. Link subtle "Fuentes de recomendaciones" bottom. Pattern: **categoría como grouping horizontal**.
- **IMG_1077** — Diet plan detail "Alimentación, Pesas y Repeticiones". Hero fullbleed foto chef real con pesa + label small-caps "ALIMENTACIÓN EQUILIBRADA" + H1 bold "Alimentación, Pesas y Repeticiones" + CTA pill blanco translúcido `EMPEZAR PLAN`. Sub-header "Un plan de alimentación para el rendimiento y la recuperación muscular". Sección "Recetas" carrusel horizontal circle-cropped photos. Back-chevron top-left.
- **IMG_1078** — Scroll detail: "Tu foco" title. Donut macros "2814 kcal / Hidratos 50% / Proteínas 20% / Grasas 30%" + 2 listas "QUÉ HACER Y QUÉ NO HACER" con check-verde / cross-gris por item ("Ten siempre a mano una botella de agua y registra tu consumo para mantenerte hidratado" ✓ / "No consumas menos cantidad de calorías que lo recomendado" ✗). CTA `EMPEZAR PLAN` outlined. Pattern: **do/don't bipartite list** — utilizable en `DietPlanDetail`.
- **IMG_1079** — Paywall "Ten 5 veces más probabilidades de lograr resultados con Premium". Layout idéntico a 1068. Mismos 2 tier cards. Close-X top-right. Pattern: **re-exposure al paywall al intentar empezar un plan**. Claim estadístico sin fuente = skip.
- **IMG_1080–1083** — Scroll detail recipes carrusel: `Pan de banana` / `Batido fresa-mantequilla-cacahuate` / `Pancakes de banana` / `Pasta con salsa de picadillo vegano`. Cada foto circle-cropped con título debajo 14px. Scroll horizontal infinito. Pattern: **circle-cropped recipe thumbs en carrusel** — decorative, copyable.

### H. Recetas tab (IMG_1084–1088)

- **IMG_1084** — Tab Recetas. Top: chip activa verde-lima `ESTÁNDAR DE LIFESUM` (user's active plan lens) + search bar con filter-icon-verde right. Sección "LO QUE ESTÁ DE MODA" carrusel horizontal: `Preparandocomida` (meal prep jars foto) + `Cetogénica` visible parcial. Sección "DESAYUNO" grid 2-col con `Tacos para el desayuno 280 kcal ♡` + `Cheesecake con avena de la noche a la mañana 373 kcal ♡`. BottomNav. Pattern: **search + plan-lens chip + trending + slot-sections**.
- **IMG_1085** — Recetas filtered. Chip activa `CETOGÉNICA ESTRICTA x` bajo search (removible). Grid 2-col 4 recetas visibles: `Brochetas de salmón con lima, ají y ajo 354 kcal` / `Besugo a la parrilla con limón y tomillo 308 kcal` / `Ensalada de pollo y cheddar 321 kcal` / `Salsa holandesa rápida 233 kcal`. Count badge "1" verde-lima top-right. Pattern: **filter chip removible + counter badge**.
- **IMG_1086** — Scroll Recetas: "DESAYUNO" `Muffins de batata 292 kcal` / `Granola de almendras con extracto de vainilla 218 kcal` / "ALMUERZO" `Sopa instantánea de fideos ramen picante` / `Ensalada de brócoli crudo y tofu con aderezo de semilla...`.
- **IMG_1087** — Scroll: "ALMUERZO" + "CENA" `Garbanzos cásate conmigo 440 kcal` / `Calabaza moscada rellena con doble cocción 289 kcal` / "TENTEMPIÉ" visible.
- **IMG_1088** — Scroll: "TENTEMPIÉ" `Dulce de batata congelado 105 kcal` / `Pastel de cardamomo con crema de coco batida 234 kcal`. **Banner bottom naranja full-width** `🔒 DESBLOQUEAR TODO` + subtitle gris "Disfruta de acceso ilimitado a recetas saludables". Pattern: **bottom paywall banner** — no oculta contenido previo, solo sella el final del feed. Copyable (vs dark-pattern de oscurecer contenido).

### I. Recipe detail (IMG_1089–1090)

- **IMG_1089** — Recipe `Granola de miel y nueces`. Hero foto bowl granola fullbleed top 40%. Back-chevron top-left + share-icon top-right. Badge "por Lifesum" attribution. Porción row: `1 | Ración` (dropdown) / `Cena` (dropdown). Stats inline 2-col: `🔥 276 kcal` / `🕐 35 min.` Sección "INFORMACIÓN NUTRICIONAL" con macros oscurecidos/blurred (ver `21%` visible por encima). **Banner gate** "¿Quieres ver recetas deliciosas creadas por nutricionistas?" + CTA naranja `VER TODAS LAS RECETAS`. Pattern: **dark-pattern blur** — skip. La estructura general (hero + porción dropdown + slot dropdown + macros) sí copiable.
- **IMG_1090** — Recipe detail 2 `Bol de pollo con miso`. Scroll: `1 | Ración` + `Cena` + `506 kcal` + `40 min.` + "INFORMACIÓN NUTRICIONAL" tabla oscurecida (sombras sobre Calorías/Hidratos/Fibra/Asociados/Proteínas/Grasas/naturales/unsaturadas/Colesterol/Sodio/Potasio) + banner gate `VER TODAS LAS RECETAS`. Mismo dark-pattern. El **layout de nutrition facts como table lineal** con row color-coded (azul hidratos / rojo proteínas / morado grasas) sí es referencia.

### J. Profile + Ajustes (IMG_1091–1092)

- **IMG_1091** — "Perfil". Back-chevron + título "Perfil" centrado + gear-icon top-right. Card user: avatar placeholder + pill amber `ACTUALIZAR` + nombre "Vicente Calvarro" + "27 años". 3 key-value rows `Peso actual / 71 kg` / `Objetivo / Ganar Peso` / `Dieta activa / Estándar de Lifesum`. Section "PERSONALIZACIÓN" 5 rows lineales con icon + label + chevron-right: `Datos personales` / `Ajustar macronutrientes / Hidratos, grasa, proteína` / `Ajustar calorías / 2814 kcal/día` / `Necesidades y preferencias nutricionales` / `Consumo de agua`. Pattern: **profile as key-value summary + settings drill-down** — copy "Dieta activa" row cuando Diet Plans exista.
- **IMG_1092** — Ajustes. 6 secciones con label uppercase small-caps + rows lineales: `CUENTA` → `Invitar amigos` / `Ajustes de cuenta` / `Gestionar suscripción Gratis` / `Restaurar compras`. `DIARIO Y NOTIFICACIONES` → `Configuración del diario` / `Ajustes de las notificaciones`. `IMPORTAR DATOS DE SALUD` → `Seguimiento automático`. `SOCIAL` → `Facebook Conectar`. `AYUDA` (cut off). Pattern: **uppercase section labels** + linear list — RIAL ya tiene patrón similar en Settings tabs.

---

## 4. Principios destilados

### 4.1 Sistema visual — cream + lime como firma

| Token | Valor Lifesum | RIAL actual | Acción |
|---|---|---|---|
| Fondo base | `#f5f0e8` (cream warm, cercano a stone-100) | NEUTRAL light usa `#fafaf9` (stone-50) — más claro | **Skip** (stone-50 es suficientemente warm; cream de Lifesum sesga hacia "beige mujer 30s europea") |
| Accent primario | `#8be25c` (lime fresh) | VOLT usa `#dcfd05` más electric/yellow | **Skip** — VOLT ya ocupa el espacio "verde técnico" con más personalidad |
| Accent secundario / paywall urgency | `#f59e0b` orange / `#fb923c` | EMBER amber-600 | Ya tenemos paleta naranja — **no adoptar el amber permanente de Lifesum** |
| Chart-line positive | `#22c55e` / `#8be25c` | NEUTRAL `--brand-secondary` emerald-600 | **Match** — color similar; no action |
| Card radius | `12px` (rounded-xl) | RIAL `rounded-sm` 16px + `rounded-md` 20px | Mantener RIAL — Lifesum es 1 step menos redondeado, pero RIAL coherente |
| Card shadow | `shadow-none` + border hairline `#e5e7eb` | Borderless en light post-Bevel | **Mantener RIAL borderless** — Lifesum aún usa hairline border, menos limpio |
| Divider | `#e5e7eb` + `1px` | RIAL outline-variant/20 | Match |
| Sheet overlay | `bg-black/40` aprox | `bg-black/25` (ADR-009) | **Mantener RIAL 25%** |

**Lectura neta:** el sistema visual de Lifesum es **competente pero menos distintivo que lo que RIAL ya tiene** post-PR3. No adoptar tokens de fondo/acento — conservar las 4 paletas. Sí **aprender el rigor**: una sola paleta aplicada con consistencia total (un solo verde-lima en TODOS los CTAs, un solo cream en TODOS los fondos). RIAL debe auditar que en NEUTRAL el accent emerald se use consistentemente.

### 4.2 Tipografía

Lifesum usa un sans-serif condensado (parece DM Sans o Söhne) con:
- H1 28–32px bold.
- H2 sección-label 12px uppercase tracking-widest.
- Body 15–17px regular.
- Stat hero 48–56px bold (Tu peso objetivo 74kg IMG_1064).
- Chips / pills 12px medium.

RIAL mantiene escala similar en `src/index.css`. **Ningún cambio**. Divergencia consciente: RIAL usa JetBrains Mono para macros numéricas — Lifesum es sans uniform. No copiar.

### 4.3 Information design — Home

Patrón Lifesum IMG_1070:

```
[Header: logo + icons right + AHORRA 50% pill permanente left]
[Sub-header: date navigator (← HOY, 17 ABR →)]
[Hero: ring semi-donut con 3 números cardinales + macros fines debajo]
[Registro alimentos: 4 cards slot con emoji + recomendación + + chip]
[Registro actividad: 1 card]
[Seguimientos diarios: 3 cards habit-tracker (Agua/Verduras/Frutas)]
[CTA "Progreso diario" outlined]
```

**Qué copiar para RIAL Home (ICP-adaptive, post-PR 8):**
- **Variante "restante-first"** del `<NutritionHero>` — "Restante 856" como número hero, "Consumido" y "Quemado" secundarios. Framing más amable para Clara (no-gym). ICP-adaptive switch: Marcos (gym) ve "consumido", Clara ve "restante", Ana ve "objetivo para familia".
- **Recomendación por slot** en `<TodaysMeals>`: "Desayuno / Recomendado 704–985 kcal" es útil. RIAL hoy solo muestra kcal total target. Implementar distribución estándar (breakfast 25% / lunch 35% / dinner 30% / snack 10%).
- **Daily trackers** como card propio en Hoy tab: `<HabitTile>` con iconos ilustrativos (vaso / brócoli / manzana) incremental por tap. Reutilizar el `hydration` existente + añadir "verduras" y "frutas" como habit counters básicos.

**Qué NO copiar:**
- Pill `AHORRA 50%` permanente en header — urgency dark pattern.
- Los 5 items de BottomNav: 4 + FAB central funciona igual, no añadir más slots.

### 4.4 Sheets y modales

Lifesum usa pocos bottom sheets explícitos en las 39 capturas — el flujo es mayoritariamente **full-screen routes** (onboarding, diet detail, recipe detail, paywall). El **único sheet genuino** observado: GDPR consent (IMG_1069).

Implicación: RIAL tiene **sistema de sheets más rico** (ADR-009 V2) que Lifesum. No hay patrones de sheet que copiar. La anatomía del GDPR sheet de Lifesum es estándar (body scrolleable + 2 CTAs sticky bottom) — el `<GdprConsent>` RIAL actual ya queda cerca; migrarlo a `<BottomSheet size="compact" headerLayout="title-centered">` per §4.4.b del Bevel playbook cerraría la alineación.

### 4.5 Empty states

Home con macros en 0/target (IMG_1070) es técnicamente un **zero-state invisible** — Lifesum no muestra copy "aún no has registrado nada", simplemente deja los valores en 0 y las barras vacías. Los cards slot (`+ Desayuno` / `+ Almuerzo`) actúan como affordances.

**Lectura:** esta es una elección defendible — no hacer ceremony sobre el vacío del primer día. RIAL hoy a veces muestra empty states con CTAs agresivos (`<EmptyState>` con "Empieza por registrar..."). Considerar **variant `silent`** del `<EmptyState>` que simplemente muestre los affordances normales sin header dedicado. No crítico — decisión ICP.

### 4.6 Badges, pills, chips

- **Chip `+ Rico en proteínas` / `+ Bajo en azúcar`** (IMG_1067) — el signo `+` prefix comunica "esta receta TIENE esto bueno" en vez de "atributo neutro". Copyable para `<RecipeCard>` (Q21+ Real Score era).
- **Chip activa `ESTÁNDAR DE LIFESUM` / `CETOGÉNICA ESTRICTA x`** (IMG_1084/1085) — cuando el user tiene un Diet Plan activo, el chip es **permanent visible** arriba del grid y **removible con `x`**. Copiable para Cocina cuando Diet Plans entre (Q15+).
- **Badge `NUEVO` verde-lima** (IMG_1067) — feature-announcement pill con fondo verde y texto blanco bold 11px. Copyable para announcements en `CHANGELOG`-linked features.
- **Pill permanente `AHORRA 50%` / `ACTUALIZAR`** — skip, urgency dark.

### 4.7 Pricing

Lifesum paywall (IMG_1068, IMG_1079):
- **Timing**: post-onboarding completo (nombre + metas + cuestionarios + auth creada) → paywall.
- **Content**: H1 emocional + 5★ + quote + 2 tier cards (anual seleccionado + mensual secundario) + CTA `CONTINUAR`.
- **Claim**: "Ten 5 veces más probabilidades de lograr resultados con Premium" — **sin fuente** = skip (ADR-008 prohíbe pseudo-science).
- **Reverse trial**: no visible en capturas pero documentado en deep-dive — CTA `CONTINUAR` aparentemente pasa a StoreKit con 7d free auto-enrolled. **Skip explícito** (ADR-008 § trial = opt-in).

**Qué copiar para `<RialPlus>`:**
- Estructura 2-card plan (anual highlighted + monthly ghost). RIAL actual tiene solo tier único; el 2-card selection visual simplifica decisión.
- Close-X top-right (RIAL ya lo tiene).
- Quote real opt-in (ADR-008 compliant) con autor + foto.

**Qué NO copiar:**
- `AHORRA 50%` urgency pill permanente en app-chrome post-paywall (IMG_1070–1076).
- Claim "5× más resultados".
- Reverse trial auto-enroll.

### 4.8 FAB + nav

BottomNav Lifesum: 4 + FAB centered.
- `Diario` (home) / `Progreso` / `+` FAB verde elevado / `Dietas` / `Recetas`
- FAB es único entry al log — ata 4 modalidades (foto / voz / texto / barcode) según deep-dive.

**RIAL hoy** tiene BottomNav con 5 items + FAB central. Diferencias:
- Lifesum 4 items equidistribuidos + FAB central = más limpio visualmente.
- RIAL tiene más tabs (Hoy / Cocina / Explora / Progreso / Más o similar) + FAB — justificable pero verificar peso visual.

**Decisión:** No migrar nav layout. RIAL nav está medido por ICP ya. Sí tomar el **concepto "FAB = único entry a + Track"** y auditar que el FAB actual RIAL converja a un picker con 4 opciones (Text / Barcode / Photo / Voice) cuando Photo+Voice lleguen (Q6+).

### 4.9 Lo que NO copiamos

- **Reverse trial** (7d Premium auto) — `ux-patterns.md` §7.3, ADR-008 prohíbe.
- **Claim estadístico sin fuente** "5× más probabilidades" — pseudo-science.
- **Dark pattern de blur/oscurecer ficha nutricional previamente visible** (IMG_1089/1090) — gate fuerte contra user intent.
- **Pill `AHORRA 50%` permanente en chrome** — urgency agresivo.
- **Curva antropomorfa del peso** (IMG_1064) — decorativa kitsch que no escala a Marcos.
- **Ilustración acuarela morada de báscula** (IMG_1074/1094) — estilo específico Lifesum, choque con 4 paletas RIAL.
- **Foto-first onboarding gate** (si estuviera) — Cal AI antipattern.
- **Testimonials inventados** — RIAL solo muestra quotes reales opt-in.

### 4.10 Diet Plans como lente global — patrón único Lifesum

**Descripción.** El user elige un plan (Mediterránea / Keto / 16:8 / Alta proteína / etc.) durante onboarding o más tarde desde tab Dietas. El plan activo:
1. Aparece como chip permanente en Recetas tab (IMG_1084 `ESTÁNDAR DE LIFESUM`).
2. Filtra automáticamente el grid de recetas (IMG_1085 `CETOGÉNICA ESTRICTA x`).
3. Aparece en Profile como row `Dieta activa` (IMG_1091).
4. Re-calibra macros targets según el plan (keto 5/20/75 vs estándar 50/20/30).

**Por qué funciona.** Reduce decisión al extremo. "¿Qué como hoy?" → "lo que mi plan activo me sugiere". Especialmente valioso para Clara (no sabe) y Ana (plan familiar).

**Por qué RIAL no lo tiene hoy.** Filtros actuales son ortogonales (`MealSlot[]` + `collections` + `tags`). El concepto "plan" es superordinate — combina macros + collection + philosophy.

**Implementación propuesta (PR deferred — Q15+):**
- Nuevo tipo `DietPlan` en `src/types/diet-plan.ts`: `{ id, title, description, heroImage, macroSplit: {carbs,protein,fat}, suggestedCollections: string[], culturalContext?: 'es-mediterránea'|'generic' }`.
- Seed `src/features/recipes/data/diet-plans.ts` con 4–6 plans: `Mediterránea ES` (diferencial vs Lifesum Scandinavian), `Alta proteína`, `16:8`, `Vegetariana`, `Equilibrada`.
- `AppStateContext.activeDietPlan: DietPlan | null` + setter.
- Chip permanente en `Cocina.tsx` cuando `activeDietPlan !== null`.
- Filter automático `recipeFitsDietPlan(recipe, plan)` basado en collections del plan.
- Card "Dieta activa" en `Profile.tsx` + `SettingsNutrition.tsx`.
- Nuevo screen `<DietPlanDetail>` con layout IMG_1077/1078 pattern (hero + "Tu foco" donut + do/don't lists + "Empezar plan" CTA).
- Nuevo tab o sub-tab en Cocina/More "Dietas" con grid cards IMG_1075/1076.

**Diferenciación vs Lifesum.** RIAL debe anclar Mediterránea ES como plan-hero (Lifesum tiene "Mediterranean" genérica + "Scandinavian" como acento local). Foto real cocina ES (paellas, pinchos, platos de cuchara) → moat cultural.

### 4.11 Life Score — Progress hero consolidator

**Descripción (IMG_1073).** Semi-donut gradient verde con labels perimetrales ("DESEQUILIBRADO / BIEN / GENIAL / EXCELENTE") + número central "0 /150". Consolida múltiples dimensiones en un solo score.

**Framing.** Lifesum posiciona el score como "trabajo en progreso" (0/150 en screenshot nuevo user) — inspira completar. Labels son aspirational positive, no punitive.

**Implementación propuesta (PR — post PR 9):**
- Primitive nuevo `<LifeScoreRing>` en `src/components/LifeScoreRing.tsx`:
  - SVG semi-donut 180° con stroke gradient verde (`text-primary` → `text-brand-secondary`).
  - Labels perimetrales 4 segments (texto uppercase 10px tracking-widest).
  - Número central `text-display` bold.
  - Tap → detail drill-down a contribuyentes.
- Util `computeLifeScore(userData): { score: 0–150, contributors: {label, weight, delta}[] }` en `src/features/wellness/utils/life-score.ts`.
  - Inputs: adherencia logging 7d + variedad alimentos + hidratación + streak + activity minutes + RealFeel trend.
  - Weights: decididos por ICP (Marcos pondera activity más; Clara pondera RealFeel más).
- `Progress.tsx` top — sustituye o complementa `WeeklyScoreCard` actual.
- `Progress → Score Detail` screen con contribuyentes como `<StatTile>` grid + sparkline por dimensión.
- i18n keys `t.progress.lifeScore.*` con labels 4 segments en ES + EN.

**Relación con `WeeklyScoreCard` existente.** `WeeklyScoreCard` hoy es textual/numérico. `<LifeScoreRing>` es visual-first. Dos opciones:
- (a) Sustituir `WeeklyScoreCard` por `<LifeScoreRing>` — más visual, menos texto.
- (b) Mantener ambos — `<LifeScoreRing>` como hero + `WeeklyScoreCard` como breakdown below.
- **Decisión propuesta**: (b). `<LifeScoreRing>` es hero que invita a clicar; `WeeklyScoreCard` sigue dando el por qué.

### 4.12 Food rating 1–10 — recipe card annotation

**Descripción (IMG_1067).** Foto receta con **número grande "9" verde** chip top-left + chips blancos `+ Rico en proteínas` / `+ Bajo en azúcar` + caption educativo verde. Rating 1–10 reemplaza estrellas o NutriScore letra.

**Por qué funciona.** 1–10 es granular pero intuitivo. Color (verde = bueno) refuerza. Los chips `+` prefix comunican "tiene esto **bueno**", no "atributo neutro".

**Implementación (referencia Q21+ — NOT commit now):**
- `Recipe.realScore?: { value: 1..10, reasons: string[] }` — computed server-side en Q6+ o heurística client-side con NOVA + density.
- `<RecipeCard>` añade chip numérico top-left **solo si** `realScore.value` presente.
- `<RecipeDetail>` añade caption educativo debajo del hero explicando el score.
- Diferencia vs Nutri-Score A–E: 1–10 es más comunicativo para receta compleja; A–E es simplificación categórica de ingredientes individuales. RIAL puede tener AMBOS — alimentos individuales llevan NutriScore OFF, recetas llevan RealScore 1–10.

---

## 5. Roadmap de ejecución

| PR | Scope | Archivos nuevos | Archivos amendment |
|---|---|---|---|
| **L1** | `<NutritionHero>` variant "restante-first" + rango recomendado por MealSlot en `<TodaysMeals>` | — | `src/features/home/components/NutritionHero.tsx` (prop `hero: 'consumido' \| 'restante'` default actual, ICP-adaptive logic), `src/features/home/components/TodaysMeals.tsx` (compute rango por slot con split 25/35/30/10), i18n 4 keys × 2 locales (`todaysMeals.recommended.{breakfast,lunch,dinner,snack}`), `docs/PRIMITIVES.md` (tabla `<NutritionHero>` annotate variant prop) |
| **L2** | `<HabitTile>` primitive + surface Hidratación/Verduras/Frutas en Hoy | `src/components/HabitTile.tsx`, `src/test/conventions/habit-tile.test.ts` | `src/features/home/screens/Home.tsx` (monta `<HabitsSection>` entre NutritionHero y `<RecipeSuggestions>`), `src/contexts/AppStateContext.tsx` (+ `vegServings`, `fruitServings` persisted keys + SyncKey candidates), i18n +6 keys × 2 locales |
| **L3** | `<WeightTrendCard>` annotation bubble en el nodo más reciente (IMG_1074/1094) + formatear target-eta | — | `src/features/wellness/components/WeightTrendCard.tsx` (SVG bubble + label text valor+unidad en nodo final), `src/features/wellness/utils/weight-trend.ts` (+ `computeTargetEta(snapshots, targetKg)` — devuelve fecha Date estimada según EMA slope), i18n `t.progress.targetEta` con template "{{date}}", tests `weight-ema.test.ts` +2 asserts |
| **L4** | `<GdprConsent>` migration to `<BottomSheet size="compact">` (cierre pendiente del Bevel §4.4.b) | — | `src/components/GdprConsent.tsx` (sustituye manual `fixed inset-0` por `<BottomSheet>`), i18n labels ya existen, convention test `bottom-sheet.test.ts` +1 assert (no consumer regresiona shape) |
| **L5** | `<LifeScoreRing>` primitive + `computeLifeScore()` + Progress integration | `src/components/LifeScoreRing.tsx`, `src/features/wellness/utils/life-score.ts`, `src/features/wellness/utils/life-score.test.ts`, `src/test/conventions/life-score-ring.test.ts` | `src/features/wellness/screens/Progress.tsx` (monta `<LifeScoreRing>` encima de `WeeklyScoreCard`), `src/types/index.ts` (+ `LifeScore` type), i18n +8 keys × 2 locales (`t.progress.lifeScore.{title,segments[0..3],hint,ctaTest}`), `docs/PRIMITIVES.md` tabla + ejemplo |
| **L6** | `<DietPlan>` infrastructure (type + seed 5 plans + state context) — **sin UI todavía** | `src/types/diet-plan.ts`, `src/features/recipes/data/diet-plans.ts`, `src/features/recipes/utils/diet-plan-filter.ts`, `src/features/recipes/utils/diet-plan-filter.test.ts` | `src/contexts/AppStateContext.tsx` (+ `activeDietPlan: string \| null` + setter + SyncKey `'activeDietPlan'`), `src/lib/seedVersion.ts` (+ `dietPlans: 1`), i18n namespace `t.dietPlan.*` +15 keys × 2 locales. **Sin visual changes** — prepara terreno para L7. |
| **L7** | Dietas tab + `<DietPlanCard>` + `<DietPlanDetail>` + chip permanente en Cocina | `src/features/recipes/screens/Dietas.tsx`, `src/features/recipes/components/DietPlanCard.tsx`, `src/features/recipes/components/DietPlanDetail.tsx`, `src/features/recipes/components/DietPlanFocus.tsx` | `src/features/recipes/screens/Cocina.tsx` (chip permanente top cuando `activeDietPlan`), `src/features/profile/screens/Profile.tsx` (key-value row "Dieta activa"), `src/features/profile/components/settings/SettingsNutrition.tsx` (picker + deselect + reset macros), navigation route, i18n strings de 5 plans (hero/description/do/don't) × 2 locales |
| **L8** | `<RecipeCard>` + `<RecipeDetail>` food rating annotation (condicional a `realScore`) — infra solo, heurística placeholder | `src/features/recipes/utils/real-score.ts` (heurística NOVA-lite: ingredient count + process markers), `src/features/recipes/utils/real-score.test.ts` | `src/types/recipe.ts` (+ `realScore?: { value: 1..10, reasons: string[] }`), `src/components/patterns/RecipeCard.tsx` (chip número top-left condicional), `src/features/recipes/screens/RecipeDetail.tsx` (caption educativo bajo hero), i18n +4 keys × 2 locales |

Governance: trabajar directo en `main`. Cada PR = commit + `release:preflight` verde + push a `rial-food/main` tras aprobación "continua". L1–L4 son incrementales bajo-riesgo (no introducen nuevo eje de state); L5+ abren superficie nueva (Life Score modelo, Diet Plan state). L6–L8 conviene agruparlos como sprint "Diet Plans" post-Q15.

---

## 6. Verificación / preflight

```bash
npm run release:preflight
# tsc + lint + lint:code + check:i18n + test + build + size:check

preview_start
# Flows clave a verificar visualmente:
# 1. Home — <NutritionHero> variants (consumido vs restante) en 4 paletas × 2 modos = 8 combos
# 2. Home — <HabitTile> incrementar tap + contador por slot, verificar tap target ≥ 44×44
# 3. Progress — <LifeScoreRing> score 0 (empty) → 75 (mid) → 140 (high) visual gradient
# 4. Cocina — chip permanente diet plan activo + remove → grid re-filter
# 5. <GdprConsent> en sheet migration — status bar visible, overlay 25%, dismiss via swipe
# 6. <WeightTrendCard> annotation bubble — dato más reciente anotado + target-eta legible
```

Baselines a mantener verdes en cada PR:
- TypeScript 0 errors.
- i18n symmetric (espera `1561 + keys_nuevos × 2` tras cada PR).
- Tests: nuevos convention tests (habit-tile, life-score-ring, diet-plan-filter, real-score).
- Build budget: `<LifeScoreRing>` añade SVG custom (~1 KB), `computeLifeScore` puro (<0.5 KB) — total headroom ~15% sigue holgado post-PR7.

---

## 7. Fuentes

- Capturas: `docs/market/Competitor Images/Lifesum/` (IMG_1056–IMG_1095, 39 archivos, sin IMG_1093).
- Deep-dive descriptivo: `docs/market/deep-dives/lifesum.md`.
- Doctrina general competidores: `docs/market/ux-patterns.md` (secciones 2.3, 3.2, 7.3 específicas Lifesum).
- Sistema RIAL actual: `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/adr/ADR-001` a `ADR-009`.
- Hard metrics: Sensor Tower feb 2026 ~$800k/mes · Trustpilot 1.7★ · 65M downloads claim (source ver deep-dive).

---

## 8. Notes for reviewer

- **Dart sobre Trustpilot 1.7★**: Lifesum es caso de éxito comercial + fracaso UX percibido. Extraer visual y diet plans sin replicar la monetización. ADR-008 sigue siendo el guardrail.
- **L6+L7+L8 forman un sprint "Diet Plans"** — estimación alta (~3–5 PRs reales). Confirmar timing post-Q15 o defer si el gate de feature-freeze se cierra por Q6 Supabase.
- **`<LifeScoreRing>` puede colisionar con `WeeklyScoreCard`** si se ship in parallel — decisión propuesta (§4.11): mantener ambos (ring como hero visual, card como breakdown). Validar con owner antes de L5.
- **Cream `#f5f0e8` y lime `#8be25c` NO se adoptan** — la paleta NEUTRAL light cubre el hueco warm-wellness sin copiar la identidad Lifesum. Si el owner quisiera un "palette 5", sería decisión separada (requiere nuevo palette completo con dark variant + convention test update).
- **IMG_1093 ausente** — asumido como gap intencional (screenshots capturados en batch, uno no se guardó). No afecta la cobertura: 39/39 presentes leídos y catalogados.
