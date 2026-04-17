# MacroFactor

**Categoría:** Directo tracking (fitness pragmático)
**ICP primario:** Fitness-literate 22–40, bulk/cut cyclers, natural bodybuilders, powerlifters, personas que entienden TDEE y superávit/déficit calórico. Perfil Marcos de RIAL es un match directo.
**Geografías clave:** US (home), UK, Canadá, Australia, Europa occidental. Difusión boca-a-boca en comunidades fitness (Reddit r/fitness, Stronger By Science audience).
**Pricing (2026):** $11.99/mes o ~$71.99/año (dual pricing según región, promoción anual recurrente ~$5.99/mes). Sin free tier real — 7 días trial y después paywall. Subscripción más cara del sector tracking puro, pero base paga sin fricción por calidad.
**Tracción conocida:** Cult following reportado en ~1M usuarios activos (source needed). Fundada por equipo Stronger By Science (Greg Nuckols, Eric Trexler, Eric Helms). Reputación tech-científica blindada.
**Última revisión:** 2026-04-17

## Hard metrics (2026-04-17)

| Métrica | Valor | Fuente |
|---|---|---|
| Paid customers Sep 2022 | 82k (dato más reciente oficial) | https://macrofactorapp.com/annual-report-2022/ |
| Downloads último mes | ~100k | https://app.sensortower.com/overview/1553503471?country=US |
| Revenue último mes | ~$2M | https://app.sensortower.com/overview/1553503471?country=US |
| Revenue monthly alt claim | ~$500k/mes (algunas fuentes) | Estimados press 2025 (source needed URL exacta) |
| Funding | $0 — bootstrapped sin VC | https://macrofactor.com/ |
| Pricing | $11.99/mes · ~$71.99/año (≈$6/mes anualizado) | App Store listing |
| Rating App Store US | Alta (nicho quantified-self; source needed nº reviews) | https://apps.apple.com/us/app/macrofactor-macro-tracker/id1553503471 |
| Rating Google Play | Alta | https://play.google.com/store/apps/details?id=com.sbs.diet |
| Credibilidad científica | Algoritmo co-diseñado por Greg Nuckols + Eric Trexler PhD | https://macrofactorapp.com/algorithm-accuracy/ |
| Precisión claim | 3× más preciso que fórmulas TDEE estáticas | https://macrofactorapp.com/algorithm-accuracy/ |

## Pantallas principales (qué estudiar)

### 1. Weekly TDEE adjustment transparente
- **Qué hace bien**: cada domingo el algoritmo recalcula y muestra "Tu TDEE ahora es 2540 (−80 kcal), lo bajamos porque perdiste 0.3 kg menos de lo esperado". Explicación humana + cifra. Transparencia del modelo.
- **Mapeo a RIAL**: `src/features/profile/utils/calorie-calc.ts` (si existe; si no, crear en Q10+) + `src/features/wellness/screens/Progress.tsx`.
- **Acción sugerida**: **copiar** en Q10+ como Pro-only feature. RIAL hoy usa TDEE estático (Harris-Benedict). Añadir algoritmo adaptativo + explicación humana en Progress. Ver `priority-review.md` implicación 4.

### 2. Weight trend line suavizado (no daily volatility)
- **Qué hace bien**: peso diario es volátil ±1 kg por hidratación/comida. MacroFactor muestra EMA semanal (línea suavizada) como fuente de verdad, el daily como dots secundarios. Evita ansiedad.
- **Mapeo a RIAL**: `src/features/wellness/components/WeightTrendCard.tsx` (existe tras merge Q14).
- **Acción sugerida**: **copiar** — hoy RIAL muestra weight history crudo. Añadir EMA o rolling average 7d como línea principal, daily como dots. 1-2h de trabajo, alto payoff.

### 3. Quick-add macros (no kcal)
- **Qué hace bien**: al añadir comida rápida, el usuario introduce P/C/G directamente; kcal se calcula de eso. Invertido vs MFP. Alinea con mental model bulk/cut.
- **Mapeo a RIAL**: `src/features/food/screens/AddMeal.tsx`.
- **Acción sugerida**: **copiar como opción** — añadir toggle "¿introducir kcal o macros?" en el quick-add tab propuesto para Lifesum ficha. ICP Marcos lo prefiere; Clara/Ana ignoran.

### 4. "Zero shame" visual design
- **Qué hace bien**: no hay rojo "te pasaste". No hay streaks. No hay celebraciones exageradas. Muestra números y tendencias, no juicios. Anti-Noom deliberado.
- **Mapeo a RIAL**: cross-cutting — `src/features/home/screens/Home.tsx` (streak), `src/features/profile/screens/Profile.tsx` (streak badge), `NutritionHero` (colores).
- **Acción sugerida**: **copiar parcialmente** como toggle Pro — añadir "Modo sin ruido / zero-shame" en SettingsNutrition que oculte streaks + cambie alarmantes a neutros. ICP Marcos activa; Clara/Ana deja por default.

### 5. Contenido educativo integrado (Stronger By Science)
- **Qué hace bien**: artículos sobre metabolismo, adaptación, peso fluctuación dentro de la app. No vende tricks; educa. Refuerza autoridad y retención.
- **Mapeo a RIAL**: `src/features/home/screens/Discovery.tsx` + `src/features/home/screens/Explore.tsx`.
- **Acción sugerida**: **copiar** cuando RIAL tenga contenido propio (Q15+) — formato artículo largo dentro de la app (no blog externo) refuerza identidad real-food. Puede ser user-facing o in-app article reader.

