# NYT Cooking Design Playbook

> Accionable. Complemento del índice (`competitors-index.md`) + deep-dive histórico (sin ficha dedicada aún). Alcance: extraer las prácticas de diseño visible en 16 capturas de NYT Cooking (IMG_1160–1168 + IMG_1233–1239) que merece la pena **copiar, adaptar o descartar** para RIAL. Foco recipe-detail + discovery + library.
>
> Última revisión: 2026-04-19 PM. Capturas en `docs/market/Competitor Images/NYT cooking/`.

---

## 1. Por qué NYT Cooking como referencia

NYT Cooking es el **benchmark de referencia editorial "newspaper-quality" para recetas digitales** — heredero directo del periódico, curation heavy, foto pro, autores reconocibles (Melissa Clark, Eric Kim, Andy Baraghani son nombres de alcance cultural). Diferencia estructural vs Kitchen Stories:

- **KS es "editorial contemporary magazine"** — serif + dual-accent + chef byline + foto propia.
- **NYT Cooking es "newspaper editorial"** — serif más grande y clásico (Cheltenham / NYT Mag-like), radios más pequeños, tipografía como protagonista absoluto. Menos "pop", más "authority". Autores linkeables como en un artículo periodístico.

Lo distintivo frente a los otros 19 competidores:

- **Tipografía serif grande con peso regular** en títulos receta (`Fresh Lemon and Chile Pasta`, `Garlicky Chicken With Lemon-Anchovy Sauce` — IMG_1165 / 1237) — no es el serif "cute" de Kitchen Stories; es serif newspaper clásico ~32-36px.
- **Author as hyperlink** (`By Andy Baraghani`, `By Melissa Clark` — underlined bold, IMG_1165 / 1237) — el autor es entidad linkeable, no decoración.
- **Hero photo con credits line pequeña** (`David Malosh for The New York Times. Food Stylist: Simon A...` — IMG_1237) — meta-información editorial explícita. Unique entre competidores.
- **"Start Cooking" button outline ancho full-width** (IMG_1167) — no es pill verde flashy (Kitchen Stories) sino botón outline cream fino bajo `PREPARATION` header. Anti-flashy, confía en el contenido.
- **Step headers `Step 1` / `Step 2` bold sans-serif + texto serif body** — la estructura recuerda a un artículo con secciones numeradas, no a una "recipe app".
- **Recipe Box con folders-as-files** (IMG_1164) — `Favorites` / `Want To Cook` / `+ New` con grid de cards vacías ilustrated icon (heart outline + pot outline). Patrón "iOS Files.app" aplicado a recetas.
- **Bottom nav 5-tabs con tipografía serif-adjacent**: `Home · Inspiration · Search · Recent · Recipe Box` — el tab "Inspiration" es un tab video-first (IMG_1163/1236/1239 — full-screen video vertical con recipe card anclado bottom), TikTok-like pero curated editorial.
- **Subscription gate "Get access to all of NYT Cooking"** como strip persistente bajo el header cuando user no pro (IMG_1165/1166/1167/1168/1237/1239) — orange pill `Subscribe` + copy claim simple. Anti-modal.

**Recipe-relevance para RIAL: CRÍTICA** — sexta mejor referencia recipe-side del inventario junto con Kitchen Stories. Aporta patrones complementarios: mientras KS enseña "receta como pieza editorial magazine", NYT enseña "receta como artículo periodístico con autor citable". Para el tier verified de RIAL (R2), los dos son compatibles con decisiones de tipografía distintas. Para cook-mode video-first (Inspiration tab), NYT es el único que tiene patrón video-first editorial curado, no UGC TikTok.

**No** copiar el gate de suscripción duro (feature todo-o-nada) ni el branding NYT — son específicos del ecosistema newspaper.

### 1.1 Design system observable

