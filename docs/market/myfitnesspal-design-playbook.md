# MyFitnessPal Design Playbook

> Accionable. Complemento del deep-dive (`deep-dives/myfitnesspal.md`, descriptivo) y de la doctrina transversal (`ux-patterns.md`).
>
> Alcance: auditar 14 capturas MyFitnessPal (IMG_1127–IMG_1140, dark mode, iOS, ES locale) para decidir qué **copiar, adaptar o descartar** hacia RIAL. El sesgo por defecto es escéptico — MFP es el incumbente (200M+ descargas, 14M+ alimentos), pero su diseño es data-dense y ha acumulado deuda visual de una década. La palanca de MFP es la **base de datos y el barcode scanner**, no la UX.
>
> Última revisión: 2026-04-19.

---

## 1. Por qué MyFitnessPal como referencia

MFP es el **punto de referencia por escala**, no por diseño. Vale la pena estudiarlo porque:

- **Es el benchmark mental que trae el usuario** — cualquier adulto que haya contado calorías antes ha usado MFP. Cualquier decisión RIAL que rompa "expectativas MFP" (suma running kcal, 4 meal slots, diario por fecha) exige justificación extra.
- **El Panel ("Hoy") con donut calórico + grid 2×N de stats** (IMG_1129 / IMG_1133) es el layout más replicado del sector — Yazio, Lose It!, Cronometer son variaciones de este esqueleto. Si RIAL sale de ese mapa mental sin valor añadido claro, los reviews piden "cómo se ve el resumen del día".
- **El diario segmentado por `Desayuno / Brunch / Merienda / Cena / Aperitivos / Ejercicio`** (IMG_1134 / IMG_1135) es un patrón de "día en filas" que reduce el log a un scroll vertical + `AGREGAR ALIMENTO` por sección. Resuelve el problema de "¿dónde pongo esto?" con menos fricción que un FAB centralizado.
- **Carrusel horizontal de tarjetas en el Panel** (IMG_1129 / IMG_1130 / IMG_1131 / IMG_1132 — `Calorías` → `Macros` → `Corazón saludable` → `Con bajo contenido de carbs` → ...) permite presentar 4+ módulos sin comprometer jerarquía vertical. Pattern sólido aunque la ejecución MFP lo sabotea con paywalls sobrepuestos.
- **Pero** — el visual system está atrapado en iOS 2018: fondo `#111` puro, cards `#1e1e24` sin elevation, tipografía SF-default sin jerarquía expresiva, banners de anuncios AdMob intercalados **entre** módulos de producto (IMG_1129 `TOO GOOD TO GO`, IMG_1136 `SUMA RÁPIDA DE MACROS · DISPONIBLE CON PREMIUM`). El fondo negro puro se siente "ahorrativo de batería OLED" más que "wellness maduro" — a años luz del warm neutral de Bevel o del ember cálido que RIAL puede ofrecer.
- **Pattern anti-copia más evidente**: cuatro puntos de paywall **sobre el mismo Panel** (IMG_1129: pill amarillo `Pásate a Premium` en header + `Despídete de los anuncios` + banner AdMob + Macros card bloqueada). Densidad de upsell que degrada la experiencia free y no es sostenible para un ICP "wellness maduro sin tribu" — ver ADR-008.

Tomar lo que funciona (data density del diario, info bar running-sum, grid secundario 2 cols, historial priorizado en search) y **explícitamente rechazar** el resto (paywall en features core, chrome plano sin jerarquía, coronas Premium sembradas por la UI) nos da un playbook corto pero honesto.

---

## 2. Matriz Copy / Adapt / Skip

