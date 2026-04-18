# Bevel Design Playbook

> Accionable. Complemento del deep-dive (`deep-dives/bevel.md`, descriptivo) y la doctrina transversal (`ux-patterns.md`).
>
> Alcance: extraer las prácticas de diseño visible en 64 capturas Bevel (IMG_0951–IMG_1019) que merece la pena **copiar, adaptar o descartar** para RIAL. Enfocado a `.theme-light` como "color 1" de referencia.
>
> Última revisión: 2026-04-18 (re-audit — cerradas las 9 capturas pendientes + identificada la segunda tipología de sheet "focus"). Capturas en `docs/market/Competitor Images/Bevel/Imágenes app/`.

---

## 1. Por qué Bevel como referencia visual

Bevel es un competidor **indirecto** (recetas son débiles — Paprika/Yummly la baten ahí), pero su **sistema visual** es el más cercano a "Apple-designed" entre los 19 competidores analizados:

- Fondo warm (no blanco puro), bordes invisibles, sombras suaves.
- Tipografía Inter/SF-like sin adornos. Métricas hero grandes, secundarias discretas.
- Un solo accent por contexto (naranja dorado "hoy", verde positivo, rojo déficit).
- Status bar y dynamic island siempre visibles — sheets no llegan arriba del todo.
- Information design con jerarquía clara: 1 hero → grid sub-metrics → educativo → cross-link.

Tomar su vocabulario **ahora** (pre-Q15/Q17) evita rehacer decisiones de color y sheet-anatomy más tarde.

---

## 2. Matriz Copy / Adapt / Skip

| Patrón Bevel | Referencia captura | Decisión | Dónde |
|---|---|---|---|
| Fondo warm `#fafaf9` en light mode | 0974 / 0994 | **Copy** | `.theme-light` en `src/index.css` |
| Cards borderless con `shadow-elev-2` sutil | 0974 / 0976 / 0977 | **Copy** | `SectionCard` en light mode |
| Handle bar + `rounded-t-3xl` + sheet no-full-height (compact ~60vh) | 0984–0990 / 0995 / 0996 | **Copy** | `<BottomSheet size="compact">` (ADR-009) |
| **Focus sheet casi-fullscreen ~92vh** (status bar band visible, sheet cubre resto) | **0988 / 1004 / 1011 / 1016** | **Copy** | `<BottomSheet size="focus">` (ADR-009 v2) |
| Header sticky `Cancelar` / `Siguiente` — focus sheets input-heavy | 1004 / 1011 | **Copy** | `<BottomSheet headerLayout="cancel-next">` |
| Hidden handle + keyboard-first en focus sheets | 1011 / 1012 | **Copy** | `<BottomSheet hideHandle size="focus">` |
| Onboarding: hero visual centered + title + subtitle + black pill CTA + text-link bajo CTA | 0953 / 0956 / 0957 / 0958 | **Copy** | `OnboardingScaffold` primitive |
| Wearable device list con 6 opciones + chevrons | 0958 | **Copy** | `SelectList` pattern en Settings |
| Radio-card selector (Imperial/Métrico) con desc interna + hint disclaimer | 0962 | **Copy** | `RadioCardGroup` primitive |
| Inline progress badge "Ha subido / Ha bajado" + mini sparkline | 0993 | **Adapt** | `ConstantTile` variant con trend indicator |
| Constantes grid 2 cols con estado por tile ("Sin rango" / "Sin tendencias" / valor) | 0994 / 0993 | **Copy** | `ConstantTile` primitive nuevo |
| Meal-edit inline con donut + macros + porción `- / +` + ingredientes + Eliminar/Guardar | 1015 / 1016 | **Copy** | focus sheet reusa pattern |
| Sheet sobre StoreKit native (apilamiento tier 3) | 1010 | **Copy** | stacking nativo radix ya soportado |
| Preview-link en sheet compartir con ingreso chat | 1017 / 1019 | **Adapt** | V2 — requiere OG fetch + shared text input |
| Overlay sheet 20–30% (no 50%) | 0984 / 1010 | **Copy** | `<BottomSheet>` defaults |
| Status bar + dynamic island visibles detrás de sheet | 0984 / 0985 / 0995 | **Copy** | `max-h-[88vh]` |
| Sheets apilables (paywall → sheet → StoreKit) | 1010 | **Copy** | `<BottomSheet>` acepta stacking nativo radix |
| Pricing free-generous + single premium | 0965–0966 | **Copy** | `RialPlus` + ADR-008 |
| Timeline temporal en paywall (Hoy / Día 12 / Día 14) | 0965 | **Copy** | `RialPlus` variant |
| AI Coach cross-módulo contexto | 1001 | **Copy** | System prompt AICoach |
| Home con 3 anillos glanceable + scroll | 0974 | **Adapt** | Home ICP-adaptive hero (Q15) |
| FAB long-press → action grid 3×3 | 0997 / 0998 | **Adapt** | BottomNav `+` long-press (Q15+) |
| StatTile con estado "No hay datos" / "Sin rango" | 0994 | **Adapt** | StatTile `empty` variant |
| Empty state informativo (no CTA agresivo) | 0990 | **Adapt** | `EmptyState` variant `info` |
| Shared-export carousel (tarjetas tipo Spotify Wrapped) | 0975 / 0999 | **Adapt** | `ShareCard` primitive (post-Q15) |
| Lock-pill "Desbloquear con Pro" flotando | 0982 / 0996 / 0977 | **Adapt** | existente + uniformar color |
| Anillo semi-gradient top-right en educativas | 0968–0972 | **Adapt** | onboarding-only, no generalizar |
| Process-status sheets 40% (no cerrar pantalla) | 1013 / 1014 | **Adapt** | reutilizable en Import/Photo flows |
| 5+ rings dashboard simultáneos | 0974 | **Skip** | sobrecarga; RIAL consolida a 1–2 |
| CGM/glucosa module | 0976 / 0982 | **Skip** | fuera de ICP 2026 |
| Monocromo casi total (blanco+negro+1 accent) | global | **Skip (para VOLT/OCEAN/EMBER)** | aplicar solo en `.theme-light` |
| "Mis alimentos" con verified blue check (brand) | 1005 / 1006 | **Skip (V1)** | requiere backend verification — defer |

---

## 3. Catálogo de capturas (64 de 64 leídas — cierre de auditoría 2026-04-18)

Agrupadas por tipología con IMG más legible del patrón.

