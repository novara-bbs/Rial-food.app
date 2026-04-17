# ADR-008 — Pricing model: free-generous core + single premium tier

- Status: Accepted
- Date: 2026-04-17
- Supersedes: —
- Related: deep-dive Bevel `docs/market/deep-dives/bevel.md` §3, playbook `docs/market/bevel-design-playbook.md` §4.7, `docs/market/rial-positioning.md`

## Context

Hasta hoy, RIAL monetiza vía `RialPlus.tsx` sin un modelo declarativo: el componente enumera beneficios en una lista pero **no define qué queda detrás del paywall**. Cada nueva feature se decide caso a caso ("¿esto es Pro?", "¿esto es free?"), lo que genera inconsistencias (ej. barcode scanner podría terminar gateado aunque es tracking core) y dificulta la comunicación.

El análisis competitivo (`docs/market/competitors-index.md` + `feature-matrix.md`) identifica dos arquetipos:

1. **MyFitnessPal** — free-gate generoso, pero con **dos tiers** (Premium + Premium+) y features core detrás de paywall (barcode scanner en app móvil requiere Premium desde 2024). Resultado: confusión de tier, churn elevado, críticas sostenidas en App Store.
2. **Bevel** — free con core tracking + viz + insights básicos; **un solo tier premium** ("Bevel Intelligence", AI Coach) a $9.99/mes / $79.99/año. Barcode scanner, recipes, planner: todos gratis. Crecimiento top-mover 2025 según Sensor Tower. Ver `docs/market/deep-dives/bevel.md`.

La evidencia del mercado y la posición RIAL (ES+LatAm, ICPs Clara/Marcos/Ana con sensibilidad de precio alta) apuntan al modelo Bevel, no al modelo MFP.

## Decision

RIAL adopta el modelo **free-generous core + single premium tier**:

### Free (sin paywall)
- Tracking macros + calorías (manual y por `FoodDictionary`)
- Barcode scanner (OpenFoodFacts)
- Recetas del catálogo RIAL + import manual
- Import desde URL **manual** (paste + parse heurístico)
- Planner semanal (MealSlot)
- Real Feel / mood / tolerance logging
- Peso + body snapshots + measurements
- Ayuno intermitente (timer + historial)
- Shopping list + Pantry
- Social feed + challenges + creator profiles (read-only + interacciones básicas)
- Wearable basic integration (Apple Health, Google Fit)
- Sync dispositivos (Q6 Supabase)

### Pro (tier único, paywall)
- **AI Coach contextual cross-módulo** (usa últimos 7 días de macros + peso + Real Feel + movement en system prompt)
- **AI meal planner** (genera plan semanal ICP-adaptive)
- **Photo recognition de comida** (LLM multi-modal, compute $)
- **Import automático por URL** (Edge function `og-fetch` + LLM estructuración)
- **Wearable insights avanzados** (tendencias históricas, correlaciones cross-módulo)
- **Export cards shareables** (tipo IG/TikTok Spotify-Wrapped-style)
- **Temas premium** (OCEAN / EMBER mantienen acceso libre; tiers adicionales futuros van aquí)

### Trial temporal
- 14 días gratis con **timeline visual** tipo Bevel: "Hoy → Día 12 (recordatorio) → Día 14 (cobro)".
- Sin trial oscuro, sin auto-renovación silenciosa. CTA honesto "Empezar por 0,00 €".

### Precio objetivo
A definir en Q6+ (post Supabase + RevenueCat wiring). Referencia Bevel: ~$10/mes / ~$80/año. RIAL debería aterrizar en banda similar ajustada a poder adquisitivo ES+LatAm (pendiente research en Q15).

## Consequences

- Cualquier feature **core** (tracking, recetas, planner, wellness logging) es gratis por defecto. Gatearla requiere amendment de este ADR.
- El paywall tiene **un solo nivel**, no dos. Si en el futuro aparece un tier "Pro+" con coaching humano o servicios premium (nutricionista real, etc.), requiere nuevo ADR.
- `RialPlus.tsx` debe refactorizarse para reflejar esta matriz — pendiente PR separado (no parte de este ADR).
- El trial timeline visual requiere componente dedicado; referencia IMG_0965 del playbook Bevel.
- Nuevo feature = pregunta obligatoria "¿free o pro?" con respuesta por defecto **free**. Si la feature requiere compute server-side significativo (LLM, photo ML), candidata a pro.
- Comunicación externa (landing, App Store description, marketing) debe alinearse con "tracking + recetas + planner gratis, AI Coach paid".
- **No aplica retroactivamente sin revisión**: features ya gateadas hoy (si alguna) deben auditarse contra esta matriz antes de degate/gate.

## Rationale

- **Simplicidad cognitiva**: dos opciones (free/pro) vs tres (free/premium/premium+). Menor fricción decisión + menor soporte.
- **Retención orgánica**: free-generous reduce churn "no vale lo que pago"; el Pro se gana cuando el user lo necesita (AI Coach para dudas complejas).
- **Moat competitivo**: gratis-core gana vs MFP (que gatea barcode) y empata con Bevel en posicionamiento. La diferenciación vs Bevel está en **recetas + planner + cocina ES/LatAm**, no en pricing.
- **Alineación ICP**: Clara (ejecutiva preocupada por peso), Marcos (padre de familia sensible al precio), Ana (estudiante) — los tres sienten dolor en paywalls de tracking. Gratis-core es tabla necesaria.
- **Compute cost control**: el único paywall es donde RIAL paga compute real (LLM, ML). Modelo económicamente sano.

## Open items

- Precio exacto €/mes y €/año — Q15 research.
- Regional pricing (EUR vs MXN vs USD) — Q6+.
- Referral / promo mechanics — no decididas.
- "Lifetime" tier — **descartado por defecto** (fricción de soporte + incompatibilidad con modelo SaaS sostenible).
