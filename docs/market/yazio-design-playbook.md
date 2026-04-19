# Yazio Design Playbook

> Accionable. Complemento del deep-dive (`deep-dives/yazio.md`, descriptivo) y la doctrina transversal (`ux-patterns.md`).
>
> Alcance: extraer las prácticas de diseño visibles en 11 capturas Yazio (IMG_1096–IMG_1106) que merece la pena **copiar, adaptar o descartar** para RIAL. Enfoque a la versión iOS ES de la app (estado abril 2026, Pro promo activa).
>
> Última revisión: 2026-04-19. Capturas en `docs/market/Competitor Images/Yazio/`.

---

## 1. Por qué Yazio como referencia

Yazio es competidor **directo** (tracking de calorías + macros + recetas + ayuno + agua + actividad), líder DACH y top-5 EU consolidado, con 80–100M descargas reportadas. Su sistema visual es interesante por **lo opuesto** a Bevel:

- **Mass-market friendly** vs Bevel "premium understated". Yazio empuja contraste, ilustraciones cálidas (mascota verde menta IMG_1096, hot-air balloon IMG_1106), emojis funcionales (☕🥗🍒🍎 como icono de meal-slot, IMG_1099). Bevel sería literal — Yazio narrativiza.
- **Single-accent verde + azul secundario** — verde menta `#2ec39a` aprox como brand primary, azul `#2f80ed` aprox para tabs/links. Convive con CTAs negros pill (IMG_1099 "Desbloquear todo"), mostrando que el negro es CTA-fuerte y el verde es brand-identity (no se pisan).
- **Rings ligeros, no protagonistas** — el ring kcal de IMG_1099 es semi-anillo abierto (~270°) gris claro con dot verde, no el "anillo Apple Watch" hero. El hero es el **número 2978 Restantes**, no el ring. Inversión de jerarquía vs MFP/Lifesum.
- **Free-tier con monetización agresiva pero sintácticamente correcta** — banner `Special Offer -79% 00:57:36` (IMG_1099) usa countdown + descuento + CTA negro. ADR-008 de RIAL evita el fake-urgency, pero el patrón "promo banner como segunda card del Home" es válido sin recurrir al timer.
- **Bottom-nav 5 tabs con `Pro` como destino, no como gate** — Diario / Recetas / Ayuno / Perfil / **Pro** (IMG_1099–1102). Pro es una pantalla, no un modal — reduce sensación de paywall blockante, aumenta discoverability. RIAL hoy mete Pro detrás de Más; replantear en Q17.
- **Densidad media-alta sin caos** — IMG_1100 alimenta 4 meal-slot cards + Registro de agua en una pantalla, IMG_1101 mete agua + valores corporales + actividades en otra. El truco: cada card es ~88 px alto, `rounded-md` blanco puro sobre fondo `#f4f4f3`, sombra mínima.

Tomar el vocabulario Yazio donde aporta (densidad de Diario, recetas-by-rango-calórico, mascota onboarding) sin copiar lo que choca con la doctrina RIAL (countdown urgency, gating del weekly meal plan).

---

## 2. Matriz Copy / Adapt / Skip

