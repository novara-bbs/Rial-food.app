# INDYA Design Playbook

> Accionable. Complemento del índice (`competitors-index.md`) + matriz (`feature-matrix.md`). Alcance: extraer las prácticas de diseño observables en 33 capturas de INDYA (IMG_1199–IMG_1232, falta IMG_1207) que merece la pena **copiar, adaptar o descartar** para RIAL.
>
> Última revisión: 2026-04-19 PM. Capturas en `docs/market/Competitor Images/INDYA/`.

---

## 1. Identidad

**INDYA** es una app de **coaching nutricional personalizado humano-led en español**, basada en suscripción (59€/mes · 139€/3m · 249€/6m). La identidad del producto no es "track calories" ni "browse recipes" sino **"tu nutricionista te entrega un plan a medida vía app"**. Las capturas muestran un onboarding extenso (11-13 steps con progress bar chunked) que alimenta a un nutricionista humano, no a un algoritmo:

- **IMG_1232** — Paywall con features: `Videoconsulta cada mes` · `Chat ilimitado` · `Plan nutricional + lista de la compra` · `Reajustes inteligentes + sincro apps`.
- **IMG_1205 / 1215** — Datos fisiológicos + cálculo kcal transparente (basal 1686, actividad 759, entrenamientos 0, objetivo +400 → rango 2646-3044 kcal).
- **IMG_1210 / 1225** — Configuración de **horarios de ingesta** (4 comidas: Desayuno 08:30 / M. Mañana 10:30 / Comida 14:00 / Cena 21:00) + planner semanal con taxonomía `Tupper` / `Comida libre` / `Sin comida`.
- **IMG_1220 / 1230** — Taxonomía "Alimentos prohibidos y favoritos" (por categoría) + free-text final "Tus notas" para supplementos/medicación.

**Recipe-relevance para RIAL: LOW.** No hay biblioteca de recetas visible, no hay cook mode, no hay step-by-step. La app delega la producción del plan al nutricionista humano. Las 33 capturas son todas de onboarding + paywall + settings pre-plan.

**Sí hay valor táctico** en 3 áreas ortogonales al recipe-sprint: (a) taxonomía fina de preferencias alimentarias (prohibido/favorito por alimento, patrón 0-1-2 trinario), (b) configuración de horarios de ingesta como primary UX, (c) paywall con features concretas sobre imagen humana. Estos patrones son referencia para sprints futuros (Q6 meal schedule + Q17 paywall copy + Q19 meal taxonomy), **no** para R2-R7 recipe-sprints.

### 1.1 Design system observable

| Token | Valor INDYA | Comparación RIAL |
|---|---|---|
| `--background` | `#000000` / `#0a0a0a` (dark-only, no light mode visible) | RIAL 4 paletas × 2 modos |
| `--primary` | `#2563eb` (azul royal vivo) | RIAL VOLT usa lime, NEUTRAL black, EMBER amber — azul no está |
| `--accent-brand` | `#2563eb` único accent | RIAL dual-accent por paleta |
| Fuente título | Italic oblique bold serif-ish display (parece Lora/Playfair Italic o DM Serif Italic) | RIAL Inter + JetBrains Mono — sin italic editorial |
| Fuente body | Sans neutra (probable Inter / Manrope) | RIAL Inter |
| Radius card | `16–20 px` consistente | RIAL `rounded-sm` (4px) + `rounded-lg` (16px) |
| Radius pill CTA | full round | Idéntico |
| Progress bar onboarding | Chunked en N segmentos (11-13) con fill solid blue | RIAL dots + lineal |
| Iconografía | Line-icons 20-22px simples | Compatible con Lucide |

### 1.2 Wordmark

`INDYA` wordmark bold con el glifo de la D/Y deformados (corte oblique en la D, Y con stroke partido) — sugiere branding "training-adjacent" (sports coaching crossover). No replicar — RIAL tiene su propia identidad.

---

## 2. Matriz Copy / Adapt / Skip

