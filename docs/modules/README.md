# RIAL Module Documentation

Index of per-module documentation. Each file covers one feature domain or cross-cutting concern — its purpose, screens, components, data flow, cross-dependencies, known issues, and improvement opportunities.

## Modules

| File | Domain | Folder |
|------|--------|--------|
| [home.md](home.md) | Dashboard and daily overview | `src/features/home/` |
| [food.md](food.md) | Meal logging, dictionary, barcode | `src/features/food/` |
| [recipes.md](recipes.md) | Recipe CRUD, import, cook mode, matching | `src/features/recipes/` |
| [wellness.md](wellness.md) | Progress, Real Feel, correlations, fasting, check-ins | `src/features/wellness/` |
| [profile.md](profile.md) | Settings, gamification, onboarding, demo personas | `src/features/profile/` |
| [social.md](social.md) | Posts, stories, creators, challenges | `src/features/social/` |
| [planner.md](planner.md) | Meal planner, shopping list, pantry | (within `src/features/recipes/`) |
| [ai.md](ai.md) | AI Coach, Gemini proxy | `src/features/ai/` |
| [cross-cutting.md](cross-cutting.md) | Contexts, hooks, shared components, types, lib | `src/` (multiple directories) |

## How to use

- Review before starting work on a module to understand its structure and known issues.
- Cross-reference the "Dependencies" section to understand impact of changes.
- Use the "Improvement opportunities" section to plan future sprints.
- Keep these files updated when architectural changes are made.

## Standard structure

Each module doc follows this template:
1. Purpose (one sentence)
2. Why it exists (business justification)
3. Screens table
4. Components table
5. Handlers / Utils table
6. Data flow description
7. Cross-dependencies (imports from / exports to other modules)
8. Known issues
9. Improvement opportunities
