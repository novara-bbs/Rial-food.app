# Cal AI

**Categoría:** Directo tracking (photo-first)
**ICP primario:** Gen Z / Millennial urbano 18–35 que quiere registrar comidas rápido sin buscar en DB ni pesar ingredientes. "Tomo foto, listo".
**Geografías clave:** US (home), UK, Canadá, Australia. Viral en TikTok 2024-2025. Distribución sobre todo iOS.
**Pricing (2026):** $2.49/mes o $29.99/año — agresivamente barato vs MFP ($79.99/año). Post-adquisición MFP (marzo 2026) pricing futuro incierto.
**Tracción conocida:** 15M+ descargas según prensa adquisición. $30M ARR en el momento de la compra por MFP (marzo 2026). Co-founders Henry Langmack + Zach Yadegari (17 y 18 años al lanzamiento — historia viral en sí misma).
**Última revisión:** 2026-04-17

## Qué hace bien
- **Photo-to-macros workflow puro** — abres app, botón cámara, foto del plato, 3-5 segundos después tienes estimación de calorías + macros + ingredientes detectados. Sin búsqueda, sin barcode, sin escritura.
- **UX minimalista extrema** — casi no hay menús. Home = feed de tus comidas fotografiadas. Botón "+" grande central. Modelo Snapchat aplicado a food logging.
- **Precisión "buena enough"** — la comunidad acepta 15-25% de error en kcal como coste-beneficio por no loggear nada manualmente. El verdadero competidor no es MFP, es "no registrar en absoluto".
- **Viralidad TikTok nativa** — caso de estudio: video de app funcionando es entretenido (la IA adivinando platos raros). Low customer acquisition cost vía UGC.
- **Pricing disruptivo** — $29.99/año vs MFP $79.99. Razón: no mantiene DB manual, no paga verificadores humanos. Costes estructurales más bajos.

## Qué hace mal / gaps
- **Precisión cuestionable para power users** — el modelo de visión subestima o sobreestima en platos compuestos (sopa + tropezones densos, arroz oculto bajo salsa). Power users (culturistas, celíacos) migran de vuelta a MFP/Cronometer.
- **Zero funcionalidad adyacente** — no hay planner, recetas propias, shopping list, wellness, social. Es un "one-trick pony" espectacular pero estrecho.
- **Dependencia absoluta de cámara + good lighting** — si no puedes fotografiar (restaurante oscuro, comida ya terminada), no hay flow alternativo fluido. Fallback a búsqueda manual existe pero es second-class citizen en UX.

## Patrones UX destacables
- **Home = timeline de fotos** — literalmente las fotos de tus comidas recientes son la nav principal. Sentimiento "Instagram de lo que como". Muy diferente al diary-por-día de MFP.
- **Botón cámara dominante central** — FAB tamaño exagerado, siempre disponible. Reduce el tiempo entre "comí" y "loggeado" a <15s.
- **Resultado editable post-scan** — tras el scan la IA propone "salmon + arroz + brócoli, 520kcal / 32P / 45C / 18G". Usuario puede tweak porciones con sliders rápidos si discrepa.
- **Weekly streak de logs** — gamificación ligera: días consecutivos con al menos una foto. Suficiente para retención sin caer en Noom-style preachiness.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | Photo-first, precisión media |
| Recetas propias (creación manual) | ✗ | No existe |
| Multi-media recetas (fotos + video) | ✗ | No hay concepto de "receta" |
| Import recetas URL | ✗ | No |
| Barcode scanner | parcial | Añadido como fallback, no core |
| Photo recognition comida | ✓ | Core feature, mejor del mercado en speed |
| Planner semanal (MealSlot) | ✗ | No |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | ✗ | No |
| AI Coach contextual | ✗ | Solo reconocimiento, no coaching |
| Social / creator content | ✗ | No (pero viralidad orgánica TikTok) |
| Progreso fotos (Body snapshot) | ✗ | No |
| Pantry / despensa | ✗ | No |
| Shopping list auto | ✗ | No |
| Wellness (Real Feel / mood) | ✗ | No |
| Wearable integration | parcial | Apple Health output, limitado |

## Lecciones aplicables a RIAL
1. **Copiar:** la velocidad del flow foto→macros. RIAL en Q6+ que tenga photo recognition debe aspirar al <5s de resultado. También el resultado editable post-scan (sliders rápidos de porción) — no un modal largo tipo MFP. Y el weekly streak de logs como gamificación ligera sin Noom-preachiness.
2. **Evitar:** convertirse en one-trick pony. RIAL tiene recetas + planner + wellness como core — el photo-scan es aceleración, no la propuesta de valor. Cal AI demuestra que el one-trick pony tocó techo y tuvo que ser adquirido.
3. **Diferenciarnos en:** all-in-one (Cal AI solo trackea); real-food identity (Cal AI no juzga calidad de comida, solo cuenta macros — ideal para junk food cuantificado); planner semanal (Cal AI no lo tiene); batch cooking (no); Real Feel subjetivo (no). Post-adquisición MFP marzo 2026, la narrativa "AI-first scan" ya no es defendible como diferenciador puro — todos la integran.

## Fuentes
- App Store listing: https://apps.apple.com/us/app/cal-ai-calorie-tracker/id6480417616
- Play Store listing: https://play.google.com/store/apps/details?id=com.calai
- Adquisición MFP marzo 2026: (source needed — mencionado en `docs/market/competitors-index.md` snapshot 2026-04-17)
- $30M ARR y perfil founders: TechCrunch 2024 / Forbes coverage (source needed URL)
- Virality TikTok: search "Cal AI" en TikTok — videos orgánicos de reviewers
