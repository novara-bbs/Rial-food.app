# RialFood — Análisis Completo & Plan de Unificación

> Actualizado 12/03/2026 | Stack: Next.js 15 · React 19 · TypeScript · Tailwind v4 · Local-First
> Incluye análisis de **3 ZIPs de Google AI Studio (228 pantallas)** + código local

---

## 1. INVENTARIO DE VERSIONES

### 🟢 Local — `v0-rialfood` (Next.js, en producción)
**Fortaleza: Arquitectura sólida, código real, 13 rutas funcionales**

| Ruta | Estado |
|---|---|
| `/` — Home | ✅ |
| `/recetas` — Explorar recetas | ✅ |
| `/recetas/[slug]` — Detalle receta | ✅ |
| `/mis-recetas` — Mis recetas | ✅ |
| `/nueva-receta` — Crear receta | ✅ |
| `/planificador` — Semana | ✅ |
| `/lista-compra` — Compra | ✅ |
| `/favoritos` | ✅ |
| `/objetivos` | ✅ |
| `/progreso` | ✅ |
| `/perfil` | ✅ |
| `/borradores` | ✅ |
| `/importar` | ✅ |

**50+ componentes** (patterns, ui, brand)
**Falta:** Comunidad, Creator features, Gamificación, Onboarding, Vitality tracking, Batch cooking, Real Match, Bio-Sync

---

### 🔵 Google V1 — 20 pantallas
**Fortaleza: Performance, athletismo, creator economy**