| Patrón INDYA | Referencia | Decisión | Dónde (si aplica) |
|---|---|---|---|
| Onboarding 11-13 steps progress-chunked | IMG_1210 / 1230 | **Skip** | RIAL onboarding 6 steps está deliberadamente más corto; INDYA es largo porque alimenta humano |
| Paywall con foto humana + features concretas + pricing tiers + ahorro% pill | IMG_1232 | **Adapt** | `RialPlus.tsx` ya tiene estructura similar. Adoptar pill "Ahorra 30%" en plan anual si no existe |
| Taxonomía prohibido/favorito por alimento (disable ⊘ / star ★ trinario) | IMG_1220 | **Adapt** | `SettingsNutrition.tsx` likes/dislikes hoy tiene 2 estados (list liked + list disliked); trinario por alimento es cleaner |
| Categorías expandibles (Carnes 1/1 v, Pescados 0/0 >) | IMG_1220 | **Copy** | Pattern reusable con `<Accordion>` shadcn ya disponible |
| Calendar weekly planner 7×N grid con slots color-coded por type | IMG_1225 | **Adapt** | `Planner.tsx` existing — refinar con color-coded chips (Tupper/Free/Skip) |
| Horarios de ingesta custom con N comidas (3-7) + time picker por comida | IMG_1210 | **Copy** | `SettingsNutrition.tsx` mealSchedule editable — hoy RIAL tiene 4 slots fijos |
| Integración Apple Salud toggle en onboarding | IMG_1205 | **Adapt** | Defer Q6 cuando HealthKit se integre |
| Kcal cálculo transparente (basal + actividad + entrenamientos + objetivo = rango) | IMG_1215 | **Adapt** | `SettingsNutrition.tsx` macros section — añadir breakdown visible |
| "Tus notas" free-text para supplements/medicación | IMG_1230 | **Copy** | `SettingsProfile.tsx` — añadir textarea opcional (defer — non-MVP) |
| "Empieza un reto" con deporte + título custom | IMG_1200 | **Skip** | RIAL tiene `Challenges.tsx` con approach distinto (curated list) |
| Italic display serif para titles | IMG_1199 / 1210 / 1230 | **Skip** | Colisiona con el posicionamiento editorial de Kitchen Stories (R2 verified-only serif) |
| Dark-only theme sin light | global | **Skip** | RIAL 4 paletas × 2 modos shipped |
| "Comida libre" taxonomía cultural (ES fitness) — treat-meal explícito | IMG_1225 | **Copy** | Concepto útil en planner RIAL. Añadir `MealType = 'free-meal'` variante en Q19 tag-taxonomy sprint |
| Pricing con "Te sale a 41,50€/mes" micro-copy | IMG_1232 | **Copy** | `RialPlus.tsx` — copy-pattern universal para long-tier plans |
| Logo wordmark top-center dentro del status bar header | global | **Skip** | RIAL usa `GlobalHeader` con nav |
| Patologías dropdown médicas en onboarding | IMG_1199 copy | **Skip** | RIAL no hace claims médicos (compliance) |
| Conciliar plan con otra persona (multi-user shared) | IMG_1225 | **Skip** | Multi-user account es feature premium de plataformas coach-led; RIAL single-user V1 |

---

## 3. Principios destilados

### 3.1 Onboarding como data-capture para humano vs algoritmo

INDYA captura en onboarding variables que un humano procesa (patologías, supplementación, estructura semanal pref, prohibidos/favoritos por alimento). RIAL captura variables que un algoritmo procesa (objetivo, peso, actividad level). **No copiar la extensión del onboarding** — hacerlo aumenta fricción sin beneficio algorítmico. **Sí copiar** la taxonomía trinaria prohibido/favorito cuando Q19 refactor de tag-taxonomy ocurra.

### 3.2 Paywall: foto humana + pricing tier split + micro-copy mensual

