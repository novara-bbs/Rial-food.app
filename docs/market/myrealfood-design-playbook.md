# MyRealFood Design Playbook

> Accionable. Complemento del deep-dive (`deep-dives/myrealfood.md`, descriptivo) y la doctrina transversal (`ux-patterns.md`).
>
> Alcance: extraer las prácticas de diseño visible en 19 capturas MyRealFood (IMG_1169–IMG_1188, falta IMG_1179) que merece la pena **copiar, adaptar o descartar** para RIAL. MyRealFood es nuestro **rival local más cercano** (ES, filosofía real-food, Carlos Ríos como cara de marca) — interesa especialmente por onboarding con supermercados locales, Real Score como métrica de identidad, y feed de recetas UGC con engagement alto.
>
> Última revisión: 2026-04-19. Capturas en `docs/market/Competitor Images/My real food/`.

---

## 1. Por qué MyRealFood como referencia

MyRealFood es un competidor **directo** (mismo idioma, mismo ICP Clara, misma filosofía "come comida real"). No destaca por un sistema visual refinado — es el opuesto a Bevel — pero sí por **decisiones de producto localmente valiosas** que RIAL debe entender antes de posicionarse.

- **Onboarding "mercadonizado"** — pregunta literalmente en qué supermercados compras (IMG_1170: Mercadona, Carrefour, Aldi, Lidl, Ahorramás) y qué alimentos no quieres (IMG_1171). Signal: el onboarding se usa como filtro de catálogo, no solo como perfilado. Ningún competidor global hace esto — es ventaja de juego doméstico.
- **Real Score como hero de Home** — IMG_1180 dedica el card primario a una métrica cualitativa ("Real Score") no calorías. Identidad explícita: "tu salud importa más que tu déficit". Este es exactamente el posicionamiento que RIAL reclama — hay que diferenciarse en ejecución, no en concepto.
- **Gamificación de hábitos con "pimientos"** — IMG_1180/1181 introducen "Retos del día" con puntos rojos tipo pepper. Micro-cosa, pero simple y retentiva. Competidores globales usan kcal-streak; MyRealFood usa habit-streak.
- **Feed recetas community-first** — IMG_1184/1187 muestran recetas UGC con **heart count público** (30K/27K/16K/8K likes) on-card. Social proof explícito que ningún tracker occidental muestra así.
- **Pricing agresivo con urgencia temporal** — IMG_1176 usa badge "DESCUENTAZO" + IMG_1182 urgency banner morado con countdown "12h 33m 20s". Táctico, efectivo, pero éticamente gris.
- **Filtro "Verificadas" con badge púrpura** — IMG_1184/1188 muestran pill `✓ Verificadas` que filtra recetas curadas por nutricionistas. Trust signal que MyRealFood puede ofrecer por el brand Carlos Ríos.

El **sistema visual en sí** (tipografía soft, abuso de emoji 3D, cards shadow-heavy, verdes saturados) **no** es aspiracional — es pragmático. Copiar las decisiones de producto, no la piel.

---

## 2. Matriz Copy / Adapt / Skip

