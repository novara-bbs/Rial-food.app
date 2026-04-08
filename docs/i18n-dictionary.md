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