| Patrón Yazio | Referencia | Decisión | Dónde aterriza en RIAL |
|---|---|---|---|
| Mascota onboarding "monstruo verde" con copy emocional | IMG_1096 | **Skip** | RIAL apuesta a foto-realismo de comida; mascota resta credibilidad nutricional |
| Status-bar progress dots `2/3` integrados en dynamic-island band | IMG_1096–1102 | **Adapt** | `<OnboardingScaffold>` PR 9 — dots en lugar de barra |
| CTA negro circular flecha-derecha en onboarding paginado | IMG_1096 | **Copy** | `<OnboardingScaffold>` `primaryCta` variant `circular-icon` |
| Speech-bubble pill "¡Empecemos!" sobre el CTA | IMG_1096 | **Skip** | Ruido visual; un solo CTA legible es mejor |
| Onboarding selector multi-card vertical con icon + label + active-border verde | IMG_1097 | **Copy** | `<RadioCardGroup>` PR 9 — variante `with-icon` |
| Modal centrado dark con illustration + lista de fechas-pills `1 2 3 [4 SEPT] 5 6 7` para programación notificaciones | IMG_1098 | **Adapt** | `<NotificationOptInSheet>` post-Q17, sin la illustration genérica |
| CTA azul cobalto pill `Permitir consejos del entrenador` | IMG_1098 | **Skip** | RIAL mantiene CTA negro como primary; azul reservado a links |
| Header pantalla Diario: "Hoy / Semana 377" + chips top-right (gemas, racha-fuego, basket) | IMG_1099 | **Adapt** | Solo el chip de **racha** y **basket de carrito** son relevantes; gemas son gamification gratuita ya descartada |
| Hero card "Resumen": semi-ring 270° gris + número hero centro + 2 columnas laterales | IMG_1099 | **Copy** | Variante `<NutritionHero variant="restantes-hero">` ICP-adaptive Q15 |
| Etiqueta dominante `Restantes` (no `Consumidas`) como hero | IMG_1099 | **Copy** | Decisión de copy en `NutritionHero` — framing positivo (Lifesum §2.3 ya lo señala) |
| Macros breakdown horizontal con barra-progreso fina + `0 / 363 g` | IMG_1099 | **Copy** | `<MacroBar>` componente atómico nuevo, reusable en Hero + Detail |
| Banner promo `Special Offer -79% 00:57:36` con CTA `Desbloquear todo` | IMG_1099 | **Skip** | Countdown fake-urgency choca con ADR-008 RIAL (transparencia) |
| Meal-slot card horizontal: avatar emoji 64×64 + nombre + `0 / 893 kcal` + FAB `+` derecha | IMG_1099–1100 | **Adapt** | `<MealSlotCard>` para Hoy — `TodaysMeals` actual evoluciona, manteniendo foto real cuando exista |
| FAB `+` per-meal-slot inline (no FAB global) | IMG_1099–1101 | **Copy** | Reduce ambigüedad de "¿dónde añado?"; quita peso al `+` central de BottomNav |
| Sub-section heading `Alimentación` / `Más →` link verde derecha | IMG_1099 | **Copy** | Pattern transversal RIAL — `<SectionHeader action={t.common.more} />` |
| Card "Registro de agua" con header + valor central + grid 4×2 vasos clicables | IMG_1100–1101 | **Adapt** | `<HydrationCard>` Q15 — vasos como tap-target ≥44×44, ya parcialmente cubierto en Settings |
| Card "Peso" inline con `−` valor `+` (acción incremental directa) | IMG_1101 | **Adapt** | Hoy `WeightTrendCard` delega a `LogSnapshotModal`; añadir variant inline para quick-log |
| Card "Actividades" con conteo pasos + barra horizontal + tile "Añadir" + tile actividad | IMG_1102 | **Skip** | RIAL no integra HealthKit en V1 (Q6+); tile-grid no aporta sin data real |
| Card "Notas / ¿Qué tal tu día?" con sun + storm emoji laterales + CTA negro `Añadir nota` | IMG_1102 | **Adapt** | `<RealFeelPromptCard>` — RIAL ya tiene RealFeelDiary; el card es el entry point inteligente desde Hoy |
| Tabs `Descubrir / Mis favoritas` underline azul activo (no segmented control) | IMG_1103, IMG_1106 | **Adapt** | `<SegmentedTabs>` ya cubre el caso — Yazio usa underline pero la semántica es la misma |
| Categorías populares: scroll horizontal de pills con emoji-icon + label | IMG_1103 | **Copy** | `<CategoryRail>` para Cocina/Explora — RIAL ya usa rails; pulir altura y typography |
| **"Recetas por rango calórico" — grid 3×N tiles con foto + label `200-300 kcal`** | IMG_1103 | **Copy** | Filtro novedoso en RIAL; aterriza en Cocina como collection auto-generada |
| Hero ilustrado tipo "wave-blue background" detrás de cada tile categoría kcal | IMG_1103 | **Skip** | Decoración pesada que envejece mal; preferir foto comida real |
| `Elige tu comida / preparación / dieta` — secciones múltiples filtros con emoji icon | IMG_1104 | **Adapt** | Filtros ya existen en Cocina; copiar la **agrupación semántica vertical** (3 secciones cortas vs 1 larga horizontal) |
| Recipe collection card 16:9 hero + título 17 px + descripción 13 px + `58 recetas` count | IMG_1105 | **Copy** | `<RecipeCollectionCard>` — pattern transversal Q15+ recipe discovery |
| Empty state `Mis favoritas` con illustration hot-air-balloon + título + descripción + lista de meal-slots clicables | IMG_1106 | **Adapt** | RIAL `EmptyState` cubre el caso; copiar el truco de **listar meal-slots como secondary nav** dentro del empty (no es CTA, es shortcut) |
| Bottom-nav 5 tabs con icon + label + active-color verde | IMG_1099–1106 | **Adapt** | RIAL ya 5-tabs; auditar si `Pro` debe migrar a tab vs Más (decisión Q17) |
| Tab `Pro` con icono cohete (🚀) | IMG_1099–1106 | **Skip** | El cohete está bien para Yazio; RIAL `RialPlus` mantiene icono ✦ (elevation, no ascensión) |
| Spacing generoso entre cards (≥16 px gap) | IMG_1100–1102 | **Copy** | Q15 walkthrough ya señalaba `gap-4` mínimo entre `<SectionCard>`; locker en lint? |

---

## 3. Catálogo de capturas (11 de 11 leídas)

Agrupadas por tipología de pantalla.