| Patrón MyRealFood | Ref. captura | Decisión | Dónde lands en RIAL |
|---|---|---|---|
| Onboarding "¿En qué supermercados compras?" con logos reales | IMG_1170 | **Copy** | Nuevo step Onboarding ES: `Onboarding.tsx` + `Pantry.tsx` seed filtrado por supermercado |
| Onboarding "¿Hay alimentos que no quieras?" + searchable grid | IMG_1171 | **Copy** | `Onboarding.tsx` step dislikes con `SettingsNutrition` reuse de `INPUT_SURFACE_CLASSES` |
| Onboarding "¿Qué tipo de objetivo?" multi-select con check-circle verde | IMG_1169 | **Adapt** | `<SelectList multiSelect>` primitive — extender PR 9 primitives |
| Progress bar top sobre stepper (sin numéricos, verde lineal) | Todos IMG_1169–1176 | **Copy** | `<OnboardingScaffold>` gana prop `progress={pct}` |
| "Aprovecha los beneficios del Plan Plus" soft-upsell antes del paywall duro | IMG_1175 | **Adapt** | `RialPlus` variant `soft-intro` entre onboarding y paywall |
| Paywall con 3 tiers + crossed-out price + "DESCUENTAZO" badge | IMG_1176, IMG_1186 | **Skip (gran parte) / Adapt (tier display)** | Sí al layout 3-tier; **NO** al urgency badge + crossed-out — ADR-008 lo prohíbe |
| Urgency banner morado con countdown timer persistente | IMG_1182, IMG_1183, IMG_1184 | **Skip** | Dark pattern — viola ADR-008 "transparent pricing" |
| Home hero "Real Score" card tinted mint-green con CTA único | IMG_1180 | **Copy** | `<SectionCard>` + `QualityScore` widget (Q21 per roadmap) en `Home.tsx` |
| "Retos del día" habit tracker con pepper-points + streak count | IMG_1180, IMG_1181 | **Adapt** | Nuevo `HabitCard` en Home secondary rail — reemplaza pepper emoji por token brand |
| Weekly planner con meal-cards foto + macros CH/P/G + `+` add | IMG_1177, IMG_1178 | **Adapt** | `Planner.tsx` ya tiene estructura; copiar density `CH/P/G` label en lugar de `C/P/G` |
| Meal-card with hero photo + `...` menu top-right + macros footer | IMG_1177 | **Copy** | `src/features/planner/components/MealPlanCard.tsx` overhaul |
| Search tab con "¿Qué tienes en la nevera?" pantry-aware chip row | IMG_1182 | **Copy** | `Cocina.tsx` nuevo chip row sobre `Categorías`; pantry-matcher Q15+ per ux-patterns §2.1 |
| "Búsquedas populares" free-text chips sin icono | IMG_1182 | **Copy** | `Cocina.tsx` sección trending queries — hoy ausente |
| Category tiles grid 2×N con foto completa + nombre superpuesto, colores saturados | IMG_1183 | **Adapt** | `Cocina.tsx` categorías; suavizar saturación a paleta RIAL (NEUTRAL/EMBER) |
| Recipe card con heart-count overlay bottom-right sobre foto | IMG_1184, IMG_1187 | **Copy** | `src/components/patterns/RecipeCard.tsx` — añadir `favoritesCount` overlay cuando `r.origin === 'community'` |
| Filtros sheet bottom con "Verificadas" + meal-type grid + macros + CTA sticky | IMG_1188 | **Copy** | `<BottomSheet size="focus" headerLayout="title-centered">` + refactor `RecipeFiltersSheet` |
| Line-icon meal-type cards (Desayuno/Comida/Snack/Cena/Postre) en filtro | IMG_1188 | **Copy** | `MealSlotMultiSelect` gana variant `grid-line-icons` |
| Filter sheet footer "Limpiar filtros" (left, text-link) + "Aplicar filtros" (right, filled pill) | IMG_1188 | **Copy** | `<BottomSheet>` dual-action footer pattern — documentar en PRIMITIVES.md |
| Verified badge "✓ Verificadas" pill púrpura con check-badge icon | IMG_1184, IMG_1188 | **Adapt** | `<VerifiedChip>` primitive post-Q6 (requiere backend verification — defer) |
| Heart-count overlay sobre foto como social proof | IMG_1184, IMG_1187 | **Adapt** | Mostrar sólo `favoritesCount ≥ 100` para evitar "1 like" vergonzoso en seed fase |
| BottomNav 4 tabs: Hoy / Plan / Buscar / Escáner | IMG_1180, IMG_1182 | **Adapt** | RIAL ya tiene 5 tabs; validar que Escáner merezca tab propia o stay FAB en Hoy |
| Emoji 3D pesado (🥗🥗📦🍲❤️🏃🧠) en todo onboarding | IMG_1169 | **Skip** | Inconsistencia visual; RIAL mantiene iconos lucide + emoji sólo en `EmptyState.icon` |
| Saltar (skip) link top-right en paywall | IMG_1176 | **Copy** | Ya implícito en `RialPlus` onClose; verificar que sea un text-link legible top-right |
| Meal-card skeleton lines grises bajo foto (IMG_1177 columna derecha) | IMG_1177, IMG_1178 | **Copy** | Pattern para `MealPlanCard` loading state + locked-meal-until-Plus |
| Variety sliders "Alternar 2 ó 3 diferentes a la semana" | IMG_1172 | **Adapt** | Planner preferences — útil pero low priority (defer a Q20+ IA planner) |
| "Beneficios de tu plan" bullet-list con emoji + texto corto | IMG_1174 | **Skip** | Antipattern: fluff pre-paywall; no aporta data accionable |
| Toggle "Todo" selecciona-todo en grid de alimentos | IMG_1171 | **Copy** | `SettingsNutrition` dislikes ya tiene grid — añadir clear-all/all affordance |
| Progress back-chevron top-left solo (sin título) | IMG_1169–1176 | **Copy** | `<OnboardingScaffold>` header minimalista — no duplicar título en cada step |

---

## 3. Catálogo de capturas (19 de 19 leídas — IMG_1179 no existe en folder)

Agrupadas por tipología. Cada IMG con: layout anatomy, tokens visibles, affordances, intent inferida.

### A. Onboarding — perfilado + localización ES

