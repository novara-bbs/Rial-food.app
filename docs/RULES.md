# RIAL — Rules & Logic

## Edit Rules (MUST follow every time)

### Before editing
1. **Read the file first** — never edit blind
2. **Check CLAUDE.md** — verify your change aligns with project conventions
3. **Plan the change** — identify all files that need updating (including i18n)

### During editing
4. **i18n is mandatory** — no hardcoded user-visible strings. Ever.
5. **TypeScript strict** — no `any` for new types. Use proper interfaces.
6. **Tailwind tokens only** — use `text-tertiary`, `bg-primary`, etc. No raw CSS.
7. **Minimal diffs** — change only what's needed. Don't reformat untouched code.
8. **Preserve patterns** — follow existing code style (font-headline, uppercase, tracking-widest)

### After editing
9. **Type check** — `npx tsc --noEmit` must pass
10. **Visual verify** — if UI changed, check in browser
11. **Update docs** — CHANGELOG.md for features, i18n-dictionary.md for new keys

## Business Logic Rules

### Free vs RIAL+ (isPro)
| Feature | Free | RIAL+ |
|---------|------|-------|
| Recipes | 30 max | Unlimited |
| Imports/month | 5 max | Unlimited |
| Collections | 3 manual | Unlimited + smart |
| Barcode scanner | Yes (free!) | Yes |
| Food quality emoji | Yes | Yes |
| Real Feel inline | Yes | Yes |
| Real Feel correlations | Basic | Multi-variable + AI Coach |
| Training day toggle | No | Yes |
| Micronutrients | No | Yes |
| Family portions | No | Yes |
| Plan IA | No | Yes |
| Photo AI | No | Yes |

### Food Quality Rating Logic
```
getFoodQuality(macros, fiber) -> 'good' | 'neutral' | 'poor'
- Protein ratio > 25% calories -> +2 points
- Fiber > 5g -> +2 points
- Sugar > 15g -> -2 points
- Saturated fat > 10g -> -2 points
- Score >= 3 -> good (emoji: happy)
- Score >= 0 -> neutral (emoji: neutral)
- Score < 0 -> poor (emoji: sad)
```

### Real Feel System
1. **Inline check-in**: Appears 3s after meal logged, auto-dismiss 60s
2. **5 levels**: 1=Terrible, 2=Bad, 3=Neutral, 4=Good, 5=Great
3. **8 tags**: Bloating, Energy, Heaviness, Lightness, Clarity, Drowsiness, Cramps, Headache
4. **Correlations**: Require 7+ entries with 3+ occurrences per tag
5. **Real Score**: Average of last 14 entries, scaled to 0-100

### Streak Calculation
- Counts consecutive days with logged Real Feel entries
- Grace: allows 1 gap day (2-day difference still continues streak)
- Must have logged today OR yesterday to maintain streak
- Milestones: 3, 7, 14, 30, 60, 90, 180, 365

### TDEE Calculation (Mifflin-St Jeor)
```
Male BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
Female BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
TDEE = BMR * activity_multiplier
  sedentary: 1.2, light: 1.375, active: 1.55, veryActive: 1.725
Goal adjustment:
  muscle: +300, cut: -400, maintain: 0, health: -100
```

### Macro Split by Goal
| Goal | Protein/kg | Fat % | Carbs |
|------|-----------|-------|-------|
| Muscle | 2.0 | 25% | Remainder |
| Cut | 2.2 | 25% | Remainder |
| Maintain/Health | 1.6 | 30% | Remainder |

### Insight Engine Rules
1. **Protein target**: Warn if consumed < 80% of target
2. **Hydration**: Warn if consumed < 60% of target
3. **Variety**: Warn if < 5 unique recipes in weekly plan
4. **Streak motivation**: Celebrate at 3+, 7+, 30+ days
5. **Real Feel progress**: Show X/7 progress until correlations unlock

### Barcode Scanner Flow
```
Camera scan → decode barcode → Open Food Facts API lookup
  → found: show product + macros per 100g → Log meal
  → not found: offer retry or manual search
  → camera unavailable: show manual barcode input field
```

## Navigation Rules

### Tab ownership
- **Hoy**: Dashboard, macros, planned meals, real feel, insights
- **Cocina**: Personal recipes, meal plan, shopping list
- **Explorar**: Public recipes, creators, social feed
- **Mas**: Diary, fasting, challenges, AI coach, profile, settings

### Back navigation
`previousScreen` tracks the last screen. Back buttons call `navigateTo(previousScreen)`.
Exception: Diary and Fasting always go back to `'more'`.

### FAB actions route to
- log-meal -> `add-meal`
- create-recipe -> `create-recipe`
- import-url -> `import-url`
- log-tolerance -> `add-tolerance`
- post-update -> `create-post`
- scan-barcode -> `add-meal` (opens scanner inline)