### A. Onboarding / engagement re-entry
- **IMG_1096** — Splash de re-engagement (estado `2/3` indica usuario que vuelve, no first-run). Logotipo `yazio` 36 px black bold + mascota monstruo verde menta (~50% viewport) + título 2 líneas centrado bold negro `¡Has vuelto! Eso sí que es compromiso. ¡A por ello!` + speech-bubble blanco con borde verde "¡Empecemos!" sobre **CTA circular negro 64×64 con flecha →**. Pattern: onboarding re-entry como milestone emocional. La mascota es el elemento dominante — **dudoso para RIAL** (mascota cartoon resta autoridad nutricional vs el approach foto-realista que RIAL ha elegido en HeroGallery).
- **IMG_1097** — Step "¿Cómo quieres registrar tus comidas?" — 3 cards verticales con icon-thumbnail 32×32 izquierda + label medium 14 px + chevron implícito por touch area. Active state (`Combina ambos métodos`): border verde menta 1.5 px + background blanco. Inactive: background blanco sin border. CTA bottom `Siguiente` negro pill full-width (status `enabled` cuando hay selección). Pattern: **`<RadioCardGroup>` con icon-prefix** — distinto del `RadioCardGroup` Bevel (IMG_0962, sin icon, con desc-internal). Yazio omite descripción para mantener density alta; Bevel la incluye porque es selección de unidades-críticas.
- **IMG_1098** — Modal centrado dark `bg-slate-700` ~30% transparencia con illustration central (smartphone con hand-touch gesture + 3 small icon overlays — emoji-pumpkin top-left, calendar-icon top-right, medal-icon mid-right — sobre fondo radial-gradient blue) + título 17 px white bold `¡Sigue así de motivado!` + body 13 px white `Para que alcances un éxito aún mayor, te mandaremos recordatorios y consejos regularmente.` + sub-label 12 px `Alcanzarás tu objetivo el` + **fila de 7 pills `1 2 3 [4 SEPT] 5 6 7`** (la `4` es active, oklch verde claro background, label `SEPT` bajo el número) + CTA azul cobalto pill `Permitir consejos del entrenador` (note: azul, no negro — el CTA es de "permission grant" tipo sistema). Close-X top-right. Pattern: **opt-in notifications con framing de logro temporal** — la illustration narrativiza, la fecha personaliza el commit.

### B. Diario (Home equivalente — pestaña activa)
- **IMG_1099** — Header `vie 20:29` arriba con dynamic-island (status iOS nativo) + segunda fila chips top-right [💎 0 (gemas), 🔥 0 con badge `1` rojo (racha pendiente), 🛒 (carrito basket)]. Título `Hoy` 32 px bold negro + sub `Semana 377` 14 px gris. Section header `Resumen` + link verde derecha `Detalles`. **Hero card "Resumen"**: borderless card `rounded-md` `bg-surface` (blanco puro), padding generoso ~20 px, anatomy:
  - **Layout 3-col**: izquierda `0 / Consumidas` (28 px bold + 12 px gris label), centro **semi-ring 270° abierto inferior** gris-claro `#e5e7eb` con dot verde menta a 0% (track) y número hero `2978` 36 px bold + label `Restantes` 12 px gris bajo, derecha `38 / Quemadas`.
  - **Macros row**: 3 columnas `Carbohidratos / Proteínas / Grasas`, cada una con dot verde + barra horizontal `h-1.5` + valor `0 / 363 g` 12 px bold black. Spacing `gap-3` entre columnas.
  - Composición: hero numérico domina, ring es track decorativo. Inversión vs MFP/Lifesum donde ring es protagonista.
- **Banner promo** debajo: `bg-amber-100` `rounded-md` con borde amber-200 1 px, label `Special Offer` centro arriba 14 px bold black, fila inferior `−79 %` `00 : 57 : 36` (countdown timer mm:ss:cs probablemente) izquierda + CTA negro pill `Desbloquear todo` derecha. Pattern: **promo persistente como segunda card de Home**, countdown enfatiza urgencia.
- Section header `Alimentación` + link verde `Más`.
- **Meal-slot card** (parcial visible): avatar circular ~50 px con emoji ☕ + nombre `Desayuno →` 17 px bold + sub `0 / 893 kcal` 13 px gris + **FAB `+` negro circular 44×44 derecha**. La flecha `→` adyacente al nombre indica navegabilidad al detalle del slot.
- BottomNav 5 tabs: Diario (activo, verde) · Recetas · Ayuno · Perfil · Pro. Iconos 24 px line + label 11 px. Active: verde menta + indicador implícito (color del icon).

### C. Diario scroll continuo
- **IMG_1100** — Continuación scroll Diario con 4 meal-slot cards completos: Desayuno (☕ 893 kcal), Almuerzo (🥗 1191 kcal), Cena (🍒-rojo bowl 745 kcal), Snacks (🍎 149 kcal). Notar el **avatar focus state en Cena**: dot ring gris claro alrededor del FAB (touch ripple iOS). Cada card `rounded-md` blanco padding ~14 px, `gap-3` entre cards. Sección siguiente `Registro de agua` (parcial): card centrada con título `Agua` + sub `Objetivo: 2,00 L` + valor hero `0,00 l` + grid 6 vasos línea-art con `+` en el primer vaso (acción "rellenar siguiente"). Pattern: **slot-fill UI** estilo iOS Health water-tracker.