- **IMG_1169** "¿En qué tienes más interés?" — progress bar verde (≈15% llenado) bajo back-chevron. Título 24px bold black izquierda. Lista 6 cards vertical: `[emoji 3D · 28px]` + label 16px + check-circle derecha. Seleccionados (3) tienen border `#a7f3d0` + fill `#ecfdf5` + check-circle verde relleno. No-seleccionados: border gris claro + circle outline. CTA `Continuar` emerald-500 pill full-width con 32px padding-bottom (safe-area). **Intent:** multi-select de objetivos personales. **Tokens:** accent emerald-500 `#22c55e`, tint emerald-50 `#ecfdf5`, radius `xl` (12-14px), shadow-none. Emoji decoration (ensaladita + caja + sopa + corazón + atleta + cerebro) — choice editorial, no iconos Lucide.
- **IMG_1170** "¿En qué supermercados compras?" — mismo scaffold onboarding; lista 6 supermercados con logos reales (Mercadona, Carrefour, Aldi, Lidl, Ahorramás, Otro). 4 seleccionados. **Intent:** localizar catálogo a cadenas presentes en la geografía del user. **Nota crítica:** el logo real es lo único que da a esta pantalla su "home field advantage" — un competidor global no puede mostrar Mercadona sin pagar licensing o reproducir confusion-actionable marks.
- **IMG_1171** "¿Hay algún alimento que no quieras?" — search bar magnifying-icon + placeholder "Busca un ingrediente" (surface-container-low, border-none, rounded-full). Sub-heading "Arroz, pasta y harinas" + text-link `Todo` derecha (toggle select-all). Grid 4×3 de alimentos: cada tile = emoji comida 40px + label 12px. Sin selected-state visible en esta captura. **Intent:** exclusión manual de food groups. **Pattern:** grid-picker con search — RIAL tiene `SettingsNutrition` similar (ver `INPUT_SURFACE_CLASSES`).
- **IMG_1172** "¿Qué variedad de recetas quieres en tu plan?" — 4 sliders verticales (Desayunos · Comidas · Cenas · Snacks) con thumb blanco + track verde + hint italic gris caption bajo cada slider ("Alternar 2 ó 3 diferentes a la semana" / "Uno distinto cada día"). **Intent:** preference para el meal-plan generator. **Skip potencial:** feature avanzada que requiere backend de planner inteligente — defer en RIAL.
- **IMG_1173** (incomplete top cropped) sección "¿Cómo te ayudamos a conseguirlo?" — lista vertical de 8 bullets con emoji 20px + texto 15px regular. Bullets: "Te guiamos paso a paso..." "Recibes ideas personalizadas..." "Ves tu progreso..." etc. Primary CTA `Continuar` bottom. **Intent:** value-prop summary pre-paywall. **Anti-pattern señal:** lista de 8 beneficios emoji-prefixed es sobrecarga; 3-4 sería más eficaz.
- **IMG_1174** (continúa 1173 scrolled up) — card superior "Se adapta a tu rutina · Recetas según tus gustos · Sin dietas estrictas · Diseñado por nutricionistas" + card inferior "¿Cómo te ayudamos a conseguirlo?". Composición doble-card, no-hero, low-impact.
- **IMG_1175** "Aprovecha los beneficios del Plan Plus" — ilustración `personaje-con-móvil` centered 180×180 (vibe friendly, estilo flat-illustration) + title 22px bold + 4 bullets emoji + CTA `Continuar` full-width. **Intent:** soft-intro al paywall. **Copiar**: la estrategia de calentar al user **antes** del hard-paywall con un step separado reduce rage-skip.
- **IMG_1176** "¡Oferta de bienvenida!" (primer paywall) — progress bar ≈95% + text-link `Saltar` top-right gris. Título central + subtitle. 3 tier-cards apiladas: Plan Mensual `11.99€` / Plan Anual `24.99€` `~~59.99€~~` con badge `DESCUENTAZO 🎉` top-left verde + Plan Vitalicio `99.99€` `~~259.99€~~`. Tier central seleccionado (border verde + check-circle). CTA `Empieza tu plan de ganancia muscular` emerald-500 full-width. **Intent:** primer trigger monetización. **Anti-patterns múltiples:** crossed-out anchor pricing, urgency naming ("Oferta de bienvenida"), goal-specific CTA wording para crear FOMO específico.

### B. Home

- **IMG_1180** Home Hoy — settings-cog top-left + pill `Hazte PLUS` top-right emerald. Hero card **mint-green tint** (`#d1fae5`): title `Real Score` 22px bold center + subtitle "Para conocer tu nota de salud, responde el cuestionario. ¿Qué nota tendrás?" + CTA `Completar test 💖` pill emerald-600 centered. Sección "Retos del día" con 3 badges horizontal (shield + pepper + flame + counters `0/0/0`). Sub-caption `Pimientos de hoy 0/190`. Lista retos: 2 cards visibles "Seguir mi Plan nutricional · Comer fruta, Comer verdura, Comer legumbres..." con `20` pepper points + chevron-right verde; "Caminar al menos 30 minutos · A paso rápido o moderado" con `80` pepper points + check-green completed. BottomNav 4-tab: Hoy (active emerald tint) / Plan / Buscar / Escáner. **Intent:** daily identity anchor + gamified habits. **Pattern crítico:** Home dedica el hero a **una métrica de calidad** (Real Score), no a macros consumidas — esto es lo que RIAL necesita para distanciarse del "MFP/Yazio clone" perception.
- **IMG_1181** Home scrolled — mismo Home, continuación "Retos del día": 5 habits visibles (Seguir plan nutricional / Caminar 30 min / Dormir 7 horas / Apagar pantallas 30 min antes / Evitar ultraprocesados) con pepper-points 20/80/60/20/10 y mix de chevron-green + check-green states. **Intent:** feed de habit-challenges scrollable. **Decisión copiar:** la idea de retos-del-día como gamificación; **adaptar:** "pimientos" es idiosincrásico de MRF — RIAL debería usar un token de marca propio o descartar puntos y quedarse con streak+check.

### C. Planner

