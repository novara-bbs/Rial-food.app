# RIAL — System Architecture

> Last updated: 2026-04-08

## 1. Overview

RIAL is a nutrition platform combining 6 dimensions no competitor offers together: nutritional tracking, personal recipe book, subjective wellness diary (Real Feel), weekly meal planning, social community, and creator marketplace.

**Target**: Mobile-first web app, future React Native. Currently a client-side prototype with localStorage persistence, designed for Supabase backend migration.

## 2. Tech Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│                                                     │
│  React 19 + TypeScript ─── Vite 6 (dev/build)      │
│  Tailwind CSS 4 ────────── 6 theme variants         │
│  Recharts ──────────────── Data visualization       │
│  html5-qrcode ─────────── Barcode scanning          │
│  @google/genai ─────────── AI Coach (Gemini)        │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ localStorage  │  │  i18n (ES/EN) │  │ 6 Themes  │ │
│  │ (15+ keys)   │  │  ~300 keys    │  │ dark/light│ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└────────────────────────┬────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │ External APIs       │
              │ • Open Food Facts   │
              │ • Google Gemini     │
              └─────────────────────┘
```

### Future Backend (Phase 2)
```
Client ──── tRPC / REST ──── Supabase
                              ├── PostgreSQL (RLS)
                              ├── Auth (OAuth + email)
                              ├── Storage (recipe images)
                              └── Realtime (social feed)
```

## 3. Navigation Architecture

```
Bottom Nav (mobile): Hoy │ Cocina │ + FAB │ Explorar │ Más
Sidebar (desktop):   Same 4 items + Create button

State-based routing: currentScreen string in App.tsx
  navigateTo(screen) → setPreviousScreen(current) → setCurrentScreen(screen)
  goBack() → navigateTo(previousScreen)
```

### Screen Registry (19 active screens)
| Screen ID | Component | Parent Tab |
|-----------|-----------|------------|
| `home` | Home.tsx | Hoy |
| `cocina` | Cocina.tsx | Cocina (has 3 sub-tabs) |
| `explore` | Explore.tsx | Explorar (has 3 sub-tabs) |
| `more` | More.tsx | Más |
| `recipe-detail` | RecipeDetail.tsx | Overlay |
| `add-meal` | AddMeal.tsx | Modal |
| `add-tolerance` | AddTolerance.tsx | Modal |
| `create-recipe` | CreateRecipe.tsx | Modal |
| `create-post` | CreatePost.tsx | Modal |
| `import-url` | ImportRecipeURL.tsx | Modal |
| `daily-check-in` | DailyCheckIn.tsx | Modal |
| `real-feel-diary` | RealFeelDiary.tsx | Más > Diario |
| `fasting-timer` | FastingTimer.tsx | Más > Ayuno |
| `ai-coach` | AICoach.tsx | Más > AI Coach |
| `profile` | Profile.tsx | Más > Perfil |
| `settings` | Settings.tsx | Más > Ajustes |

## 4. Data Model

### Persistent State (localStorage)

```typescript
dailyMacros: {
  consumed: { cal, pro, carbs, fats }
  target: { cal, pro, carbs, fats }     // Set by onboarding TDEE
}

savedRecipes: Recipe[]                   // Personal recipe book
mealPlan: Record<dayIndex, Meal[]>       // 0-6 (Mon-Sun)
shoppingList: ShoppingItem[]             // Auto-generated from plan
realFeelLogs: RealFeelEntry[]            // Wellness diary entries
communityPosts: Post[]                   // Social feed
toleranceLogs: ToleranceLog[]            // Food reaction tracking

userProfile: {
  name, age, height, weight, gender,
  goal, activity, trains,
  dietaryPreferences: string[]
}