| Patrón MyFitnessPal | Referencia captura | Decisión | Dónde aterriza en RIAL |
|---|---|---|---|
| Info bar running-sum `Objetivo − Alimentos + Ejercicio = Restantes` sticky arriba del diario | IMG_1134 / IMG_1135 | **Copy** | `NutritionHero` en `src/features/home/screens/Home.tsx` ya lo hace implícito; explicitarlo con la ecuación como caption |
| Historial de alimentos como **default tab** de "Añadir alimento" (antes que búsqueda) | IMG_1138 | **Copy** | `AddMeal.tsx` — promover el tab "Historial" al default cuando `foodHistory.length > 0` |
| Verified-green-check en entries del historial | IMG_1138 (kiwi, greek yogurt, feta cheese) | **Adapt** | Post-Q6 con backend verification; hoy usar un dot icon neutro para "user-logged" vs "seed" |
| Quick-add numeric macros (sin buscar alimento) | — (documentado en deep-dive §3; MFP lo tiene detrás de Premium como "Suma rápida", IMG_1136 banner) | **Copy** | `AddMeal.tsx` — nuevo tab "Rápido" con `kcal/P/C/F` libres. **Crítico: mantener gratis** (el paywall es el anti-pattern, no la feature) |
| Donut hero `3030 Restantes` + breakdown vertical `Objetivo / Alimentos / Ejercicio` | IMG_1129 | **Adapt** | `NutritionHero` ya resuelve esto; adoptar el breakdown vertical con iconos inline (bandera/cubierto/llama) en vez del grid 3 columnas actual |
| Meal-section header `Desayuno` + link `AGREGAR ALIMENTO` + `⋯` overflow menu | IMG_1134 / IMG_1135 | **Adapt** | `TodaysMeals.tsx` — la forma de fila por slot con CTA inline es más escaneable que el layout actual de cards con acciones ocultas |
| Detail de alimento: porción + raciones + comida-destino + donut macros + %DV grid | IMG_1139 | **Copy** | `AddMeal.tsx` detail — cuando el user selecciona un ítem, mostrar la pantalla de commit con editor de porción antes de registrar. Ya parcialmente implementado en `PortionSheet` |
| Inline expand/collapse `Información nutricional (Oculta ▲)` con tabla de nutrientes completa | IMG_1140 | **Copy** | `PortionSheet` o un detail sheet nuevo — `<Collapsible>` con `<SectionCard>` inside. Valor alto para power-users (Marcos ICP) |
| Tabla `Total / Objetivo / Restan` por nutriente con filas densas | IMG_1136 | **Adapt** | `Progress` → Nutrición sub-tab — reemplaza el grid de tiles actual por una tabla compacta cuando el user quiere detalle (no hero view) |
| Tabs segmentados `Calorías / Nutrientes / Macros` + `Vista de día ▼` chevron | IMG_1136 / IMG_1137 | **Copy** | `SegmentedTabs` ya existe — aplicarlo en Progress → Nutrición con un period picker `Día/Semana/Mes` como dropdown |
| Gráfico de peso 90d con eje Y fijo + línea verde suave + dots dispersos | IMG_1133 | **Skip** | RIAL ya tiene `WeightTrendCard` (PR 5) con EMA-7d overlay — superior a MFP. No regresionar |
| "Más" tab con header stats (Consecutivo / Avatar / Progreso kg) | IMG_1127 | **Adapt** | `More.tsx` ya existe post-PR 3 — el stats-band con `Consecutivo` a la izquierda + avatar centrado + delta peso a la derecha es un pattern fuerte y compacto. Copiarlo como hero de `More` |
| Lista de settings con icon 20px + label + chevron-right | IMG_1127 | **Copy** | `More.tsx` ya lo tiene; validar que todas las rows cumplen HIG ≥ 44px |
| Detail setting (Agua) con slider horizontal + value display "2 litros / 4 botellas" + radio-cards bebida | IMG_1128 | **Adapt** | `SettingsNutrition.tsx` hydration slider ya existe post-Q9; el patrón de "2 units display side-by-side" (litros + botellas) vale la pena; radio-cards de bebida son innecesarias para RIAL |
| Botón primario verde saturado `GUARDAR AJUSTES` + text-link secundario `REINICIAR` | IMG_1128 | **Skip** | Color verde MFP es el brand; RIAL usa accent primary por theme (`text-primary`). No copiar el estilo, sí el pattern "primary + text-link destructive" bajo |
| Pill amarillo `Pásate a Premium` en header (dorado sobre negro) | IMG_1129–1133 | **Skip** | Aggressive upsell que degrada el header. RIAL usa `RialPlus` como surface dedicada, no un pill en chrome |
| Banner `Despídete de los anuncios · Pásate a Premium` **entre** el hero y el grid | IMG_1129 | **Skip** | Ad-removal upsell en free es un anti-pattern. RIAL free no lleva ads — la decisión ADR-008 lo hace innecesario |
| Banner AdMob `TOO GOOD TO GO` intercalado entre módulos de producto | IMG_1129 / IMG_1130 | **Skip** | Ads de terceros son una violación de confianza en wellness. Explícitamente fuera de ADR-008 |
| Coronas Premium `👑` sembradas en inputs (Tiempo, macros lock en %DV) | IMG_1139 / IMG_1140 | **Skip** | Degrada al user free haciéndole sentir "incompleto" en cada form. No replicar |
| Paginación con dots `●○○○` bajo carrusel de cards | IMG_1129 | **Adapt** | `<Pagination>` dots en Home secondary rail si el carrusel de stats requiere múltiples páginas (Q15+) |
| Carrusel horizontal de tarjetas hero en Panel | IMG_1129–1132 | **Adapt** | Home rail secundario — **pero con menos módulos** (3 máx vs 5 MFP) y sin paywalls internos |
| Paywall `Pásate a Premium` sobre la card de Macros (blur + CTA center) | IMG_1130 | **Skip** | Bloquear una stat core detrás de paywall es exactamente lo que ADR-008 prohíbe |
| Color palette dark: `#0d0d10` background + `#1a1a1f` card + cyan accent `#3b82f6` + amber premium `#fbbf24` | global dark captures | **Skip (para theme-*-dark)** | La dark palette de MFP es plana (1 nivel de surface). RIAL `theme-neutral-dark` + `theme-volt-dark` son superiores |
| Search bar de alimento con placeholder `Buscar alimento` + tabs `Todo / Mis comidas / Mis recetas / Mis alimentos` + pills `Escaneo de código barras / Agregado rápido` prominentes | IMG_1138 | **Copy** | `AddMeal.tsx` ya tiene búsqueda; añadir los dos pills grandes `Escáner` + `Rápido` **arriba** de la lista como shortcuts (pattern muy claro) |
| Filtro `Más recientes ▼` en historial con dropdown | IMG_1138 | **Adapt** | `AddMeal.tsx` — `<DropdownMenu>` para `Más recientes / Más usados / Alfabético` |
| `%DV` (porcentaje de objetivo diario) por nutriente inline en card macros | IMG_1139 | **Copy** | Añadir `%DV` computed inline en macro breakdown — reduce la necesidad de ir al tab "Nutrientes" separado |