- **IMG_1177** Plan — toolbar top: pencil-edit left + `< Abr 13 – Abr 19 >` center (week picker chevron) + shopping-bag right. Sub-heading `Hoy, 18 abr` + `...` overflow. Macros stub pill-row (kcal + CH + P + G con barras skeleton). 2 meal-cards horizontal scroll: "Desayuno 0 kcal · CH 0 · P 0 · G 0" + "Comida 0 kcal". Cada card: foto cuadrada 140×140 rounded-t + titular + macros stub. FAB `+` circular emerald-600 bottom-right. **Intent:** plan semanal vertical-scroll + horizontal-scroll por día. **Pattern notable:** cada meal-slot tiene su propio macro-stub visual (barras skeleton) — comunica "este slot está vacío" sin decir "no hay nada". Compare con RIAL `Planner.tsx` que muestra texto-only.
- **IMG_1178** Planner continuación — scrolled to Domingo 19 abr con meal-cards distintas (tostada aguacate + pasta salmón crema). Skeleton macros still present. **Intent:** vista vertical multi-día, cada día repite el mismo scaffold de 4 meal-slots. **Nota:** el horizontal-scroll por slots dentro de un día es agresivo — ocupa ~2/3 de pantalla el primer slot visible, escondiendo el resto. RIAL debería considerar vertical-stack meal-slots para legibilidad.

### D. Search / Buscador

- **IMG_1182** Buscar tab — **banner urgency morado** top (`rgb(124 58 237)`) `¡Que no se te escape! Plan PLUS Solo 24,99€ 🎁 12h 33m 20s` + pill `Ver` blanco right. Debajo: search bar (magnifying + placeholder "Busca una receta") + filter-icon-pill derecha. Segmented `Recetas | Productos` subrayado (active: bold + underline emerald). Sub-row chips outline `♥ Favoritas` + `Creadas por ti`. Sección "¿Qué tienes en la nevera?" con text-link `Ver todos >` derecha + subtitle "Selecciona los ingredientes que tienes y te sugeriremos recetas". Chip-row horizontal: `🍗 Pollo` `🥚 Huevos` `🍅 Tomate` `🍌 ...` con background-container-low + border rounded-full. Sección "Búsquedas populares" con chips outline: `Tostada de aguacate` `Bowl de quinoa` `Ensalada de pollo` `Bowl de proteínas` `Tortitas`. Sección "Categorías" inicio (cropped). FAB `+` emerald bottom-right. **Intent:** explorar vía pantry-match o trending queries. **Copiar decisivo:** el chip-row "¿Qué tienes en la nevera?" resuelve el problema "¿qué cocino hoy?" con un tap — RIAL lo tiene en roadmap (ux-patterns §2.1) pero falta UI. **Skip:** el banner urgency es dark pattern.
- **IMG_1183** Buscar "Categorías" — grid 2×N de category-tiles. Cada tile: foto grande cuadrada full-width con label superpuesto text-white bold 18px top-left. Colores saturados: Acompañamientos (amarillo mostaza) / Aprovechamiento (coral) / Arroz (mint) / Asiático (verde oscuro) / Batidos (púrpura) / Bebidas (salmon). `Ver todas >` text-link. **Intent:** categorías navegables visuales. **Adapt:** el grid-photo-with-label-overlay es patrón probado (NYT Cooking, Tasty); RIAL puede adoptarlo **suavizando saturación** — tintes `EMBER/NEUTRAL` harían los tiles más premium y menos "marketplace de chollos".
- **IMG_1184** "Arroz" search results — back-chevron + search-pill "Arroz" pre-filled full-width. Filter chips row: `✓ Verificadas` (pill púrpura con badge-check) + `☕ Desayuno` + `🥩 Alto en proteína` + `🍳 Air Fryer` + filter-icon pill. `↓ Relevancia` text-link derecha (sort-indicator). Grid 2-col masonry de recipe-cards: foto aspect 4:5 + heart-count overlay bottom-left `♥ 30K` / `27K` / `16K` / `14K` en píldora blanca translúcida. Footer card: tiempo `35min · 384kcal` + titular `Garbanzos al curry con arroz basmati.` 14px medium. **Intent:** lista de resultados de búsqueda. **Copiar decisivo:** (a) el **verified pill púrpura** diferencia recetas de nutricionista vs UGC; (b) el **heart-count overlay** da social proof instantáneo; (c) el layout masonry 2-col con densidad alta.

### E. Productos / Scanner landing

- **IMG_1185** Buscar "Productos" tab — mismo banner urgency morado + search bar "Busca un producto". Tabs `Recetas | Productos` (Productos active). Chip `♥ Favoritos`. Grid 3×N de supermercados con logo en tile blanco rounded + label bajo cada logo: Ahorramas / Alcampo / Bonpreu / Caprabo / Carrefour / Consum / Dia / Eroski / Hipercor / Lidl / Masymas / Mercadona. **Intent:** navegar catálogo de productos por cadena — filtro que hace MRF único en ES. **Skip para RIAL V1:** requiere catalogue per-supermarket con SKU mapping; cost-to-build alto. Considerar integrar en Q21+ con partnership formal.

### F. Paywall (segundo trigger)

- **IMG_1186** "Súper Oferta Primavera" — modal-card centered con close-X top-left. Ilustración header (cortada) + title bold black. 4 bullets check-mark emerald: "Plan nutricional 100% personalizado · Busca recetas y productos reales fácilmente · Escanea tus comidas con IA · Mantén tus hábitos saludables a largo plazo". Tier-cards row 3: Plan Mensual `11.99€` / Plan Anual `24.99€` `~~59.99€~~` (active, púrpura border + check) con badge `DESCUENTAZO` / Plan Vitalicio `99.99€` `~~259.99€~~`. Input `Código promocional` + text-link `Aplicar` derecha. CTA `Conseguir Oferta Primavera` púrpura full-width. Sub-link `Cancelar cuando quieras` gris centered. **Intent:** second-chance paywall con temática estacional. **Observación:** el morado aparece como brand-secondary para diferenciar "Plus" de lo free verde — clean separación visual.

