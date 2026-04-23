# Kitchen Stories Design Playbook

> Accionable. Complemento del eje competitivo (`ux-patterns.md`) y del deep-dive descriptivo (pendiente en `deep-dives/` — este playbook sustituye temporalmente).
>
> Alcance: extraer las prácticas de diseño visible en 17 capturas de Kitchen Stories (IMG_1141–IMG_1159) que merece la pena **copiar, adaptar o descartar** para RIAL. Enfocado a la capa de *content presentation* (recipe detail, feed editorial, cook mode step-by-step) — no al tracker.
>
> Última revisión: 2026-04-19. Capturas en `docs/market/Competitor Images/Kitchens stories/`.

---

## 1. Por qué Kitchen Stories como referencia

Kitchen Stories es un competidor **content-first, no tracker-first** (la monetización vive en contenido editorial + Plus, no en macros). Eso lo descarta como referencia de Home dashboard pero lo convierte en la mejor referencia que hemos catalogado para **presentar una receta como pieza editorial** y para el flujo cook mode step-by-step. Lo distintivo frente a los otros 19 competidores:

- **Foto hero a sangre** (`IMG_1141` / `IMG_1146` / `IMG_1152`) — la foto ocupa ~65% del viewport vertical, sin chrome encima, sin overlay gradient. Culto a la foto de comida de revista (ajax.systems / Apartment Therapy / NYT Cooking).
- **Tipografía serif para títulos de receta** (`"Charred broccoli salad"`, `"5-ingredient creamy tomato..."`, `"Chicken Caesar Schnitzel"`) — único competidor que rompe la convención sans-serif universal. Señal de "editorial", no de "database entry".
- **Verde botella `#1f5e4a`** como primary en onboarding + bottom CTAs (IMG_1142, 1147, 1149) combinado con **naranja cálido `#f26a21`** para FAB + active nav (IMG_1141, 1157, 1159) — dual-accent deliberado: verde = "cook/save/decide", naranja = "create/promote/paywall".
- **Cook Mode lineal con barra sticky "Start cooking!"** (`IMG_1148`–`IMG_1154`) — la CTA de entrar en cook mode **persiste fija** sobre scroll independientemente del tab (reviews, ingredientes, nutrition). Doctrina: nunca hacer al usuario volver al top para empezar.
- **Chef attribution humana** (foto circular + nombre + cargo — `IMG_1145`, `IMG_1147`, `IMG_1151`) — cada receta lleva autor con cara. Diferencia editorial vs database. Yummly/Paprika lo esconden; MyRealFood lo resuelve con handle social; Kitchen Stories lo trata como mini-byline.
- **Rating + conteo social por receta** (`"Too few ratings"` / `"Based on 372 ratings"` / 65.8K likes — IMG_1146, 1152, 1151) — signal colectivo prominente; Kitchen Stories tiene volumen real (cientos de miles de likes por receta popular).

Tomar su vocabulario editorial **ahora** (pre-Q15/Q21) posiciona RIAL como "recetas con voz humana" vs "recetas como entries" — diferenciador directo frente a MyFitnessPal Recipes, Cronometer, MacroFactor. **No** tomar su capa editorial-production (chefs internos, fotografía profesional propia) — eso requiere equipo de cocina y RIAL no debe meterse ahí.

---

## 2. Matriz Copy / Adapt / Skip