- **IMG_1101** — Continúa scroll: Card `Registro de agua` completa con grid 4×2 vasos (8 visibles) + footer label `+ Agua de los alimentos: 0 mL` 12 px gris. Section header `Valores corporales` + link `Más`. Card `Peso` con título `Peso` + sub `Objetivo: 75,0 kg` + **fila incremental `−` `71,0 kg` `+`** centrada (los `−`/`+` son botones circulares ~36×36 outline). Pattern: **inline quick-log** — más rápido que abrir un modal para subir 100 g, pero lossy (no captura nota ni foto).

### D. Diario fin + módulos secundarios
- **IMG_1102** — Continuación final del scroll. Section `Actividades` + `Más`. Card `1598 pasos` con title centrado bold + sub `1,1 km, 70 kcal` 13 px gris + barra horizontal verde llena ~22% (gradient acento). Sub-grid 2 cols con tiles cuadrados 80×80: tile `+ Añadir` (outline gris) + tile `🏃 38 kcal` (solid bg). Pattern: **steps + activities como módulo HealthKit-mirror**.
- Section `Notas`. Card `¿Qué tal tu día?` con asset `☀️` izquierda + asset `⛈️` derecha (emojis grandes ~48 px) + título centro `¿Qué tal tu día?` 16 px bold + body `Registra tu salud y tus emociones` 13 px gris + CTA negro pill `Añadir nota`. Tile inferior `+ Añadir` outline gris (vacío). Pattern: **mood-prompt como card-de-Home** — el RealFeelDiary RIAL podría exponerse así.

### E. Recetas — Descubrir
- **IMG_1103** — Top-bar minimal: icono basket 🛒 azul izquierda + icono lupa 🔍 azul + icono filtros (3-sliders) azul derecha. Título `Recetas` 32 px bold. **Tabs underline**: `Descubrir` (activo, azul cobalto + underline 2 px) · `Mis favoritas` (gris). Section `Categorías populares` con scroll horizontal de pills cuadradas 80×80 (pill = card chica): emoji ☕ + label `Desayuno`, 🥗 `Almuerzo`, 🥗-rojo `Cena`, 🌱 `Vegana`, parcial `Rica e...`. Pills `rounded-md` blancas con sombra mínima.
- Section `Recetas por rango calórico` — **grid 3×2** de tiles cuadrados con foto-emoji centrada + ola decorativa azul-claro de fondo + label inferior `50-100 kcal` / `200-300 kcal` / etc. Pattern: **filtro auto-generado por bucket calórico** — único entre los 19 competidores audited en `feature-matrix.md`. Útil para usuarios que comen "después del workout, busco algo de 200-300 kcal".

### F. Recetas — scroll continuo
- **IMG_1104** — Continúa scroll Descubrir. Section `Elige tu comida` (cards horizontales con foto-emoji + label `Snack`). Section `Elige tu modo de preparación` (cards: emoji "☀️ ingredientes" + emoji `🔥 Al horno`). Section `Elige tu dieta` (cards: 🧀 `Vegetar...`, 🌱 `Vegana`, 🥜 `Baja en...`). Pattern: **filtros segmentados por eje** — comida (slot) / preparación (técnica) / dieta (restricción). Cada eje es independiente y combinables. Contraste con Yummly que mete todo en un mega-filtro.

- **IMG_1105** — Continúa scroll. Section `La vuelta al mundo` con cards horizontales 16:9 grandes: `Platillos mexicanos` (foto enchiladas + lima) con título 16 px bold + body `La cocina mexicana es la favorita de tanta gente gracias a sus características sabores. ¡Dale vida a t...` 12 px gris + footer `58 recetas`. Card siguiente `Sabores de` parcial (foto pasta verde). Section `Ingredientes de temporada` parcial (foto sopa espárragos). Pattern: **collections curadas** estilo Yummly/NYT.

### G. Recetas — Mis favoritas (empty state)
- **IMG_1106** — Tab `Mis favoritas` activo (azul + underline). **Empty state hero**: ilustración hot-air-balloon con 2 personajes (uno con catalejo, otro señalando) sobre nubes. Título `¿Aún no tienes recetas favoritas?` 18 px bold negro centro + sub `¡Explora para encontrar inspiración!` 13 px gris centro. Pattern: **empty state que reconoce + redirige sin CTA "primary"** — la lista de meal-slots debajo (☕ Desayuno › / 🥗 Almuerzo › / 🥗-rojo Cena › ... cada uno con chevron) es el shortcut implícito. El user no tiene un único CTA, tiene 4 micro-rutas a explorar por slot. Decisión sutil: en vez de "Ver recetas →" único, listar destinos. Reduce paralysis-by-choice porque cada slot es un contexto.

---

## 4. Principios destilados

### 4.1 Sistema visual — Yazio vs RIAL actual