---

## 3. Catálogo de capturas (14/14)

Agrupadas por tipología con IMG más legible del patrón.

### A. More / Profile menu

- **IMG_1127** "Más" — header custom con 3 columnas: izquierda `Consecutivo / 2 / días`, centro avatar circular morado + `vcalvarro`, derecha `Progreso / 6,5 kg / kilos ganados`. Divider sutil, luego lista vertical 11 rows con icon 20px + label + chevron-right: `Reactivar Premium` (corona amarilla), `Mi perfil`, `Ayuno intermitente`, `Dormir`, `Objetivos`, `Progreso`, `Mi informe semanal`, `Nutrición`, `Comidas, recetas y alimentos`, `Recordatorios`, `Aplicaciones`. Bottom-nav visible `Panel / Diario / [+] / Progreso / Más` con "Más" activo. **Intent**: settings hub + stats-glance en el mismo shell. Es el único header con personalidad en toda la app.

### B. Settings detail — Ajustes del agua

- **IMG_1128** "AJUSTES DEL AGUA" — back-chevron circular top-left, title-centered. `Objetivo diario` bold + two-line value display `2 litros / 4 botellas` uno debajo del otro. Slider horizontal con track gris + fill verde + handle blanco. Debajo, sub-heading `Tamaño de la bebida` + grid 2 cols con dos radio-cards: `Vaso 250 ml` (izq, caption `POR DEFECTO` top-left) y `Botella 500 ml` (der, check-badge verde top-right). Footer fijo: pill verde full-width `GUARDAR AJUSTES` (uppercase) + text-link gris `REINICIAR` bajo. **Intent**: edición de una preference numerica con units. Bien estructurado; el uppercase del CTA es dated.

### C. Home / Panel — Calorías hero

- **IMG_1129** Panel — header custom: avatar izquierda + logo `myfitnesspal` azul cyan centro + bell top-right + pill amarillo `Pásate a Premium` flotando sobre el avatar. `Hoy` bold + pill outlined cyan `Editar` a la derecha. **Card hero `Calorías`** (fondo `#1a1a1f`, radius ~16): title 24px + caption `Restantes = Objetivo - Alimentos + Ejercicio` 13px gris. Contenido: donut outline gris oscuro (anillo grueso, sin progress visible en 0) con `3030 Restantes` centered (32px bold + 14px gris). A la derecha del donut, tres rows icon+label+value: `🏳 Objetivo base 3030`, `🍴 Alimentos 0`, `🔥 Ejercicio 0`. Debajo pagination dots `● ○ ○ ○` (4 páginas carrusel). Separador + banner promo `Despídete de los anuncios. Pásate a Premium`. Banner AdMob verde `TOO GOOD TO GO · ACABEMOS CON EL DESPERDICIO · Descarga ahora`. Grid 2×N stat-cards: `Pasos · 0 / Objetivo: 0 pasos / barra rosa fill` + `Ejercicio + / 0 cal / 00:00 h`. Peso card con chart hint top. Bottom-nav visible. **Intent**: glance del día + scroll a stats secundarios. Densidad alta; fracasa en jerarquía porque el pill amarillo compite con el hero.

### D. Home / Panel — Macros slide

- **IMG_1130** Panel (slide 2 del carrusel) — mismo header fijo. La card hero es ahora `Macros` con **paywall overlay**: 3 donuts semi-transparentes (carbos / grasas / proteínas) desaturados + pill central negro `Pásate a Premium` cubriendo el stat. Dots `○ ● ○ ○`. Resto del scroll igual a 1129. **Intent**: bloquear desagregado de macros detrás del paywall — anti-pattern directo.

### E. Home / Panel — Corazón saludable slide

- **IMG_1131** Panel (slide 3) — card hero `Corazón saludable` con tres sub-stats vacías (líneas placeholder verdes) + paywall pill `Pásate a Premium` center-bottom. Dots `○ ○ ● ○`. **Intent**: stat derivativo (probablemente colesterol + saturadas + sodio) detrás de Premium.

### F. Home / Panel — Con bajo contenido de carbs slide

- **IMG_1132** Panel (slide 4) — card hero `Con bajo contenido...` (cortado por viewport). Se ve el edge de la card anterior `...dable` + la nueva. Ambas con pill `Pásate a Premium`. Dots `○ ○ ○ ●`. **Intent**: confirma el patrón — 3 de 4 tarjetas del carrusel son paywalls, solo la primera (`Calorías`) es free.

### G. Home / Panel — Peso chart scrolled

- **IMG_1133** Panel scrolled to bottom — se ve el tail del carrusel + banner AdMob + grid `Pasos / Ejercicio` + **Peso card** (hero): title `Peso` + caption `Últimos 90 días` + `+` top-right. Chart: 4 ejes Y horizontales (78 / 73 / 68 / 63 kg), 4 ejes X (18/1 / 17/2 / 19/3 / 18/4) — 3 meses de historial. Línea verde suave con dot único verde al final, datos concentrados en 18/1–17/2. A la derecha parcialmente visible otra card (`Paso...`, probablemente `Pasos / Últimos X días`). **Intent**: scroll-tail del panel con charts históricos. El chart es simple pero funcional; RIAL ya lo supera con EMA-7d.