| Patrón Kitchen Stories | Referencia captura | Decisión | Dónde |
|---|---|---|---|
| Foto hero a sangre (sin card, sin gradient overlay) en recipe detail | IMG_1141 / 1146 / 1152 | **Copy** | `src/features/recipes/components/HeroGallery.tsx` — añadir variant `bleed` |
| Tipografía **serif** solo en título de receta | IMG_1146 / 1147 / 1152 | **Adapt** | Token `--font-serif` para `RecipeDetail` title únicamente; resto Inter |
| Dual-accent verde/naranja (actions/promo split) | global — 1141, 1142, 1147, 1149 | **Skip** | RIAL ya tiene 4 paletas × 2 modos; no añadir dual-accent |
| Sticky CTA "Start cooking!" verde pill sobre scroll infinito | IMG_1147 / 1148 / 1149 / 1150 / 1154 | **Copy** | `RecipeDetail.tsx` — botón sticky bottom `position: sticky` sobre el footer del content |
| Card "Today's Recipe" en home (hero + author + likes count + FAB) | IMG_1141 | **Adapt** | `Discovery.tsx` — variante "Receta del día" curada |
| Dos-tabs top-level `Editor's Choice` / `For You` con underline indicator | IMG_1141 / 1143 / 1145 | **Adapt** | Reusar `<SegmentedTabs>` existente — sin el underline custom |
| Empty "For You" con ilustración minimalista + copy honesto | IMG_1143 | **Copy** | `<EmptyState variant="info">` — la ilustración del arco amarillo con dot es literalmente un "loading personality mascot" |
| Skip-the-question link top-right en onboarding | IMG_1142 | **Copy** | `Onboarding.tsx` — añadir link "Omitir" top-right en steps opcionales |
| Doble progress-bar verde (dos sprints paralelos) en onboarding | IMG_1142 | **Skip** | RIAL usa dots — la métrica multi-track confunde |
| Chip-pill multi-select grid 2-col en preferencias (`Italian` `Chinese` `Indian`...) | IMG_1142 | **Copy** | `ChipGroup` primitive — usar en SettingsNutrition `cuisinePreferences` |
| Time-badge top-left "15 min." en card receta | IMG_1141 / 1145 / 1151 / 1159 | **Copy** | `RecipeCard` — ya existe; verificar consistencia del pill `surface` |
| Vegetarian/Vegan badge top-right en card receta | IMG_1151 / 1159 | **Copy** | `RecipeCard` — derivar de `recipe.tags[]` |
| Heart-count counter inline sobre foto (bottom-right overlay) | IMG_1141 / 1145 / 1151 / 1159 | **Adapt** | `RecipeCard` — exponer `likesCount` pill sobre foto; defer UGC source |
| Chef/autor mini-chip bajo título (avatar 16px + nombre) | IMG_1141 / 1145 / 1151 / 1159 | **Adapt** | `RecipeCard` — usar `recipe.authorId?` opcional; fallback a "Comunidad" |
| Recipe-detail secciones: Author → Description → Reviews → Difficulty → Prep/Bake/Rest → Nutrition → Steps → Ingredients → Reviews full → Related | IMG_1147 / 1148 / 1150 / 1153 | **Copy** | `RecipeDetail.tsx` — reorganizar secciones según este flujo |
| Tres tile-circles `Preparation / Baking / Resting` con mini ring arc | IMG_1147 / 1154 | **Adapt** | Nuevo `<TimeTile>` composite o extender `<StatTile>` con variant `arc-duration` |
| "Nutrition per serving" como ListRow fila simple (Cal · Protein · Fat · Carb) | IMG_1148 | **Adapt** | Ya tenemos `MacroRow` — alinear a este patrón sin hero |
| Step-by-step con foto full-width **entre** texto y texto | IMG_1148 / 1149 / 1150 | **Copy** | `CookMode.tsx` — layout step = texto + foto bleed + texto siguiente |
| Paginación de steps tipo "Step 1/3" como section header beige | IMG_1148 / 1149 / 1150 | **Copy** | `CookMode.tsx` — banner peach `#fdf2e9` con label step index |
| Ingredients por step (emoji cart icon + lista inline) | IMG_1148 / 1150 | **Copy** | `CookMode.tsx` — render ingredients de cada step encima del paso |
| Comments feed con preview de fotos horizontal (+47 counter stack) | IMG_1153 / 1154 | **Adapt** | `Community.tsx` / `PostDetail.tsx` — patrón horizontal-stack count |
| Comment original-language translation toggle | IMG_1153 | **Skip (V1)** | Requiere Gemini translate + detección idioma — defer Q20 |
| Recipe card "Review" CTA text-only inline (no botón) | IMG_1151 / 1154 | **Copy** | `RecipeDetail.tsx` — text-link "Write" derecha para UGC cheap |
| Banner Plus "Try 7 days for free" inline top del Home feed | IMG_1141 / 1144 | **Adapt** | `RialPlus` — banner dismissible con timeline (ADR-008) |
| Plus CTA verde "Try for free" dentro de card beige ilustrada | IMG_1157 | **Adapt** | `RialPlus` paywall card variant "soft" para Profile |
| Profile con avatar-initial + plan tier + Edit profile outline | IMG_1157 | **Copy** | `Profile.tsx` — ya existe; alinear hierarchy |
| Settings agrupado por secciones (Account / System / Support) con iconos outline 20px left | IMG_1158 | **Copy** | `SettingsSystem.tsx` / More — ya compatibles; verificar iconografía |
| FAB naranja `+` flotante **siempre visible** sobre nav | IMG_1141 / 1143 / 1159 | **Skip** | RIAL usa BottomNav `+` central — FAB extra satura |
| Editorial-production heavy (chefs internos, fotografía propia) | global | **Skip** | Requiere equipo producción; no escalable para RIAL pre-series-A |
| "Community" tab contigua a "Kitchen Stories" dentro de colección | IMG_1159 | **Adapt** | Collections RIAL — tabs source `Curated` / `Community` |
| Back-chevron top-left con offset respecto al status bar (no en status-bar band) | IMG_1146 / 1147 / 1152 | **Copy** | `PageHeader` — ya OK, verificar offset 16px top |
| Share + Heart iconos pareados top-right en recipe detail | IMG_1146 / 1147 | **Copy** | `RecipeDetail.tsx` — toolbar top-right `share + fav` |
| Star-rating 5-star horizontal con "Too few ratings" fallback | IMG_1146 / 1152 | **Copy** | `StarRating` primitive nuevo — estado empty explícito |

---

## 3. Catálogo de capturas (17 de 17 leídas)

Agrupadas por tipología con IMG más representativo.

### A. Home feed / Discovery

- **IMG_1141** — "Today's Recipe" home hero. Tabs top `Editor's Choice` / `For You` con underline naranja en la activa. Banner Plus beige inline con X dismiss ("Try 7 days for free. Cancel anytime."). **Foto hero a sangre** (~450 px altura) de ensalada de brócoli asado. Card blanca bajo la foto con meta-tag superior `Today's Recipe` en naranja, título serif grande ("Charred broccoli salad with ranch dressing"), author pill naranja (`Ruby Goss`), heart-count derecho (5.13K). FAB naranja circular bottom-right. BottomNav 5-tabs `Home/Search/My Recipes/Shopping List/Profile` con Home activa naranja. **Intent**: receta del día curada como single-hero, discovery scroll horizontal secundario.
- **IMG_1144** — Scroll del home anterior. Sub-section `"Our Latest Recipes"` con "See all" derecha naranja. Carrusel 2-col horizontal scroll de cards: `Iconic muffuletta sandwich` (`15 min.` + heart count `9` + author `Emre Kesici`) y `Bean-otto (bean risotto with leeks and spinach)` (`25 min.` + badge `Vegetarian` verde). Debajo "Explore the best recipes from" con carrusel avatar-like circles. **Intent**: feed scroll con sub-rails horizontales, categorías por chef/colección.
- **IMG_1145** — Variante del 1144 con dos recetas distintas: `Chicken Caesar Schnitzel` (`30 min.` + `Paul Breuer`) y `Spring meatballs + orecchiette in lemon` (`40 min.` + `Marlene Kupfer`). **Intent**: mismo layout; confirma que el rail "Our Latest Recipes" es horizontal-scrollable con 2.5 cards visibles a la vez.
- **IMG_1143** — Empty state For You tab. Título `For You` 32px bold izquierda. Vacío al centro: arco amarillo curvo con dot naranja arriba (logo-like mascot) + copy centrado `"We're searching for recipes for you. Please wait a moment."`. FAB naranja bottom-right siempre visible. **Intent**: loading/empty personality — en vez de spinner usa una ilustración minimalista que refuerza marca.
- **IMG_1159** — Collection detail "Packed Lunch". Header back-chevron + título centrado + filter-icon derecho. Sub-tabs `Kitchen Stories` (activa, naranja) / `Community`. Grid 2-col de cards: `Mango lassi` (10 min · Vegetarian · 76.8K), `Wake-up smoothie` (10 min · Vegan · 67.5K), `Greek inspired wrap` (30 min · Vegetarian · 71.9K), `Cheese and spina...` (15 min · Vegetarian · truncado). FAB naranja. **Intent**: collection como grid 2-col puro (no hero), con tab split entre contenido editorial y user-generated.

### B. Onboarding

