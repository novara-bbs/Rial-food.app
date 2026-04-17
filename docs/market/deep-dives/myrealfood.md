# MyRealFood

**Categoría:** Directo tracking + social + escáner calidad
**ICP primario:** Español 20–45 que sigue filosofía "come comida real" (anti-ultraprocesados), interesado en calidad > cantidad, lector de Carlos Ríos / realfooding. Perfil Clara de RIAL es match directo.
**Geografías clave:** España (home absoluto — #1 nicho real-food). Expansión LatAm y US Hispanic moderada. 2.5M+ usuarios globales reportados.
**Pricing (2026):** Free con features sustanciales / Premium IAP €6.99/mes–€49.99/año (tiers y promociones variables, App Store muestra rango de IAPs). Premium desbloquea planner completo + recetas Premium + analíticas.
**Tracción conocida:** 2.5M+ usuarios reportados 2024-25, ~1M+ en España. Co-fundadores Carlos Ríos (nutri, mediático, autor "Come Comida Real") + equipo tech. Levantó financiación seed + pre-series A (source needed montos).
**Última revisión:** 2026-04-17

## Hard metrics (2026-04-17)

| Métrica | Valor | Fuente |
|---|---|---|
| Rating App Store ES | 4★+ (source needed nº reviews exacto) | https://apps.apple.com/es/app/myrealfood-comida-real/id1380953053 |
| Rating Google Play | 4★+ (source needed nº reviews exacto) | https://play.google.com/store/apps/details?id=es.myrealfood.myrealfood |
| Descargas Play Store | 70k en Uptodown enero 2026; Play Store no muestra total público | https://es.uptodown.com/android/my-real-food (source needed URL exacta) |
| Usuarios activos | 2.5M+ globales, ~1M+ en España | Prensa ES 2024-25 (source needed URL BusinessInsider/El Referente) |
| Recetas en catálogo | 160k+ verificadas por nutricionistas | https://es.myrealfood.app/ |
| Comunidad Realfooding | 1.5M+ seguidores IG Carlos Ríos, 20k+ Realfooders in-app | https://realfooding.com/ |
| Revenue 2025 | (source needed — Sensor Tower no público para app ES) | — |
| Growth 12m | (source needed — sin Sensor Tower público) | — |

## Pantallas principales (qué estudiar)

### 1. Home + Real Score semanal — wellness score con identidad
- **Qué hace bien**: arriba del home muestra un "Real Score semanal" (1-10) que agrega calidad de lo consumido, no calorías. Da identidad a cada sesión: el usuario abre la app y ve *qué tan real* ha comido la semana, no *cuántas calorías*.
- **Mapeo a RIAL**: `src/features/home/screens/Home.tsx` + `NutritionHero` actual.
- **Acción sugerida**: **copiar** el concepto (no el nombre) — añadir un "Real Feel Score semanal" o equivalente que agregue calidad de recetas consumidas (ratio NOVA 1-2 vs 3-4). Hoy RIAL agrega macros pero no una métrica de **calidad**. Q6+.

### 2. Escáner de productos con Real Score + NOVA
- **Qué hace bien**: tras escanear código de barras, la pantalla devuelve tres cosas en jerarquía visual — (a) color grande verde/amarillo/rojo, (b) veredicto textual ("Real Food" / "Procesado" / "Ultraprocesado"), (c) clasificación NOVA 1-4. Las calorías aparecen **abajo**, secundarias. Convierte la elección en acto informado, no en data-dump.
- **Mapeo a RIAL**: `src/features/food/components/BarcodeScanner.tsx` + post-scan result view (hoy ausente — se inserta directamente en el tracking).
- **Acción sugerida**: **copiar** la jerarquía visual post-scan al activar barcode en Q6 en producción. La pantalla debe emitir veredicto emocional primero, macros después. **Este es el insight #1 del scorecard** (ver `priority-review.md` implicación 1).

### 3. Feed social de recetas UGC — comunidad real-food
- **Qué hace bien**: pantalla tipo Instagram pero con recetas user-generated filtradas por NOVA. Like + save + comentario + follow. Network effect local (ES) difícil de replicar.
- **Mapeo a RIAL**: `src/features/social/screens/Community.tsx` + `src/features/social/screens/Discover.tsx`.
- **Acción sugerida**: **copiar** parcialmente — RIAL tiene social feature stubs pero no recipe-centric community. Ordenar el feed por recetas (no posts genéricos) y añadir filtro por filosofía (real-food, veganas, batch-cooking).

### 4. Recetas library con filtros de identidad
- **Qué hace bien**: toggle "solo NOVA 1-2" filtra toda la library al contenido que alineado con filosofía. Identidad consistente en cada interacción.
- **Mapeo a RIAL**: `src/features/recipes/screens/Cocina.tsx`.
- **Acción sugerida**: **copiar** — añadir filtro "Solo real food" junto a los existentes (collections: rápido, batch-cooking, etc.). Cheap to implement, high identity payoff.

### 5. Weekly meal-prep generator Premium
- **Qué hace bien**: usuario elige "sábado cocino", app genera lista de platos + shopping list agregada. Primer paso hacia batch-cooking inteligente.
- **Mapeo a RIAL**: `src/features/planner/screens/Planner.tsx` + `src/features/planner/screens/ShoppingList.tsx`.
- **Acción sugerida**: **copiar + mejorar** — MyRealFood es plantillas rígidas. RIAL puede ser drag-drop real + lógica "domingo cocino → come L-X-V" inteligente. Es el diferenciador #3 en `rial-positioning.md`.

## Qué hace bien
- **NOVA score + Real Score — identidad "real food" clara** — escáner de códigos de barras devuelve clasificación NOVA (1-4, 1=real food, 4=ultraprocesado) + calificación propia "Real Score". Convierte elección supermercado en acto informado. Propuesta de valor diferencial vs MFP/Yazio que tratan todo como "calorías".
- **Comunidad española nativa** — feed de recetas user-generated con mucho volumen en España, idioma ES por defecto, cocina mediterránea / "batch" casero. Network effect local difícil de replicar.
- **Recetas real-food como seed principal** — recipe library filtrada por NOVA 1-2 (sin ultraprocesados). Refuerza identidad en cada interacción.
- **Carlos Ríos como founder-face** — autoridad mediática ES/LatAm. Marketing orgánico masivo vía redes y prensa. Founders-as-distribution channel.
- **Planner semanal Premium** — propone planes real-food de 7 días, con shopping list agregada.

## Qué hace mal / gaps
- **Cobertura de marcas fuera España limitada** — el escáner es espectacular en España (Mercadona, Carrefour ES, Lidl ES) pero debilita notablemente en LatAm/US. El ICP hispano-americano se frustra.
- **Planner no es drag-and-drop visual** — son plantillas pre-armadas editables, no canvas libre tipo Paprika.
- **Batch cooking limitado** — tiene recetas "batch" pero no la lógica de "cocina domingo → come L-X-V" (agrupación inteligente por día de cocina).
- **Push hacia Premium puede ser agresivo** — reviews reportan aparición frecuente de paywall interstitials en flows gratuitos.

## Patrones UX destacables
- **Escáner → score visual instantáneo** — el output del scan no es solo "calorías" sino un color grande + NOVA 1-4 + veredicto "Real Food / Processed / Ultra-processed". Emotional + educativo.
- **Feed social de recetas user-generated** — pantalla social similar a Instagram pero con recetas. Like + save + comentarios + follow creators ES.
- **Weekly meal-prep generator Premium** — selecciona "sábado cocino" y genera lista de platos + shopping. Limitado pero primer paso hacia batch-cooking inteligente.
- **Filtros por NOVA en receta library** — toggle "solo NOVA 1-2" filtra toda la lib. Identidad consistente.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | Completo |
| Recetas propias (creación manual) | ✓ | CRUD con fotos |
| Multi-media recetas (fotos + video) | parcial | Fotos, video limitado o ausente |
| Import recetas URL | parcial | Importer existe, cobertura variable |
| Barcode scanner | ✓ | Core feature gratuito |
| Photo recognition comida | parcial | Añadido, no core |
| Planner semanal (MealSlot) | parcial | Plantillas Premium, no drag-drop |
| Batch cooking logic | parcial | Recetas batch sí, agrupación inteligente no |
| Ayuno intermitente integrado | ✗ | No |
| AI Coach contextual | parcial | Recomendaciones rule-based |
| Social / creator content | ✓ | Feed UGC recetas, followers |
| Progreso fotos (Body snapshot) | parcial | Weight + medidas; fotos limitadas |
| Pantry / despensa | ✗ | No nativo |
| Shopping list auto | ✓ | Desde planner |
| Wellness (Real Feel / mood) | ✗ | No subjective wellness |
| Wearable integration | parcial | Apple Health básica |

## Lecciones aplicables a RIAL
1. **Copiar:** el score visual instantáneo del escáner (color + veredicto + NOVA/Real Score). RIAL en Q6+ cuando active barcode debe emitir veredicto emotional, no solo macros. También el feed social UGC recetas — RIAL tiene social feature stubs pero no recipe-centric community. Y la identidad "real food" baked-in en cada interacción (filtros NOVA, recetas seed filtradas). MyRealFood es el único competidor que comparte filosofía real-food con RIAL — hay que estudiarlo como north star en ES.
2. **Evitar:** depender de un single-founder-face como distribución primaria. Carlos Ríos es activo mediático pero también riesgo concentrado. RIAL debería construir marca de producto, no marca de founder.
3. **Diferenciarnos en:** cobertura LatAm+ES equilibrada (MyRealFood es ES-centric, LatAm secundario); planner drag-drop real (MyRealFood es plantillas); batch cooking con agrupación inteligente (MyRealFood tiene recetas batch pero no lógica domingo→L-X-V); Real Feel subjetivo multi-eje (MyRealFood no lo tiene); AI Coach conversacional con contexto usuario (MyRealFood es rule-based). RIAL puede ser "MyRealFood + MacroFactor + Mealime" en un solo producto — ese es el bet estratégico.

## Fuentes
- App Store listing: https://apps.apple.com/es/app/myrealfood-comida-real/id1380953053
- Play Store listing: https://play.google.com/store/apps/details?id=com.appmyrealfood.myrealfood
- Carlos Ríos perfil + libro: https://realfooding.com/
- MyRealFood 2.5M usuarios claim: prensa ES 2024 (El Referente, Business Insider ES — source needed URL exacta)
- NOVA classification background: https://world.openfoodfacts.org/nova (NOVA scoring origin)
