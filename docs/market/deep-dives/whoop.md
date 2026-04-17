# Whoop

**Categoría:** All-in-one (wearable + recovery + biomarkers + healthspan)
**ICP primario:** Athlete / high-performer 25–55, dispuesto a pagar premium (device + subscription) por data-driven optimization. Profesionales alta exigencia, competitive athletes, biohackers.
**Geografías clave:** US (home), UK, Canadá, Australia, global expansión. Amazon sales + direct-to-consumer.
**Pricing (2026):** $199/año (entry tier con device incluido) / $239 / $359/año (Whoop MG con ECG + biomarkers + Healthspan). Device "free" con subscription — no vende el device separado (excepto casos raros).
**Tracción conocida:** $3.6B valuation 2021 Serie F. Crecimiento tras lanzamiento Whoop 4.0 (2021) y Whoop 5.0 / MG (2024-25). Usuarios exactos no público pero "millones activos" reportado. Patrocinador atletas élite (NBA, Golf PGA, CrossFit).
**Última revisión:** 2026-04-17

## Qué hace bien
- **Recovery score diario** — métrica consolidada 0-100 basada en HRV + RHR + sleep performance. Un número que resume "¿puedo entrenar duro hoy?". Decision-friendly.
- **Sleep tracking gold standard** — tracking sueño con estadios (REM, deep, light), respiratory rate, sleep need vs debt. Comparable con Oura pero integrado con strain.
- **Strain tracking continuo** — cardiovascular load 0-21 basado en HR sostenido. Acumula durante el día y propone "strain target" según recovery. Closed loop.
- **Healthspan + blood biomarkers (Whoop MG 2024)** — test sangre opcional con panel ampliado (colesterol, vitaminas, hormonas) + integración con métrica Healthspan (edad biológica). Expande de fitness a longevity.
- **Community Strava-like + coaching** — feed de amigos comparando strain/recovery. AI Coach con contexto usuario (Whoop Coach) lanzado 2023 sobre OpenAI.

## Qué hace mal / gaps
- **No trackea comida directamente** — permite log manual básico de meal (timing, alcohol, caffeine) pero no macros ni recipes. Depende de integraciones externas (MFP) que son débiles.
- **Device required** — no hay app standalone. Usuarios sin banda no pueden probar. Hardware dependency absoluta.
- **Precio premium estrecha audiencia** — $239-359/año es 3-5x más que apps puro software. Bloquea mass market.
- **Subscripción con device propiedad ambigua** — si cancelas, device sigue funcionando pero sin app cloud. Modelo criticado en comunidad vs Apple Watch compra-única.

## Patrones UX destacables
- **Recovery + Strain como dos rings complementarios** — home muestra Recovery % (green/yellow/red) + Strain target + Strain actual. Loop "recuperado → entrena alto → mañana recupera". Narrativa clara.
- **Sleep need calculated dinámicamente** — no fixed 8 hours; algoritmo calcula sleep need del día basado en strain previo + recovery history. Personalización real.
- **Journal toggles** — log rápido de "alcohol", "caffeine", "stress", "meditation", "meal timing". 20+ toggles journal con correlations post-hoc. Captura variables sin fricción.
- **Whoop Coach chat** — AI conversacional con acceso a tus datos (HRV, sleep, strain). Responde "¿por qué mi recovery bajó?" con datos reales. Benchmark de AI Coach con contexto.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✗ | Journal básico, no macros |
| Recetas propias (creación manual) | ✗ | No |
| Multi-media recetas (fotos + video) | ✗ | No |
| Import recetas URL | ✗ | No |
| Barcode scanner | ✗ | No |
| Photo recognition comida | ✗ | No |
| Planner semanal (MealSlot) | ✗ | No |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | parcial | Journal toggle "last meal"; no timer |
| AI Coach contextual | ✓ | Whoop Coach benchmark |
| Social / creator content | parcial | Community feed |
| Progreso fotos (Body snapshot) | ✗ | No |
| Pantry / despensa | ✗ | No |
| Shopping list auto | ✗ | No |
| Wellness (Real Feel / mood) | parcial | Journal mood + stress |
| Wearable integration | ✓ | Es wearable |

## Lecciones aplicables a RIAL
1. **Copiar:** el patrón Whoop Coach — AI conversacional que cita datos reales del usuario. RIAL AI Coach hoy no inyecta sistemáticamente contexto (registrado como risk en `README.md`). Whoop es la referencia: el Coach sabe tu HRV, tu sueño, tu strain, y los cita en respuestas. Misma arquitectura aplicable a RIAL con macros + Real Feel + adherencia planner + weight trend. También el journal toggles barato — RIAL podría añadir toggles rápidos en Home ("bebí alcohol", "mal sueño", "ejercicio hoy") con correlations post-hoc en Progress. Captura signal sin demandar formularios largos.
2. **Evitar:** hardware dependency. RIAL es software-first vía Capacitor; la lección Whoop no es "hacer hardware" sino "integrar datos de hardware ajeno". Apple HealthKit / Google Fit / Samsung Health son input; no construir device propio.
3. **Diferenciarnos en:** Whoop captura "cómo estoy físicamente" pero no "qué como". RIAL es el complemento natural. El bet estratégico Q6+ es integración Apple HealthKit → importar HRV/sleep/strain al AI Coach de RIAL, convirtiéndose en "Whoop para tu comida". No competir con Whoop, conectar con ellos. Riesgo: Whoop lanza nutrition tracking propio — posibilidad baja pero no zero dado Healthspan expansion.

## Fuentes
- App Store listing: https://apps.apple.com/us/app/whoop-fitness-strain-sleep/id1024000920
- Play Store listing: https://play.google.com/store/apps/details?id=com.whoop.android
- Whoop website + Healthspan / MG: https://www.whoop.com/
- Whoop Serie F $3.6B valuation 2021: https://techcrunch.com/2021/08/30/whoop-raises-200m/
- Whoop Coach (OpenAI) launch 2023: https://www.whoop.com/us/en/whoop-coach/