### A. Onboarding + science explainers
- **IMG_0951** splash minimalista: logotipo fantasma + paginador dots + CTA negro full-width.
- **IMG_0952** card 3-D "Fitness" (BPM + timer + peso muerto). Título + subtítulo + demo-card + dots + CTA.
- **IMG_0953** "Privacidad por diseño" — 3D-effect card centrada (dispositivo abstracto con cámara) + title 28px + subtitle + CTA negro `Continuar con Apple` con icono + link secundario "Usar el correo electrónico en su lugar". Back chevron top-left. Pattern: **hero visual + 2-CTAs (primary black + secondary text-link)**.
- **IMG_0954** "Iniciar sesión con Apple" native sheet SUPERPUESTO al step 0953 — evidencia stacking nativo iOS. Dynamic island queda visible, sheet StoreKit-like cubre ~55% inferior con close-X + lista items con iconos + check verde bottom.
- **IMG_0955** pregunta única centrada ("¿Cuál es tu nombre de pila?") con campo underline. Sin card, sin chrome.
- **IMG_0956** "¡Encantado de conocerte, Vicente!" — emoji 👋 centered + H1 + subtitle 15px + CTA negro pill. Después del name input (0955). Pattern: **milestone confirmation mid-onboarding** (no final, solo reconoce + continúa).
- **IMG_0957** "Mejora tu salud día tras día" — chart comparativo "Con seguimiento" (línea verde exponencial ↑) vs "Sin seguimiento" (naranja descendente) + ejes `Salud` (y) / `Cronología` (x) con pills label. CTA negro. Pattern: **value-prop visual antes de pedir permisos/pago**.
- **IMG_0958** "¿Qué dispositivo ponible usas?" — 6 opciones (Apple Watch / Garmin / Helio Strap / Salud de Apple / Oura / No tengo) como cards separados con chevron-right. Cada card es independiente (radius, shadow, gap de 10px entre cards). Pattern: **SelectList vertical con cards independientes** — distinto del pattern `RadioCardGroup` (0962) donde hay visual selección radio.
- **IMG_0962** "¿Cómo te gustaría medir tus métricas?" — 2 radio-cards `Sistema imperial` / `Métrico` con label bold + desc inline + radio-dot derecho + active state `border` sutil. Disclaimer "Puedes reajustarlo más tarde en los Ajustes" bajo el grupo. Pattern: **RadioCardGroup binary** con hint.
- **IMG_0964** confirmación verde "Ya está todo listo" con checkmark glow + disclaimer médico.
- **IMG_0968–0972** cards "¿cómo funciona Esfuerzo/Recuperación/Sueño?" con anillo semi-gradient top-right + title/subtitle + sub-cards icon + lista vertical. Dos CTAs inferiores `← →` circulares ≥44×44.
- **IMG_0967** "sincronizando datos 31%" como pill, no overlay modal.

### B. Pricing / paywall (Pro)
- **IMG_0965** (dark) + **IMG_0966** (dark Mensual) paywall negro, badge `Pro` top-right, **timeline temporal** ("Hoy / Día 12 / Día 14"), toggle Anual/Mensual, CTA `Empezar por 0,00 €`.
- **IMG_1001** modal "Intelligence" sobre Home semitransparent. CTA negro + items con dot + subtítulo.
- **IMG_1010** StoreKit native sheet sobre paywall negro. Tres niveles apilamiento: paywall → modal → StoreKit.

### C. Home dashboard
- **IMG_0974** header "Hoy, 17 de abril" + chip "Activo/a" + chip "24°C Madrid". Banner warning naranja. **3 anillos horizontales** (Esfuerzo / Recuperación / Sueño). Promo Pro banner colapsable. "Estrés y Energía" con anillo grande + Max/Min/Avg.
- **IMG_0976** scroll: "Nutrición" `SectionCard` con anillo bloqueado + macros vacías + caption. Grid 2×N "Monitor de salud" (FR / FCR / SpO2) con sparkline vertical por tile.
- **IMG_0993** "Constantes" tab inferior — Grid 2 cols. Tiles por estado: (1) `VO₂ máx` empty "No hay datos / Sin rango" + skeleton lines; (2) `VFC histórico` empty solo; (3) `Históricos FCR` empty + mini-speedometer arc decorativo ("− / +"); (4) `Peso 71.0 kg` + dot-indicator morado "Ha subido" + bar gauge horizontal (el único tile con valor — subtle inline sparkline/gauge integration). Tabs inferior: Inicio / Diario / Fitness / Constantes (active) / `+`. Pattern: **ConstantTile con 3 estados canónicos** (empty / trend-down / trend-up / valor-stable).
- **IMG_0994** "Constantes" grid 2 cols (VO₂ / VFC / FCR / Peso / Masa magra / Grasa). Cada tile extiende StatTile con unidad + estado.

### D. Timeline / Diario
- **IMG_0973** barra días (13–19) — cada círculo es check-state; hoy es ring dorado sólido. "Entradas de hoy" con explicativo educativo. "Anclado" (destacado) + "Día" como listas con emoji + nombre + unidad + chevron.

### E. Fitness / actividad
- **IMG_0992** calendario dual (mar / abr 2026) con dots por nº actividades + leyenda. "Resumen de actividad" mini-chart line. "Rendimiento del Esfuerzo" delta % prominente (-26%) + línea densa.

### F. Nutrición detail
- **IMG_0977** hero anillo grande bloqueado + caption "Registra 750 kcal…". 2 tiles cuadrados (Calidad / Impacto glucosa). ListRow "Mis alimentos". Banner "Objetivos" con anillo mini + CTA deshabilitado.
- **IMG_0978–0982** deep-link: toggle g/%, grid macros, **energía neta** con slider horizontal degradado rojo→morado, "Factores calidad" con emoji + slider + delta, colapsable, banner CTA MCG.
- **IMG_0982** "Tendencias" ListRow tiles (Puntuación / Equilibrio / Energía neta + sparkline inline / Glucosa).

### G. Bottom sheets — el patrón clave
**Todas dejan ~60–90 px visibles del fondo (status bar + nav bar + dynamic island).**