| Token | Valor Yazio (inferido) | RIAL `theme-neutral-light` actual | Acción |
|---|---|---|---|
| `--background` | `#f4f4f3` (off-white frío) | `#fafaf9` (warm stone-50) | **Mantener RIAL** — el warm es identidad NEUTRAL post-PR3 |
| `--surface` (cards) | `#ffffff` puro | `#ffffff` | Unchanged |
| Card border | `none` (sombra muy sutil ~`shadow-elev-1`) | `border border-outline-variant/20` post-PR3 borderless | Unchanged ✓ |
| Card radius | `rounded-md` (~10 px) | `rounded-sm` SectionCard | **Adapt** — considerar `rounded-md` (12 px) para cards con foto-hero (recipe collections); mantener `rounded-sm` para cards de datos |
| `--brand-primary` | `#2ec39a` verde menta (≈emerald-500 saturado) | depende paleta | **Skip** — RIAL NEUTRAL usa emerald `#10b981`/`#059669` que ya cubre |
| `--accent-secondary` | `#2f80ed` azul cobalto (CTAs link, tabs underline) | `text-primary` negro | **Skip** — RIAL evita azul cobalto link-style; mantener accent textual `text-primary` |
| `--cta-primary` | `#0a0a0a` negro pill | `#09090b` | Match ✓ |
| `--accent-warning-promo` | `#fde68a` amber-200 banner | n/a (RIAL no usa promo banners) | Considerar para `<PromoBanner>` Q17 (no countdown) |
| Macros tracking color | dots verde único + barras grises | RIAL coral/amber/sky por macro | **Mantener RIAL** — code-color por macro (proteína-amber, carbo-coral, grasa-sky) es más informativo que dots monocromos |
| Sheet overlay | n/a (no se ven bottom-sheets en estas 11) | `bg-black/25` | Unchanged |

**Decisión global de color.** Yazio confirma que un **single brand-accent verde** funciona en mass-market, pero RIAL ya optó (PR3) por 4 paletas con NEUTRAL como Bevel-equivalent. **No re-tematizar a Yazio**. La lección útil: el `text-primary` negro como CTA-fuerte y el accent-color como **link/underline/active-tab** (no como background de botones). RIAL hoy ya separa los dos roles correctamente.

### 4.2 Tipografía

- **Títulos pantalla** 32 px bold black puro (`Hoy`, `Recetas`). Match RIAL `text-display`. ✓
- **Section headers** 18–20 px bold negro (`Resumen`, `Alimentación`, `Categorías populares`). RIAL `text-title` 18 px ya lo cubre. ✓
- **Hero numérico** 36 px bold (`2978`). RIAL `text-headline` (`28 px`) podría escalar a `text-display-lg` para hero único. **Adapt** — añadir token `text-hero-num` 36 px solo para Home hero.
- **Body** 13 px gris (`Semana 377`, `Objetivo: 2,00 L`). Match RIAL `text-body-sm`. ✓
- **Caption en macro labels** 12 px gris (`Carbohidratos`). Match `text-label`. ✓
- **Yazio sin mono** — todo Inter/SF system. RIAL usa JetBrains Mono para nutrición numérica como diferenciador; mantener — el mono añade "data-precision" feel que Yazio NO tiene.

### 4.3 Information design — jerarquía Diario

Patrón Yazio Diario (IMG_1099–1102):

```
[Header: dynamic-island + chips top-right gamification]
[Title 32 px + sub 14 px gris]
[Section header: Resumen + link Más/Detalles verde]
[Hero card: 3-col semi-ring + hero-num + secondaries + macros-row]
[Promo banner (opcional, persistente)]
[Section: Alimentación + Más → ]
[Stack vertical de meal-slot cards: avatar + name → + count + FAB +]
[Section: Registro de agua + (no link)]
[Hydration card: hero centrado + slot-fill grid + caption]
[Section: Valores corporales + Más]
[Weight card: − valor +]
[Section: Actividades + Más]
[Steps card + sub-grid actividades]
[Section: Notas]
[Mood prompt card]
```

**Diferencia clave vs RIAL hoy:** Yazio resuelve el Diario como **single-list scroll** con secciones-fixed (Alimentación / Agua / Cuerpo / Actividad / Notas), no como tabs/sub-tabs. RIAL Hoy mezcla `NutritionHero` + `ProgressPreviewCard` + `TodaysMeals` + dispersos. Consolidación candidata Q15: estandarizar a Yazio-like scroll (5–6 secciones predecibles) y dejar Progress como tab independiente para deep-dive.

### 4.4 Sheets / modals — observación negativa

**Importante:** las 11 capturas Yazio NO muestran bottom-sheets. El único modal observado es **IMG_1098** (notification-permission), que es **dark overlay full-screen centered modal** (not bottom-sheet). Esto sugiere que Yazio resuelve la mayor parte de la edición inline (peso `−`/`+`, agua tap-vaso) o vía full-screen routes (search alimento, recipe detail), no vía sheets ADR-009-style.

