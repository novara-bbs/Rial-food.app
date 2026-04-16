# Module: Cross-cutting

> Shared contexts, hooks, components, types, and library code used across all feature modules.

## Why it exists

Cross-cutting concerns prevent duplication and enforce consistency. State management, navigation, theming, date handling, type definitions, and shared UI primitives live here so feature modules can focus on domain logic.

## Contexts (`src/contexts/`)

| Context | File | Purpose |
|---------|------|---------|
| AppStateContext | `AppStateContext.tsx` | Central state container — all feature state, all handler factories, localStorage persistence |
| AuthContext | `AuthContext.tsx` | Supabase session management — loading/guest/authed states, signOut, refreshSession |
| ThemeContext | `ThemeContext.tsx` | Light/dark mode + accent color, persisted to localStorage |
| NavigationContext | `NavigationContext.tsx` | Screen stack + `navigateTo()` / `goBack()` — state-based nav (no React Router) |

### AppStateContext detail

AppStateContext is the app's nervous system. It:
- Initializes all state from localStorage via `useLocalStorageState`
- Creates all handler factories (meal, recipe, social, wellness, weight, etc.)
- Memoizes handlers to prevent unnecessary re-renders
- Exposes ~40 state values and ~20 handlers through a single context

**State keys** (non-exhaustive):
- Profile: `userProfile`, `isPro`, `isFirstTime`, `showAIBot`
- Nutrition: `dailyMacros`, `dailyLog`, `hydration`, `movement`, `nutritionHistory`
- Recipes: `savedRecipes`, `mealPlan`, `shoppingList`
- Wellness: `weightHistory`, `realFeelLogs`, `toleranceLogs`, `checkInStatus`
- Social: `communityPosts`, `stories`, `viewedStories`, `followers`, `followedCreators`, `notifications`
- Food: `foodHistory`, `favoriteIds`

## Hooks (`src/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useDailyReset` | `useDailyReset.ts` | Archives previous day to nutritionHistory + resets daily state on date change (60s polling) |
| `useLocalStorageState` | `useLocalStorageState.ts` | React state synced to localStorage with type-safe generics |
| `useOnlineStatus` | `useOnlineStatus.ts` | Detects online/offline for sync decisions |
| `useProGate` | `useProGate.ts` | AI message gating — daily limit for free users, unlimited for Pro |

### DailyArchive (from useDailyReset)

The `DailyArchive` interface is the primary historical data shape:

```
{
  date: string;                           // YYYY-MM-DD (local timezone)
  macros: { consumed: MacroSet; target: MacroSet };
  hydration: number | HydrationSnapshot;  // Q15+: { consumed, target }
  movement: number | MovementSnapshot;    // Q15+: { activeMinutes, steps }
  mealCount: number;
  dailyLog: any[];
  tracked?: boolean;                      // Q15+: true when user actively tracked
}
```

Helper functions:
- `normalizeDailyArchive(raw)` — converts old numeric format to Q15+ object format
- `archiveHydrationConsumed(h)` — reads consumed value from either format
- `archiveActiveMinutes(h)` — reads activeMinutes from either format
- `getNutritionHistory()` — reads + normalizes from localStorage

## Shared Components (`src/components/`)

### Layout
| Component | File | Purpose |
|-----------|------|---------|
| PageShell | `PageShell.tsx` | Page wrapper (max-width, spacing, header) |
| GlobalHeader | `GlobalHeader.tsx` | Top navigation bar |
| Sidebar | `Sidebar.tsx` | Side menu for desktop |
| BottomNav | `BottomNav.tsx` | Bottom tab navigation |