- **IMG_0984** sheet "Objetivos de nutrientes" con tabs scroll, buscador, lista emoji + name + pill config + toggle iOS.
- **IMG_0985** grid 2×N tiles compactos (delta "Faltan 25g"). Sub-heading "Limitar nutrientes".
- **IMG_0986** 0984 pero Cafeína **ON** (toggle verde).
- **IMG_0987** 0985 pero Cafeína/Alcohol bajo "Limitar" — feedback inmediato desde sheet anterior.
- **IMG_0988–0989** "Objetivo de nutrición" confirmar datos salud + editar macros (slider kcal + grid grasas/carbos/proteína con candado lock + campo % + equilibrador).
- **IMG_0990** "Mis alimentos" tabs chips + empty state skeleton + icon ★ neutro.
- **IMG_0995–0996** "Peso" chart histórico + tabs temporales + calendario. "Análisis de tendencias" grid 2×1 + tabla. Lock-pill "Desbloquear con Pro" flotando.
- **IMG_1004–1009** buscador alimentos con tabs `Buscar` / `Mis alimentos`, header pegajoso `Cancelar` / `Siguiente`, lista thumb 40px + verified blue + kcal + porción + `+`.
- **IMG_1006** edit-detail alimento: foto + verified + "Datos nutricionales" + inline macros + donut + porción editable + "Añadir ingrediente" + CTAs `Personalizar` / `Añadir alimento`. Footer `Informar de un problema`.
- **IMG_1011–1012 / 1018** "¿Qué comes?" free-text + CTAs `Tomar foto` / `Importar foto` + badge counter. **Sheet ~92% (focus variant)** — solo deja ~40 px de status bar visible, handle pill visible pero NO header sticky (el sheet es input-first: keyboard emerge desde abajo y ocupa la mitad inferior; el "Continuar" queda sobre el keyboard). Pattern: **`size="focus"` + `hideHandle={false}` + keyboard-first**.
- **IMG_1015** "Registrar alimento" — focus sheet (~92vh). Header tri-column: basura roja izquierda (delete) + título centrado + `+` derecha (add). Card pizza con thumb + `Común · 1248 kcal` + chips `1 porción` + `Eliminar` / `Editar` inline. Footer vertical: `1,25K kcal · 54g · 129g · 55g` resumen macros chevron + `Fecha · Hoy a las 19:54` + CTA negro pill `Añadir al registro`. Pattern: **detail-review sheet** previo al commit final.
- **IMG_1016** edit-meal (pizza) con macros hero + donut + ingredientes + toolbar `Eliminar` / `Guardar`. Focus sheet — header mínimo back-chevron + título + star-fav + body largo + footer dos CTAs. **Sin handle** (por ser navegación hacia atrás, no modal).
- **IMG_1019** "Kit de Ramen Udon Kania" — focus sheet ~92vh, estructura similar a 1015/1016 pero con **hero preview-card externa arriba** (TikTok/IG-like imagen + caption " NOVEDADES DEL SUPERMERCADO LIDL ..."). Luego label icon-row `586 kcal Calorías / 14,9g Grasas / 95g Carbos / 14,4g Proteína` en 2×2 grid compacto. Dos items más: `1 porción` chevron + Banner `Calibración de la glucosa · Registra 20 ingestas…` con lock-pill `Desbloquear con Pro`. Pattern: **externally-sourced food detail sheet** — distinto del 1015 que es user-created.

### H. Modales sobre Home
- **IMG_0997–0998** long-press `+` → action grid 3×3 (Describir · Importar · Tomar foto / Escanear · Preguntar · Buscar / Generar plantillas · Ver plantillas · Registrar actividad). Fondo gris claro translúcido. BottomNav visible con X.
- **IMG_1013–1014** status sheets: "Procesando tus alimentos" 🍽 + CTA `Listo`. "Tus alimentos están listos" + CTA `Ir al registro` + link `Descartar`. Altura ~40%.
- **IMG_1017** compartir preview con caja preview externo + ingreso chat + botón `+`.

### I. Share / export
- **IMG_0975 / 0999** sheet "Compartir" con tabs Resumen/Nutrición/Estrés + carrusel cards shareables + CTA `Personalizar` + acciones (Guardar / Copiar / Compartir).

### J. Sync / permission / system
- **IMG_0960** iOS native HealthKit con app-icon hero + toggles + `Permitir` / `No permitir`.
- **IMG_0961** confirmación "Conectado" + check verde + 2 CTAs.
- **IMG_1002–1003** permiso cámara + scanner barcode con overlay cámara + `Multiescaneo` / `Manual`.

---

## 4. Principios destilados

### 4.1 Sistema visual — "color 1 light" (aspiración para `.theme-light`)

| Token | Valor Bevel | RIAL actual | Acción |
|---|---|---|---|
| `--background` | `#fafaf9` (stone-50 warm) | `#ffffff` | **Copy** |
| `--surface` | `#ffffff` | `#ffffff` | Unchanged |
| `--outline-variant` | `transparent` / casi invisible | `#e5e5e5` visible | **Reducir** a `#f1f1f3` |
| `--primary` | `#09090b` | `#09090b` | Unchanged ✓ |
| `--macros` (red/amber/blue) | ~`#f87171` / `#fbbf24` / `#38bdf8` | match exacto | Unchanged ✓ |
| Card elevation | `shadow-elev-2` suave, **sin border** | `border border-outline-variant/20` + shadow | **Borderless en light** |
| Sheet overlay | `bg-black/25` | `bg-black/50` | **25%** |
| Sheet top radius | `rounded-t-3xl` | variable | **24 px** |

#### 4.1.a 4 paletas × 3 modos — arquitectura shipped en PR 3 (2026-04-18)

**Decisión del owner (2026-04-17).** Mantener las **4 paletas completas** (no consolidar a 3): `VOLT` · `OCEAN` · `EMBER` · `NEUTRAL` (nueva, Bevel-inspired). Cada paleta tiene variantes **light** y **dark**. A esto se suma un **eje de modo ortogonal** con 3 valores: `auto` (sigue `prefers-color-scheme`), `light` (fuerza día), `dark` (fuerza noche).

**Diferenciación competitiva por paleta.**
- **VOLT** (verde lima sobre negro) — para el atleta de rendimiento. Diferencia vs WHOOP rojo/negro y Strava naranja: acento `#dcfd05` agresivo y "técnico" que ninguno ocupa.
- **OCEAN** (azul cian) — para el ritmo disciplinado, analítico. Convive con MyFitnessPal/Cronometer (azules calmados) pero con más saturación para no confundirse con "medical app".
- **EMBER** (naranja cálido) — para el creativo cotidiano, inspiración de cocina. Espacio compartido con Paprika/Yummly (earthy), pero con `#ea580c` más vivo → señal "apetitoso" vs "book-style".
- **NEUTRAL** (warm neutrals estilo Apple Health / Bevel) — para el día a día adulto sin tribu. Llena un hueco donde nadie juega bien en fitness: la mayoría va con azul médico o verde vibrante; el warm neutral comunica "wellness maduro" sin clínica.

**Polish de paletas aplicado en PR 3 (basado en teoría del color + posicionamiento).**
- **EMBER light** `--brand-secondary`: `#b45309` (amber-700 "muddy") → `#d97706` (amber-600) — más limpio, mismo hue, luminosidad +1 step.
- **EMBER dark** `--tertiary`: `#ffffff` puro → `#fafaf9` (stone-50) — coherencia warm dentro de la paleta (el hot white chocaba con la base stone warm).
- **NEUTRAL** (ambas variantes) — `--brand-secondary` emerald (`#10b981` dark / `#059669` light) como "active signal" distinto del primary negro/blanco. Evita que primary y accent se pisen cuando primary = neutro puro.
- **Macros locked a `#f87171` / `#fbbf24` / `#38bdf8`** en las 4 paletas (coral / amber / sky). Food-is-food: los macros son dato, no personalidad de marca.

