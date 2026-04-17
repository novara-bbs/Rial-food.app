# docs/market/ — RIAL competitive intelligence

Capa **viva** de inteligencia de mercado para RIAL. Separada de `docs/archive/` (snapshots históricos 2026-Q1, no se mantienen) para que las agentes y humanos puedan consultarla sin cargar material obsoleto.

**Snapshot vigente:** 2026-04-17. Próxima re-snapshot de rankings: 2026-07-17.

## Cómo leer esta carpeta

Esta carpeta está diseñada para **cargar por demanda**. No la importan automáticamente `CLAUDE.md`, `AGENTS.md`, ni `docs/ai/*` — se consulta cuando la tarea menciona competidores, benchmark UX, o ranking.

Pregunta típica → archivo que responde:

| Pregunta | Archivo |
|---|---|
| ¿Quiénes son nuestros competidores? | [`competitors-index.md`](competitors-index.md) |
| ¿Cuáles **merecen revisión profunda y por qué**? | [`priority-review.md`](priority-review.md) |
| ¿Qué apps están subiendo en App Store / Play Store? | [`app-store-rankings.md`](app-store-rankings.md) |
| ¿Quién hace la feature X (barcode, batch cooking, ayuno…)? | [`feature-matrix.md`](feature-matrix.md) |
| ¿Qué patrón UX copiar / evitar? | [`ux-patterns.md`](ux-patterns.md) |
| ¿Cuál es nuestro posicionamiento y qué gaps defendemos? | [`rial-positioning.md`](rial-positioning.md) |
| ¿Cómo funciona la app X en detalle (hard metrics + pantallas)? | [`deep-dives/<app>.md`](deep-dives/) |

## Estructura

```
docs/market/
├── README.md                  ← este archivo
├── competitors-index.md       ← 35 apps clasificadas (Tier A directos / B indirectos / C adyacentes)
├── priority-review.md         ← scorecard 6 ejes → Top 8 + implicaciones RIAL (2026-04-17)
├── feature-matrix.md          ← matriz features-RIAL × top apps (✓ / parcial / ✗)
├── ux-patterns.md             ← patrones reutilizables: qué copiar, qué evitar
├── app-store-rankings.md      ← snapshot rankings US + ES + DE + UK + LatAm
├── rial-positioning.md        ← ICP, gaps defensibles, MVP mínimo, diferenciadores
└── deep-dives/                ← 18 fichas detalladas (las 8 top llevan Hard metrics + Pantallas principales + mapeo RIAL)
    ├── myfitnesspal.md
    ├── lifesum.md
    ├── yazio.md
    ├── fitia.md
    ├── cal-ai.md
    ├── cronometer.md
    ├── macrofactor.md
    ├── myrealfood.md
    ├── noom.md
    ├── fastic.md
    ├── zero-fasting.md
    ├── yuka.md
    ├── mealime.md
    ├── eat-this-much.md
    ├── paprika.md
    ├── platejoy.md
    ├── whoop.md
    └── bevel.md
```

## Plantilla de ficha deep-dive

Todas las fichas siguen el mismo esqueleto para que la matriz se pueda regenerar automáticamente y los agentes sepan qué esperar:

- **Header**: categoría, ICP, geografías, pricing, tracción, fecha de revisión, fuentes.
- **Hard metrics** *(solo Top 8 desde 2026-04-17)*: tabla con rating + descargas + MAU + revenue + growth, cada fila con fuente URL + fecha. `(source needed)` si no se pudo verificar — nunca inventar.
- **Pantallas principales (qué estudiar)** *(solo Top 8 desde 2026-04-17)*: 3–5 pantallas con "Qué hace bien / Mapeo a `src/features/.../screens/*.tsx` / Acción sugerida (copiar | evitar | ignorar)".
- **Qué hace bien** (3–5 bullets concretos).
- **Qué hace mal / gaps** (2–3 bullets con evidencia).
- **Patrones UX destacables**.
- **Comparación con RIAL** (tabla 16 features).
- **Lecciones aplicables a RIAL** (copiar / evitar / diferenciarnos).
- **Fuentes** (URLs citadas, mínimo 3 por ficha).

## Mantenimiento y staleness

| Contenido | Umbral de revisión | Responsable |
|---|---|---|
| `app-store-rankings.md` | 3 meses | Quien abra el siguiente sprint de mercado |
| Fichas `deep-dives/*.md` | 6 meses (o antes si: pricing cambió, app adquirida, rebrand, cambio de equipo) | Sprint de mercado |
| `feature-matrix.md` | Cada vez que se actualiza una ficha | — |
| `competitors-index.md` | 6 meses + ad-hoc cuando entre una nueva app relevante al top-10 | — |
| `ux-patterns.md` | Cuando un competidor publique un patrón nuevo que merezca ser absorbido | — |
| `rial-positioning.md` | Cada vez que cambie el ICP o el roadmap de RIAL | Equipo producto RIAL |

**Regla de oro para research:** no inventar datos. Si un dato no se puede verificar con fuente 2024-2026 se marca `(source needed)`. Pricing siempre con fecha, porque los tops lo suben cada 6-12 meses.

## Relación con otras carpetas

- **`docs/archive/`**: snapshots **históricos** 2026-Q1 (Product Bible, Market Research original, etc.). Valen como contexto de decisiones pasadas, pero `docs/market/` es la fuente viva desde 2026-04-17 en adelante.
- **`docs/ai/*`**: guía de agentes de desarrollo. Linkea a esta carpeta (`project.md` + `state.md`) pero no la auto-carga.
- **`src/`**: cero dependencia. Esta carpeta es documentación pura.

## Cambios mayores — abril 2026 que no se pueden ignorar

Tres movimientos del mercado reshape el landscape en el momento de este snapshot:

1. **MyFitnessPal adquirió Cal AI (marzo 2026)** — consolidación del líder histórico con la startup photo-AI más viral de 2024-2025 ($30M ARR). Implicación para RIAL: la narrativa "AI-first scan" ya no es defendible como diferenciador puro; la diferenciación pasa a ser integración all-in-one + cultural fit + real-food identity.
2. **Whoop Healthspan + Oura Dexcom Stelo** — los wearables pasan de tracker fitness a plataforma de biomarkers + CGM. Convergencia con nutrición es inevitable. RIAL debe decidir si integra (Apple Health / HealthKit / Samsung Health) o si deja ese flanco a wearables.
3. **Simple Serie B $35M (Kevin Hart VC, oct 2025)** — capital entra a coach-IA-first. Esperar más apps empujando AI coach como core (no como add-on). El AI Coach de RIAL debe inyectar contexto usuario sistemáticamente (hoy no lo hace).

Detalles en [`rial-positioning.md`](rial-positioning.md).