### H. Diario — día con meal slots

- **IMG_1134** Diario top — header custom: chevron-left + `Hoy ▼` center (dropdown selector fecha) + chevron-right + `⚡ 0` icon + duplicate-like icon top-right. **Info bar** full-width sticky: `Calorías restantes` label + ecuación horizontal `3030 Objetivo − 0 Alimentos + 0 Ejercicio = 3030 Restantes` (último en azul cyan, bold). Sub-text `Despídete de los anuncios.` + pill dorado gradient `Pásate a Premium`. Lista de meals: `Desayuno` (bold, sans caption) + link `AGREGAR ALIMENTO` (uppercase cyan) + `⋯` overflow. Separador sutil. `Brunch` (bold). **Grid 2 cols stat-cards** `Registrar alimento` (icon magnifier cyan + label) + `Escaneo de código...` (icon barcode pink + label). Lista continúa `💧 Agua`, `🟩 Peso`, `🔥 Ejercicio`. Bottom-nav visible con `Diario` activo. **Intent**: diario segmentado por meal slot + shortcuts prominentes a las dos acciones más usadas (search + barcode).

### I. Diario — meal slots vacíos

- **IMG_1135** Diario scrolled — mismo header + info bar + banner AdMob `OMIO · Reserva billetes con OMIO · Descarga ahora`. Lista `Merienda / AGREGAR ALIMENTO ⋯`, `Cena / AGREGAR ALIMENTO ⋯`, `Aperitivos / AGREGAR ALIMENTO ⋯`, `Ejercicio / AÑADIR EJERCICIO` (parcialmente cortado). **Intent**: el resto de los meal slots se apilan verticalmente — el usuario escanea top-to-bottom por momento del día. Pattern sólido.

### J. Nutrición — tab Nutrientes (tabla)

- **IMG_1136** Nutrición — header custom: back-chevron + `Nutrición` center + `Exportar` text-link top-right. Tabs segmentados `Calorías / Nutrientes / Macros` (Nutrientes activo, underline cyan). Sub-toolbar `< Vista de día ▼ / Hoy / >` (period selector). Tabla 4 columnas: etiqueta izquierda (`Proteínas / Carbohidratos / Fibra / Azúcar / Grasas / Grasas saturadas / Grasas poliinsaturadas / Grasas monoinsaturadas / Grasas trans`) + `Total` (all 0) + `Objetivo` (152 / 379 / 38 / 114 / 101 / 34 / — / — / 0) + `Restan` (mismos valores) + chevron-right por fila (drill-down). Banner inferior azul gradient `SUMA RÁPIDA DE MACROS · DISPONIBLE CON PREMIUM`. **Intent**: tabla densa para power-users. Cada fila es clickable al detalle. Muy funcional, visualmente austero.

### K. Nutrición — tab Macros (donut)

- **IMG_1137** Nutrición — mismo header + tabs (Macros activo). Donut negro puro (fondo empty — 0 consumido) grande centrado. Leyenda vertical 3 filas: dot cyan `Carbohidratos (0g)` + Total `0%` + Objetivo cyan `50%` / dot verde `Grasas (0g)` + `0%` + verde `30%` / dot naranja `Proteínas (0g)` + `0%` + naranja `20%`. Debajo lista 3 rows paywalled: `Alimentos más ricos en Carbohidratos 👑 / ... Grasas 👑 / ... Proteínas 👑` (coronas Premium). Disclaimer gris `Desbloquea la versión Premium para saber qué alimentos registrados contienen más de cada macronutriente`. Banner inferior `SUMA RÁPIDA DE MACROS`. **Intent**: donut educativo de distribución macro + insight-generator (paywalled).

### L. Añadir alimento — search con historial

- **IMG_1138** Añadir alimento — back-chevron + `Desayuno ▼` center (dropdown meal) + X-close. Search input fullwidth con magnifier + placeholder `Buscar alimento`. Tabs text `Todo / Mis comidas / Mis recetas / Mis alimentos` (Todo activo, underline cyan). Dos stat-cards grid 2×1: `Escaneo de código de barras` (icon barcode outlined cyan) + `Agregado rápido` (icon cyan). Sub-heading `Historial` + pill-dropdown `Más recientes ▼`. Lista 6 rows densos: nombre alimento (ej. `Kiwi`) + verified-green-check + caption `48 cal, 1 fruit` en gris + circled-plus-button `+` a la derecha. Entries: `Kiwi ✓ / Greek yogurt, plain, whole, 3.25% ✓ / Beef patty, cooked ✓ / Feta cheese ✓ / Batata ✓ / Mantequilla De Cacahuete ✓`. Banner inferior `SUMA RÁPIDA DE MACROS`. **Intent**: el historial **es el tab por defecto** dentro de "Todo" — el user llega a re-log antes que a search. Enorme valor para daily retention.

### M. Añadir alimento — detail (Impact Protein)