**Arquitectura técnica shipped.**
- Estado persistido en `localStorage` bajo `rial-theme-v2` como `{palette, mode}` (dos strings ortogonales). Migración automática desde legacy `rial-theme` (map: `dark→{volt,dark}`, `light→{volt,light}`, `blue-*→ocean-*`, `orange-*→ember-*`).
- `ThemeContext` resuelve `{palette, mode}` → `resolvedMode` (`light|dark`) con `window.matchMedia('(prefers-color-scheme: dark)')` cuando `mode === 'auto'`, escucha `change` para swap runtime.
- Clase aplicada al `<html>`: `theme-{palette}-{resolvedMode}` → **8 clases posibles** (`theme-volt-dark`, `theme-volt-light`, `theme-ocean-dark`, `theme-ocean-light`, `theme-ember-dark`, `theme-ember-light`, `theme-neutral-dark`, `theme-neutral-light`).
- `:root` bloque duplica a `.theme-volt-dark` para cubrir el initial-paint antes de la hidratación React.
- UI de selección: 2 secciones en Settings → Apariencia. (1) `Paleta` — grid 2×2 con NEUTRAL primero, preview en `resolvedMode` actual. (2) `Apariencia` — segmented control 3 chips (Auto · Light · Dark) con hint "Sigue la configuración del sistema" bajo el chip Auto.
- Defaults nuevos usuarios: `{palette:'neutral', mode:'auto'}`. Usuarios existentes: migrados 1:1 desde legacy.
- Convention test `src/test/conventions/theme-palettes.test.ts` lockea las 8 clases CSS + los 4 palettes + los 3 modes + helpers `resolveMode` / `themeClassName`.

**Lo que NO se hizo (y por qué).** No se consolidó a 3 paletas ni se colapsaron las variantes con `@media (prefers-color-scheme)` a nivel CSS. Razón: con el eje `mode` manual (`light|dark`) habilitado en la UI, el CSS-media-query-only approach impide que el user fuerce modo contra el sistema. La arquitectura actual (clase runtime + matchMedia listener) resuelve ambos casos con un único source of truth en JS.

### 4.2 Tipografía
- Títulos pantalla 28–32 px bold sin uppercase (`text-headline` ya OK).
- Subtítulo 14–15 px medium gris (`text-body` + `text-on-surface-variant` OK).
- Métricas hero 40–56 px (considerar `text-hero` 56 px para anillo Home).
- **Divergencia consciente**: RIAL conserva JetBrains Mono para macros numéricas; Bevel es Inter puro. No copiar — RIAL se diferencia con labels mono en nutrición.

### 4.3 Information design — jerarquía módulo
Patrón transversal Bevel:

```
[Header: título grande + fecha/periodo menor]
[Hero: UN elemento dominante — anillo grande o número hero]
[Grid 2×N o 1×N de sub-metrics relacionadas]
[ListRow educativa — "cómo se calcula"]
[Cross-link a módulo relacionado — "Conectar MCG" / "Ver plan"]
[Tendencias como footer scrollable opcional]
```

**Diferencia vs RIAL hoy:** Home mezcla `NutritionHero` + `ProgressPreviewCard` sin hero dominante único. Bevel consolida un "status del día" arriba y todo lo demás scrollea. Candidato Q15 (ICP-adaptive).

### 4.4 Bottom sheets — "second-level surface"
Formalizado en **ADR-009**. Anatomy compact (V1) + focus (V2, pendiente).

**Defaults compact (V1 shipped en PR 2):**
- **Max height** `88vh` (deja ~80 px fondo visible, status bar + dynamic island visibles).
- **Top radius** `rounded-t-3xl` (24 px).
- **Handle bar** pill 4×32 px gris centrado, ~8 px del borde.
- **Header sticky** con X izquierda + título centrado + acción derecha (slot). Padding 16 px vertical.
- **Overlay** `bg-black/25` (no 50%).
- **Contenido scrollable** dentro del sheet; el sheet no crece.
- **Cierre** tap overlay + swipe down handle + botón X.
- **Stacking** soportado nativamente por radix (paywall → sheet → StoreKit como IMG_1010).

#### 4.4.a Dos tipologías de sheet — `size: 'compact' | 'focus'` (ADR-009 v2, pendiente PR 6)

**Hallazgo del re-audit 2026-04-18.** Bevel no usa un único "bottom sheet" — usa **dos variantes bien diferenciadas** por densidad de contenido y tipo de tarea. El PR 2 implementó la compact; la focus requiere una extensión de primitive.

| Prop | `compact` (V1) | `focus` (V2) |
|---|---|---|
| **`max-h`** | `88vh` (~80 px fondo visible) | `92vh` (~40 px status-bar band visible) |
| **Captura referencia** | 0984, 0985, 0990, 0995, 0996 | **0988, 1004, 1005, 1011, 1015, 1016, 1019** |
| **Cuándo usar** | Pickers, toggle groups, lista corta, confirm-action | Forms multi-field, búsquedas con lista larga, input + keyboard, detail-edit, review-before-commit |
| **Header típico** | Close-X izq + título centrado + action derecha | `Cancelar` izq + `Siguiente` / `Guardar` der (titular sticky bajo), o back-chevron + título + star |
| **Handle** | Visible (handle pill top) | Visible para "editable/dismissable" (0988, 1004); **oculto** en keyboard-first (1011) o navigation-stack (1016) |
| **Body** | Lista corta | Lista larga scrollable, teclado emerge debajo |
| **Footer** | Opcional (primary CTA sticky) | Típico (primary + destructive / secondary par) |
| **Intent semántico** | "elegir algo" | "trabajar en algo" |

**Implementación propuesta** (PR 6):
- Añadir prop `size?: 'compact' | 'focus'` al `<BottomSheet>`. Default `compact`.
- Añadir prop `hideHandle?: boolean` (default `false`) — para focus sheets keyboard-first o navigation-stack.
- Añadir prop `headerLayout?: 'title-centered' | 'cancel-action' | 'back-title-action' | 'custom'` — con children slot si `custom`.
- Mantener stacking (tres niveles Bevel IMG_1010 prueba que el radix primitive ya lo soporta).
- Convention test `bottom-sheet.test.ts` se expande para locker ambas variantes + header layouts.
- `PRIMITIVES.md` §1 tabla añade filas para las 3 header layouts con referencia IMG_XXXX.