## Qué hace bien
- **Algoritmo TDEE adaptativo semanal** — reprograma tus calorías objetivo cada semana según peso registrado + intake real. No depende de fórmulas estáticas Mifflin-St Jeor — aprende tu metabolismo real. Core differentiator absoluto.
- **"Zero shame" design philosophy** — nunca te regaña, no usa colores alarmantes (no hay rojo "te pasaste"), no empuja a logs perfectos. Muestra tendencias, no juicios. Anti-Noom por diseño.
- **Expenditure dashboard** — muestra TDEE estimado + intake real + weight trend en un solo gráfico con ajustes visualizados. Transparencia absoluta del modelo.
- **Barcode + search + quick-add + recipes** — todas las modalidades de logging rápidas sin paywall interno (único paywall es acceso app, no features).
- **Contenido educativo integrado** — artículos de Stronger By Science sobre metabolismo, adaptación, peso fluctuación. No vende "un truco", educa al usuario.

## Qué hace mal / gaps
- **Barrera de entrada conceptual alta** — si no sabes qué es TDEE / metabolic adaptation / refeed, la app te abruma. No es para casual weight-loss.
- **No hay planner de recetas** — es tracker puro. El usuario de MacroFactor trae sus recetas o las prepara offline.
- **Sin cobertura wellness / mood / ayuno** — es tracker puro. Para holistic flow tienes que combinar con otra app.
- **Sin social** — comunidad "alrededor de" (Reddit, Discord no oficial) pero no dentro de la app.

## Patrones UX destacables
- **Weekly TDEE adjustment transparente** — el domingo el algoritmo recalcula y muestra "tu TDEE ahora es 2540, lo bajamos 80 kcal desde la semana pasada porque perdiste 0.3 kg menos de lo esperado". Explicación humana + cifra.
- **Weight trend line filtered (no ruido diario)** — el peso diario es volátil; MacroFactor muestra una línea suavizada semanal. Evita ansiedad del ±1 kg día-a-día.
- **Quick-add con macros como prioridad, kcal como derivado** — cuando añades comida rápida, introduces P/C/G; las kcal se calculan de eso. Invertido vs MFP. Alinea con mental model bulk/cut.
- **No streak counter** — deliberadamente no hay streak de días. Filosofía: un día perfecto no importa, la tendencia importa.

## Comparación con RIAL

| Feature RIAL | Esta app | Notas |
|---|---|---|
| Tracking macros | ✓ | Algoritmo adaptativo TDEE — gold standard fitness |
| Recetas propias (creación manual) | parcial | CRUD básico, no enriquecido |
| Multi-media recetas (fotos + video) | ✗ | No foco |
| Import recetas URL | ✗ | No nativo |
| Barcode scanner | ✓ | Free con suscripción |
| Photo recognition comida | parcial | Añadido, no core |
| Planner semanal (MealSlot) | ✗ | No planner |
| Batch cooking logic | ✗ | No |
| Ayuno intermitente integrado | ✗ | No |
| AI Coach contextual | parcial | Coach via explanations del algoritmo, no conversacional |
| Social / creator content | ✗ | No |
| Progreso fotos (Body snapshot) | parcial | Weight trend excelente, photos opcionales |
| Pantry / despensa | ✗ | No |
| Shopping list auto | ✗ | No |
| Wellness (Real Feel / mood) | ✗ | No |
| Wearable integration | ✓ | Apple Health, Garmin |

## Lecciones aplicables a RIAL
1. **Copiar:** la filosofía "zero shame" + weekly trend suavizado vs daily weight. RIAL Q14 ya tiene weight history pero muestra valores crudos; debería añadir trend line filtrada (EMA semanal). También el weekly TDEE adjustment explicado en lenguaje humano — patrón directamente aplicable a RIAL AI Coach: no decir "bajé tu target", sino "bajé tu target 80kcal porque tu peso bajó menos de lo esperado esta semana". Y la ausencia de streak counter — RIAL tiene streaks (Home, Profile) que con ICP Marcos pueden generar ansiedad contraproducente. Considerar toggle "modo zero-shame" que oculta streaks.
2. **Evitar:** barrera de entrada conceptual. RIAL no debe requerir al usuario entender TDEE para usarlo. ICP Clara (real-food household) no tiene ni querrá tener ese background. Mantener el algoritmo adaptativo como opción Premium avanzada, no como setup inicial.
3. **Diferenciarnos en:** recetas propias con galería (MacroFactor no lo hace); planner semanal (no); batch cooking (no); Real Feel (no); social / creator (no); cocina ES/LatAm (no); all-in-one wellness (MacroFactor es puro tracker).

## Fuentes
- App Store listing: https://apps.apple.com/us/app/macrofactor/id1553503471
- Play Store listing: https://play.google.com/store/apps/details?id=com.strongerbyscience.macrofactor
- Stronger By Science founder team: https://www.strongerbyscience.com/about/
- MacroFactor algorithm whitepaper: https://macrofactorapp.com/expenditure-algorithm/
- Reddit community size: https://www.reddit.com/r/MacroFactor/ (subreddit activity)