### G. Recipe detail footer + related

- **IMG_1187** recipe detail scrolled — back-chevron + heart-count `♥ 205` + share-icon top. `🚩 Reportar esta receta` text-link gris underline. Sección "Tal vez te interese" header bold + grid 2-col recipe-cards (galletas chocolate / quiche / galletas arándano / postre rodajas) con tiempo + kcal + titular + heart-count overlay. **Intent:** related-recipes discovery. **Copiar:** el **report-recipe affordance en footer** es cívicamente sano (user puede flag contenido inapropiado). RIAL debería añadirlo cuando la social layer esté activa (`src/features/social/screens/PostDetail.tsx`).

### H. Filter sheet

- **IMG_1188** Filtros recetas — **BottomSheet focus size** (~90vh, status bar band visible con tint oscuro). Handle pill top-center. Header: close-X izquierda + title `Filtros de recetas` centered (15px medium). Sección `Verificadas` con card pill push-selection (purple badge-check + label). Sección `Comidas del día` grid 2-col de 5 cards: Desayuno (taza-icon) / Comida (fideos-icon) / Snack (prisma-icon) / Cena (bol-icon) / Postre (pastel-icon). Cada card: icon line 24px + label 14px, border gris + rounded-xl + min-h ~80px. Divider + sección `Macronutrientes` grid 2-col: `🫘 Alto en proteína` / `🌿 Rico en fibra` (tercer card cropped). Footer sticky: text-link gris `Limpiar filtros` left + CTA pill `Aplicar filtros` right (deshabilitado ashlight hasta que haya selección). **Intent:** multi-facet filter con reset + apply. **Copiar todo esto:** (a) focus size con status band visible; (b) section-headers tipográficos (no dividers dobles); (c) line-icons para meal-types (más limpio que emoji); (d) dual-footer `limpiar / aplicar` con clear left + action right.

---

## 4. Principios destilados

### 4.1 Sistema visual — "emerald pragmatic"

| Token | Valor MyRealFood | RIAL actual | Acción |
|---|---|---|---|
| `--background` | `#ffffff` puro | `#ffffff` (volt/ocean/ember) / `#fafaf9` (neutral) | Unchanged — neutral ya matchea Bevel |
| `--primary` (accent) | `#22c55e` emerald-500 | `#09090b` black (neutral) | **Skip** — RIAL primary es neutro; mantener |
| `--brand-secondary` | `#7c3aed` púrpura (Plus) | `#059669` emerald (neutral-light) | Unchanged — semántica distinta |
| `--success-tint` | `#d1fae5` mint-100 | no existe token mint específico | **Add** `--surface-success-tint` para cards tipo Real Score |
| `--surface-container-low` | `#f9fafb` | token ya existe | Unchanged ✓ |
| Radius card | `16-20px` (xl variable) | `12px` (rial `rounded-sm`) | **Keep RIAL** — MRF es más "pill-y" / menos premium |
| Border card | 1px solid `#e5e7eb` (seleccionados: 2px `#10b981`) | borderless + shadow-elev-2 (neutral-light) | Unchanged — RIAL usa shadow, MRF usa border |
| Emoji usage | omnipresent (3D style) | restringido a `EmptyState.icon` | **Mantener RIAL** — emoji pesado diluye profesionalidad |

**Conclusión:** el sistema visual de MyRealFood no es aspiracional. Toma del MRF las **decisiones de producto** (Real Score, supermercado-aware onboarding, pantry chip-row, verified pill, heart-count overlay) pero no el **look&feel** — RIAL post-PR3 (paletas NEUTRAL/EMBER warm + borderless Bevel-style) es superior.

### 4.2 Tipografía

- MyRealFood usa tipografía soft system (SF Pro / Roboto por defecto, sans). Título 24px regular — no bold heavy como Bevel.
- **Divergencia con RIAL:** RIAL usa jerarquía `text-headline/title/body` bien escalonada (ADR documented). Tipografía MRF se siente **casual-blog** más que **producto-de-salud**. RIAL mantiene su scale sin cambios.
- **Copiar puntual:** el uso de `text-caption` italic gris para hint subrayado de sliders (IMG_1172 "Alternar 2 ó 3 diferentes") es patrón limpio para form-hints. Aplicable a `SettingsNutrition` prefs UI.

### 4.3 Information design — Home es identidad, no tracking

Patrón transversal MyRealFood Home:

```
[Settings cog · Plus pill]
[Hero: Real Score card mint-tint con CTA único]
[Retos del día header + badges 3-pill metrics]
[Lista vertical retos · pepper-points + chevron/check]
```

**Vs RIAL hoy:** Home mezcla `NutritionHero` (macros) + `ProgressPreviewCard` (weight) — ambos cuantitativos. MRF dedica el hero a una **métrica narrativa** ("¿qué nota tendrás?") que invita a engagement. 

**Decisión:** la propuesta Q21 "Real Score en recipe cards" (ver `ux-patterns.md` §2.2) **debe escalarse a Real Feel Score del usuario en Home** — una métrica semanal `A/B/C/D/E` de calidad alimentaria agregada. Añade a `Home.tsx` por encima de `NutritionHero` un widget `QualityHeroCard` que es ICP-adaptive: Clara lo ve, Marcos lo ve secundario, Ana lo ve.

