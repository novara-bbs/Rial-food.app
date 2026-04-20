/**
 * `variantToIngredient` — bridges a `FoodVariant` to the legacy `Ingredient`
 * shape so existing macro-calculation code in `CreateRecipe` and `RecipeDetail`
 * can remain unchanged during the food-family migration.
 *
 * The resulting `Ingredient` is ephemeral (not persisted); it carries the same
 * macros/micros/allergens/servingSizes as the variant and is typed as
 * `category: 'prepared'` (the closest match for any user-scanned brand variant).
 *
 * Usage: call this whenever you have a `FoodVariant` but need to pass an
 * `Ingredient` to `PortionSelector`, `scaleMacros`, or a macro-totals loop.
 */
import type { Ingredient } from '../../../types/food';
import type { FoodVariant } from '../../../types/food-family';

export function variantToIngredient(variant: FoodVariant): Ingredient {
  return {
    id: variant.id,
    name: variant.name,
    nameEn: variant.nameEn,
    description: variant.brand?.name ?? '',
    descriptionEn: variant.brand?.name ?? '',
    category: 'prepared',
    baseAmount: 100,
    baseUnit: variant.baseUnit,
    macros: variant.macros,
    micros: variant.micros ?? { vitamins: {}, minerals: {}, others: {} },
    tags: (variant.tags ?? []) as Ingredient['tags'],
    allergens: (variant.allergens ?? []) as Ingredient['allergens'],
    servingSizes: variant.servingSizes ?? [],
  };
}
