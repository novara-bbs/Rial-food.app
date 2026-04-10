# RIAL App v1.5 — Claude Project Guide

## Project Overview
RIAL is a nutrition app combining 6 dimensions: tracking, recipes, wellness diary (Real Feel), meal planning, social community, and creator marketplace. React 19 + Vite + Tailwind CSS web app targeting mobile-first.

## Tech Stack
- **Framework**: React 19.1 + TypeScript 5.8
- **Build**: Vite 6.2 + ESLint (flat config) + Vitest
- **Styling**: Tailwind CSS 4.1 with custom CSS tokens (see `src/index.css`)
- **UI Components**: shadcn/ui (at `src/components/ui/` — never move)
- **Charts**: Recharts 3.8
- **Icons**: Lucide React (prefer icons over emojis in detail views)
- **AI**: Google Gemini API (`@google/genai`) — client in `features/ai/lib/gemini.ts`
- **Barcode**: html5-qrcode + Open Food Facts API (`features/food/api/open-food-facts.ts`)
- **Toasts**: Sonner
- **Animations**: Motion (Framer Motion)
- **i18n**: Custom context-based system (`src/i18n/`)
- **State**: localStorage via `useLocalStorageState` hook (no backend)

## Architecture

### Navigation
```
Bottom Nav: Hoy | Cocina | + FAB | Explorar | Mas
Cocina sub-tabs: [Recetas] [Plan] [Lista]
Explorar sub-tabs: [Recetas] [Creadores] [Social]
Mas menu: Diario RF, Ayuno, Challenges, AI Coach, Perfil, Ajustes, RIAL+
```

### Routing
State-based navigation via `NavigationContext`. No React Router.
```typescript
const { navigateTo, currentScreen, previousScreen } = useNavigation();
```

### Project Structure (feature-based)
```
src/
  App.tsx                  # Slim shell: layout + screen switch (uses route registry)
  main.tsx
  index.css                # Theme tokens (6 variants)

  config/
    routes.ts              # Screen ID → React.lazy() map (22 screens)
    env.ts                 # Typed env vars: GEMINI_API_KEY, IS_DEV, IS_PROD

  types/
    food.ts                # Macros, Micronutrients, Ingredient, ServingSize
    recipe.ts              # Recipe, RecipeStep, RecipeIngredient
    user.ts                # User, AppState
    wellness.ts            # DailyCheckIn, ToleranceLog, RealFeel
    social.ts              # Post, CommunityPost
    planner.ts             # MealPlanDay, ShoppingItem
    index.ts               # Re-exports all (only barrel in project)

  features/
    food/
      screens/             # AddMeal, FoodDictionary
      components/          # BarcodeScanner, PortionSelector
      data/                # ingredients.ts (200+ items), seed-recipes.ts
      utils/               # nutrition.ts (getFoodQuality, calculateBMR, scaleMacros)
      api/                 # open-food-facts.ts
      handlers/            # meal-handlers.ts

    recipes/
      screens/             # Cocina, CreateRecipe, RecipeDetail, ImportRecipeURL
      handlers/            # recipe-handlers.ts

    planner/
      screens/             # Planner, ShoppingList, Pantry
      utils/               # grocery.ts
      data/                # seed-meal-plan.ts, seed-shopping.ts

    wellness/
      screens/             # DailyCheckIn, WeeklyCheckIn, RealFeelDiary, FastingTimer, AddTolerance
      components/          # RealFeelInline
      utils/               # correlations.ts
      data/                # seed-tolerance.ts
      handlers/            # wellness-handlers.ts

    social/
      screens/             # Community, Creadores, CreatePost, CreatorDashboard, CreatorVerification
      data/                # seed-posts.ts
      handlers/            # social-handlers.ts

    profile/
      screens/             # Profile, Settings, RialPlus
      components/          # Onboarding
      utils/               # gamification.ts

    ai/
      screens/             # AICoach
      lib/                 # gemini.ts (singleton client, system prompts, model config)

    home/
      screens/             # Home, Discovery, Explore, More

  components/
    layout/                # GlobalHeader, BottomNav, Sidebar, CreateModal
    feedback/              # ErrorBoundary, EmptyState
    ui/                    # shadcn/ui (NEVER MOVE — required by shadcn CLI)

  contexts/                # AppStateContext, NavigationContext, ThemeContext
  hooks/                   # useLocalStorageState
  i18n/                    # I18nProvider + locales/{es,en}.ts
  lib/                     # utils.ts (cn helper — shadcn convention)
```

### Path Aliases (synced: tsconfig + vite + vitest)
```
@/*           -> src/*
@features/*   -> src/features/*
@components/* -> src/components/*
@hooks/*      -> src/hooks/*
@i18n/*       -> src/i18n/*
```