**Implicación para RIAL.** Yazio no es buena referencia para sheet anatomy (Bevel sigue siendo la canónica). Pero confirma una decisión RIAL ya tomada: **no todo es sheet** — la quick-action inline (IMG_1101 weight `−`/`+`) es válida para cambios de baja cardinalidad. Deja `<BottomSheet>` para contextos donde el user añade/edita un payload con ≥3 campos (LogSnapshotModal, RecipePicker, AddMeal detail).

### 4.5 Empty states

- **Yazio (IMG_1106)**: ilustración decorativa + título-pregunta + sub + **lista de meal-slots como secondary nav** (sin CTA primario único).
- **RIAL hoy**: `EmptyState` requiere `ctaLabel` + `onCta`.
- **Decisión**: añadir variant `<EmptyState variant="multi-route">` con prop `routes: { icon, label, onClick }[]`. Útil para "favoritas vacías → ruta por slot" o "pantry vacía → categorías populares".

### 4.6 Badges, pills, chips

- **Chips top-right Diario** (IMG_1099): 3 chips compactos sin texto adicional, solo emoji-icon + número + opcional badge rojo (notificación). Pattern: **gamification compacta** (gemas + racha + carrito-shopping). RIAL solo necesitaría **racha** y opcional **carrito** (con badge si hay items en shopping list pendiente).
- **Pill speech-bubble** (IMG_1096) sobre CTA: añade ruido. **Skip**.
- **Promo banner** (IMG_1099): rectangular `rounded-md` amber-bg + texto + CTA negro inline. Pattern reutilizable como `<PromoBanner>` sin countdown.

### 4.7 Pricing — observado tangencialmente

- Yazio expone `Pro` como **5° tab del bottom-nav** con icono cohete (IMG_1099–1106). El paywall es una pantalla, no un modal — discoverable, no blockante.
- **ADR-008 RIAL**: free-generous core + single premium tier. Compatible con la decisión Yazio.
- **Decisión Q17**: evaluar mover `RialPlus` de `Más` a un destino más visible. Tab-de-bottom-nav es opción; alternativa = chip-fixed en GlobalHeader (menos invasivo).
- El countdown timer del banner promo (IMG_1099) **se descarta explícitamente** — viola la transparencia ADR-008. Si hay descuentos puntuales, mostrar fecha-hasta absoluta (`Oferta hasta el 25 abril`) en vez de countdown manipulativo.

### 4.8 FAB / nav

- **Bottom-nav 5 tabs** estable en todas las capturas. Active state = icon verde + label verde (no dot, no underline). Iconos line 24 px en inactive, fill 24 px en active (o el mismo line con color swap — difícil distinguir desde estática).
- **No hay FAB central global** en Yazio Home (a diferencia de Bevel IMG_0997 long-press FAB grid). En su lugar: **FAB inline `+` por meal-slot card** (IMG_1099–1100). Pattern: **el `+` está donde lo necesitas, no en el centro de la pantalla**.
- **Decisión RIAL**: mantener `+` central de RIAL `BottomNav` como `CreateModal` opener (multi-domain create), pero **complementar con FAB-inline en TodaysMeals** post-Q15. Reduce friction "click `+` global → CreateModal → 'Añadir comida' → seleccionar meal-slot" (4 taps) → "click `+` inline en meal-slot → modal de búsqueda" (2 taps).

### 4.9 Lo que NO copiamos

- **Mascota onboarding monstruo verde** (IMG_1096) — RIAL apuesta a foto-comida real. Una mascota cartoon resta credibilidad nutricional. Excepción: si Q22+ se introduce gamification de niños/familia, evaluar.
- **Speech-bubble decorativo** sobre CTA (IMG_1096) — ruido visual sin función.
- **Countdown timer en promo banner** (IMG_1099) — fake-urgency. ADR-008 lo prohibe.
- **Background ola-azul decorativa** detrás de tiles categoría kcal (IMG_1103) — visual aging fast. Foto comida real escala mejor.
- **Tab `Pro` con icono cohete** (IMG_1099–1106) — RIAL `RialPlus` mantiene el icono ✦ por consistency con la marca.
- **Dots/gemas como métrica gamificada** (IMG_1099 chip 💎 0) — RIAL no introduce currencies virtuales sin un loop de canje claro (sería breadth-trap §10.1).
- **Hero ring abierto 270° gris-sin-progreso-real** (IMG_1099) — el ring de Yazio es decorativo (al 0% kcal sigue marcando 270°). RIAL prefiere ring proporcional al consumo real para que la métrica visual coincida con la numérica.

### 4.10 Patrón novel — "Recetas por rango calórico"

**Hallazgo interesante.** IMG_1103 muestra un grid 3×N de tiles donde cada tile es un bucket calórico (`50-100 kcal`, `200-300 kcal`, ..., `500-600 kcal`). Es un eje de filtro **único entre los 19 competidores audited en `feature-matrix.md`**.

**Por qué funciona.** Resuelve la query mental "tengo X kcal disponibles, qué puedo cocinar". Especialmente útil:
- Post-workout (busco snack 100–200 kcal recovery)
- Post-cena pesada (busco snack 50–100 kcal sin culpa)
- Macro-budget tight (cuántos gramos de pasta para mi cena 400–500 kcal)