- **IMG_1142** — Pregunta `"What is your favorite cuisine?"` con barra progress doble verde top (dos tracks de 50% cada uno indicando 2 sub-flows paralelos). Back-chevron izquierda + link texto "Skip the question" top-right derecha. Grid 2-col de **chip-pills** (radius pill completo, border verde 1.5px): `Italian` `Chinese` `Indian` `French` `Spanish` `Greek` `Thai` `Levantine` `Japanese` `Korean` `Vietnamese` `Turkish` `German` `British` `Mexican`. Los seleccionados tienen fill verde sólido + texto blanco; no seleccionados tienen fill blanco + texto verde + border. CTA "Next" verde full-width pill abajo fijo. **Intent**: preferences multi-select pre-content; no gating (Skip visible). Patrón `ChipGroup` de referencia.

### C. Recipe detail — hero + meta

- **IMG_1146** — Detail top. Status bar iOS limpia (no chrome de app). Foto hero bleed a sangre de Chicken Caesar Schnitzel (~450 px). Back-chevron circular blanco con halo sobre foto + share/heart top-right pareados (mismo tratamiento circular). Bajo la foto, card blanca con título serif `Chicken Caesar Schnitzel` 28px bold center + rating 5-star gray inactivo + fallback `"Too few ratings"` + par de iconos circulares `Share` / `♥ 389`. **Intent**: foto total + título-como-editorial, rating prominente aunque sea empty.
- **IMG_1152** — Variante del detail para "5-ingredient creamy tomato and basil pasta". Misma estructura: foto bleed (manos sosteniendo bowl), título serif centrado (split en 2 líneas), rating 4-star naranja + `Based on 372 ratings`, iconos Share + `♥ 65.8K`. **Intent**: confirma la escalabilidad del rating — empty ("Too few") vs populated (`65.8K likes`) comparten idéntico tratamiento.
- **IMG_1147** — Scroll del detail. Back-chevron + share + heart outline top. **Chef attribution card**: avatar circular 48px (foto `Paul Breuer`) + nombre bold + cargo `Social Media Manager at Kitchen Stories`. Párrafo intro personal ("Chicken Caesar Schnitzel? Yup, you heard that right!...") con link naranja `Read more` truncando. Divider. Sección `Reviews` con counter `0 comments · 0 images` + text-link naranja `Write` derecha. Divider. Sección `Difficulty: Easy 👍`. Tres tile-circles horizontales con ring arc: `30 min Preparation` (arc naranja parcial), `0 min Baking`, `0 min Resting`. **CTA sticky verde "Start cooking!"** pill full-width flotando sobre el scroll. Label `Ingredients` asomando. **Intent**: secuencia jerárquica autor → narrativa → social proof → logística → acción → contenido.
- **IMG_1154** — Variante recipe detail (distinta receta) con `Difficulty: Easy 👍` + los 3 time-tiles (`25 min Preparation` arc naranja, `0 min Baking`, `0 min Resting`). Sección `Ingredients` con selector servings (`2 Servings` izquierda + controls `- 2 +` derecha). Inicio lista ingredientes (`100 g crème fraîche`, `100 g`, `3 cloves garlic`, `300 g`). CTA sticky "Start cooking!" persiste. Reviews header superior con counter `630 comments · 333 images` + link naranja `Read` + carousel horizontal de 3 thumbs de dishes posteados + stack `+47`. **Intent**: Reviews como social proof visual, no solo texto; servings selector como primary interaction pre-cook.

### D. Recipe detail — nutrition + steps + ingredients

- **IMG_1148** — Scroll más profundo. Sección `Nutrition per serving` ListRow horizontal 4-col: `Cal 1075` · `Protein 82 g` · `Fat 42 g` · `Carb 87 g` — todos misma densidad visual, sin hero. Debajo banner beige peach `Step 1/3` full-width. Lista ingredientes del step con icon cart + texto: `400 g chicken breasts`, `cutting board - knife - plastic wrap - meat tenderizer`. Texto del paso wraps. Foto full-width entre parrafo de step y comienzo del step 2 (cocinero machacando filete). Banner beige `Step 2/3`. CTA sticky "Start cooking!" persiste. **Intent**: recipe detail tiene **vista previa** completa del cook mode inline antes de entrar en modo immersive.
- **IMG_1149** — Continuación. Banner `Step 1/3` + ingredientes lista + texto del paso. Banner `Step 2/3`. Foto full-width del paso 2 (sartén con algo friendo). CTA "Start cooking!" persiste. **Intent**: confirma pattern step = banner + ingredientes + texto + foto-full.
- **IMG_1150** — Continuación. `Step 2/3` + `Step 3/3` banners. Foto full-width del paso 3 (cocinero con mano metiendo batidora en un bowl con salsa). Lista ingredientes del step (4 tbsp mayonnaise - 1 tbsp Worcestershire sauce - 3 anchovies - 100 g Parmesan cheese - 1 tsp Dijon mustard - 2 lemons - 1 clove garlic - 300 g romaine hearts - salt - pepper - ... immersion blender - grater - bowl). **Intent**: mismos bloques, el recipe detail es "cook mode rolled out flat" como vista larga.
- **IMG_1151** — Scroll más profundo. Sub-section `Reviews` con `0 comments · 0 images` + link naranja `Write`. Divider. **`More delicious ideas for you`** — grid 2-col con 4 cards teaser: `Seeded chicken schnitzel with green...` (30 min · 10.4K), `5-ingredient gnocchi with burst cherry tom...` (20 min · Vegetarian · 13.9K), 2 más abajo (40 min Vegetarian, 15 min Vegetarian). **Intent**: cross-link recipes relacionadas como footer; same visual language que home feed cards.

### E. Reviews / comments

- **IMG_1153** — Pantalla "Comments" standalone. Header minimal `<` + título `Comments` center. Rail horizontal de 4 thumbs de dishes user-posted + stack `+47` al final. Comments feed con avatar + username color (gwen rosa, Willy azul) + `about a month ago` / `5 months ago` + bandera del idioma original (🇩🇪). Text body. Link naranja `Show original language: German`. Meta-actions: `♥ 0` · `Reply` + flag icon derecha. Foto stacked del review debajo del segundo comment (full-width thumb). **Bottom input bar**: icon cámara naranja circular + placeholder `"Write a comment"` + CTA `Send` texto. **Intent**: UGC reviews como feed conversacional tipo Twitter/Instagram; traducción auto opcional; input persistente bottom.

### F. Profile + Settings