- **IMG_1139** Añadir alimento detail — back + `Añadir alimento` title + `Regístralo` top-right text-link cyan (action del CTA). Hero: `Impact Weight Protein (Natural Chocolate)` title 22px bold + subtitle gray `MyProtein` (brand). Form stacked: 4 rows label-left + input-pill-right — `Tamaño de la ración / 25 g`, `Número de raciones / 0,25`, `Tiempo / 👑` (paywalled), `Comida / Desayuno`. Debajo: macro-hero — donut 40px con `25 cal` center (ring cyan+pink+orange = %DV) + 3 columns percent `7% 0,4g Carbohidratos` (cyan) / `17% 0,5g Grasas` (pink-magenta) / `76% 4,8g Proteínas` (orange). Image-ad intercalada (`¿Te gusta... ajar?` con CTA `Saber más` — AdMob nativo sobre un content card). Footer: `Porcentaje de Objetivos Diarios` + `👑 Pásate a Premium`. **Intent**: commit-food flow — porción + meal destination + macro breakdown antes de registrar. La forma es sólida; los dos paywalls (Tiempo + %DV gate) contaminan.

### N. Añadir alimento — información nutricional expandida

- **IMG_1140** Añadir alimento detail scrolled — mismo header. Section `Porcentaje de Objetivos Diarios` + `👑 Pásate a Premium` + progress bar dots `1% Calorías / 👑 Carbohid... / 👑 Grasas / 👑 Proteínas` (3 de 4 macros paywalled). Section `Información nutricional` con disclosure-toggle `Oculta ▲` cyan top-right. Tabla de nutrientes: `Calorías 25 / Grasas totales 0,5 g / Saturadas 0,3 g / Trans 0 g / Poliinsaturadas 0 g / Monoinsaturadas 0 g / Colesterol 0 mg / Sodio 1,5 mg / Carbohidratos totales 0,4 g / Fibra dietética 0,2 g / Azúcar 0,3 g / Azúcares añadidos —`. Filas con divider hairline. **Intent**: disclosure de nutrición completa por alimento — tabla USDA-style. Excelente para power-users; anidarlo en un `<Collapsible>` es lo correcto (no ocupa espacio por defecto).

---

## 4. Principios destilados

### 4.1 Sistema visual — dark-first incumbente plano

| Token | Valor MFP | RIAL actual (`theme-neutral-dark`) | Acción |
|---|---|---|---|
| `--background` | `#0d0d10` (near-black puro) | `#141414` (warm stone-950) | Mantener warm — MFP es demasiado frío |
| `--surface` / card | `#1a1a1f` plano | `#1c1c1e` con elevation-2 | Mantener — RIAL ya lo hace mejor |
| Card border | transparente | `border-outline-variant/20` ligero | Mantener |
| Accent primary | `#3b82f6` cyan | por-palette (volt lime / neutral emerald / ocean cyan / ember amber) | No copiar cyan MFP — romperia el sistema |
| Accent premium | `#fbbf24` amber gradient | `--brand-secondary` (varía por palette) | No copiar — RIAL evita el "gold premium" cliché |
| Success | verde saturado `#22c55e` (IMG_1128 Guardar) | `--brand-secondary` | No copiar — funcional pero dated |
| Card elevation | sin shadow (plano) | `shadow-elev-2` sutil | Mantener |
| Typography | SF-Default sin jerarquía fuerte | Inter + JetBrains Mono en macros | Mantener — RIAL tiene más personalidad tipográfica |
| Info bar equation style | "3030 − 0 + 0 = 3030" inline, diff color por token | N/A | **Copy** — adoptar el micro-pattern |

**Resumen.** La paleta MFP es el baseline "dark mode fitness app 2020". Funciona, no destaca, no ofende. RIAL `theme-*-dark` ya es estrictamente superior en warm+elevation. La única lección visual es el tratamiento de la ecuación (ver §4.3).

### 4.2 Tipografía

- **MFP**: SF-Default en todo, tamaños típicos 24/18/14/13. Macros numeric va en mismo face que labels — zero diferenciación.
- **Divergencia consciente RIAL**: RIAL usa JetBrains Mono en macros y valores grandes. Mejor legibilidad para `"3030 Restantes"` (alineación digit-width). **Mantener** — es un diferenciador sutil pero valioso.
- **Headers custom de screen** (IMG_1127 `Más`, IMG_1128 `AJUSTES DEL AGUA` uppercase, IMG_1134 `Hoy ▼`) — MFP mezcla caps con title-case sin sistema. **Skip**. RIAL `PageHeader` ya es consistente (title-case solo).

### 4.3 Information design — equation-as-caption + table-as-detail

**Micro-pattern #1 — ecuación horizontal como info bar (IMG_1134 / IMG_1135).**
```
3030    −    0         +    0          =    3030
Objetivo     Alimentos      Ejercicio       Restantes
```
Cuatro tokens numéricos grandes (~22px) con labels mini debajo (~11px gris). El `=` y los operadores `− +` como glyphs finos. El último token (`Restantes`) en color accent — es la única cifra que le importa al user.

**Por qué funciona**: explicita la fórmula sin que el user tenga que memorizarla. Elimina el momento "¿por qué restan 3030?". Perfect también para educación nutricional (el `+ Ejercicio` es contraintuitivo para muchos users).

**Candidato RIAL**: `NutritionHero` ya muestra los 4 números pero como grid 2×2. Probar la variante 1-line ecuación como **caption opcional** bajo el donut (toggle en Settings · `Mostrar fórmula calórica`), o como default en una variante ICP-adaptive "Marcos" (power-user).