**Consumers candidatos a `size="focus"`:**
- `AddMeal.tsx` search tab — hoy es pantalla full-screen embebida en `PageShell`; podría ser focus sheet como IMG_1004.
- `CreateRecipe.tsx` — hoy pantalla full; podría ser focus sheet abriendo desde CreateModal con `size="focus"` + `headerLayout="cancel-action"` (Cancelar / Guardar).
- `ImportRecipeURL.tsx` — hoy pantalla full step-by-step; focus sheet podría presentar todos los steps sin cambiar contexto.
- `BarcodeScanner.tsx` modal preview tras escanear — hoy full-screen; focus sheet con imagen + datos + CTA `Añadir al registro` (IMG_1015 pattern exacto).

Esta migración NO es obligatoria — muchas screens actuales funcionan bien full-screen. La recomendación es **adoptar focus sheet progresivamente** cuando el user se beneficie de ver el contexto de fondo (p.ej., al escanear un código de barras es valioso saber desde dónde vienes; al añadir un alimento es valioso ver el `dailyLog` del día detrás del sheet).

#### 4.4.b RIAL popup/sheet/modal inventory — migration matrix (auditoría 2026-04-19)

Auditoría exhaustiva de todas las surfaces que ocupan la pantalla total o parcialmente: radix `Dialog`-based modals, manual `fixed inset-0` overlays, y full-screen routes que *podrían* ser sheets. Clasifica cada surface por **decisión** (Migrate / Stay / Defer) con razón.

##### Migrar a `<BottomSheet>` — HIGH priority

| Surface | Path | Tipología actual | Target | Razón |
|---|---|---|---|---|
| `SnapshotDetailModal` | `src/features/wellness/components/SnapshotDetailModal.tsx:52` | radix `Dialog` centered `max-w-md max-h-[90vh]` | `<BottomSheet size="focus" headerLayout="title-centered" actionSlot={<Trash/>}>` | Content density matches focus intent (photo + peso + measurements + note). `max-h-[90vh]` ≈ `focus` 92vh → zero-risk migration. Consistencia con RecipePicker/LogSnapshotModal ya migrados en PR 6.5. Abrir este sheet desde Progress→Body→Timeline beneficia sense of place. |
| `GdprConsent` | `src/components/GdprConsent.tsx:34` | manual `fixed inset-0 z-[200]` + `flex items-end sm:items-center` (sheet-like en mobile, centered en sm+) | `<BottomSheet size="compact" headerLayout="title-centered">` + footer con Rechazar/Aceptar | Consent decision es "elegir algo" (compact intent). Ya adopta forma de sheet en mobile — migrar elimina CSS custom. Z-stacking preservado por radix Portal. |

##### Migrar a `<BottomSheet>` — MEDIUM priority

| Surface | Path | Tipología actual | Target | Razón |
|---|---|---|---|---|
| `BarcodeScanner` result panel | `src/features/food/components/BarcodeScanner.tsx:213` | manual `fixed inset-0 z-[100]` (cámara + results en mismo overlay) | **Split:** cámara viewport **stays** full-screen; panel de resultados tras escanear → `<BottomSheet size="focus" headerLayout="back-title-action">` | IMG_1015 pattern exacto — camera feed como "contexto detrás" + sheet con detalle escaneado. Back-chevron mantiene cámara caliente (re-scan sin re-open). |
| `ImportRecipeURL` | `src/features/recipes/screens/ImportRecipeURL.tsx` | full-screen route con `PageShell` | `<BottomSheet size="focus" headerLayout="cancel-action">` cuando se abre desde Cocina/Explora | User se beneficia de ver lista de recetas detrás mientras pega URL + revisa preview. Flow corto (3 steps). Mantener route cuando se abre desde Profile como standalone. |
| `DailyCheckIn` | `src/features/wellness/screens/DailyCheckIn.tsx` | full-screen route | `<BottomSheet size="focus" headerLayout="cancel-action">` desde Hoy rail | Activación desde Hoy rail beneficia no perder contexto del `dailyLog`. Stay route cuando se accede desde Progress o deep-link. |

##### Migrar a `<BottomSheet>` — LOW priority (defer)

| Surface | Path | Decisión | Razón del defer |
|---|---|---|---|
| `AddTolerance` | `src/features/wellness/screens/AddTolerance.tsx` | focus sheet **opcional** | Flow corto que funciona como route; ROI bajo sin justificación UX clara. |
| `PhotoUploader` source picker | `src/features/recipes/components/PhotoUploader.tsx:195` | Stay radix `Dialog` **O** `<BottomSheet size="compact">` si se busca coherencia visual total | Choice muy corto (cámara vs galería); Dialog centered es correcto Material 3 / iOS-native. Solo migrar en un pase de unificación popup-language. |

##### Stay full-screen o `Dialog` — JUSTIFIED (NO migrar)

| Surface | Path | Tipología | Razón del stay |
|---|---|---|---|
| `MediaLightbox` | `src/features/recipes/components/MediaLightbox.tsx` | fullscreen gallery | Convención transversal (Instagram/Bevel/iOS Fotos). Pinch-zoom + swipe entre fotos requiere canvas total. |
| `CookMode` | `src/features/recipes/components/CookMode.tsx:106,135` | `fixed inset-0` + `wakeLock` | WakeLock mantiene pantalla viva; inmersión sin distracciones; pattern Paprika/NYT Cooking. El contexto "detrás" es irrelevante al cocinar. |
| `StoryViewer` | `src/features/social/screens/StoryViewer.tsx` | fullscreen auto-advance | Convention Instagram/TikTok/Facebook. Auto-advance + tap-to-advance requiere canvas total. |
| `ConfirmDialog` | `src/components/ConfirmDialog.tsx` | radix `Dialog` centered | Sí/No corto no es "elegir algo" ni "trabajar en algo" — es "confirmar". Material 3 / iOS convention = centered dialog. |
| GlobalHeader demo-gate + Profile logout | `src/components/GlobalHeader.tsx`, `src/features/profile/screens/Profile.tsx` | radix `Dialog` | Confirmaciones cortas; mismo criterio que ConfirmDialog. |
| `Onboarding` wizard | `src/features/profile/components/Onboarding.tsx:130` | `fixed inset-0 z-[100]` overlay full-screen | Flow first-run; no hay "home" al que volver que preservar como contexto. Sheet chrome sería artificial. Refactor de primitives internas en PR 9 (§4.11). |
| `CreateRecipe` | `src/features/recipes/screens/CreateRecipe.tsx` | full-screen route | Form multi-sección (nombre + macros + ingredientes + instrucciones + fotos). Complejidad justifica scroll independiente. Sheet introduciría doble scroll-chrome. |
| `CreatePost` / `CreateStory` | `src/features/social/screens/` | full-screen route | Social content creation multi-step (media + caption + tags). Full-screen es convención universal. |
| `AddMeal` | `src/features/food/screens/AddMeal.tsx` | full-screen route | Search + list + drill-into detalle alimento es flow profundo. Playbook §4.4.a lo propone como candidato focus-sheet futuro — dejar hasta completar HIGH/MEDIUM. |
| `WeeklyCheckIn` | `src/features/wellness/screens/WeeklyCheckIn.tsx` | full-screen route | History browser + reflection form; reached desde Progress tab. Contexto "Progress atrás" no es relevante al user mientras llena el check-in. |
| `Progress` | `src/features/wellness/screens/Progress.tsx` | full-screen tab | Es **tab de bottom-nav**, no modal — no aplica la decisión sheet vs route. |
| `RealFeelDiary` ("diario diario") | `src/features/wellness/screens/RealFeelDiary.tsx` | full-screen route con `PageShell + PageHeader` | Es un **módulo completo** (timeline histórico + entry form + reflection cards), no acción puntual. Bevel IMG_0973 confirma que Diary se resuelve como **tab/route**, no sheet — el scroll histórico por fecha necesita header sticky y full canvas. **Nota**: los sub-modals internos (add/edit entry) **sí** son candidatos a focus sheet (deferido a Q15). |