- **IMG_1157** — Profile. Header `Profile` 28px bold left. Card row: avatar circular amarillo 64px con initial `V` + nombre `Vicente Calvarro Martinez` + caption `Community member` + CTA outline verde "Edit profile" pill. Divider. Sección `Account` con label `Current Plan` + value derecha `Free`. **Plus CTA card beige-peach** ilustrada (ilustración plano de un personaje con delantal cocinando) con title `"Try all Plus features for free during your 7-day trial period!"` + brand-tag `Plus` naranja-pill + CTA verde pill `"Try for free"` inline. Divider. Sección `Account Management` con ListRows icon+texto: `♥ Food preferences / Only applicable to the For you tab`, `↻ Restore purchases`. **Intent**: Plus monetization inline en Profile con softsell ilustrado; no intrusive, pero siempre visible.
- **IMG_1158** — Profile scroll abajo. Secciones puras `Account Management` (con `♥ Food preferences` + `↻ Restore purchases`), `System` (`🌐 Languages`, `⚖ Measurement System`, `🔔 Notifications`, `☀ Display`, `📱 App Icons`), `Support` (`❓ FAQs` con chevron expandible). **Intent**: Settings list con icon 20px outline left + label + sin chevron excepto en expandibles. Bottom nav visible con `Profile` activa naranja. Hierarchy totalmente textual, cero chrome.

---

## 4. Principios destilados

### 4.1 Sistema visual — tokens observables vs RIAL actual

| Token | Valor Kitchen Stories | RIAL actual | Acción |
|---|---|---|---|
| `--background` (light) | `#ffffff` puro | `#ffffff` (NEUTRAL warm stone-50 en PR 3) | **Skip** — RIAL ya fue por Bevel stone-50 |
| `--primary` (CTA default) | `#1f5e4a` (verde botella) | `#09090b` (black) | **Skip** — RIAL no adopta verde como primary; la paleta NEUTRAL ya tiene emerald como `brand-secondary` |
| `--accent-promo` | `#f26a21` (naranja) | `#ea580c` (EMBER) / amber-600 | **Skip dual-accent** — RIAL separa por paleta, no por función |
| `--surface-promo-soft` | `#fdf2e9` (beige peach) | `bg-surface-container-low` | **Copy concept** — añadir `--surface-promo` token para banners Plus/Step markers |
| Foto hero en recipe detail | a sangre, sin radius | `rounded-sm` + `aspect-video` + padding `PageShell` | **Adapt** — añadir variant `bleed` a `HeroGallery` |
| Radius pill | `9999px` (full round) | `rounded-full` (9999px) | Unchanged ✓ |
| Radius card | `12–16 px` (medium) | `rounded-sm` (4px) + `rounded-lg` (16px) | Unchanged ✓ |
| Shadow card | muy suave, casi invisible (ghost shadow-sm) | `shadow-elev-2` | Unchanged ✓ |
| Tap target CTAs | `~48 px` pill | `44 px` (HIG) | Unchanged ✓ (RIAL ya HIG-compliant) |
| Badge/pill veg | pill verde `#d9f0e0` fill + texto `#1f5e4a` | no existe — actualmente `tags[]` string | **Adapt** — `TagBadge` variant `diet` |
| Time-badge en card | pill cream `#fdf9e8` + texto dark `15 min.` | no existe formalmente | **Copy** — `TimeBadge` primitive |

### 4.2 Tipografía

**Decisión divisoria del playbook.** Kitchen Stories es el único competidor analizado que usa **serif editorial** (parecida a Tiempos, Source Serif, o Libre Caslon) **exclusivamente** para el título de recipe detail. El resto — home headers, section labels, nav, bottom CTAs, body copy — es sans-serif (parece Source Sans o Inter). El contraste serif-sans crea una pausa visual que convierte la receta en "artículo" antes de ser "instrucciones".

- **Adapt**: introducir token `--font-serif` (candidato: `Fraunces`, `Source Serif 4`, o `Crimson Pro` — todos libres vía Google Fonts/Capacitor). Aplicarlo **solo** en:
  - `RecipeDetail.tsx` título (el `h1` post-hero, IMG_1146/1152).
  - **Opcionalmente** en el hero card del `Discovery.tsx` "Receta del día" (IMG_1141).
- **No aplicar** en: home headers, section labels, list items, bottom nav, macros/numérico (RIAL sigue con JetBrains Mono para macros, consistente).
- Títulos pantalla (no recipe): sans 28–32 px bold (ya OK con `text-headline`).
- Meta-tag superior "Today's Recipe" 11 px uppercase tracking-widest naranja (`text-caption tracking-widest text-brand-secondary`) — IMG_1141.
- Rating footer copy "Based on 372 ratings" / "Too few ratings" → `text-body-sm text-on-surface-variant` (IMG_1146/1152).

**Costo concreto**: añadir un font family extra pesa ~80 KB WOFF2. El tradeoff vale si el serif define el posicionamiento editorial; si RIAL opta por posicionarse 100% track-first, skip esto.

### 4.3 Information design — jerarquía recipe detail

Patrón Kitchen Stories (IMG_1146 → 1147 → 1148 → 1149 → 1150 → 1151 → 1154):

```
[status bar natural iOS]
[foto hero bleed — 60–70% del viewport]
[back-chevron circular-halo izq + share/heart circular-halo der sobre foto]
[card blanca con título serif centered + rating stars + share/heart iconos circulares]
[chef attribution: avatar 48px + nombre + cargo]
[intro copy con Read more]
[Reviews header con counter + Write link]
[Difficulty pill]
[3 time-tiles con ring arc — Preparation / Baking / Resting]
[Nutrition per serving — ListRow 4-col plano]
[Servings selector — - N +]
[Ingredients list — ingredient por línea]
[Step 1/3 banner peach → ingredientes step → texto step → foto full-width]
[Step 2/3 banner → mismo ...]
[Step 3/3 banner → mismo ...]
[Reviews full — comments carousel + feed opcional]
[More delicious ideas for you — grid 2-col]

[STICKY BOTTOM: "Start cooking!" verde pill full-width]
```

**Diferencia vs RIAL hoy** (`src/features/recipes/screens/RecipeDetail.tsx`):
- RIAL actualmente monta ingredientes + instrucciones como secciones separadas sin interleaving step-a-step.
- RIAL no tiene sticky "Start cooking!" — el entry al `CookMode` está en el header derecha (icono chef-hat).
- RIAL no tiene chef attribution primary (solo `authorId?` si vino de social).
- RIAL usa foto hero con radius, no bleed.

**Adopciones propuestas para PR 1**: (a) invertir la jerarquía para que foto sea bleed, (b) sticky "Empezar a cocinar" pill sobre footer, (c) inline chef byline bajo título cuando `recipe.authorId` exista o fallback a "Comunidad RIAL".

### 4.4 Cook Mode — step-by-step patrón

