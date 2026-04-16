# Module: Recipes

> Recipe CRUD, URL import, cook mode, ingredient matching, and recipe discovery.

## Why it exists

Recipes bridge the gap between meal logging and meal planning. Users save recipes (manually or via URL import), get per-serving macro calculations, use cook mode for step-by-step guidance, and feed recipes into the meal planner. The module is critical for the Structured Dieter ICP (Clara) who plans meals weekly.

## Screens

| Screen | File | Nav route | Purpose |
|--------|------|-----------|---------|
| Cocina | `screens/Cocina.tsx` | `cocina` | Recipe library with search, filters, categories |
| RecipeDetail | `screens/RecipeDetail.tsx` | `recipe-detail` | Full recipe view: ingredients, steps, macros, cook mode |
| CreateRecipe | `screens/CreateRecipe.tsx` | `create-recipe` | Manual recipe creation with ingredient search |
| ImportRecipe | `screens/ImportRecipe.tsx` | `import-recipe` | URL-based recipe import with AI ingredient parsing |

## Components

| Component | File | Used by |
|-----------|------|---------|
| RecipeCard | `components/RecipeCard.tsx` | Cocina, Home (carousel) — recipe preview tile |
| CookMode | `components/CookMode.tsx` | RecipeDetail — step-by-step cooking interface |
| IngredientList | `components/IngredientList.tsx` | RecipeDetail, CreateRecipe — editable ingredient table |
| RecipeFilters | `components/RecipeFilters.tsx` | Cocina — category, prep time, macro filters |
| ImportPreview | `components/ImportPreview.tsx` | ImportRecipe — parsed recipe preview before save |

## Handlers

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `createHandleCreateRecipe` | `handlers/recipe-handlers.ts` | Yes (factory) | Create new recipe with auto-generated ID |
| `createHandleDeleteRecipe` | `handlers/recipe-handlers.ts` | Yes (factory) | Remove recipe by ID |
| `createHandleDuplicateRecipe` | `handlers/recipe-handlers.ts` | Yes (factory) | Clone recipe with new ID |
| `createHandleImportRecipe` | `handlers/recipe-handlers.ts` | Yes (factory) | Import recipe from URL-parsed data |
| `createHandleAddToPlan` | `handlers/planner-handlers.ts` | Yes (factory) | Add recipe to weekly meal plan |

## Data flow

- `savedRecipes` in AppStateContext (localStorage key `savedRecipes`): array of recipe objects with ingredients, steps, servings, macros.
- Recipes are user-local (no server sync yet).
- URL import uses Gemini AI proxy to parse ingredient lists from web pages.
- Cook mode reads recipe steps and provides a timer + step navigation UI.

## Cross-dependencies

### Imports from other modules
- `features/food/` — food dictionary for ingredient matching, macro calculation
- `features/ai/` — Gemini proxy for URL import ingredient parsing
- `contexts/AppStateContext.tsx` — state + handlers
- `lib/dates.ts` — date utilities

### Exports to other modules
- Recipe data consumed by meal planner (same module family)
- Recipe names/macros used by Home (RecipeCarousel)
- Recipe ingredient IDs used by correlations engine

## Known issues

- URL import ingredient parsing can miss complex ingredient descriptions
- No recipe versioning — edits are destructive
- Cook mode timer doesn't persist across app backgrounding
- Recipe photos are stored as base64 in localStorage (size concern)

## Improvement opportunities

- Deeper ingredient parsing for URL imports (multi-line, nested ingredients)
- Recipe versioning / edit history
- Batch cooking / leftovers rules (ported from v0 reference)
- Community recipe sharing via social module
- Nutrition label auto-calculation per serving with adjustable servings