##### Patterns Bevel aún NO presentes en RIAL

| Bevel pattern | Captura | Cuándo considerar |
|---|---|---|
| Share-card carrusel | 0975, 0999, 1017 | Q15+ — `<ShareCard>` primitive para export-to-social |
| Modal-stacked-over-Home | 1001 | Q15+ — AI Coach upsell desde Home |
| Process-status sheet 40% | 1013, 1014 | Q6 — ImportRecipeURL + PhotoRecog async status |
| Full-screen post-save confirmation | 0964, 0961 | PR 9 — Onboarding refactor |

#### 4.4.c Decision framework — cuándo NO usar `<BottomSheet>`

Aplicar los **5 criterios en orden**. El primero que matche determina la tipología — no evaluar los posteriores.

**Criterio 1 — ¿Es una tab de bottom-nav o pantalla raíz?**
→ **Route + `<PageShell>`**, NO sheet. Aplica a: Hoy, Cocina, Explora, Progress, Profile, More.

**Criterio 2 — ¿La UX es inmersiva sin contexto detrás?**
Señales: WakeLock activo, auto-advance content, pinch-zoom con canvas total, camera viewport.
→ **Full-screen `fixed inset-0`**, NO sheet. Aplica a: CookMode, StoryViewer, MediaLightbox, BarcodeScanner (camera viewport — el panel de resultados sí puede ser sheet).

**Criterio 3 — ¿Es confirmación corta con 2 CTAs?**
→ **`<ConfirmDialog>` centered**, NO sheet. Aplica a: destructive confirmations, permission prompts cortas, "Are you sure?" flows.

**Criterio 4 — ¿Es flow first-run (onboarding) sin app state detrás?**
→ **Full-screen overlay** `fixed inset-0`. El user no tiene "home" al que volver que preservar como contexto. Aplica a: Onboarding wizard.

**Criterio 5 — ¿Form con > 3 secciones semánticas distintas?**
Ejemplos: CreateRecipe (nombre + macros + ingredientes + instrucciones + fotos), CreatePost (media + caption + tags + recipe link).
→ **Route full-screen**. Sheet de 92vh + scroll interno + sub-secciones introduce scroll dual.

**Si ninguna de las 5 aplica → usar `<BottomSheet>`.** Elegir `size` + `headerLayout` por ADR-009 V2:

- **`size: compact` (88vh)** si el contenido es "elegir algo": picker, toggle group, lista corta, confirm-action.
- **`size: focus` (92vh)** si el contenido es "trabajar en algo": form multi-field, búsqueda con lista larga, input+keyboard, detail-edit, review-before-commit.
- **`headerLayout: title-centered`** — close-X + título + opcional action. Para pickers pick-and-close.
- **`headerLayout: cancel-action`** — "Cancelar" + título + "Siguiente"/"Guardar". Para forms donde el user **descarta cambios** explícitamente.
- **`headerLayout: back-title-action`** — back-chevron + título + action. Para sheets navigation-stack (detail dentro de flow).
- **`hideHandle: true`** solo si keyboard-first (teclado ya comunica "editando") o navigation-stack (back-chevron reemplaza swipe).

### 4.5 Empty states
- **Bevel**: skeleton gris + icon neutro + título + descripción. **Sin CTA**.
- **RIAL hoy**: `EmptyState` tiende a incluir CTA.
- **Decisión**: mantener CTA en empty states **accionables** (home first-time, listas vacías del user). Añadir variant `info` (sin CTA) para sub-sheets informativas. Documentar en `PRIMITIVES.md`.

### 4.6 Badges, pills, chips
- Pill icon + texto con surface-container-low + text negro (Activo/a + 🏃, 24°C + ☁️).
- Lock-pill "Desbloquear con Pro" consistente color en TODOS los paywalls.
- Verified brand check → **defer** (requiere backend verification).

### 4.7 Pricing
Formalizado en **ADR-008**: free-generous core + single premium tier. Timeline temporal ("Hoy / Día 12 / Día 14") narrativiza el trial mejor que "prueba 14 días".

### 4.8 FAB mega-menu
Long-press `+` → action grid 3×3 con 9 acciones icon+label (IMG_0997). Candidato Q15+ separado — requiere rediseñar `BottomNav` `+` + lógica long-press + 9 handlers.

### 4.10 Constantes — `<ConstantTile>` biometric tile (nuevo primitive)

**Hallazgo del re-audit.** Bevel resuelve "constantes biométricas" (VO₂, VFC, FCR, Peso, Masa magra, Grasa corporal) con un **componente uniforme** que se repite en Home (IMG_0976), Constantes tab (IMG_0993, IMG_0994), y secundariamente en sheets de análisis (IMG_0995–0996). La uniformidad es el valor — el user aprende el pattern una vez y lo reconoce en todos los módulos.

**Anatomy (`ConstantTile`):**
- Grid 2 cols `gap-2`, aspect ~1.2:1.
- Top-row: icon 16px left + label 11px uppercase tracking-widest left. Padding `pt-3 px-3`.
- Hero-row: valor grande 24–28 px bold (si data) O "No hay datos" 14 px gris (si empty).
- Sub-row: unidad 12 px gray (si data) O "Sin rango" / "Sin tendencias" 11 px gris caption (si empty).
- Optional bottom-row decorator:
  - Sparkline horizontal de 30 días si trending (IMG_0976 FCR tile).
  - Mini speedometer arc decorativo si no-data pero hay template (IMG_0993 FCR tile).
  - Dot badge "Ha subido / Ha bajado" + bar gauge gradient si valor stable con delta (IMG_0993 Peso tile).
