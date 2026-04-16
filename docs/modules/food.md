# Module: Food

> Meal logging, food dictionary, barcode scanning, and nutritional data management.

## Why it exists

Food logging is RIAL's core interaction loop. Users log meals multiple times daily by searching a food dictionary, scanning barcodes, adding custom foods, or selecting from recipes. The module must be fast (under 200ms search), accurate (macro calculation), and flexible (custom portions, quick-add).

## Screens

| Screen | File | Nav route | Purpose |
|--------|------|-----------|---------|
| AddMeal | `screens/AddMeal.tsx` | `add-meal` | Unified search + add flow: dictionary search, barcode, recent, favorites, recipe match |

## Components

| Component | File | Used by |
|-----------|------|---------|
| FoodSearch | `components/FoodSearch.tsx` | AddMeal — search input with debounced results |
| FoodCard | `components/FoodCard.tsx` | AddMeal, search results — food item preview with macros |
| PortionSelector | `components/PortionSelector.tsx` | AddMeal — quantity/unit picker |
| BarcodeScanner | `components/BarcodeScanner.tsx` | AddMeal — camera-based barcode scanning via Capacitor |
| MacroRings | `components/MacroRings.tsx` | Home, AddMeal — circular progress for cal/pro/carbs/fats |
| NutritionLabel | `components/NutritionLabel.tsx` | FoodCard detail — full nutrition facts display |

## Handlers

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `createHandleAddMeal` | `handlers/meal-handlers.ts` | Yes (factory) | Add meal entry to dailyLog, update consumed macros |
| `createHandleRemoveMeal` | `handlers/meal-handlers.ts` | Yes (factory) | Remove meal entry, recalculate consumed |
| `createHandleEditMeal` | `handlers/meal-handlers.ts` | Yes (factory) | Update existing entry (portion, food item) |

## Utils

| Export | File | Pure? | Purpose |
|--------|------|-------|---------|
| `bodyWeightFromKg` / `bodyWeightToKg` | `utils/units.ts` | Yes | kg/lbs conversion based on unit system |
| `getBodyWeightUnit` | `utils/units.ts` | Yes | Returns "kg" or "lbs" label |
| `searchFoods` | `utils/food-search.ts` | Yes | Fuzzy search over food dictionary |
| `calculateMacros` | `utils/macro-calc.ts` | Yes | Macro computation for a food item at given portion |

## Data

| File | Contents |
|------|----------|
| `data/food-dictionary.ts` | Base food dictionary with per-100g macros |
| `data/common-portions.ts` | Standard portion sizes (cup, slice, etc.) |

## Data flow

- `dailyLog` in AppStateContext (localStorage key `dailyLog`): array of `DailyLogEntry` with `{ id, name, macros, time, quantity, unit, ingredientIds }`.
- `dailyMacros` in AppStateContext: `{ consumed: MacroSet, target: MacroSet }`. Updated reactively when meals are added/removed.
- On day change, `useDailyReset` archives `dailyLog` + `dailyMacros` to `nutritionHistory` and resets to zero.

## Cross-dependencies

### Imports from other modules
- `contexts/AppStateContext.tsx` — state + handlers
- `lib/dates.ts` — date formatting

### Exports to other modules
- `DailyLogEntry` type — used by wellness-handlers (Real Feel meal linking)
- `units.ts` utilities — used by wellness (weight display), home, profile
- `MacroSet` type — used across nutrition and progress calculations

## Known issues

- Food dictionary is bundled (not server-fetched), increasing initial bundle size
- Barcode scanning requires Capacitor plugin — no web fallback
- No multi-add flow (adding multiple foods in one interaction)
- Custom food creation is basic (no photo, no validation)

## Improvement opportunities

- Unified search across dictionary + recipes + recent with multi-add
- Server-side food database for broader coverage
- Photo-based food recognition (product AI integration)
- Receipt/ticket scanning for bulk meal import
- Ingredient parsing from natural language ("200g chicken breast")
