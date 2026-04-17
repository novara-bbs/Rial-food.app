# Feature matrix — RIAL × 18 competidores Tier A

> Matriz síntesis agregando las 16 filas de comparación de cada ficha `deep-dives/<app>.md`. Cambios aquí requieren propagar a la ficha correspondiente (y viceversa).
> Última revisión: **2026-04-17**.
>
> **Priorización 2026**: de los 18 tier-A, 8 son foco profundo — ver [`priority-review.md`](priority-review.md) para scorecard + razonamiento. La matriz sigue siendo útil como referencia feature-a-feature en las 18 apps; las decisiones de producto deben salir del Top 8 priorizado.

## Leyenda

| Símbolo | Significado |
|---|---|
| **✓** | Feature cumplida con solvencia, parte central del producto |
| **⦿** (parcial) | Existe pero limitada, detrás de paywall, o ejecutada pobremente |
| **✗** | No existe (o existe tan anecdótica que no cuenta) |
| **—** | No aplica (out of scope explícito, p.ej. wearable en app software-only) |

Cada celda enlaza conceptualmente a la ficha del competidor; para detalle cualitativo ver `deep-dives/<app>.md`.

## Matriz principal — 16 features RIAL × 18 apps Tier A + RIAL

### Tracking calórico / macros core

| Feature | RIAL | MFP | Cal AI | Lifesum | Yazio | Fitia | Cronometer | MacroFactor | MyRealFood |
|---|---|---|---|---|---|---|---|---|---|
| Tracking macros (P/C/G) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Recetas propias (creación) | ✓ | ⦿ | ✗ | ⦿ | ⦿ | ✓ | ⦿ | ✗ | ✓ |
| Multi-media recetas (fotos+video) | ✓ | ⦿ | ✗ | ⦿ | ⦿ | ⦿ | ✗ | ✗ | ✓ |
| Import recetas URL | ⦿ | ⦿ | ✗ | ⦿ | ⦿ | ✗ | ✗ | ✗ | ✗ |
| Barcode scanner | ✓ | ⦿ (pago) | ✗ | ✓ | ✓ | ✓ | ✓ | ⦿ | ✓ |
| Photo recognition comida | ✗ | ✓ (vía Cal AI) | ✓ | ✓ | ⦿ | ⦿ | ✗ | ✗ | ⦿ |
| Planner semanal (MealSlot) | ✓ | ⦿ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ⦿ |
| Batch cooking logic | ⦿ | ✗ | ✗ | ✗ | ✗ | ⦿ | ✗ | ✗ | ⦿ |
| Ayuno intermitente integrado | ✓ | ✓ (via Zero) | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| AI Coach contextual | ⦿ | ⦿ | ⦿ | ⦿ | ✗ | ⦿ | ✓ (Oracle) | ⦿ | ✗ |
| Social / creator content | ⦿ | ⦿ | ✗ | ✗ | ✗ | ⦿ | ⦿ | ✓ | ✓ |
| Progreso fotos (Body snapshot) | ✓ | ✓ | ✗ | ⦿ | ✓ | ✓ | ⦿ | ✓ | ⦿ |
| Pantry / despensa | ✓ | ✗ | ✗ | ✗ | ⦿ | ⦿ | ✗ | ✗ | ✗ |
| Shopping list auto | ✓ | ⦿ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Wellness (Real Feel / mood) | ✓ | ✗ | ✗ | ⦿ | ⦿ | ✗ | ✗ | ✗ | ⦿ |
| Wearable integration | ⦿ (pend Q22) | ✓ | ✗ | ✓ | ✓ | ⦿ | ✓ | ⦿ | ⦿ |

### Planner / recetas especializados + Ayuno + Wellness/All-in-one

