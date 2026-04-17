# Bevel

**Categoría:** All-in-one wellness (free core + AI coach paid)
**ICP primario:** Adulto 25–50 que quiere "tener todo en una app" — sleep + strain + nutrition + glucose + strength + stress — sin pagar 5 subscripciones. Alineado con "all-in-one" que RIAL aspira a ser.
**Geografías clave:** US (home), UK, Canadá. Distribución iOS + Android. Expansión internacional no clara aún.
**Pricing (2026):** Free core (tracking + data visualization + basic insights) / AI Coach paid tier ~$9.99-14.99/mes (source needed confirm exact). Precio diseñado para ser accessible mientras tier core permanece gratis — modelo exacto al que RIAL aspira post-Q6.
**Tracción conocida:** Crecimiento 2025-26 (top mover en rankings citados en `competitors-index.md`). Cifras exactas de usuarios / funding no públicas (source needed). Equipo fundador con background tech + health.
**Última revisión:** 2026-04-17

## Hard metrics (2026-04-17)

| Métrica | Valor | Fuente |
|---|---|---|
| Lanzamiento | Mediados 2025 (empresa Finerpoint, Inc.) | https://www.autonomous.ai/ourblog/bevel-app-review |
| Apple recognition | Apple Watch Spotlight + New & Noteworthy 2025 | https://apps.apple.com/us/app/bevel-all-in-one-health-app/id6456176249 |
| Core app price | Gratis desde diciembre 2025 | https://www.autonomous.ai/ourblog/bevel-app-review |
| Pricing Bevel Intelligence (AI Coach) | $9.99/mes · $79.99/año | App Store listing |
| Feature scope | Recovery (HRV + RHR) + Sleep + Nutrition (macros + barcode) + Strain + Strength (700+ ejercicios) | https://www.autonomous.ai/ourblog/bevel-app-review |
| Rating App Store US | (source needed — listings muy recientes, nº reviews insuficiente) | https://apps.apple.com/us/app/bevel-all-in-one-health-app/id6456176249 |
| Rating Google Play | (source needed) | (source needed) |
| MAU / users | (source needed — empresa privada, sin claim público) | — |
| Revenue 2025 | (source needed) | — |
| Growth | Top mover Sensor Tower "State of Mobile Health & Fitness 2025" | https://sensortower.com/blog/state-of-mobile-health-and-fitness-in-2025 |

> **Señal de advertencia**: Bevel entra al Top 8 por **modelo de pricing + growth rápido + all-in-one scope**, NO por validación de producto medible. Los `(source needed)` son muchos porque Finerpoint no publica datos aún. Revisar en 3 meses (2026-07-17).

## Pantallas principales (qué estudiar)

### 1. Home Dashboard unificado (5 rings)
- **Qué hace bien**: 5 rings (sleep / strain / nutrition / glucose / strength) en un viewport glanceable. Cada ring clickable a detalle. Sensación "integral" sin cambio de app.
- **Mapeo a RIAL**: `src/features/home/screens/Home.tsx` + `NutritionHero` + `ProgressPreviewCard`.
- **Acción sugerida**: **copiar** post-Q6 — consolidar en "daily wellness ring grid". Hoy RIAL tiene `NutritionHero` + `ProgressPreviewCard` fragmentados. Bevel prueba que la consolidación eleva retención. Ver `priority-review.md` implicación 3.

### 2. AI Coach cross-módulo
- **Qué hace bien**: respuesta a "¿por qué dormí mal?" cita strain + glucose + meals previos. Usa todos los módulos como contexto. No es un bot genérico — está anclado a TUS datos.
- **Mapeo a RIAL**: `src/features/ai/screens/AICoach.tsx` + `supabase/functions/gemini-proxy`.
- **Acción sugerida**: **copiar** el patrón cross-módulo al construir el system prompt. RIAL ya cruza Real Feel + macros + peso + movement en state; debe **explicitarlo en el prompt** al LLM ("aquí tienes últimos 7 días de X, Y, Z — responde contextualizado"). Q8+.

### 3. Pricing free-generous + single premium
- **Qué hace bien**: tracking + viz + insights básicos gratis. Solo AI Coach en paywall. Evita confusión MFP Premium vs Premium+. Evita fragmentar features core.
- **Mapeo a RIAL**: `src/features/profile/screens/RialPlus.tsx`.
- **Acción sugerida**: **copiar** el modelo como north-star post-Q6. Free = tracking + recetas + planner + Real Feel + barcode + import URL. Pro = AI Coach + AI meal planner + photo recog + import auto URL + wearable insights. **Documentar en ADR-008**.

### 4. Module deep-link pattern
- **Qué hace bien**: cada módulo (sleep/nutrition/strain) tiene subsection propia con drill-down pero comparte user context. Sensación "una app, no cinco".
- **Mapeo a RIAL**: navegación state-based en `src/contexts/NavigationContext.tsx`.
- **Acción sugerida**: **evitar** convertir Progress / Pantry / Planner en apps-dentro-de-app. Mantener el state-context shared. Bevel valida que shared context + deep-link per-module = la combinación correcta.