**Implementación RIAL** (post-Q15):
- Computar bucket vía `getRecipeBucket(recipe): '0-100' | '100-200' | ... | '600+'` basado en `recipe.totalKcal / recipe.servings`.
- Exponer en Cocina como collection auto-generada `t.recipes.byCalorie.title` con grid de chips clicables.
- Filtro persistente vía URL search-param (`?kcal=200-300`).
- Empty state dentro de cada bucket: "No tienes recetas en este rango. ¿Quieres explorar los rangos cercanos?".

**Sin nuevo primitive.** Reusa `<RecipeCollectionCard>` (a crear, ver §4.11) + `<CategoryRail>`.

### 4.11 Patrón novel — `<RecipeCollectionCard>` 16:9 hero

IMG_1105 muestra cards de **collection** (no de receta individual): foto 16:9 + título + descripción larga + count `58 recetas`. Distinto de `RecipeCard` actual (foto + nombre + macros + tiempo). El uso es **discovery / inspiration** — el user clicka para ver la lista de 58 recetas dentro.

**Anatomy `<RecipeCollectionCard>`**:
```
<article rounded-md overflow-hidden>
  <img className="aspect-[16/9] object-cover" />
  <div className="p-4">
    <h3 className="text-title">Platillos mexicanos</h3>
    <p className="text-body-sm text-on-surface-variant line-clamp-2">…</p>
    <p className="text-caption text-on-surface-variant mt-2">{count} recetas</p>
  </div>
</article>
```

Consumers: Cocina `Descubrir` tab (collections curadas seed), Explora (creator collections post-Q22).

---

## 5. Roadmap de ejecución — 5 PRs

| PR | Scope | Archivos nuevos | Archivos amendment |
|---|---|---|---|
| **Y-1** | Docs foundations | `docs/market/yazio-design-playbook.md` (este archivo) | `docs/market/feature-matrix.md` (añadir fila "filtro por rango calórico"), `CHANGELOG.md` |
| **Y-2** | `<NutritionHero>` ICP-adaptive — variant `restantes-hero` (IMG_1099 layout 3-col + hero numérico + macros bar) tras feature flag | `src/components/MacroBar.tsx`, `src/test/conventions/macro-bar.test.ts` | `src/features/home/components/NutritionHero.tsx` (añade `variant: 'consumed-ring' \| 'restantes-hero'`), `src/lib/featureFlags.ts` (`homeRestantesHero`), i18n keys (`t.home.hero.restantes`, `t.home.hero.consumed`, `t.home.hero.burned`), `CHANGELOG.md`. **No reemplazar** el ring-style; coexiste. ICP-adaptive: Clara (positive framing) → restantes-hero default; Marcos (analytical) → consumed-ring default. |
| **Y-3** | `<MealSlotCard>` con FAB inline + emoji avatar | `src/features/home/components/MealSlotCard.tsx`, `src/test/conventions/meal-slot-card.test.ts` | `src/features/home/components/TodaysMeals.tsx` (rewrite list rendering — usa `MealSlotCard` por slot), avatar emoji map (`☕`/`🥗`/`🍒-bowl`/`🍎` por slot canónico), HIG `min-h-11` FAB ya soportado, i18n unchanged, `CHANGELOG.md`. Foto real prevalece sobre emoji cuando `firstMeal.photoUrl` existe (decisión RIAL pro-foto). |
| **Y-4** | "Recetas por rango calórico" collection auto-generada en Cocina | `src/features/recipes/utils/calorie-bucket.ts`, `src/features/recipes/utils/calorie-bucket.test.ts`, `src/features/recipes/components/CalorieBucketGrid.tsx` | `src/features/recipes/screens/Cocina.tsx` (mounts `<CalorieBucketGrid>` en Descubrir tab arriba de Categorías populares), i18n +8 keys × 2 locales (6 buckets + section header + empty), `CHANGELOG.md`. Filtro persistente via local state — no URL routing dado state-based nav RIAL. |
| **Y-5** | `<RecipeCollectionCard>` + Cocina collections seed | `src/components/patterns/RecipeCollectionCard.tsx`, `src/features/recipes/data/seed-collections.ts`, `src/test/conventions/recipe-collection-card.test.ts` | `src/features/recipes/screens/Cocina.tsx` (sección "Colecciones" sobre `CalorieBucketGrid`), `seedVersion.ts` (`seedCollections` v1 strategy `replace`), i18n keys, `CHANGELOG.md`. 6 collections seed iniciales: `Cocina mediterránea`, `Vuelta al cole / batch`, `Post-workout`, `Cenas ligeras (<400 kcal)`, `Brunch fin de semana`, `Vegetariano fácil`. |
| **Y-6** (opcional) | `<EmptyState variant="multi-route">` + uso en favoritas | — | `src/components/EmptyState.tsx` (añade prop `routes?: { icon, label, onClick }[]`), `src/features/recipes/screens/Cocina.tsx` (Mis Favoritas empty con 4 meal-slot routes), i18n, `CHANGELOG.md`. ROI bajo si Y-3/Y-4/Y-5 no se ejecutan — depende de que Cocina tenga collections para que las routes-empty tengan sentido. |

