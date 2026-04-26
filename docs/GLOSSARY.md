# RIAL Glossary

> Términos de dominio que aparecen en el código, los docs y las conversaciones de producto.
> Si encuentras un término en una PR o issue y no está aquí, **añádelo** — esta página es comunal.

---

## Producto y dominio

| Término | Definición | Dónde aparece |
|---|---|---|
| **RIAL** | Producto. Plataforma mobile-first de nutrición que combina tracking, recetas, planning, wellness, social y creators en una sola app. | Marca, README, todo el repo |
| **RIAL+** | Tier de suscripción premium (vs Free). Gestionado por RevenueCat. | `isPro` en `userProfile`, `useProGate` hook, `RialPlus.tsx` |
| **ICP** | *Ideal Customer Profile.* Segmento principal: adulto wellness 30-50 años, no atleta. Usado para decidir qué métricas son default (Real Feel sobre macros, hidratación visible, gamificación discreta). | `Home.tsx` (`ICP-adaptive hero`), Q15 sprint, ADR-009 |
| **Real Feel** | Diario de bienestar subjetivo. Usuario registra cómo se siente (1-5) + tags (energía, hinchazón, claridad, pesadez). Diferenciador clave vs MyFitnessPal/Yazio. | `realFeelLogs` localStorage key, `RealFeelDiary.tsx`, `correlations.ts` |
| **Real Score** | Valor agregado del Real Feel (promedio reciente normalizado). Visible en Home y Diary. | `realFeel.score` i18n key, `Home.tsx` |
| **Cocina** | Tab inferior 2: recetas personales + colecciones + plan semanal + lista de la compra. **No** confundir con Discovery (catálogo público). | `nav.kitchen`, `Cocina.tsx`, 3 sub-tabs internos |
| **Discovery** | Catálogo de recetas verificadas y editorial. Vive dentro de la pestaña Explorar. Filtros vía `FilterSheet` (no chips inline). | `Explore.tsx`, `Discovery.tsx`, ADR-014 |
| **CookMode** | Modo paso-a-paso a pantalla completa con timers para cocinar una receta. Overlay oscuro full-screen. | `CookMode` component (recipes feature) |
| **NutritionHero** | Bloque hero del Home con resumen del día (calorías + macros + ring). Adaptativo según ICP. | `Home.tsx`, sprint Q15 |
| **CreatorMarketplace** | Capa social donde creadores publican recetas verificadas, posts, stories, challenges. | `features/social/`, `CreatorProfile.tsx`, `CreatorVerification.tsx` |

---

## Métricas y reglas de negocio

| Término | Definición | Implementación |
|---|---|---|
| **TDEE** | *Total Daily Energy Expenditure.* Calorías diarias estimadas (Mifflin-St Jeor + multiplicador de actividad + ajuste por objetivo). | `utils/nutrition.ts` |
| **Macro split** | Reparto proteína/carbos/grasas. Proteína por kg según objetivo (cut 2.2 · muscle 2.0 · maintain 1.6). | `utils/nutrition.ts`, sprint R8 |
| **Macro target** | `dailyMacros.target` — el goal diario que setea el onboarding. **No** se cambia automáticamente, requiere recalcular vía Settings. | `AppStateContext`, `Settings.tsx` |
| **Streak** | Días consecutivos con Real Feel registrado. 1 grace day por mes (no rompe la racha). | `getLoggingStreak` en `utils/gamification.ts` |
| **Food quality** | Score nutricional de un alimento (😊 / 😐 / 😕). Pondera densidad proteica, fibra, azúcar, grasa saturada. | `utils/nutrition.ts:foodQuality()` |
| **Tolerance log** | Registro de reacción a un alimento (severidad + síntomas). Independiente de Real Feel. | `toleranceLogs`, `AddTolerance.tsx` |
| **Daily check-in** | Modal corto de mañana: ánimo, sueño, estrés, síntomas. Alimenta el correlation engine. | `DailyCheckIn.tsx` |
| **Weekly check-in** | Variante semanal del check-in (peso, medidas, foto opcional). | `WeeklyCheckIn.tsx` |
| **Insight** | Recomendación heurística que aparece en Home (ej. "te falta proteína", "lleva 3 días sin agua"). | `utils/correlations.ts:insightEngine()` |

