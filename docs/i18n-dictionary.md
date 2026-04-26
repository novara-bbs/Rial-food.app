# RIAL i18n Dictionary — ES/EN Reference

## How it works
- Primary locale: **Spanish (es)** — defined in `src/i18n/locales/es.ts`
- Secondary locale: **English (en)** — defined in `src/i18n/locales/en.ts`
- Auto-detection: `navigator.language` on first load
- Manual override: Settings > Language (persisted in `localStorage['rial-locale']`)
- Context: `I18nProvider` wraps the app in `main.tsx`
- Usage: `const { t, locale, setLocale } = useI18n()`

## Adding a new language
1. Create `src/i18n/locales/{code}.ts` (copy structure from `es.ts`)
2. Add import + entry to `locales` map in `src/i18n/index.ts`
3. Add `Locale` type union member
4. Add flag button in `Settings.tsx` language section

## Adding or editing a translation key

> **Regla dura (ADR-004):** ES y EN deben ser simétricos siempre. `npm run check:i18n` lo bloquea en preflight.

### Caso 1 — Nueva key

1. Decide la **sección semántica** (`home`, `recipes`, `wellness.hydration`, …). Si dudas, mira `src/i18n/locales/es.ts` y reusa el namespace más cercano. Crear un namespace nuevo solo si la feature lo justifica.
2. Edita **los dos archivos a la vez**:
   - `src/i18n/locales/es.ts` → añade la key con texto Spanish.
   - `src/i18n/locales/en.ts` → añade **la misma key** en la **misma posición** con la traducción English.
3. En el componente:
   ```tsx
   import { useI18n } from '@/i18n';
   const { t } = useI18n();
   return <span>{t.miSeccion.miKey}</span>;
   ```
   El acceso es **type-safe** (`t` tiene el tipo derivado de `es.ts`) — si la key no existe el TS te lo dice en compile-time.
4. Verifica simetría:
   ```bash
   npm run check:i18n
   ```
5. Si la key es interpolable, usa `{placeholder}` y resuelve en el call-site con `.replace()` (ver § "Template strings" más abajo).

### Caso 2 — Renombrar una key existente

1. Busca todas las referencias: `Grep` por `t.miSeccion.miKey`.
2. Cambia la key en **ambos** locales y todos los call-sites en el mismo commit.
3. `npm run check:i18n` + `npx tsc --noEmit` deben pasar (TS atrapará call-sites no migrados).

### Caso 3 — Eliminar una key

1. Confirma que **ningún** call-site la use (`Grep`).
2. Elimina de **ambos** locales en el mismo commit.
3. `npm run check:i18n`.

### Anti-patterns

| ❌ No hagas | ✅ Hazlo así |
|---|---|
| `<button>Guardar</button>` (string ES hardcoded) | `<button>{t.common.save}</button>` |
| Añadir key solo en `es.ts` "para luego" | Siempre las dos a la vez |
| `aria-label="Increase"` en JSX | Usa una key i18n para aria-labels también |
| `<option>Fácil</option>` ES literal en select | Mapea opciones desde un array i18n |
| Crear `src/i18n/locales/es-mx.ts` para variante regional | No tenemos plan para variantes regionales — coordina antes |

### Cuándo `check:i18n` no es suficiente

`check:i18n` valida **simetría de keys**, no detecta strings hardcodeados que nunca pasan por `t.*`. Drift conocido se sweep manualmente. Si añades JSX con texto literal, **inclúyelo en i18n** desde el principio — auditar después es más caro.

## Key Sections

### nav — Navigation labels
| Key | ES | EN |
|-----|----|----|
| today | Hoy | Today |
| kitchen | Cocina | Kitchen |
| explore | Explorar | Explore |
| more | Mas | More |
| create | Crear | Create |

### tabs — Sub-tab labels
| Key | ES | EN |
|-----|----|----|
| recipes | Recetas | Recipes |
| plan | Plan | Plan |
| list | Lista | List |
| creators | Creadores | Creators |
| social | Social | Social |

### home — Home screen
| Key | ES | EN |
|-----|----|----|
| goodMorning | Buenos Dias | Good Morning |
| goodAfternoon | Buenas Tardes | Good Afternoon |
| goodEvening | Buenas Noches | Good Evening |
| protein | Proteina | Protein |
| carbs | Carbos | Carbs |
| fats | Grasas | Fats |
| plannedToday | Planificado hoy | Planned today |
| logIt | Registrar | Log it |
| streak | Racha | Streak |
| days | dias | days |
| trainingDay | Training | Training |
| restDay | Rest | Rest |
| target | Objetivo | Target |
| food | Alimentos | Food |
| exercise | Ejercicio | Exercise |
| remaining | Restante | Remaining |

### realFeel — Wellness diary
| Key | ES | EN |
|-----|----|----|
| howDoYouFeel | Como te sientes? | How do you feel? |
| diary | Diario Real Feel | Real Feel Diary |
| score | Real Score | Real Score |
| correlations | Correlaciones | Correlations |
| tags.bloating | Hinchazon | Bloating |
| tags.energy | Energia | Energy |
| tags.heaviness | Pesadez | Heaviness |
| tags.clarity | Claridad | Clarity |

### recipes — Recipe management
| Key | ES | EN |
|-----|----|----|
| create | Crear receta | Create recipe |
| import | Importar URL | Import URL |
| collections | Colecciones | Collections |
| quick | Rapidas | Quick |
| highProtein | Alto proteina | High protein |
| recipeCount | {count}/30 recetas | {count}/30 recipes |
| foodQuality.good | Buena calidad nutricional | Good nutritional quality |
| foodQuality.neutral | Calidad nutricional moderada | Moderate nutritional quality |
| foodQuality.poor | Calidad nutricional baja | Low nutritional quality |

### fab — Quick action buttons
| Key | ES | EN |
|-----|----|----|
| logMeal | Registrar comida | Log meal |
| createRecipe | Crear receta | Create recipe |
| importUrl | Importar URL | Import URL |
| scanBarcode | Escanear barcode | Scan barcode |
| photoAI | Foto IA | Photo AI |

### onboarding — 5-step wizard
| Key | ES | EN |
|-----|----|----|
| step1Title | Cual es tu objetivo? | What is your goal? |
| goals.muscle | Ganar musculo / volumen | Build muscle / bulk |
| goals.cut | Perder grasa / definicion | Lose fat / cut |
| goals.maintain | Mantener peso | Maintain weight |
| step3Title | Tu plan nutricional | Your nutrition plan |
| start | Empezar | Get started |

### gamification
| Key | ES | EN |
|-----|----|----|
| streak | Racha | Streak |
| level | Nivel | Level |
| badges | Logros | Achievements |
| levels.novice | Novato | Novice |
| levels.legend | Leyenda | Legend |

### empty — Empty state messages
| Key | ES | EN |
|-----|----|----|
| todayEmpty | Tu dia esta vacio. Que vas a comer? | Your day is empty. What will you eat? |
| recipesEmpty | Tu recetario espera su primera receta. | Your recipe book awaits its first recipe. |
| planEmpty | Que comes esta semana? | What are you eating this week? |

## Template strings
Use `{placeholder}` syntax:
```typescript
t.recipes.recipeCount.replace('{count}', String(count))
t.realFeel.insights.progress.replace('{current}', String(days))
```