**Micro-pattern #2 — tabla densa `Total / Objetivo / Restan` (IMG_1136).**
Cuatro columnas de anchura variable con hairline dividers. Cada fila es clickable (chevron-right). Escalado: 9 filas + scroll infinito si hay más. Cero decoración — la tabla es el dato.

**Por qué funciona en nutrición**: cuando el user busca "¿cuánta fibra me falta hoy?", no necesita gráficos — necesita la cifra. La tabla es el formato correcto.

**Candidato RIAL**: `Progress` → Nutrición sub-tab nuevo `Detalle`, complementario al actual grid de tiles. La tabla se beneficia de `<SectionCard title="Micronutrientes" padding="none">` con rows CSS grid-template. Q17.

### 4.4 Sheets / modales

MFP **casi no usa bottom sheets**. El flujo "añadir alimento" abre una pantalla full-screen route (IMG_1138 → IMG_1139 → IMG_1140), no un sheet. Patrón 2014, antes de que iOS consolidara el modal sheet.

**Decisión RIAL**: no hay nada que copiar aquí. RIAL ya está adelante con ADR-009 V2 (compact + focus variants). La única observación es que **el flow `AddMeal → detail → register` encaja bien en un `<BottomSheet size="focus" headerLayout="back-title-action">` stack** — lo cual RIAL ya contempla como consumer candidato en el playbook de Bevel.

### 4.5 Empty states

MFP resuelve el empty state **con la interfaz misma** — el donut muestra "3030 Restantes" sobre un anillo gris sin fill, los stat-cards muestran `0` con `+` prominente. No hay onboarding-illustration ni copy dedicado.

**Contraste con Bevel**: Bevel usa empty states informativos (skeleton + icon + título + descripción sin CTA). **Contraste con RIAL actual**: `EmptyState` tiene CTA prominente.

**Decisión**: mantener el approach actual de RIAL (`EmptyState` con CTA accionable) porque el ICP de RIAL no es power-user dispuesto a rellenar sin guía. MFP asume que el user ya sabe qué hacer — asumption que no se sostiene para Clara ICP. **No copiar**.

### 4.6 Badges, pills, chips

- **Verified green check** en entries del historial (IMG_1138) — pattern muy claro. RIAL debería usar un dot neutro (`"user"`) vs dot brand (`"seed"`) vs dot accent (`"verified/OFF"`). Hoy no hay diferenciación visible, lo cual invita duplicados.
- **Pill amarillo `Pásate a Premium`** en header persistente — aggressive upsell que contamina. **Skip**.
- **Pill outlined `Editar`** (IMG_1129) — bien resuelto (rounded-full + border + text accent). RIAL ya lo hace así.
- **Dropdown-pill `Más recientes ▼`** (IMG_1138) — `<DropdownMenu>` con affordance chevron. Vale la pena adoptar para filtros no-exclusivos donde `<SegmentedTabs>` sería overkill.
- **Corona Premium `👑`** sembrada en inputs (IMG_1139 Tiempo field, IMG_1140 macros gate, IMG_1137 alimentos-más-ricos list) — **Skip**. Micro-dark-pattern que degrada al user free con más pila de emoji que de función.

### 4.7 Pricing / paywall

Formalizado en **ADR-008** (free-generous + single premium tier). MFP es el **anti-ejemplo canónico**:

- **Barcode paywalled** (documentado en deep-dive §5) — backlash App Store 2024. RIAL tiene barcode gratis para siempre.
- **Macros breakdown paywalled** (IMG_1130 entire hero card blurred with pill) — stat core detrás del paywall.
- **`Tiempo` field paywalled** (IMG_1139) — metadata trivial detrás de Premium.
- **`Alimentos más ricos en X` insights paywalled** (IMG_1137) — una tarea derivada de data que el user ya pagó en trabajo (logging).
- **`Suma rápida de macros` paywalled** (IMG_1136 / IMG_1138 banners) — quick-add sería feature free en RIAL (ver §2 copy-row).
- **Dos tiers Premium + Premium+** (deep-dive §5) — confusión brutal. ADR-008 lo rechaza.

**Lección única**: MFP muestra qué pasa cuando el paywall crece orgánicamente sin gobernanza. ADR-008 es la respuesta explícita.

### 4.8 FAB / nav

- **Bottom-nav 5-slot** con FAB central azul `+` (IMG_1127 / IMG_1129 / IMG_1134): `Panel / Diario / [+] / Progreso / Más`. Tap FAB abre agregar-meal (probablemente).
- **RIAL ya lo hace** (`BottomNav.tsx` con 5 slots + `+` central). La única diferencia es que RIAL post-PR 4 abre un `<BottomSheet>` action grid vs MFP que va directo a la pantalla de add. **Mantener approach RIAL** — el sheet-grid es superior (Bevel IMG_0997 pattern).

### 4.9 Lo que NO copiamos

- **Paleta cyan + gold-premium** — dated y genérica. RIAL tiene 4 paletas con personalidad.
- **Paywalls sobre content** — ADR-008.
- **Ads AdMob intercalados** — nunca.
- **Coronas Premium en fields** — degradación gratuita de UX.
- **Header custom por screen con uppercase inconsistente** — RIAL `PageHeader` es superior.
- **Empty states "silenciosos" sin guía** — no encaja con ICP RIAL.
- **Dos tiers Premium** — ADR-008.
- **Ícono-atractivos sin function** (bell top-right IMG_1127/1129 — notificaciones que en la practica MFP no genera relevantes).