| Token | Valor NYT Cooking | Comparación RIAL |
|---|---|---|
| `--background` (light) | `#fafafa` puro + `#f5f3f0` cream en gate strip | RIAL NEUTRAL warm stone-50 ≈ similar |
| `--primary` (CTA default) | `#e13d1a` (rojo NYT Cooking brand) | RIAL no usa rojo como primary |
| `--accent-subscribe` | `#e13d1a` pill orange-red `Subscribe` | RIAL EMBER es similar |
| Fuente titular | Serif clásico (NYT Cheltenham-like, probable custom) weight 400 | RIAL Inter — sin serif |
| Fuente body | Serif para intro + sans-serif para logistical (Time/Rating/Comments) — **dual-font hierarchy** | RIAL Inter único |
| Fuente step headers | Sans-serif bold (Franklin-like) | RIAL Inter bold |
| Radius card | `8-12 px` | RIAL `rounded-sm` (4px) + `rounded-lg` (16px) — NYT entre ambos |
| Radius pill CTA | full round | Idéntico |
| Shadow card | muy suave, casi invisible | Idéntico |
| Tap target CTAs | `~44 px` pill | Idéntico |
| Iconografía | Thin outline 20-22px, minimalistic | Idéntico (Lucide) |
| Bottom nav style | 5 items, label text visible + icon sans-serif | RIAL igual |

### 1.2 Recipe-detail anatomy (IMG_1165 → 1168, IMG_1237)

```
[back-chevron top-left + chat bubble count top-right + bookmark + share]
[gate strip "Get access to all of NYT Cooking. | Subscribe" — persistente si !pro]
[foto hero card ~280px con escape-to-fullscreen icon top-right]
[credits line micro "David Malosh for The New York Times. Food Stylist: ..."]
[título serif grande ~32px `Fresh Lemon and Chile Pasta`]
[author linkeable underlined `By Andy Baraghani`]
[meta row: `Time 20 min (Prep 5 min | Cook 15 min)` | `Rating 5 ★★★★★ (638)` | `Comments 61 comments`]
[primary CTA `Save` rojo pill full-width + 2 iconos print + share inline]
[intro paragraph serif body con `Read more` truncate]

[section `INGREDIENTS` con divider + Yield `4 servings` + multiplier `1x v`]
[lista ingredientes line-by-line sin viñeta, sin bold]
[CTA outline `Add ingredients to Grocery List`]
[link `Ingredient Substitution Guide` underlined]
[link `Nutritional Information` underlined]

[section `PREPARATION` con divider]
[outline CTA `Start Cooking` full-width cream]
[heading `Step 1` bold sans + texto serif body]
[heading `Step 2` bold sans + texto serif body]
...
[below last step: `Mark as Cooked` check + `Rate` 5-star inline]
[`Your Private Notes` section + `Add a Note` outline CTA]

[section `More From Our Best Weeknight Dinner Recipes` carrusel horizontal con cards rectangulares rating bajo nombre]
[bottom nav 5-tabs]
```

**Diferencia vs Kitchen Stories**:
- NYT **NO tiene sticky "Start cooking" pill bottom** — el CTA `Start Cooking` vive dentro de la sección PREPARATION inline. KS sticky es más accionable; NYT inline respeta más el flow editorial.
- NYT muestra **rating + comments count en la meta row** junto a `Time`, como si fueran campos de igual peso. KS los trata en secciones separadas.
- NYT **separa fields explícitamente**: `Time 20 min (Prep 5 min | Cook 15 min)` — sub-paréntesis con split. KS usa los 3 time-tiles visuales. Dos filosofías: NYT textual-first (más denso), KS visual-first (más aireado).
- NYT **Yield con multiplier `1x v` dropdown** — Mismo concepto que KS servings selector (`- 2 +`) pero en dropdown en lugar de stepper.
- NYT **`Mark as Cooked` + `Rate` + `Add a Note`** al final — sección "I cooked this" integrada. KS tiene `Write` link separado.
- NYT **carrusel "More From…"** con rating overlay — KS usa grid 2-col con like-count overlay.

### 1.3 Inspiration tab — video-first curated editorial (IMG_1163, 1236, 1239)

Tres capturas de la Inspiration tab muestran **video vertical full-screen tipo TikTok** con overlay minimal bottom:

- **IMG_1163**: persona hablando a cámara (chef Eric Kim) + overlay bottom con thumbnail receta izquierda + título `Cheesy Cabbage Tteokbokki` + autor `Eric Kim` + rating `★5 (1.2k)` + `30 min` + 2 pills CTA `See ingredients` / `Go to recipe >`.
- **IMG_1236**: overlay con lista ingredientes expandida (`Hide ingredients` / `Go to recipe >` CTAs) — chef pinching una pieza de pollo.
- **IMG_1239**: clip 3-min de fileteado con 2 mini-iconos top-right (CC subtítulos + audio mute) + 3 iconos top-right (`CC` · audio · share) + la overlay card bottom solo con título/autor/rating/save-bookmark.

**Patrón distintivo**: **video editorial curated-by-NYT, no UGC**. Cada video tiene un chef real de la casa con iluminación pro. **Controls minimal**: CC + audio mute + share. **See ingredients / Hide ingredients** como toggle para ver ingredientes sin salir del video. **Go to recipe** navega al detail.

RIAL **no tiene producción video propia** — replicar esto requiere creators. Pero el **pattern de "recipe detail + video companion"** es universal (hoy `VideoSection.tsx` de la Fase 1 multi-media ya soporta YouTube iframe + external CTA para TikTok/IG/Vimeo; lo shipped en `58aa9c7`). **Defer video-first tab como feature a Q21+ UGC creator** o como agregador TikTok/IG import.

### 1.4 Library — Recipe Box folders-as-files (IMG_1164)

`Recipe Box` tab con search top + 2 chips filtros (`Cooked Recipes` check-pill + `Grocery List` pill) + sección `RECENTLY SAVED` con sub-sección `YOUR FOLDERS + New` grid 2-col de folder cards:

- Card 1: `Favorites` con heart outline ilustración centrada + `No recipes yet` subcopy.
- Card 2: `Want To Cook` con pot outline + `No recipes yet`.
- `+ New` pill icon top-right para crear folder custom.

**Pattern "iOS Files.app" aplicado a recetas**: el usuario crea folders arbitrarios, cada receta puede ir a N folders (implícito). Comparable a Pinterest boards aplicado a Paprika-style recipe manager. RIAL hoy tiene una lista plana `savedRecipes[]` — no hay concepto folder/collection-persistente user-defined.

**Aplicabilidad R3 (collections)**: R3 del plan introduce `collections.ts` con 6-8 **curated collections** (rápidas, alta proteína, vegano, etc.). El paso siguiente (Q20+) sería permitir al usuario **crear collections custom** (folders) y asignar recetas manualmente. Documentado aquí como direction, no R2-R7.

---

## 2. Matriz Copy / Adapt / Skip

