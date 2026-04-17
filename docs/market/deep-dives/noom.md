# Noom

**Categoría:** Directo tracking + coaching (CBT-based wellness holístico)
**ICP primario:** Adulto 35–60, a menudo post-diet yo-yo, dispuesto a pagar premium por "no ser solo calorías" — busca psicología, coaching, comportamiento. Creciente: pacientes GLP-1 vía Noom Med.
**Geografías clave:** US (home), UK, Canadá, Australia. Marketing agresivo en TV + podcasts. Presencia menor EU.
**Pricing (2026):** ~$70/mes mensual / ~$209/año anual (~$17.42/mes prorrateado 12m, sujeto a promos). Noom Med $69–$279/mes (GLP-1 arm con prescripción + coach médico).
**Tracción conocida:** 50M+ descargas acumuladas reportadas. NYSE IPO nunca materializada tras reports 2021; empresa privada sigue funcionando. Reducción plantilla 2022-23. Noom Med lanzado 2023 como pivot hacia GLP-1 market.
**Última revisión:** 2026-04-17

## Qué hace bien
- **Color-coded food system (green/yellow/orange)** — clasificación nutriente-densa simplificada que reemplaza calorías como unidad mental. Green = baja densidad calórica (verduras, proteína magra), orange = alta densidad (snacks, postres). Heurística accesible, memorable, aplicable en supermercado sin app.
- **Coaching humano real en tier base** — cada usuario tiene un coach humano asignado (no 100% IA). Mensajes asincrónicos. Diferenciador vs apps 100% algoritmo.
- **Currículum CBT diario** — mini-lecciones de 5-10 min/día basadas en cognitive behavioral therapy. Abordan binge eating, emotional eating, body image. Nada que encontrar en MFP/Cronometer.
- **Noom Med como extensión vertical GLP-1** — pacientes con prescripción de Wegovy/Ozempic pagan $279/mes y obtienen coaching médico + nutri + app. Capturando segmento premium 2024-25.
- **Retention alta reportada** — 78% adherencia a 4 meses según propia publicación (source sesgada, pero Nature 2021 study valida mejor-que-control outcomes).

## Qué hace mal / gaps
- **Upselling agresivo + cancelación difícil** — reviews App Store y FTC settlement 2022 documentan prácticas dark-pattern. Pagó ~$62M FTC settlement 2022 por auto-renewal + cancelación onerosa.
- **Puede sentirse preachy / shaming** — el CBT content bien aplicado funciona, mal aplicado se percibe condescendiente. ICPs con historial disordered eating reportan trigger negativo.
- **Tracking food UX mediocre** — el diario en sí no es tan pulido como MFP/Yazio. La app vende coaching + psicología, no herramienta de logging.

## Patrones UX destacables
- **Green/Yellow/Orange clasificación visual** — toda comida registrada aparece con un color dot. Simplifica decisión sin números. Adoptable sin app en supermercado.
- **Daily lesson 5-10 min** — cards de contenido psicológico con progress bar. Separado del tracking pero consumible en comute. Gamificación ligera.
- **Weigh-in ritual semanal** — no diario. Reduce ansiedad de báscula volátil. Align con MacroFactor philosophy pero con coaching humano encima.
- **Coach message inbox** — UI estilo chat con tu coach humano. Respuestas asincrónicas 24-48h. Trust-builder.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | parcial | Tracking existe pero no es el fuerte |
| Recetas propias (creación manual) | ✗ | No foco |
| Multi-media recetas (fotos + video) | ✗ | No |
| Import recetas URL | ✗ | No |
| Barcode scanner | ✓ | Con color-coding |
| Photo recognition comida | parcial | Añadido reciente, no core |
| Planner semanal (MealSlot) | ✗ | No planner visual |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | ✗ | No |
| AI Coach contextual | parcial | Coach humano > AI; AI asistencia añadida |
| Social / creator content | parcial | Group chats con otros usuarios en mismo programa |
| Progreso fotos (Body snapshot) | parcial | Weight trend; fotos opcionales |
| Pantry / despensa | ✗ | No |
| Shopping list auto | ✗ | No |
| Wellness (Real Feel / mood) | ✓ | Mood + emotional eating logs central |
| Wearable integration | ✓ | Apple Health, Google Fit, Fitbit |

## Lecciones aplicables a RIAL
1. **Copiar:** el color-coded simplificador (Green/Yellow/Orange) — heurística universal que reduce decisión sin exigir numeracy. RIAL con MyRealFood-like NOVA score va en dirección similar pero más estricto; vale la pena considerar un "RIAL Score" visual (2-3 colores) como capa de comunicación encima de macros. También el weigh-in ritual semanal (vs diario) — encaja con zero-shame de MacroFactor; RIAL podría ofrecer modo "weekly weigh-in" en settings. Y el currículum CBT diario como source of retention — RIAL AI Coach podría programar micro-lecciones (3-5 min) como daily ritual, no solo respuesta reactiva.
2. **Evitar:** el upselling agresivo + dark patterns de cancelación. FTC settlement $62M es precedente caro. Mantener cancelación one-tap visible en Settings (RIAL hoy lo hace vía Capacitor RevenueCat — preservar). Y evitar tone preachy en AI Coach — ICPs con disordered eating historia son una fracción del user base, pero el shaming les hace churn.
3. **Diferenciarnos en:** recetas propias + multi-media (Noom no); planner drag-drop (no); batch cooking (no); ayuno (no); real-food identity sin color-coding simplista (Noom simplifica excesivamente para ICP real-food literate); AI Coach 100% IA con contexto rico (Noom depende de coach humano caro de escalar).

## Fuentes
- App Store listing: https://apps.apple.com/us/app/noom-weight-loss-health/id634598719
- Play Store listing: https://play.google.com/store/apps/details?id=com.wsl.noom
- FTC settlement 2022: https://www.ftc.gov/news-events/news/press-releases/2022/04/ftc-finalizes-order-requiring-noom-pay-62-million
- Nature 2021 study outcomes: https://www.nature.com/articles/s41598-021-93362-x
- Noom Med GLP-1 pivot 2023: https://www.noom.com/noom-med/