Kitchen Stories trata el step-by-step como **dos vistas de los mismos datos**:
- **Vista pre-cook** (IMG_1148/1149/1150): scroll del detail; el usuario lee todos los pasos concatenados antes de comprometerse. Cada step lleva banner peach "Step N/Total", lista de ingredientes específicos del step (icon cart + texto plain), texto del step, foto full-width del step.
- **Vista cook mode** (no capturada explícitamente — inferida del CTA "Start cooking!" + patrón Paprika/NYT): entra a flujo immersive con pantalla a paso, WakeLock, navegación paso-siguiente, posible mantener sticky bottom.

**Decisión RIAL**. Copiar la vista pre-cook en `RecipeDetail.tsx` antes del CookMode existente. Beneficio doble: (1) usuario puede decidir cocinar sin entrar en modo immersive si la receta es corta; (2) mejora scroll content antes del CTA final. El `CookMode.tsx` actual sigue siendo la vista immersive canónica (WakeLock + swipe entre steps).

Tokens a añadir:
- `--surface-step-banner` = beige peach (`#fdf2e9` light / `#3d2e1f` dark con 8% opacity).
- `--text-step-label` = `text-on-surface` (oscuro), bold, 13 px.

### 4.5 Sticky CTA — "Start cooking!" pattern

**Hallazgo clave.** En todos los screens de recipe detail (IMG_1147, 1148, 1149, 1150, 1154) hay una pill verde `Start cooking!` flotando sobre la parte inferior — no desaparece con scroll. Implementación inferida: `position: sticky; bottom: 0` con `safe-area-inset-bottom` padding + pill `bg-primary text-on-primary h-12 rounded-full shadow-elev-3`.

**Decisión RIAL**. Copy directo. El flujo actual de entrar en cook mode vive en el header del `RecipeDetail.tsx` (icon chef-hat) — eso es sub-visible. Mover a sticky footer.

```tsx
// Patch conceptual en RecipeDetail.tsx
<div className="sticky bottom-0 left-0 right-0 px-6 pb-safe pt-3 bg-gradient-to-t from-surface to-surface/60 backdrop-blur-sm">
  <Button className="w-full" size="lg" onClick={openCookMode}>
    {t.recipes.startCooking}
  </Button>
</div>
```

Coste: ~20 líneas + 1 i18n key × 2 locales. Beneficio UX: +100% visibilidad del CTA principal.

### 4.6 Empty states — "loading personality mascot"

IMG_1143 muestra el empty del tab "For You" — **no es spinner**, es un arco amarillo curvo con un dot naranja arriba (el logo del producto convertido en mascot) + copy honesto `"We're searching for recipes for you. Please wait a moment."`. El empty comunica marca + honesty, no "loading" genérico.

**Decisión RIAL**. Adaptar `<EmptyState>` para aceptar un `illustration` slot además de `icon`. El brand-mascot RIAL (si existe — hoy no — candidato: el logo simplificado del Q3 branding) iría aquí. Mantener el CTA opcional (no añadir — Kitchen Stories no lo tiene en este empty porque es transitorio).

Crear variant `<EmptyState variant="loading">` con `<Sparkline>` de 3-pulse + copy custom. Útil para `Discovery.tsx` cuando el feed no tiene data aún, `ForYou` future, `Challenges` pre-fetch.

### 4.7 Badges, pills, chips

| Componente | Valor Kitchen Stories | RIAL | Acción |
|---|---|---|---|
| **Time badge card** | pill cream `bg-amber-50` + texto `text-amber-900` 11px bold `15 min.` — top-left foto | `RecipeCard` tiene tiempo pero en footer | **Copy** — overlay pill top-left sobre foto |
| **Diet badge** | pill `bg-emerald-50 text-emerald-800` 11px bold `Vegetarian`/`Vegan` — top-right foto | `tags[]` string sin visualización consistente | **Copy** — derivar de `recipe.tags` `['vegetarian','vegan','vegan-friendly',...]` |
| **Like counter** | pill `bg-black/40 text-white` + heart outline + número — bottom-right foto | no existe | **Adapt** — añadir `likesCount` a `RecipeCard` cuando venga de social |
| **Chip multi-select** | pill verde full-round, 2 estados (outline / fill solid) — IMG_1142 | no existe primitive | **Copy** — nuevo `ChipGroup` primitive para SettingsNutrition + Onboarding preferences |
| **Meta-tag editorial** | "Today's Recipe" 11px uppercase tracking-widest naranja — IMG_1141 | no existe | **Copy** — reusar en `DailyPickCard` variant de `RecipeCard` |
| **Author pill** | avatar 16px + nombre naranja bold `Ruby Goss` — IMG_1141 | no existe consistente | **Adapt** — añadir `AuthorChip` primitive |

Todos consistentes con paleta actual de RIAL si se delega a tokens:
- `TimeBadge` — `bg-surface-container-low/95 text-on-surface text-caption`.
- `DietBadge` — `bg-brand-secondary/10 text-brand-secondary text-caption`.
- `LikeCounter` — `bg-black/40 text-white text-caption`.

### 4.8 Chef attribution — editorial byline

**Hallazgo.** Kitchen Stories trata cada receta como **artículo con byline**: avatar circular 48px + nombre bold + cargo ("Social Media Manager at Kitchen Stories" — IMG_1147). Es diferente del "creador" de Instagram — es un colaborador oficial con título. Diferencia brand-as-publisher vs brand-as-platform.

**Decisión RIAL**. Adaptar con fricción. RIAL no tiene chefs internos — las recetas son seed + user-created + import URL. La propuesta:
- Seed recipes (46 actuales) → byline "Equipo RIAL" + avatar logo RIAL.
- User-created → byline `userProfile.displayName` + avatar.
- Import URL → byline del source extraído del parser (`og:site_name`) o "Importado de {domain}".

Nuevo primitive `<RecipeByline>`:
```tsx
<RecipeByline
  avatarUrl={author.avatarUrl}
  name={author.name}
  subtitle={author.role}  // optional
  variant="card"  // 'card' | 'inline' | 'compact'
/>
```

### 4.9 Pricing — soft-sell Plus inline

IMG_1141 muestra banner Plus beige inline al top del feed con X dismiss ("Try 7 days for free. Cancel anytime."). IMG_1157 muestra card peach ilustrada en Profile con CTA "Try for free". Dos patrones coexistentes:
- **Banner-strip**: impresión constante, dismissible, bajo el nav.
- **Card-illustrated**: impresión pasiva en Profile (solo si usuario es `Free`), no intrusive.

