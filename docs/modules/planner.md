# Module: Planner

> Weekly meal planner, shopping list generation, and pantry management.

## Why it exists

Meal planning completes the recipe-to-tracking pipeline. Users assign recipes to days of the week, generate shopping lists from planned meals, and track pantry inventory. This module is essential for the Structured Dieter ICP (Clara) and reduces daily decision fatigue.

## Location

The planner lives within the recipes feature family at `src/features/recipes/` but has its own screens and handlers. The meal plan data structure (`Record<0-6, meals[]>`, indexed by day-of-week) is separate from recipe storage.

## Screens

| Screen | File | Nav route | Purpose |
|--------|------|-----------|---------|
| MealPlanner | `screens/MealPlanner.tsx` (within recipes) | `meal-planner` | Weekly grid view: assign recipes to days |
| ShoppingList | `screens/ShoppingList.tsx` (within recipes) | `shopping-list` | Auto-generated ingredient list from planned meals |

## Components

| Component | File | Used by |
|-----------|------|---------|
| PlannerDay | `components/PlannerDay.tsx` | MealPlanner — single day column with meal slots |
| ShoppingItem | `components/ShoppingItem.tsx` | ShoppingList — checkable ingredient line |

## Handlers

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `createHandleAddToPlan` | `handlers/planner-handlers.ts` | Yes (factory) | Add recipe to a specific day slot |
| `createHandleRemoveFromPlan` | `handlers/planner-handlers.ts` | Yes (factory) | Remove recipe from plan |

## Data flow

- `mealPlan` in AppStateContext (localStorage key `mealPlan`): `Record<0|1|2|3|4|5|6, MealSlot[]>` where each slot references a recipe ID and meal type.
- Shopping list is derived at render time from the plan's ingredient lists (not persisted separately).
- Plan widget in Progress shows total planned meals count (relabeled from "days planned" in Q15).

## Cross-dependencies

### Imports from other modules
- `features/recipes/` — recipe data for ingredient lookup
- `features/food/` — food dictionary for shopping list item matching
- `contexts/AppStateContext.tsx` — state + handlers

### Exports to other modules
- `mealPlan` state read by Progress (planned meals widget)
- Plan data used by Home (weekly overview)

## Known issues

- Plan is indexed by day-of-week (0-6), not by actual date — same plan repeats weekly
- No date-scoped planning (can't plan "next Tuesday" specifically)
- Shopping list doesn't aggregate quantities across recipes
- No pantry tracking — user can't mark what they already have

## Improvement opportunities

- Date-scoped planning with calendar integration
- Shopping list quantity aggregation and unit normalization
- Pantry management with expiration tracking
- Auto-suggest meals based on pantry contents and macro targets
- Drag-and-drop plan rearrangement