| Feature | RIAL | Mealime | Eat This Much | Paprika | PlateJoy | Fastic | Zero | Noom | Yuka | Whoop | Bevel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Tracking macros (P/C/G) | ✓ | ⦿ | ✓ | ✗ | ⦿ | ⦿ | ✗ | ✓ (color) | ✗ | ⦿ | ✓ |
| Recetas propias (creación) | ✓ | ⦿ | ⦿ | ✓ (core) | ⦿ | ⦿ | ✗ | ⦿ | ✗ | ✗ | ⦿ |
| Multi-media recetas (fotos+video) | ✓ | ⦿ | ⦿ | ✓ | ⦿ | ✗ | ✗ | ✗ | ✗ | ✗ | ⦿ |
| Import recetas URL | ⦿ | ✗ | ⦿ | ✓ (core) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Barcode scanner | ✓ | ✗ | ⦿ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ (core) | ✗ | ✓ |
| Photo recognition comida | ✗ | ✗ | ✗ | ✗ | ✗ | ⦿ | ✗ | ✓ | ⦿ | ✗ | ⦿ |
| Planner semanal (MealSlot) | ✓ | ✓ | ✓ (core) | ✓ | ✓ (core) | ⦿ | ✗ | ⦿ | ✗ | ✗ | ⦿ |
| Batch cooking logic | ⦿ | ⦿ | ✓ | ⦿ | ⦿ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ayuno intermitente integrado | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ (core) | ✓ (core) | ✗ | ✗ | ✗ | ⦿ |
| AI Coach contextual | ⦿ | ✗ | ⦿ | ✗ | ⦿ | ⦿ | ⦿ | ⦿ (humano) | ✗ | ⦿ | ✓ (core) |
| Social / creator content | ⦿ | ✗ | ✗ | ✗ | ✗ | ⦿ | ⦿ | ⦿ | ⦿ | ⦿ | ⦿ |
| Progreso fotos (Body snapshot) | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ⦿ | ✓ | ✗ | ⦿ | ✓ |
| Pantry / despensa | ✓ | ✗ | ⦿ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Shopping list auto | ✓ | ✓ (core) | ✓ (Instacart) | ✓ | ✓ (core) | ✗ | ✗ | ✗ | ✗ | ✗ | ⦿ |
| Wellness (Real Feel / mood) | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ (mood) | ⦿ | ✓ (CBT) | ✗ | ✓ (strain/recovery) | ✓ |
| Wearable integration | ⦿ | ✗ | ⦿ | ✗ | ⦿ | ⦿ | ⦿ | ⦿ | ✗ | ✓ (device propio) | ✓ |

## Lectura de la matriz

### Features donde RIAL ya está en el top-percentil de su cohorte

- **Recetas propias + multi-media**: Post Fase 1 + Fase 2 (`58aa9c7` + `dd22be8`), RIAL tiene multi-media con hero carrusel + lightbox + video híbrido + uploader compresor. **Solo Paprika y MyRealFood tienen paridad real**; el resto son parciales o inexistentes.
- **Planner + MealSlot multi-valued (Q19)**: RIAL + Paprika + PlateJoy son los únicos 3 con esa abstracción correcta (`suitableFor[]`). Lifesum/Yazio/Fitia usan `mealType` single-valued (limitación).
- **Wellness (Real Feel diary)**: RIAL tiene el sistema más estructurado entre apps nutrición. Sólo Whoop + Bevel cubren wellness seriamente, pero por la vía biomarker, no diario subjetivo.
- **Pantry / despensa**: RIAL + Paprika = los únicos con despensa dedicada. Critical diferenciador Ana (family planner).
- **Ayuno intermitente integrado**: RIAL + Lifesum + Yazio + Fitia + Fastic + Zero. RIAL no tiene que construir este feature — solo debe asegurar que Fasting Timer se integra con Real Feel y Progress.

### Features donde RIAL tiene gap a cerrar (orden de prioridad)

1. **Photo recognition comida** — gap vs MFP (post Cal AI acquisition), Lifesum, Noom. No es path a moat pero es feature-of-parity si RIAL quiere top-10 US/UK.
2. **AI Coach contextual** — hoy genérico (Gemini proxy sin context injection). Simple + Bevel + Cronometer Oracle muestran el estándar. Ver `rial-positioning.md` moat #4.
3. **Wearable integration** — RIAL lee Apple Health parcial; debe extender a Samsung Health + Google Fit + Oura export. Gate para mercado DACH y user Whoop/Oura.
4. **Shopping list integration (Instacart/Walmart)** — Eat This Much + Fitia + PlateJoy tienen conexión checkout. RIAL tiene lista generada pero sin click-to-buy. Defer post-ES launch (integraciones ES = Mercadona online / Carrefour).
5. **Batch cooking logic profunda** — Ollie (no Tier A v1) lidera con "Monday chicken → Wednesday soup". RIAL tiene batch cooking básico (Q3) pero no leftover-reuse inteligente.