| Patrón NYT Cooking | Referencia captura | Decisión | Dónde |
|---|---|---|---|
| Serif grande en título receta (newspaper-classical) | IMG_1165 / 1237 | **Adapt** | Compatibilidad con R2 verified-only serif (`--font-serif` token compartido — decidir entre Fraunces/Source Serif/Libre Caslon) |
| Author como hyperlink underlined `By <name>` | IMG_1165 / 1237 | **Copy** | `AuthorAttributionCard.tsx` variant "inline-byline" — underline optional |
| Credits line bajo foto hero "Photo by X. Food Stylist: Y" | IMG_1165 / 1237 | **Skip** (V1) | Requiere campos `photoCredit` / `foodStylist` en `Recipe` type — no hay signal de uso V1 |
| Gate strip "Get access to all of X | Subscribe" persistente bajo header | IMG_1165–68 / 1237 / 1239 | **Adapt** | `RialPlus` banner strip variant — dismissible con localStorage, mostrar cuando `!isPro` |
| Meta row compacta `Time (Prep | Cook) | Rating | Comments` textual | IMG_1165 / 1237 | **Copy** (alternative a KS 3-time-tiles) | Verified-only variant en `RecipeDetail.tsx`: swap 3-time-tile por row textual densa cuando R2 feature-flag OFF o user prefiere compact |
| Yield + multiplier dropdown `1x v` | IMG_1166 | **Skip** | RIAL ya tiene `- N +` stepper en `PortionSelector` — mismo resultado |
| `Add ingredients to Grocery List` CTA outline full-width | IMG_1166 | **Copy** | `RecipeDetail.tsx` — ya existe hook `handleAddToShoppingList`; exponer como outline CTA full-width bajo lista ingredientes |
| `Ingredient Substitution Guide` link | IMG_1166 | **Skip** | RIAL tiene substitutions inline en cada ingredient row (Food Families P-series ya lo consolidó vía P4 variant pin + P8–P10 FoodDetail sustitutos + P11 contextual scoring; R4 original quedó absorbido) |
| `Nutritional Information` link | IMG_1166 | **Skip** | RIAL tiene nutrition inline visible (no modal) |
| `Start Cooking` outline CTA inline en PREPARATION (no sticky) | IMG_1167 | **Skip** | RIAL adoptó sticky pill CTA de Kitchen Stories (§9.3 R2) — decision ya tomada |
| Step headers `Step N` bold sans + texto serif body | IMG_1167 | **Adapt** | `CookMode.tsx` + RecipeDetail step-preview: bold sans header, body Inter regular (no serif — evita coste bundle `--font-serif` en CookMode) |
| `Mark as Cooked` check + `Rate` 5-star inline bottom of steps | IMG_1168 | **Copy** | `RecipeDetail.tsx` — marca "Ya lo he cocinado" toggle + rating UGC (defer rating a Q20+); el "Mark as cooked" puede shipear sin rating como boolean simple |
| `Your Private Notes` + `Add a Note` outline CTA | IMG_1168 | **Copy** | `RecipeDetail.tsx` — `recipe.personalNote?: string` + textarea; usada en meal-planning y review |
| `More From Our Best Weeknight Dinner Recipes` carrusel horizontal related | IMG_1168 | **Copy** | `RecipeDetail.tsx` footer — carrusel con recetas con tags overlapping (de ahí la R3 collection). Ya existe en KS (§2 "More delicious ideas") — converge |
| Inspiration video-first tab TikTok-like curated | IMG_1163 / 1236 / 1239 | **Skip (V1)** | Requiere producción propia o UGC creators — defer Q21+ |
| Video controls minimal (CC + audio + share) | IMG_1239 | **Adapt** | Si R2 verified-only añade recipe video ref, adoptar controls minimal en `VideoSection.tsx` existing |
| Recipe Box folders-as-files (`Favorites`, `Want To Cook`, `+ New`) | IMG_1164 | **Skip (V1)** | User-defined collections = Q20+; R3 ships solo curated collections |
| `Cooked Recipes` chip filter en library | IMG_1164 | **Copy** | `Cocina.tsx` — filter chip "Ya cocinadas" cuando `recipe.cookedAt` exista (depende de Mark as Cooked) |
| Newsletter signup onboarding con 4 selecciones | IMG_1160 | **Skip** | RIAL no tiene newsletter channel |
| Free-trial paywall 7 días con claims limpios | IMG_1161 | **Adapt** | `RialPlus.tsx` ya tiene estructura similar; copy "Simple and delicious / Personalized picks / Easy organization" es universal-solid |
| Search tab con `RECIPES BY CATEGORY` grid 3×3 de tiles con foto + label overlay | IMG_1162 | **Copy** | `Discovery.tsx` o nuevo `SearchTab` — tile grid con foto receta-representativa + label collection (9 categorías: Dinner, Vegetarian, Dessert, <30 Min, Easy, Healthy, Appetizer, Vegan, Breakfast) |
| `BROWSE BY SERIES` chips linkeables (`Dumpling Week`, `Cooking 101`) | IMG_1162 | **Skip** | Series = NYT editorial publication concept, no aplica |
| Settings panel con `ACCOUNT / EXPERIENCE / SUPPORT & TOOLS` grupos + `Autoplay Homepage Videos` toggle | IMG_1233 | **Copy** | `Settings.tsx` — añadir `autoplayVideos` toggle en Experience section (defer hasta video tab) |
| Privacy Settings dedicated screen con `Manage Privacy Preferences` + `Privacy Policy` + `Privacy FAQ` + `Delete My Account` rojo | IMG_1234 | **Copy** | RIAL ya tiene este patrón (shipped S3 Wave 0+1 Legal `[1.5.52]`) — verify alignment |
| Share sheet iOS nativo on long-press | IMG_1235 | **Copy** | RIAL usa `navigator.share` nativo — ya OK |

---

## 3. Principios destilados

### 3.1 Serif newspaper-classical vs serif magazine

