# Fitia

**Categoría:** Directo tracking + planner
**ICP primario:** Latinoamericano urbano 20–45, cocina local (arepa, ceviche, tacos, feijoada, empanadas), perfil bulk/cut o pérdida de peso, valora cobertura auténtica de ingredientes regionales.
**Geografías clave:** Perú (home), México, Colombia, Argentina, Chile, Ecuador, Venezuela. Expansión US Hispanic + España. Top-5 Health & Fitness en múltiples países LatAm.
**Pricing (2026):** Free + Premium individual + Family Plan $89.99/año (Family es el tier más vendido — cubre hogar completo). Pricing mensual individual (source needed).
**Tracción conocida:** 10M+ usuarios reportados (cifra repetida en prensa LatAm 2024-25). Co-founders peruanos Luis Loaiza + Lorenzo Lopez. Levantó Serie A 2023 (source needed monto exacto).
**Última revisión:** 2026-04-17

## Hard metrics (2026-04-17)

| Métrica | Valor | Fuente |
|---|---|---|
| Rating App Store US | 4.9★ (240k+ reviews globalmente) | https://apps.apple.com/us/app/fitia-calorie-counter-diet/id1448277011 |
| Rating Google Play | 4.9★ | https://play.google.com/store/apps/details?id=com.nutrition.technologies.Fitia |
| Usuarios globales | 10M+ | https://fitia.app/features/ |
| MAU globales | 1M+ | https://fitia.app/learn/article/best-calorie-counter-apps-2025-rd-reviewed/ |
| Growth web traffic Jan 2026 | +16.11% MoM | (source needed URL Similarweb exacta) |
| Top source por tráfico | México (LATAM #1) | https://www.similarweb.com/website/fitia.app/ |
| Revenue 2024 | $3.5M con equipo 23 personas | (source needed URL — prensa LatAm 2024) |
| Lanzamiento LATAM + España | 2019 | https://fitia.app/learn/article/best-calorie-counter-apps-2025-rd-reviewed/ |
| Pricing Family Plan | $89.99/año (hogar completo) | App Store listing |

## Pantallas principales (qué estudiar)

### 1. Selector de país en onboarding — i18n culinario
- **Qué hace bien**: una de las primeras preguntas es "¿dónde cocinas?". La DB de alimentos + el plan auto-generado se re-filtran por país. "Arepa venezolana" ≠ "arepa colombiana". Plátano maduro vs verde vs tostón son entradas separadas.
- **Mapeo a RIAL**: `src/features/profile/components/Onboarding.tsx` + `src/features/food/data/seed-recipes.ts`.
- **Acción sugerida**: **copiar** en Q20+ — RIAL hoy tiene i18n ES/EN pero no diferenciación cultural dentro de español (México ≠ España ≠ Argentina). Añadir selector regional en onboarding + re-hydratar `seed-recipes.ts` por país. Es el prerequisito para entrar a LATAM en Q8/Q10 (ver `priority-review.md` implicación 2).

### 2. Plan auto-generado editable — zero decision fatigue día 1
- **Qué hace bien**: al crear cuenta el usuario recibe un plan completo 7 días. Puede intercambiar comidas concretas pero el esqueleto ya existe. Evita el "pantalla vacía que paraliza" de MFP/Yazio.
- **Mapeo a RIAL**: `src/features/planner/screens/Planner.tsx`.
- **Acción sugerida**: **copiar parcialmente** — RIAL tiene Planner vacío por default. Añadir "genera plan inicial basado en tu ICP" (Clara/Marcos/Ana + país). Usar seed existente + algoritmo simple primer sprint; AI meal planner real en Pro tier post-Q6.

### 3. Macros breakdown por plato regional compuesto
- **Qué hace bien**: plato compuesto (arroz + frijoles + carne + plátano) se muestra con breakdown visible de cada componente, no solo total. Educativo y preciso.
- **Mapeo a RIAL**: `src/features/recipes/screens/RecipeDetail.tsx` + `src/features/food/screens/AddMeal.tsx`.
- **Acción sugerida**: **copiar** — hoy RIAL en RecipeDetail muestra macros totales. Añadir "Ver breakdown por ingrediente" opcional. Cheap to implement, high educational payoff.

### 4. Family Plan multi-perfil
- **Qué hace bien**: cada miembro del hogar tiene su propio target + diario. Comparten receta library + shopping list. Ticket promedio más alto vs individual; reduce fricción "convencer a mi pareja de pagar".
- **Mapeo a RIAL**: `src/features/profile/screens/RialPlus.tsx` + RevenueCat config.
- **Acción sugerida**: **copiar** antes de growth sprint Q10+ — ICP Ana (household planner en demo-personas) se alinea perfectamente. Requiere multi-perfil en app state + RevenueCat tier nuevo. Ver `docs/ai/state.md` risks para Supabase DB schema impact.

### 5. Grocery delivery integrations (Walmart/Kroger/Instacart US Hispanic + locales LatAm)
- **Qué hace bien**: desde shopping list, botón "enviar a Walmart" añade items al carrito. Cierra el loop plan → compra.
- **Mapeo a RIAL**: `src/features/planner/screens/ShoppingList.tsx`.
- **Acción sugerida**: **ignorar para V1** — alto coste de integración (APIs locales distintas por país), bajo payoff si RIAL no entra LATAM hasta Q10+. Re-evaluar como Pro feature post-Q12 si ICP Clara/Ana lo piden.

## Qué hace bien
- **Cobertura auténtica de alimentos LatAm** — arepas venezolanas vs colombianas diferenciadas, múltiples variedades de plátano (maduro/verde/tostón), marcas locales de supermercados (Tottus, Soriana, Carulla, Jumbo, etc.). MFP tiene huecos masivos aquí; Fitia lo resolvió con verificación profesional nutricionista in-house.
- **Plan alimenticio personalizado con cocina local** — la planificación de comidas genera automáticamente planes que respetan la cocina del país seleccionado. No te recomienda "chicken breast" si estás en Perú — te recomienda "pollo a la plancha" + acompañamiento regional.
- **Integraciones grocery LatAm + US Hispanic** — según rankings 2024-25, integra con Walmart, Kroger, Instacart para US Hispanic; localmente hay integraciones con plataformas de delivery regionales.
- **Verificación profesional** — el equipo incluye nutricionistas que validan la DB y los planes. Refuerza trust vs apps user-submitted.
- **Family Plan como tier estrella** — pricing orientado a hogar completo, no individual. Compra única cubre a toda la familia — reduce fricción de "convencer a mi pareja de pagar su propia app".

## Qué hace mal / gaps
- **UI menos pulida que Yazio/Lifesum** — funcional pero no premium-feeling; tipografías mixtas, spacing inconsistente en algunas screens (source: reviews App Store 2024-25).
- **Batch cooking limitado** — tiene meal plans pero no optimización de "cocina estos 3 el domingo y come hasta miércoles".
- **Planner no es drag-and-drop visual** — es auto-generado por algoritmo. Usuario puede reemplazar, no reorganizar en canvas libre.

## Patrones UX destacables
- **Selector de país en onboarding** — una de las primeras preguntas es "¿dónde vives/cocinas?" y toda la DB + plan se re-filtra. Simple pero masivamente efectivo para i18n culinario.
- **Plan auto-generado editable** — el usuario recibe un plan completo 7 días al crear cuenta. Puede intercambiar comidas concretas pero el esqueleto ya existe. Zero decision fatigue en día 1.
- **Macros breakdown por plato regional** — un plato compuesto (arroz + frijoles + carne + plátano) se muestra con breakdown visible, no solo suma agregada.
- **Family Plan con multi-perfil** — cada miembro del hogar tiene su propio target + diario, compartiendo la misma receta library y shopping list.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | Completo + validado por nutri |
| Recetas propias (creación manual) | ✓ | CRUD, aunque UX menos pulida |
| Multi-media recetas (fotos + video) | parcial | Foto por receta, sin video |
| Import recetas URL | parcial | Existe en Premium, cobertura variable |
| Barcode scanner | ✓ | Free tier con marcas LatAm |
| Photo recognition comida | ✓ | Añadido 2024-25 en Premium |
| Planner semanal (MealSlot) | ✓ | Auto-generado, no drag-drop |
| Batch cooking logic | ✗ | Limitado |
| Ayuno intermitente integrado | parcial | Timer básico, no foco |
| AI Coach contextual | parcial | Rule-based sugerencias |
| Social / creator content | ✗ | No social layer |
| Progreso fotos (Body snapshot) | parcial | Peso + medidas |
| Pantry / despensa | ✗ | No nativo |
| Shopping list auto | ✓ | Desde plan semanal + grocery integrations |
| Wellness (Real Feel / mood) | ✗ | No |
| Wearable integration | ✓ | Apple Health, Google Fit |

## Lecciones aplicables a RIAL
1. **Copiar:** el selector "¿dónde cocinas?" en onboarding. RIAL tiene i18n ES/EN pero no diferenciación de cocina regional dentro de español (México ≠ España ≠ Argentina). El seed-recipes.ts hoy es mediterráneo español — Q20+ debería permitir selección regional y re-hydratar seed por país. También el Family Plan como tier comercial estrella: el ICP Ana (household meal planner) se alinea perfectamente y RIAL debería tener este tier en RevenueCat antes de growth sprint.
2. **Evitar:** el gap UI pulida — RIAL debe mantener el estándar Yazio/Lifesum (tokens + primitives Q15.5) mientras suma cobertura cultural tipo Fitia. "Cobertura cultural sin premium feel" es la trampa de Fitia.
3. **Diferenciarnos en:** planner drag-and-drop visual (Fitia es auto-generado); batch cooking real (Fitia no lo tiene); Real Feel (Fitia objetivo); social / creator content (Fitia no tiene); cobertura mediterránea ES pura (Fitia es pan-LatAm, mediterránea es secundaria).

## Fuentes
- App Store listing: https://apps.apple.com/us/app/fitia-dieta-personalizada/id1447420616
- Play Store listing: https://play.google.com/store/apps/details?id=com.nutrition.technologies.Fitia
- Fitia company / founders coverage: https://www.bloomberg.com/news/articles/ (search "Fitia Luis Loaiza") — (source needed for exact URL)
- Fitia 10M users claim: prensa LatAm 2024 repetido, ver Crunchbase https://www.crunchbase.com/organization/fitia
- Nutritionist verification model: Fitia blog corp (source needed)