### 4.4 Sheets — MRF confirma el patrón ADR-009 V2

**IMG_1188** es un caso libro de texto para `<BottomSheet size="focus" headerLayout="title-centered">`:

- Handle pill top ✓
- Status-bar band visible detrás (~92vh match) ✓
- Close-X izquierda + título centrado ✓
- Body scrollable con secciones + dividers ligeros ✓
- Footer sticky dual `text-link-clear` + `primary-CTA-action` ✓

**Novedad accionable:** el footer **dual** (Limpiar-izquierda + Aplicar-derecha) no está documentado hoy en `<BottomSheet>`. Sugerencia: extender el primitive con convention `footer={{ clearAction, primaryAction }}` alternativa al `footer` libre actual, para filter-sheets específicos. Alt: documentar pattern en `PRIMITIVES.md` para que consumer wire dual-button manualmente.

### 4.5 Empty states — MRF los usa como engagement-hook, no como info

MRF NO muestra empty-states info-only. En IMG_1177/1178 el meal-slot "vacío" es **active invitation**: skeleton macros + FAB prominente + `...` menu. Similar a RIAL post-walkthrough. **RIAL ya está en este estándar** — no cambio necesario.

### 4.6 Badges, pills, chips

- **Verified pill púrpura con badge-check** (IMG_1184, IMG_1188) — `<VerifiedChip>` primitive candidato. Defer hasta Q6 (requiere backend verification schema — user role `nutritionist_verified`).
- **Heart-count overlay pill blanca translúcida** (IMG_1184, IMG_1187) — copiar a `RecipeCard.tsx` con `backdrop-blur-sm bg-white/70 text-primary` + condicional `when origin === 'community' && favoritesCount >= 100`.
- **Urgency banner púrpura con countdown** — **Skip**. Dark pattern. Viola ADR-008 "transparent pricing". 

### 4.7 Pricing

**ADR-008 dice "single premium tier, free-generous"** — MyRealFood tiene **3 tiers + crossed-out anchor + urgency timer + goal-specific CTA wording**. Todo esto es contrario a la doctrina RIAL.

Lo único rescatable:
- **3 duration options (mensual/anual/vitalicio)** — se puede adoptar sin los anti-patterns. RIAL hoy tiene solo mensual+anual; añadir vitalicio `99.99€` single-payment es opción legítima (aunque requiere RevenueCat non-consumable config).
- **"Saltar" link top-right** en paywall primer trigger — ya implícito en `RialPlus` close; reforzar que sea text-link readable (14px medium gris), no solo X ambiguo.

**NO adoptar:**
- `~~59.99€~~` crossed-out anchor pricing.
- Badge `DESCUENTAZO` o cualquier urgency naming.
- Countdown timer en banner persistent.
- Oferta "estacional" ("Primavera/Bienvenida") que genera FOMO fabricado.

### 4.8 FAB / nav

- MyRealFood BottomNav **4 tabs** (Hoy / Plan / Buscar / Escáner) + **FAB `+` flotante en Home/Search**. Simple, no mega-menu (vs Bevel IMG_0997 long-press 3×3).
- RIAL tiene 5 tabs (Hoy / Cocina / Explora / Progreso / Más). **Validación:** ¿Escáner merece tab propia en RIAL? No — el barcode-scan flow vive embebido en `AddMeal`, y dedicarle tab primaria inflacionaría el bottom-nav sin aportar retention claro. Mantener 5-tab RIAL.
- FAB `+` en Planner + Search (IMG_1177, IMG_1182) siempre emerald-500 — RIAL ya usa FAB en pantallas relevantes; unificar estilo primario `<Button size="icon" variant="primary">` con shadow-elev-3.

### 4.9 Lo que NO copiamos

- **Emoji 3D pesado** en onboarding y feed. Estilo nostálgico iOS 6 / WhatsApp que envejece mal. RIAL mantiene línea lucide + EmptyState emoji puntual.
- **Urgency timer + DESCUENTAZO** — dark pattern puro. Viola ADR-008.
- **Variety sliders** en onboarding (IMG_1172) — sobrecarga cognitiva para value unclear. Ana/Clara/Marcos no se benefician de decidir "alternar 2 ó 3" en minuto 3 de vida con la app.
- **Pepper-points ("Pimientos")** como unidad gamification — idiosincrásico MRF, culturalmente localista. RIAL usa streak-days + check-completed, no points.
- **4 tabs bottom-nav con Escáner propia** — RIAL 5-tab es justificable porque Social/Explora es pilar; MRF cede esa posición al escáner porque es su feature core.
- **Crossed-out anchor pricing** — prohibido por ADR-008.
- **Categorías con colores saturados hyper-vivos** (IMG_1183) — amarillo/coral/púrpura saturación 90%+ feel "hipermercado oferta". RIAL usa tintes semánticos (macros, brand) + fotos editoriales; no añadir category-color chaos.

### 4.10 Pantry-aware discovery — el pattern más valioso de MyRealFood

MyRealFood IMG_1182 muestra `¿Qué tienes en la nevera?` con chip-row pantry-ingredients (Pollo · Huevos · Tomate · ...). Esto resuelve el problema "¿qué cocino con lo que tengo?" con un tap por ingrediente, sin navegar a Pantry screen.