El serif de NYT es más **delgado, más formal, más grande** que el de Kitchen Stories. Si R2 ships `--font-serif` token, debe elegir **una** familia serif que funcione para ambos tonos. Candidatos:
- **Fraunces** (variable, supporta SOFTness slider — versátil entre newspaper y magazine) — 80-120 KB WOFF2.
- **Source Serif 4** (Adobe, clean newspaper) — 70 KB.
- **Libre Caslon Text** (open-source newspaper-like) — 50 KB.
- **Playfair Display** (editorial display, más cercano al INDYA oblique) — NO, demasiado ornamental para recipes.

**Recomendación R2**: **Fraunces** por versatilidad (variable font — un solo file cubre weights 400-700 + italic + softness variation). `font-display: swap` + subset Latin-Ext para ES.

### 3.2 Gate strip "Subscribe" persistente

NYT muestra una strip cream fija bajo el header en todas las pantallas de recipe detail cuando el user no tiene subscription activa. **Anti-modal** (no interrumpe), **persistente** (visible siempre), **orange pill right-aligned** (accent color). Copy `Get access to all of NYT Cooking.` + CTA `Subscribe`. Dismiss no existe — es gate permanente para `!isPro`.

**Aplicabilidad RIAL**: Kitchen Stories §4.9 ya propone `<PlusBannerStrip>` dismissible top-home. NYT pattern difiere: **persistente + recipe-detail-only + strip bajo header + right-aligned CTA**. Ambos viables, distintos trade-offs:
- KS dismissible = menos fricción, más abandono monetización.
- NYT persistente = más fricción, más conversión.

**Decision para RIAL**: sigue KS (dismissible) en home, adopta NYT pattern **solo** en RecipeDetail para verified-recipes con feature gate (ej. "cocinar verified recipes premium requiere Plus" → CTA `Empezar Plus` strip). Defer a Q17+ si ese feature-gate se valida.

### 3.3 `Mark as Cooked` — estado tracking barato

NYT permite marcar receta como cocinada sin rating obligatorio. Es un boolean cheap que alimenta filtros ("Cooked Recipes" chip en Library — IMG_1164) + analytics ("qué recetas realmente se cocinaron" vs "cuáles solo se guardaron"). **RIAL no tiene este estado**. Aplicable en R2 o R3:
- Añadir `recipe.cookedAt?: string[]` (array de ISO timestamps — permite multiple cookings).
- Render en RecipeDetail footer: "Ya lo he cocinado" toggle botón pill.
- Chip filter "Ya cocinadas" en Cocina.
- Defer rating UGC a Q20+.

**Coste mínimo**, data útil para Q6+ Supabase (data-driven personalization).

### 3.4 `Your Private Notes` — textarea per-recipe

IMG_1168 sección dedicada `Your Private Notes` con placeholder `You don't have any notes on this recipe yet.` + CTA outline `Add a Note`. Campo `personalNote: string` per-recipe.

**Aplicabilidad RIAL**: útil para recipe-book powerusers ("la próxima vez hacer con menos sal", "sustituí X por Y y salió mejor"). Bajo coste de implementación. **Defer a R7** (CreateRecipe polish sprint) — lógicamente contiguo con el authoring flow.

### 3.5 Search tab grid de categorías con foto representativa

IMG_1162 muestra Search tab con grid 3×3 de categorías, cada tile con **foto representativa de una receta** + overlay label blanca bottom (`Dinner`, `Vegetarian`, `Dessert`, `< 30 Min`, `Easy`, `Healthy`, `Appetizer`, `Vegan`, `Breakfast`). No lista texto, no chips — tiles visuales.

**Aplicabilidad R3 (Cocina collections)**: el plan R3.1 ya propone carrusel horizontal de collection cards. NYT sugiere **upgrade a grid 2×N visual** con foto representativa (hero recipe de cada collection). Más rico que chips pill, similar footprint que carrusel.

**Write set R3 potencial**: en lugar de carrusel horizontal, grid 2-col de 6-8 collection tiles 1:1 aspect con hero-recipe foto de fondo + label overlay. Cada collection `heroRecipeId: string` que apunta al seed representativo.

---

## 4. Lo que NO copiamos