Governance: trabajar directamente en `main` (gobernanza 2026-04-17). Cada PR = commit(s) + `release:preflight` verde + push a `rial-food/main` tras aprobación explícita del user ("continua" autoriza el push).

**Orden recomendado**: Y-1 (este doc) → Y-3 (impacto visible Diario, low-risk) → Y-2 (tras feature flag) → Y-4 → Y-5 → Y-6. Y-2 va después de Y-3 porque `<NutritionHero variant="restantes-hero">` se aprecia mejor con el `<MealSlotCard>` ya migrado debajo (consistencia visual del Hoy).

---

## 6. Verificación end-to-end

```bash
npm run release:preflight
# tsc + lint + lint:code + check:i18n + test + build + size:check

# Preview manual (Y-2 / Y-3 sobre todo):
preview_start
# 8 combinaciones theme (4 paletas × 2 modos) — Hoy + Recetas
# Comprobar:
#   - Hero card "Resumen" con macros-bar legible en EMBER dark
#   - MealSlotCard FAB inline tap-target ≥44×44 (HIG-compliant)
#   - CalorieBucketGrid scroll horizontal sin clip
#   - RecipeCollectionCard 16:9 aspect ratio preservado en sm/md
#   - i18n EN parity en todos los nuevos strings
```

**Baselines a medir** post-roadmap completo (estimación):
- Tests: +12–18 (3–4 tests por PR Y-2/Y-3/Y-4/Y-5)
- i18n: +20–28 keys × 2 locales
- Build size: +1.5–2.5 KB raw / +0.5–0.8 KB gzip (4 componentes nuevos chiquitos)
- Lint: 0 errors esperado; warnings dentro del budget actual

**Foco visual de verificación.** El éxito de los PR Y-* se mide en una métrica simple: el Hoy tab debe **leerse de un vistazo** como un Yazio Diario (5–6 secciones predecibles, cada una scannable en <1 s), pero **conservar la identidad RIAL** (paletas, JetBrains Mono en macros, foto-realismo cuando aplique). Si el preview con `theme-neutral-light` empieza a "sentirse Yazio" el copy es exitoso; si empieza a "sentirse mass-market" hemos copiado de más.

---

## 7. Fuentes

- Capturas: `docs/market/Competitor Images/Yazio/` (IMG_1096–IMG_1106, 11 archivos).
- Deep-dive descriptivo: `docs/market/deep-dives/yazio.md`.
- Doctrina general competidores: `docs/market/ux-patterns.md`, `docs/market/rial-positioning.md`, `docs/market/feature-matrix.md`.
- Sistema RIAL actual: `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/adr/ADR-001` a `ADR-009`.
- Bevel playbook (referencia metodológica de este documento): `docs/market/bevel-design-playbook.md`.

---

## 8. Notas para el reviewer

- **Tokens de color exactos inferidos visualmente** — el verde menta `#2ec39a` y azul cobalto `#2f80ed` son aproximaciones basadas en análisis cromático del PNG, no extraídos del binario de la app. Confianza ~85%. Si Y-2/Y-3 dependieran de match exacto, reabrir con captura nueva más alta resolución.
- **Animaciones / microinteracciones no inferibles desde stills.** El touch ripple del FAB Cena en IMG_1100, el slot-fill animation del agua, la presumible expand-animation del meal-slot card al tap — todo inferido. Si el PR Y-3 quiere replicar la sensación premium de Yazio, requiere 1 ciclo de prototipado en preview con ease-out subtle (Bevel mismo no tiene motion docs, RIAL puede definir su propia motion-language en Q17 separado).
- **El countdown timer real podría no ser fake-urgency.** IMG_1099 muestra `00:57:36` — podría ser una promo legítima del 79% off en Yazio Pro con tiempo real (típico Apple Search Ads campaign window). El `Skip` está justificado para RIAL por su política propia (ADR-008 transparencia), no porque Yazio esté haciendo dark pattern necesariamente.
- **Sample bias — solo 11 capturas.** No vimos: paywall completo, recipe detail, fasting timer, profile, settings, search alimento, barcode, planner. Las decisiones §4.4 (sheets) y §4.7 (pricing) están limitadas. Si se necesita más profundidad sobre Yazio (especialmente para paywall design Q17 y fasting UI Q15+), pedir set ampliado.
- **El uso de iconos emoji para meal-slots** (☕ Desayuno / 🥗 Almuerzo / 🍒 Cena / 🍎 Snacks) es una decisión RIAL pendiente de calibrar — emojis renderizan distinto cross-platform (iOS vs Android vs web). PR Y-3 debe validar render en Android emulator antes de ship; si renderizan inconsistente, pivotar a icon-set Lucide neutro (Coffee / Salad / Soup / Apple).