RIAL ya tiene `pantryItems` en localStorage (`src/features/pantry/screens/Pantry.tsx`). Lo que falta:
1. **Matcher**: función `matchRecipesToPantry(recipes, pantryItems, threshold=0.7)` que retorna recetas cuyo ≥70% ingredientes estén en despensa. Candidato `src/features/recipes/utils/pantry-match.ts`.
2. **UI**: chip-row en `Cocina.tsx` header ("Qué tienes en la nevera") que muestre los 6-8 pantry items más recientes como chips togglables; seleccionar chips filtra el grid inferior de recetas. Segundo CTA `Ver todos >` abre `Pantry.tsx`.
3. **Empty state**: si `pantryItems.length === 0`, reemplazar chip-row por card CTA "Añade lo que tienes en la despensa → [Despensa]".

Ver Roadmap §5 PR 2.

### 4.11 Verified + social proof — identidad curatorial

MyRealFood resuelve el trust problem con **dos capas**:
1. **Verified pill púrpura** (IMG_1184, IMG_1188) para recetas curadas por nutricionistas in-house.
2. **Heart-count overlay** (30K/27K/16K) que communicate social validation para recetas UGC.

RIAL tiene social layer embrionaria (`src/features/social/`) pero sin verified-editor role ni exposed-like-count. La dupla "curated by experts + loved by community" es doble-vara de trust que MFP/Yazio no exponen. **Adoptar:**
- `Recipe.verifiedBy?: { role: 'nutritionist' | 'editorial', name: string, id: string }` — opcional, solo para seed recipes premium + future UGC moderado.
- `Recipe.favoritesCount?: number` — derived from social/favorites relations; mostrar overlay solo cuando `≥ 100` (evitar "1 like" en fase seed).

---

## 5. Roadmap de ejecución — 5 PRs

Numeración continúa a la cadena Bevel (PRs 1–9 ocupados allí). Ninguno de estos blocks Bevel; se ejecutan en paralelo o posterior.

| PR | Scope | Archivos nuevos | Archivos amendment |
|---|---|---|---|
| **MRF-1** | Onboarding localization — supermercados + dislikes step | `src/features/profile/components/onboarding/SupermarketStep.tsx`, `src/features/profile/components/onboarding/DislikesStep.tsx`, `src/features/profile/utils/locale-supermarkets.ts` (mapa `ES → [mercadona, carrefour, aldi, lidl, ahorramas]`, `MX/AR → [...]`), `src/test/conventions/onboarding-localization.test.ts` | `src/features/profile/components/Onboarding.tsx` (añade 2 steps opcionales locale-gated), `SelectList` gana prop `multiSelect` (relacionado con PR 9 Bevel `<SelectList>`), i18n `t.onboarding.supermarkets.*` + `t.onboarding.dislikes.*` × ES/EN, `CHANGELOG.md` |
| **MRF-2** | Pantry-aware discovery chip-row en Cocina | `src/features/recipes/utils/pantry-match.ts` + `pantry-match.test.ts` (≥15 assertions: threshold aware, substring-tolerant, case/accent-insensitive), `src/features/recipes/components/PantryChipRow.tsx` | `src/features/recipes/screens/Cocina.tsx` (mount PantryChipRow sobre `Categorías`), `src/features/pantry/screens/Pantry.tsx` (no change; solo `Ver todos >` link), i18n `t.kitchen.pantryRow.*` × 2, `PRIMITIVES.md` (chip-row helper pattern), `CHANGELOG.md` |
| **MRF-3** | RecipeCard social overlay + VerifiedChip primitive | `src/components/VerifiedChip.tsx` (+ test), `src/test/conventions/recipe-card-social.test.ts` | `src/types/recipe.ts` (+ `verifiedBy?`, `favoritesCount?`), `src/lib/schemas.ts` (zod), `src/components/patterns/RecipeCard.tsx` (heart-count overlay when `favoritesCount >= 100 && origin === 'community'`; verified pill cuando `verifiedBy != null`), `src/features/food/data/seed-recipes.ts` (seed 10 recetas con `verifiedBy` y `favoritesCount` realistas), i18n `t.recipes.verifiedChip` + `t.recipes.favoritesCountAria` × 2, `CHANGELOG.md` |
| **MRF-4** | RecipeFiltersSheet refactor — focus size + meal-type grid line-icons + dual footer | `src/features/recipes/components/RecipeFiltersSheet.tsx` (nuevo o refactor del existente), `src/test/conventions/recipe-filters-sheet.test.ts` | `src/features/recipes/screens/Cocina.tsx` (consumer replace), `src/features/food/components/MealSlotMultiSelect.tsx` (añade variant `grid-line-icons` con icon slots), `PRIMITIVES.md` (documentar dual-footer pattern), i18n `t.recipes.filtersSheet.*` × 2, `CHANGELOG.md` |
| **MRF-5** | Quality Hero Card (Real Feel Score semanal) en Home | `src/features/wellness/utils/quality-score.ts` (`computeWeeklyQualityScore(dailyLog, recipes, realFeelLogs)` → `'A'|'B'|'C'|'D'|'E'` con heurística NOVA-proxy + densidad nutricional), `src/features/home/components/QualityHeroCard.tsx`, `src/test/conventions/quality-score.test.ts` | `src/features/home/screens/Home.tsx` (mount `<QualityHeroCard>` sobre `NutritionHero`, ICP-adaptive: Clara primary, Marcos secondary, Ana primary; tras `featureFlags.homeQualityScore`), `src/types/index.ts` (+`QualityGrade = 'A'|'B'|'C'|'D'|'E'`), i18n `t.home.qualityScore.*` × 2, `CHANGELOG.md` |

