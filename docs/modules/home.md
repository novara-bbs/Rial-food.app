# Module: Home

> Daily overview dashboard with nutrition tracking, activity logging, and quick-access widgets.

## Why it exists

Home is the primary landing screen for all ICPs. It provides at-a-glance daily status (macros consumed vs target, hydration, movement), quick-add meal entry, and preview cards that link into deeper screens (Progress, Recipes, AI Coach). It must serve users who open the app 3-5x daily for fast logging.

## Screens

| Screen | File | Nav route | Purpose |
|--------|------|-----------|---------|
| Home | `screens/Home.tsx` | `home` | Main dashboard: macro rings, daily log, hydration/movement, quick-add |
| Discover | `screens/Discover.tsx` | `explore` | Community discovery feed (challenges, trending, creators) |

## Components

| Component | File | Used by |
|-----------|------|---------|
| ProgressPreviewCard | `components/ProgressPreviewCard.tsx` | Home — weight trend mini-card with 7-day delta |
| ActivityRow | `components/ActivityRow.tsx` | Home — hydration glasses + movement (steps/active minutes) |
| WeightQuickLog | `components/WeightQuickLog.tsx` | **Deprecated Q13** — superseded by ProgressPreviewCard + LogSnapshotModal |
| RecipeCarousel | `components/RecipeCarousel.tsx` | Home — horizontal scroll of saved/suggested recipes |

## Utils

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `calcVitality` | `utils/homeWidgets.ts` | Yes | Real Score (0-100) and trend from RealFeel logs. Filters invalid levels, supports intra-set trend for <14 entries |

## Data flow

- Home reads from `AppStateContext`: `dailyLog`, `dailyMacros`, `hydration`, `movement`, `nutritionHistory`, `weightHistory`, `realFeelLogs`, `mealPlan`, `userProfile`.
- Quick-add delegates to `handleAddMeal` (food module handler).
- Weight card delegates to `useLogSnapshot()` (wellness module hook).
- Hydration/movement use inline setter buttons that call `setHydration`/`setMovement` directly.

## Cross-dependencies

### Imports from other modules
- `features/wellness/` — `calcStreaks`, `calcWeightTrend`, `useLogSnapshot`
- `features/food/utils/units.ts` — weight display conversion
- `hooks/useDailyReset.ts` — `DailyArchive` type
- `lib/dates.ts` — `dateToLocal`

### Exports to other modules
- `calcVitality` — used by Progress screen

## Known issues

- ActivityRow hydration/movement buttons are not archived with target context (fixed in Q15 via expanded DailyArchive)
- RecipeCarousel renders all thumbnails eagerly (no virtualization)
- Discover screen is placeholder content, not backed by real social data

## Improvement opportunities

- ICP-adaptive widget ordering (show what matters most to each persona)
- Smart meal suggestions based on remaining macro budget
- Hydration timestamping for trend analysis
- Movement goal integration with device health APIs (Capacitor Health plugin)
