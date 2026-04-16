# Module: Wellness

> Body tracking, Real Feel vitality logging, food-feeling correlations, streaks, weekly check-ins, and progress visualization.

## Why it exists

RIAL's core value proposition extends beyond calorie counting. The wellness module lets users track body composition, log subjective wellbeing (Real Feel), see correlations between food and how they feel, and review weekly progress. It serves the Health-seeker ICP (Ana) and adds depth for Structured Dieters (Clara) and Muscle Builders (Marcos).

## Screens

| Screen | File | Nav route | Purpose |
|--------|------|-----------|---------|
| Progress | `screens/Progress.tsx` | `progress` | Main wellness dashboard: body timeline/calendar, nutrition stats, Real Score, streaks, consistency calendar |
| RealFeelDiary | `screens/RealFeelDiary.tsx` | `real-feel-diary` | Full Real Feel history, Real Score chart, daily realities insights, timeline |
| WeeklyCheckIn | `screens/WeeklyCheckIn.tsx` | `weekly-check-in` | Sunday reflection: vitality, nutrition trends, weight delta, habit rating |
| WeeklyReview | `screens/WeeklyReview.tsx` | `weekly-review` | Week summary card: best/worst days, RF distribution, nutrition deltas |

## Components

| Component | File | Used by |
|-----------|------|---------|
| BodyTimeline | `components/BodyTimeline.tsx` | Progress (body tab) |
| BodyCalendar | `components/BodyCalendar.tsx` | Progress (body tab, calendar view) |
| LogSnapshotModal | `components/LogSnapshotModal.tsx` | Progress, GlobalLogSnapshotModal |
| GlobalLogSnapshotModal | `components/GlobalLogSnapshotModal.tsx` | App.tsx (app-wide weight logging) |
| SnapshotDetailModal | `components/SnapshotDetailModal.tsx` | BodyTimeline, BodyCalendar |
| RitmoSection | `components/RitmoSection.tsx` | Progress (nutrition tab) |
| DataSourceCaption | `components/DataSourceCaption.tsx` | Progress, RitmoSection (auto/manual badges) |
| LatestReflectionCard | `components/LatestReflectionCard.tsx` | Progress (nutrition tab) |

## Handlers

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `createHandleLogWeight` | `handlers/weight-handlers.ts` | Yes (factory) | Add/replace weight snapshot, returns `{ replaced }` flag |
| `createHandleDeleteSnapshot` | `handlers/weight-handlers.ts` | Yes (factory) | Delete snapshot by date |
| `createHandleUpdateSnapshot` | `handlers/weight-handlers.ts` | Yes (factory) | Update photo/measurements on existing snapshot |
| `createHandleRealFeelLog` | `handlers/wellness-handlers.ts` | Yes (factory) | Log Real Feel entry with level bounds check (1-5), auto-links recent meals |
| `createHandleCheckIn` | `handlers/wellness-handlers.ts` | Yes (factory) | Navigate to daily check-in |
| `createHandleCompleteCheckIn` | `handlers/wellness-handlers.ts` | Yes (factory) | Complete check-in with toast |

## Utils

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `calcWeekMacros` | `utils/week-stats.ts` | Yes | Canonical weekly macro aggregation with delta vs previous week |
| `calcStreaks` | `utils/streaks.ts` | Yes | Meal-log and Real Feel streak calculation |
| `calcWeightTrend` | `utils/weight-trend.ts` | Yes | Weight trend: sorted snapshots, 30-day window, 7-day delta, target progress |
| `getCorrelations` | `utils/correlations.ts` | Yes | Tag, signal, time, consistency correlation detectors |
| `getInsights` / `getFoodInsights` | `utils/correlations.ts` | Yes | Actionable insight recommendations from current state |

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useLogSnapshot` | `hooks/useLogSnapshot.ts` | Shared modal state for weight logging across the app |

## Data flow

- **Weight data**: `weightHistory` in `AppStateContext` (localStorage key `weightHistory`). Array of `BodySnapshot` objects. Written via `handleLogWeight`, read by Progress, ProgressPreviewCard, BodyTimeline, BodyCalendar.
- **Real Feel logs**: `realFeelLogs` in `AppStateContext` (localStorage key `realFeelLogs`). Array of entries with `{ id, date, level, energy, digestion, mindset, mealIds, ingredientIds }`. Written via `handleRealFeelLog`, read by Progress, RealFeelDiary, WeeklyReview, WeeklyCheckIn, RitmoSection, correlations.
- **Nutrition history**: `nutritionHistory` from `getNutritionHistory()` in `useDailyReset.ts`. Array of `DailyArchive` entries archived daily. Read by Progress, WeeklyReview, WeeklyCheckIn, RitmoSection, correlations.
- **Streaks**: Derived from `nutritionHistory` + `realFeelLogs` via `calcStreaks()`. Used in Progress and Home.

## Cross-dependencies

### Imports from other modules
- `features/food/utils/units.ts` — `bodyWeightFromKg`, `bodyWeightToKg`, `getBodyWeightUnit`
- `hooks/useDailyReset.ts` — `DailyArchive`, `getNutritionHistory`, `normalizeDailyArchive`
- `lib/dates.ts` — `todayLocal`, `dateToLocal`
- `contexts/AppStateContext.tsx` — all state and handlers
- `components/` — PageShell, PageHeader, SectionCard, StatTile, SegmentedTabs, Sparkline, DayGridCalendar

### Exports to other modules
- `calcVitality` (via homeWidgets.ts) used by Home, Progress
- `calcStreaks` used by Home (ProgressPreviewCard), Progress
- `calcWeightTrend` used by Progress
- `calcWeekMacros` used by Progress, WeeklyReview
- `getCorrelations`/`getFoodInsights` used by App.tsx (AI Coach context)
- `useLogSnapshot` used by Home (ProgressPreviewCard), App.tsx (GlobalLogSnapshotModal)

## Known issues (post-Q15)

- `getLoggingStreak` in `useDailyReset.ts` is deprecated (Q13) and still exported — candidate for removal
- Correlation engine (`correlations.ts`) uses `any` types extensively
- WeeklyReview byDay grouping may produce empty arrays if all logs on a day have invalid levels
- No real-time midnight reset — relies on 60s polling interval in `useDailyReset`

## Improvement opportunities

- Custom body measurements trend charts (currently only stored, not visualized beyond snapshots)
- Before/after photo comparison view
- Hydration trend sparklines using new `HydrationSnapshot.target` for adherence %
- Movement/steps trend using new `MovementSnapshot.steps` data
- Monday-start week option (requires user setting)
- Real-time midnight reset via document visibility change API
- Fasting timer integration with meal timing data