### 4.10 Patrón novedoso — diary-by-meal-slot row layout

**Hallazgo.** MFP resuelve el diario con un **layout de filas-por-slot** que es notablemente eficiente:

```
┌─ Info bar ecuación ─────────────────┐
├─ Desayuno           [AGREGAR ⋯] ───┤
│  (lista de entries si las hay)      │
├─ Brunch             [AGREGAR ⋯] ───┤
│  ...                                │
├─ Merienda           [AGREGAR ⋯] ───┤
├─ Cena               [AGREGAR ⋯] ───┤
├─ Aperitivos         [AGREGAR ⋯] ───┤
├─ Ejercicio          [AÑADIR ⋯] ────┤
```

Cada slot tiene header 1-line + CTA uppercase inline + entries apiladas dentro. Cero card-chrome, cero espaciado vertical excesivo. El user scannea por hora del día (top-to-bottom = mañana-tarde-noche).

**RIAL hoy** usa `TodaysMeals.tsx` con cards individuales por meal, con expand/collapse y más chrome visual. El approach es más "rich" pero menos escaneable.

**Propuesta**: una variante ICP-adaptive para Marcos (power-user, prefiere densidad) del diario — usar el layout MFP-style bajo `featureFlags.diaryDense = true`. No reemplazar el default rico (que funciona para Clara), ofrecer la densidad alternativa. Q17+.

### 4.11 Patrón novedoso — historial como default en search

**Hallazgo clave (IMG_1138).** Cuando el user abre "Añadir alimento", el default que ve **no es** un search vacío — es su **historial de alimentos** ordenado por "Más recientes". La barra de search está pero no es el centro de atención hasta que el user tipea.

**Por qué es brillante**: el 60% del logging diario es re-logging (según MFP blog). Exponer el historial reduce el medio tiempo de log de ~45s a ~8s. Clara ICP (cognitivamente simple) lo agradece; Marcos ICP (eficiente) lo demanda.

**RIAL hoy**: `AddMeal.tsx` tiene tabs `Buscar / Mis alimentos / Recetas / Barcode` — orden razonable pero `Buscar` es default. Cambio mínimo, impacto grande:

1. Si `foodHistory.length >= 3`, el tab default es "Historial" (nuevo, o renombrar "Mis alimentos").
2. Los 2 stat-cards grandes `Escáner` + `Rápido` **por encima** de la lista (como IMG_1138) — los 2 shortcuts más usados son visualmente destacados, no escondidos en tabs.
3. Lista con items 64px altura: thumbnail 40px + nombre + `kcal · porción` caption + `+` trailing button.

**ROI**: alto. Q15 candidate.

### 4.12 Patrón novedoso — "header-stats-band" en More

**Hallazgo (IMG_1127).** El header del More tab no es un `PageHeader` estándar — es un **stats band** tri-column: izquierda stat-pair `Consecutivo / 2 / días`, centro avatar 64px + username, derecha stat-pair `Progreso / 6,5 kg / kilos ganados`. Solo después aparece el list de settings.

**Por qué funciona**: el More tab es visitado principalmente para settings + profile, pero el user se lleva un premio visual al abrirlo (los 2 KPIs más emocionales: streak + peso). Reenforcement loop.

**RIAL hoy**: `More.tsx` (post-PR 3 reorg) tiene un hero card con avatar + username + editar. Los stats laterales (streak + delta peso) son un add gratuito. Adoptable en PR 10+ junto al rediseño de More que post-PR 3 ya lo tiene cerca.

---

## 5. Roadmap de ejecución — 5 PRs

| PR | Scope | Archivos nuevos | Archivos amendment |
|---|---|---|---|
| **M1** | Quick-add numeric tab + historial como default en AddMeal (MFP §4.11 + Copy-row quick-add) | `src/features/food/components/QuickAddForm.tsx`, `src/test/conventions/quick-add.test.ts` | `AddMeal.tsx` (reorder tabs: Historial-default + Quick-add-2nd + Search-3rd + Barcode-shortcut pill arriba), `AppStateContext` (si `quickAddHistory` se persiste), i18n +6 claves × 2 locales (`quickAdd.title`, `quickAdd.kcal`, `quickAdd.protein`, `quickAdd.carbs`, `quickAdd.fat`, `quickAdd.save`), `CHANGELOG.md` |
| **M2** | Info-bar ecuación en `NutritionHero` + toggle Settings | — | `NutritionHero.tsx` (añade variante `variant="equation"` con los 4 tokens en 1-line), `SettingsNutrition.tsx` (toggle `Mostrar fórmula calórica` persist en `useLocalStorageState('nutrition.heroVariant')`), i18n +4 claves × 2 locales, `CHANGELOG.md` |
| **M3** | Inline `<Collapsible>` con tabla nutrientes completa en detail-alimento (MFP §3.N) | — | `PortionSheet.tsx` (añade `<Collapsible>` abajo con tabla 2-col label/value — Grasas totales / Saturadas / Trans / Colesterol / Sodio / Fibra / Azúcar añadida — limitado a nutrientes reales del `FoodItem.detailedNutrition` cuando exista), `types/food.ts` (extend `FoodItem` con `detailedNutrition?: DetailedNutrition`), i18n +12 claves × 2 locales, `CHANGELOG.md` |
| **M4** | Historial con verified-state dot + quick re-log `+` inline | — | `AddMeal.tsx` (diferenciar rows `seed` vs `user-created` vs `off-verified` con dot 8px + aria-label; `+` button que loguea con última porción usada como pre-fill), `FoodHistoryItem.tsx` (nuevo sub-component si > 3 rows duplicadas), `CHANGELOG.md` |
| **M5** | Tabla densa `Total / Objetivo / Restan` en Progress → Nutrición → Detalle sub-tab | `src/features/wellness/components/NutrientTable.tsx`, `src/test/conventions/nutrient-table.test.ts` | `Progress.tsx` Nutrición tab gains `SegmentedTabs` sub-tabs `Resumen / Detalle`; `Detalle` monta `<NutrientTable>` (9 rows fijas: proteína, carbos, fibra, azúcar, grasa, saturadas, poli, mono, trans) con drill-down chevron, i18n +14 claves × 2 locales, `CHANGELOG.md` |

