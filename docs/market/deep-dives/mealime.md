# Mealime

**Categoría:** Directo planner / recetas (simplicidad extrema)
**ICP primario:** Cocinero hogareño 25–45, no-chef, quiere 3-5 cenas semanales rápidas sin pensar. "Dime qué cocinar hoy y cómo, en <30 min".
**Geografías clave:** Canadá (home), US, UK, Australia. Inglés monolingual. Sin LatAm foco.
**Pricing (2026):** Free (plan base con limitaciones) / Pro $5.99/mes o $49.99/año. Pro desbloquea: nutrition info, custom filters, unlimited history, personal recipes.
**Tracción conocida:** Millones de descargas (cifra exacta source needed). Founded 2015 Toronto. Adquisición o funding significativo no reportado públicamente — opera rentable-bootstrapped aparente.
**Última revisión:** 2026-04-17

## Qué hace bien
- **Recetas <30 minutos garantizadas** — toda la library cumple constraint tiempo. Confiabilidad absoluta — nunca te muestra receta 60min cuando tienes prisa.
- **Filtros iniciales exhaustivos** — onboarding pregunta alergias, dietas (keto, vegan, pescatarian, paleo, etc.), ingredientes rechazados, tamaño household. Todo el plan subsecuente respeta las preferencias. Zero gluten-shaming para celiacos.
- **Plan → shopping list flow** — seleccionar 5 recetas → genera shopping list auto-consolidada (suma cebollas de 3 recetas en "2 cebollas"). Exportable a Amazon Fresh, Walmart, Instacart.
- **UI extremadamente minimalista** — pocos menús. Home = "Meal Plan", "Recipes", "Shopping List". Reducción cognitiva.
- **Pantry basics deduction** — asume ingredientes básicos (sal, aceite, ajo) que ya tienes y no los añade a shopping list. Pequeño detalle, impacto diario.

## Qué hace mal / gaps
- **No trackea macros/calorías** — nutrition info es Pro y básica. No compite con trackers. Si goal es weight loss, Mealime no es suficiente.
- **No hay discovery social** — la recipe library es curada por Mealime, no hay UGC ni creator content. Static experience.
- **Sin recetas propias del usuario (en free)** — guardar/crear tus propias recetas es Pro. Free tier es solo consumo de la library oficial.
- **Inglés only, sin LatAm** — cocina US/UK/CA, sin opciones mediterráneas españolas o platos LatAm.

## Patrones UX destacables
- **Meal plan como 5 cards horizontal swipeable** — los 5 meals seleccionados aparecen como carrusel. Swipe para descartar y reemplazar. Gesture-driven.
- **Shopping list por pasillo (aisle-organized)** — agrupa ingredientes por sección de supermercado (produce, dairy, pantry). Reduce tiempo en tienda.
- **Pantry basics toggle** — checkbox "tengo estos 15 básicos" al inicio; removidos de todas las shopping lists futuras.
- **Cooking mode full-screen** — al abrir receta en "cooking mode", pantalla se queda encendida + steps grandes + timer integrado por paso. Excelente kitchen UX.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | parcial | Pro tier, básico |
| Recetas propias (creación manual) | parcial | Pro tier |
| Multi-media recetas (fotos + video) | parcial | Fotos, sin video |
| Import recetas URL | ✗ | No |
| Barcode scanner | ✗ | No |
| Photo recognition comida | ✗ | No |
| Planner semanal (MealSlot) | ✓ | Core feature, simple + eficaz |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | ✗ | No |
| AI Coach contextual | ✗ | No |
| Social / creator content | ✗ | No |
| Progreso fotos (Body snapshot) | ✗ | No |
| Pantry / despensa | parcial | Basics deduction, no full pantry |
| Shopping list auto | ✓ | Aisle-organized, grocery integrations |
| Wellness (Real Feel / mood) | ✗ | No |
| Wearable integration | ✗ | No |

## Lecciones aplicables a RIAL
1. **Copiar:** el cooking mode full-screen (pantalla encendida, steps grandes, timer por paso). RIAL tiene CookMode (Q19) pero referencia de pulido es Mealime. También el pantry basics toggle — en Q6+ cuando añadamos Pantry, inicializar con 15 ingredientes básicos asumidos reduce fricción. Y la shopping list por pasillo (aisle-organized) es mejora directa al patrón actual RIAL (listado plano alfabético). Cambio sin código nuevo — solo re-agrupar por categoría en lib/shopping-list.
2. **Evitar:** la simplicidad extrema al punto de renunciar a tracking. Mealime convive con MFP (usuarios usan ambas). RIAL está integrando funciones — no queremos partir el flow al punto de Mealime puro.
3. **Diferenciarnos en:** tracking integrado (Mealime no); recetas multi-media (no); import URL (no); barcode (no); real-food identity narrativa (Mealime es agnóstico); cocina ES/LatAm (no); AI Coach contextual (no); batch cooking con agrupación (Mealime no tiene la lógica de "cocinar varias recetas el domingo").

## Fuentes
- App Store listing: https://apps.apple.com/us/app/mealime-meal-plans-recipes/id947702007
- Play Store listing: https://play.google.com/store/apps/details?id=com.mealime
- Mealime about / Toronto: https://www.mealime.com/about
- Mealime CNN Best Meal Planning Apps mention 2023-24: https://www.cnn.com/cnn-underscored/reviews/best-meal-planning-apps
- Instacart / Amazon Fresh integrations: https://support.mealime.com/ (integration docs)
