/**
 * FamilyCard anatomy — Food Families P2.
 *
 * Static-file-read lock (mirrors `bottom-sheet.test.ts` + `constant-tile.test.ts`)
 * of the primary-view shape: collapsed header is a HIG-compliant button with
 * `aria-expanded` + `aria-controls` wiring to the expanded panel, which is a
 * `role="region"` labelled by the toggle button. Token purity rules
 * (no `text-[Npx]`, no `dark:` prefix, no `shadow-{sm,md,lg}`) are enforced
 * here so FamilyCard never slips back into design-drift even when Tailwind
 * classes get shuffled.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const FAMILY_CARD = resolve(__dirname, '..', '..', 'features', 'food', 'components', 'FamilyCard.tsx');
const VARIANT_ROW = resolve(__dirname, '..', '..', 'features', 'food', 'components', 'VariantRow.tsx');
const FOOD_DICTIONARY = resolve(__dirname, '..', '..', 'features', 'food', 'screens', 'FoodDictionary.tsx');

const familyCardSrc = readFileSync(FAMILY_CARD, 'utf8');
const variantRowSrc = readFileSync(VARIANT_ROW, 'utf8');
const foodDictionarySrc = readFileSync(FOOD_DICTIONARY, 'utf8');

describe('FamilyCard.tsx', () => {
  it('has a default export', () => {
    expect(familyCardSrc).toMatch(/export default function FamilyCard/);
  });

  it('collapsed header is a <button> with aria-expanded + aria-controls', () => {
    expect(familyCardSrc).toMatch(/<button[^>]*\s+aria-expanded=\{expanded\}/);
    expect(familyCardSrc).toMatch(/aria-controls=\{panelId\}/);
    expect(familyCardSrc).toMatch(/id=\{buttonId\}/);
  });

  it('header meets HIG minimum tap height (min-h-11)', () => {
    // `min-h-11` maps to 44px — the iOS HIG / Material minimum. Anything
    // smaller would regress the tap target; anything bigger is also fine.
    expect(familyCardSrc).toMatch(/\bmin-h-11\b/);
  });

  it('expanded panel is role=region labelled by the toggle button', () => {
    expect(familyCardSrc).toMatch(/role="region"/);
    expect(familyCardSrc).toMatch(/aria-labelledby=\{buttonId\}/);
    expect(familyCardSrc).toMatch(/id=\{panelId\}/);
  });

  it('renders a "Primary" badge on the canonical variant panel', () => {
    expect(familyCardSrc).toMatch(/t\.foodDictionary\.primaryLabel/);
  });

  it('shows a variants counter badge only when non-canonical variants exist', () => {
    expect(familyCardSrc).toMatch(/variantCount > 0/);
    expect(familyCardSrc).toMatch(/variantsCountOne/);
    expect(familyCardSrc).toMatch(/variantsCount/);
  });

  it('renders non-canonical variants via <VariantRow>', () => {
    expect(familyCardSrc).toMatch(/import VariantRow/);
    expect(familyCardSrc).toMatch(/<VariantRow/);
  });

  it('uses token classes (no text-[Npx], no shadow-{sm,md,lg}, no dark:)', () => {
    expect(familyCardSrc).not.toMatch(/text-\[\d+px\]/);
    expect(familyCardSrc).not.toMatch(/\bshadow-(sm|md|lg)\b/);
    expect(familyCardSrc).not.toMatch(/\bdark:/);
  });

  it('uses focus-visible ring canonical (no bare focus-ring drift)', () => {
    expect(familyCardSrc).toMatch(/focus-visible:ring-2/);
    expect(familyCardSrc).toMatch(/focus-visible:ring-primary\/60/);
  });
});

describe('VariantRow.tsx', () => {
  it('has a default export', () => {
    expect(variantRowSrc).toMatch(/export default function VariantRow/);
  });

  it('is a <button> with aria-pressed reflecting selected state', () => {
    expect(variantRowSrc).toMatch(/<button/);
    expect(variantRowSrc).toMatch(/aria-pressed=\{Boolean\(selected\)\}/);
  });

  it('embeds the signed macro delta via <MacroDelta>', () => {
    expect(variantRowSrc).toMatch(/import MacroDelta/);
    expect(variantRowSrc).toMatch(/<MacroDelta/);
  });

  it('uses token classes (no text-[Npx], no shadow-{sm,md,lg}, no dark:)', () => {
    expect(variantRowSrc).not.toMatch(/text-\[\d+px\]/);
    expect(variantRowSrc).not.toMatch(/\bshadow-(sm|md|lg)\b/);
    expect(variantRowSrc).not.toMatch(/\bdark:/);
  });

  it('renders qualityTag chips via i18n labels (P2.5 multi-axis)', () => {
    // The chips are rendered only when `variant.qualityTags?.length > 0`
    // so the conditional guard is part of the lock — without it we'd pint an
    // empty `<div>` on every row. Labels come from `t.foodDictionary.qualityTagLabels`
    // so a slug that lands without a matching i18n key renders the raw slug
    // (acceptable fallback, symmetric with subcategoryLabels).
    expect(variantRowSrc).toMatch(/qualityTagLabels/);
    expect(variantRowSrc).toMatch(/qualityTags\.length > 0/);
    expect(variantRowSrc).toMatch(/data-quality-tags/);
    expect(variantRowSrc).toMatch(/data-quality-tag=\{slug\}/);
  });
});

describe('FoodDictionary.tsx — subcategory grouping (P2.5)', () => {
  // The screen delegates bucketing + ordering to the pure helpers in
  // `features/food/utils/group-by-subcategory.ts` (its own unit tests lock the
  // null-first + population-desc + alphabetic tie-break contract). Here we
  // only lock that the screen *uses* them and emits the expected markup.
  it('imports groupFamiliesBySubcategory + sortSubcategoriesByPopulation', () => {
    expect(foodDictionarySrc).toMatch(/groupFamiliesBySubcategory/);
    expect(foodDictionarySrc).toMatch(/sortSubcategoriesByPopulation/);
  });

  it('emits a <h4 data-subcategory> sub-header per non-null bucket', () => {
    expect(foodDictionarySrc).toMatch(/data-subcategory=\{sub\.subcategoryKey\}/);
    // null bucket (flat families) must NOT render a wrapper header — the guard
    // `sub.subcategoryKey !== null` is what keeps oils/legumes/supplements flat.
    expect(foodDictionarySrc).toMatch(/sub\.subcategoryKey !== null/);
  });

  it('looks up subcategory labels via i18n with slug fallback', () => {
    expect(foodDictionarySrc).toMatch(/subcategoryLabels\[sub\.subcategoryKey\]/);
    // Fallback to the raw slug keeps the screen resilient to mid-flight i18n
    // additions — a new subcategory slug lands in the UI the moment it appears
    // in `FAMILY_SUBCATEGORY`, even before the label PR merges.
    expect(foodDictionarySrc).toMatch(/subcategoryLabels\[sub\.subcategoryKey\] \?\? sub\.subcategoryKey/);
  });

  it('uses token classes on the sub-header (no text-[Npx], no dark:)', () => {
    // Scope the token-purity check to the sub-header <h4> block so we don't
    // trip on unrelated markup elsewhere in the screen.
    const subHeaderMatch = foodDictionarySrc.match(/<h4[^>]*data-subcategory[\s\S]*?<\/h4>/);
    expect(subHeaderMatch, 'expected <h4 data-subcategory> block').not.toBeNull();
    expect(subHeaderMatch![0]).not.toMatch(/text-\[\d+px\]/);
    expect(subHeaderMatch![0]).not.toMatch(/\bdark:/);
  });
});