- Borderless en `.theme-*-light`, con `shadow-elev-2` suave.
- Touch target toda la tile (≥44×44 OK dado el aspect); click expande a sheet detalle (focus variant, IMG_0995 pattern).

**Estados canónicos:**
- `loading` — skeleton 3 líneas grises pulsantes.
- `empty-no-template` — "No hay datos / Sin rango".
- `empty-no-data` — "No hay datos / Sin tendencias" + decorator visible (indica que el template existe, solo falta sample).
- `value-stable` — valor + unidad + subtle "estable / mantenido / —".
- `value-trending-up` — valor + unidad + `Ha subido` badge cálido + gauge.
- `value-trending-down` — valor + unidad + `Ha bajado` badge frío + gauge.

**Consumers candidatos RIAL:**
- Progress → Body → Summary sub-tab (HEAD `8c86b40` ya monta `WeightTrendCard` + `RitmoSection` + `LatestReflectionCard`; añadir grid `<ConstantTile>` debajo con [Peso / Masa magra / Grasa corporal / IMC / Cintura / Medidas-personalizadas] — Q15 ICP-adaptive).
- Home secondary rail bajo `ProgressPreviewCard` cuando `featureFlags.homeRingGrid` esté activo (PR 8).
- Settings → Datos (cuando HealthKit se integre post-Q6) con [VO₂ máx / VFC / FC reposo / SpO2].

**Relación con primitivas existentes.**
- `StatTile` actual (`src/components/StatTile.tsx`) es más simple — `label + valor + delta` sin los 6 estados ni los decorators. Dos opciones:
  - (a) **Extender `StatTile`** con variant `constant` + empty states → mismo primitive, más responsabilidades.
  - (b) **Nuevo primitive `ConstantTile`** que compone internamente `StatTile` para el caso simple.
  - **Decisión propuesta para PR 7**: (b) — `ConstantTile` distinto. Razón: el empty-state coherente y los decorators son propios de biométricas; forzar `StatTile` a cubrir ambos sesga el API. Mejor dos primitives bien enfocados que uno ambiguo.

### 4.11 Onboarding design system — `<OnboardingScaffold>` + `<RadioCardGroup>` + `<SelectList>`

**Hallazgo del re-audit.** IMG_0951, 0952, 0953, 0955, 0956, 0957, 0958, 0962, 0964, 0968–0972 revelan **4 step-types canónicos** con un scaffold común:

```
[back-chevron circular top-left + status-bar natural iOS]
[spacer flex]
[hero visual — 3D card / emoji / graph / illustration, centered]
[title 24–28 px bold black, center]
[subtitle 14–15 px medium gray, center, 2 líneas max]
[interactive content — varía por step-type]
[spacer flex]
[primary CTA pill negro full-width]
[optional secondary text-link gray, bajo el CTA]
```

**4 step-types:**
1. **Presentation** (0951, 0952, 0956, 0957, 0964) — hero + title + subtitle + primary CTA. Sin interactivo.
2. **Input single-field** (0955) — hero opcional + pregunta + input underline o pill + primary CTA. Sin chrome/card.
3. **Selection** (0958, 0962) — hero opcional + grupo de cards.
   - **0958** `SelectList` — cards verticales con chevron-right, todas destacadas iguales.
   - **0962** `RadioCardGroup` — cards con label + desc interno + radio visual derecha; uno activo por defecto.
4. **Auth / permission / done** (0953, 0954, 0960, 0961) — similar a presentation pero con CTAs específicos (Apple/Google/HealthKit grant/etc.). Suele llevar stacking nativo (sheet StoreKit superpuesta, IMG_0954).

**Primitives propuestos:**
- `<OnboardingScaffold>` — layout shell con slots `heroSlot`, `title`, `subtitle`, `children` (interactive zone), `primaryCta`, `secondaryLink?`.
- `<RadioCardGroup>` — binary/ternary selector con semantic roles `radiogroup` + `radio`, active-border subtle + `aria-checked`.
- `<SelectList>` — card list con ítems clickables (no radios), chevron-right automático.

**Consumers RIAL actual (`src/features/profile/components/Onboarding.tsx`):**
- El Onboarding existente implementa 5 steps hand-rolled sin primitive compartido.
- Step 5 (paleta picker) ya se rediseñó en PR 3 con un grid 4-tile.
- La migración a `<OnboardingScaffold>` + `<RadioCardGroup>` + `<SelectList>` unificaría los 5 steps bajo el mismo layout, reduciría CSS/markup duplicado, y prepararía el terreno para añadir steps de **HealthKit grant** + **Apple Sign-In** + **permissions camera/notifications** cuando toque integrar (Q6+ Supabase + wearables).

**Decisión propuesta para PR 9** (distinto de PR 6/7/8): refactor Onboarding sin cambiar UX, solo sustituyendo markup por primitives. ROI medio — el sprint Q6 se beneficiará, pero no es bloqueante hoy.

### 4.9 Lo que NO copiamos
- **Anillo-heavy Home**: 3–5 rings simultáneos sobrecargan. RIAL consolida 1–2.
- **Recetas**: Bevel débil, Paprika/Yummly mejor referencia.
- **Glucosa/CGM**: fuera ICP 2026.
- **Monocromo casi total**: solo la paleta `NEUTRAL`. `VOLT`/`OCEAN`/`EMBER` conservan personalidad.

---

## 5. Roadmap de ejecución — 9 PRs

