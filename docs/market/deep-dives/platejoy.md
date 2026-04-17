# PlateJoy

**Categoría:** Directo planner (personalizado por questionnaire)
**ICP primario:** Adulto 30–55 con dietary constraints específicos (celíaco, PCOS, lactose-intolerant, vegan, keto médico) que necesita un plan altamente personalizado. Dispuesto a pagar premium por personalización profunda.
**Geografías clave:** US (home), Canadá. Inglés. Sin internacionalización fuerte.
**Pricing (2026):** ~$8.25/mes (12m, ~$99) o ~$12.99/mes mensual. Sin free tier persistente — 10 días trial. Parte del portfolio Hearst Health post-adquisición (source needed confirm 2026 ownership).
**Tracción conocida:** Cifras exactas no públicas. Adquirido por WW (WeightWatchers) en 2019, luego pasó a Hearst Health — cambios de ownership sugieren tamaño moderado pero estable. Precedente crítico MealSlot Q19.
**Última revisión:** 2026-04-17

## Qué hace bien
- **Questionnaire de onboarding profundo** — 30+ preguntas sobre allergies, dietas médicas, foods hated/loved, equipo de cocina disponible, tiempo disponible, household size. Output: plan hiperpersonalizado. Propuesta de valor absoluta.
- **Recipes tagged con múltiples slots (suitableFor)** — una misma receta puede aparecer válida para breakfast O snack O lunch según contexto/porción. Precedente Q19 directo junto con Paprika.
- **Pantry tracking integrado** — reporta ingredientes que tienes, genera shopping list restando pantry existente. Reduce waste.
- **Scaling family size** — plan se escala automáticamente (2 adultos + 2 niños) con ingredient quantities ajustados.
- **Constraint satisfaction engine** — dentro del mismo plan respeta simultáneamente "gluten-free + dairy-free + <30min cook + presupuesto + sin frutos secos". Pocos apps lo hacen bien.

## Qué hace mal / gaps
- **Precio premium** — sin free tier real. User que quiere probar se va tras trial 10 días.
- **UI adecuada, no excepcional** — es funcional. No compite visualmente con Yazio/Lifesum en "premium feel".
- **Zero tracking calórico día-a-día** — el plan asume que sigues las recetas; no hay diario de logging compulsivo.
- **Sin cocina cultural diversa** — US-centric; limitado para ICP Clara (cocina ES) o Ana (cocina internacional variada).

## Patrones UX destacables
- **Onboarding quiz exhaustivo con preview incremental** — cada 5 preguntas te muestran un sample de cómo va cambiando el plan. Genera commitment al questionnaire largo.
- **Recipe multi-slot tagging** — una receta `Overnight Oats` es válida para breakfast O snack. PlateJoy decide slot por contexto (calorías restantes, hora de la comida, preferencia usuario). Precedente Q19 de RIAL.
- **Pantry subtract from shopping list** — chequeas lo que tienes en despensa, shopping list se recalcula.
- **Meal swap 1-tap** — no te gusta la receta asignada a martes lunch? Tap "Swap" y propone 3 alternativas que cumplen tus constraints.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | parcial | Macros por receta, no diario logging |
| Recetas propias (creación manual) | parcial | Limitada, foco en curated library |
| Multi-media recetas (fotos + video) | parcial | Fotos, sin video |
| Import recetas URL | ✗ | No |
| Barcode scanner | ✗ | No |
| Photo recognition comida | ✗ | No |
| Planner semanal (MealSlot) | ✓ | Core, multi-slot tagging |
| Batch cooking logic | parcial | Meal prep recipes sí, agrupación inteligente limitada |
| Ayuno intermitente integrado | ✗ | No |
| AI Coach contextual | parcial | Rule-based personalizado, no conversacional |
| Social / creator content | ✗ | No |
| Progreso fotos (Body snapshot) | ✗ | No |
| Pantry / despensa | ✓ | Integrated, reduce-from-shopping |
| Shopping list auto | ✓ | Pantry-aware |
| Wellness (Real Feel / mood) | ✗ | No |
| Wearable integration | parcial | Apple Health básica |

## Lecciones aplicables a RIAL
1. **Copiar:** el recipe multi-slot tagging + decide-by-context. RIAL Q19 `suitableFor: MealSlot[]` es exactamente el patrón PlateJoy. Validar con ellos que la heurística "empty = versátil en todas" es correcta (RIAL así lo decidió, Paprika igual, PlateJoy igual). También el pantry subtract from shopping list — RIAL en Q6+ cuando añada Pantry debe restar del shopping list auto. Y el meal swap 1-tap con 3 alternativas constrain-satisfying — patrón directo para Planner RIAL ("no me gusta martes lunch, reemplaza").
2. **Evitar:** questionnaire de 30+ preguntas en onboarding primer día. RIAL tiene onboarding intencionadamente corto (ICP claridad pero no fricción). El patrón PlateJoy funciona porque es premium post-pago — RIAL como freemium no puede exigir 30 preguntas antes de tocar la app. Dividir: quiz corto día 1 + "refinement optional" cuando usuario retorna día 3.
3. **Diferenciarnos en:** tracking diario (PlateJoy no); barcode (no); photo recog (no); ayuno (no); Real Feel (no); social / creator (no); cocina ES/LatAm (no); AI Coach conversacional (PlateJoy rule-based). RIAL all-in-one cubre huecos.

## Fuentes
- App Store listing: https://apps.apple.com/us/app/platejoy-healthy-meal-planner/id1036735108
- Play Store listing: https://play.google.com/store/apps/details?id=com.platejoy
- PlateJoy website: https://www.platejoy.com/
- WW acquires PlateJoy 2019: https://corporate.ww.com/news/ (source needed exact URL)
- Hearst Health current ownership (source needed confirm 2026): PR coverage post-WW