---

## Arquitectura y código

| Término | Definición | Referencia |
|---|---|---|
| **Handler factory** | Convención: cada acción que muta state se exporta como `createHandleX(deps)` desde `features/*/handlers/` y se wirea en `AppStateContext`. Cero handlers inline. | `AppStateContext.tsx`, `AGENTS.md` |
| **SyncKey** | Clave que el sistema de Supabase sync usa para identificar qué slice de state debe pushearse al servidor cuando cambia. | Wired in Q6 sprint, `AppStateContext` |
| **Seed** | Data de demo inyectada en localStorage la primera vez que el usuario abre la app (recetas verificadas, ingredientes, food families). Versionada vía `SEED_VERSIONS`. | `lib/seedVersion.ts` |
| **State-based nav** | Sin React Router. Una variable `currentScreen: string` en `App.tsx` decide qué pantalla pintar. `navigateTo()` + `goBack()` gestionan historia. | Ver `docs/SITEMAP.md` |
| **Primitive** | Componente canónico del design system (`<Heading>`, `<Text>`, `<ChipRow>`, `<SectionCard>`, `<FilterSheet>`, etc.). Si existe, **úsalo**; no recrees. | `docs/PRIMITIVES.md`, ADR-001 |
| **Allowlist (lint)** | Lista de archivos donde una regla del design system se downgrade a warning porque vienen de antes de la regla. **No crece**, solo encoge. | `eslint.config.mjs` |
| **Convention test** | Test en `src/test/conventions/*` que bloquea regresiones de design-system invariantes (export de primitives, no chip reimplementation, etc.). | Ver `src/test/conventions/` |
| **Preflight** | Script `npm run release:preflight` = tsc + eslint + check:i18n + vitest + build + size:check. Gate antes de cualquier push a `rial-food/main`. | `package.json` |

---

## i18n

| Término | Definición |
|---|---|
| **Locale** | `'es'` o `'en'`. Default `es`. Detecta de `navigator.language`, persiste en `localStorage['rial-locale']`. |
| **`useI18n()`** | Hook que devuelve `{ t, locale, setLocale }`. Todo string user-visible va por aquí. |
| **`t.section.key`** | Acceso type-safe a una traducción. `t` es el tipo `DeepString<typeof es>`. |
| **i18n symmetry** | ES y EN deben tener exactamente las mismas keys. `npm run check:i18n` lo valida con la API del compilador TypeScript. |
| **Drift i18n** | String hardcodeado en JSX que no pasa por `t.*`. El symmetry check NO lo detecta — solo revisión humana o lint custom futuro. |

---

## Convenciones de equipo

| Término | Definición |
|---|---|
| **"continua"** | En el chat, el owner dice "continua" para autorizar `npm run release:push` cuando es el siguiente paso lógico tras un preflight verde. |
| **`rial-food/main`** | Remote y branch de release. NO confundir con `origin`. El push real va a `novara-bbs/Rial-food.app`. |
| **ADR** | *Architecture Decision Record.* Decisiones versionadas en `docs/adr/`. Si tomas una decisión arquitectónica, escribe un ADR. |
| **Sprint Qn / Rn** | Identificadores cortos de sprints anteriores (Q1..Q19, R1..R8). Aparecen en `CHANGELOG.md` y `state.md`. No hay nomenclatura formal — son etiquetas de trabajo. |
| **Vibe-coding** | Modo de desarrollo del repo: humano define intención de alto nivel, agentes (Claude, Codex, Gemini) ejecutan. Hoy 100% del código nace así. |

---

## Anti-glosario (términos que NO usamos)

- **Ruta / Route**: no, es **screen**. No hay React Router.
- **Page**: no, es **screen**. "Page" sugiere URL.
- **Reducer**: no, los handlers son funciones puras factories. No hay Redux.
- **Translation file**: no, es **locale file** (`src/i18n/locales/es.ts`).
- **CSS module**: no, todo es Tailwind 4 + tokens semánticos.
- **Dark mode toggle**: no, son **8 themes** (4 paletas × 2 modos). Ver `docs/DESIGN-SYSTEM.md` § 2.