**Decisión RIAL**. Adapt. RIAL ya tiene `<RialPlus>` paywall full-screen. Añadir:
- **`<PlusBannerStrip>`** dismissible en Home — persist dismiss por 7 días en localStorage (`rial_plus_banner_dismissed_at`). Respeta ADR-008 timeline ("Try 7 days for free") — ya alineado.
- **`<PlusTeaserCard>`** en Profile — card peach con ilustración + CTA. Solo render si `!isPro`.

Skip: el dual-accent verde CTA + naranja brand. RIAL mantiene un accent por paleta activa.

### 4.10 Reviews / comments — social proof estratificado

Kitchen Stories resuelve el componente "reviews" con **tres densidades**:
1. **Mínima**: rating 5-star + `"Too few ratings"` fallback o `"Based on N ratings"` (IMG_1146/1152).
2. **Teaser**: counter + link (`0 comments · 0 images · Write` — IMG_1147).
3. **Preview**: counter + thumb carousel + stack `+N` + link (`630 comments · 333 images · carousel · Read` — IMG_1154).
4. **Full**: pantalla dedicada con feed conversacional + input persistente (IMG_1153).

RIAL hoy (`src/features/social/screens/PostDetail.tsx`) resuelve comments como feed plano sin las densidades 1–3. **Decisión**: copiar las densidades 1–3 como puntos de contacto dentro de `RecipeDetail.tsx` (el feed full es opcional, puede vivir en un sheet focus o en PostDetail).

### 4.11 FAB floating — lo que NO copiamos

IMG_1141 / 1143 / 1159 muestran un FAB naranja circular `+` flotante bottom-right siempre visible. **Skip deliberado.** RIAL tiene `BottomNav` con `+` central — añadir un FAB extra satura la zona bottom (conflict con la safe-area-inset + las posibles sticky CTAs como "Empezar a cocinar"). El `+` central de `BottomNav` ya cumple la función "create new".

### 4.12 Lo que NO copiamos

- **Dual-accent (verde + naranja) distribuido por función.** RIAL tiene 4 paletas × 2 modos; añadir una segunda capa de semantic-color sobrescribe la arquitectura.
- **FAB floating.** El `+` central de `BottomNav` ya existe.
- **Editorial-production heavy.** Kitchen Stories tiene equipo interno de recipe developers + fotógrafos + video crew. No escalable a RIAL pre-series-A; los seed recipes RIAL deben venir de partners (dietistas/creadores) o usuarios curados, no producción propia.
- **Multi-track progress bar en onboarding** (IMG_1142 doble-track) — confuso sin documentación del flow.
- **Comment translation toggle auto-Gemini** — requiere Edge function + detección idioma + coste latency; defer Q20.
- **For You feed con fondo blanco puro.** RIAL NEUTRAL warm es deliberado y mejor (no replicar).

---

## 5. Roadmap de ejecución — 5 PRs

| PR | Scope | Archivos nuevos | Archivos amendment |
|---|---|---|---|
| **1** | Recipe detail editorial overhaul (hero bleed + serif title + chef byline + sticky CTA) | `src/components/RecipeByline.tsx`, `src/test/conventions/recipe-byline.test.ts`, `src/components/patterns/TimeBadge.tsx`, `src/components/patterns/DietBadge.tsx` | `src/features/recipes/components/HeroGallery.tsx` (+ variant `bleed`), `src/features/recipes/screens/RecipeDetail.tsx` (reorder sections + sticky bottom CTA + byline mount), `src/index.css` (+ `--surface-promo` + `--font-serif` @font-face), `src/components/RecipeCard.tsx` (TimeBadge+DietBadge+LikeCounter overlays), `src/i18n/locales/{es,en}.ts` (+ `t.recipes.startCooking`, `t.recipes.bylineTeam`, `t.recipes.bylineImported`), `docs/PRIMITIVES.md` (tabla + ejemplos TimeBadge/DietBadge/RecipeByline), `CHANGELOG.md` |
| **2** | Step-by-step pre-cook view in RecipeDetail (inline step banners + step-scoped ingredients + full-width step photos) | — | `src/features/recipes/screens/RecipeDetail.tsx` (render steps inline con banner peach + ingredientes per step + foto per step), `src/types/recipe.ts` (ensure `RecipeStep.ingredients?: string[]` + `RecipeStep.photoUrl?: string`), `src/features/food/data/seed-recipes.ts` (backfill step ingredients en 46 recetas — esfuerzo alto, considerar defer), `CHANGELOG.md` |
| **3** | `<ChipGroup>` primitive + migrate Onboarding cuisine-preferences + SettingsNutrition likes/dislikes | `src/components/ChipGroup.tsx`, `src/test/conventions/chip-group.test.ts` | `src/features/profile/components/Onboarding.tsx` (step cuisine preferences — si se añade, Q19 no lo tiene), `src/features/profile/components/settings/SettingsNutrition.tsx` (likes/dislikes search UI → ChipGroup), `docs/PRIMITIVES.md`, `CHANGELOG.md` |
| **4** | Soft-sell Plus surfaces — `<PlusBannerStrip>` Home + `<PlusTeaserCard>` Profile | `src/components/RialPlusBanner.tsx`, `src/components/RialPlusTeaserCard.tsx`, `src/test/conventions/rial-plus-surfaces.test.ts` | `src/features/home/screens/Home.tsx` (mount banner strip top — dismissible con localStorage key `rial_plus_banner_dismissed_at`), `src/features/profile/screens/Profile.tsx` (mount teaser card below header cuando `!isPro`), `src/i18n/locales/{es,en}.ts` (+ `t.rialPlus.bannerCta`, `t.rialPlus.teaserTitle`, etc.), `CHANGELOG.md` |
| **5** | `<EmptyState variant="loading">` + brand-mascot illustration slot | `src/components/RialMascot.tsx` (SVG minimal — arco + dot) | `src/components/EmptyState.tsx` (añadir prop `illustration?: ReactNode` + variant `loading`), `docs/PRIMITIVES.md`, `CHANGELOG.md` |

**Dependencias / orden sugerido.** PR 1 es base (introduce tokens + primitives reusados). PR 2 depende de PR 1 (banner peach token). PR 3, 4, 5 son independientes entre sí — pueden paralelizarse. ROI descendente: **PR 1 (alto)** — mueve posicionamiento editorial-first. **PR 2 (medio)** — refuerza cook mode pero requiere data backfill. **PR 3 (medio)** — primitive reusable para múltiples consumers. **PR 4 (medio)** — monetization soft-sell. **PR 5 (bajo)** — polish.

