# Bevel Design Playbook

> Accionable. Complemento del deep-dive (`deep-dives/bevel.md`, descriptivo) y la doctrina transversal (`ux-patterns.md`).
>
> Alcance: extraer las prácticas de diseño visible en 64 capturas Bevel (IMG_0951–IMG_1019) que merece la pena **copiar, adaptar o descartar** para RIAL. Enfocado a `.theme-light` como "color 1" de referencia.
>
> Última revisión: 2026-04-17. Capturas en `docs/market/Competitor Images/Bevel/Imágenes app/`.

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
| Handle bar + `rounded-t-3xl` + sheet no-full-height | 0984–0990 / 1004–1009 | **Copy** | nuevo `<BottomSheet>` (ADR-009) |
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

## 3. Catálogo de capturas (50 de 64 leídas)

Agrupadas por tipología con IMG más legible del patrón.

### A. Onboarding + science explainers
- **IMG_0951** splash minimalista: logotipo fantasma + paginador dots + CTA negro full-width.
- **IMG_0952** card 3-D "Fitness" (BPM + timer + peso muerto). Título + subtítulo + demo-card + dots + CTA.
- **IMG_0955** pregunta única centrada ("¿Cuál es tu nombre de pila?") con campo underline. Sin card, sin chrome.
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
- **IMG_1011–1012 / 1018** "¿Qué comes?" free-text + CTAs `Tomar foto` / `Importar foto` + badge counter. Sheet ~80%.
- **IMG_1016** edit-meal (pizza) con macros hero + donut + ingredientes + toolbar `Eliminar` / `Guardar`.

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
Formalizado en **ADR-009**. Anatomy:
- **Max height** `88vh` (deja ~80 px fondo visible, status bar + dynamic island visibles).
- **Top radius** `rounded-t-3xl` (24 px).
- **Handle bar** pill 4×32 px gris centrado, ~8 px del borde.
- **Header sticky** con X izquierda + título centrado + acción derecha (slot). Padding 16 px vertical.
- **Overlay** `bg-black/25` (no 50%).
- **Contenido scrollable** dentro del sheet; el sheet no crece.
- **Cierre** tap overlay + swipe down handle + botón X.
- **Stacking** soportado nativamente por radix (paywall → sheet → StoreKit como IMG_1010).

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

### 4.9 Lo que NO copiamos
- **Anillo-heavy Home**: 3–5 rings simultáneos sobrecargan. RIAL consolida 1–2.
- **Recetas**: Bevel débil, Paprika/Yummly mejor referencia.
- **Glucosa/CGM**: fuera ICP 2026.
- **Monocromo casi total**: solo `.theme-light`. VOLT/OCEAN/EMBER conservan personalidad.

---

## 5. Roadmap de ejecución — 4 PRs

| PR | Scope | Archivos nuevos | Archivos amendment |
|---|---|---|---|
| **1** | Docs + ADR foundations | `docs/market/bevel-design-playbook.md`, `docs/adr/ADR-008`, `docs/adr/ADR-009` | `docs/DESIGN-SYSTEM.md`, `docs/NEW-SCREEN-CHECKLIST.md`, `CHANGELOG.md` |
| **2** | `<BottomSheet>` primitive + 2 consumers pilot | `src/components/ui/bottom-sheet.tsx`, `src/test/conventions/bottom-sheet.test.ts` | `docs/PRIMITIVES.md`, `RecipeDaySelectorSheet`, `MealSlotMultiSelect`, `CHANGELOG.md` |
| **3** | `.theme-light` Bevel-tune | — | `src/index.css` (bloque `.theme-light`), `SectionCard.tsx`, `docs/DESIGN-SYSTEM.md` §1.5, `CHANGELOG.md` |
| **4** | Migration + Home hero consolidation | — | 5 consumers a BottomSheet (`PhotoUploader`, `LogSnapshotModal`, `AddMeal`, `BarcodeScanner`, `ImportRecipeURL`), `Home.tsx` hero consolidation (feature-flagged), `docs/ai/state.md` |

Governance: trabajar directamente en `main`. Cada PR = commit(s) + `release:preflight` verde + push a `rial-food/main` tras aprobación explícita del user ("continua").

---

## 6. Verificación end-to-end (post PR 4)

```bash
npm run release:preflight
# tsc + lint + lint:code + check:i18n + test + build + size:check

preview_start
# 3 themes × 5 pantallas clave:
#   VOLT dark (default)     → verificar NO regresa
#   .theme-light            → verificar look Bevel aplicado
#   .theme-blue-light       → personalidad OCEAN conservada
# Sheets abiertas en cada theme → status bar visible
```

Baselines esperadas post-PR4:
- SectionCard drift 22 → ≤10 (objetivo <5).
- ESLint Q16 allowlist 18 → <10.
- i18n 1499 → +3–6 (BottomSheet labels default si los hay).
- Tests 556 → +3–5 (convention BottomSheet + regresión Home hero).
- WCAG AA contrast en `.theme-light` sigue pasando.

---

## 7. Fuentes

- Capturas: `docs/market/Competitor Images/Bevel/Imágenes app/` (IMG_0951–IMG_1019).
- Deep-dive descriptivo: `docs/market/deep-dives/bevel.md`.
- Doctrina general competidores: `docs/market/ux-patterns.md`, `docs/market/rial-positioning.md`.
- Sistema RIAL actual: `docs/DESIGN-SYSTEM.md`, `docs/PRIMITIVES.md`, `docs/adr/ADR-001` a `ADR-007`.