### Features donde RIAL NO debería invertir (no defensibles)

- **Barcode scan mejorado** — ya es commodity; OpenFoodFacts cubre 90% casos.
- **Nutrient database extensa 80+ micronutrients** — Cronometer dominates, requiere USDA-level curation.
- **Integración CGM / biomarker hardware** — out of scope; integrar como lector pasivo (Apple Health) es suficiente.
- **Creator platform UGC masivo** — Cookpad / MyRealFood tienen ya escala; imitar es perder. RIAL puede destacar creadores ES puntuales sin construir red social.

## Matriz agregada — "qué app tiene más paridad con RIAL"

Ranking por número de features cumplidas (✓) de las 16:

| # | App | Features ✓ | Features ⦿ | Features ✗ | Threat level |
|---|---|---|---|---|---|
| 1 | **RIAL** | 13 | 3 | 0 | — (referencia) |
| 2 | Lifesum | 10 | 5 | 1 | Alto — EU tracker + ayuno + AI multi-modal |
| 3 | Yazio | 10 | 5 | 1 | Alto — home DACH, expansión global |
| 4 | Fitia | 10 | 5 | 1 | Medio-alto — LatAm líder, home PE |
| 5 | MyRealFood | 9 | 5 | 2 | Alto — único competidor ES con identidad real-food |
| 6 | MyFitnessPal | 9 | 4 | 3 | Alto — universal leader + Cal AI |
| 7 | Bevel | 8 | 7 | 1 | Alto — all-in-one modelo aspiracional |
| 8 | Eat This Much | 7 | 5 | 4 | Medio — planner fuerte pero sin wellness |
| 9 | Paprika | 6 | 2 | 8 | Medio — recetario puro, no tracker |
| 10 | PlateJoy | 6 | 5 | 5 | Medio — planner premium US |
| 11 | Cronometer | 6 | 4 | 6 | Bajo — nicho quantified-self |
| 12 | MacroFactor | 5 | 4 | 7 | Bajo — nicho fitness |
| 13 | Noom | 5 | 6 | 5 | Medio — brand + GLP-1 arm |
| 14 | Mealime | 5 | 3 | 8 | Bajo — simplicidad deliberada |
| 15 | Fastic | 5 | 4 | 7 | Bajo — ayuno focus |
| 16 | Cal AI | 4 | 2 | 10 | Medio — post acquisition diluirá |
| 17 | Whoop | 3 | 5 | 8 | Bajo directo pero alto adyacente |
| 18 | Zero | 2 | 3 | 11 | Muy bajo — feature único ayuno |
| 19 | Yuka | 2 | 2 | 12 | Bajo directo pero reshape category |

**Conclusión:** los 5 **mayores threats** por paridad + brand + GTM son **Lifesum, Yazio, MyRealFood, MFP, Bevel**.
MyRealFood es el threat #1 en ES (único con identity overlap directo).

## Cómo mantener esta matriz

- **Trigger update:** cada vez que se actualiza una ficha `deep-dives/*.md` con un cambio de capability.
- **Source of truth:** la tabla de Comparación con RIAL en cada ficha. Esta matriz es agregación, no fuente.
- **Validación automática propuesta (futuro):** un script `scripts/check-market-matrix.mjs` que parsee cada ficha y compare con esta matriz. Pospuesto — valor marginal hasta que la matriz esté en uso activo.
- **Snapshot:** re-validar cada 6 meses mínimo. Una ficha actualizada fuera de ciclo fuerza re-review de su fila aquí.

## Referencias

- Clasificación por tier: [`competitors-index.md`](competitors-index.md)
- Patrones concretos a copiar / evitar: [`ux-patterns.md`](ux-patterns.md)
- Rankings actuales: [`app-store-rankings.md`](app-store-rankings.md)
- Posicionamiento y ICP: [`rial-positioning.md`](rial-positioning.md)
- Fichas individuales: [`deep-dives/`](deep-dives/)