**Governance.** Trabajar directamente en `main`. Cada PR = commit(s) + `release:preflight` verde + push a `rial-food/main` tras aprobación explícita del user.

---

## 6. Verificación end-to-end

```bash
npm run release:preflight
# tsc + lint + lint:code + check:i18n + test + build + size:check

preview_start
# Abrir /recipes/<id> tras PR 1 — verificar:
#   - foto hero a sangre (no radius)
#   - título serif visible (si font cargado OK)
#   - back/share/heart circular-halo sobre foto
#   - RecipeByline mount con avatar + nombre
#   - sticky "Empezar a cocinar" pill bottom persiste con scroll
#   - TimeBadge top-left sobre foto en RecipeCard (Home + Discovery)
#   - DietBadge top-right si tags incluyen vegan/vegetarian
# Verificar Discovery "For You" empty state tras PR 5 — mascot SVG + copy honesto
# Abrir Profile tras PR 4 — PlusTeaserCard visible si !isPro, ausente si isPro
# Abrir Home tras PR 4 — banner strip dismissible; re-mount tras 7 días
# Abrir SettingsNutrition tras PR 3 — ChipGroup render correcto en likes/dislikes
```

Baselines a preservar post-PRs:
- TypeScript: 0 errors.
- Tests: +8–12 nuevas assertions (convention tests de los 4 nuevos primitives).
- i18n symmetry: +~8 keys × 2 locales (estimado PR 1 + PR 4).
- Build: main +~80–100 KB raw si se añade `--font-serif` (Fraunces/Crimson Pro WOFF2). `size:check` debe seguir PASS — considerar defer PR 1 serif si supera budget.
- SectionCard drift: **0** (sin cambio).
- ESLint Q16 allowlist: **5** files shadcn-only (sin cambio).

**Riesgo principal.** La familia serif suma peso de bundle. Mitigación: usar `font-display: swap` + subset Latin-Ext + limitar a weights 400 + 700. Si el preview muestra flash unstyled serif notorio, revertir a sans uniforme (el posicionamiento editorial sobrevive sin serif — los otros 90% del playbook son independientes).

---

## 7. Fuentes

- Capturas: `docs/market/Competitor Images/Kitchens stories/` (IMG_1141–IMG_1159; IMG_1155/1156 ausentes).
- Doctrina general competidores: `docs/market/ux-patterns.md`, `docs/market/rial-positioning.md`, `docs/market/feature-matrix.md`.
- Sistema RIAL actual: `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/adr/` (ADR-001 a ADR-009).
- Playbook hermano (para fidelidad de formato): `docs/market/bevel-design-playbook.md`.

---

## 8. Notas para reviewer

- **Serif font decision es divisiva** — introduce +80 KB y un render paint extra. Si el owner prefiere pure Inter, PR 1 sigue siendo valioso sin la línea de `--font-serif` (los otros 8 cambios del PR 1 son independientes). Marcar sub-decision.
- **Sticky "Empezar a cocinar"** puede conflict con `<BottomNav>` si no se respeta safe-area-inset-bottom correctamente. Probar en iPhone 15/16 con home indicator y sin él (landscape).
- **Chef byline para seed recipes** requiere decidir copy ES — "Equipo RIAL", "RIAL Cocina", "Comunidad RIAL". Dejar al diseño de copy del owner.
- **Step ingredients en seed data** (PR 2) requiere backfill manual de 46 recetas × ~3–4 steps cada una = ~150 strings nuevas en `seed-recipes.ts`. Esfuerzo alto — considerar marcar `RecipeStep.ingredients` como opcional y fallback a la lista global si empty.
- **Translation toggle de comments** (IMG_1153 "Show original language: German") intencionalmente skipped — requiere Edge function Gemini + detección de idioma + latency UX. Defer a Q20+ con post-lanzamiento i18n.

---

## 9. RIAL verified-recipe applicability (R1.1 re-audit, 2026-04-19 PM)

> Owner directive 2026-04-19: re-auditar las 17 capturas IMG_1141–1159 con foco específico en aplicar el paso-a-paso editorial de Kitchen Stories **solo** al layer de recetas verificadas de RIAL (oficiales del equipo + creadores verificados), no al conjunto completo.

### 9.1 Principio general: "tiered treatment"

Kitchen Stories es **content-first** — cada receta es un artículo con byline, foto pro, chef attribution, social proof. RIAL no puede escalar ese tratamiento a **todas** las recetas (seed 46 + user-imported URL + user-created + futuras UGC) porque no hay equipo de producción editorial. La única vía sostenible es **tiered**: un subset pequeño recibe el tratamiento editorial completo, el resto mantiene el layout standard existente. Coincide con el patrón de marketplaces/plataformas maduras (Airbnb "Guest Favorite", Spotify "Editorial Playlist", Netflix "Netflix Original").

**Data-model mínimo** (R2.1 del plan): `Recipe.verified?: 'rial' | 'creator' | null`. Empty/null = user-saved estándar; `'rial'` = receta oficial del equipo/partners; `'creator'` = creador verificado (flag futura `userProfile.isVerifiedCreator` gate-ea quién puede setearla). Feature-flag: `featureFlags.verifiedRecipePolish` default `false` durante rollout controlado.

### 9.2 Tabla Copy / Adapt / Skip — re-clasificada por tier

Cada patrón documentado en §2 se re-etiqueta con su tier de aplicación. Objetivo: saber qué patrones son "verified-only" (coste editorial alto) vs "universales" (coste marginal cero, aplicables a toda receta).