- **Branding color NYT (rojo `#e13d1a`)** — es trademark brand.
- **Inspiration video tab curated** — no hay producción propia V1.
- **Folder-based library (Recipe Box)** — Q20+ user-defined collections.
- **Gate strip hard (no dismissible)** — fricción más alta de lo deseado para una app recipes + tracker.
- **Newsletter signup onboarding** — RIAL no tiene canal email.
- **Ingredient Substitution Guide dedicated link** — RIAL integra substituciones inline.
- **Yield dropdown `1x v`** — `PortionSelector` stepper ya cubre.
- **Series-based browsing** — NYT editorial concept.

---

## 5. Roadmap de ejecución — mapping a sprints R2-R7

NYT Cooking alimenta R2 + R3 + R5 + (upstream) R7:

| Sprint | Patrón NYT aplicado | Archivo RIAL |
|---|---|---|
| **R2** | Serif `--font-serif` (Fraunces) variable font para verified title | `index.css` + `RecipeDetail.tsx` |
| **R2** | Author hyperlink underlined bajo título | `AuthorAttributionCard.tsx` new (comparte con KS R1.1 §9.3) |
| **R2** | Meta row textual densa (Time/Rating/Comments) — variant alternativa a KS 3-tiles | `RecipeDetail.tsx` — feature flag decide tile-vs-row (defer — empezar con KS 3-tiles per playbook principal) |
| **R2** | `Mark as Cooked` toggle + chip filter "Ya cocinadas" | `Recipe.cookedAt?: string[]` type ext + `RecipeDetail.tsx` footer toggle + `Cocina.tsx` chip |
| **R2** | `Add ingredients to Grocery List` CTA outline full-width bajo ingredients | `RecipeDetail.tsx` (reuse existing handler) |
| **R3** | Search grid 2×N visual con hero-foto por collection | `Cocina.tsx` + `collections.ts` (añadir `heroRecipeId` field) |
| **R5** | Step headers bold sans + body Inter (no serif) en CookMode | `CookMode.tsx` + RecipeDetail step-preview |
| **R7** | `Your Private Notes` textarea en RecipeDetail | `recipe.personalNote?: string` + RecipeDetail section + CreateRecipe/RecipeDetail edit form |

**Dependency**: Fraunces variable font carga en R2 — compartido con Kitchen Stories verified serif. `AuthorAttributionCard.tsx` consolida los patterns de KS (card chef avatar + nombre + cargo) + NYT (inline underlined byline) en un solo componente con `variant` prop: `'card'` | `'inline'` | `'savedDate'` | `'creator'`.

---

## 6. Fuentes

- Capturas: `docs/market/Competitor Images/NYT cooking/` (IMG_1160–1168 + IMG_1233–1239).
- Playbook hermano: `kitchen-stories-design-playbook.md` (compartir `--font-serif` + `AuthorAttributionCard`).
- Índice: `competitors-index.md`.

---

## 7. Notas para reviewer

- **Fraunces vs Source Serif decision** es divisiva — Fraunces es variable (un file, todos los weights + italic) pero 100+ KB; Source Serif 4 es más liviano (70 KB) pero 2 files (regular + italic). Recomendación firme: **Fraunces** por versatilidad. Si bundle es crítico, fallback Source Serif.
- **Gate strip hard persistente** no se adopta en RIAL — pero el patrón vale documentarlo para cuando Q17 haga paywall-tests A/B. Estado actual: KS dismissible pattern.
- **Mark as Cooked + cookedAt[]** es el single-cheapest-data-win del playbook. Debería shippear en R2 aunque no se use inmediatamente — Q6 Supabase lo convierte en signal de personalization.
- **Author hyperlink underlined** conflict con convenciones de design-system RIAL (los links van `text-primary` sin underline por default en la app). Exception decidido solo para byline en verified-recipe — o bien se mantiene `text-primary` bold sin underline (más RIAL-nativo) y se skipea underline de NYT. **Recomendación**: skipear underline, mantener bold + `text-primary`.
- **Private Notes defer a R7** es lógico — el componente vive naturalmente contiguo al CreateRecipe/edit flow. Pre-R7, usar stub `recipe.personalNote ?? null`.