IMG_1232 es la **mejor captura de paywall en el inventario** (35+ competidores). Tres decisiones:
1. **Foto humana ocupa ~40% viewport** — el nutricionista en persona, no ilustración. Transmite "humano detrás del plan".
2. **3 tiers visible sin scroll** (1/3/6 meses) — no hay "monthly vs yearly" toggle, todo es upfront.
3. **Micro-copy "Te sale a N€/mes"** abajo de cada precio + pill "Ahorra X%" — matemáticas hechas.

**Aplicabilidad RIAL**: `RialPlus.tsx` ya ships monthly + yearly. Adoptar (a) pill "Ahorra X%" si no existe, (b) copy "Te sale a N€/mes" para el anual. Skip la foto humana (RIAL no tiene nutricionista humano detrás — generaría expectación falsa).

### 3.3 Horarios de ingesta configurables

RIAL hoy tiene 4 slots canónicos fijos (breakfast/lunch/dinner/snack). INDYA permite elegir **N comidas de 3 a 7** con **time picker por comida**. Es feature legítima para usuarios con rutinas específicas (shift work, entrenamiento muy temprano, fasting windows). **No es prioridad R2-R7** pero queda documentado para Q6+ (Supabase sprint, cuando se toca `AppStateContext.mealSchedule`).

### 3.4 Taxonomía prohibido/favorito por alimento

IMG_1220 muestra un acordeón por categoría (Carnes, Pescados, ...) con cada alimento con dos iconos a la derecha: `⊘` (prohibido, tinta roja) y `★` (favorito, tinta verde). Estado trinario (neutral / prohibit / favorite). RIAL hoy tiene dos listas planas (liked + disliked) en `SettingsNutrition`. **El patrón INDYA es más escaneable** (list-view vs tag-search). Aplicable a RIAL cuando Q19 tag-taxonomy refactor se haga, no ahora.

---

## 4. Lo que NO copiamos

- **Italic display serif** para titles — choca con la decisión §9.2 R1.1 del Kitchen Stories playbook (serif es verified-only, y serif oblique italic es más editorial que Kitchen Stories).
- **Dark-only theme** — RIAL 4 paletas × 2 modos shipped.
- **Onboarding >10 steps** — fricción sin ROI algorítmico.
- **Plan conciliado multi-persona** — feature de coach-plataforma.
- **Patologías médicas dropdown** — compliance risk (RIAL no hace claims médicos).
- **Apple Salud toggle on-boarding step** — defer Q6+ HealthKit integration.

---

## 5. Roadmap de ejecución (no hay — LOW recipe-relevance)

Este playbook **no alimenta sprints R2-R7** (plan `revisa-todas-las-capturas-ancient-micali.md`). Los 3 patrones útiles son ortogonales:

- **RialPlus paywall polish** (adoptar pill "Ahorra %" + "Te sale a N€/mes") — Q17+.
- **MealSchedule configurable** (3-7 comidas + time picker) — Q6+.
- **Taxonomía trinaria prohibit/favorite por alimento** — Q19 continuation.

Ninguno de los 3 entra en el scope R2-R7 recipe/cooking/diccionario. Se dejan documentados para backlog futuro.

---

## 6. Fuentes

- Capturas: `docs/market/Competitor Images/INDYA/` (IMG_1199–1232, falta IMG_1207).
- Playbooks hermanos: `kitchen-stories-design-playbook.md`, `bevel-design-playbook.md`.
- Índice: `competitors-index.md`.

---

## 7. Notas para reviewer

- **INDYA no entra en Tier A** ni como amenaza recipe-side — es un competidor Tier B (coach-led nutrition plan) más próximo a Noom / Simple que a MyFitnessPal / Yazio. Añadir a `competitors-index.md` Tier B4 "Coach-led nutrition plan (ES market)".
- **Pricing benchmark España**: 59€/mes es ~3× el ARPU de RIAL Plus previsto (ADR-008). Signal de techo alto en mercado ES para apps nutrición con valor percibido de "nutricionista humano". RIAL debería apuntar a una fracción de ese precio con AI Coach + content curado.
- **Italic display serif** es tentación — skip firme. Kitchen Stories serif + INDYA italic serif = two serifs = brand confusion.