| PR | Scope | Archivos nuevos | Archivos amendment |
|---|---|---|---|
| **1** ✓ shipped (`cc2a30b`) | Docs + ADR foundations | `docs/market/bevel-design-playbook.md`, `docs/adr/ADR-008`, `docs/adr/ADR-009` | `docs/DESIGN-SYSTEM.md`, `docs/NEW-SCREEN-CHECKLIST.md`, `CHANGELOG.md` |
| **2** ✓ shipped (`82d73f8`) | `<BottomSheet>` primitive (compact V1) + 2 consumers pilot | `src/components/ui/bottom-sheet.tsx`, `src/test/conventions/bottom-sheet.test.ts` | `docs/PRIMITIVES.md`, `PortionSheet` (piloto real — sustituye `RecipeDaySelectorSheet`, que no es sheet real), `PublishRecipeSheet` (piloto real — sustituye `MealSlotMultiSelect`, que no es sheet real), `src/test/conventions/primitives-export.test.ts`, `CHANGELOG.md` |
| **3** ✓ shipped (`18938a6`) | 4 paletas × 3 modos (VOLT/OCEAN/EMBER/NEUTRAL × auto/light/dark) — ver §4.1.a | `src/test/conventions/theme-palettes.test.ts` | `src/contexts/ThemeContext.tsx` (rewrite — `{palette, mode}` + matchMedia + legacy migration), `src/index.css` (rename 5 classes + add `theme-volt-dark` combined selector + add `theme-neutral-dark` + `theme-neutral-light` + polish EMBER accent), `src/App.tsx` (consume `themeClassName`/`resolvedMode`), `src/features/profile/components/settings/SettingsAppearance.tsx` (rewrite 2-section picker), `src/features/profile/components/Onboarding.tsx` (4-tile palette step), i18n 13 keys × 2 locales, `docs/DESIGN-SYSTEM.md`, `CHANGELOG.md` |
| **4** ✓ shipped (`4622f76`) | Bevel sheet migrations (scope pivot) | — | `LogSnapshotModal` (radix `Dialog` → `BottomSheet` + footer Cancelar/Guardar + 7×7→44×44 tap target + `text-sm`→tokens), `RecipePicker` (raw div → `BottomSheet` + API `{recipes, onSelect, onClose}` → `{open, onOpenChange, recipes, onSelect}`), `CreateModal` (radix `Dialog` → `BottomSheet`, preserva `{isOpen, onClose, onSelect}` externo), `ShareSheet.tsx` **eliminado** (0 consumers — dead code desde feature inception), `CreatePost.tsx` + `CreateStory.tsx` (actualizan consumers de `RecipePicker` a controlled-open). **Scope pivot vs plan:** los 5 consumers originales (`PhotoUploader`/`AddMeal`/`ImportRecipeURL`/`BarcodeScanner`) resultaron ser no-sheets tras auditoría. |
| **5** ✓ shipped (`8c86b40`) | 7d EMA weight-trend overlay + Progress Body sub-tabs (scope pivot) | `src/test/conventions/weight-ema.test.ts` | `src/features/wellness/utils/weight-trend.ts` (+ `EMA_ALPHA_7D` + `calcEmaSeries` + extend `WeightTrend`), `src/features/wellness/components/WeightTrendCard.tsx` (rewrite API + 3-layer SVG overlay + delega `onLog`), `src/features/wellness/screens/Progress.tsx` (Body `SegmentedTabs` summary/history/calendar), i18n 7 keys × 2 locales, `CHANGELOG.md`. **Scope pivot vs plan:** originalmente Home ring-grid → consolidar el trabajo EMA uncommitted del owner (MacroFactor/Yazio semantics). Home ring-grid deferido a PR 8. |
| **6** ← **next** | `<BottomSheet>` **focus variant** (ADR-009 V2) — sin migrar consumers | — | `src/components/ui/bottom-sheet.tsx` (añade `size: 'compact'\|'focus'`, `hideHandle`, `headerLayout`), `src/test/conventions/bottom-sheet.test.ts` (expande a ambas variantes + 3 header layouts), `docs/PRIMITIVES.md` (tabla + ejemplo), `docs/adr/ADR-009-bottom-sheet-anatomy.md` (V2 addendum), `CHANGELOG.md` `[1.5.35]`. Consumer migrations se defieren a PR 6.5 (selectivas por beneficio UX, no blanket). |
| **7** | `<ConstantTile>` biometric tile primitive + Progress Body grid | `src/components/ConstantTile.tsx`, `src/test/conventions/constant-tile.test.ts` | `src/features/wellness/screens/Progress.tsx` (monta grid bajo `WeightTrendCard` en Body→Summary), `docs/PRIMITIVES.md`, i18n keys para los 6 estados canónicos, `CHANGELOG.md` `[1.5.36]`. Ver §4.10. |
| **8** | Home ring-grid consolidation (IMG_0974 pattern) tras feature flag | `src/lib/featureFlags.ts` | `src/features/home/screens/Home.tsx` (layout opt-in 1-3 anillos Bevel-style bajo `featureFlags.homeRingGrid`, fallback al layout actual), `NutritionHero`/`ProgressPreviewCard` (respect flag), `CHANGELOG.md` `[1.5.37]`. |
| **9** | Onboarding refactor — `<OnboardingScaffold>` + `<RadioCardGroup>` + `<SelectList>` | `src/components/OnboardingScaffold.tsx`, `src/components/RadioCardGroup.tsx`, `src/components/SelectList.tsx`, `src/test/conventions/onboarding-primitives.test.ts` | `src/features/profile/components/Onboarding.tsx` (5 steps migrados — UX igual, markup unificado), `docs/PRIMITIVES.md`, `CHANGELOG.md` `[1.5.38]`. Ver §4.11. |

Governance: trabajar directamente en `main`. Cada PR = commit(s) + `release:preflight` verde + push a `rial-food/main` tras aprobación explícita del user ("continua").

---

## 6. Verificación end-to-end (post PR 5 shipped)

```bash
npm run release:preflight
# tsc + lint + lint:code + check:i18n + test + build + size:check

preview_start
# 8 combinaciones theme (4 paletas × 2 modos) × pantallas clave
# Sheets abiertas en cada theme → status bar visible detrás
```

Baselines medidas post-PR5 (`8c86b40` in sync con `rial-food/main`):
- TypeScript: 0 errors.
- Tests: **589/589** (+9 vs PR 4 — 8 del convention `weight-ema.test.ts` + 1 expansión Progress).
- i18n symmetry: **1530** (1523 → 1530, +7 keys × 2 locales en PR 5).
- Design-system lint: 0 errors, warnings pre-existentes.
- Build: main **774.4 KB raw / 242.4 KB gzip** (+1.2 KB raw vs PR 4), `size:check` PASS.
- SectionCard drift: **0** (sin cambio post Q16-B2).
- ESLint Q16 allowlist: **5** files shadcn-only (sin cambio).

Foco próximo (PR 6): extender `<BottomSheet>` con `size="focus"` sin migrar consumers todavía. El convention test debe validar ambas variantes y los 3 `headerLayout` antes de que cualquier consumer los use, de modo que las migraciones PR 6.5+ tengan un guardrail en CI desde el primer commit.

---

## 7. Fuentes

- Capturas: `docs/market/Competitor Images/Bevel/Imágenes app/` (IMG_0951–IMG_1019).
- Deep-dive descriptivo: `docs/market/deep-dives/bevel.md`.
- Doctrina general competidores: `docs/market/ux-patterns.md`, `docs/market/rial-positioning.md`.
- Sistema RIAL actual: `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/adr/ADR-001` a `ADR-007`.