### State Management
Central state in `AppStateContext` via `useLocalStorageState`. Handlers are factory functions in feature modules:
```typescript
// Pattern: feature handler factory
// Located in features/*/handlers/*.ts
export function createHandleX(deps: { setState: ..., navigateTo: ... }) {
  return (args) => { /* business logic */ };
}

// Wired in AppStateContext:
const handleX = createHandleX({ setState, navigateTo });
```

Key state: `dailyMacros`, `savedRecipes`, `mealPlan`, `shoppingList`, `realFeelLogs`, `communityPosts`, `toleranceLogs`, `userProfile`, `userFoods`, `isPro`, `isFirstTime`, `checkInStatus`.

## Coding Rules

### MUST follow
1. **i18n**: ALL user-visible strings must use `t.section.key` from `useI18n()`. Never hardcode ES or EN.
2. **TypeScript**: `npx tsc --noEmit` must pass before any commit.
3. **Tests**: `npx vitest run` must pass before any commit.
4. **Styling**: Use existing Tailwind tokens. Never add raw hex colors.
5. **Icons**: Use Lucide React icons, not emojis, in detail/info views.
6. **New state**: Add to `AppStateContext` via `useLocalStorageState`.
7. **New handlers**: Create factory function in the feature's `handlers/` dir, wire in `AppStateContext`.

### MUST NOT do
1. Don't install React Router — state-based routing is intentional.
2. Don't create new CSS files — Tailwind classes only.
3. Don't move `components/ui/` — shadcn CLI requires it there.
4. Don't create barrel files (`index.ts`) in features — only `types/index.ts` is allowed.
5. Don't add speculative abstractions or features beyond what's requested.

### When adding a new screen
1. Create `src/features/<domain>/screens/NewScreen.tsx`
2. Add lazy import to `src/config/routes.ts`
3. Add case to the switch in `App.tsx`
4. Add i18n keys to both `es.ts` and `en.ts`
5. Add navigation trigger (from Mas menu, FAB, or another screen)
6. Verify: `npx tsc --noEmit && npx vitest run`

### When adding i18n strings
1. Add key to `src/i18n/locales/es.ts` (Spanish first — primary locale)
2. Add same key to `src/i18n/locales/en.ts`
3. Use `const { t } = useI18n()` in component
4. Access via `t.section.key`

## Design System Tokens
CSS custom properties in `src/index.css` with 6 theme variants:
- `--color-primary`, `--color-on-primary`
- `--color-surface-container-low`, `--color-surface-container-highest`
- `--color-on-surface`, `--color-on-surface-variant`
- `--color-tertiary` (headings), `--color-outline-variant`

### Font classes
- `font-headline` — Uppercase bold headings
- `font-label` — Tiny uppercase tracking-widest labels
- `font-body` — Body text
- `font-mono` — Numbers, data, macros

### Common UI patterns
```tsx
// Card
<div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5">

// Section header
<h2 className="font-headline text-sm font-bold uppercase tracking-widest text-tertiary">

// Label
<span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">

// Primary button
<button className="px-6 py-3 bg-primary text-on-primary rounded-sm font-headline text-xs font-bold uppercase tracking-widest">

// Tag/chip
<span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
```

## Feature Map

| Feature | Location |
|---------|----------|
| Food tracking + macros | `features/food/` (screens, utils, data, api, handlers) |
| Barcode scanner | `features/food/components/BarcodeScanner.tsx` |
| Portion selector | `features/food/components/PortionSelector.tsx` |
| Food dictionary (200+ items) | `features/food/data/ingredients.ts` |
| Nutrition utils | `features/food/utils/nutrition.ts` (getFoodQuality, calculateBMR) |
| Open Food Facts API | `features/food/api/open-food-facts.ts` |
| Recipes (CRUD, import) | `features/recipes/` (screens, handlers) |
| Meal planner + shopping | `features/planner/` (screens, utils, data) |
| Real Feel diary + correlations | `features/wellness/` (screens, components, utils) |
| Fasting timer | `features/wellness/screens/FastingTimer.tsx` |
| AI Coach (Gemini) | `features/ai/` (screens, lib) |
| Social + creators | `features/social/` (screens, data, handlers) |
| Profile + onboarding | `features/profile/` (screens, components, utils) |
| Home + discovery | `features/home/screens/` |
| i18n | `src/i18n/` (index.ts + locales/{es,en}.ts) |
| Themes (6 variants) | `src/index.css` |

## Dev Commands
```bash
npm run dev          # Vite dev server on port 3000
npm run build        # Production build
npx tsc --noEmit     # Type check
npx vitest run       # Unit tests (12 nutrition tests)
npm run lint:code    # ESLint
npm run check        # tsc + vitest combined
```

## External References
- Product Spec: `~/Downloads/RIAL_Product_Spec_v6.md`
- v0-rialfood: `C:\Users\Vicente CM\Documents\projects\RIAL\v0-rialfood` (batch cooking, weekly check-ins — not yet ported)