Governance: trabajar directamente en `main` (governance 2026-04-17). Cada PR = commit(s) + `release:preflight` verde + push a `rial-food/main` tras aprobación explícita del user ("continua").

**Priorización.** M1 es el ROI más alto (cierra el gap quick-add + reduce logging fatigue — el problema #1 de retención). M2 es el cheapest (1-line variant + 1 toggle). M4 es sinergia con M1 (mismo archivo). M3 y M5 son valor para Marcos ICP — diferirlos a Q17 si la capacidad es limitada.

---

## 6. Verificación end-to-end

```bash
npm run release:preflight
# tsc + lint + lint:code + check:i18n + test + build + size:check

preview_start
# escenarios clave a inspeccionar visualmente:
#  1. NutritionHero equation variant en 4 paletas × 2 modos
#  2. AddMeal abierto → tab "Historial" por default si foodHistory ≥ 3
#  3. AddMeal → QuickAdd tab → commit → aparece en dailyLog con fuente "Rápido"
#  4. PortionSheet → Collapsible expand → tabla densa no overflow en theme-volt-dark
#  5. Progress → Nutrición → Detalle → tabla con 9 filas + chevron drill-down
```

**Regresiones a vigilar.** Cambiar el default tab de AddMeal puede romper tests de flow existentes (`src/test/` search-by-name assertions). El toggle de `NutritionHero` exige migration — users pre-toggle ven el default actual, post-toggle pueden optar in/out. La tabla de nutrientes requiere que `FoodItem.detailedNutrition` esté poblada para seed items — auditar `src/features/food/data/*.ts` y poblar los 46 seeds con los 9 nutrients canónicos antes de shippear M3/M5.

**Smoke de accesibilidad.** HIG ≥ 44×44 en los nuevos touch targets (`QuickAddForm` number inputs + `+` button del historial). Contraste WCAG AA de la info-bar equation en las 8 combinaciones theme (`theme-{palette}-{mode}`) — el `brand-secondary` del "Restantes" token debe pasar 4.5:1 en todos.

---

## 7. Fuentes

- Capturas: `docs/market/Competitor Images/MyFitnessPal/` (IMG_1127–IMG_1140).
- Deep-dive descriptivo: `docs/market/deep-dives/myfitnesspal.md`.
- Doctrina general competidores: `docs/market/ux-patterns.md`, `docs/market/rial-positioning.md`.
- Sistema RIAL actual: `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/adr/ADR-001` a `ADR-009`.
- Referencia de formato: `docs/market/bevel-design-playbook.md`.

---

## 8. Notes for reviewer

- **Solo 14 capturas** — cobertura desigual. No se ven: onboarding, barcode scanner real, planner, recetas, social, creación de comidas compuestas, exportación. Las decisiones basadas en áreas no capturadas (p.ej. "cómo hace MFP el barcode flow") se derivan del deep-dive (secondary), no de visual inspection.
- **Todas las capturas están en dark mode** — no se puede inferir el behavior de `theme-*-light` de MFP. El tradeoff de contraste entre chrome y content en light-mode es desconocido.
- **Banners AdMob aparecen en todas las capturas** — el tester tenía tier free sin ad-removal. Toda observación sobre "densidad de chrome" hay que filtrarla por "¿existe esto para el user premium?". El deep-dive sugiere que Premium quita los banners pero no las coronas — validar antes de citar como fact.
- **Idioma ES-es** (`Consecutivo`, `Brunch`, `Merienda`, `Aperitivos`, `Pásate a Premium`, `Regístralo`) — la localización ES no está del todo madura (`Brunch` como meal slot es extraño en ES peninsular; `Aperitivos` vs `Snacks` es inconsistente con lo usado en otros mercados). RIAL puede ganar terreno en ES-es con copy más cuidado.
- **Pricing tier** mostrado es probablemente el US pricing convertido (`Pásate a Premium` sin precio en pantalla). No hay evidencia visual del modelo exacto Premium vs Premium+ en estas capturas — toda referencia a los dos tiers viene del deep-dive y del listing App Store, no de capturas.