| Patrón Kitchen Stories | §2 original | **Tier RIAL (R1.1)** | Razón |
|---|---|---|---|
| Foto hero a sangre (bleed, sin card) | Copy | **Verified-only** | Requiere foto pro / creator-curated. User-saved + importadas heredan fotos de calidad irregular; bleed amplifica la mediocridad. |
| Tipografía serif en título | Adapt | **Verified-only** | El posicionamiento "artículo" solo es creíble con curation + foto pro. Serif sobre user-saved grita "fake premium". |
| Sticky "Cocinar" CTA pill bottom | Copy | **Universal** | UX pura, 0 coste editorial. Cualquier receta con >1 step se beneficia. |
| Tres time-tiles con arc (Prep/Cook/Rest) | Adapt | **Universal** | Primitive reusable `<TimeTileComposite>`. Seed tiene `prepTime`/`cookTime`. User-saved con tiempos 0 renderizan "empty-tile" (patrón `ConstantTile`). |
| Chef attribution card | Adapt | **Verified-only** | Cargo ("RIAL Verified" / "Creator @nombre") solo con actor verificado. User-saved muestra solo fecha de guardado (default). |
| Step banner peach + step ingredients + foto full-width | Copy | **Verified-only** (foto) + **Universal** (banner + ingredients) | Foto/step requiere curation. Banner + ingredients son markup reusable. Sin `step.photoUrl` fallback omite foto; sin `step.ingredientIds` fallback omite sub-lista. |
| Per-step ingredients (step.ingredientIds) | — (nuevo R5) | **Universal** (con fallback) | Si existe → render sub-lista; si no → fallback al overlay global. |
| Ingredient check-off CookMode | — (nuevo R5) | **Universal** | Cliente-side, 0 coste. |
| Mise-en-place pre-cook screen | — (nuevo R5) | **Universal** (opt-in) | `settings.miseEnPlacePreCook` default `true`. |
| Rating stars + "Too few ratings" | Copy | **Verified-only** (V1) | Sin UGC ratings, placeholder queda permanente. Verified puede heredar ratings seed curados. Defer Q20+. |
| Comments carousel thumb stack + `+N` | Adapt | **Verified-only** (V1) | Requiere UGC masivo. Defer. |
| Banner Plus beige top-home dismissible | Adapt | **Universal** (home-level) | Independiente del tier. |
| TimeBadge top-left + DietBadge top-right | Copy | **Universal** | Deriva de `recipe.tags[]` + tiempos. 0 coste. |
| Author pill bajo título card | Adapt | **Universal** (con fallback) | "Equipo RIAL" / "Creator @nombre" / "Tu receta" / "Importado de {domain}" cubre 4 orígenes. |
| Meta-tag "Today's Recipe" 11px naranja | Copy | **Verified-only** | Solo como "Receta verificada RIAL" sobre verified card. |
| Collection grid 2-col + tabs split | Adapt | **Universal** | Pattern reusable en R3 (`verificadas`, `rapidas`, etc.). |
| Empty "For You" mascot ilustrado | Copy | **Universal** | Pattern general. |
| ChipGroup multi-select cuisine | Copy | **Universal** | Primitive reusable. |

**Resumen tier-split**:
- **Universal** (aplica a toda receta, sin gate): 10 patrones — sticky CTA, time-tiles, step banners + ingredients, check-off, mise-en-place, TimeBadge, DietBadge, author pill, collection grid, empty states, ChipGroup, Plus banner.
- **Verified-only** (aplica solo cuando `recipe.verified !== null`): 7 patrones — hero bleed, serif title, chef attribution card, per-step photos, rating stars placeholder, comments carousel, meta-tag "Receta verificada".

### 9.3 Mapping al sprint map R2-R7

| Sprint | Patrón | Tier | Archivo RIAL afectado |
|---|---|---|---|
| **R2** | Sticky "Cocinar" CTA | Universal | `RecipeDetail.tsx` (no flag-gated) |
| **R2** | Time-tile composite (Prep/Cook/Rest arc) | Universal | `TimeTileComposite.tsx` new + RecipeDetail mount |
| **R2** | Author/chef attribution card | Verified-only | `AuthorAttributionCard.tsx` new + RecipeDetail branching on `recipe.verified` |
| **R2** | Hero bleed variant | Verified-only | `HeroGallery.tsx` extend + RecipeDetail branching |
| **R2** | Serif title variant | Verified-only | `index.css` `--font-serif` token + RecipeDetail className conditional |
| **R2** | Meta-tag "Receta verificada" pill | Verified-only | `RecipeCard.tsx` + RecipeDetail header variant |
| **R2** | Cocina Verified filter chip + editorial treatment | Verified-only | `Cocina.tsx` chip + RecipeCard variant switch |
| **R3** | Collection grid 2-col + carrusel horizontal | Universal | `Cocina.tsx` + `collections.ts` new |
| **R3** | Empty states contextuales | Universal | `Cocina.tsx` |
| **R5** | Step banner peach "Step N/Total" | Universal | `CookMode.tsx` |
| **R5** | Per-step ingredients sub-list | Universal (con fallback) | `CookMode.tsx` + `recipe.steps[i].ingredientIds?` type |
| **R5** | Ingredient check-off strike-through | Universal | `CookMode.tsx` transient state |
| **R5** | Mise-en-place pre-cook | Universal (opt-in) | `MiseEnPlaceScreen.tsx` new + routing |

### 9.4 Patrones NO aplicables a RIAL (re-firmado 2026-04-19)

Confirma §4.12 + añade:
- **Ratings UGC**: IMG_1146/1152 aspiracionales hasta Q20+. Placeholder "Too few ratings" permanente = fake-empty-state. Esperar.
- **Comments carousel visual IMG_1154**: requiere UGC volumen + fotos reales. Defer.
- **Editorial heavy producción**: skip. Verified recipes se marcan entre las 46 seed existentes (8-10 heroes por calidad de foto). No producir nuevas.
- **Dual-accent verde/naranja**: skip. RIAL 4 paletas.

### 9.5 Riesgo "dos RIAL distintos en el mismo screen"

Mostrar verified-recipe con hero bleed + serif + chef card y scrollear a user-saved sin ningún tratamiento puede percibirse como "app rota". **Mitigación**:

1. **Layout-parity en Cocina grid**: verified se marcan con pill "Verificada" top-left + badge `<CheckCircle2>` en author pill, pero **el layout de la card permanece idéntico**. La diferencia editorial se revela solo al abrir RecipeDetail.
2. **Serif gate**: `--font-serif` con `font-display: swap` — si falla o es user-saved, fallback a Inter. Zero breakage.
3. **Chef card additive**: user-saved renderiza `AuthorAttributionCard variant="savedDate"` (avatar RIAL + "Guardado el 12 Abr 2026"); verified renderiza `variant="rialTeam"` o `variant="creator"`. Mismo componente, 3 variantes, mismo footprint (~64px). Sin "hueco" perceptible entre tiers.

Este apartado es regla de review: cualquier patrón verified-only que rompa layout-parity con user-saved es motivo de rechazo en PR R2.

### 9.6 Gate check R1 → R2

- [ ] Owner firma la clasificación tier-split de §9.2.
- [ ] Owner valida la lista de 8-10 heroes RIAL seed a marcar `verified: 'rial'` en R2.1.
- [ ] Owner revisa mitigation plan §9.5 layout-parity.

Post-gate → R2 procede con write-set del `recipe-playbook.md` §6 (R1.4).