Estética: Dark mode, Space Grotesk bold, paleta verde eléctrico (#ccff00), modo atlético

---

### 🟡 Google V2 — 18 pantallas + PRD completo
**Fortaleza: Mejor sistema de diseño, visión de producto más madura**

Design system completo: Olive green (#4A5D23), Warm oat (#F9F8F6), Terracota (#D47A43), Newsreader + Satoshi

---

### 🔴 Google V3 — 190 pantallas nombradas + 26 generadas = 216 total
**Fortaleza: Iteración masiva, múltiples variantes por feature, 5 filosofías de diseño**

Este es el ZIP más grande y contiene múltiples versiones/iteraciones de cada pantalla. A continuación el análisis detallado.

---

## 2. ANÁLISIS V3 — CATEGORIZACIÓN DE 190 PANTALLAS

### 📊 Resumen por categoría

| Categoría | Pantallas | Mejores versiones |
|---|:---:|---|
| Dashboards / Home | 10 | `rial_real_time_dashboard`, `rial_master_home` |
| Diarios / Journal | 15 | `rial_detailed_food_log`, `rial_diario_de_comidas_real` |
| Comunidad / Social | 17 | `rial_community_hub_unified`, `rial_community_feed_final` |
| Perfiles / Creator | 8 | `rial_profile_unified`, `rial_rising_star_profile` |
| Planificador / Planner | 9 | `rial_family_planner_unified`, `planner_quiet_luxury_1` |
| Batch Cooking | 7 | `rial_batch_cooking_lab`, `rial_batch_cooking_session_final` |
| Lista de compra | 5 | `rial_shopping_unified`, `rial_smart_shopping_list_editorial` |
| Creación de recetas | 10 | `new_recipe_nutrition_data_2`, `crea_tu_receta_editorial` |
| Vista de recetas | 6 | `rial_final_recipe_review`, `rial_master_recipe_detail` |
| Explorar / Discovery | 4 | `explore_trending_recipes`, `rial_recipe_discovery_final` |
| Recetario personal | 3 | `mi_recetario_personal`, `rial_master_cookbook` |
| Onboarding / Goals | 6 | `welcome_to_rial`, `rial_onboarding_maestro` |
| Insights / Analytics | 9 | `rial_personal_insights_1`, `insights_quiet_luxury_1` |
| Salud / Vitality | 9 | `rial_metas_y_longevidad`, `rial_inteligencia_avanzada` |
| Bio-Sync | 4 | `bio_sync_active`, `rial_configuraci_n_bio_sync` |
| Inventario / Pantry | 5 | `rial_smart_kitchen_inventory_1`, `rial_inventory_check_in_editorial` |
| Real Match (comparador) | 6 | `real_match_analysis_result`, `rial_comparador_de_alimentos` |
| Pro Athlete Mirroring | 6 | `rial_pro_athlete_mirroring_discovery`, `rial_mirror_pro_plan` |
| Diccionario nutrientes | 7 | `rial_diccionario_y_sustitutos`, `rial_sustituto_inteligente` |
| Challenges / Gamificación | 5 | `rial_community_challenges`, `rial_achievements_social_proof` |
| Ayuno / Fasting | 3 | `rial_protocolos_de_ayuno`, `rial_temporizador_de_ayuno` |
| Utilidades (escáner, porciones, etc.) | 15+ | `rial_escaneo_de_ticket`, `calculadora_de_porciones_inteligente` |
| Estilos alternativos | 4 | `rial_option_1_editorial_artisan`, `rial_option_2_digital_raw` |
| Quiet Luxury (variantes) | 8 | Variantes de journal, planner, community, insights |
| Settings / Privacy | 6 | `advanced_settings`, `data_permissions_1` |

---

## 3. BEST-OF-BREED POR CATEGORÍA (ANÁLISIS DETALLADO)

### 🏠 DASHBOARDS — Ganador: `rial_real_time_dashboard`

**Por qué gana:** Interfaz equilibrada entre datos personales y comunidad. Incluye "Real Status" card, Daily Plate con meal matching, community recipe carousel, texturas sofisticadas (linen overlay). Color verde #3fca43 con Inter. Producción-ready.

**Runner-up:** `rial_master_home` — Light mode premium con hero image, biometric live indicator, timeline del día. Ideal para el home principal.

**Descartados:** `pulse_dashboard` (demasiado fitness/Whoop), `rial_option_2_digital_raw` (brutalista/nicho), `rial_option_1_editorial_artisan` (solo branding, no funcional)

---

### 📓 DIARIOS — Ganador: `rial_detailed_food_log`

**Por qué gana (9.5/10):** Sticky header con calorías persistentes (942 kcal), scroll horizontal por categorías (Breakfast/Lunch/Dinner/Snacks), gestión item-level con delete. Color cyan #25aff4 sobre dark blue #101c22.

**Runner-up:** `rial_diario_de_comidas_real` — Único con tipografía serif en headers (feel premium), áreas dashed para meals no registradas.

**Patrones innovadores identificados:**
- Sticky header con totales (detailed_food_log)
- Timeline vertical (master_journal_2)
- Layout editorial magazine (master_journal_1)
- Swipe gestures + glass-morphism (diario_interactivo)
- Quiet luxury minimal (journal_quiet_luxury_1/2)

---

### 👥 COMUNIDAD — Ganador: `rial_community_hub_unified`

**Por qué gana:** Jerarquía visual equilibrada, search integrado, navegación por tabs, Real Match Engine con badges de 98%. Color #ddff00 con Space Grotesk. Profesional sin ser denso.

**Runner-up:** `rial_community_feed_final` — Estilo editorial warm con orange (#ec5b13), tabs "For You/Following/Global", overlays HUD de Real Match y Real Feel.

**Evolución identificada:**
`community_hub_1` → `community_hub_2` → `community_hub_unified` (cada vez más refinado)
`community_feed` → `community_feed_new_recipe` → `community_feed_final` (contenido más maduro)
`community_quiet_luxury_1/2` (variante minimalista/elegante)
`community_performance_v2` (técnico/biométrico, nicho)

---

### 👤 PERFILES — Ganador: `rial_profile_unified`

**Por qué gana:** Arquitectura de información limpia con LVL badge, stats grid dual (Current Goal + Real Feel Avg), colecciones de recetas organizadas, toggle de perfil público. Color #ddff00.

**Runner-up:** `rial_rising_star_profile` — Hero centrado con ring effect, milestone badges (Gold/Silver/Bronze), galería 2 columnas, Real Feel Logs con ratings.

---

### 📅 PLANIFICADORES — Ganador: `rial_family_planner_unified`

**Por qué gana:** Dual-mode (Tactical + Insights), batch cooking card con hero image, carrusel de perfiles familiares con calorías target (Dad/Mom/Leo), integración biométrica. Color #ddff00.

**Runner-up:** `planner_quiet_luxury_1` — Estética calm/wellness, stats de batch session (12 meals, 2.5h, 48 portions), recipe cards con imagen.

**Patrón clave: Leftover Logic™** — Sistema propietario de continuidad de comidas multi-día. Aparece en casi todas las variantes de planner y batch cooking.

---

### 🍳 BATCH COOKING — Ganador: `rial_batch_cooking_lab`

**Por qué gana:** Enfoque científico/lab. Layout desktop 8+4 columnas, timers sincronizados con pause, multi-receta en paralelo, checklist de componentes base, assembly bloqueado hasta completar bases. Color #607AFB.

**Runner-up:** `rial_batch_cooking_session_final` — Vista táctica real-time con progress bar 65%, breakdown por componente (Roasted Roots 80%, Quinoa 100%), panel lateral de timers.

---

### 🛒 LISTA DE COMPRA — Ganador: `rial_shopping_unified`

**Por qué gana:** Círculo de progreso (18/28 items, 65%), toggles de vista (Aisle/Recipes/Recent), Smart Swap suggestions (upgrade a orgánico con delta de precio), badges de items recurrentes, checked items con line-through + opacity. Color #ddff00.

**Runner-up:** `rial_smart_shopping_list_editorial` — Estilo magazine con Playfair Display serif, hero image, secciones editoriales, "Editor's Choice" featurette.

---

### 🍽️ CREACIÓN DE RECETAS — Ganador: `new_recipe_nutrition_data_2`

**Por qué gana:** Gestión de ingredientes más pulida con overlay de smart suggestions, micro-density scoring. Progressive refinement del search UI.

**Variantes identificadas:**
- `add_recipe_*` (3 pasos) — Lime green, Space Grotesk, minimalista
- `new_recipe_*` (3 pasos) — Blue, Inter + Playfair, editorial
- `crea_tu_receta_editorial` — Orange, Public Sans, fotográfico
- `crea_tu_receta_guiada` — Educativo con tips de chef
- `crea_tu_receta_t_ctica` — Dark mode con "AI ENGINE ACTIVE", overlays técnicos ISO

---

### 👁️ VISTA DE RECETAS — Ganador: `rial_final_recipe_review`

**Por qué gana:** Playfair Display serif premium, hero image con gradientes multi-capa, score circle (98), Real Match + Scaling cards, tags con iconos. La más refinada visualmente.

**Variantes por audiencia:**
- `ver_receta_cl_sico_moderno` — Estilo clásico, leftover logic eco-friendly
- `ver_receta_enfoque_familiar` — Badge "kid-approved", scaling 2/4/6
- `ver_receta_lab_de_rendimiento` — "Performance Lab" con BIO-SYNC ACTIVE badge

---

### 🎯 ONBOARDING — Ganador: `welcome_to_rial`

**Por qué gana:** Identity selection limpia: 4 roles (Fitness Enthusiast, Health Explorer, Family Manager, Pro Creator) con radio cards. Hero image con gradiente. Blue #007dff.

**Flujo completo:** `welcome_to_rial` → `define_your_path` → `selector_de_objetivos_rial` → `rial_goal_alignment` → `goal_alignment_refinement` → `rial_onboarding_maestro`

---

### 📈 INSIGHTS — Ganador: `rial_personal_insights_1`

**Por qué gana:** "Human Edge Score" (85/100) con trending indicator, toggle Week/Month/Year, SVG area chart con gradiente, grid cards de correlaciones (Peak Mood Fuel, Energy Dip Trigger), Performance Boosters. Color #607AFB.

---

### ❤️ SALUD / VITALITY — Ganador: `rial_metas_y_longevidad`

**Por qué gana:** Bio-age calculator mostrando "-3.6 años" de ganancia en longevidad. Circular progress rings para Longevity Score/Consistency. Goal tracking a largo plazo. Color #007dff con #0bda5b.

**Innovación clave:** `rial_inteligencia_avanzada` — Dual dashboard "Subjective vs Objective" (72% vs 89%)

---

## 4. FEATURES EXCLUSIVAS DE V3 (NO EXISTEN EN V1/V2)

### 🆕 Breakthrough Features

| Feature | Pantallas de referencia | Impacto |
|---|---|---|
| **Real Match™ Engine** | `real_match_*` (6 pantallas) | Comparador nutricional con scan + scoring |
| **Real Feel™ System** | Presente en 40+ pantallas | Logging subjetivo de bienestar (emoji-based) |
| **Leftover Logic™** | `refined_leftover_logic_view` + planners | Continuidad de comidas multi-día |
| **Bio-Age Calculator** | `rial_metas_y_longevidad` | Edad biológica vs cronológica |
| **Bio-Sync Integration** | `bio_sync_*` (4 pantallas) | Conexión Apple Health / Google Fit |
| **Receipt Scanning** | `rial_escaneo_de_ticket` | OCR de tickets de compra |
| **Fasting Protocols** | `rial_protocolos_de_ayuno` + timer | Ayuno intermitente con timers |
| **Smart Substitutions** | `rial_sustituto_inteligente` | Swaps de ingredientes manteniendo nutrición |
| **Portion Calculator** | `calculadora_de_porciones_inteligente` | Escalado inteligente por familia |
| **Kitchen Lab Mode** | `kitchen_lab`, `rial_kitchen_lab_mode` | Cocina como experimentación científica |
| **The Real Narrative** | `rial_the_real_narrative_v3` | IA genera narrativa de salud personalizada |
| **Creator Video Integration** | `creator_video_integration` | Contenido de video de creators |
| **Community Challenges** | `rial_community_challenges*` (5) | Retos 7/30 días con leaderboards |
| **Pro Athlete Mirroring** | `rial_pro_athlete_mirroring_*` (6) | Copiar planes de atletas élite |
| **Post-Meal Response** | `post_meal_response` | Logging emoji post-comida (boost/neutral/crash) |
| **Quiet Luxury Variants** | 8 pantallas `*_quiet_luxury_*` | Estilo minimalista premium alternativo |

### 🎨 5 Filosofías de Diseño en V3

1. **Human-Centric Precision** — Analytics médicos con estética suave (#607AFB)
2. **Biohacker** — Lime/neon sobre dark obsidian (#ccff00, #ddff00)
3. **Wellness Sanctuary** — Sage greens, grises cálidos, holístico
4. **Performance Engineering** — Blue/cyan técnico para atletas (#25aff4)
5. **Editorial Artisan** — Serif + sans, fotografía lifestyle, orange warm (#ec5b13)

---

## 5. COMPARATIVA COMPLETA DE FEATURES (4 VERSIONES)

| Feature | Local | V1 | V2 | V3 | Decisión |
|---|:---:|:---:|:---:|:---:|---|
| Recetas CRUD | ✅ | — | — | ✅ 10 variantes | **Mantener local + rediseño V3** |
| Vista receta | ✅ básico | — | — | ✅ 6 variantes | **Adoptar `rial_final_recipe_review`** |
| Explorar recetas | ✅ | — | ✅ vault | ✅ 4 variantes | **Adoptar `explore_trending_recipes`** |
| Recetario personal | ✅ | — | — | ✅ 3 variantes | **Adoptar `mi_recetario_personal`** |
| Planificador | ✅ básico | ✅ avanzado | ✅ drag&drop | ✅ 9 variantes | **Adoptar `rial_family_planner_unified`** |
| Lista compra | ✅ | — | ✅ auto | ✅ 5 variantes | **Adoptar `rial_shopping_unified`** |
| Diario | ✅ básico | ✅ swipe | ✅ biométrico | ✅ 15 variantes | **Adoptar `rial_detailed_food_log`** |
| Progreso | ✅ básico | ✅ comparador | — | ✅ 9 insights | **Adoptar `rial_personal_insights_1`** |
| Objetivos | ✅ básico | ✅ visual | — | ✅ 6 onboarding | **Adoptar `welcome_to_rial` flow** |
| Home/Dashboard | ✅ | — | ✅ hub | ✅ 10 variantes | **Adoptar `rial_master_home`** |
| Perfil | ✅ | ✅ creator | — | ✅ 8 variantes | **Adoptar `rial_profile_unified`** |
| Comunidad | ❌ | ✅ | ✅ | ✅ 17 variantes | **Añadir `rial_community_hub_unified`** |
| Batch cooking | ❌ | ✅ | — | ✅ 7 variantes | **Añadir `rial_batch_cooking_lab`** |
| Onboarding | ❌ | ✅ | — | ✅ 6 pantallas | **Añadir flujo completo** |
| Gamificación | ❌ | ✅ | ✅ | ✅ 5 challenges | **Añadir con LVL system** |
| Vitality/Health | ❌ | — | ✅ ring | ✅ 9 pantallas | **Añadir `rial_metas_y_longevidad`** |
| Real Match™ | ❌ | — | — | ✅ 6 pantallas | **Añadir (Fase 2)** |
| Real Feel™ | ❌ | — | — | ✅ 40+ pantallas | **Añadir (sistema central)** |
| Bio-Sync | ❌ | — | — | ✅ 4 pantallas | **Añadir (Fase 2)** |
| Leftover Logic™ | ❌ | ✅ | — | ✅ extensivo | **Añadir con planner** |
| Fasting | ❌ | — | — | ✅ 3 pantallas | **Añadir (Fase 3)** |
| Receipt Scan | ❌ | — | — | ✅ 1 pantalla | **Añadir (Fase 3)** |
| Pro Athlete Mirror | ❌ | ✅ | — | ✅ 6 pantallas | **Fase 3** |
| Smart Substitutions | ❌ | — | — | ✅ 2 pantallas | **Fase 2** |
| Kitchen Lab | ❌ | — | — | ✅ 2 pantallas | **Fase 3** |
| Import IG/YouTube | ✅ básico | — | ✅ | ✅ | **Mejorar** |
| Nutrient Dictionary | ❌ | — | — | ✅ 7 pantallas | **Fase 2** |

---

## 6. SISTEMA DE DISEÑO UNIFICADO — DECISIÓN FINAL

### Problema: V2 y V3 usan paletas diferentes

| Aspecto | V2 (PRD) | V3 (mayoritario) | **Decisión** |
|---|---|---|---|
| Primario | #4A5D23 olive | #ddff00 lime / #607AFB blue | **V2 olive — más premium, menos gaming** |
| Fondo | #F9F8F6 warm oat | Dark modes varios | **V2 warm oat — light mode como default** |
| Acento | #D47A43 terracota | #ec5b13 orange / #25aff4 blue | **V2 terracota + V3 blue como secundario** |
| Texto | #2B2927 espresso | Varios | **V2 espresso** |
| Headings | Newsreader serif | Space Grotesk / Playfair | **V2 Newsreader — editorial único** |
| Body | Satoshi | Inter / Space Grotesk | **V2 Satoshi** |
| Borders | 1px solid, 0 shadows | Shadows + glassmorphism | **V2 borders — más limpio** |

### Paleta definitiva
```css
:root {
  /* Colores principales — V2 PRD */
  --color-primary:    #4A5D23;  /* Olive green */
  --color-background: #F9F8F6;  /* Warm oat */
  --color-surface:    #FFFFFF;
  --color-text:       #2B2927;  /* Deep espresso */
  --color-muted:      #A39F98;
  --color-accent:     #D47A43;  /* Terracota */

  /* Colores funcionales — inspirados V3 */
  --color-success:    #0bda5b;  /* Real Feel positivo */
  --color-info:       #25aff4;  /* Analytics, datos */
  --color-warning:    #ec5b13;  /* Alertas, urgente */
  --color-vitality:   #607AFB;  /* Insights, premium */

  /* Tipografía — V2 PRD */
  --font-heading:     'Newsreader', serif;
  --font-body:        'Satoshi', sans-serif;
  --font-mono:        'Space Grotesk', sans-serif;  /* V3 data labels */

  /* Espaciado — V2 filosofía */
  --radius-sm:        0px;
  --radius-md:        4px;
  --radius-lg:        8px;
  --border-subtle:    1px solid #E5E3DF;
  --border-bold:      2px solid #2B2927;
}

/* Dark mode — inspirado en los mejores dark de V3 */
.dark {
  --color-background: #0f1323;
  --color-surface:    #1a1f35;
  --color-text:       #f0f0f0;
  --color-muted:      #6b7280;
  --color-border:     #2a2f45;
}
```

### Filosofía visual unificada
- Light mode como **default** (V2 warm oat) — dark mode como **opción**
- Cero drop-shadows en light → `1px solid` borders (V2)
- Glassmorphism solo en **dark mode** para overlays (V3 best practice)
- Whitespace deliberado — no llenar pantallas (V2)
- Titulares editoriales — Newsreader italic, grandes (V2)
- Datos numéricos — Space Grotesk monospace-like (V3)
- Emoji-based quick inputs para Real Feel™ (V3 innovación)

---

## 7. ARQUITECTURA DE RUTAS — VERSIÓN FINAL

### Fase 1 — MVP (Rediseñar existentes)
```
/                     → The Daily Hub (basado en rial_master_home)
/recetas              → Recipe Vault (basado en explore_trending_recipes)
/recetas/[slug]       → Detalle (basado en rial_final_recipe_review)
/mis-recetas          → Mi Recetario (basado en mi_recetario_personal)
/nueva-receta         → Crear receta (basado en new_recipe_nutrition_data_2)
/planificador         → Smart Weekly Planner (basado en rial_family_planner_unified)
/lista-compra         → Smart Shopping (basado en rial_shopping_unified)
/favoritos            → Favoritos (rediseño visual)
/progreso             → Insights & Vitals (basado en rial_personal_insights_1)
/objetivos            → Goal Selector (basado en rial_goal_alignment)
/perfil               → Creator Profile (basado en rial_profile_unified)
/diario               → Food Log (basado en rial_detailed_food_log)
/borradores           → Borradores (rediseño visual)
/importar             → Importar (mejorar con extracción IG/YT)
```

### Fase 1b — Nuevas rutas esenciales
```
/onboarding           → Multi-paso (welcome_to_rial → define_your_path → goal_alignment)
/comunidad            → Community Hub (basado en rial_community_hub_unified)
/batch                → Batch Cooking Lab (basado en rial_batch_cooking_lab)
```

### Fase 2 — Extensiones
```
/salud                → Health Intelligence (basado en rial_metas_y_longevidad)
/real-match           → Comparador de alimentos (basado en real_match_*)
/diccionario          → Nutrient Dictionary (basado en rial_diccionario_y_sustitutos)
/bio-sync             → Conexión wearables (basado en bio_sync_active)
/sustitutos           → Smart Substitutions (basado en rial_sustituto_inteligente)
```

### Fase 3 — Premium
```
/ayuno                → Protocolos de ayuno (basado en rial_protocolos_de_ayuno)
/atleta-pro           → Pro Athlete Mirroring (basado en rial_pro_athlete_mirroring_*)
/kitchen-lab          → Experimentación culinaria (basado en kitchen_lab)
/escanear             → Receipt Scanner (basado en rial_escaneo_de_ticket)
```

---

## 8. PLAN DE IMPLEMENTACIÓN — SPRINTS ACTUALIZADOS

### 🏃 Sprint 1 — Design System (1-2 días)
> Base visual sobre la que construir todo

1. Actualizar `tailwind.config.ts` con los design tokens unificados (paleta definitiva arriba)
2. Añadir fuentes: Newsreader (Google Fonts) + Satoshi (Fontshare) + Space Grotesk (Google Fonts)
3. Actualizar `globals.css` con variables CSS + dark mode
4. Rediseñar componentes base: `button.tsx`, `card.tsx`, `badge.tsx`
5. Nuevo `bottom-nav.tsx` (5 tabs: Home, Recetas, +Log, Comunidad, Perfil)
6. Rediseñar `site-header.tsx` y `app-shell.tsx`

### 🏃 Sprint 2 — Daily Hub + Diario (2-3 días)
> El corazón del producto

1. Rediseñar `app/page.tsx` → **The Daily Hub**
   - Real Feel™ score del día (emoji-based: 🚀/😐/📉)
   - Quick log CTA flotante
   - Timeline vertical del día (comidas registradas)
   - Community sparks (recetas trending)
2. Crear `app/diario/page.tsx` → **Food Log**
   - Sticky header con calorías totales
   - Categorías horizontales (Breakfast/Lunch/Dinner/Snacks)
   - Item cards con delete + macro badges
   - Post-meal response (emoji mood logging)

### 🏃 Sprint 3 — Recipe Vault + Detalle (1-2 días)
> La feature más visual

1. Rediseñar `app/recetas/page.tsx` → **Recipe Vault**
   - Hero "Top of the Week" card (aspect 4:5)
   - Masonry grid 2 columnas con Real Match % badges
   - Filter pills horizontal scroll
   - Chef/author attribution
2. Rediseñar `app/recetas/[slug]/page.tsx` → **Recipe Detail**
   - Hero image con gradiente multi-capa
   - Playfair Display serif para título
   - Score circle (Real Match %)
   - Ingredient checklist + scaling selector
   - Nutrition cards con progress bars
   - Leftover Logic™ suggestion card

### 🏃 Sprint 4 — Planner + Batch + Shopping (3-4 días)
> El diferencial práctico

1. Rediseñar `app/planificador/page.tsx` → **Smart Weekly Planner**
   - Dual-mode: Tactical + Insights
   - Family profiles con calorías target
   - Batch cooking cards con hero images
   - Leftover Logic™ visual connectors
2. Crear `app/batch/page.tsx` → **Batch Cooking Lab**
   - Timers sincronizados multi-receta
   - Checklist de componentes base
   - Progress por componente
   - Completion review con métricas (meals, hours saved)
3. Rediseñar `app/lista-compra/page.tsx` → **Smart Shopping**
   - Círculo de progreso (items checked/total)
   - Organización por pasillo
   - Smart Swap suggestions
   - Items con recipe origin callouts

### 🏃 Sprint 5 — Onboarding + Objetivos + Perfil (2 días)

1. Crear `app/onboarding/page.tsx` → flujo multi-paso
   - Step 1: Welcome + identity selection (4 roles)
   - Step 2: Define your path (goals)
   - Step 3: Goal alignment refinement
   - Step 4: Profile setup
2. Rediseñar `app/objetivos/page.tsx` → **Goal Selector** visual
3. Rediseñar `app/perfil/page.tsx` → **Creator Profile**
   - LVL badge + stats grid
   - Recipe collections
   - Real Feel average
   - Public profile toggle

### 🏃 Sprint 6 — Comunidad + Gamificación (3-4 días)
> El pilar social

1. Crear `app/comunidad/page.tsx` → **Community Hub**
   - Search + tabs (For You/Following/Global)
   - Real Match Engine cards con % badges
   - Creator spotlight + video integration
   - Challenge participation cards
2. Sistema de gamificación global
   - LVL system (1-10) + EXP
   - Achievement badges (Gold/Silver/Bronze)
   - Community challenges (7/30 días)
   - Leaderboard

### 🏃 Sprint 7 — Insights + Vitality (2-3 días)

1. Rediseñar `app/progreso/page.tsx` → **Personal Insights**
   - Human Edge Score (0-100)
   - Time-range toggle (Week/Month/Year)
   - SVG area chart con gradiente
   - Correlation cards (Peak Mood Fuel, Energy Dip Trigger)
   - Performance Boosters
2. Crear `app/salud/page.tsx` → **Health Intelligence**
   - Bio-age calculator (-X.X años)
   - Longevity Score circular progress
   - Long-term vitality trends

---

## 9. COMPONENTES NUEVOS A CREAR

```
components/
├── core/
│   ├── bottom-nav.tsx              # 5 tabs + FAB central
│   ├── real-feel-input.tsx         # Emoji picker (🚀😐📉)
│   └── score-circle.tsx            # Círculo SVG con score numérico
├── vitality/
│   ├── vitality-score-ring.tsx     # Círculo SVG multi-capa
│   ├── biometric-slider.tsx        # Slider energía/digestión/humor
│   ├── daily-itinerary.tsx         # Timeline vertical del día
│   ├── bio-age-display.tsx         # "-3.6 años" calculator
│   └── human-edge-score.tsx        # Score 0-100 con trending
├── community/
│   ├── feed-card.tsx               # Post de comunidad con HUD overlay
│   ├── achievement-card.tsx        # Logro compartido
│   ├── leaderboard-strip.tsx       # Top creators
│   ├── challenge-card.tsx          # Reto activo con countdown
│   └── creator-spotlight.tsx       # Creator destacado con video
├── gamification/
│   ├── lvl-badge.tsx               # LVL X badge
│   ├── exp-progress.tsx            # Barra al siguiente nivel
│   ├── achievement-toast.tsx       # Toast de achievement
│   └── milestone-badges.tsx        # Gold/Silver/Bronze
├── recipe/
│   ├── recipe-vault-card.tsx       # Card masonry con Real Match %
│   ├── recipe-detail-hero.tsx      # Hero image + gradiente + score
│   ├── ingredient-checklist.tsx    # Lista con checkboxes + macros
│   ├── nutrition-card-grid.tsx     # Grid 3 columnas con progress bars
│   ├── url-extractor.tsx           # Input para IG/YouTube
│   └── leftover-logic-card.tsx     # Suggestion de reutilización
├── planner/
│   ├── weekly-grid.tsx             # 7 columnas con slots
│   ├── family-profile-card.tsx     # Perfil familiar con calorías
│   ├── leftover-connector.tsx      # Visual connectors entre días
│   ├── batch-timer.tsx             # Timer sincronizado
│   └── batch-progress-card.tsx     # Progreso por componente
├── shopping/
│   ├── progress-circle.tsx         # Items checked/total
│   ├── aisle-section.tsx           # Sección por pasillo
│   ├── smart-swap-card.tsx         # Suggestion de swap
│   └── recipe-origin-badge.tsx     # De qué receta viene el item
├── journal/
│   ├── sticky-totals-header.tsx    # Header sticky con calorías
│   ├── meal-category-tabs.tsx      # Tabs horizontales B/L/D/S
│   ├── food-item-card.tsx          # Item con delete + macros
│   └── post-meal-emoji.tsx         # Emoji mood después de comer
├── insights/
│   ├── area-chart.tsx              # SVG chart con gradiente
│   ├── correlation-card.tsx        # Peak Mood Fuel type card
│   ├── time-range-toggle.tsx       # Week/Month/Year
│   └── performance-booster.tsx     # Card de booster con delta %
└── real-match/
    ├── match-score-badge.tsx       # Badge con % de match
    ├── comparison-view.tsx         # Side-by-side comparison
    └── scan-interface.tsx          # Camera/barcode scan UI
```

---

## 10. DUPLICADOS Y PANTALLAS DESCARTADAS

### Duplicados exactos (mismo contenido, diferente color)
- `rial_long_term_vitality_trends_1` ≈ `_2` (orange vs lime)
- `planner_quiet_luxury_1` = `_2` (idénticas)
- `rial_smart_kitchen_inventory_1` ≈ `_2`
- `rial_pro_athlete_mirroring_success_1` ≈ `_2`
- `data_permissions_1` ≈ `_2`

### Pantallas solo de branding (no implementar)
- `rial_option_1_editorial_artisan` — Solo manifiesto de marca
- `rial_option_2_digital_raw` — Solo concepto brutalista
- `rial_brand_market_strategy` — Estrategia interna
- `rial_brand_strategy_value_prop` — Estrategia interna
- `analysis_brand_strategy` — Estrategia interna

### Generated screens (26)
- `generated_screen_1` a `generated_screen_26` — Variantes auto-generadas, revisar si alguna aporta algo único (la mayoría son duplicados menores)

---

## 11. SISTEMAS PROPIETARIOS DE RIAL

V3 introduce tres sistemas de marca que diferencian la app:

### Real Feel™
- **Qué es:** Sistema de logging subjetivo post-comida
- **Cómo funciona:** Emoji picker (🚀 Boost, 😐 Neutral, 📉 Crash) + tags (#MentalClarity, #Heartburn, #Sleepy)
- **Dónde aparece:** Dashboard, Diario, Insights, Comunidad (40+ pantallas)
- **Implementación:** Componente `real-feel-input.tsx` + storage en localStorage

### Real Match™
- **Qué es:** Motor de comparación nutricional
- **Cómo funciona:** Scan de alimento → análisis → score % de match con tus objetivos
- **Dónde aparece:** Recetas, Comunidad, Explorar
- **Implementación:** 6 pantallas de flujo (scan → process → result)

### Leftover Logic™
- **Qué es:** Sistema de continuidad de comidas multi-día
- **Cómo funciona:** Base cocinada el Lunes → transformada en Martes → nueva versión Miércoles
- **Dónde aparece:** Planner, Batch Cooking, Shopping List
- **Implementación:** Visual connectors entre días + badges de transformación

---

## PRÓXIMO PASO RECOMENDADO

**Empieza por Sprint 1** — el design system. Es el cambio con más impacto visual y el que hace que todo lo demás tenga coherencia. Con los tokens definidos arriba, 2 días de trabajo transforman completamente la app.

¿Quieres que empiece a implementar el Sprint 1 ahora mismo?
