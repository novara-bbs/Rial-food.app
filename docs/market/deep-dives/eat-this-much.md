# Eat This Much

**Categoría:** Directo planner (auto-planner IA + grocery)
**ICP primario:** Adulto 25–50 con goal nutricional explícito (bulk, cut, maintain, keto, vegan) que quiere delegar la decisión diaria "qué como" a un algoritmo. Busca plan completo en segundos.
**Geografías clave:** US (home), Canadá, UK, Australia. Inglés. Distribución cross-platform (iOS + Android + web).
**Pricing (2026):** Free (1 day plan + basic) / Premium $5/mes o $49.99/año. Cross-tier incluye grocery integrations.
**Tracción conocida:** Cifras exactas no públicas. CNN's Best Meal Planning Apps 2025 mention — validación editorial relevante. Fundada 2012; uno de los primeros auto-planners que sobrevivieron.
**Última revisión:** 2026-04-17

## Qué hace bien
- **Auto-planner IA por preferencias** — introduce calorías target, macros ratios, dieta, budget/día, presupuesto tiempo de cocina — algoritmo genera plan 7 días en segundos. Zero decision fatigue.
- **Budget control** — filtro único en el sector: "$10/día máximo". El planner selecciona recetas que cumplan constraint. Solo Eat This Much + Ollie lo tienen a este nivel.
- **Integración Instacart** — shopping list del plan se empuja a Instacart con 1 tap; checkout dentro de Instacart. Cierra el loop plan→shop.
- **Flexibilidad por comida** — usuario puede bloquear "siempre desayuno oats" y el planner respeta; resto se auto-genera. No es rígido.
- **Web + móvil paralelo** — cross-platform real, el plan se edita en desktop (drag-drop) y se sigue en móvil.

## Qué hace mal / gaps
- **Recetas curadas genéricas** — library es funcional, no inspiradora. Recetas US típicas (grilled chicken + rice + broccoli). Poca cocina cultural.
- **UI anticuada** — heredó patrones 2015-18. No compite en premium-feel con Yazio/Lifesum.
- **Sin foco social/creator** — no hay feed UGC ni discovery dinámico.
- **Tracking macros secundario** — sirve para que el planner sepa tus targets, pero el diario día a día es menos pulido que MFP.

## Patrones UX destacables
- **Generate Plan → 1 tap regenera** — si no te gusta el plan propuesto, "Regenerate" rehace con los mismos constraints. Iteración rápida.
- **Budget / time / macro constraints explícitos en UI** — sliders visibles "max $X/día" + "max Y min cook" + "macros X/Y/Z". Transparencia de constraints.
- **Grocery list con checkout Instacart in-app** — lista → "Send to Instacart" → checkout sin salir de la experiencia mental Eat This Much.
- **Pin meals across days** — bloquea una comida ("lunes lunch = mismo" → se replica M-X-J). Captura patrón real de "comer lo mismo varios días seguidos".

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | parcial | Diario básico, no core |
| Recetas propias (creación manual) | parcial | CRUD existe |
| Multi-media recetas (fotos + video) | parcial | Foto única |
| Import recetas URL | parcial | Limitada |
| Barcode scanner | ✗ | No |
| Photo recognition comida | ✗ | No |
| Planner semanal (MealSlot) | ✓ | Core — auto-planner IA completo |
| Batch cooking logic | parcial | Meal prep style via pin meals, no agrupación inteligente |
| Ayuno intermitente integrado | ✗ | No |
| AI Coach contextual | parcial | Planner es IA, coach conversacional no |
| Social / creator content | ✗ | No |
| Progreso fotos (Body snapshot) | ✗ | No |
| Pantry / despensa | parcial | Inventory tracking básico |
| Shopping list auto | ✓ | Con Instacart checkout |
| Wellness (Real Feel / mood) | ✗ | No |
| Wearable integration | parcial | Apple Health básica |

## Lecciones aplicables a RIAL
1. **Copiar:** el "Generate Plan + 1-tap regenerate" loop. RIAL Planner hoy es drag-and-drop manual — añadir un botón "Auto-planificar esta semana" con los constraints del usuario (calorías, dieta, tiempo) sería feature diferencial para ICP Ana + Marcos. También el pin-meals-across-days (útil para ICP Ana: "desayuno L-V igual"). Y los budget/time constraints explícitos en UI — RIAL tiene tiempo de cocción en receta pero no filtro global "max 25min/receta esta semana" en planner.
2. **Evitar:** UI anticuada. Eat This Much tiene un producto excelente envuelto en diseño 2016. RIAL con Q15.5 design system no debería sacrificar visual polish por añadir auto-planner — ambos pueden coexistir.
3. **Diferenciarnos en:** recetas multi-media + import URL (Eat This Much débil); social / creator (no); Real Feel (no); real-food identity (Eat This Much es agnóstico); cocina ES/LatAm (no); barcode scanner (no); photo recog (no); ayuno (no). RIAL all-in-one cubre 5+ gaps simultáneos.

## Fuentes
- App Store listing: https://apps.apple.com/us/app/eat-this-much-meal-planner/id981637806
- Play Store listing: https://play.google.com/store/apps/details?id=com.eatthismuch
- CNN Best Meal Planning Apps 2025: https://www.cnn.com/cnn-underscored/reviews/best-meal-planning-apps
- Eat This Much web app: https://www.eatthismuch.com/
- Instacart integration docs: https://help.eatthismuch.com/ (source needed exact URL)
