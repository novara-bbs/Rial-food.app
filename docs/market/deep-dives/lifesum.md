# Lifesum

**Categoría:** Directo tracking
**ICP primario:** Mujer urbana 25–45, Europa occidental + UK, interesada en diet plans estructurados (keto, mediterránea, 16:8, clean eating) más que en macros puros.
**Geografías clave:** Suecia (home), UK, Alemania, Francia, Italia, España. Fuerte en Europa; presencia moderada US.
**Pricing (2026):** Free / Premium ~$7.49/mes (mensual) o desde $30.99/año (promo) hasta $99.99/año (sin promo, tier top). Precios fluctúan por región y promo periódica.
**Tracción conocida:** >55M descargas acumuladas reportadas históricamente (source needed para cifra actualizada 2026). Fuerte presencia en top-20 Health & Fitness EU.
**Última revisión:** 2026-04-17

## Hard metrics (2026-04-17)

| Métrica | Valor | Fuente |
|---|---|---|
| Usuarios claim | 65M (up from 55M en mayo 2023) | https://nutriscan.app/blog/posts/lifesum-free-trial-deals-3-months-free-4eb582ba9e |
| Trustpilot | 1.7★ / 5 (alerta: muy bajo) | (source needed URL exacta Trustpilot Lifesum) |
| Downloads Sensor Tower Feb 2026 | ~100k/mes | https://app.sensortower.com/overview/286906691?country=US |
| Revenue Feb 2026 | ~$800k/mes (~$9.6M/año run-rate) | https://app.sensortower.com/overview/286906691?country=US vía nutriscan.app |
| Revenue claim 2026 | $12.3M | (source needed URL exacta) |
| Rating App Store US | (source needed — no devuelto por search) | https://apps.apple.com/us/app/lifesum-ai-calorie-counter/id286906691 |
| Rating Google Play | Mixed, quejas recientes AI tracking | https://play.google.com/store/apps/details?id=com.sillens.shapeupclub |
| Pricing Premium | $7.49/mo · $30.99–$99.99/año | App Store listing 2026 |

> **Señal importante**: Trustpilot 1.7★ + reviews recientes negativas sobre AI multi-modal + paywall agresivo. Es la única app Top 8 con rating bajo. Se incluye como **contra-ejemplo**, no como referencia positiva.

## Pantallas principales (qué estudiar)

### 1. Input unificado `+ Track` (foto/voz/texto/barcode)
- **Qué hace bien**: un solo botón flotante `+` abre modal con 4 tabs equivalentes (foto, voz, texto, barcode). Todas las modalidades caen al mismo picker de porción + macro-preview. Reduce cognitive load.
- **Mapeo a RIAL**: `src/features/food/screens/AddMeal.tsx` + `src/features/food/components/BarcodeScanner.tsx`.
- **Acción sugerida**: **copiar** al activar photo recognition (Q6+). Hoy RIAL tiene AddMeal con search + barcode pero fragmentados. Converger en `+ Track` único reduce fricción cuando añadamos photo recog.

### 2. Life Score semanal — un número consolidado
- **Qué hace bien**: ring score 1-100 en home + drill-down a contribuyentes (variedad, verduras, hidratación, actividad). Alternativa no-shaming a "te pasaste X kcal".
- **Mapeo a RIAL**: `src/features/wellness/screens/Progress.tsx` (ya tiene `WeeklyScoreCard` tras merge Q14).
- **Acción sugerida**: **copiar la consolidación** — RIAL ya tiene `WeeklyScoreCard`. Validar que el score rollup incluye todas las dimensiones (no solo macros). Añadir drill-down a contribuyentes si aún no existe.

### 3. Diet plan activo como lente global
- **Qué hace bien**: usuario selecciona un plan (mediterránea, keto, 16:8, etc.) y toda la app (home, recetas, sugerencias) se refiltra. Un toggle cambia la experiencia entera.
- **Mapeo a RIAL**: state global en `AppStateContext` + filtros en `src/features/recipes/screens/Cocina.tsx`.
- **Acción sugerida**: **copiar parcialmente** — hoy RIAL tiene filtro "batch-cooking" + "rápido" en Cocina pero no un "diet plan activo" global. Añadir selector "¿Qué plan sigues?" en onboarding + flag en state que filtre Home + Cocina. Candidato a Q10+.

### 4. Paywall + reverse trial (anti-patrón)
- **Qué hace bien (comercialmente)**: 7 días gratis Premium automático al signup. Conversión alta porque usuario olvida cancelar.
- **Qué hace mal (producto)**: los reviews 2025-26 son despiadados sobre esto. Trustpilot 1.7★ se explica mayoritariamente por este flow.
- **Mapeo a RIAL**: `src/features/profile/screens/RialPlus.tsx`.
- **Acción sugerida**: **evitar** explícitamente en ADR-008 (pricing model). RIAL debe ofrecer trial opt-in (usuario activa conscientemente), no reverse trial. Prioridad UX > conversion % a corto plazo.