isPro: boolean                           // RIAL+ subscription
isFirstTime: boolean                     // Onboarding gate
```

### Key Interfaces (src/types.ts)
- `Recipe` — id, title, macros, micros, ingredients, instructions, tags
- `Ingredient` — id, name, category, baseAmount, macros, micros, servingSizes
- `DailyCheckIn` — status, sleep, stress, symptoms
- `ToleranceLog` — food, reaction severity, symptoms
- `Post` — author, content, likes, comments

## 5. Feature Engines

### Nutrition Engine (`utils/nutrition.ts`)
- **TDEE**: Mifflin-St Jeor formula with activity multiplier + goal adjustment
- **Macro split**: Protein/kg based on goal (muscle: 2.0, cut: 2.2, maintain: 1.6)
- **Food quality**: Scoring algorithm → emoji (😊😐😕) based on protein density, fiber, sugar, saturated fat

### Correlation Engine (`utils/correlations.ts`)
- **Tag correlations**: Aggregates Real Feel tags vs wellness level
- **Time patterns**: Detects morning vs evening wellbeing differences
- **Trend detection**: Compares first-half vs second-half averages
- **Insight engine**: Heuristic rules (protein target, hydration, variety, streak)

### Gamification Engine (`utils/gamification.ts`)
- **Streaks**: Consecutive days with logged Real Feel (1 grace day/month)
- **14 badges**: First recipe, chef, planner, conscious, detective, etc.
- **6 levels**: Novice → Active → Committed → Dedicated → Expert → Legend
- **Points**: Weighted sum of meals logged, recipes created, Real Feel entries, posts

## 6. i18n Architecture

```
I18nProvider (main.tsx)
  └── useI18n() → { t, locale, setLocale }
       ├── t: DeepString<typeof es>  (type-safe translation object)
       ├── locale: 'es' | 'en'
       └── setLocale: (locale) => void

Auto-detection: navigator.language → fallback 'es'
Persistence: localStorage['rial-locale']
```

### Adding a language
1. Create `src/i18n/locales/{code}.ts` (copy from `es.ts`)
2. Add to `locales` map in `src/i18n/index.ts`
3. Extend `Locale` type
4. Add flag button in Settings

## 7. Design System

### 6 Theme Variants
| Name | Primary | Background |
|------|---------|------------|
| Volt Pro Dark | #dcfd05 | #09090b |
| Volt Pro Light | #000000 | #ffffff |
| Ocean Pro Dark | #38bdf8 | #020617 |
| Ocean Pro Light | #0284c7 | #f8fafc |
| Ember Pro Dark | #fb923c | #0c0a09 |
| Ember Pro Light | #ea580c | #fafaf9 |

### Token System
All colors use CSS custom properties (`--color-primary`, etc.) defined in `src/index.css`. Components reference them via Tailwind classes (`text-primary`, `bg-surface-container-low`).

### Typography Scale
- `font-headline` — Bold, uppercase, tight tracking (section headers)
- `font-label` — 10-12px, uppercase, widest tracking (metadata)
- `font-body` — Regular body text
- `font-mono` — Monospace for numbers and data

## 8. External Integrations

| Service | Purpose | Auth |
|---------|---------|------|
| Open Food Facts API | Barcode product lookup | None (public) |
| Google Gemini API | AI Coach chat | API key (GEMINI_API_KEY) |
| Apple Health / Google Fit | Steps sync (future) | OAuth |
| Stripe | Payments (future) | API key |
| Supabase | Backend (future) | Project key |

## 9. Decisions Log

| Decision | Rationale |
|----------|-----------|
| State-based routing (no React Router) | Bundle size, prototype simplicity |
| localStorage (no backend yet) | Speed of iteration, Supabase migration path clear |
| Custom i18n (no react-i18next) | Type-safe, lightweight, zero config |
| Tailwind tokens (no CSS-in-JS) | Performance, consistency with 6 themes |
| Flat screens/ folder | Simplicity over premature structure |
| App.tsx monolith | Acceptable for 15 state values, extract at 25+ |