### Patterns
| Component | File | Purpose |
|-----------|------|---------|
| PageHeader | `patterns/PageHeader.tsx` | Page title + breadcrumbs |
| SectionCard | `SectionCard.tsx` | Grouped content section with title |
| StatTile | `StatTile.tsx` | Metric display: value, label, trend arrow, color |
| SegmentedTabs | `SegmentedTabs.tsx` | Button group tabs |
| SearchInput | `SearchInput.tsx` | Unified search bar |
| FilterRow | `FilterRow.tsx` | Filter/sort controls |
| Swimlane | `Swimlane.tsx` | Horizontal scroll container |

### Data visualization
| Component | File | Purpose |
|-----------|------|---------|
| Sparkline | `Sparkline.tsx` | Inline SVG chart for trends |
| DayGridCalendar | `DayGridCalendar.tsx` | Calendar with customizable day rendering |

### Feedback
| Component | File | Purpose |
|-----------|------|---------|
| ConfirmDialog | `ConfirmDialog.tsx` | Destructive action confirmation |
| EmptyState | `EmptyState.tsx` | Empty state placeholder |
| ErrorBoundary | `ErrorBoundary.tsx` | Error fallback UI |
| GdprConsent | `GdprConsent.tsx` | GDPR consent banner |
| CreateModal | `CreateModal.tsx` | Creation workflow modal |

### shadcn/ui primitives (`components/ui/`)
button, input, label, dialog, sheet, tabs, select, slider, switch, progress, card, badge, separator, textarea, tooltip

## Types (`src/types/`)

| File | Key types |
|------|-----------|
| `food.ts` | `Ingredient`, `Macros`, `Micronutrients`, `FoodTag`, `Allergen`, `IngredientCategory` |
| `recipe.ts` | `Recipe`, `RecipeStep`, `RecipeIngredient` |
| `wellness.ts` | `BodySnapshot`, `BodyMeasurements`, `WeeklyCheckInEntry`, `DailyCheckIn`, `ToleranceLog` |
| `social.ts` | `CommunityPost`, `Story`, `StorySlide`, `Notification`, `SocialLinks` |
| `user.ts` | `User`, `AppState` |
| `planner.ts` | `MealPlanDay` |

## Lib (`src/lib/`)

| File | Purpose |
|------|---------|
| `dates.ts` | `todayLocal()`, `dateToLocal()` — local timezone date strings (Q15) |
| `supabase.ts` | Supabase client singleton, schema types, auth helpers |
| `sync.ts` | Bidirectional sync engine (push-on-change, pull-on-signin) |
| `logger.ts` | Structured logging |
| `platform.ts` | Platform detection (web, iOS, Android) |
| `purchases.ts` | In-app purchase helpers |
| `storage.ts` | localStorage wrapper with defaults |
| `schemas.ts` | Zod runtime validation schemas |
| `retry.ts` | Exponential backoff retry logic |
| `utils.ts` | Generic formatters and validators |

## Configuration (`src/config/`)

| File | Purpose |
|------|---------|
| `routes.ts` | Screen registry with lazy imports |
| `env.ts` | Environment variable access |

## i18n (`src/i18n/`)

| File | Purpose |
|------|---------|
| `index.tsx` | `useI18n()` hook + `I18nProvider` |
| `locales/es.ts` | Spanish translations (primary) |
| `locales/en.ts` | English translations |

All user-visible strings must use `t.section.key` via `useI18n()`. Both locale files must be updated together with matching keys (enforced by DeepString type system).

## Known issues

- AppStateContext is large (~600 lines) with many state slices — candidate for splitting
- No React Router — state-based navigation limits deep linking and URL-based navigation
- localStorage size limits (~5-10 MB) can be hit with photo-heavy usage
- Sync layer (`sync.ts`) is ready but not wired in UI (`useSupabasePersistence` flag pending)

## Improvement opportunities

- Split AppStateContext into domain-specific contexts (nutrition, social, wellness)
- Add React Router for deep linking and URL-based navigation
- IndexedDB for large data (photos, long history) instead of localStorage
- Wire Supabase sync in dedicated sprint
- Automated i18n key coverage testing
- Component library documentation (Storybook or similar)