### 5. Recetas built-in filtradas por plan
- **Qué hace bien**: al activar un plan (ej. Mediterránea), la recipe library oculta recetas no-compatibles por default. Usuario no tiene que navegar 10k recetas.
- **Mapeo a RIAL**: `src/features/recipes/screens/Cocina.tsx`.
- **Acción sugerida**: **copiar** — hoy RIAL filtra por MealSlot (Q19) + collections. Añadir filtro por diet plan cuando existe (Q10+).

## Qué hace bien
- **AI multi-modal food logging** — foto, voz, texto, barcode en un único input unificado. Fue de las primeras apps en consolidar las 4 modalidades en 2024; ahora es tabla rasa pero Lifesum lo pulió antes.
- **15+ diet plans estructurados** — Mediterranean, Keto, Paleo, High-protein, Scandinavian, 16:8 IF, 5:2, vegan, etc. Cada plan reprograma targets macros + recomienda recetas propias. ICP que no sabe qué comer obtiene estructura inmediata.
- **Life Score** — score semanal 1-100 que combina calidad de comidas, variedad, hidratación, actividad. Gamifica sin pelearse con el usuario (no shaming).
- **Recetas built-in con filtro por plan** — la recipe library se filtra automáticamente por el diet plan activo. Reduce decisión.
- **Branding y fotografía** — calidad visual de las recetas sustancialmente por encima de MFP/Cronometer. Se percibe premium.

## Qué hace mal / gaps
- **Free tier restrictivo** — solo ~20 días gratis del plan o features muy limitadas; empuja al paywall rápido. Reviews recientes quejándose de "reverse trial" agresivo.
- **DB alimentos europea buena, US floja** — para usuarios en EE. UU. el catálogo de marcas locales es inferior a MFP. Y en LatAm es pobre comparado con Fitia.
- **Planner semanal débil** — tiene recomendación diaria y recetas filtradas por plan, pero no un drag-and-drop calendar semanal tipo Paprika o Plan to Eat.

## Patrones UX destacables
- **Input unificado foto/voz/texto/barcode** — un solo botón `+ Track` abre un modal con 4 tabs equivalentes. Todas las modalidades caen al mismo picker de porción.
- **Life Score semanal** — ring score visual en home + drill-down a qué contribuye (variedad, verduras, hidratación). Alternativa no-shaming a "te pasaste X kcal".
- **Diet plan activo como lente global** — selecciona un plan y toda la app (home, recetas, sugerencias) se refiltra. Un solo toggle cambia la experiencia entera.
- **Reverse trial** — Premium 7 días gratis automático en onboarding. Convierte muy bien pero deja reviews enfadados cuando cobra al día 8.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | Completo |
| Recetas propias (creación manual) | parcial | CRUD existe pero flujo no es central |
| Multi-media recetas (fotos + video) | parcial | Foto única por receta, sin video |
| Import recetas URL | ✗ | No existe función pública de importar URL |
| Barcode scanner | ✓ | En free tier limitado, premium unlimited |
| Photo recognition comida | ✓ | AI multi-modal desde 2024 |
| Planner semanal (MealSlot) | parcial | Sugerencias diarias por plan, no calendar drag-drop |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | ✓ | 16:8 y 5:2 con timer propio |
| AI Coach contextual | parcial | Hints + recomendaciones, no coach conversacional |
| Social / creator content | ✗ | No social layer |
| Progreso fotos (Body snapshot) | parcial | Weight + measurements, fotos limitadas |
| Pantry / despensa | ✗ | No |
| Shopping list auto | parcial | Desde recetas, no auto-planner-driven |
| Wellness (Real Feel / mood) | parcial | Water + movement + sleep logging; no Real Feel subjetivo |
| Wearable integration | ✓ | Apple Health, Google Fit, Fitbit |

## Lecciones aplicables a RIAL
1. **Copiar:** el input unificado `+ Track` que combina 4 modalidades bajo un mismo modal/picker. RIAL hoy tiene AddMeal con search + barcode separados; converger en un único flow reduce fricción cuando añadamos photo recog. También el Life Score semanal es una buena plantilla para nuestro Progress tab — un solo número consolidado es más motivador que 8 métricas sueltas.
2. **Evitar:** el reverse trial agresivo con paywall al día 8 — genera resentimiento y reviews 1-estrella. RIAL debería hacer trial explícito (usuario opta-in al trial, no automático) si/cuando lo active.
3. **Diferenciarnos en:** planner semanal drag-and-drop real (Lifesum no lo tiene); batch cooking (Lifesum no lo tiene); real-food identity anclada en cocina mediterránea ES (Lifesum tiene Scandinavian plan, no hay mediterránea ES específica); Real Feel Diary subjetivo (Lifesum solo mide acciones, no cómo te sientes).

## Fuentes
- App Store listing: https://apps.apple.com/us/app/lifesum-food-tracker-diet-plan/id286906691
- Play Store listing: https://play.google.com/store/apps/details?id=com.sillens.shapeupclub
- Lifesum pricing + plans: https://lifesum.com/pricing (varies by region)
- Lifesum AI multi-modal announcement 2024: (source needed — blog corp oficial)
- Reviews reverse trial backlash: Trustpilot + App Store reviews (search "Lifesum trial")