### 5. Glucose/CGM integration (ignorar por ahora)
- **Qué hace bien**: módulo CGM-aware (Dexcom, Levels). Correlaciona meals con respuesta glucémica. Normalmente premium-only en otras apps.
- **Mapeo a RIAL**: N/A — fuera de scope ICP Clara/Marcos/Ana 2026.
- **Acción sugerida**: **ignorar** para V1 — monitorear si ZOE / Levels / Abbott Lingo ganan tracción en ES+LatAm. Si en 2027 hay ICP con CGM, revisar.

## Qué hace bien
- **All-in-one scope real** — sleep + strain + stress + nutrition + glucose + strength builder, todos integrados y cross-correlacionados. No son módulos aislados sino flows conectados.
- **6M foods database en nutrition module** — cobertura amplia, comparable con MFP. Barcode scanner integrado. No sacrificaron tracking quality por breadth.
- **Glucose integration (CGM-aware)** — módulo específico para usuarios con CGM (Dexcom, Levels). Correlaciona meals con respuesta glucémica. Normalmente premium-only en otras apps.
- **Free tier generoso real** — core tracking + viz + basic insights sin paywall. El AI Coach es el único paywall. Reduce fricción adopción.
- **AI Coach como tier premium único** — no fragmenta features (barcode gratis, recipes gratis); monetiza el valor "coaching personalizado" que requiere compute $.

## Qué hace mal / gaps
- **Menos marca consolidada** — reciente, sin mass recognition vs MFP/Noom/Whoop. Mayor coste adquisición orgánica.
- **Sin planner semanal / recipes creator** — tracking está ahí pero recipe management + weekly planner son débiles o ausentes. Si tu user job es "qué cocinar esta semana", Bevel no ayuda.
- **Sin ayuno intermitente como feature dedicada** — journal básico, no timer + protocolo dedicado.
- **Sin social / creator content** — feature no priorizada; breadth técnico > breadth social.

## Patrones UX destacables
- **Dashboard unificado 5+ módulos** — home muestra rings/metrics de sleep + strain + nutrition + glucose + strength en un solo viewport. Glanceable status integral.
- **Module deep-link** — cada módulo tiene su propia subsection con drill-down, pero share the same user context. Sensation "una app, no cinco".
- **AI Coach con data-driven responses** — paywall claro: AI Coach responde preguntas con referencia a todos tus módulos. "¿Por qué dormí mal?" cruza strain + glucose + meals previos.
- **Pricing free-generous + single premium** — no tiers confusos tipo MFP (Premium + Premium+). Solo free vs coach paid.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | 6M foods, barcode |
| Recetas propias (creación manual) | parcial | Limitado |
| Multi-media recetas (fotos + video) | ✗ | No foco |
| Import recetas URL | ✗ | No |
| Barcode scanner | ✓ | Core free |
| Photo recognition comida | parcial | Añadido, no core |
| Planner semanal (MealSlot) | ✗ | No planner |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | parcial | Journal básico |
| AI Coach contextual | ✓ | Premium tier; cross-módulo contexto |
| Social / creator content | ✗ | No |
| Progreso fotos (Body snapshot) | parcial | Weight + measurements |
| Pantry / despensa | ✗ | No |
| Shopping list auto | ✗ | No |
| Wellness (Real Feel / mood) | ✓ | Stress + mood logging |
| Wearable integration | ✓ | Apple Health, Google Fit, CGM |

## Lecciones aplicables a RIAL
1. **Copiar:** el modelo pricing free-generous + single premium (AI Coach). Es exactamente al que RIAL debería aspirar post-Q6: tracking + recetas + planner + wellness todos gratis; AI Coach + AI meal planner + photo-recog en paywall único. Evita confusión MFP "Premium vs Premium+" y evita gate features core (barcode MFP). También el dashboard unificado 5+ módulos con glanceable rings — RIAL hoy tiene NutritionHero + Progress fragmentados; podría consolidar un "daily wellness ring grid" en Home. Y el AI Coach con cross-módulo contexto (cita sleep + meals + mood en una respuesta) — lo mismo que Whoop Coach pero aplicado a RIAL stack entero.
2. **Evitar:** sacrificar recipes + planner en pro de breadth de tracking modules. Bevel es fuerte en tracking (sleep, glucose, macros) pero débil en "qué cocinar" — justamente donde ICPs Clara / Ana de RIAL viven. RIAL debería absorber el modelo Bevel all-in-one pero conservar recipes + planner + batch cooking como pillar no-negociable.
3. **Diferenciarnos en:** recetas + multi-media (Bevel no); planner semanal (no); batch cooking (no); import URL (no); social / creator (no); cocina ES/LatAm (no); ayuno dedicated (no). RIAL = "Bevel + Paprika + MyRealFood" en un producto, manteniendo el modelo pricing Bevel. Es el bet estratégico más coherente articulado en `docs/market/rial-positioning.md`.

## Fuentes
- App Store listing: https://apps.apple.com/us/app/bevel-health-tracker/ (source needed confirm exact URL + app ID 2026)
- Play Store listing: https://play.google.com/store/apps/details?id= (source needed package ID)
- Bevel website: https://www.bevelhealth.com/ (source needed confirm correct domain)
- Bevel founding team + funding: (source needed — Crunchbase / TechCrunch)
- "Top mover 2025-26" claim: propio `docs/market/competitors-index.md` y prensa sector 2025 (source needed URLs específicas)
