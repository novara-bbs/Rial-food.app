# Module: Profile

> User settings, onboarding, gamification, and demo persona management.

## Why it exists

Profile holds everything about the user's configuration and identity within the app. It manages macro targets, unit preferences, dietary restrictions, notification settings, and the gamification layer (streaks, achievements). The onboarding flow sets initial targets and preferences. Demo personas allow QA testing with pre-seeded data.

## Screens

| Screen | File | Nav route | Purpose |
|--------|------|-----------|---------|
| More | `screens/More.tsx` | `more` | Settings hub with navigation to sub-screens |
| DailyCheckIn | `screens/DailyCheckIn.tsx` | `daily-check-in` | Daily mood/energy check-in |

## Components

| Component | File | Used by |
|-----------|------|---------|
| Onboarding | `components/Onboarding.tsx` | App.tsx — first-launch wizard |
| SettingsProfile | `components/settings/SettingsProfile.tsx` | More — name, weight, height, goal, unit system |
| SettingsNutrition | `components/settings/SettingsNutrition.tsx` | More — macro targets, hydration target, dietary prefs |
| SettingsSystem | `components/settings/SettingsSystem.tsx` | More — export data, theme, language, auth, data management |
| AvatarRing | `components/AvatarRing.tsx` | More, Home — gamification level indicator |
| GamificationCard | `components/GamificationCard.tsx` | More — streak, level, achievement summary |

## Handlers / Data

| Export | File | Purpose |
|--------|------|---------|
| `demo-seed.ts` | `features/dev/data/demo-seed.ts` | Seed data for 3 ICPs (Clara, Marcos, Ana) |
| `demo-seed-timeline.ts` | `features/dev/data/demo-seed-timeline.ts` | Historical timeline data for seed personas |
| `demo-seed-handlers.ts` | `features/dev/handlers/demo-seed-handlers.ts` | Apply/clear seed data to AppStateContext |
| `demo-personas.ts` | `features/dev/data/demo-personas.ts` | ICP persona definitions |

## Data flow

- `userProfile` in AppStateContext (localStorage key `userProfile`): `{ name, weight, height, age, goal, unitSystem, activityLevel, dietaryPrefs, ... }`.
- Profile changes propagate to macro target recalculation.
- Gamification state: streaks from `calcStreaks()`, level derived from total logged days.
- Demo personas write to all AppStateContext state slices simultaneously.

## Cross-dependencies

### Imports from other modules
- `features/wellness/` — streak calculation for gamification
- `features/food/utils/units.ts` — unit display
- `hooks/useDailyReset.ts` — nutrition history for export
- `contexts/AppStateContext.tsx` — all state

### Exports to other modules
- `userProfile` consumed by virtually every module (goal, unitSystem, targets)
- `userProfile.goal` used by Progress for goal-aware weight coloring (Q15)

## Known issues

- Onboarding does not support editing after completion (must go to settings)
- Export only covers nutrition history, not weight or Real Feel data
- No profile photo upload (avatar is procedurally generated)
- Gamification level system is basic (linear progression)

## Improvement opportunities

- Profile photo with body composition overlay
- Enhanced gamification: badges, challenges, social leaderboards
- Data import from other nutrition apps (MyFitnessPal CSV, etc.)
- Complete data export (all localStorage keys as JSON)
- Onboarding refinement with ICP detection