**No incluido aquí (Skip explícito):**
- Productos por supermercado tab (IMG_1185) — requiere catalog-per-chain + SKU mapping; cost-to-build no justifica ROI sin partnership. Defer Q21+.
- Pepper-points habit gamification — RIAL usa streak-check; copy-by-copy de "pimientos" diluiría la propia identidad RIAL.
- Variety sliders en onboarding — sobrecarga; defer.
- Urgency paywall + crossed-out pricing — prohibido ADR-008.

Governance: trabajar directamente en `main` (consistente con gobierno Bevel). Cada PR = commit(s) + `release:preflight` verde + push a `rial-food/main` tras aprobación explícita.

---

## 6. Verificación end-to-end

```bash
npm run release:preflight
# tsc + lint + lint:code + check:i18n + test + build + size:check

preview_start
```

Flows a verificar visualmente:

1. **Onboarding locale-gated (MRF-1):** start new session con `navigator.language = 'es-ES'` → supermarket + dislikes steps aparecen; con `'en-US'` → se saltan (o se muestra variante generic ingredient-dislikes).
2. **Pantry chip-row (MRF-2):** añadir 3 items a Pantry → Cocina muestra `PantryChipRow` con 3 chips activables → seleccionar 2 filtra el grid recetas a las que contienen ≥70% ingredients-in-pantry. Empty state cuando `pantryItems = []`.
3. **RecipeCard overlay (MRF-3):** seed recipe con `verifiedBy: {role:'nutritionist', name:'Ana Gómez'}` + `favoritesCount: 248` → card muestra verified pill + heart-count overlay `♥ 248`. Con `favoritesCount: 3` → overlay oculto.
4. **Filter sheet focus (MRF-4):** abrir filter-sheet desde Cocina → status-bar visible detrás, close-X + title + meal-type grid 2-col line-icons + footer dual `Limpiar | Aplicar`.
5. **QualityHeroCard (MRF-5):** con `featureFlags.homeQualityScore=true` + seed 7 días realFeelLogs + recipes con NOVA-proxy mix → Home hero muestra grade + descriptor; con `featureFlags.homeQualityScore=false` → card no aparece, Home retorna a `NutritionHero`.

Preflight targets (expected post-MRF-5):
- TypeScript: 0 errors.
- Tests: +~40 (10 per PR average across 5 PRs, ≥MRF-2 has many pantry-match edge cases).
- i18n symmetry: +~30 claves × 2 locales.
- Build: expected ~+3 KB raw total (VerifiedChip + PantryChipRow + QualityHeroCard + score utils).

---

## 7. Fuentes

- Capturas: `docs/market/Competitor Images/My real food/` (IMG_1169–IMG_1188, falta IMG_1179 en folder).
- Deep-dive descriptivo: `docs/market/deep-dives/myrealfood.md`.
- Doctrina general competidores: `docs/market/ux-patterns.md` (§2.2 Real Score, §2.1 Pantry-aware, §8.1 Comunidad receta-centric).
- Sistema RIAL actual: `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/adr/ADR-008-pricing-model.md`, `docs/adr/ADR-009-bottom-sheet-anatomy.md` (V2).
- Posicionamiento: `docs/market/rial-positioning.md` (MyRealFood como competidor doméstico ES primario).
- Playbook hermano (estructura-source): `docs/market/bevel-design-playbook.md`.

---

## 8. Notes for reviewer

- **Incertidumbre capture IMG_1179** — no existe en el folder; posible gap de capture durante el screenshotting original. No altera las conclusiones: las 19 capturas cubren onboarding + home + planner + search + paywall + recipe detail + filter sheet, que son las surfaces canónicas de MRF.
- **Real Score heurística (MRF-5)** — el scoring NOVA-proxy sin OpenFoodFacts-live-data es aproximación. MVP puede usar mapping manual `Recipe.tags` → NOVA band (receta con `tags: ['procesado', 'fritura']` → NOVA 3-4) + densidad nutricional (kcal/100g vs macros). Precisión ≠ MyRealFood (que tiene BD propia), pero diferenciación directional sí comunica "quality matters" sin backend pesado.
- **Verified role backend (MRF-3)** — `verifiedBy` requiere esquema `profiles.role = 'nutritionist_verified' | 'editor'` en Supabase + admin UI para asignarlo. No bloqueante para la primitive `<VerifiedChip>`, que puede consumir el campo opcional a partir de seed data y escalar al UGC moderado cuando Q6 apruebe la migración.
- **Pantry match threshold 70%** — heurístico. Ajustable vía `featureFlags.pantryMatchThreshold`. Evaluar con seed data si 70% da recetas relevantes o si 50% (más permisivo) da mejor discovery. Test debe ser agnostic al threshold y tomar el valor como parámetro.
- **Carlos Ríos como distribución** — MyRealFood depende del founder-face (ver deep-dive "Evitar depender de single-founder-face"). RIAL no tiene ese riesgo hoy, pero el corolario es que **no tenemos el equivalente de un nutricionista mediático para validar recetas** — la `<VerifiedChip>` funciona como señal de autoridad pero requiere que el equipo RIAL invierta en editorial content o partnerships.
